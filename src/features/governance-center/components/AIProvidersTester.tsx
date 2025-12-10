/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * AI PROVIDERS TESTER — Test et validation des API IA
 * Gemini, OpenAI, Anthropic avec métriques de performance
 */

import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, Zap, AlertCircle } from 'lucide-react';
import { safeInvoke } from '../../../utils/invoke';

interface ProviderTest {
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama';
  status: 'idle' | 'testing' | 'success' | 'error';
  latency?: number;
  response?: string;
  error?: string;
  timestamp?: number;
}

const TEST_PROMPT = 'Dis simplement "OK" si tu me comprends.';

export const AIProvidersTester: React.FC = () => {
  const [tests, setTests] = useState<Record<string, ProviderTest>>({
    gemini: { provider: 'gemini', status: 'idle' },
    openai: { provider: 'openai', status: 'idle' },
    anthropic: { provider: 'anthropic', status: 'idle' },
    ollama: { provider: 'ollama', status: 'idle' },
  });
  const [isTestingAll, setIsTestingAll] = useState(false);

  const testProvider = async (provider: 'gemini' | 'openai' | 'anthropic' | 'ollama') => {
    setTests(prev => ({
      ...prev,
      [provider]: { ...prev[provider], status: 'testing', error: undefined },
    }));

    const startTime = performance.now();

    try {
      const result = await safeInvoke('chat_send_message', {
        message: TEST_PROMPT,
        conversation_id: 'test-' + Date.now(),
        provider: provider === 'ollama' ? 'ollama' : undefined,
        model: undefined,
        streaming: false,
      });

      const latency = Math.round(performance.now() - startTime);

      if (result && typeof result === 'object' && 'success' in result && result.success) {
        const data = result as {
          message: { content: string; provider: string; model: string };
          success: boolean;
        };
        setTests(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            status: 'success',
            latency,
            response: data.message.content,
            timestamp: Date.now(),
          },
        }));
      } else {
        const errorData = result as { error?: string } | null;
        throw new Error(errorData?.error || 'Unknown error');
      }
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      setTests(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          status: 'error',
          latency,
          error: err instanceof Error ? err.message : String(err),
          timestamp: Date.now(),
        },
      }));
    }
  };

  const testAll = async () => {
    setIsTestingAll(true);
    const providers: Array<'gemini' | 'openai' | 'anthropic' | 'ollama'> = [
      'gemini',
      'openai',
      'anthropic',
      'ollama',
    ];

    for (const provider of providers) {
      await testProvider(provider);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTestingAll(false);
  };

  const getStatusIcon = (status: ProviderTest['status']) => {
    switch (status) {
      case 'testing':
        return <Clock className="h-5 w-5 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProviderTest['status']) => {
    switch (status) {
      case 'testing':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-gray-700/50 bg-gray-800/50';
    }
  };

  const providerConfig = {
    gemini: { name: 'Google Gemini', icon: '🌐', color: 'blue' },
    openai: { name: 'OpenAI GPT', icon: '🤖', color: 'green' },
    anthropic: { name: 'Anthropic Claude', icon: '🧠', color: 'purple' },
    ollama: { name: 'Ollama Local', icon: '🏠', color: 'amber' },
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Test des Providers IA</h2>
            <p className="text-sm text-gray-400">
              Validation et métriques de performance
            </p>
          </div>
        </div>

        <button
          onClick={testAll}
          disabled={isTestingAll}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-bold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-5 w-5" />
          {isTestingAll ? 'Test en cours...' : 'Tester tous les providers'}
        </button>
      </div>

      {/* Test Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(tests).map(([key, test]) => {
          const config = providerConfig[key as keyof typeof providerConfig];

          return (
            <div
              key={key}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${getStatusColor(test.status)}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-700/50 bg-gray-800/50 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{config.icon}</span>
                  <div>
                    <h3 className="font-bold text-white">{config.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {getStatusIcon(test.status)}
                      <span>
                        {test.status === 'idle' && 'Non testé'}
                        {test.status === 'testing' && 'Test en cours...'}
                        {test.status === 'success' && 'Opérationnel'}
                        {test.status === 'error' && 'Erreur'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => testProvider(test.provider)}
                  disabled={test.status === 'testing'}
                  className={`rounded-lg bg-${config.color}-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-${config.color}-700 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {test.status === 'testing' ? 'Test...' : 'Tester'}
                </button>
              </div>

              {/* Body */}
              <div className="space-y-3 p-4">
                {/* Metrics */}
                {test.latency !== undefined && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-900/50 p-3">
                    <span className="text-sm text-gray-400">Latence</span>
                    <span className="font-bold text-white">{test.latency}ms</span>
                  </div>
                )}

                {/* Response */}
                {test.response && (
                  <div className="rounded-lg bg-gray-900/50 p-3">
                    <div className="mb-1 text-xs font-bold uppercase text-gray-400">
                      Réponse
                    </div>
                    <div className="text-sm text-gray-300">{test.response}</div>
                  </div>
                )}

                {/* Error */}
                {test.error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <div className="mb-1 text-xs font-bold uppercase text-red-400">
                      Erreur
                    </div>
                    <div className="text-sm text-red-300">{test.error}</div>
                  </div>
                )}

                {/* Timestamp */}
                {test.timestamp && (
                  <div className="text-xs text-gray-500">
                    Testé le {new Date(test.timestamp).toLocaleString('fr-FR')}
                  </div>
                )}

                {/* Idle state */}
                {test.status === 'idle' && (
                  <div className="py-8 text-center text-sm text-gray-500">
                    Cliquez sur "Tester" pour vérifier ce provider
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
          <CheckCircle className="h-5 w-5 text-green-400" />
          Résumé des tests
        </h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gray-900/50 p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {Object.values(tests).filter(t => t.status === 'success').length}
            </div>
            <div className="text-sm text-gray-400">Opérationnels</div>
          </div>
          <div className="rounded-lg bg-gray-900/50 p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {Object.values(tests).filter(t => t.status === 'error').length}
            </div>
            <div className="text-sm text-gray-400">En erreur</div>
          </div>
          <div className="rounded-lg bg-gray-900/50 p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {Object.values(tests)
                .filter(t => t.latency)
                .reduce((sum, t) => sum + (t.latency || 0), 0) /
                Math.max(Object.values(tests).filter(t => t.latency).length, 1) || 0}
              ms
            </div>
            <div className="text-sm text-gray-400">Latence moyenne</div>
          </div>
          <div className="rounded-lg bg-gray-900/50 p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {Math.round(
                (Object.values(tests).filter(t => t.status === 'success').length /
                  Object.keys(tests).length) *
                  100
              )}
              %
            </div>
            <div className="text-sm text-gray-400">Taux de succès</div>
          </div>
        </div>
      </div>
    </div>
  );
};
