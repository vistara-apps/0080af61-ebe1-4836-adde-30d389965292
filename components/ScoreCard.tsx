'use client';

import { Share2, TrendingUp } from 'lucide-react';

interface ScoreCardProps {
  score: number;
}

export function ScoreCard({ score }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="score-card space-y-4">
      <div className="flex items-center justify-center gap-2">
        <TrendingUp className="w-6 h-6 text-accent" />
        <h2 className="text-xl font-medium">Weekly Mental Performance</h2>
      </div>

      <div className="relative inline-block">
        <svg className="w-48 h-48" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth="20"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="20"
            strokeDasharray={`${(score / 100) * 502.4} 502.4`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`score-number ${getScoreColor(score)}`}>{score}</div>
          <div className="text-text-muted text-sm">/ 100</div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button className="btn-primary flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share to Farcaster
        </button>
      </div>

      <div className="text-sm text-text-muted">
        You're in the top 30% of disciplined traders this week
      </div>
    </div>
  );
}
