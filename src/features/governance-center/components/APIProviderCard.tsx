/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   API PROVIDER CARD — Configuration clés API
 *   Gemini | OpenAI | Anthropic | Ollama
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { GeminiKeyStatus, OllamaStatus } from '../types';

interface APIProviderCardProps {
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama';
  status: GeminiKeyStatus | OllamaStatus | null;
  onSetKey: (key: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const providerConfig = {
  gemini: {
    name: 'Google Gemini',
    icon: '🌐',
    color: 'blue',
    helpUrl: 'https://makersuite.google.com/app/apikey',
    description: 'Modèle: gemini-2.0-flash-exp',
    placeholder: 'AIza...',
  },
  openai: {
    name: 'OpenAI GPT',
    icon: '🤖',
    color: 'green',
    helpUrl: 'https://platform.openai.com/api-keys',
    description: 'Modèles: GPT-4o, GPT-4 Turbo',
    placeholder: 'sk-...',
  },
  anthropic: {
    name: 'Anthropic Claude',
    icon: '🧠',
    color: 'purple',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Modèles: Claude 3.5 Sonnet, Opus',
    placeholder: 'sk-ant-...',
  },
  ollama: {
    name: 'Ollama Local',
    icon: '🏠',
    color: 'amber',
    helpUrl: 'https://ollama.com/download',
    description: 'Modèles: Llama 3.1, Mistral, Qwen2.5, Phi3.5',
    placeholder: 'Aucune clé requise',
  },
};

export const APIProviderCard: React.FC<APIProviderCardProps> = ({
  provider,
  status,
  onSetKey,
  loading = false,
  error = null,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = providerConfig[provider];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSetKey(inputValue.trim());
      setInputValue('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Type guard
  const isGeminiStatus = (s: typeof status): s is GeminiKeyStatus => {
    return s !== null && 'configured' in s;
  };

  const isConfigured = isGeminiStatus(status) ? status.configured : false;
  const isEnabled = status?.provider_enabled || false;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 ${
        isEnabled
          ? `border-${config.color}-500/50 shadow-lg shadow-${config.color}-500/20`
          : 'border-gray-700/50 hover:border-gray-600/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700/50 bg-gray-800/50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="font-bold text-white">{config.name}</h3>
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
            isEnabled
              ? `bg-${config.color}-500/20 text-${config.color}-400`
              : 'bg-gray-700/50 text-gray-400'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Chargement...</span>
            </>
          ) : isEnabled ? (
            <>
              <CheckCircle className="h-3 w-3" />
              <span>Actif</span>
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              <span>Inactif</span>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {provider === 'ollama' ? (
          /* Ollama - No API key needed */
          <div className="space-y-3">
            <div
              className={`rounded-lg border p-3 ${
                isEnabled
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : 'border-gray-700/50 bg-gray-800/30'
              }`}
            >
              <p className="text-sm text-gray-300">
                {isEnabled ? (
                  <>
                    ✅ Ollama est opérationnel sur{' '}
                    <code className="text-amber-400">localhost:11434</code>
                  </>
                ) : (
                  <>
                    ⚠️ Ollama n&apos;est pas détecté. Assurez-vous qu&apos;il est installé
                    et lancé.
                  </>
                )}
              </p>
            </div>

            {!isEnabled && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Installation:</p>
                <code className="block rounded bg-gray-800/50 p-2 text-xs text-gray-300">
                  # Linux/Mac
                  <br />
                  curl -fsSL https://ollama.com/install.sh | sh
                  <br />
                  ollama serve
                </code>
              </div>
            )}

            <a
              href={config.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300"
            >
              📖 Documentation Ollama →
            </a>
          </div>
        ) : (
          /* API Key Input */
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Current Status */}
            {isConfigured && isGeminiStatus(status) && status.masked_key && (
              <div className="rounded-lg border border-gray-700/50 bg-gray-800/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-400" />
                    <code className="text-sm text-gray-300">{status.masked_key}</code>
                  </div>
                  {status.env_purged && (
                    <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                      🔒 Sécurisé
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={config.placeholder}
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-gray-800/50 px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 outline-none transition-colors ${
                  error
                    ? 'border-red-500/50 focus:border-red-500'
                    : `border-gray-700/50 focus:border-${config.color}-500`
                } disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isSubmitting}
              className={`w-full rounded-lg py-2.5 font-bold text-white transition-all ${
                isSubmitting
                  ? 'cursor-not-allowed bg-gray-700 opacity-50'
                  : `bg-${config.color}-600 hover:bg-${config.color}-700 active:scale-95`
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Configuration...
                </span>
              ) : isConfigured ? (
                'Mettre à jour la clé'
              ) : (
                'Configurer la clé API'
              )}
            </button>

            {/* Help Link */}
            <a
              href={config.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-xs text-${config.color}-400 hover:text-${config.color}-300`}
            >
              🔑 Obtenir une clé API →
            </a>
          </form>
        )}

        {/* Additional Info */}
        {isGeminiStatus(status) && status.env_present && !status.env_purged && (
          <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-xs text-yellow-400">
            ⚠️ Clé détectée dans .env - sera supprimée lors de la prochaine configuration
          </div>
        )}
      </div>
    </div>
  );
};
