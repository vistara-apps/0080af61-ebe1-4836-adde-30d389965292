'use client';

import { useState } from 'react';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { TrendingUp, Zap, Target, BarChart3 } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to TradeZen',
      description: 'Log trades in 10 seconds. Build discipline.',
      icon: <TrendingUp className="w-16 h-16 text-accent" />,
    },
    {
      title: 'Quick Trade Logging',
      description: 'Tap the floating widget → Enter trade → See emotion tag',
      icon: <Zap className="w-16 h-16 text-accent" />,
    },
    {
      title: 'AI Emotion Insights',
      description: 'Automatically detect patterns: Planned, Impulsive, Revenge, FOMO',
      icon: <Target className="w-16 h-16 text-accent" />,
    },
    {
      title: 'Weekly Performance Score',
      description: 'Track your discipline with a simple 0-100 score',
      icon: <BarChart3 className="w-16 h-16 text-accent" />,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8 text-center space-y-6">
          <div className="flex justify-center">
            {currentStep.icon}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{currentStep.title}</h1>
            <p className="text-text-muted text-lg">{currentStep.description}</p>
          </div>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary w-full"
            >
              Continue
            </button>
          ) : (
            <div className="space-y-4">
              <Wallet>
                <ConnectWallet>
                  <button className="btn-primary w-full">
                    Connect Wallet to Start
                  </button>
                </ConnectWallet>
              </Wallet>
              <button
                onClick={onComplete}
                className="btn-secondary w-full"
              >
                Start Logging Manually
              </button>
            </div>
          )}

          <div className="flex justify-center gap-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${
                  index === step ? 'bg-accent w-8' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
