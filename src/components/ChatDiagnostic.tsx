/**
 * TITANE∞ v16.2.2 — Chat IA Diagnostic Component
 * Test backend providers et affiche résultats
 */

import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: unknown;
}

export const ChatDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostic = async () => {
    setRunning(true);
    setResults([]);
    const newResults: DiagnosticResult[] = [];

    // Test 1: Providers Status
    try {
      const status = await invoke('chat_get_providers_status');
      newResults.push({
        test: '1. Providers Status',
        status: 'success',
        message: 'Providers récupérés',
        data: status
      });
    } catch (error) {
      newResults.push({
        test: '1. Providers Status',
        status: 'error',
        message: `Erreur: ${error}`
      });
    }
    setResults([...newResults]);

    // Test 2: Local Echo
    try {
      const response = await invoke('chat_send_message', {
        request: {
          message: 'Test diagnostic',
          provider: 'local',
          streaming: false
        }
      });
      newResults.push({
        test: '2. Local Echo',
        status: 'success',
        message: 'Local echo fonctionne',
        data: response
      });
    } catch (error) {
      newResults.push({
        test: '2. Local Echo',
        status: 'error',
        message: `Erreur: ${error}`
      });
    }
    setResults([...newResults]);

    // Test 3: Auto Provider
    try {
      const response = await invoke('chat_send_message', {
        request: {
          message: 'Test auto cascade',
          provider: 'auto',
          streaming: false
        }
      });
      newResults.push({
        test: '3. Auto Cascade',
        status: 'success',
        message: 'Auto cascade fonctionne',
        data: response
      });
    } catch (error) {
      newResults.push({
        test: '3. Auto Cascade',
        status: 'error',
        message: `Erreur: ${error}`
      });
    }
    setResults([...newResults]);

    setRunning(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#1e1e1e',
      color: '#fff',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <h2 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
        🔬 Chat IA Diagnostic
      </h2>

      <button
        onClick={runDiagnostic}
        disabled={running}
        style={{
          padding: '10px 20px',
          background: running ? '#555' : '#007acc',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: running ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          width: '100%',
          marginBottom: '15px'
        }}
      >
        {running ? '⏳ Tests en cours...' : '▶️ Lancer Diagnostic'}
      </button>

      {results.length > 0 && (
        <div>
          {results.map((result, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '15px',
                padding: '12px',
                background: result.status === 'success' ? '#1a3d1a' : '#3d1a1a',
                borderLeft: `4px solid ${result.status === 'success' ? '#4caf50' : '#f44336'}`,
                borderRadius: '4px'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {result.status === 'success' ? '✅' : '❌'} {result.test}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                {result.message}
              </div>
              {result.data && (
                <details style={{ marginTop: '8px', fontSize: '12px' }}>
                  <summary style={{ cursor: 'pointer', opacity: 0.7 }}>
                    Voir détails
                  </summary>
                  <pre style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: '#000',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
