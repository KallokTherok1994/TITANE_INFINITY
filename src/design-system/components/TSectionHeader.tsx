/**
 * TITANE∞ v∞ — TSectionHeader Component
 * Super Prompt #3 - Phase 2: Section header component
 *
 * Header cohérent pour sections de module
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React from 'react';
import { colors, spacing, typography, borders, text } from '../tokens';

export interface TSectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  divider?: boolean;
}

export const TSectionHeader: React.FC<TSectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  divider = true,
  style,
  children,
  ...props
}) => {
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
          justifyContent: 'space-between',
          gap: spacing[4],
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            flex: 1,
          }}
        >
          {icon && (
            <span
              style={{
                fontSize: typography.fontSize['2xl'],
                color: colors.primary[300],
              }}
            >
              {icon}
            </span>
          )}
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: text.primary,
                lineHeight: typography.lineHeight.tight,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  margin: 0,
                  marginTop: spacing[1],
                  fontSize: typography.fontSize.sm,
                  color: text.tertiary,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {children}

      {divider && (
        <div
          style={{
            height: '1px',
            background: `linear-gradient(90deg, ${borders.strong} 0%, transparent 100%)`,
            marginTop: spacing[2],
          }}
        />
      )}
    </div>
  );
};
