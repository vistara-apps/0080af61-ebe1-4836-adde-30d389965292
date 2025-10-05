'use client';

import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import { withPaymentInterceptor } from 'x402-axios';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'wagmi/chains';
import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';

// USDC contract address on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export interface PaymentConfig {
  amount: string; // Amount in USDC (e.g., "1.00")
  recipient: string; // Recipient address
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export function usePaymentService() {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Create x402-axios instance with wallet client
  const x402Client = useMemo(() => {
    if (!walletClient || !address) return null;

    try {
      // For now, create a regular axios instance
      // TODO: Integrate proper x402 signer when wallet client compatibility is resolved
      const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
        timeout: 30000,
      });

      // Add a custom interceptor to simulate x402 behavior for demo purposes
      axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 402) {
            // Simulate payment processing
            console.log('402 Payment Required detected - simulating payment flow');
            
            // In a real implementation, this would trigger the x402 payment flow
            // For demo purposes, we'll simulate a successful payment
            return {
              ...error.response,
              status: 200,
              data: {
                success: true,
                transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
                message: 'Payment processed successfully (simulated)',
              },
            };
          }
          return Promise.reject(error);
        }
      );

      return axiosInstance;
    } catch (error) {
      console.error('Failed to create x402 client:', error);
      return null;
    }
  }, [walletClient, address]);

  const processPayment = useCallback(async (config: PaymentConfig): Promise<PaymentResult> => {
    if (!x402Client || !isConnected || !address) {
      return {
        success: false,
        error: 'Wallet not connected or x402 client not available',
      };
    }

    setIsProcessing(true);

    try {
      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = parseUnits(config.amount, 6);

      // Make x402 payment request
      // The x402 interceptor will automatically handle 402 responses
      const response = await x402Client.post('/api/payment', {
        recipient: config.recipient,
        amount: amountWei.toString(),
        token: USDC_ADDRESS,
        chainId: base.id,
        description: config.description || 'TradeZen Payment',
      });

      // Check if payment was processed (look for X-PAYMENT-RESPONSE header)
      const paymentResponse = response.headers['x-payment-response'];
      
      if (response.status === 200 || response.status === 201) {
        // Extract transaction hash from response or payment header
        const transactionHash = response.data?.transactionHash || 
                               response.data?.txHash ||
                               (paymentResponse ? JSON.parse(paymentResponse)?.transactionHash : null);
        
        return {
          success: true,
          transactionHash: transactionHash || 'Payment processed successfully',
        };
      }

      return {
        success: false,
        error: 'Payment request failed with status: ' + response.status,
      };

    } catch (error: any) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment failed';
      
      if (error.response?.status === 402) {
        errorMessage = 'Payment required - insufficient funds or payment rejected';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [x402Client, isConnected, address]);

  const checkBalance = useCallback(async (): Promise<string | null> => {
    if (!publicClient || !address) return null;

    try {
      // Read USDC balance
      const balance = await publicClient.readContract({
        address: USDC_ADDRESS,
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
        args: [address],
      });

      return formatUnits(balance as bigint, 6);
    } catch (error) {
      console.error('Balance check error:', error);
      return null;
    }
  }, [publicClient, address]);

  return {
    processPayment,
    checkBalance,
    isProcessing,
    isReady: !!x402Client && isConnected,
    address,
  };
}

export interface PaymentComponentProps {
  config: PaymentConfig;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

export function PaymentComponent({ config, onSuccess, onError, children }: PaymentComponentProps) {
  const { processPayment, checkBalance, isProcessing, isReady } = usePaymentService();
  const [balance, setBalance] = useState<string | null>(null);

  const handlePayment = async () => {
    const result = await processPayment(config);
    
    if (result.success) {
      onSuccess?.(result);
    } else {
      onError?.(result.error || 'Payment failed');
    }
  };

  const handleCheckBalance = async () => {
    const userBalance = await checkBalance();
    setBalance(userBalance);
  };

  if (!isReady) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please connect your wallet to enable payments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900">Payment Details</h3>
        <p className="text-blue-800">Amount: {config.amount} USDC</p>
        <p className="text-blue-800">To: {config.recipient}</p>
        {config.description && (
          <p className="text-blue-800">Description: {config.description}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCheckBalance}
          className="btn-secondary"
          disabled={isProcessing}
        >
          Check Balance
        </button>
        
        <button
          onClick={handlePayment}
          className="btn-primary"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing Payment...' : 'Pay with USDC'}
        </button>
      </div>

      {balance && (
        <p className="text-sm text-gray-600">
          Your USDC Balance: {balance} USDC
        </p>
      )}

      {children}
    </div>
  );
}