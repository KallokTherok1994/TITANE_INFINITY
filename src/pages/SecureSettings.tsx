/**
 * TITANE_INFINITY v∞ — Secure Settings Page
 * Gestion sécurisée des API keys via SecureSecretsEngine
 */

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { Card, Button, Input, Spinner } from '../ui';
import {
  getGeminiKeyStatus,
  hasSecureData,
  maskSecret,
  setGeminiApiKey,
  type GeminiKeyStatus,
} from '@/utils/secureSecrets';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';

interface MessageState {
  tone: 'success' | 'warning' | 'danger';
  text: string;
}

const initialMessage: MessageState = {
  tone: 'warning',
  text: "Aucune clé Gemini détectée. Configurez la clé sécurisée pour activer l'IA cloud.",
};

const statusLabel = (status: GeminiKeyStatus | null): string => {
  if (!status || !status.configured) {
    return 'Gemini désactivé (clé manquante)';
  }

  if (!status.provider_enabled) {
    return 'Gemini configuré mais désactivé';
  }

  return 'Gemini opérationnel (clé sécurisée)';
};

export const SecureSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<GeminiKeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(initialMessage);
  const [tauriAvailable, setTauriAvailable] = useState(isTauriRuntimeAvailable());

  const maskedKey = useMemo(() => {
    if (!status?.masked_key) {
      return '•••• non configurée';
    }
    return status.masked_key;
  }, [status]);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const runtimeDetected = isTauriRuntimeAvailable();
    setTauriAvailable(runtimeDetected);

    const response = await getGeminiKeyStatus();

    if (hasSecureData(response)) {
      setStatus(response.data);
      setMessage({
        tone: response.data.configured ? 'success' : 'warning',
        text: statusLabel(response.data),
      });
    } else {
      setStatus(response.data ?? null);
      setMessage({
        tone: runtimeDetected ? 'danger' : 'warning',
        text: response.error ?? 'Impossible de récupérer le statut Gemini.',
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = apiKey.trim();

    if (trimmed.length < 16) {
      setMessage({
        tone: 'warning',
        text: 'La clé semble trop courte. Vérifiez et réessayez.',
      });
      return;
    }

    const runtimeDetected = isTauriRuntimeAvailable();
    setTauriAvailable(runtimeDetected);
    if (!runtimeDetected) {
      setMessage({
        tone: 'warning',
        text: 'Tauri backend indisponible : impossible de sécuriser la clé pour le moment.',
      });
      return;
    }

    setSaving(true);
    const response = await setGeminiApiKey(trimmed);
    setSaving(false);

    if (hasSecureData(response)) {
      setStatus(response.data);
      setApiKey('');
      setMessage({
        tone: 'success',
        text: 'Clé Gemini sécurisée mise à jour. Le provider est actif.',
      });
      await loadStatus();
    } else {
      setMessage({
        tone: 'danger',
        text:
          response.error ??
          "Impossible d'enregistrer la clé Gemini. Vérifiez la passphrase TITANE_SECRETS_PASSPHRASE.",
      });
    }
  };

  const maskedExample = useMemo(() => maskSecret('FAKE-KEY-1234-ABCDE'), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card>
        <header style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>Gemini API Key</h2>
          <p style={{ margin: '4px 0 0', color: '#8193a7' }}>
            Injection sécurisée via SecureSecretsEngine (AES-256-GCM + Argon2id)
          </p>
        </header>
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: tauriAvailable ? 'rgba(46, 125, 50, 0.12)' : 'rgba(244, 67, 54, 0.12)',
            color: tauriAvailable ? '#2e7d32' : '#c62828',
            fontSize: '0.85rem',
          }}
        >
          {tauriAvailable
            ? '✅ Backend Tauri détecté : SecureSecrets actif.'
            : '⚠️ Backend Tauri indisponible : opérations en lecture seule.'}
        </div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Spinner size="sm" />
            <span>Chargement de l'état sécurisé…</span>
          </div>
        ) : (
          <>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background:
                  message.tone === 'success'
                    ? 'rgba(76, 175, 80, 0.12)'
                    : message.tone === 'warning'
                    ? 'rgba(255, 193, 7, 0.12)'
                    : 'rgba(244, 67, 54, 0.12)',
                color:
                  message.tone === 'success'
                    ? '#2e7d32'
                    : message.tone === 'warning'
                    ? '#b28704'
                    : '#c62828',
              }}
            >
              {message.text}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#65768a' }}>Clé actuelle</span>
                <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{maskedKey}</span>
              </div>

              {status?.env_present && (
                <div style={{ fontSize: '0.85rem', color: '#b28704' }}>
                  ⚠️ Une valeur GEMINI_API_KEY est toujours présente dans le fichier .env. Elle sera purgée
                  automatiquement lors de la prochaine sauvegarde sécurisée.
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}
            >
              <Input
                label="Nouvelle clé Gemini"
                placeholder="AIza..."
                value={apiKey}
                onChange={event => setApiKey(event.target.value)}
                autoComplete="off"
                type="password"
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#65768a' }}>
                  Exemple masqué: <code>{maskedExample}</code>
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => void loadStatus()}
                    disabled={loading || saving}
                  >
                    Rafraîchir
                  </Button>
                  <Button type="submit" disabled={!apiKey.trim() || saving}>
                    {saving ? 'Sauvegarde…' : 'Enregistrer sécurisé'}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </Card>

      <Card>
        <header style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Guide TITANE∞</h2>
          <p style={{ margin: '4px 0 0', color: '#8193a7' }}>Checklist de configuration sécurisée</p>
        </header>
        <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Définir <code>TITANE_SECRETS_PASSPHRASE</code> dans l'environnement (avant lancement Tauri).</li>
          <li>Ouvrir cette page et coller la clé Gemini fournie par Google AI Studio.</li>
          <li>Valider pour stocker la clé avec chiffrement AES-256-GCM + Argon2id.</li>
          <li>Vérifier que l'état indique « Gemini opérationnel » et que la clé est masquée.</li>
          <li>Confirmer que <code>.env</code> ne contient plus la variable <code>GEMINI_API_KEY</code>.</li>
        </ol>
      </Card>
    </div>
  );
};

export default SecureSettings;
