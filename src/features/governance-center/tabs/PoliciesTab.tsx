/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   ONGLET POLITIQUES IA — Règles et restrictions
 *   Limites, guardrails, audit des comportements IA
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Card, Button } from '@/ui';
import type { IAPolicy, PolicyType, PolicySeverity } from '../types';

interface PoliciesTabProps {
  policies: IAPolicy[];
  loading: boolean;
  onTogglePolicy: (policyId: string, enabled: boolean) => Promise<unknown>;
  onCreatePolicy: (
    policy: Omit<IAPolicy, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<unknown>;
  onDeletePolicy: (policyId: string) => Promise<unknown>;
  onRefresh: () => void;
}

const policyTypeLabels: Record<
  PolicyType,
  { label: string; icon: string; color: string }
> = {
  limit: { label: 'Limite', icon: '⚡', color: '#ff9800' },
  guardrail: { label: 'Garde-fou', icon: '🛡️', color: '#f44336' },
  restriction: { label: 'Restriction', icon: '🚫', color: '#e91e63' },
  audit: { label: 'Audit', icon: '📋', color: '#2196f3' },
};

const severityLabels: Record<PolicySeverity, { label: string; color: string }> = {
  info: { label: 'Info', color: '#2196f3' },
  warning: { label: 'Attention', color: '#ff9800' },
  critical: { label: 'Critique', color: '#f44336' },
};

export const PoliciesTab: React.FC<PoliciesTabProps> = ({
  policies,
  loading,
  onTogglePolicy,
  onCreatePolicy: _onCreatePolicy,
  onDeletePolicy: _onDeletePolicy,
  onRefresh,
}) => {
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const handleToggle = async (policy: IAPolicy) => {
    await onTogglePolicy(policy.id, !policy.enabled);
  };

  const groupedPolicies = policies.reduce(
    (acc, policy) => {
      if (!acc[policy.type]) {
        acc[policy.type] = [];
      }
      acc[policy.type].push(policy);
      return acc;
    },
    {} as Record<PolicyType, IAPolicy[]>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            📋 Politiques IA TITANE∞
          </h3>
          <p
            style={{
              margin: '4px 0 0',
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
            }}
          >
            Règles et restrictions pour encadrer les comportements de l'IA
          </p>
        </div>
        <Button variant="ghost" onClick={onRefresh} disabled={loading}>
          Rafraîchir
        </Button>
      </div>

      {/* Stats */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}
      >
        {Object.entries(policyTypeLabels).map(([type, { label, icon, color }]) => {
          const count = groupedPolicies[type as PolicyType]?.length ?? 0;
          const enabledCount =
            groupedPolicies[type as PolicyType]?.filter(p => p.enabled).length ?? 0;
          return (
            <Card key={type} style={{ padding: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <span>{icon}</span>
                <span style={{ fontWeight: 500, color }}>{label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{count}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {enabledCount} actives
              </div>
            </Card>
          );
        })}
      </div>

      {/* Liste des politiques */}
      {Object.entries(groupedPolicies).map(([type, typePolicies]) => (
        <Card key={type}>
          <header
            style={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{policyTypeLabels[type as PolicyType].icon}</span>
            <h4 style={{ margin: 0, color: policyTypeLabels[type as PolicyType].color }}>
              {policyTypeLabels[type as PolicyType].label}s
            </h4>
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.7 }}>
              {typePolicies.length} politique{typePolicies.length > 1 ? 's' : ''}
            </span>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {typePolicies.map(policy => (
              <div
                key={policy.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'var(--color-surface, #1a1a2e)',
                  border:
                    expandedPolicy === policy.id
                      ? '1px solid var(--color-primary)'
                      : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() =>
                  setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)
                }
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Toggle */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleToggle(policy);
                      }}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: policy.enabled
                          ? 'var(--color-primary, #727b81)'
                          : 'rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#fff',
                          position: 'absolute',
                          top: '3px',
                          left: policy.enabled ? '23px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </button>

                    <div>
                      <div style={{ fontWeight: 500 }}>{policy.name}</div>
                      <div
                        style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}
                      >
                        {policy.description}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: `${severityLabels[policy.severity].color}20`,
                      color: severityLabels[policy.severity].color,
                    }}
                  >
                    {severityLabels[policy.severity].label}
                  </span>
                </div>

                {/* Détails étendus */}
                {expandedPolicy === policy.id && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <h5
                      style={{
                        margin: '0 0 8px',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Configuration
                    </h5>
                    <pre
                      style={{
                        margin: 0,
                        padding: '8px',
                        borderRadius: '4px',
                        background: 'rgba(0,0,0,0.3)',
                        fontSize: '0.8rem',
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(policy.config, null, 2)}
                    </pre>
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Créé: {new Date(policy.createdAt).toLocaleString('fr-FR')}
                      {' • '}
                      Modifié: {new Date(policy.updatedAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Si aucune politique */}
      {policies.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <h4 style={{ margin: '0 0 8px' }}>Aucune politique configurée</h4>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Les politiques par défaut seront chargées automatiquement.
          </p>
        </Card>
      )}
    </div>
  );
};

export default PoliciesTab;
