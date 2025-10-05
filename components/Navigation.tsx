'use client';

import { LayoutDashboard, List, Settings2 } from 'lucide-react';

interface NavigationProps {
  activeTab: 'dashboard' | 'trades' | 'settings';
  onTabChange: (tab: 'dashboard' | 'trades' | 'settings') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trades' as const, label: 'Trades', icon: List },
    { id: 'settings' as const, label: 'Settings', icon: Settings2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t z-40" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 py-3 px-6 transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-fg'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
