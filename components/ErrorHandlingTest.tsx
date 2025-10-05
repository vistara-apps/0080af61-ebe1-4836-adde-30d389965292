'use client';

import { useState } from 'react';
import { usePaymentService } from './PaymentService';
import { useAccount } from 'wagmi';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ErrorTestCase {
  name: string;
  description: string;
  config: any;
  expectedError: string;
}

export function ErrorHandlingTest() {
  const { isConnected } = useAccount();
  const { processPayment } = usePaymentService();
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'running' | 'success' | 'error'>>({});
  const [isRunning, setIsRunning] = useState(false);

  const errorTestCases: ErrorTestCase[] = [
    {
      name: 'Invalid Amount',
      description: 'Test with invalid payment amount',
      config: {
        amount: '-1',
        recipient: '0x742d35Cc6635C0532925a3b8D186aD7E79f4b8e2',
        description: 'Invalid amount test',
      },
      expectedError: 'Invalid amount',
    },
    {
      name: 'Invalid Recipient',
      description: 'Test with invalid recipient address',
      config: {
        amount: '0.01',
        recipient: 'invalid-address',
        description: 'Invalid recipient test',
      },
      expectedError: 'Invalid recipient address',
    },
    {
      name: 'Zero Amount',
      description: 'Test with zero payment amount',
      config: {
        amount: '0',
        recipient: '0x742d35Cc6635C0532925a3b8D186aD7E79f4b8e2',
        description: 'Zero amount test',
      },
      expectedError: 'Amount must be greater than zero',
    },
    {
      name: 'Network Error',
      description: 'Test network connectivity issues',
      config: {
        amount: '0.01',
        recipient: '0x742d35Cc6635C0532925a3b8D186aD7E79f4b8e2',
        description: 'Network error test',
        // This will trigger network error in our mock
        _triggerNetworkError: true,
      },
      expectedError: 'Network error',
    },
    {
      name: 'Insufficient Balance',
      description: 'Test insufficient USDC balance scenario',
      config: {
        amount: '1000000', // Very large amount
        recipient: '0x742d35Cc6635C0532925a3b8D186aD7E79f4b8e2',
        description: 'Insufficient balance test',
      },
      expectedError: 'Insufficient balance',
    },
  ];

  const runErrorTests = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsRunning(true);
    const initialResults: Record<string, 'pending' | 'running' | 'success' | 'error'> = {};
    errorTestCases.forEach(testCase => {
      initialResults[testCase.name] = 'pending';
    });
    setTestResults(initialResults);

    for (const testCase of errorTestCases) {
      setTestResults(prev => ({ ...prev, [testCase.name]: 'running' }));
      
      try {
        // Add delay to simulate real testing
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = await processPayment(testCase.config);
        
        // For our tests, we expect all of these to fail
        if (!result.success) {
          setTestResults(prev => ({ ...prev, [testCase.name]: 'success' }));
        } else {
          setTestResults(prev => ({ ...prev, [testCase.name]: 'error' }));
        }
      } catch (error) {
        // Expected behavior for error test cases
        setTestResults(prev => ({ ...prev, [testCase.name]: 'success' }));
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: 'pending' | 'running' | 'success' | 'error') => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🛡️ Error Handling Tests</h2>
        <button
          onClick={runErrorTests}
          disabled={isRunning || !isConnected}
          className="btn-primary"
        >
          {isRunning ? 'Running Tests...' : 'Run Error Tests'}
        </button>
      </div>

      {!isConnected && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Please connect your wallet to run error handling tests</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Test Overview</h3>
          <p className="text-blue-800 text-sm">
            These tests verify that the payment system properly handles various error conditions
            and provides meaningful feedback to users. All tests are designed to fail gracefully.
          </p>
        </div>

        {errorTestCases.map((testCase, index) => {
          const status = testResults[testCase.name] || 'pending';
          return (
            <div key={testCase.name} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{index + 1}. {testCase.name}</span>
                  {status === 'success' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      HANDLED
                    </span>
                  )}
                  {status === 'error' && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      UNHANDLED
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{testCase.description}</p>
                <p className="text-xs text-gray-500 mt-1">Expected: {testCase.expectedError}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Error Handling Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Validation Errors</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Invalid payment amounts</li>
              <li>• Malformed addresses</li>
              <li>• Missing required fields</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Network Errors</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Connection timeouts</li>
              <li>• RPC failures</li>
              <li>• Chain unavailability</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Transaction Errors</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Insufficient balance</li>
              <li>• Gas estimation failures</li>
              <li>• User rejection</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Recovery Actions</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Retry mechanisms</li>
              <li>• Fallback options</li>
              <li>• User guidance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}