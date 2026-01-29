/**
 * TITANE∞ v26.4.0 — TrendGraph Component
 * Simplified trend graph for metrics
 */

import type { DataPoint } from '@/types';

export interface TrendGraphProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export function TrendGraph({
  data,
  width = 200,
  height = 60,
  color = '#60a5fa',
}: TrendGraphProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-800 rounded"
        style={{ width, height }}
      >
        <span className="text-sm text-gray-500">No data</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - minValue) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="bg-gray-800 rounded">
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - minValue) / range) * height;
        return (
          <circle key={i} cx={x} cy={y} r="3" fill={color}>
            <title>{`${d.label || d.timestamp}: ${d.value}`}</title>
          </circle>
        );
      })}
    </svg>
  );
}
