/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIGURATION HUB - Unified Configuration Dashboard
 *   Phase 2: Configuration Management UI (Day 1-2: Read-Only)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ConfigSection, ConfigField } from '../components/config';
import './ModulePages.css';

interface RuntimeConfig {
  ollama_url: string;
  ollama_model: string;
  secrets_mode: string;
  gemini_configured: boolean;
  timestamp: number;
}

interface ChatEngineConfig {
  timeout_ms: number;
  chunk_size: number;
  max_tokens: number;
  temperature: number;
}

interface ConfigSnapshot {
  runtime: RuntimeConfig;
  chat_engine: ChatEngineConfig;
  timestamp: number;
  version: string;
}

type ConfigTab = 'system' | 'ai' | 'performance';

export const ConfigurationHub: React.FC = () => {
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ConfigTab>('system');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 [ConfigHub] Loading configuration snapshot...');
      const snapshot = await invoke<ConfigSnapshot>('get_all_configs');
      console.log('✅ [ConfigHub] Configuration loaded:', snapshot);
      setConfig(snapshot);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('❌ [ConfigHub] Failed to load configuration:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const tabStyle = (isActive: boolean) => ({
    padding: '0.75rem 1.5rem',
    background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.05)',
    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s ease',
  });

  if (loading && !config) {
    return (
      <div className="module-page">
        <div className="module-page__header">
          <h1 className="module-page__title">
            <span className="module-page__icon">🎯</span>
            Configuration Hub
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Chargement de la configuration...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-page">
        <div className="module-page__header">
          <h1 className="module-page__title">
            <span className="module-page__icon">🎯</span>
            Configuration Hub
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-error)' }}>❌</div>
          <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>
            Erreur de chargement de la configuration
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            {error}
          </div>
          <button
            onClick={loadConfig}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="module-page">
      {/* Header */}
      <div className="module-page__header">
        <div>
          <h1 className="module-page__title">
            <span className="module-page__icon">🎯</span>
            Configuration Hub
          </h1>
          <p className="module-page__subtitle">
            Visualisation complète de toutes les configurations système
          </p>
        </div>
        <button
          onClick={loadConfig}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading
              ? 'rgba(255, 255, 255, 0.1)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ Actualisation...' : '🔄 Actualiser'}
        </button>
      </div>

      {/* Version & Timestamp Info */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem 1.5rem',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Version: </span>
          <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{config.version}</span>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Dernière actualisation:{' '}
          </span>
          <span style={{ fontWeight: 600 }}>{lastRefresh.toLocaleTimeString('fr-FR')}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tabStyle(activeTab === 'system')} onClick={() => setActiveTab('system')}>
          💻 Système
        </button>
        <button style={tabStyle(activeTab === 'ai')} onClick={() => setActiveTab('ai')}>
          🤖 Intelligence Artificielle
        </button>
        <button style={tabStyle(activeTab === 'performance')} onClick={() => setActiveTab('performance')}>
          ⚡ Performance
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeTab === 'system' && (
          <>
            <ConfigSection
              title="Runtime Configuration"
              icon="⚙️"
              description="Configuration d'exécution du système"
              defaultOpen={true}
            >
              <ConfigField
                label="Ollama URL"
                value={config.runtime.ollama_url}
                description="Endpoint du serveur Ollama local"
                icon="🌐"
                valueType="url"
              />
              <ConfigField
                label="Ollama Model"
                value={config.runtime.ollama_model}
                description="Modèle LLM utilisé par défaut"
                icon="🧠"
              />
              <ConfigField
                label="Secrets Mode"
                value={config.runtime.secrets_mode}
                description="Mode de gestion des secrets (ephemeral/encrypted)"
                icon="🔐"
              />
              <ConfigField
                label="Gemini Configuré"
                value={config.runtime.gemini_configured}
                description="API Gemini active ou non"
                icon="✨"
                valueType="boolean"
              />
            </ConfigSection>
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <ConfigSection
              title="Chat Engine Configuration"
              icon="💬"
              description="Paramètres du moteur de chat IA"
              defaultOpen={true}
            >
              <ConfigField
                label="Timeout"
                value={config.chat_engine.timeout_ms}
                description="Délai maximum d'attente pour une réponse"
                icon="⏱️"
                valueType="duration"
              />
              <ConfigField
                label="Chunk Size"
                value={config.chat_engine.chunk_size}
                description="Taille des chunks de streaming"
                icon="📦"
                valueType="number"
              />
              <ConfigField
                label="Max Tokens"
                value={config.chat_engine.max_tokens}
                description="Nombre maximum de tokens par requête"
                icon="🎯"
                valueType="number"
              />
              <ConfigField
                label="Temperature"
                value={config.chat_engine.temperature}
                description="Créativité du modèle (0.0 = déterministe, 1.0 = créatif)"
                icon="🌡️"
                valueType="number"
              />
            </ConfigSection>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <ConfigSection
              title="Performance Metrics"
              icon="⚡"
              description="Indicateurs de performance système"
              defaultOpen={true}
            >
              <ConfigField
                label="Config Load Time"
                value={`${Date.now() - config.timestamp}ms`}
                description="Temps écoulé depuis le chargement de la config"
                icon="⏱️"
              />
              <ConfigField
                label="Streaming Enabled"
                value={config.chat_engine.chunk_size > 0}
                description="Mode streaming activé pour les réponses"
                icon="📡"
                valueType="boolean"
              />
              <ConfigField
                label="Timeout Configuré"
                value={config.chat_engine.timeout_ms > 0}
                description="Timeout défini pour éviter les blocages"
                icon="⏰"
                valueType="boolean"
              />
            </ConfigSection>
          </>
        )}
      </div>
    </div>
  );
};
