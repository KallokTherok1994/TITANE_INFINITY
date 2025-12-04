/**
 * TITANE∞ v∞ — TMetric Component
 * Super Prompt #3 - Phase 2: Metric display component
 *
 * Affiche valeur numérique + label + tendance
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React from 'react';
import { colors, spacing, typography } from '../tokens';

export interface TMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

export const TMetric: React.FC<TMetricProps> = ({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = colors.titanium[300],
  style,
  ...props
}) => {
  const trendColors = {
    up: colors.semantic.success,
    down: colors.semantic.error,
    neutral: colors.text.tertiary,
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[2],
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
        }}
      >
        {icon && (
          <span
            style={{
              fontSize: typography.fontSize.xl,
              color: color,
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: typography.letterSpacing.wide,
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: spacing[2],
        }}
      >
        <span
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: color,
            lineHeight: typography.lineHeight.tight,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {trend && trendValue && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            fontSize: typography.fontSize.sm,
            color: trendColors[trend],
          }}
        >
          <span>{trendIcons[trend]}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};
