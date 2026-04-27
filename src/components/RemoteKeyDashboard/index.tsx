/**
 * TITANE∞ — Remote Key Dashboard
 *
 * UI dashboard for managing TITANE remote API keys.
 * Surfaces: create, list, revoke, rotate with stable data-testid selectors.
 *
 * Rule 16: E2E in e2e/remote-key-dashboard.spec.ts
 */

import React, { useState } from 'react';
import { useRemoteKeyAgent } from '../../services/remoteKeyManager/useRemoteKeyAgent';
import type { RemoteKeyEntry } from '../../services/remoteKeyManager';
import styles from './RemoteKeyDashboard.module.css';
import { AgentConfigPanel } from './AgentConfigPanel';

// ── Create form ───────────────────────────────────────────────────────────────

function CreateKeyForm({ onSubmit }: { onSubmit: (label: string) => void }) {
  const [label, setLabel] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setLabel('');
  }

  return (
    <form
      data-testid="remote-key-create-form"
      className={styles.createForm}
      onSubmit={handleSubmit}
    >
      <input
        data-testid="remote-key-label-input"
        className={styles.input}
        type="text"
        placeholder="Nom de la clé (ex: Mobile, CI/CD, …)"
        value={label}
        onChange={e => setLabel(e.target.value)}
        maxLength={64}
        required
      />
      <button
        data-testid="remote-key-create-button"
        className={styles.btn}
        type="submit"
        disabled={!label.trim()}
      >
        + Créer clé
      </button>
    </form>
  );
}

// ── Secret banner ─────────────────────────────────────────────────────────────

function SecretBanner({
  keyId,
  secret,
  onClose,
}: {
  keyId: string;
  secret: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copySecret() {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      data-testid="remote-key-secret-banner"
      className={styles.secretBanner}
      role="alert"
    >
      <p className={styles.secretWarning}>
        ⚠️ Copiez cette clé maintenant — elle ne sera plus jamais affichée.
      </p>
      <p className={styles.secretKeyId}>ID : {keyId}</p>
      <code data-testid="remote-key-secret-value" className={styles.secretValue}>
        {secret}
      </code>
      <div className={styles.secretActions}>
        <button
          data-testid="remote-key-copy-button"
          className={styles.btnCopy}
          onClick={copySecret}
        >
          {copied ? '✓ Copié' : 'Copier'}
        </button>
        <button
          data-testid="remote-key-dismiss-button"
          className={styles.btnDismiss}
          onClick={onClose}
        >
          J'ai sauvegardé ma clé
        </button>
      </div>
    </div>
  );
}

// ── Key row ───────────────────────────────────────────────────────────────────

function KeyRow({
  entry,
  onRevoke,
  onRotate,
}: {
  entry: RemoteKeyEntry;
  onRevoke: (id: string) => void;
  onRotate: (id: string) => void;
}) {
  const created = new Date(entry.created_at * 1000).toLocaleDateString('fr-FR');
  const lastUsed = entry.last_used
    ? new Date(entry.last_used * 1000).toLocaleDateString('fr-FR')
    : '—';

  return (
    <tr
      data-testid={`remote-key-row-${entry.key_id}`}
      className={entry.enabled ? styles.rowEnabled : styles.rowDisabled}
    >
      <td data-testid={`remote-key-id-${entry.key_id}`} className={styles.cellId}>
        {entry.key_id}
      </td>
      <td data-testid={`remote-key-label-${entry.key_id}`}>{entry.label}</td>
      <td>{entry.scopes.join(', ')}</td>
      <td>{created}</td>
      <td>{lastUsed}</td>
      <td>
        <span className={entry.enabled ? styles.badgeActive : styles.badgeRevoked}>
          {entry.enabled ? 'Active' : 'Révoquée'}
        </span>
      </td>
      <td className={styles.cellActions}>
        <button
          data-testid={`remote-key-rotate-${entry.key_id}`}
          className={styles.btnRotate}
          onClick={() => onRotate(entry.key_id)}
          disabled={!entry.enabled}
          title="Renouveler la clé"
        >
          ↺ Rotation
        </button>
        <button
          data-testid={`remote-key-revoke-${entry.key_id}`}
          className={styles.btnRevoke}
          onClick={() => {
            if (window.confirm(`Révoquer la clé "${entry.label}" ?`)) {
              onRevoke(entry.key_id);
            }
          }}
          disabled={!entry.enabled}
          title="Révoquer définitivement"
        >
          ✕ Révoquer
        </button>
      </td>
    </tr>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

type DashboardTab = 'keys' | 'agent';

export default function RemoteKeyDashboard() {
  const { state, createKey, revokeKey, rotateKey, refresh, clearSecret } =
    useRemoteKeyAgent();
  const [activeTab, setActiveTab] = useState<DashboardTab>('keys');

  async function handleCreate(label: string) {
    await createKey(label, ['Admin', 'Chat', 'Memory', 'System']);
  }

  return (
    <section data-testid="remote-key-dashboard" className={styles.dashboard}>
      <header className={styles.header}>
        <h2 className={styles.title}>🔑 Clés API TITANE Remote</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            data-testid="remote-key-tab-keys"
            onClick={() => setActiveTab('keys')}
            style={{
              background: activeTab === 'keys' ? '#7c3aed' : 'transparent',
              color: activeTab === 'keys' ? '#fff' : '#9ca3af',
              border: `1px solid ${activeTab === 'keys' ? '#7c3aed' : '#374151'}`,
              borderRadius: 6,
              padding: '0.35rem 0.9rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Clés
          </button>
          <button
            data-testid="remote-key-tab-agent"
            onClick={() => setActiveTab('agent')}
            style={{
              background: activeTab === 'agent' ? '#7c3aed' : 'transparent',
              color: activeTab === 'agent' ? '#fff' : '#9ca3af',
              border: `1px solid ${activeTab === 'agent' ? '#7c3aed' : '#374151'}`,
              borderRadius: 6,
              padding: '0.35rem 0.9rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            🧠 Agent IA
          </button>
          <button
            data-testid="remote-key-refresh-button"
            className={styles.btnRefresh}
            onClick={refresh}
            disabled={state.status === 'loading'}
          >
            ↻ Actualiser
          </button>
        </div>
      </header>

      {/* Secret once banner */}
      {state.lastSecretOnce && state.lastKeyIdOnce && (
        <SecretBanner
          keyId={state.lastKeyIdOnce}
          secret={state.lastSecretOnce}
          onClose={clearSecret}
        />
      )}

      {/* Agent IA tab */}
      {activeTab === 'agent' && <AgentConfigPanel />}

      {/* Keys tab */}
      {activeTab === 'keys' && (
        <>
          {/* Error state */}
          {state.error && (
            <p data-testid="remote-key-error" className={styles.error} role="alert">
              {state.error}
            </p>
          )}

          {/* Create form */}
          <CreateKeyForm onSubmit={handleCreate} />

          {/* Loading indicator */}
          {state.status === 'loading' && (
            <p data-testid="remote-key-loading" className={styles.loading}>
              Chargement…
            </p>
          )}

          {/* Key list */}
          {state.keys.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table data-testid="remote-key-table" className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Scopes</th>
                    <th>Créée</th>
                    <th>Dernier usage</th>
                    <th>État</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.keys.map(k => (
                    <KeyRow
                      key={k.key_id}
                      entry={k}
                      onRevoke={revokeKey}
                      onRotate={rotateKey}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            state.status === 'ready' && (
              <p data-testid="remote-key-empty" className={styles.empty}>
                Aucune clé active. Créez-en une pour accéder à TITANE depuis n'importe où.
              </p>
            )
          )}

          <footer className={styles.footer}>
            <span data-testid="remote-key-count">
              {state.keys.filter(k => k.enabled).length} clé(s) active(s)
            </span>
          </footer>
        </>
      )}
    </section>
  );
}
