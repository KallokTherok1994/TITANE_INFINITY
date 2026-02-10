/**
 * TITANE∞ OS - Section IA & APIs
 * Configuration Gemini et autres APIs
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { envFlag } from '@/config/featureFlags';
import { ControlPanelToggle } from '../components/ControlPanelToggle';

interface AIConfig {
  gemini_api_key: string;
  gemini_model: string;
  temperature: number;
  max_tokens: number;
}

const GEMINI_KEY_SENTINEL = '***MASKED***';
const EXTERNAL_AI_STORAGE_KEY = 'titane.enable_external_ai';

const DEFAULT_CONFIG: AIConfig = {
  gemini_api_key: '',
  gemini_model: 'gemini-pro',
  temperature: 0.7,
  max_tokens: 2048,
};

type RuntimeConfig = {
  secretsMode?: string;
  geminiConfigured?: boolean;
};

export const AISection: React.FC = () => {
  const [config, setConfig] = useState<AIConfig>(() => ({ ...DEFAULT_CONFIG }));
  const [persistedConfig, setPersistedConfig] = useState<
    Omit<AIConfig, 'gemini_api_key'>
  >({
    gemini_model: DEFAULT_CONFIG.gemini_model,
    temperature: DEFAULT_CONFIG.temperature,
    max_tokens: DEFAULT_CONFIG.max_tokens,
  });
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [externalAIRuntimeEnabled, setExternalAIRuntimeEnabled] = useState(false);
  const [externalAIToggleError, setExternalAIToggleError] = useState<string | null>(null);

  const isDev = import.meta.env.DEV;
  const buildAllowsExternalAI = useMemo(() => envFlag('VITE_ENABLE_EXTERNAL_AI'), []);
  const effectiveExternalAIEnabled =
    buildAllowsExternalAI && (isDev ? true : externalAIRuntimeEnabled);

  const runtimeConfig = useMemo<RuntimeConfig | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const global = (window as unknown as { __TITANE_RUNTIME_CONFIG__?: RuntimeConfig })
      .__TITANE_RUNTIME_CONFIG__;
    return global ?? null;
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      const aiConfig = (await tauriClient.cpGetAiConfig()) as AIConfig;
      const masked = aiConfig.gemini_api_key === GEMINI_KEY_SENTINEL;

      setHasStoredKey(masked || Boolean(runtimeConfig?.geminiConfigured));
      setPersistedConfig({
        gemini_model: aiConfig.gemini_model,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.max_tokens,
      });
      setConfig({
        gemini_api_key: '',
        gemini_model: aiConfig.gemini_model,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.max_tokens,
      });
      setError(null);
    } catch (err) {
      console.error('Erreur chargement config IA:', err);
      setError('Impossible de charger la configuration IA.');
    }
  }, [runtimeConfig]);

  useEffect(() => {
    if (runtimeConfig?.geminiConfigured) {
      setHasStoredKey(true);
    }
    void loadConfig();
  }, [loadConfig, runtimeConfig?.geminiConfigured]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      setExternalAIRuntimeEnabled(
        window.localStorage.getItem(EXTERNAL_AI_STORAGE_KEY) === '1'
      );
      setExternalAIToggleError(null);
    } catch {
      setExternalAIToggleError('Impossible d’accéder au stockage local (localStorage).');
    }
  }, []);

  const toggleExternalAI = useCallback(() => {
    if (!buildAllowsExternalAI) {
      setExternalAIToggleError(
        'External AI non autorisée par ce build (VITE_ENABLE_EXTERNAL_AI=1 requis).'
      );
      return;
    }

    try {
      if (typeof window === 'undefined') {
        return;
      }

      const next = !externalAIRuntimeEnabled;
      if (next) {
        window.localStorage.setItem(EXTERNAL_AI_STORAGE_KEY, '1');
      } else {
        window.localStorage.removeItem(EXTERNAL_AI_STORAGE_KEY);
      }

      setExternalAIRuntimeEnabled(next);
      setExternalAIToggleError(null);
    } catch {
      setExternalAIToggleError(
        'Impossible de modifier le stockage local (localStorage).'
      );
    }
  }, [buildAllowsExternalAI, externalAIRuntimeEnabled]);

  const reloadApp = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      window.location.reload();
    } catch {
      setExternalAIToggleError('Impossible de recharger l’application.');
    }
  }, []);

  const saveConfig = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      const trimmedKey = config.gemini_api_key.trim();
      const payload: AIConfig = {
        gemini_api_key:
          trimmedKey.length > 0 ? trimmedKey : hasStoredKey ? GEMINI_KEY_SENTINEL : '',
        gemini_model: config.gemini_model,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
      };

      await tauriClient.cpSetAiConfig({ config: payload });

      setHasStoredKey(payload.gemini_api_key !== '');
      setPersistedConfig({
        gemini_model: payload.gemini_model,
        temperature: payload.temperature,
        max_tokens: payload.max_tokens,
      });
      setConfig(current => ({ ...current, gemini_api_key: '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Erreur sauvegarde config:', err);
      setError("Impossible d'enregistrer la configuration.");
    } finally {
      setSaving(false);
    }
  }, [config, hasStoredKey]);

  const clearGeminiKey = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      await tauriClient.cpSetAiConfig({
        config: {
          gemini_api_key: '',
          gemini_model: config.gemini_model,
          temperature: config.temperature,
          max_tokens: config.max_tokens,
        },
      });

      setHasStoredKey(false);
      setPersistedConfig({
        gemini_model: config.gemini_model,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
      });
      setConfig(current => ({ ...current, gemini_api_key: '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Erreur suppression clé Gemini:', err);
      setError('Impossible de supprimer la clé Gemini.');
    } finally {
      setSaving(false);
    }
  }, [config]);

  const validationError = useMemo(() => {
    if (
      !Number.isFinite(config.temperature) ||
      config.temperature < 0 ||
      config.temperature > 1
    ) {
      return 'La température doit être comprise entre 0 et 1.';
    }
    if (
      !Number.isFinite(config.max_tokens) ||
      config.max_tokens < 64 ||
      config.max_tokens > 8192
    ) {
      return 'Les tokens doivent être compris entre 64 et 8192.';
    }
    return null;
  }, [config.temperature, config.max_tokens]);

  const hasChanges = useMemo(() => {
    if (config.gemini_api_key.trim().length > 0) {
      return true;
    }
    if (config.gemini_model !== persistedConfig.gemini_model) {
      return true;
    }
    if (Math.abs(config.temperature - persistedConfig.temperature) > Number.EPSILON) {
      return true;
    }
    if (config.max_tokens !== persistedConfig.max_tokens) {
      return true;
    }
    return false;
  }, [
    config.gemini_api_key,
    config.gemini_model,
    config.temperature,
    config.max_tokens,
    persistedConfig.gemini_model,
    persistedConfig.temperature,
    persistedConfig.max_tokens,
  ]);

  const saveDisabled = saving || Boolean(validationError) || !hasChanges;
  const showUnsavedChanges = hasChanges && !saving && !saved;

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">IA & APIs</h2>
        <div className="cp-section-actions">
          {hasStoredKey && (
            <button
              className="cp-button secondary"
              onClick={clearGeminiKey}
              disabled={saving}
            >
              🔐 Supprimer la clé
            </button>
          )}
          <button className="cp-button" onClick={saveConfig} disabled={saveDisabled}>
            {saved ? '✅ Sauvegardé' : saving ? '⏳ Enregistrement…' : '💾 Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Configuration Gemini</h3>
        <div className="cp-card-content">
          <div className="cp-input-group">
            <label className="cp-input-label">Clé API Gemini</label>
            <input
              type="password"
              className="cp-input"
              value={config.gemini_api_key}
              onChange={e => setConfig({ ...config, gemini_api_key: e.target.value })}
              placeholder={
                hasStoredKey
                  ? 'Clé stockée dans le coffre — saisir une nouvelle clé pour la remplacer'
                  : 'Entrez votre clé API'
              }
            />
            {hasStoredKey && (
              <p className="cp-helper-text">
                Une clé chiffrée est déjà présente dans le coffre.
              </p>
            )}
          </div>

          <div className="cp-input-group">
            <label className="cp-input-label">Modèle</label>
            <select
              className="cp-input"
              value={config.gemini_model}
              onChange={e => setConfig({ ...config, gemini_model: e.target.value })}
            >
              <option value="gemini-pro">Gemini Pro</option>
              <option value="gemini-pro-vision">Gemini Pro Vision</option>
            </select>
          </div>

          <div className="cp-input-group">
            <label className="cp-input-label">
              Température: {config.temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={config.temperature}
              onChange={e =>
                setConfig({ ...config, temperature: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="cp-input-group">
            <label className="cp-input-label">Tokens maximum</label>
            <input
              type="number"
              className="cp-input"
              min={64}
              max={8192}
              value={config.max_tokens}
              onChange={e => {
                const next = parseInt(e.target.value, 10);
                setConfig({
                  ...config,
                  max_tokens: Number.isFinite(next) ? next : 0,
                });
              }}
            />
          </div>

          {runtimeConfig && (
            <div className="cp-hint">
              <span role="img" aria-label="vault">
                🛡️
              </span>{' '}
              Secrets engine&nbsp;
              <strong>{String(runtimeConfig.secretsMode ?? 'unknown')}</strong> · Gemini
              configuré: <strong>{hasStoredKey ? 'oui' : 'non'}</strong>
            </div>
          )}

          {(validationError || error) && (
            <p className="cp-error">{validationError ?? error}</p>
          )}
          {showUnsavedChanges && !validationError && !error && (
            <p className="cp-helper-text">Modifications en attente de sauvegarde.</p>
          )}
        </div>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">External AI (opt-in)</h3>
        <div className="cp-card-content">
          <ControlPanelToggle
            checked={effectiveExternalAIEnabled}
            onChange={toggleExternalAI}
            title="Autoriser External AI (runtime)"
            description={
              buildAllowsExternalAI
                ? isDev
                  ? 'Ce build autorise External AI en dev (runtime implicitement autorisé).'
                  : 'Active/désactive le flag runtime. Un rechargement est nécessaire pour appliquer le changement.'
                : 'Désactivé par ce build (lancer avec VITE_ENABLE_EXTERNAL_AI=1).'
            }
            disabled={!buildAllowsExternalAI}
            icon="🌐"
          />
          {externalAIToggleError && <p className="cp-error">{externalAIToggleError}</p>}
          {!externalAIToggleError && buildAllowsExternalAI && (
            <p className="cp-helper-text">
              Clé localStorage: <strong>{EXTERNAL_AI_STORAGE_KEY}</strong>
            </p>
          )}
          {buildAllowsExternalAI && !isDev && (
            <button className="cp-button secondary" onClick={reloadApp}>
              🔄 Recharger maintenant
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
