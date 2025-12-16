/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — Chart Component                                 ║
 * ║   Simple sparkline and bar charts for metrics                      ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import './Chart.css';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 30,
  color = '#0e639c',
}) => {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
};

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  maxValue?: number;
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  color = '#0e639c',
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className="bar-chart">
      {data.map((item, index) => (
        <div key={index} className="bar-chart-item">
          <div className="bar-chart-label">{item.label}</div>
          <div className="bar-chart-bar-container">
            <div
              className="bar-chart-bar"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: color,
              }}
            />
            <span className="bar-chart-value">{item.value.toFixed(1)}ms</span>
          </div>
        </div>
      ))}
    </div>
  );
};
