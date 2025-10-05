'use client';

import { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { TradeEntryForm } from './TradeEntryForm';

export function FloatingWidget() {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <div className="floating-widget">
        <button
          onClick={() => setIsExpanded(true)}
          className="widget-fab"
          aria-label="Open trade entry"
        >
          <TrendingUp className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="floating-widget">
      <div className="widget-expanded">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Log Trade</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-text-muted hover:text-fg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <TradeEntryForm onSubmit={() => setIsExpanded(false)} />
      </div>
    </div>
  );
}
