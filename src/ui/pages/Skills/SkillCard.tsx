/**
 * TITANE∞ Skill OS — Skill Card Component
 * Displays individual skill with actions.
 */

import React from 'react';
import type { SkillRegistryEntry } from '@/services/skills';

interface SkillCardProps {
  skill: SkillRegistryEntry;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDisable: () => void;
  onArchive: () => void;
  onUninstall: () => void;
}

const stateColors: Record<string, { bg: string; text: string; label: string }> = {
  INSTALLED: { bg: '#d1fae5', text: '#065f46', label: 'Installée' },
  ACTIVE: { bg: '#dbeafe', text: '#1e40af', label: 'Active' },
  DEGRADED: { bg: '#fef3c7', text: '#92400e', label: 'Dégradée' },
  DISABLED: { bg: '#f3f4f6', text: '#6b7280', label: 'Désactivée' },
  FAILED: { bg: '#fee2e2', text: '#991b1b', label: 'Échouée' },
  ARCHIVED: { bg: '#e5e7eb', text: '#374151', label: 'Archivée' },
};

const sourceIcons: Record<string, string> = {
  prompt: '📝',
  manifest: '📋',
  'gpt-import': '🤖',
  openapi: '🔗',
  'zip-package': '📦',
  manual: '✏️',
};

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isActive,
  onActivate,
  onDeactivate,
  onDisable,
  onArchive,
  onUninstall,
}) => {
  const stateInfo = stateColors[skill.state] || stateColors.INSTALLED;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const safeStateInfo = stateInfo!;
  const sourceIcon = sourceIcons[skill.installSource] || '🧩';

  return (
    <div
      style={{
        border: isActive ? '2px solid #6366f1' : '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        background: isActive ? '#faf5ff' : 'white',
        transition: 'all 0.2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '20px' }}>{sourceIcon}</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{skill.name}</h3>
            {isActive && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  background: '#6366f1',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 600,
                }}
              >
                ACTIVE
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                background: safeStateInfo.bg,
                color: safeStateInfo.text,
                borderRadius: '12px',
                fontWeight: 500,
              }}
            >
              {safeStateInfo.label}
            </span>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>v{skill.version}</span>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>•</span>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
              {skill.installSource}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {skill.state === 'INSTALLED' && !isActive && (
            <button
              onClick={onActivate}
              style={{
                padding: '6px 12px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Activer
            </button>
          )}
          {isActive && (
            <button
              onClick={onDeactivate}
              style={{
                padding: '6px 12px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Désactiver
            </button>
          )}
          {skill.state !== 'DISABLED' && skill.state !== 'ARCHIVED' && (
            <button
              onClick={onDisable}
              style={{
                padding: '6px 12px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Désactiver
            </button>
          )}
          {skill.state !== 'ARCHIVED' && (
            <button
              onClick={onArchive}
              style={{
                padding: '6px 12px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Archiver
            </button>
          )}
          <button
            onClick={onUninstall}
            style={{
              padding: '6px 12px',
              background: '#fee2e2',
              color: '#991b1b',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
