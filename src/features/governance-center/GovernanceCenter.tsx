/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   GOVERNANCE CENTER — Centre de contrôle IA
 *   Configuration globale des providers IA
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { Brain, Settings, Shield, Zap, TestTube } from 'lucide-react';
import { useGovernance } from './hooks/useGovernance';
import { APIProviderCard } from './components/APIProviderCard';
import { AIProvidersTester } from './components/AIProvidersTester';

export const GovernanceCenter: React.FC = () => {
  const [showTester, setShowTester] = useState(false);
  const {
    geminiStatus,
    openaiStatus,
    anthropicStatus,
    ollamaStatus,
    error,
    loadGeminiStatus,
    loadOpenAIStatus,
    loadAnthropicStatus,
    loadOllamaStatus,
    setGeminiKey,
    setOpenAIKey,
    setAnthropicKey,
  } = useGovernance();

  // Load statuses on mount
  useEffect(() => {
    Promise.all([
      loadGeminiStatus(),
      loadOpenAIStatus(),
      loadAnthropicStatus(),
      loadOllamaStatus(),
    ]);
  }, [loadGeminiStatus, loadOpenAIStatus, loadAnthropicStatus, loadOllamaStatus]);

  const handleSetGeminiKey = async (key: string) => {
    try {
      await setGeminiKey(key);
      console.log('✅ Clé Gemini configurée avec succès');
      await loadGeminiStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Erreur Gemini:', message);
      throw err;
    }
  };

  const handleSetOpenAIKey = async (key: string) => {
    try {
      await setOpenAIKey(key);
      console.log('✅ Clé OpenAI configurée avec succès');
      await loadOpenAIStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Erreur OpenAI:', message);
      throw err;
    }
  };

  const handleSetAnthropicKey = async (key: string) => {
    try {
      await setAnthropicKey(key);
      console.log('✅ Clé Anthropic configurée avec succès');
      await loadAnthropicStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Erreur Anthropic:', message);
      throw err;
    }
  };

  const activeProviders = [
    geminiStatus?.provider_enabled,
    openaiStatus?.provider_enabled,
    anthropicStatus?.provider_enabled,
    ollamaStatus?.provider_enabled,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-lg shadow-blue-500/25">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Centre de Gouvernance IA</h1>
              <p className="text-sm text-gray-400">
                Configuration des providers d'intelligence artificielle
              </p>
            </div>
          </div>

          {/* Stats Badge */}
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{activeProviders}/4</p>
                <p className="text-xs text-gray-400">Providers actifs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-bold text-red-400">Erreur système</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowTester(!showTester)}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-bold text-white transition-colors hover:bg-purple-700"
          >
            <TestTube className="h-5 w-5" />
            {showTester ? 'Masquer les tests' : 'Tester les providers'}
          </button>
        </div>

        {/* AI Providers Tester */}
        {showTester && <AIProvidersTester />}

        {/* Info Banner */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <Settings className="mt-0.5 h-5 w-5 text-blue-400" />
            <div className="space-y-1">
              <p className="font-bold text-blue-400">Cascade intelligente</p>
              <p className="text-sm text-blue-300">
                TITANE∞ bascule automatiquement entre les providers : OpenAI → Anthropic →
                Gemini → Ollama → Local
              </p>
              <p className="text-xs text-blue-300/70">
                Les clés API sont chiffrées avec AES-256-GCM et purgées des variables
                d'environnement
              </p>
            </div>
          </div>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <APIProviderCard
            provider="gemini"
            status={geminiStatus}
            onSetKey={handleSetGeminiKey}
            loading={false}
            error={null}
          />

          <APIProviderCard
            provider="openai"
            status={openaiStatus}
            onSetKey={handleSetOpenAIKey}
            loading={false}
            error={null}
          />

          <APIProviderCard
            provider="anthropic"
            status={anthropicStatus}
            onSetKey={handleSetAnthropicKey}
            loading={false}
            error={null}
          />

          <APIProviderCard
            provider="ollama"
            status={ollamaStatus}
            onSetKey={async () => {}}
            loading={false}
            error={null}
          />
        </div>

        {/* Footer Info */}
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Shield className="h-5 w-5 text-green-400" />
            Sécurité & Confidentialité
          </h3>
          <div className="grid gap-4 text-sm text-gray-300 md:grid-cols-3">
            <div>
              <p className="mb-1 font-semibold text-white">🔒 Chiffrement AES-256-GCM</p>
              <p className="text-xs text-gray-400">
                Toutes les clés API sont chiffrées avant stockage
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-white">🧹 Purge environnement</p>
              <p className="text-xs text-gray-400">
                Variables d'environnement nettoyées automatiquement
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-white">👁️ Affichage masqué</p>
              <p className="text-xs text-gray-400">
                Seuls les 4 derniers caractères affichés
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
