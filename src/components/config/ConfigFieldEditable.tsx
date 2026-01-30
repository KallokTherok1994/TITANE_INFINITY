/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIG FIELD EDITABLE - Editable configuration field
 *   Phase 2: Configuration Management UI (Day 3-4)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';

export interface ConfigFieldEditableProps {
  label: string;
  value: string | number | boolean;
  description?: string;
  icon?: string;
  valueType?: 'text' | 'number' | 'boolean' | 'url' | 'duration';
  editable?: boolean;
  onChange?: (value: string | number | boolean) => void;
  validationError?: string;
}

export const ConfigFieldEditable: React.FC<ConfigFieldEditableProps> = ({
  label,
  value,
  description,
  icon = '⚙️',
  valueType = 'text',
  editable = false,
  onChange,
  validationError,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [_isEditing, _setIsEditing] = useState(false);

  // Sync local value when parent value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (onChange) {
      // Parse based on type
      if (valueType === 'number' || valueType === 'duration') {
        const num = parseInt(newValue, 10);
        if (!isNaN(num)) {
          onChange(num);
        }
      } else if (valueType === 'boolean') {
        onChange(newValue === 'true');
      } else {
        onChange(newValue);
      }
    }
  };

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
    if (validationError) {
      return 'var(--color-error)';
    }
    if (typeof value === 'boolean') {
      return value ? 'var(--color-success)' : 'var(--color-warning)';
    }
    return 'var(--color-text-primary)';
  };

  const renderInput = () => {
    if (valueType === 'boolean') {
      return (
        <select
          value={String(localValue)}
          onChange={e => handleChange(e.target.value)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: getValueColor(),
            padding: '0.5rem 1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            border: validationError
              ? '1px solid var(--color-error)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: '120px',
            cursor: 'pointer',
          }}
        >
          <option value="true">✅ Activé</option>
          <option value="false">❌ Désactivé</option>
        </select>
      );
    }

    if (valueType === 'number' || valueType === 'duration') {
      return (
        <input
          type="number"
          value={String(localValue).replace(/ms$/, '')}
          onChange={e => handleChange(e.target.value)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: getValueColor(),
            padding: '0.5rem 1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            border: validationError
              ? '1px solid var(--color-error)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: '120px',
            textAlign: 'right',
          }}
        />
      );
    }

    // text, url
    return (
      <input
        type="text"
        value={String(localValue)}
        onChange={e => handleChange(e.target.value)}
        placeholder={valueType === 'url' ? 'http://...' : ''}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: getValueColor(),
          padding: '0.5rem 1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          border: validationError
            ? '1px solid var(--color-error)'
            : '1px solid rgba(255, 255, 255, 0.2)',
          minWidth: '200px',
          textAlign: 'left',
        }}
      />
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          background: editable
            ? 'rgba(102, 126, 234, 0.08)'
            : 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          border: validationError
            ? '1px solid var(--color-error)'
            : editable
              ? '1px solid rgba(102, 126, 234, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
          <div>
            <div
              style={{
                fontWeight: 500,
                marginBottom: '0.25rem',
                color: 'var(--color-text-primary)',
              }}
            >
              {label}
              {editable && (
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    background: 'rgba(102, 126, 234, 0.2)',
                    borderRadius: '4px',
                    color: '#667eea',
                  }}
                >
                  ÉDITION
                </span>
              )}
            </div>
            {description && (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  opacity: 0.7,
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
        <div>
          {editable ? (
            renderInput()
          ) : (
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
          )}
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-error)',
            padding: '0.5rem 1rem',
            background: 'rgba(255, 68, 68, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 68, 68, 0.3)',
          }}
        >
          ⚠️ {validationError}
        </div>
      )}
    </div>
  );
};

ConfigFieldEditable.displayName = 'ConfigFieldEditable';
