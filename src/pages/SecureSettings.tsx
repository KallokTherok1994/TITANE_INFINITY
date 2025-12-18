/**
 * TITANE_INFINITY v∞ — Secure Settings Page
 * Gestion sécurisée des API keys via SecureSecretsEngine
 */

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { Card, Button, Input, Spinner } from '../ui';
import {
  getGeminiKeyStatus,
  getOpenAIKeyStatus,
  getAnthropicKeyStatus,
  hasSecureData,
  maskSecret,
  setGeminiApiKey,
  setOpenAIApiKey,
  setAnthropicApiKey,
  type GeminiKeyStatus,
} from '@/utils/secureSecrets';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';

interface MessageState {
  tone: 'success' | 'warning' | 'danger';
  text: string;
}

const initialMessage: MessageState = {
  tone: 'warning',
  text: 'Aucune clé Gemini détectée. Configurez la clé sécurisée pour activer l&apos;IA cloud.',
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
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [status, setStatus] = useState<GeminiKeyStatus | null>(null);
  const [openaiStatus, setOpenaiStatus] = useState<GeminiKeyStatus | null>(null);
  const [anthropicStatus, setAnthropicStatus] = useState<GeminiKeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOpenai, setSavingOpenai] = useState(false);
  const [savingAnthropic, setSavingAnthropic] = useState(false);
  const [message, setMessage] = useState<MessageState>(initialMessage);
  const [openaiMessage, setOpenaiMessage] = useState<MessageState>({
    tone: 'warning',
    text: 'Aucune clé OpenAI détectée. Configurez pour activer GPT-4, o1, etc.',
  });
  const [anthropicMessage, setAnthropicMessage] = useState<MessageState>({
    tone: 'warning',
    text: 'Aucune clé Anthropic détectée. Configurez pour activer Claude.',
  });
  const [tauriAvailable, setTauriAvailable] = useState(isTauriRuntimeAvailable());

  const maskedKey = useMemo(() => {
    if (!status?.masked_key) {
      return '•••• non configurée';
    }
    return status.masked_key;
  }, [status]);

  const maskedOpenaiKey = useMemo(() => {
    if (!openaiStatus?.masked_key) {
      return '•••• non configurée';
    }
    return openaiStatus.masked_key;
  }, [openaiStatus]);

  const maskedAnthropicKey = useMemo(() => {
    if (!anthropicStatus?.masked_key) {
      return '•••• non configurée';
    }
    return anthropicStatus.masked_key;
  }, [anthropicStatus]);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const runtimeDetected = isTauriRuntimeAvailable();
    setTauriAvailable(runtimeDetected);

    // Load Gemini status
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

    // Load OpenAI status
    const openaiResponse = await getOpenAIKeyStatus();
    if (hasSecureData(openaiResponse)) {
      setOpenaiStatus(openaiResponse.data);
      setOpenaiMessage({
        tone: openaiResponse.data.configured ? 'success' : 'warning',
        text: openaiResponse.data.configured
          ? 'OpenAI opérationnel (clé sécurisée)'
          : 'Aucune clé OpenAI configurée',
      });
    } else {
      setOpenaiStatus(openaiResponse.data ?? null);
      setOpenaiMessage({
        tone: 'danger',
        text: openaiResponse.error ?? 'Impossible de récupérer le statut OpenAI.',
      });
    }

    // Load Anthropic status
    const anthropicResponse = await getAnthropicKeyStatus();
    if (hasSecureData(anthropicResponse)) {
      setAnthropicStatus(anthropicResponse.data);
      setAnthropicMessage({
        tone: anthropicResponse.data.configured ? 'success' : 'warning',
        text: anthropicResponse.data.configured
          ? 'Anthropic opérationnel (clé sécurisée)'
          : 'Aucune clé Anthropic configurée',
      });
    } else {
      setAnthropicStatus(anthropicResponse.data ?? null);
      setAnthropicMessage({
        tone: 'danger',
        text: anthropicResponse.error ?? 'Impossible de récupérer le statut Anthropic.',
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
          'Impossible d&apos;enregistrer la clé Gemini. Vérifiez la passphrase TITANE_SECRETS_PASSPHRASE.',
      });
    }
  };

  const handleOpenAISubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = openaiKey.trim();

    if (trimmed.length < 16) {
      setOpenaiMessage({
        tone: 'warning',
        text: 'La clé OpenAI semble trop courte. Vérifiez et réessayez.',
      });
      return;
    }

    const runtimeDetected = isTauriRuntimeAvailable();
    if (!runtimeDetected) {
      setOpenaiMessage({
        tone: 'warning',
        text: 'Tauri backend indisponible : impossible de sécuriser la clé.',
      });
      return;
    }

    setSavingOpenai(true);
    const response = await setOpenAIApiKey(trimmed);
    setSavingOpenai(false);

    if (hasSecureData(response)) {
      setOpenaiStatus(response.data);
      setOpenaiKey('');
      setOpenaiMessage({
        tone: 'success',
        text: 'Clé OpenAI sécurisée mise à jour. GPT-4, o1 activés.',
      });
      await loadStatus();
    } else {
      setOpenaiMessage({
        tone: 'danger',
        text:
          response.error ??
          'Impossible d&apos;enregistrer la clé OpenAI. Vérifiez la passphrase.',
      });
    }
  };

  const handleAnthropicSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = anthropicKey.trim();

    if (trimmed.length < 16) {
      setAnthropicMessage({
        tone: 'warning',
        text: 'La clé Anthropic semble trop courte. Vérifiez et réessayez.',
      });
      return;
    }

    const runtimeDetected = isTauriRuntimeAvailable();
    if (!runtimeDetected) {
      setAnthropicMessage({
        tone: 'warning',
        text: 'Tauri backend indisponible : impossible de sécuriser la clé.',
      });
      return;
    }

    setSavingAnthropic(true);
    const response = await setAnthropicApiKey(trimmed);
    setSavingAnthropic(false);

    if (hasSecureData(response)) {
      setAnthropicStatus(response.data);
      setAnthropicKey('');
      setAnthropicMessage({
        tone: 'success',
        text: 'Clé Anthropic sécurisée mise à jour. Claude 3.5 activé.',
      });
      await loadStatus();
    } else {
      setAnthropicMessage({
        tone: 'danger',
        text:
          response.error ??
          'Impossible d&apos;enregistrer la clé Anthropic. Vérifiez la passphrase.',
      });
    }
  };

  const maskedExample = useMemo(() => maskSecret('FAKE-KEY-1234-ABCDE'), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card>
        <header style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>
            Gemini API Key
          </h2>
          <p style={{ margin: '4px 0 0', color: '#8193a7' }}>
            Injection sécurisée via SecureSecretsEngine (AES-256-GCM + Argon2id)
          </p>
        </header>
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: tauriAvailable
              ? 'rgba(46, 125, 50, 0.12)'
              : 'rgba(244, 67, 54, 0.12)',
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
            <span>Chargement de l&apos;état sécurisé…</span>
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

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#65768a' }}>
                  Clé actuelle
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                  {maskedKey}
                </span>
              </div>

              {status?.env_present && (
                <div style={{ fontSize: '0.85rem', color: '#b28704' }}>
                  ⚠️ Une valeur GEMINI_API_KEY est toujours présente dans le fichier .env.
                  Elle sera purgée automatiquement lors de la prochaine sauvegarde
                  sécurisée.
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '24px',
              }}
            >
              <Input
                label="Nouvelle clé Gemini"
                placeholder="AIza..."
                value={apiKey}
                onChange={event => setApiKey(event.target.value)}
                autoComplete="off"
                type="password"
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
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

      {/* OpenAI API Key Card */}
      <Card>
        <header style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>
            OpenAI API Key
          </h2>
          <p style={{ margin: '4px 0 0', color: '#8193a7' }}>
            GPT-4o, GPT-4, o1, GPT-3.5 - Injection sécurisée via SecureSecretsEngine
          </p>
        </header>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Spinner size="sm" />
            <span>Chargement...</span>
          </div>
        ) : (
          <>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background:
                  openaiMessage.tone === 'success'
                    ? 'rgba(76, 175, 80, 0.12)'
                    : openaiMessage.tone === 'warning'
                      ? 'rgba(255, 193, 7, 0.12)'
                      : 'rgba(244, 67, 54, 0.12)',
                color:
                  openaiMessage.tone === 'success'
                    ? '#2e7d32'
                    : openaiMessage.tone === 'warning'
                      ? '#b28704'
                      : '#c62828',
              }}
            >
              {openaiMessage.text}
            </div>

            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: '#65768a' }}>Clé actuelle</span>
              <div
                style={{ fontFamily: 'monospace', fontSize: '1rem', marginTop: '4px' }}
              >
                {maskedOpenaiKey}
              </div>
            </div>

            <form
              onSubmit={handleOpenAISubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '24px',
              }}
            >
              <Input
                label="Nouvelle clé OpenAI"
                placeholder="sk-..."
                value={openaiKey}
                onChange={event => setOpenaiKey(event.target.value)}
                autoComplete="off"
                type="password"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button type="submit" disabled={!openaiKey.trim() || savingOpenai}>
                  {savingOpenai ? 'Sauvegarde…' : 'Enregistrer sécurisé'}
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>

      {/* Anthropic API Key Card */}
      <Card>
        <header style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>
            Anthropic API Key
          </h2>
          <p style={{ margin: '4px 0 0', color: '#8193a7' }}>
            Claude 3.5 Sonnet/Haiku, Claude 3 Opus - Injection sécurisée
          </p>
        </header>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Spinner size="sm" />
            <span>Chargement...</span>
          </div>
        ) : (
          <>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background:
                  anthropicMessage.tone === 'success'
                    ? 'rgba(76, 175, 80, 0.12)'
                    : anthropicMessage.tone === 'warning'
                      ? 'rgba(255, 193, 7, 0.12)'
                      : 'rgba(244, 67, 54, 0.12)',
                color:
                  anthropicMessage.tone === 'success'
                    ? '#2e7d32'
                    : anthropicMessage.tone === 'warning'
                      ? '#b28704'
                      : '#c62828',
              }}
            >
              {anthropicMessage.text}
            </div>

            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: '#65768a' }}>Clé actuelle</span>
              <div
                style={{ fontFamily: 'monospace', fontSize: '1rem', marginTop: '4px' }}
              >
                {maskedAnthropicKey}
              </div>
            </div>

            <form
              onSubmit={handleAnthropicSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '24px',
              }}
            >
              <Input
                label="Nouvelle clé Anthropic"
                placeholder="sk-ant-..."
                value={anthropicKey}
                onChange={event => setAnthropicKey(event.target.value)}
                autoComplete="off"
                type="password"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button type="submit" disabled={!anthropicKey.trim() || savingAnthropic}>
                  {savingAnthropic ? 'Sauvegarde…' : 'Enregistrer sécurisé'}
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>

      <Card>
        <header style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            Guide TITANE∞
          </h2>
          <p style={{ margin: '4px 0 0', color: '#8193a7' }}>
            Checklist de configuration sécurisée
          </p>
        </header>
        <ol
          style={{
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <li>
            Définir <code>TITANE_SECRETS_PASSPHRASE</code> dans l&apos;environnement
            (avant lancement Tauri).
          </li>
          <li>Ouvrir cette page et coller la clé Gemini fournie par Google AI Studio.</li>
          <li>Valider pour stocker la clé avec chiffrement AES-256-GCM + Argon2id.</li>
          <li>
            Vérifier que l&apos;état indique « Gemini opérationnel » et que la clé est
            masquée.
          </li>
          <li>
            Confirmer que <code>.env</code> ne contient plus la variable{' '}
            <code>GEMINI_API_KEY</code>.
          </li>
        </ol>
      </Card>
    </div>
  );
};

export default SecureSettings;
