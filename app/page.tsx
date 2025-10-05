'use client';

import { useState } from 'react';
import { DashboardView } from '@/components/DashboardView';
import { FloatingWidget } from '@/components/FloatingWidget';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Navigation } from '@/components/Navigation';
import { PaymentFlow } from '@/components/PaymentFlow';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades' | 'settings'>('dashboard');

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'trades' && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Trade History</h2>
            <p className="text-text-muted">Your recent trades will appear here</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Settings</h2>
              <p className="text-text-muted mb-6">Configure your trading preferences and manage payments</p>
            </div>
            <PaymentFlow 
              onPaymentSuccess={(hash) => console.log('Payment successful:', hash)}
              onPaymentError={(error) => console.error('Payment error:', error)}
            />
          </div>
        )}
      </div>

      <FloatingWidget />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
