import { withPaymentInterceptor } from 'x402-axios';
import { WalletClient, createPublicClient, http } from 'viem';
import { base } from 'wagmi/chains';
import axios, { AxiosInstance } from 'axios';

// USDC contract address on Base
export const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Payment amounts in USDC (6 decimals)
export const PAYMENT_AMOUNTS = {
  TRADE_ANALYSIS: '1000000', // 1 USDC
  PREMIUM_FEATURES: '5000000', // 5 USDC
  MONTHLY_SUBSCRIPTION: '10000000', // 10 USDC
} as const;

export interface PaymentRequest {
  amount: string;
  recipient: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  confirmations?: number;
}

export class TradeZenPaymentService {
  private axiosClient: AxiosInstance;
  private walletClient: WalletClient | null = null;
  private publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  constructor(apiBaseUrl?: string) {
    this.axiosClient = axios.create({
      baseURL: apiBaseUrl || process.env.NEXT_PUBLIC_X402_API_URL || 'https://api.tradezen.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize the payment service with a wallet client
   */
  initialize(walletClient: WalletClient) {
    this.walletClient = walletClient;
    
    // Configure axios client with x402 payment interceptor using wallet client directly
    // The x402 interceptor will handle payment requirements automatically
    this.axiosClient = withPaymentInterceptor(this.axiosClient, walletClient as any);
  }

  /**
   * Process a USDC payment on Base network using x402 protocol
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.walletClient) {
      return {
        success: false,
        error: 'Wallet client not initialized',
      };
    }

    try {
      // Validate the payment request
      await this.validatePaymentRequest(request);

      // Make API call that requires payment (will trigger x402 flow automatically)
      const response = await this.axiosClient.post('/api/premium-service', {
        service: request.description,
        amount: request.amount,
        token: USDC_BASE_ADDRESS,
        recipient: request.recipient,
        metadata: {
          ...request.metadata,
          timestamp: Date.now(),
          service: 'tradezen',
          chain: base.id,
        },
      });

      // Extract transaction hash from x402 payment response
      const transactionHash = response.headers['x-payment-response'];
      
      if (!transactionHash) {
        throw new Error('No payment transaction hash received');
      }

      // Wait for transaction confirmation
      const confirmations = await this.waitForConfirmation(transactionHash);

      return {
        success: true,
        transactionHash,
        confirmations,
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error',
      };
    }
  }

  /**
   * Check USDC balance for the connected wallet
   */
  async checkUSDCBalance(): Promise<string> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error('Wallet client not initialized or no account connected');
    }

    try {
      // Use public client to check USDC balance
      const balance = await this.publicClient.readContract({
        address: USDC_BASE_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }],
          },
        ],
        functionName: 'balanceOf',
        args: [this.walletClient.account.address],
      });

      return balance.toString();
    } catch (error) {
      console.error('Balance check error:', error);
      throw new Error('Failed to check USDC balance');
    }
  }

  /**
   * Validate payment request parameters
   */
  private async validatePaymentRequest(request: PaymentRequest): Promise<void> {
    if (!request.amount || BigInt(request.amount) <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (!request.recipient || !request.recipient.startsWith('0x')) {
      throw new Error('Invalid recipient address');
    }

    if (!request.description) {
      throw new Error('Payment description is required');
    }

    // Check if user has sufficient USDC balance
    const balance = await this.checkUSDCBalance();
    if (BigInt(balance) < BigInt(request.amount)) {
      throw new Error('Insufficient USDC balance');
    }
  }

  /**
   * Execute the payment transaction (handled automatically by x402 interceptor)
   */
  private async executePayment(paymentResponse: any): Promise<string> {
    // This method is now handled automatically by the x402 interceptor
    // The payment is executed when the API call is made
    return paymentResponse;
  }

  /**
   * Wait for transaction confirmation on Base network
   */
  private async waitForConfirmation(transactionHash: string, requiredConfirmations = 3): Promise<number> {
    let confirmations = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (confirmations < requiredConfirmations && attempts < maxAttempts) {
      try {
        const receipt = await this.publicClient.getTransactionReceipt({
          hash: transactionHash as `0x${string}`,
        });

        if (receipt) {
          const currentBlock = await this.publicClient.getBlockNumber();
          confirmations = Number(currentBlock - receipt.blockNumber) + 1;
          
          if (confirmations >= requiredConfirmations) {
            return confirmations;
          }
        }
      } catch (error) {
        console.warn('Confirmation check error:', error);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }

    if (confirmations < requiredConfirmations) {
      console.warn(`Transaction ${transactionHash} only has ${confirmations} confirmations`);
    }

    return confirmations;
  }

  /**
   * Get payment history for the connected wallet
   */
  async getPaymentHistory(): Promise<any[]> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error('Wallet client not initialized or no account connected');
    }

    try {
      // Make API call to get payment history (may require payment)
      const response = await this.axiosClient.get('/api/payment-history', {
        params: {
          address: this.walletClient.account.address,
          chain: base.id,
          limit: 50,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Payment history error:', error);
      return [];
    }
  }

  /**
   * Estimate gas fees for a payment
   */
  async estimatePaymentFees(request: PaymentRequest): Promise<string> {
    try {
      // Make API call to estimate fees (may require payment)
      const response = await this.axiosClient.post('/api/estimate-fees', {
        token: USDC_BASE_ADDRESS,
        amount: request.amount,
        recipient: request.recipient,
        chain: base.id,
      });

      return response.data.estimatedFees;
    } catch (error) {
      console.error('Fee estimation error:', error);
      throw new Error('Failed to estimate payment fees');
    }
  }
}

// Singleton instance
let paymentServiceInstance: TradeZenPaymentService | null = null;

export function getPaymentService(): TradeZenPaymentService {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new TradeZenPaymentService();
  }
  return paymentServiceInstance;
}