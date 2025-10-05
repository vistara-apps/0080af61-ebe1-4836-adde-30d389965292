'use client';

import { useState } from 'react';
import { DashboardView } from '@/components/DashboardView';
import { FloatingWidget } from '@/components/FloatingWidget';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Navigation } from '@/components/Navigation';
import { PaymentDemo } from '@/components/PaymentDemo';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades' | 'settings' | 'payments'>('dashboard');

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
          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>
            <p className="text-text-muted">Configure your trading preferences</p>
          </div>
        )}
        {activeTab === 'payments' && <PaymentDemo />}
      </div>

      <FloatingWidget />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
