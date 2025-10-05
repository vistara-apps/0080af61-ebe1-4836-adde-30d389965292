'use client';

import { useState } from 'react';
import { ScoreCard } from './ScoreCard';
import { EmotionDistribution } from './EmotionDistribution';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function DashboardView() {
  const [weeklyScore] = useState(67);
  const [previousScore] = useState(62);
  const [emotionData] = useState({
    planned: 45,
    impulsive: 30,
    revenge: 10,
    fomo: 10,
    overconfident: 5,
  });

  const scoreDiff = weeklyScore - previousScore;
  const trendIcon = scoreDiff > 0 ? TrendingUp : scoreDiff < 0 ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor = scoreDiff > 0 ? 'text-success' : scoreDiff < 0 ? 'text-danger' : 'text-text-muted';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-text-muted">Your trading discipline metrics</p>
        </div>
      </div>

      <ScoreCard score={weeklyScore} />

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium">Weekly Trend</h3>
          <div className={`flex items-center gap-2 ${trendColor}`}>
            <TrendIcon className="w-5 h-5" />
            <span className="font-semibold">
              {scoreDiff > 0 ? '+' : ''}{scoreDiff} points
            </span>
          </div>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
            style={{ width: `${weeklyScore}%` }}
          />
        </div>
      </div>

      <EmotionDistribution data={emotionData} />

      <div className="grid grid-cols-2 gap-4">
        <div className="metric-card">
          <div className="text-text-muted text-sm mb-1">Plan Adherence</div>
          <div className="text-2xl font-bold text-gradient">78%</div>
        </div>
        <div className="metric-card">
          <div className="text-text-muted text-sm mb-1">Consistency</div>
          <div className="text-2xl font-bold text-gradient">85%</div>
        </div>
        <div className="metric-card">
          <div className="text-text-muted text-sm mb-1">Risk Management</div>
          <div className="text-2xl font-bold text-gradient">72%</div>
        </div>
        <div className="metric-card">
          <div className="text-text-muted text-sm mb-1">Total Trades</div>
          <div className="text-2xl font-bold text-gradient">127</div>
        </div>
      </div>
    </div>
  );
}
