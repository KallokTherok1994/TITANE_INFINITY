/**
 * 🌐 Google Cloud Services Tester - TITANE∞ v19.2.3+
 *
 * Composant pour tester les 22 services Google Cloud Gemini activés
 * Utilise la nouvelle commande Rust: test_gemini_services
 */

import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface GeminiServiceStatus {
  name: string;
  available: boolean;
  endpoint: string;
  error?: string;
}

interface GeminiFullStatus {
  coreApiAvailable: boolean;
  apiKeyConfigured: boolean;
  totalServices: number;
  servicesTested: GeminiServiceStatus[];
  globalLatencyMs: number;
}

export function GoogleCloudTester() {
  const [status, setStatus] = useState<GeminiFullStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await invoke<GeminiFullStatus>('test_gemini_services');
      setStatus(result);
      console.log('✅ Google Cloud Services Test:', result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Google Cloud Services Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const pingGemini = async () => {
    setLoading(true);
    setError(null);

    try {
      const latency = await invoke<number>('ping_gemini');
      console.log(`✅ Gemini ping: ${latency}ms`);
      alert(`✅ Gemini réponse en ${latency}ms`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Gemini ping failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-cloud-tester" style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>🌐 Google Cloud Services - Gemini API</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>
        Tester les 22 services Google Cloud activés pour Gemini
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={testServices}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ Testing...' : '🧪 Test All Services'}
        </button>

        <button
          onClick={pingGemini}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#34a853',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ Pinging...' : '📡 Ping Gemini'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '5px',
          marginBottom: '20px',
          color: '#c33',
        }}>
          <strong>❌ Erreur:</strong> {error}
        </div>
      )}

      {status && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}>
          <h3>📊 Résultats</h3>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>
                {status.coreApiAvailable ? '✅' : '❌'}
              </span>
              <div>
                <strong>Core API:</strong>{' '}
                {status.coreApiAvailable ? 'Disponible' : 'Indisponible'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>
                {status.apiKeyConfigured ? '🔑' : '⚠️'}
              </span>
              <div>
                <strong>API Key:</strong>{' '}
                {status.apiKeyConfigured ? 'Configurée' : 'Non configurée'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
              <div>
                <strong>Latence:</strong> {status.globalLatencyMs}ms
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>📊</span>
              <div>
                <strong>Services:</strong> {status.totalServices} total
              </div>
            </div>
          </div>

          <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Services testés:</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {status.servicesTested.map((service, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  backgroundColor: 'white',
                  border: `1px solid ${service.available ? '#4caf50' : '#ddd'}`,
                  borderRadius: '5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {service.available ? '✅' : '⚠️'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{service.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {service.endpoint}
                    </div>
                    {service.error && (
                      <div style={{ fontSize: '12px', color: '#f44336', marginTop: '5px' }}>
                        {service.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {status.servicesTested.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
              Aucun service testé pour l'instant
            </div>
          )}
        </div>
      )}

      {!status && !loading && !error && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          color: '#888',
        }}>
          Cliquez sur "Test All Services" pour commencer
        </div>
      )}
    </div>
  );
}

export default GoogleCloudTester;
