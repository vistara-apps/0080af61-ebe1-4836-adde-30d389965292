'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { base } from 'wagmi/chains';
import { CheckCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';

interface TransactionConfirmationProps {
  transactionHash: string;
  onConfirmed?: (receipt: any) => void;
}

interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed' | 'not_found';
  confirmations: number;
  blockNumber?: bigint;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  receipt?: any;
}

export function TransactionConfirmation({ transactionHash, onConfirmed }: TransactionConfirmationProps) {
  const publicClient = usePublicClient();
  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    status: 'pending',
    confirmations: 0,
  });
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!publicClient || !transactionHash || !isPolling) return;

    let pollInterval: NodeJS.Timeout;

    const checkTransactionStatus = async () => {
      try {
        // Get transaction receipt
        const receipt = await publicClient.getTransactionReceipt({
          hash: transactionHash as `0x${string}`,
        });

        if (receipt) {
          // Get current block number for confirmation count
          const currentBlock = await publicClient.getBlockNumber();
          const confirmations = Number(currentBlock - receipt.blockNumber);

          const newStatus: TransactionStatus = {
            status: receipt.status === 'success' ? 'confirmed' : 'failed',
            confirmations,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
            effectiveGasPrice: receipt.effectiveGasPrice,
            receipt,
          };

          setTxStatus(newStatus);

          // Stop polling after confirmation
          if (confirmations >= 1) {
            setIsPolling(false);
            onConfirmed?.(receipt);
          }
        }
      } catch (error: any) {
        if (error.message?.includes('not found')) {
          setTxStatus(prev => ({ ...prev, status: 'not_found' }));
        } else {
          console.error('Error checking transaction status:', error);
        }
      }
    };

    // Initial check
    checkTransactionStatus();

    // Poll every 2 seconds
    pollInterval = setInterval(checkTransactionStatus, 2000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [publicClient, transactionHash, isPolling, onConfirmed]);

  const getStatusIcon = () => {
    switch (txStatus.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'not_found':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (txStatus.status) {
      case 'pending':
        return 'Transaction pending...';
      case 'confirmed':
        return `Confirmed with ${txStatus.confirmations} confirmation${txStatus.confirmations !== 1 ? 's' : ''}`;
      case 'failed':
        return 'Transaction failed';
      case 'not_found':
        return 'Transaction not found';
    }
  };

  const getStatusColor = () => {
    switch (txStatus.status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'confirmed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'not_found':
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Transaction Status</h3>
            <a
              href={`https://basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              View on BaseScan
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{getStatusText()}</p>
          
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Hash:</span>
              <span className="font-mono break-all">{transactionHash}</span>
            </div>
            
            {txStatus.blockNumber && (
              <div className="flex justify-between">
                <span>Block:</span>
                <span>{txStatus.blockNumber.toString()}</span>
              </div>
            )}
            
            {txStatus.gasUsed && (
              <div className="flex justify-between">
                <span>Gas Used:</span>
                <span>{txStatus.gasUsed.toString()}</span>
              </div>
            )}
            
            {txStatus.effectiveGasPrice && (
              <div className="flex justify-between">
                <span>Gas Price:</span>
                <span>{(Number(txStatus.effectiveGasPrice) / 1e9).toFixed(2)} Gwei</span>
              </div>
            )}
          </div>
          
          {txStatus.status === 'confirmed' && (
            <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
              ✅ Payment confirmed on Base network
            </div>
          )}
          
          {txStatus.status === 'failed' && (
            <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
              ❌ Transaction failed. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function useTransactionConfirmation(transactionHash?: string) {
  const publicClient = usePublicClient();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmations, setConfirmations] = useState(0);

  useEffect(() => {
    if (!publicClient || !transactionHash) return;

    const checkConfirmation = async () => {
      try {
        const receipt = await publicClient.getTransactionReceipt({
          hash: transactionHash as `0x${string}`,
        });

        if (receipt && receipt.status === 'success') {
          const currentBlock = await publicClient.getBlockNumber();
          const confirmationCount = Number(currentBlock - receipt.blockNumber);
          
          setConfirmations(confirmationCount);
          setIsConfirmed(confirmationCount >= 1);
        }
      } catch (error) {
        console.error('Error checking confirmation:', error);
      }
    };

    checkConfirmation();
    const interval = setInterval(checkConfirmation, 3000);

    return () => clearInterval(interval);
  }, [publicClient, transactionHash]);

  return { isConfirmed, confirmations };
}