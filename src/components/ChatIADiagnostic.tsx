/**
 * TITANE∞ v16.2.2 — Diagnostic Chat IA Automatique
 * Composant de test backend en temps réel
 */

import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  data?: unknown;
  error?: string;
  duration?: number;
}

export const ChatIADiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults((prev) => [...prev, result]);
  };

  const updateResult = (index: number, updates: Partial<DiagnosticResult>) => {
    setResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  const runAllTests = async () => {
    setRunning(true);
    setResults([]);

    // TEST 1: Providers Status
    const test1Index = results.length;
    addResult({ test: 'Providers Status', status: 'pending' });
    try {
      const start = Date.now();
      const status = await invoke('chat_get_providers_status');
      updateResult(test1Index, {
        status: 'success',
        data: status,
        duration: Date.now() - start,
      });
    } catch (error) {
      updateResult(test1Index, {
        status: 'error',
        error: String(error),
      });
    }

    // TEST 2: Local Echo
    const test2Index = results.length;
    addResult({ test: 'Local Echo (provider: local)', status: 'pending' });
    try {
      const start = Date.now();
      const response = await invoke('chat_send_message', {
        request: {
          message: 'Test diagnostic local',
          provider: 'local',
          streaming: false,
        },
      });
      updateResult(test2Index, {
        status: 'success',
        data: response,
        duration: Date.now() - start,
      });
    } catch (error) {
      updateResult(test2Index, {
        status: 'error',
        error: String(error),
      });
    }

    // TEST 3: Auto Cascade
    const test3Index = results.length;
    addResult({ test: 'Auto Cascade (provider: auto)', status: 'pending' });
    try {
      const start = Date.now();
      const response = await invoke('chat_send_message', {
        request: {
          message: 'Test cascade automatique',
          provider: 'auto',
          streaming: false,
        },
      });
      updateResult(test3Index, {
        status: 'success',
        data: response,
        duration: Date.now() - start,
      });
    } catch (error) {
      updateResult(test3Index, {
        status: 'error',
        error: String(error),
      });
    }

    // TEST 4: Gemini (devrait échouer normalement)
    const test4Index = results.length;
    addResult({ test: 'Gemini Provider (expected fail)', status: 'pending' });
    try {
      const start = Date.now();
      const response = await invoke('chat_send_message', {
        request: {
          message: 'Test Gemini',
          provider: 'gemini',
          streaming: false,
        },
      });
      updateResult(test4Index, {
        status: 'success',
        data: response,
        duration: Date.now() - start,
      });
    } catch (error) {
      updateResult(test4Index, {
        status: 'error',
        error: String(error),
      });
    }

    setRunning(false);
  };

  return (
    <div className="chat-diagnostic-panel" style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🧪 Diagnostic Chat IA Backend</h2>
        <button
          onClick={runAllTests}
          disabled={running}
          style={{
            ...styles.button,
            opacity: running ? 0.5 : 1,
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running ? '⏳ Tests en cours...' : '▶️ Lancer Tests'}
        </button>
      </div>

      <div style={styles.results}>
        {results.length === 0 && !running && (
          <div style={styles.empty}>
            Cliquer sur "Lancer Tests" pour diagnostiquer le backend Chat IA
          </div>
        )}

        {results.map((result, index) => (
          <div key={index} style={styles.resultItem}>
            <div style={styles.resultHeader}>
              <span style={styles.resultStatus}>
                {result.status === 'pending' && '⏳'}
                {result.status === 'success' && '✅'}
                {result.status === 'error' && '❌'}
              </span>
              <span style={styles.resultTest}>{result.test}</span>
              {result.duration && (
                <span style={styles.resultDuration}>{result.duration}ms</span>
              )}
            </div>

            {result.status === 'success' && result.data && (
              <pre style={styles.resultData}>
                {JSON.stringify(result.data, null, 2) as unknown as React.ReactNode}
              </pre>
            )}

            {result.status === 'error' && result.error && (
              <div style={styles.resultError}>{result.error}</div>
            )}
          </div>
        ))}
      </div>

      {results.length > 0 && !running && (
        <div style={styles.summary}>
          <h3 style={styles.summaryTitle}>📊 Résumé</h3>
          <div style={styles.summaryStats}>
            <div>
              ✅ Réussis:{' '}
              {results.filter((r) => r.status === 'success').length}
            </div>
            <div>
              ❌ Échoués: {results.filter((r) => r.status === 'error').length}
            </div>
            <div>
              ⏱️ Durée totale:{' '}
              {results.reduce((sum, r) => sum + (r.duration || 0), 0)}ms
            </div>
          </div>

          {results.every((r) => r.status === 'success') && (
            <div style={styles.successMessage}>
              🎉 Backend Chat IA fonctionne parfaitement ! Si l'UI ne répond
              pas, le problème est dans le frontend React (useChat → MessageList).
            </div>
          )}

          {results.some((r) => r.status === 'error') && (
            <div style={styles.errorMessage}>
              ⚠️ Erreurs détectées. Consulter DIAGNOSTIC_CHAT_IA_v16.2.2.md
              pour troubleshooting.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    fontFamily: 'monospace',
    color: '#fff',
    maxWidth: '900px',
    margin: '20px auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#0066ff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
    fontSize: '14px',
  },
  resultItem: {
    padding: '16px',
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
    border: '1px solid #3a3a3a',
  },
  resultHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  resultStatus: {
    fontSize: '18px',
  },
  resultTest: {
    fontSize: '14px',
    fontWeight: 'bold',
    flex: 1,
  },
  resultDuration: {
    fontSize: '12px',
    color: '#888',
  },
  resultData: {
    margin: '8px 0 0 0',
    padding: '12px',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '200px',
  },
  resultError: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#3a1a1a',
    borderRadius: '4px',
    color: '#ff6666',
    fontSize: '12px',
  },
  summary: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
  },
  summaryTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
  },
  summaryStats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '12px',
    fontSize: '14px',
  },
  successMessage: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#1a3a1a',
    borderRadius: '4px',
    color: '#66ff66',
    fontSize: '13px',
  },
  errorMessage: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#3a1a1a',
    borderRadius: '4px',
    color: '#ff6666',
    fontSize: '13px',
  },
};

export default ChatIADiagnostic;
