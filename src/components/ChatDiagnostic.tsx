/**
 * TITANE∞ v19.2 — Chat IA Diagnostic Center
 * Nouvel espace de tests & audits intégrés au DevTools
 */

import React, { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { safeInvoke } from '@/utils/invoke';
import { getGeminiKeyStatus, hasSecureData } from '@/utils/secureSecrets';
import type { GeminiKeyStatus, SecureResponse } from '@/utils/secureSecrets';
import {
  isTauriRuntimeAvailable,
  tauriProtector,
} from '@/utils/tauriProtector';
import type { SingularityState } from '@/types/singularityState';

type DiagnosticStatus = 'success' | 'warning' | 'error' | 'info';

interface DiagnosticResult {
  id: string;
  title: string;
  status: DiagnosticStatus;
  message: string;
  data?: unknown;
  durationMs?: number;
}

interface DiagnosticTest {
  id: string;
  title: string;
  description: string;
  group: 'core' | 'secure' | 'audit' | 'insight';
  run: () => Promise<unknown>;
  successMessage: string;
  fallbackMessage: string;
  errorMessage?: string;
  transformData?: (response: unknown) => unknown;
  interpret?: (response: unknown, durationMs: number) => Omit<DiagnosticResult, 'id' | 'title'>;
}

interface ChatDiagnosticProps {
  variant?: 'overlay' | 'panel';
}

const hasFallbackFlag = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return Boolean((value as { fallback?: boolean }).fallback);
};

const statusTheme: Record<DiagnosticStatus, { background: string; border: string; icon: string }> = {
  success: {
    background: '#10281b',
    border: '#22c55e',
    icon: '✅',
  },
  warning: {
    background: '#322312',
    border: '#fbbf24',
    icon: '⚠️',
  },
  error: {
    background: '#341111',
    border: '#ef4444',
    icon: '❌',
  },
  info: {
    background: '#132538',
    border: '#38bdf8',
    icon: 'ℹ️',
  },
};

const TEST_GROUPS: Record<DiagnosticTest['group'], { title: string; description: string }> = {
  core: {
    title: 'Chat IA — Cœur Orchestrateur',
    description: 'Vérifie les providers, la cascade automatique et la boucle locale.',
  },
  secure: {
    title: 'Sécurité & Secrets',
    description: 'Valide SecureSecrets et la cohérence des accès chiffrés.',
  },
  audit: {
    title: 'Audits Système Rapides',
    description: 'Contrôles d’intégrité et auto-diagnostics backend.',
  },
  insight: {
    title: 'Insights Singularity & Meta',
    description: 'Snapshots légers des moteurs internes et configurations IA.',
  },
};

const buildDiagnosticResult = (
  test: DiagnosticTest,
  response: unknown,
  durationMs: number
): Omit<DiagnosticResult, 'id' | 'title'> => {
  if (response && hasFallbackFlag(response)) {
    return {
      status: 'warning',
      message: test.fallbackMessage,
      data: response,
      durationMs,
    };
  }

  if (response !== null && response !== undefined) {
    return {
      status: 'success',
      message: test.successMessage,
      data: response,
      durationMs,
    };
  }

  return {
    status: 'error',
    message: test.errorMessage ?? 'Backend indisponible ou commande rejetée.',
    durationMs,
  };
};

const formatDuration = (value?: number): string => {
  if (!value && value !== 0) {
    return '';
  }
  return `${Math.round(value)} ms`;
};

const trimData = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if ('message' in (data as Record<string, unknown>)) {
    const message = (data as { message?: { content?: string } }).message;
    if (message && typeof message.content === 'string') {
      return {
        ...data,
        message: {
          ...message,
          content: message.content.slice(0, 280),
        },
      };
    }
  }

  return data;
};

const diagnosticTests: DiagnosticTest[] = [
  {
    id: 'providers-status',
    title: 'Providers Status',
    description: 'Interroge la passerelle Tauri pour récupérer la disponibilité des providers IA.',
    group: 'core',
    run: () => safeInvoke<Record<string, unknown>>('chat_get_providers_status'),
    successMessage: 'Providers récupérés via le backend Tauri.',
    fallbackMessage: 'Backend indisponible — informations en mode fallback.',
    transformData: (response) => {
      if (!response || typeof response !== 'object') {
        return response;
      }
      const data = response as Record<string, unknown> & {
        providers?: Array<{ name: string; status: string }>;
      };
      return {
        providers: data.providers,
        summary: Object.keys(data),
      };
    },
  },
  {
    id: 'local-echo',
    title: 'Boucle Locale',
    description: 'Teste la réponse locale directe du moteur Chat (provider "local").',
    group: 'core',
    run: () =>
      safeInvoke<Record<string, unknown>>('chat_send_message', {
        request: {
          message: 'Diagnostic TITANE∞ — boucle locale',
          provider: 'local',
          streaming: false,
        },
      }),
    successMessage: 'Réponse locale reçue.',
    fallbackMessage: 'Fallback local sans backend Tauri actif.',
    transformData: trimData,
  },
  {
    id: 'auto-cascade',
    title: 'Cascade Automatique',
    description: "Vérifie la capacité du moteur à sélectionner automatiquement l'orchestrateur optimal.",
    group: 'core',
    run: () =>
      safeInvoke<Record<string, unknown>>('chat_send_message', {
        request: {
          message: 'Diagnostic TITANE∞ — auto cascade',
          provider: 'auto',
          streaming: false,
        },
      }),
    successMessage: 'Cascade automatique opérationnelle.',
    fallbackMessage: 'Mode automatique indisponible — fallback activé.',
    transformData: trimData,
  },
  {
    id: 'secure-secrets',
    title: 'SecureSecrets Status',
    description: 'Contrôle la présence de la clé Gemini et l’accès au coffre chiffré.',
    group: 'secure',
    run: () => getGeminiKeyStatus(),
    successMessage: 'SecureSecrets répond et expose un statut valide.',
    fallbackMessage: 'SecureSecrets en mode fallback (lecture locale).',
    interpret: (response, durationMs) => {
      const secureResponse = response as SecureResponse<GeminiKeyStatus> | null | undefined;

      if (hasSecureData<GeminiKeyStatus>(secureResponse)) {
        const data = secureResponse.data;
        return {
          status: 'success',
          message: data.masked_key
            ? `Clé sécurisée détectée (${data.masked_key})`
            : 'SecureSecrets actif mais aucune clé stockée.',
          data: {
            configured: data.configured,
            provider_enabled: data.provider_enabled,
            masked_key: data.masked_key,
            env_present: data.env_present,
          },
          durationMs,
        };
      }

      if (secureResponse && typeof secureResponse === 'object') {
        return {
          status: 'warning',
          message: secureResponse.error ?? 'SecureSecrets a répondu sans données exploitables.',
          data: secureResponse,
          durationMs,
        };
      }

      return {
        status: 'error',
        message: 'SecureSecrets inaccessible — vérifier la présence du backend.',
        durationMs,
      };
    },
  },
  {
    id: 'system-integrity',
    title: 'Audit Intégrité',
    description: "Exécute l'auto-contrôle 'check_system_integrity' (rust).",
    group: 'audit',
    run: () => safeInvoke<Record<string, unknown>>('check_system_integrity'),
    successMessage: 'Audit intégrité validé.',
    fallbackMessage: 'Audit en mode fallback — résultats à confirmer côté backend.',
    transformData: (response) => {
      if (!response || typeof response !== 'object') {
        return response;
      }
      const payload = response as { status?: string; issues?: unknown[] };
      return {
        status: payload.status,
        issues: payload.issues,
      };
    },
  },
  {
    id: 'singularity-snapshot',
    title: 'Snapshot Singularity',
    description: "Capture légère des métriques clés du SingularityState (cohérence, runtime).",
    group: 'insight',
    run: () => safeInvoke<SingularityState>('singularity_get_full_state'),
    successMessage: 'Snapshot Singularity récupéré.',
    fallbackMessage: 'Snapshot synthétique issu du mode fallback.',
    transformData: (response) => {
      if (!response || typeof response !== 'object') {
        return response;
      }
      const state = response as SingularityState;
      return {
        coherence: state.cognitive?.coherence,
        persona: state.symbolic?.persona.name,
        runtime: state.meta?.runtime,
        runtime_health: state.meta?.runtime_health,
      };
    },
  },
  {
    id: 'ai-config',
    title: 'Configuration IA',
    description: 'Récupère les paramètres de pilotage IA (cp_get_ai_config).',
    group: 'insight',
    run: () => safeInvoke<Record<string, unknown>>('cp_get_ai_config'),
    successMessage: 'Configuration IA récupérée.',
    fallbackMessage: 'Configuration IA en fallback — valeurs locales affichées.',
    transformData: (response) => {
      if (!response || typeof response !== 'object') {
        return response;
      }
      const payload = response as {
        active_provider?: string;
        temperature?: number;
        model?: string;
        providers?: unknown;
      };
      return {
        active_provider: payload.active_provider,
        temperature: payload.temperature,
        model: payload.model,
        providers_summary: payload.providers ? Object.keys(payload.providers as Record<string, unknown>) : [],
      };
    },
  },
];

const EXECUTION_ORDER = diagnosticTests.map((test) => test.id);

export const ChatDiagnostic: React.FC<ChatDiagnosticProps> = ({ variant = 'panel' }) => {
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({});
  const [runningAll, setRunningAll] = useState(false);
  const [runningIds, setRunningIds] = useState<string[]>([]);
  const [lastRun, setLastRun] = useState<number | null>(null);
  const [runtimeAvailable, setRuntimeAvailable] = useState(isTauriRuntimeAvailable());

  const testsByGroup = useMemo(() => {
    return diagnosticTests.reduce<Record<DiagnosticTest['group'], DiagnosticTest[]>>((acc, test) => {
      acc[test.group] = acc[test.group] ? [...acc[test.group], test] : [test];
      return acc;
    }, { core: [], secure: [], audit: [], insight: [] });
  }, []);

  const summary = useMemo(() => {
    const values = Object.values(results);
    return {
      total: values.length,
      success: values.filter((item) => item.status === 'success').length,
      warning: values.filter((item) => item.status === 'warning').length,
      error: values.filter((item) => item.status === 'error').length,
    };
  }, [results]);

  const executeTest = async (test: DiagnosticTest): Promise<DiagnosticResult> => {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    try {
      const rawResponse = await test.run();
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const durationMs = end - start;
      const payload = test.transformData ? test.transformData(rawResponse) : rawResponse;

      const interpreted = test.interpret
        ? test.interpret(payload, durationMs)
        : buildDiagnosticResult(test, payload, durationMs);

      return {
        id: test.id,
        title: test.title,
        ...interpreted,
      };
    } catch (error) {
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        id: test.id,
        title: test.title,
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
        durationMs: end - start,
      };
    }
  };

  const runAllTests = async () => {
    setRunningAll(true);
    setRunningIds([...EXECUTION_ORDER]);
    setResults({});

    for (const testId of EXECUTION_ORDER) {
      const test = diagnosticTests.find((item) => item.id === testId);
      if (!test) continue;
      const result = await executeTest(test);
      setResults((prev) => ({ ...prev, [test.id]: result }));
    }

    setRunningAll(false);
    setRunningIds([]);
    setLastRun(Date.now());
    setRuntimeAvailable(isTauriRuntimeAvailable());
  };

  const runSingleTest = async (test: DiagnosticTest) => {
    setRunningIds((prev) => (prev.includes(test.id) ? prev : [...prev, test.id]));
    const result = await executeTest(test);
    setResults((prev) => ({ ...prev, [test.id]: result }));
    setRunningIds((prev) => prev.filter((id) => id !== test.id));
    setLastRun(Date.now());
    setRuntimeAvailable(isTauriRuntimeAvailable());
  };

  const clearDiagnostics = () => {
    setResults({});
    setLastRun(null);
  };

  const onResetTauriCache = () => {
    tauriProtector.reset();
    setRuntimeAvailable(isTauriRuntimeAvailable());
  };

  const logDiagnostics = () => {
    console.group('[ChatDiagnostic] Résultats');
    console.table(
      Object.values(results).map((item) => ({
        id: item.id,
        statut: item.status,
        message: item.message,
        durée: formatDuration(item.durationMs),
      }))
    );
    console.groupEnd();
  };

  const isRunning = (id: string): boolean => runningAll || runningIds.includes(id);

  const containerStyle: CSSProperties = variant === 'overlay'
    ? {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#0f172a',
        color: '#e2e8f0',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '520px',
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 9999,
        boxShadow: '0 18px 60px rgba(15, 23, 42, 0.45)',
      }
    : {
        background: '#0b1016',
        border: '1px solid #1f2937',
        borderRadius: '16px',
        padding: '24px',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      };

  const headerActionsStyle: CSSProperties = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const actionButtonStyle = (primary = false): CSSProperties => ({
    padding: '10px 18px',
    borderRadius: '10px',
    border: primary ? '1px solid transparent' : '1px solid rgba(255,255,255,0.12)',
    background: primary ? '#2563eb' : 'rgba(15, 23, 42, 0.6)',
    color: '#f8fafc',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    opacity: primary && runningAll ? 0.7 : 1,
  });

  const badgeStyle = (status: DiagnosticStatus): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    padding: '4px 10px',
    borderRadius: '999px',
    border: `1px solid ${statusTheme[status].border}`,
    background: statusTheme[status].background,
  });

  const renderResult = (result: DiagnosticResult) => {
    const theme = statusTheme[result.status];
    return (
      <div
        style={{
          padding: '12px',
          borderRadius: '10px',
          background: theme.background,
          border: `1px solid ${theme.border}`,
          marginTop: '12px',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontWeight: 600 }}>
            {theme.icon} {result.message}
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{formatDuration(result.durationMs)}</span>
        </div>

        {typeof result.data !== 'undefined' && (
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', opacity: 0.7 }}>Voir détails</summary>
            <pre
              style={{
                marginTop: '8px',
                padding: '10px',
                background: '#020617',
                borderRadius: '8px',
                maxHeight: '220px',
                overflow: 'auto',
                fontSize: '0.75rem',
              }}
            >
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🔧 Centre Diagnostics IA</h3>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
            Lancez des tests ciblés sur la passerelle Chat IA, SecureSecrets et les moteurs internes.
          </p>
        </div>
        <div style={headerActionsStyle}>
          <button
            type="button"
            onClick={runAllTests}
            disabled={runningAll}
            style={actionButtonStyle(true)}
          >
            {runningAll ? '⏳ Diagnostic...' : '▶️ Lancer diagnostic complet'}
          </button>
          <button type="button" onClick={clearDiagnostics} style={actionButtonStyle()}>
            🧹 Effacer
          </button>
          <button type="button" onClick={logDiagnostics} style={actionButtonStyle()}>
            📤 Console
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        <div style={{
          background: 'rgba(15,23,42,0.7)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Runtime Tauri</span>
          <span style={{ fontWeight: 600 }}>
            {runtimeAvailable ? '✅ Actif' : '⚠️ Mode fallback'}
          </span>
          <button type="button" onClick={onResetTauriCache} style={{ ...actionButtonStyle(), width: '100%' }}>
            ♻️ Réinitialiser cache
          </button>
        </div>
        <div style={{
          background: 'rgba(15,23,42,0.7)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Dernier diagnostic</span>
          <span style={{ fontWeight: 600 }}>
            {lastRun ? new Date(lastRun).toLocaleTimeString() : 'Jamais'}
          </span>
        </div>
        <div style={{
          background: 'rgba(15,23,42,0.7)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Résultats</span>
          <span style={{ fontWeight: 600 }}>{summary.total} tests</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            <span style={badgeStyle('success')}>✓ {summary.success}</span>
            <span style={badgeStyle('warning')}>⚠️ {summary.warning}</span>
            <span style={badgeStyle('error')}>❌ {summary.error}</span>
          </div>
        </div>
      </div>

      {Object.entries(testsByGroup).map(([groupId, tests]) => (
        <section key={groupId}>
          <header style={{ marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>{TEST_GROUPS[groupId as DiagnosticTest['group']].title}</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', opacity: 0.7 }}>
              {TEST_GROUPS[groupId as DiagnosticTest['group']].description}
            </p>
          </header>

          <div
            style={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {tests.map((test) => {
              const result = results[test.id];
              return (
                <div
                  key={test.id}
                  style={{
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{test.title}</h5>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>{test.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => runSingleTest(test)}
                    disabled={isRunning(test.id)}
                    style={{
                      ...actionButtonStyle(true),
                      marginTop: '16px',
                      background: isRunning(test.id) ? '#1f2937' : '#1e40af',
                      border: 'none',
                    }}
                  >
                    {isRunning(test.id) ? '⏳ En cours...' : '▶️ Exécuter'}
                  </button>

                  {result && renderResult(result)}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
