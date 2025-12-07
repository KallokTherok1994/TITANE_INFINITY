/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIG FIELD - Read-only configuration field display
 *   Phase 2: Configuration Management UI (Day 1-2)
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';

export interface ConfigFieldProps {
  label: string;
  value: string | number | boolean;
  description?: string;
  icon?: string;
  valueType?: 'text' | 'number' | 'boolean' | 'url' | 'duration';
}

export const ConfigField: React.FC<ConfigFieldProps> = ({
  label,
  value,
  description,
  icon = '⚙️',
  valueType = 'text',
}) => {
  const formatValue = (val: string | number | boolean): string => {
    if (typeof val === 'boolean') {
      return val ? '✅ Activé' : '❌ Désactivé';
    }

    if (valueType === 'duration' && typeof val === 'number') {
      return `${val}ms`;
    }

    if (valueType === 'url' && typeof val === 'string') {
      return val || 'Non configuré';
    }

    return String(val);
  };

  const getValueColor = (): string => {
    if (typeof value === 'boolean') {
      return value ? 'var(--color-success)' : 'var(--color-warning)';
    }
    return 'var(--color-text-primary)';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>
            {label}
          </div>
          {description && (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>
              {description}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: getValueColor(),
          padding: '0.5rem 1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: '120px',
          textAlign: 'right',
        }}
      >
        {formatValue(value)}
      </div>
    </div>
  );
};
