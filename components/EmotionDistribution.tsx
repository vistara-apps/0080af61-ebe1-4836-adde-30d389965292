'use client';

interface EmotionDistributionProps {
  data: {
    planned: number;
    impulsive: number;
    revenge: number;
    fomo: number;
    overconfident: number;
  };
}

export function EmotionDistribution({ data }: EmotionDistributionProps) {
  const emotions = [
    { key: 'planned', label: 'Planned', color: 'bg-success', value: data.planned },
    { key: 'impulsive', label: 'Impulsive', color: 'bg-warning', value: data.impulsive },
    { key: 'revenge', label: 'Revenge', color: 'bg-danger', value: data.revenge },
    { key: 'fomo', label: 'FOMO', color: 'bg-orange-500', value: data.fomo },
    { key: 'overconfident', label: 'Overconfident', color: 'bg-purple-500', value: data.overconfident },
  ];

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-xl font-medium">Emotion Distribution</h3>

      <div className="space-y-3">
        {emotions.map((emotion) => {
          const percentage = total > 0 ? (emotion.value / total) * 100 : 0;
          return (
            <div key={emotion.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-fg">{emotion.label}</span>
                <span className="text-text-muted">{emotion.value} trades ({percentage.toFixed(0)}%)</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full ${emotion.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
