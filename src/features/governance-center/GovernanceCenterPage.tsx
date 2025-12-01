/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   CENTRE GOUVERNANCE & SÉCURITÉ TITANE∞
 *   Page principale avec 4 onglets unifiés
 *   Secrets / Politiques IA / Permissions / Journal
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { useGovernance } from './hooks/useGovernance';
import { SecretsTab } from './tabs/SecretsTab';
import { PoliciesTab } from './tabs/PoliciesTab';
import { PermissionsTab } from './tabs/PermissionsTab';
import { SecurityLogTab } from './tabs/SecurityLogTab';
import { GOVERNANCE_TABS, SUPER_ADMIN } from './types';
// GovernanceTab type used implicitly via useGovernance
import { Spinner } from '@/ui';

export const GovernanceCenterPage: React.FC = () => {
  const governance = useGovernance();

  const renderTabContent = () => {
    switch (governance.activeTab) {
      case 'secrets':
        return (
          <SecretsTab
            geminiStatus={governance.geminiStatus}
            secretsStatus={governance.secretsStatus}
            loading={governance.loading}
            onSetGeminiKey={governance.setGeminiKey}
            onStoreSecret={governance.storeSecret}
            onDeleteSecret={governance.deleteSecret}
            onRefresh={governance.loadGeminiStatus}
          />
        );
      case 'policies':
        return (
          <PoliciesTab
            policies={governance.policies}
            loading={governance.loading}
            onTogglePolicy={governance.togglePolicy}
            onCreatePolicy={governance.createPolicy}
            onDeletePolicy={governance.deletePolicy}
            onRefresh={governance.loadPolicies}
          />
        );
      case 'permissions':
        return (
          <PermissionsTab
            permissionMatrix={governance.permissionMatrix}
            permissionAudit={governance.permissionAudit}
            loading={governance.loading}
            onClearAudit={governance.clearPermissionAudit}
            onRefresh={() => {
              governance.loadPermissionMatrix();
              governance.loadPermissionAudit();
            }}
          />
        );
      case 'logs':
        return (
          <SecurityLogTab
            securityLog={governance.securityLog}
            logFilters={governance.logFilters}
            loading={governance.loading}
            onLoadLog={governance.loadSecurityLog}
            onExportLog={governance.exportSecurityLog}
            onClearLog={governance.clearSecurityLog}
            onRefresh={() => governance.loadSecurityLog()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px',
        gap: '24px',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '1.8rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #727b81, #93b399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🛡️ Centre Gouvernance & Sécurité
          </h1>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #727b81, #93b399)',
              color: '#000',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            TITANE∞
          </span>
        </div>
        <p style={{ margin: 0, color: 'var(--color-text-muted, #8193a7)', fontSize: '0.95rem' }}>
          Gestion centralisée des secrets, politiques IA, permissions et journal de sécurité
        </p>
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'rgba(255, 193, 7, 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
          }}
        >
          <span>👑</span>
          <span>SuperAdmin: <strong>{SUPER_ADMIN.name}</strong></span>
        </div>
      </header>

      {/* Onglets */}
      <nav
        style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          background: 'var(--color-surface, #1a1a2e)',
          borderRadius: '12px',
          width: 'fit-content',
        }}
      >
        {GOVERNANCE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => governance.setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background:
                governance.activeTab === tab.id
                  ? 'linear-gradient(135deg, #727b81, #93b399)'
                  : 'transparent',
              color: governance.activeTab === tab.id ? '#000' : 'inherit',
              fontWeight: governance.activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Erreur globale */}
      {governance.error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(244, 67, 54, 0.15)',
            color: '#f44336',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>❌ {governance.error}</span>
          <button
            onClick={() => governance.setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Contenu de l'onglet */}
      <main style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {governance.loading && governance.activeTab === 'secrets' && !governance.geminiStatus ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              gap: '12px',
            }}
          >
            <Spinner size="lg" />
            <span>Chargement des données de gouvernance...</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'var(--color-surface, #1a1a2e)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted, #8193a7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>🔐 Chiffrement: AES-256-GCM + Argon2id</span>
          <span>|</span>
          <span>🛡️ Permissions: {Object.keys(governance.permissionMatrix).length} actions</span>
          <span>|</span>
          <span>📋 Politiques: {governance.policies.length} actives</span>
        </div>
        <button
          onClick={governance.refreshAll}
          disabled={governance.loading}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary, #727b81)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          🔄 Actualiser tout
        </button>
      </footer>
    </div>
  );
};

export default GovernanceCenterPage;
