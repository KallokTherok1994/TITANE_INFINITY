/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   ONGLET SECRETS — Gestion sécurisée des clés API
 *   AES-256-GCM + Argon2id — Aucun secret exposé au frontend
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, FormEvent } from 'react';
import { Card, Button, Input } from '@/ui';
import type { GeminiKeyStatus, SecretStatus } from '../types';
import { KNOWN_SECRETS as knownSecrets } from '../types';

interface SecretsTabProps {
  geminiStatus: GeminiKeyStatus | null;
  openaiStatus?: GeminiKeyStatus | null;
  anthropicStatus?: GeminiKeyStatus | null;
  secretsStatus: SecretStatus[];
  loading: boolean;
  onSetGeminiKey: (apiKey: string) => Promise<unknown>;
  onSetOpenAIKey?: (apiKey: string) => Promise<unknown>;
  onSetAnthropicKey?: (apiKey: string) => Promise<unknown>;
  onStoreSecret: (key: string, value: string, purgeEnv?: boolean) => Promise<unknown>;
  onDeleteSecret: (key: string) => Promise<unknown>;
  onRefresh: () => void;
}

export const SecretsTab: React.FC<SecretsTabProps> = ({
  geminiStatus,
  openaiStatus,
  anthropicStatus,
  secretsStatus,
  loading,
  onSetGeminiKey,
  onSetOpenAIKey,
  onSetAnthropicKey,
  onStoreSecret,
  onDeleteSecret: _onDeleteSecret,
  onRefresh,
}) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // État pour ajouter un nouveau secret
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');

  const handleGeminiSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = geminiKey.trim();

    if (trimmed.length < 16) {
      setMessage({ type: 'error', text: 'La clé semble trop courte (min 16 caractères)' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await onSetGeminiKey(trimmed);
      setGeminiKey('');
      setMessage({ type: 'success', text: 'Clé Gemini sécurisée avec succès ✅' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }

    setSaving(false);
  };

  const handleOpenAISubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!onSetOpenAIKey) return;

    const trimmed = openaiKey.trim();

    if (trimmed.length < 16) {
      setMessage({ type: 'error', text: 'La clé semble trop courte (min 16 caractères)' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await onSetOpenAIKey(trimmed);
      setOpenaiKey('');
      setMessage({ type: 'success', text: 'Clé OpenAI sécurisée avec succès ✅' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde OpenAI' });
    }

    setSaving(false);
  };

  const handleAnthropicSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!onSetAnthropicKey) return;

    const trimmed = anthropicKey.trim();

    if (trimmed.length < 16) {
      setMessage({ type: 'error', text: 'La clé semble trop courte (min 16 caractères)' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await onSetAnthropicKey(trimmed);
      setAnthropicKey('');
      setMessage({ type: 'success', text: 'Clé Anthropic sécurisée avec succès ✅' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde Anthropic' });
    }

    setSaving(false);
  };

  const handleAddSecret = async (e: FormEvent) => {
    e.preventDefault();
    const key = newSecretKey.trim();
    const value = newSecretValue.trim();

    if (!key || !value) {
      setMessage({ type: 'error', text: 'Clé et valeur requises' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await onStoreSecret(key, value, true);
      setNewSecretKey('');
      setNewSecretValue('');
      setMessage({ type: 'success', text: `Secret "${key}" stocké avec succès ✅` });
      onRefresh();
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du stockage du secret' });
    }

    setSaving(false);
  };

  const statusColor = geminiStatus?.configured
    ? geminiStatus.provider_enabled
      ? 'var(--color-success, #4caf50)'
      : 'var(--color-warning, #ff9800)'
    : 'var(--color-error, #f44336)';

  const statusText = geminiStatus?.configured
    ? geminiStatus.provider_enabled
      ? 'Gemini opérationnel'
      : 'Gemini configuré (inactif)'
    : 'Gemini non configuré';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Message feedback */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background:
              message.type === 'success'
                ? 'rgba(76, 175, 80, 0.15)'
                : message.type === 'error'
                ? 'rgba(244, 67, 54, 0.15)'
                : 'rgba(33, 150, 243, 0.15)',
            color:
              message.type === 'success'
                ? '#2e7d32'
                : message.type === 'error'
                ? '#c62828'
                : '#1565c0',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Carte Gemini API Key */}
      <Card>
        <header style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            🌐 Gemini API Key
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted, #8193a7)', fontSize: '0.9rem' }}>
            Chiffrement AES-256-GCM + Argon2id — Stockage sécurisé
          </p>
        </header>

        {/* Statut actuel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'var(--color-surface, #1a1a2e)',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: statusColor,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.95rem' }}>{statusText}</strong>
            {geminiStatus?.masked_key && (
              <code style={{ display: 'block', fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}>
                {geminiStatus.masked_key}
              </code>
            )}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleGeminiSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              type="password"
              placeholder="Entrer une nouvelle clé Gemini"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              disabled={loading || saving}
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={!geminiKey.trim() || loading || saving}>
            Sauvegarder
          </Button>
        </form>
      </Card>

      {/* Carte OpenAI API Key */}
      {onSetOpenAIKey && (
        <Card>
          <header style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
              🤖 OpenAI API Key
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted, #8193a7)', fontSize: '0.9rem' }}>
              GPT-4, GPT-4 Turbo, GPT-4o — Chiffrement AES-256-GCM
            </p>
          </header>

          {/* Statut actuel */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--color-surface, #1a1a2e)',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: openaiStatus?.configured ? '#4caf50' : '#f44336',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.95rem' }}>
                {openaiStatus?.configured ? 'OpenAI opérationnel' : 'OpenAI non configuré'}
              </strong>
              {openaiStatus?.masked_key && (
                <code style={{ display: 'block', fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}>
                  {openaiStatus.masked_key}
                </code>
              )}
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleOpenAISubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                type="password"
                placeholder="Entrer une nouvelle clé OpenAI"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                disabled={loading || saving}
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={!openaiKey.trim() || loading || saving}>
              Sauvegarder
            </Button>
          </form>
        </Card>
      )}

      {/* Carte Anthropic API Key */}
      {onSetAnthropicKey && (
        <Card>
          <header style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
              🧠 Anthropic Claude API Key
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted, #8193a7)', fontSize: '0.9rem' }}>
              Claude 3.5 Sonnet, Claude 3 Opus — Chiffrement AES-256-GCM
            </p>
          </header>

          {/* Statut actuel */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--color-surface, #1a1a2e)',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: anthropicStatus?.configured ? '#4caf50' : '#f44336',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.95rem' }}>
                {anthropicStatus?.configured ? 'Anthropic opérationnel' : 'Anthropic non configuré'}
              </strong>
              {anthropicStatus?.masked_key && (
                <code style={{ display: 'block', fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}>
                  {anthropicStatus.masked_key}
                </code>
              )}
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleAnthropicSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                type="password"
                placeholder="Entrer une nouvelle clé Anthropic"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                disabled={loading || saving}
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={!anthropicKey.trim() || loading || saving}>
              Sauvegarder
            </Button>
          </form>
        </Card>
      )}

      {/* Autres secrets */}
      <Card>
        <header style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            🔐 Autres Secrets
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted, #8193a7)', fontSize: '0.9rem' }}>
            Gestion centralisée de tous les secrets TITANE∞
          </p>
        </header>

        {/* Liste des secrets connus */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Secrets connus
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {knownSecrets.filter(s => s.key !== 'gemini_api_key').map((secret) => {
              const status = secretsStatus.find(s => s.key === secret.key);
              const isConfigured = status?.configured ?? false;

              return (
                <div
                  key={secret.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--color-surface, #1a1a2e)',
                    border: '1px solid var(--color-border, #2a2a3e)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500 }}>{secret.label}</span>
                        <code style={{ opacity: 0.5, fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                          {secret.key}
                        </code>
                      </div>
                      {secret.description && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>
                          {secret.description}
                        </p>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        background: isConfigured
                          ? 'rgba(76, 175, 80, 0.2)'
                          : 'rgba(244, 67, 54, 0.2)',
                        color: isConfigured ? '#4caf50' : '#f44336',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isConfigured ? '✓ Configuré' : '✕ Non configuré'}
                    </span>
                  </div>
                  {status?.maskedValue && (
                    <code style={{ fontSize: '0.75rem', opacity: 0.6, padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                      {status.maskedValue}
                    </code>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ajouter un secret */}
        <form onSubmit={handleAddSecret} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            Ajouter un secret
          </h4>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input
              placeholder="Clé (ex: my_api_key)"
              value={newSecretKey}
              onChange={(e) => setNewSecretKey(e.target.value)}
              style={{ flex: 1 }}
            />
            <Input
              placeholder="Valeur"
              type="password"
              value={newSecretValue}
              onChange={(e) => setNewSecretValue(e.target.value)}
              style={{ flex: 2 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" disabled={!newSecretKey.trim() || !newSecretValue.trim() || saving}>
              Stocker
            </Button>
          </div>
        </form>
      </Card>

      {/* Guide sécurité */}
      <Card>
        <header style={{ marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            📋 Guide Sécurité TITANE∞
          </h3>
        </header>
        <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
          <li>Définir <code>TITANE_SECRETS_PASSPHRASE</code> dans l'environnement avant le lancement.</li>
          <li>Les secrets sont chiffrés avec AES-256-GCM + dérivation Argon2id.</li>
          <li>⚠️ Les valeurs ne sont JAMAIS exposées au frontend (seulement statuts masqués).</li>
          <li>Kevin Thibault est le seul superAdmin autorisé à modifier les secrets critiques.</li>
        </ol>
      </Card>
    </div>
  );
};

export default SecretsTab;
