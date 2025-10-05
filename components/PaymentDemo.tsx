'use client';

import { useState } from 'react';
import { PaymentComponent, PaymentConfig, PaymentResult } from './PaymentService';
import { PaymentTest } from './PaymentTest';
import { TransactionConfirmation } from './TransactionConfirmation';
import { ErrorHandlingTest } from './ErrorHandlingTest';
import { useAccount } from 'wagmi';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function PaymentDemo() {
  const { isConnected } = useAccount();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeView, setActiveView] = useState<'demo' | 'test' | 'errors'>('demo');

  // Demo payment configuration
  const paymentConfig: PaymentConfig = {
    amount: '0.01', // 0.01 USDC for demo
    recipient: '0x742d35Cc6635C0532925a3b8D186aD7E79f4b8e2', // Demo recipient address
    description: 'TradeZen Premium Feature Access',
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setPaymentStatus('success');
    setTransactionHash(result.transactionHash || '');
    setErrorMessage('');
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    setErrorMessage(error);
    setTransactionHash('');
  };

  const resetDemo = () => {
    setPaymentStatus('idle');
    setTransactionHash('');
    setErrorMessage('');
  };

  if (!isConnected) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">💳 X402 Payment Demo</h2>
        <p className="text-text-muted">Please connect your wallet to test the payment flow.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">💳 X402 Payment Integration</h2>
            {paymentStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {paymentStatus === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('demo')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'demo' 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Payment Demo
            </button>
            <button
              onClick={() => setActiveView('test')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'test' 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Run Tests
            </button>
            <button
              onClick={() => setActiveView('errors')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'errors' 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Error Tests
            </button>
          </div>
        </div>

        {activeView === 'demo' && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Test Scenario</h3>
              <p className="text-sm text-gray-600">
                This demo simulates a payment for premium TradeZen features using USDC on Base network.
                The x402 protocol enables seamless crypto payments with automatic transaction handling.
              </p>
            </div>

            {paymentStatus === 'idle' && (
              <PaymentComponent
                config={paymentConfig}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              >
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a demo payment. Make sure you have USDC on Base network.
                    You can get testnet USDC from Base faucets for testing.
                  </p>
                </div>
              </PaymentComponent>
            )}

            {paymentStatus === 'success' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Payment Successful!
                  </h3>
                  <p className="text-green-800 mt-2">
                    Your payment has been processed successfully.
                  </p>
                  {transactionHash && (
                    <div className="mt-4">
                      <TransactionConfirmation
                        transactionHash={transactionHash}
                        onConfirmed={(receipt) => {
                          console.log('Transaction confirmed:', receipt);
                        }}
                      />
                    </div>
                  )}
                </div>
                <button onClick={resetDemo} className="btn-secondary">
                  Test Another Payment
                </button>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-900 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Payment Failed
                  </h3>
                  <p className="text-red-800 mt-2">{errorMessage}</p>
                  <div className="mt-3 text-sm text-red-700">
                    <p><strong>Common issues:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Insufficient USDC balance</li>
                      <li>Network connection issues</li>
                      <li>Transaction rejected by user</li>
                      <li>Gas fees too high</li>
                    </ul>
                  </div>
                </div>
                <button onClick={resetDemo} className="btn-secondary">
                  Try Again
                </button>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Integration Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span>Base Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span>Token:</span>
                  <span>USDC</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span>X402 + Wagmi</span>
                </div>
                <div className="flex justify-between">
                  <span>Contract:</span>
                  <span className="font-mono text-xs">0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'test' && <PaymentTest />}
        
        {activeView === 'errors' && <ErrorHandlingTest />}
      </div>
    </div>
  );
}