'use client';

import { useState, useEffect } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Loader2, CreditCard, CheckCircle, XCircle, RefreshCw, DollarSign } from 'lucide-react';

interface PaymentFlowProps {
  onPaymentSuccess?: (transactionHash: string) => void;
  onPaymentError?: (error: string) => void;
}

export function PaymentFlow({ onPaymentSuccess, onPaymentError }: PaymentFlowProps) {
  const {
    isInitialized,
    isProcessing,
    balance,
    error,
    lastPayment,
    isConnected,
    address,
    payForTradeAnalysis,
    payForPremiumFeatures,
    payForMonthlySubscription,
    estimateFees,
    refreshBalance,
    clearError,
    PAYMENT_AMOUNTS,
  } = usePayments();

  const [selectedPayment, setSelectedPayment] = useState<'trade' | 'premium' | 'subscription' | null>(null);
  const [estimatedFees, setEstimatedFees] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Format USDC amount (6 decimals)
  const formatUSDC = (amount: string) => {
    const value = Number(amount) / 1000000;
    return value.toFixed(2);
  };

  // Estimate fees when payment type is selected
  useEffect(() => {
    if (selectedPayment && isInitialized) {
      const amount = selectedPayment === 'trade' 
        ? PAYMENT_AMOUNTS.TRADE_ANALYSIS
        : selectedPayment === 'premium'
        ? PAYMENT_AMOUNTS.PREMIUM_FEATURES
        : PAYMENT_AMOUNTS.MONTHLY_SUBSCRIPTION;

      estimateFees(amount).then(setEstimatedFees);
    }
  }, [selectedPayment, isInitialized, estimateFees, PAYMENT_AMOUNTS]);

  // Handle payment success
  useEffect(() => {
    if (lastPayment?.success && lastPayment.transactionHash) {
      setShowSuccess(true);
      onPaymentSuccess?.(lastPayment.transactionHash);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedPayment(null);
      }, 5000);
    } else if (lastPayment?.error) {
      onPaymentError?.(lastPayment.error);
    }
  }, [lastPayment, onPaymentSuccess, onPaymentError]);

  const handlePayment = async () => {
    if (!selectedPayment) return;

    try {
      let result;
      switch (selectedPayment) {
        case 'trade':
          result = await payForTradeAnalysis(`trade_${Date.now()}`);
          break;
        case 'premium':
          result = await payForPremiumFeatures();
          break;
        case 'subscription':
          result = await payForMonthlySubscription();
          break;
        default:
          return;
      }

      if (!result.success) {
        console.error('Payment failed:', result.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="glass-card p-6 text-center">
        <CreditCard className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connect Wallet for Payments</h3>
        <p className="text-text-muted mb-4">
          Connect your wallet to access premium features with USDC payments on Base
        </p>
        <Wallet>
          <ConnectWallet>
            <button className="btn-primary">
              Connect Wallet
            </button>
          </ConnectWallet>
        </Wallet>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="glass-card p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
        <p className="text-text-muted">Initializing payment system...</p>
      </div>
    );
  }

  if (showSuccess && lastPayment?.success) {
    return (
      <div className="glass-card p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-text-muted mb-4">
          Transaction Hash: {lastPayment.transactionHash?.slice(0, 10)}...
        </p>
        <p className="text-sm text-text-muted">
          Confirmations: {lastPayment.confirmations || 0}/3
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Premium Payments</h3>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <DollarSign className="w-4 h-4" />
          <span>USDC Balance: {balance ? formatUSDC(balance) : '0.00'}</span>
          <button
            onClick={refreshBalance}
            className="p-1 hover:bg-surface-light rounded"
            disabled={isProcessing}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-400">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Trade Analysis Payment */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            selectedPayment === 'trade' 
              ? 'border-accent bg-accent/10' 
              : 'border-border hover:border-accent/50'
          }`}
          onClick={() => setSelectedPayment('trade')}
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">AI Trade Analysis</h4>
              <p className="text-sm text-text-muted">Get detailed emotion analysis for your trade</p>
            </div>
            <div className="text-right">
              <div className="font-semibold">${formatUSDC(PAYMENT_AMOUNTS.TRADE_ANALYSIS)} USDC</div>
              {selectedPayment === 'trade' && estimatedFees && (
                <div className="text-xs text-text-muted">
                  + ${formatUSDC(estimatedFees)} gas
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Features Payment */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            selectedPayment === 'premium' 
              ? 'border-accent bg-accent/10' 
              : 'border-border hover:border-accent/50'
          }`}
          onClick={() => setSelectedPayment('premium')}
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Premium Features</h4>
              <p className="text-sm text-text-muted">Unlock advanced analytics and insights</p>
            </div>
            <div className="text-right">
              <div className="font-semibold">${formatUSDC(PAYMENT_AMOUNTS.PREMIUM_FEATURES)} USDC</div>
              {selectedPayment === 'premium' && estimatedFees && (
                <div className="text-xs text-text-muted">
                  + ${formatUSDC(estimatedFees)} gas
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Subscription Payment */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            selectedPayment === 'subscription' 
              ? 'border-accent bg-accent/10' 
              : 'border-border hover:border-accent/50'
          }`}
          onClick={() => setSelectedPayment('subscription')}
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Monthly Subscription</h4>
              <p className="text-sm text-text-muted">Full access to all TradeZen features</p>
            </div>
            <div className="text-right">
              <div className="font-semibold">${formatUSDC(PAYMENT_AMOUNTS.MONTHLY_SUBSCRIPTION)} USDC</div>
              {selectedPayment === 'subscription' && estimatedFees && (
                <div className="text-xs text-text-muted">
                  + ${formatUSDC(estimatedFees)} gas
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedPayment && (
        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay with USDC
              </>
            )}
          </button>
          
          <div className="mt-2 text-xs text-text-muted text-center">
            Payments are processed on Base network
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-text-muted">
        <p>• Payments are processed using USDC on Base network</p>
        <p>• Transactions require 3 confirmations for security</p>
        <p>• Connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
      </div>
    </div>
  );
}