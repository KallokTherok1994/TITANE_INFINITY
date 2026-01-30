/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIG SECTION - Collapsible configuration section
 *   Phase 2: Configuration Management UI (Day 1-2)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';

export interface ConfigSectionProps {
  title: string;
  icon?: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
  title,
  icon = '📦',
  description,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          background: isOpen ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          color: 'inherit',
        }}
        onMouseEnter={e => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
          }
        }}
        onMouseLeave={e => {
          if (!isOpen) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              {title}
            </div>
            {description && (
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                  opacity: 0.8,
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            fontSize: '1.25rem',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▼
        </div>
      </button>

      {/* Section Content */}
      {isOpen && (
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

ConfigSection.displayName = 'ConfigSection';
