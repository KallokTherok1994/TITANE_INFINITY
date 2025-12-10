/**
 * TITANE∞ v20.0 — StatusPill Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'idle';

export interface StatusPillProps {
  status: StatusVariant;
  label: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

const variantStyles: Record<StatusVariant, { bg: string; text: string; dot: string }> = {
  success: {
    bg: 'rgba(147, 179, 153, 0.15)',
    text: 'var(--text-success, #93b399)',
    dot: 'var(--bg-success, #93b399)',
  },
  warning: {
    bg: 'rgba(227, 213, 213, 0.15)',
    text: 'var(--text-warning, #e3d5d5)',
    dot: 'var(--bg-warning, #e3d5d5)',
  },
  error: {
    bg: 'rgba(139, 95, 95, 0.15)',
    text: 'var(--text-danger, #8b5f5f)',
    dot: 'var(--bg-danger, #8b5f5f)',
  },
  info: {
    bg: 'rgba(114, 123, 129, 0.15)',
    text: 'var(--text-info, #727b81)',
    dot: 'var(--bg-primary, #727b81)',
  },
  idle: {
    bg: 'rgba(255, 255, 255, 0.05)',
    text: 'var(--text-muted, rgba(255,255,255,0.60))',
    dot: 'var(--text-muted, rgba(255,255,255,0.60))',
  },
};

/**
 * StatusPill - Badge de status avec couleur sémantique
 *
 * @example
 * ```tsx
 * <StatusPill status="success" label="Running" />
 * <StatusPill status="error" label="Failed" showDot size="sm" />
 * ```
 */
export function StatusPill({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}: StatusPillProps) {
  const styles = variantStyles[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${className}`}
      style={{
        background: styles.bg,
        color: styles.text,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: styles.dot }}
        />
      )}
      {label}
    </span>
  );
}
