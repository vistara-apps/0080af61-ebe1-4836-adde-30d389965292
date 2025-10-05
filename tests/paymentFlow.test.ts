/**
 * Test suite for x402 payment flow integration
 * Tests the integration between wagmi useWalletClient and x402-axios
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TradeZenPaymentService, USDC_BASE_ADDRESS, PAYMENT_AMOUNTS } from '../lib/paymentService';

// Mock wallet client for testing
const mockWalletClient = {
  account: {
    address: '0x1234567890123456789012345678901234567890',
  },
  getTransactionReceipt: jest.fn(),
  getBlockNumber: jest.fn(),
};

// Mock x402 client
const mockX402Client = {
  setWalletClient: jest.fn(),
  createPayment: jest.fn(),
  executePayment: jest.fn(),
  getTokenBalance: jest.fn(),
  getPaymentHistory: jest.fn(),
  estimatePaymentFees: jest.fn(),
};

// Mock x402-axios module
jest.mock('x402-axios', () => ({
  X402Client: jest.fn().mockImplementation(() => mockX402Client),
}));

describe('TradeZen Payment Service', () => {
  let paymentService: TradeZenPaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = new TradeZenPaymentService('https://test-api.tradezen.com');
  });

  describe('Initialization', () => {
    it('should initialize with wallet client', () => {
      paymentService.initialize(mockWalletClient as any);
      expect(mockX402Client.setWalletClient).toHaveBeenCalledWith(mockWalletClient);
    });
  });

  describe('USDC Balance Check', () => {
    it('should check USDC balance successfully', async () => {
      const expectedBalance = '1000000000'; // 1000 USDC
      mockX402Client.getTokenBalance.mockResolvedValue(expectedBalance);
      
      paymentService.initialize(mockWalletClient as any);
      const balance = await paymentService.checkUSDCBalance();
      
      expect(balance).toBe(expectedBalance);
      expect(mockX402Client.getTokenBalance).toHaveBeenCalledWith({
        token: USDC_BASE_ADDRESS,
        address: mockWalletClient.account.address,
        chain: 8453, // Base chain ID
      });
    });

    it('should throw error when wallet not initialized', async () => {
      await expect(paymentService.checkUSDCBalance()).rejects.toThrow('Wallet client not initialized');
    });
  });

  describe('Payment Processing', () => {
    const validPaymentRequest = {
      amount: PAYMENT_AMOUNTS.TRADE_ANALYSIS,
      recipient: '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
      description: 'Test payment',
      metadata: { test: true },
    };

    beforeEach(() => {
      paymentService.initialize(mockWalletClient as any);
      mockX402Client.getTokenBalance.mockResolvedValue('10000000'); // 10 USDC balance
    });

    it('should process payment successfully', async () => {
      const mockPaymentResponse = { id: 'payment_123', status: 'pending' };
      const mockTransactionHash = '0xabcdef1234567890';
      
      mockX402Client.createPayment.mockResolvedValue(mockPaymentResponse);
      mockX402Client.executePayment.mockResolvedValue(mockTransactionHash);
      mockWalletClient.getTransactionReceipt.mockResolvedValue({
        blockNumber: 100n,
        status: 'success',
      });
      mockWalletClient.getBlockNumber.mockResolvedValue(103n);

      const result = await paymentService.processPayment(validPaymentRequest);

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe(mockTransactionHash);
      expect(result.confirmations).toBeGreaterThanOrEqual(3);
    });

    it('should fail when insufficient balance', async () => {
      mockX402Client.getTokenBalance.mockResolvedValue('500000'); // 0.5 USDC (insufficient)

      const result = await paymentService.processPayment(validPaymentRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient USDC balance');
    });

    it('should validate payment request parameters', async () => {
      const invalidRequests = [
        { ...validPaymentRequest, amount: '0' },
        { ...validPaymentRequest, recipient: 'invalid-address' },
        { ...validPaymentRequest, description: '' },
      ];

      for (const request of invalidRequests) {
        const result = await paymentService.processPayment(request);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should handle transaction execution failure', async () => {
      mockX402Client.createPayment.mockResolvedValue({ id: 'payment_123' });
      mockX402Client.executePayment.mockResolvedValue(null);

      const result = await paymentService.processPayment(validPaymentRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Transaction execution failed');
    });
  });

  describe('Transaction Confirmation', () => {
    beforeEach(() => {
      paymentService.initialize(mockWalletClient as any);
    });

    it('should wait for required confirmations', async () => {
      const transactionHash = '0xabcdef1234567890';
      
      // Mock progressive confirmation checks
      mockWalletClient.getTransactionReceipt
        .mockResolvedValueOnce(null) // First check: not mined
        .mockResolvedValueOnce({ blockNumber: 100n }) // Second check: 1 confirmation
        .mockResolvedValueOnce({ blockNumber: 100n }); // Third check: still 1 confirmation
        
      mockWalletClient.getBlockNumber
        .mockResolvedValueOnce(100n) // 1 confirmation
        .mockResolvedValueOnce(102n); // 3 confirmations

      // This is a private method, so we'll test it through processPayment
      mockX402Client.getTokenBalance.mockResolvedValue('10000000');
      mockX402Client.createPayment.mockResolvedValue({ id: 'payment_123' });
      mockX402Client.executePayment.mockResolvedValue(transactionHash);

      const result = await paymentService.processPayment({
        amount: PAYMENT_AMOUNTS.TRADE_ANALYSIS,
        recipient: '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
        description: 'Test payment',
      });

      expect(result.success).toBe(true);
      expect(result.confirmations).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Fee Estimation', () => {
    beforeEach(() => {
      paymentService.initialize(mockWalletClient as any);
    });

    it('should estimate payment fees', async () => {
      const expectedFees = '50000'; // 0.05 USDC in gas fees
      mockX402Client.estimatePaymentFees.mockResolvedValue(expectedFees);

      const fees = await paymentService.estimatePaymentFees({
        amount: PAYMENT_AMOUNTS.TRADE_ANALYSIS,
        recipient: '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
        description: 'Test payment',
      });

      expect(fees).toBe(expectedFees);
      expect(mockX402Client.estimatePaymentFees).toHaveBeenCalledWith({
        token: USDC_BASE_ADDRESS,
        amount: PAYMENT_AMOUNTS.TRADE_ANALYSIS,
        recipient: '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
        chain: 8453,
      });
    });
  });

  describe('Payment History', () => {
    beforeEach(() => {
      paymentService.initialize(mockWalletClient as any);
    });

    it('should retrieve payment history', async () => {
      const mockHistory = [
        {
          id: 'payment_1',
          amount: PAYMENT_AMOUNTS.TRADE_ANALYSIS,
          status: 'completed',
          timestamp: Date.now(),
        },
        {
          id: 'payment_2',
          amount: PAYMENT_AMOUNTS.PREMIUM_FEATURES,
          status: 'completed',
          timestamp: Date.now() - 86400000,
        },
      ];

      mockX402Client.getPaymentHistory.mockResolvedValue(mockHistory);

      const history = await paymentService.getPaymentHistory();

      expect(history).toEqual(mockHistory);
      expect(mockX402Client.getPaymentHistory).toHaveBeenCalledWith({
        address: mockWalletClient.account.address,
        chain: 8453,
        limit: 50,
      });
    });

    it('should return empty array on error', async () => {
      mockX402Client.getPaymentHistory.mockRejectedValue(new Error('API Error'));

      const history = await paymentService.getPaymentHistory();

      expect(history).toEqual([]);
    });
  });
});

describe('Payment Constants', () => {
  it('should have correct USDC amounts', () => {
    expect(PAYMENT_AMOUNTS.TRADE_ANALYSIS).toBe('1000000'); // 1 USDC
    expect(PAYMENT_AMOUNTS.PREMIUM_FEATURES).toBe('5000000'); // 5 USDC
    expect(PAYMENT_AMOUNTS.MONTHLY_SUBSCRIPTION).toBe('10000000'); // 10 USDC
  });

  it('should have correct USDC contract address for Base', () => {
    expect(USDC_BASE_ADDRESS).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
  });
});

describe('Error Handling', () => {
  let paymentService: TradeZenPaymentService;

  beforeEach(() => {
    paymentService = new TradeZenPaymentService();
    paymentService.initialize(mockWalletClient as any);
  });

  it('should handle network errors gracefully', async () => {
    mockX402Client.getTokenBalance.mockRejectedValue(new Error('Network error'));

    await expect(paymentService.checkUSDCBalance()).rejects.toThrow('Failed to check USDC balance');
  });

  it('should handle payment creation errors', async () => {
    mockX402Client.getTokenBalance.mockResolvedValue('10000000');
    mockX402Client.createPayment.mockRejectedValue(new Error('Payment creation failed'));

    const result = await paymentService.processPayment({
      amount: PAYMENT_AMOUNTS.TRADE_ANALYSIS,
      recipient: '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
      description: 'Test payment',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Payment creation failed');
  });

  it('should handle transaction confirmation timeouts', async () => {
    mockX402Client.getTokenBalance.mockResolvedValue('10000000');
    mockX402Client.createPayment.mockResolvedValue({ id: 'payment_123' });
    mockX402Client.executePayment.mockResolvedValue('0xabcdef1234567890');
    
    // Mock transaction that never gets enough confirmations
    mockWalletClient.getTransactionReceipt.mockResolvedValue({ blockNumber: 100n });
    mockWalletClient.getBlockNumber.mockResolvedValue(101n); // Only 2 confirmations

    const result = await paymentService.processPayment({
      amount: PAYMENT_AMOUNTS.TRADE_ANALYSIS,
      recipient: '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
      description: 'Test payment',
    });

    // Should still succeed but with fewer confirmations
    expect(result.success).toBe(true);
    expect(result.confirmations).toBeLessThan(3);
  });
});