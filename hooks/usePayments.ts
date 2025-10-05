'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { getPaymentService, PaymentRequest, PaymentResult, PAYMENT_AMOUNTS } from '@/lib/paymentService';

export interface PaymentHookState {
  isInitialized: boolean;
  isProcessing: boolean;
  balance: string | null;
  error: string | null;
  lastPayment: PaymentResult | null;
}

export function usePayments() {
  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();
  
  const [state, setState] = useState<PaymentHookState>({
    isInitialized: false,
    isProcessing: false,
    balance: null,
    error: null,
    lastPayment: null,
  });

  const paymentService = getPaymentService();

  // Initialize payment service when wallet client is available
  useEffect(() => {
    if (walletClient && isConnected) {
      try {
        paymentService.initialize(walletClient);
        setState(prev => ({ ...prev, isInitialized: true, error: null }));
        
        // Load initial balance
        loadBalance();
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize payments',
          isInitialized: false 
        }));
      }
    } else {
      setState(prev => ({ ...prev, isInitialized: false, balance: null }));
    }
  }, [walletClient, isConnected, paymentService]);

  // Load USDC balance
  const loadBalance = useCallback(async () => {
    if (!state.isInitialized) return;

    try {
      const balance = await paymentService.checkUSDCBalance();
      setState(prev => ({ ...prev, balance, error: null }));
    } catch (error) {
      console.error('Balance loading error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load balance' 
      }));
    }
  }, [state.isInitialized, paymentService]);

  // Process a payment
  const processPayment = useCallback(async (request: PaymentRequest): Promise<PaymentResult> => {
    if (!state.isInitialized) {
      const error = 'Payment service not initialized';
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await paymentService.processPayment(request);
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        lastPayment: result,
        error: result.success ? null : result.error || 'Payment failed'
      }));

      // Refresh balance after successful payment
      if (result.success) {
        setTimeout(loadBalance, 2000); // Wait for blockchain confirmation
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage,
        lastPayment: { success: false, error: errorMessage }
      }));
      
      return { success: false, error: errorMessage };
    }
  }, [state.isInitialized, paymentService, loadBalance]);

  // Pay for trade analysis
  const payForTradeAnalysis = useCallback(async (tradeId: string): Promise<PaymentResult> => {
    return processPayment({
      amount: PAYMENT_AMOUNTS.TRADE_ANALYSIS,
      recipient: process.env.NEXT_PUBLIC_TRADEZEN_TREASURY || '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
      description: `TradeZen AI Analysis - Trade ${tradeId}`,
      metadata: {
        type: 'trade_analysis',
        tradeId,
        userId: address,
      },
    });
  }, [processPayment, address]);

  // Pay for premium features
  const payForPremiumFeatures = useCallback(async (): Promise<PaymentResult> => {
    return processPayment({
      amount: PAYMENT_AMOUNTS.PREMIUM_FEATURES,
      recipient: process.env.NEXT_PUBLIC_TRADEZEN_TREASURY || '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
      description: 'TradeZen Premium Features Access',
      metadata: {
        type: 'premium_features',
        userId: address,
      },
    });
  }, [processPayment, address]);

  // Pay for monthly subscription
  const payForMonthlySubscription = useCallback(async (): Promise<PaymentResult> => {
    return processPayment({
      amount: PAYMENT_AMOUNTS.MONTHLY_SUBSCRIPTION,
      recipient: process.env.NEXT_PUBLIC_TRADEZEN_TREASURY || '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
      description: 'TradeZen Monthly Subscription',
      metadata: {
        type: 'monthly_subscription',
        userId: address,
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      },
    });
  }, [processPayment, address]);

  // Estimate payment fees
  const estimateFees = useCallback(async (amount: string): Promise<string | null> => {
    if (!state.isInitialized) return null;

    try {
      const fees = await paymentService.estimatePaymentFees({
        amount,
        recipient: process.env.NEXT_PUBLIC_TRADEZEN_TREASURY || '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2',
        description: 'Fee estimation',
      });
      return fees;
    } catch (error) {
      console.error('Fee estimation error:', error);
      return null;
    }
  }, [state.isInitialized, paymentService]);

  // Get payment history
  const getPaymentHistory = useCallback(async () => {
    if (!state.isInitialized) return [];

    try {
      return await paymentService.getPaymentHistory();
    } catch (error) {
      console.error('Payment history error:', error);
      return [];
    }
  }, [state.isInitialized, paymentService]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh balance manually
  const refreshBalance = useCallback(() => {
    loadBalance();
  }, [loadBalance]);

  return {
    // State
    isInitialized: state.isInitialized,
    isProcessing: state.isProcessing,
    balance: state.balance,
    error: state.error,
    lastPayment: state.lastPayment,
    isConnected,
    address,

    // Actions
    processPayment,
    payForTradeAnalysis,
    payForPremiumFeatures,
    payForMonthlySubscription,
    estimateFees,
    getPaymentHistory,
    refreshBalance,
    clearError,

    // Constants
    PAYMENT_AMOUNTS,
  };
}