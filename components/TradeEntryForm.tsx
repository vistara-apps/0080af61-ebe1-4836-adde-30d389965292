'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface TradeEntryFormProps {
  onSubmit: () => void;
}

export function TradeEntryForm({ onSubmit }: TradeEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    asset: '',
    direction: 'long' as 'long' | 'short',
    entryPrice: '',
    exitPrice: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate AI emotion tagging
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Asset</label>
        <input
          type="text"
          placeholder="e.g., EURUSD, BTCUSD"
          value={formData.asset}
          onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Direction</label>
        <select
          value={formData.direction}
          onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'long' | 'short' })}
          className="select-field"
        >
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Entry Price</label>
        <input
          type="number"
          step="0.00001"
          placeholder="0.00000"
          value={formData.entryPrice}
          onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Exit Price</label>
        <input
          type="number"
          step="0.00001"
          placeholder="0.00000"
          value={formData.exitPrice}
          onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing emotion...
          </>
        ) : (
          'Submit Trade'
        )}
      </button>
    </form>
  );
}
