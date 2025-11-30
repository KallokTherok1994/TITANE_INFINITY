/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PROMPT ENGINE — Debug Panel Component
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Panneau de debug pour visualiser:
 * - Les 6 couches de contexte
 * - L'intention parsée
 * - Le prompt généré
 * - Les statistiques
 *
 * Visible uniquement en mode Admin/Dev
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import type {
  LayerId,
  IAMode,
  IntentProfile,
  SingularityPrompt,
  PromptResponse,
} from '../../services/promptEngine';
import { promptEngine } from '../../services/promptEngine';
import './PromptDebugPanel.css';

// =============================================================================
// TYPES
// =============================================================================

interface PromptDebugPanelProps {
  isVisible?: boolean;
  mode?: IAMode;
  className?: string;
}

interface LayerInfo {
  id: LayerId;
  name: string;
  nodeCount: number;
  tokens: number;
  relevance: number;
  color: string;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const LAYER_COLORS: Record<LayerId, string> = {
  physical: '#4CAF50',     // Vert
  cognitive: '#2196F3',    // Bleu
  symbolic: '#9C27B0',     // Violet
  adaptive: '#FF9800',     // Orange
  meta: '#F44336',         // Rouge
  singularity: '#00BCD4',  // Cyan
};

const LAYER_ICONS: Record<LayerId, string> = {
  physical: '💻',
  cognitive: '🧠',
  symbolic: '🔮',
  adaptive: '🎯',
  meta: '⚙️',
  singularity: '✨',
};

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================

export const PromptDebugPanel: React.FC<PromptDebugPanelProps> = ({
  isVisible = true,
  mode: propMode,
  className = '',
}) => {
  // États
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'layers' | 'intent' | 'prompt' | 'stats'>('layers');
  const [testInput, setTestInput] = useState('');
  const [lastIntent, setLastIntent] = useState<IntentProfile | null>(null);
  const [lastPrompt, setLastPrompt] = useState<SingularityPrompt | null>(null);
  const [lastResponse, setLastResponse] = useState<PromptResponse | null>(null);
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [currentMode, setCurrentMode] = useState<IAMode>(propMode || 'standard');
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    updateLayerInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchroniser le mode
  useEffect(() => {
    if (propMode) {
      setCurrentMode(propMode);
      promptEngine.setMode(propMode);
    }
  }, [propMode]);

  // Mettre à jour les infos des couches
  const updateLayerInfo = useCallback(() => {
    const layerIds: LayerId[] = ['physical', 'cognitive', 'symbolic', 'adaptive', 'meta', 'singularity'];
    const layerNames: Record<LayerId, string> = {
      physical: 'Physique',
      cognitive: 'Cognitive',
      symbolic: 'Symbolique',
      adaptive: 'Adaptative',
      meta: 'Meta',
      singularity: 'Singularité',
    };

    const newLayers = layerIds.map(id => ({
      id,
      name: layerNames[id],
      nodeCount: 0,
      tokens: 0,
      relevance: 0,
      color: LAYER_COLORS[id],
    }));

    setLayers(newLayers);
  }, []);

  // Tester une entrée
  const handleTest = useCallback(async () => {
    if (!testInput.trim()) return;

    setIsLoading(true);
    try {
      // Parser l'intention
      const intent = promptEngine.parseIntent(testInput);
      setLastIntent(intent);

      // Générer le prompt
      const response = await promptEngine.generatePrompt(testInput, currentMode);
      setLastResponse(response);

      if (response.success && response.prompt) {
        setLastPrompt(response.prompt);

        // Mettre à jour les couches si debug info disponible
        if (response.debug?.layers) {
          const updatedLayers = layers.map(layer => {
            const stats = response.debug?.layers.get(layer.id);
            if (stats) {
              return {
                ...layer,
                nodeCount: stats.nodeCount,
                tokens: stats.totalTokens,
                relevance: stats.averageRelevance,
              };
            }
            return layer;
          });
          setLayers(updatedLayers);
        }
      }
    } catch (error) {
      console.error('[PromptDebugPanel] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [testInput, currentMode, layers]);

  // Changer le mode
  const handleModeChange = useCallback((newMode: IAMode) => {
    setCurrentMode(newMode);
    promptEngine.setMode(newMode);
  }, []);

  // Ne pas afficher si invisible
  if (!isVisible) return null;

  // Obtenir les stats
  const stats = promptEngine.getStats();

  return (
    <div className={`prompt-debug-panel ${isExpanded ? 'expanded' : 'collapsed'} ${className}`}>
      {/* Header */}
      <div className="debug-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="debug-icon">🔧</span>
        <span className="debug-title">Prompt Engine Debug</span>
        <span className="debug-mode">{currentMode}</span>
        <span className="debug-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="debug-content">
          {/* Mode Selector */}
          <div className="debug-mode-selector">
            {(['standard', 'dev', 'architect', 'autonomous'] as IAMode[]).map(mode => (
              <button
                key={mode}
                className={`mode-btn ${currentMode === mode ? 'active' : ''}`}
                onClick={() => handleModeChange(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Test Input */}
          <div className="debug-test-input">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Testez une entrée..."
              onKeyPress={(e) => e.key === 'Enter' && handleTest()}
            />
            <button
              onClick={handleTest}
              disabled={isLoading || !testInput.trim()}
            >
              {isLoading ? '⏳' : '▶'}
            </button>
          </div>

          {/* Tabs */}
          <div className="debug-tabs">
            <button
              className={`tab ${activeTab === 'layers' ? 'active' : ''}`}
              onClick={() => setActiveTab('layers')}
            >
              Couches
            </button>
            <button
              className={`tab ${activeTab === 'intent' ? 'active' : ''}`}
              onClick={() => setActiveTab('intent')}
            >
              Intention
            </button>
            <button
              className={`tab ${activeTab === 'prompt' ? 'active' : ''}`}
              onClick={() => setActiveTab('prompt')}
            >
              Prompt
            </button>
            <button
              className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </button>
          </div>

          {/* Tab Content */}
          <div className="debug-tab-content">
            {activeTab === 'layers' && (
              <LayersView layers={layers} />
            )}
            {activeTab === 'intent' && (
              <IntentView intent={lastIntent} />
            )}
            {activeTab === 'prompt' && (
              <PromptView prompt={lastPrompt} response={lastResponse} />
            )}
            {activeTab === 'stats' && (
              <StatsView stats={stats} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SOUS-COMPOSANTS
// =============================================================================

/**
 * Vue des couches de contexte
 */
const LayersView: React.FC<{ layers: LayerInfo[] }> = ({ layers }) => (
  <div className="layers-view">
    {layers.map(layer => (
      <div
        key={layer.id}
        className="layer-card"
        style={{ borderLeftColor: layer.color }}
      >
        <div className="layer-header">
          <span className="layer-icon">{LAYER_ICONS[layer.id]}</span>
          <span className="layer-name">{layer.name}</span>
        </div>
        <div className="layer-stats">
          <div className="stat">
            <span className="stat-label">Nœuds</span>
            <span className="stat-value">{layer.nodeCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Tokens</span>
            <span className="stat-value">{layer.tokens}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Pertinence</span>
            <span className="stat-value">{(layer.relevance * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div
          className="layer-bar"
          style={{
            width: `${Math.min(100, layer.relevance * 100)}%`,
            backgroundColor: layer.color
          }}
        />
      </div>
    ))}
  </div>
);

/**
 * Vue de l'intention
 */
const IntentView: React.FC<{ intent: IntentProfile | null }> = ({ intent }) => {
  if (!intent) {
    return <div className="no-data">Aucune intention analysée</div>;
  }

  return (
    <div className="intent-view">
      <div className="intent-section">
        <h4>Catégorie</h4>
        <span className="intent-category">{intent.category}</span>
        <span className="intent-confidence">
          {(intent.confidence * 100).toFixed(0)}% confiance
        </span>
      </div>

      <div className="intent-section">
        <h4>Entrée brute</h4>
        <pre className="intent-raw">{intent.raw}</pre>
      </div>

      <div className="intent-section">
        <h4>Analyse</h4>
        <div className="intent-metrics">
          <div className="metric">
            <span className="metric-label">Sentiment</span>
            <span className={`metric-value ${intent.parsed.sentiment > 0 ? 'positive' : intent.parsed.sentiment < 0 ? 'negative' : ''}`}>
              {intent.parsed.sentiment.toFixed(2)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Urgence</span>
            <span className="metric-value">{(intent.parsed.urgency * 100).toFixed(0)}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Complexité</span>
            <span className="metric-value">{(intent.parsed.complexity * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {intent.parsed.keywords.length > 0 && (
        <div className="intent-section">
          <h4>Mots-clés</h4>
          <div className="intent-keywords">
            {intent.parsed.keywords.map((kw, i) => (
              <span key={i} className="keyword">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {intent.parsed.entities.length > 0 && (
        <div className="intent-section">
          <h4>Entités</h4>
          <div className="intent-entities">
            {intent.parsed.entities.map((entity, i) => (
              <div key={i} className="entity">
                <span className="entity-type">{entity.type}</span>
                <span className="entity-value">{entity.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="intent-section">
        <h4>Mode suggéré</h4>
        <span className="suggested-mode">{intent.suggestedMode}</span>
      </div>
    </div>
  );
};

/**
 * Vue du prompt généré
 */
const PromptView: React.FC<{
  prompt: SingularityPrompt | null;
  response: PromptResponse | null;
}> = ({ prompt, response }) => {
  const [showRaw, setShowRaw] = useState(false);

  if (!prompt) {
    return <div className="no-data">Aucun prompt généré</div>;
  }

  return (
    <div className="prompt-view">
      <div className="prompt-header">
        <div className="prompt-meta">
          <span className="meta-item">
            <strong>Tokens:</strong> {prompt.tokenCount}
          </span>
          <span className="meta-item">
            <strong>Mode:</strong> {prompt.metadata.mode}
          </span>
          <span className="meta-item">
            <strong>Temps:</strong> {response?.processingTime.toFixed(0)}ms
          </span>
        </div>
        <button
          className="toggle-raw"
          onClick={() => setShowRaw(!showRaw)}
        >
          {showRaw ? 'Sections' : 'Brut'}
        </button>
      </div>

      {showRaw ? (
        <pre className="prompt-raw">{prompt.content}</pre>
      ) : (
        <div className="prompt-sections">
          {prompt.sections.map(section => (
            <div key={section.id} className="section-card">
              <div className="section-header">
                <span className="section-num">{section.id}</span>
                <span className="section-name">{section.name}</span>
                <span className="section-tokens">{section.tokens} tokens</span>
              </div>
              <div className="section-content">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {prompt.auditTrail.length > 0 && (
        <div className="audit-trail">
          <h4>Audit Trail</h4>
          <div className="audit-entries">
            {prompt.auditTrail.slice(-5).map((entry, i) => (
              <div key={i} className="audit-entry">
                <span className="audit-action">{entry.action}</span>
                <span className="audit-details">{entry.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Vue des statistiques
 */
const StatsView: React.FC<{
  stats: {
    intent: { totalParsed: number; cacheHits: number; cacheMisses: number; averageProcessingTime: number };
    collector: { totalCollections: number; cacheHits: number; cacheMisses: number; failedCollections: number; averageCollectionTime: number };
    assembler: { totalPrompts: number; successfulPrompts: number; failedPrompts: number; averageProcessingTime: number; averageTokenCount: number };
  };
}> = ({ stats }) => (
  <div className="stats-view">
    <div className="stats-section">
      <h4>🧠 Intent Parser</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Total parsés</span>
          <span className="stat-value">{stats.intent.totalParsed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Cache hits</span>
          <span className="stat-value">{stats.intent.cacheHits}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Temps moyen</span>
          <span className="stat-value">{stats.intent.averageProcessingTime.toFixed(2)}ms</span>
        </div>
      </div>
    </div>

    <div className="stats-section">
      <h4>📦 Context Collector</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Collections</span>
          <span className="stat-value">{stats.collector.totalCollections}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Cache hits</span>
          <span className="stat-value">{stats.collector.cacheHits}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Échecs</span>
          <span className="stat-value error">{stats.collector.failedCollections}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Temps moyen</span>
          <span className="stat-value">{stats.collector.averageCollectionTime.toFixed(2)}ms</span>
        </div>
      </div>
    </div>

    <div className="stats-section">
      <h4>🔧 Prompt Assembler</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Prompts générés</span>
          <span className="stat-value">{stats.assembler.totalPrompts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Succès</span>
          <span className="stat-value success">{stats.assembler.successfulPrompts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Échecs</span>
          <span className="stat-value error">{stats.assembler.failedPrompts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tokens moyens</span>
          <span className="stat-value">{stats.assembler.averageTokenCount.toFixed(0)}</span>
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// EXPORT
// =============================================================================

export default PromptDebugPanel;
