/**
 * TITANE∞ v26.4.0 — MetricCard Component
 * Display single performance metric
 */

export interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'critical';
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  status = 'good',
}: MetricCardProps) {
  const statusColors = {
    good: 'border-green-500',
    warning: 'border-yellow-500',
    critical: 'border-red-500',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${statusColors[status]} bg-gray-800`}
    >
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
        {trend && (
          <span
            className={`text-lg ${
              trend === 'up'
                ? 'text-green-400'
                : trend === 'down'
                ? 'text-red-400'
                : 'text-gray-400'
            }`}
          >
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
}
