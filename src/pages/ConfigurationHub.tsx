/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIGURATION HUB v2 - Unified Configuration Dashboard with EDIT MODE
 *   Phase 2: Configuration Management UI (Day 3-4: Edit Mode)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { secureInvoke } from '@/lib/security';
import { ConfigSection, ConfigFieldEditable } from '../components/config';
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

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedRuntime, setEditedRuntime] = useState<Partial<RuntimeConfig>>({});
  const [editedChatEngine, setEditedChatEngine] = useState<Partial<ChatEngineConfig>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Presets state
  const [presets, setPresets] = useState<Array<{ name: string; description: string }>>(
    []
  );
  const [_showPresetDialog, _setShowPresetDialog] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 [ConfigHub] Loading configuration snapshot...');
      const snapshot = await invoke<ConfigSnapshot>('get_all_configs');
      console.log('✅ [ConfigHub] Configuration loaded:', snapshot);
      setConfig(snapshot);
      setLastRefresh(new Date());
      // Reset edit state when reloading
      setEditedRuntime({});
      setEditedChatEngine({});
      setValidationErrors({});
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

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset changes
      setEditedRuntime({});
      setEditedChatEngine({});
      setValidationErrors({});
    }
    setEditMode(!editMode);
  };

  const handleRuntimeFieldChange = (
    field: keyof RuntimeConfig,
    value: string | number | boolean
  ) => {
    setEditedRuntime(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`runtime.${field}`];
      return newErrors;
    });
  };

  const handleChatEngineFieldChange = (
    field: keyof ChatEngineConfig,
    value: string | number | boolean
  ) => {
    setEditedChatEngine(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`chat_engine.${field}`];
      return newErrors;
    });
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setValidationErrors({});

    try {
      console.log('💾 [ConfigHub] Saving configuration...');

      // Save runtime config if changed
      if (Object.keys(editedRuntime).length > 0) {
        console.log('📤 [ConfigHub] Updating runtime config:', editedRuntime);
        await secureInvoke('update_runtime_config', {
          update: {
            ollama_url: editedRuntime.ollama_url,
            ollama_model: editedRuntime.ollama_model,
          },
        });
        console.log('✅ [ConfigHub] Runtime config updated');
      }

      // Save chat engine config if changed
      if (Object.keys(editedChatEngine).length > 0) {
        console.log('📤 [ConfigHub] Updating chat engine config:', editedChatEngine);
        await secureInvoke('update_chat_engine_config', {
          update: editedChatEngine,
        });
        console.log('✅ [ConfigHub] Chat engine config updated');
      }

      // Reload config after successful save
      await loadConfig();
      setEditMode(false);
      console.log('✅ [ConfigHub] Configuration saved successfully');
    } catch (err) {
      console.error('❌ [ConfigHub] Failed to save configuration:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);

      // Try to parse validation errors from backend
      // Format: "field: error message"
      if (errorMsg.includes('URL Ollama')) {
        setValidationErrors({ 'runtime.ollama_url': errorMsg });
      } else if (errorMsg.includes('modèle')) {
        setValidationErrors({ 'runtime.ollama_model': errorMsg });
      } else if (errorMsg.includes('Timeout')) {
        setValidationErrors({ 'chat_engine.timeout_ms': errorMsg });
      } else if (errorMsg.includes('Chunk size')) {
        setValidationErrors({ 'chat_engine.chunk_size': errorMsg });
      } else if (errorMsg.includes('Max tokens')) {
        setValidationErrors({ 'chat_engine.max_tokens': errorMsg });
      } else if (errorMsg.includes('Temperature')) {
        setValidationErrors({ 'chat_engine.temperature': errorMsg });
      } else {
        setError(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const filename = `config-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      console.log('📤 [ConfigHub] Exporting configuration to:', filename);

      const filePath = await invoke<string>('export_config', { filename });
      console.log('✅ [ConfigHub] Configuration exported to:', filePath);

      alert(`✅ Configuration exportée vers:\n${filePath}`);
    } catch (err) {
      console.error('❌ [ConfigHub] Failed to export configuration:', err);
      alert(`❌ Échec de l'export: ${err}`);
    }
  };

  const handleImport = async () => {
    // For now, we'll use a prompt to get the file path
    // In a real app, you'd use a file picker dialog
    const filePath = prompt('Entrez le chemin du fichier JSON à importer:');

    if (!filePath) {
      return;
    }

    try {
      console.log('📥 [ConfigHub] Importing configuration from:', filePath);

      const importedConfig = await invoke<ConfigSnapshot>('import_config', { filePath });
      console.log('✅ [ConfigHub] Configuration imported:', importedConfig);

      // Reload config to show imported values
      await loadConfig();

      alert('✅ Configuration importée avec succès!');
    } catch (err) {
      console.error('❌ [ConfigHub] Failed to import configuration:', err);
      alert(`❌ Échec de l'import: ${err}`);
    }
  };

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const presetsList =
        await invoke<Array<{ name: string; description: string }>>('list_config_presets');
      setPresets(presetsList);
    } catch (err) {
      console.error('❌ [ConfigHub] Failed to load presets:', err);
    }
  };

  const handleSavePreset = async () => {
    const name = prompt('Nom du preset:');
    if (!name) return;

    const description = prompt('Description (optionnel):') || '';

    try {
      await secureInvoke('save_config_preset', { name, description });
      alert(`✅ Preset "${name}" sauvegardé!`);
      await loadPresets();
    } catch (err) {
      console.error('❌ [ConfigHub] Failed to save preset:', err);
      alert(`❌ Échec de sauvegarde: ${err}`);
    }
  };

  const handleLoadPreset = async (name: string) => {
    if (
      !confirm(`Charger le preset "${name}"?\nCela remplacera la configuration actuelle.`)
    ) {
      return;
    }

    try {
      await secureInvoke('load_config_preset', { name });
      await loadConfig();
      alert(`✅ Preset "${name}" chargé!`);
    } catch (err) {
      console.error('❌ [ConfigHub] Failed to load preset:', err);
      alert(`❌ Échec de chargement: ${err}`);
    }
  };

  const _handleDeletePreset = async (name: string) => {
    if (!confirm(`Supprimer le preset "${name}"?\nCette action est irréversible.`)) {
      return;
    }

    try {
      await secureInvoke('delete_config_preset', { name });
      alert(`✅ Preset "${name}" supprimé!`);
      await loadPresets();
    } catch (err) {
      console.error('❌ [ConfigHub] Failed to delete preset:', err);
      alert(`❌ Échec de suppression: ${err}`);
    }
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '0.75rem 1.5rem',
    background: isActive
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255,255,255,0.05)',
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
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Chargement de la configuration...</div>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="module-page">
        <div className="module-page__header">
          <h1 className="module-page__title">
            <span className="module-page__icon">🎯</span>
            Configuration Hub
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: 'var(--color-error)',
            }}
          >
            ❌
          </div>
          <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>
            Erreur de chargement de la configuration
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '2rem',
            }}
          >
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

  // Get current values (edited or original)
  const currentRuntime = {
    ollama_url: editedRuntime.ollama_url ?? config.runtime.ollama_url,
    ollama_model: editedRuntime.ollama_model ?? config.runtime.ollama_model,
    secrets_mode: config.runtime.secrets_mode, // Not editable
    gemini_configured: config.runtime.gemini_configured, // Not editable
  };

  const currentChatEngine = {
    timeout_ms: editedChatEngine.timeout_ms ?? config.chat_engine.timeout_ms,
    chunk_size: editedChatEngine.chunk_size ?? config.chat_engine.chunk_size,
    max_tokens: editedChatEngine.max_tokens ?? config.chat_engine.max_tokens,
    temperature: editedChatEngine.temperature ?? config.chat_engine.temperature,
  };

  const hasChanges =
    Object.keys(editedRuntime).length > 0 || Object.keys(editedChatEngine).length > 0;

  return (
    <div className="module-page">
      {/* Header */}
      <div className="module-page__header">
        <div>
          <h1 className="module-page__title">
            <span className="module-page__icon">🎯</span>
            Configuration Hub
            {editMode && (
              <span
                style={{
                  marginLeft: '1rem',
                  fontSize: '0.8rem',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: '6px',
                  color: '#667eea',
                }}
              >
                MODE ÉDITION
              </span>
            )}
          </h1>
          <p className="module-page__subtitle">
            Visualisation et modification de toutes les configurations système
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!editMode && (
            <>
              <button
                onClick={loadConfig}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: loading
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
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
              <button
                onClick={handleExport}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                📤 Exporter
              </button>
              <button
                onClick={handleImport}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                📥 Importer
              </button>
              <button
                onClick={handleSavePreset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '8px',
                  color: '#a855f7',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                💾 Sauver Preset
              </button>
              {presets.length > 0 && (
                <select
                  onChange={e => {
                    if (e.target.value) {
                      handleLoadPreset(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '8px',
                    color: '#a855f7',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">📋 Charger Preset...</option>
                  {presets.map(preset => (
                    <option key={preset.name} value={preset.name}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={handleEditToggle}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                ✏️ Modifier
              </button>
            </>
          )}
          {editMode && (
            <>
              <button
                onClick={handleEditToggle}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 68, 68, 0.2)',
                  border: '1px solid rgba(255, 68, 68, 0.4)',
                  borderRadius: '8px',
                  color: '#ff4444',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                ❌ Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                style={{
                  padding: '0.75rem 1.5rem',
                  background:
                    saving || !hasChanges
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: saving || !hasChanges ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  opacity: saving || !hasChanges ? 0.6 : 1,
                }}
              >
                {saving ? '💾 Enregistrement...' : '✅ Enregistrer'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Version & Timestamp Info */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem 1.5rem',
          background: editMode ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          border: editMode
            ? '1px solid rgba(102, 126, 234, 0.5)'
            : '1px solid rgba(102, 126, 234, 0.3)',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Version:{' '}
          </span>
          <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {config.version}
          </span>
        </div>
        <div
          style={{
            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
            paddingLeft: '1rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Dernière actualisation:{' '}
          </span>
          <span style={{ fontWeight: 600 }}>
            {lastRefresh.toLocaleTimeString('fr-FR')}
          </span>
        </div>
        {hasChanges && (
          <div
            style={{
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
              paddingLeft: '1rem',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#667eea' }}>
              ✏️{' '}
              {Object.keys(editedRuntime).length + Object.keys(editedChatEngine).length}{' '}
              modification(s)
            </span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          style={tabStyle(activeTab === 'system')}
          onClick={() => setActiveTab('system')}
        >
          💻 Système
        </button>
        <button style={tabStyle(activeTab === 'ai')} onClick={() => setActiveTab('ai')}>
          🤖 Intelligence Artificielle
        </button>
        <button
          style={tabStyle(activeTab === 'performance')}
          onClick={() => setActiveTab('performance')}
        >
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
              <ConfigFieldEditable
                label="Ollama URL"
                value={currentRuntime.ollama_url}
                description="Endpoint du serveur Ollama local"
                icon="🌐"
                valueType="url"
                editable={editMode}
                onChange={value => handleRuntimeFieldChange('ollama_url', value)}
                validationError={validationErrors['runtime.ollama_url']}
              />
              <ConfigFieldEditable
                label="Ollama Model"
                value={currentRuntime.ollama_model}
                description="Modèle LLM utilisé par défaut"
                icon="🧠"
                editable={editMode}
                onChange={value => handleRuntimeFieldChange('ollama_model', value)}
                validationError={validationErrors['runtime.ollama_model']}
              />
              <ConfigFieldEditable
                label="Secrets Mode"
                value={currentRuntime.secrets_mode}
                description="Mode de gestion des secrets (lecture seule)"
                icon="🔐"
                editable={false}
              />
              <ConfigFieldEditable
                label="Gemini Configuré"
                value={currentRuntime.gemini_configured}
                description="API Gemini active ou non (lecture seule)"
                icon="✨"
                valueType="boolean"
                editable={false}
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
              <ConfigFieldEditable
                label="Timeout"
                value={currentChatEngine.timeout_ms}
                description="Délai maximum d'attente pour une réponse (1000-300000ms)"
                icon="⏱️"
                valueType="duration"
                editable={editMode}
                onChange={value => handleChatEngineFieldChange('timeout_ms', value)}
                validationError={validationErrors['chat_engine.timeout_ms']}
              />
              <ConfigFieldEditable
                label="Chunk Size"
                value={currentChatEngine.chunk_size}
                description="Taille des chunks de streaming (100-10000)"
                icon="📦"
                valueType="number"
                editable={editMode}
                onChange={value => handleChatEngineFieldChange('chunk_size', value)}
                validationError={validationErrors['chat_engine.chunk_size']}
              />
              <ConfigFieldEditable
                label="Max Tokens"
                value={currentChatEngine.max_tokens}
                description="Nombre maximum de tokens par requête (100-100000)"
                icon="🎯"
                valueType="number"
                editable={editMode}
                onChange={value => handleChatEngineFieldChange('max_tokens', value)}
                validationError={validationErrors['chat_engine.max_tokens']}
              />
              <ConfigFieldEditable
                label="Temperature"
                value={currentChatEngine.temperature}
                description="Créativité du modèle (0.0 = déterministe, 2.0 = créatif)"
                icon="🌡️"
                valueType="number"
                editable={editMode}
                onChange={value => handleChatEngineFieldChange('temperature', value)}
                validationError={validationErrors['chat_engine.temperature']}
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
              <ConfigFieldEditable
                label="Config Load Time"
                value={`${Date.now() - config.timestamp}ms`}
                description="Temps écoulé depuis le chargement de la config"
                icon="⏱️"
                editable={false}
              />
              <ConfigFieldEditable
                label="Streaming Enabled"
                value={currentChatEngine.chunk_size > 0}
                description="Mode streaming activé pour les réponses"
                icon="📡"
                valueType="boolean"
                editable={false}
              />
              <ConfigFieldEditable
                label="Timeout Configuré"
                value={currentChatEngine.timeout_ms > 0}
                description="Timeout défini pour éviter les blocages"
                icon="⏰"
                valueType="boolean"
                editable={false}
              />
            </ConfigSection>
          </>
        )}
      </div>
    </div>
  );
};
