/**
 * TITANE∞ — Model Selector Component
 * Permet de sélectionner le modèle AI à utiliser
 *
 * v26.4.0 (Sprint 6)
 */

import React, { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'github';
  contextWindow: number;
  costPer1kTokens?: { input: number; output: number };
  description?: string;
  tags?: string[];
}

export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  models?: ModelInfo[];
  showAdvanced?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT MODELS
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_MODELS: ModelInfo[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.01, output: 0.03 },
    description: 'Modèle haute performance, excellente qualité',
    tags: ['reasoning', 'long-context', 'fast'],
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
    description: 'Modèle rapide et économique',
    tags: ['fast', 'cheap', 'reliable'],
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.015, output: 0.075 },
    description: 'Modèle premium Anthropic, très fiable',
    tags: ['reasoning', 'long-context', 'reliable'],
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.00025, output: 0.00125 },
    description: 'Modèle rapide Anthropic',
    tags: ['fast', 'cheap'],
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    contextWindow: 1000000,
    description: 'Modèle multimodal avec très grand contexte',
    tags: ['multimodal', 'long-context', 'fast'],
  },
  {
    id: 'local-llama',
    name: 'Llama 2 (Local)',
    provider: 'local',
    contextWindow: 4096,
    description: 'Modèle local, zéro frais',
    tags: ['local', 'private', 'free'],
  },
  {
    id: 'github-models',
    name: 'GitHub Models',
    provider: 'github',
    contextWindow: 128000,
    description: 'Modèles hébergés sur GitHub',
    tags: ['free', 'github'],
  },
];

// ═══════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════

interface ModelDetailsPanelProps {
  model: ModelInfo;
  isSelected: boolean;
}

const ModelDetailsPanel: React.FC<ModelDetailsPanelProps> = ({ model, isSelected }) => {
  const providerColors: Record<string, string> = {
    openai: '#FF6B6B',
    anthropic: '#6BCB77',
    google: '#4C6EF5',
    local: '#FFD93D',
    github: '#727B81',
  };

  return (
    <div
      style={{
        padding: '8px',
        background: isSelected ? 'rgba(114, 123, 129, 0.2)' : 'rgba(114, 123, 129, 0.05)',
        borderRadius: '6px',
        marginBottom: '8px',
        border: isSelected
          ? '1px solid rgba(114, 123, 129, 0.5)'
          : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="radio"
            checked={isSelected}
            onChange={() => {}}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontWeight: 600, color: '#C4C4C4' }}>{model.name}</span>
        </div>
        <span
          style={{
            fontSize: '11px',
            padding: '2px 6px',
            background: providerColors[model.provider],
            color: '#fff',
            borderRadius: '3px',
            fontWeight: 500,
          }}
        >
          {model.provider.toUpperCase()}
        </span>
      </div>

      {model.description && (
        <p style={{ fontSize: '12px', color: '#727B81', margin: '4px 0' }}>
          {model.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: '12px',
          fontSize: '11px',
          color: '#727B81',
          marginTop: '6px',
        }}
      >
        <span>🔤 {(model.contextWindow / 1000).toFixed(0)}K tokens</span>
        {model.costPer1kTokens && (
          <span>
            💰 ${model.costPer1kTokens.input.toFixed(5)}/
            {model.costPer1kTokens.output.toFixed(5)}
          </span>
        )}
      </div>

      {model.tags && model.tags.length > 0 && (
        <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {model.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                background: 'rgba(114, 123, 129, 0.2)',
                borderRadius: '3px',
                color: '#C4C4C4',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Model Selector Component
 * Permet de choisir parmi les modèles disponibles
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  models = DEFAULT_MODELS,
  showAdvanced = false,
  className,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Récupère le modèle sélectionné
  const selectedModelInfo = useMemo(
    () => models.find(m => m.id === selectedModel) || models[0],
    [selectedModel, models]
  );

  // Récupère tous les tags uniques
  const allTags = useMemo(
    () => Array.from(new Set(models.flatMap(m => m.tags || []))),
    [models]
  );

  // Filtre les modèles
  const filteredModels = useMemo(
    () => (filterTag ? models.filter(m => m.tags?.includes(filterTag)) : models),
    [models, filterTag]
  );

  return (
    <div className={className} style={style}>
      {/* Sélecteur principal */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px',
          background: 'rgba(114, 123, 129, 0.2)',
          border: '1px solid rgba(114, 123, 129, 0.4)',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.background =
            'rgba(114, 123, 129, 0.3)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.background =
            'rgba(114, 123, 129, 0.2)';
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: '#727B81' }}>Modèle</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#C4C4C4' }}>
            {selectedModelInfo?.name}
          </div>
        </div>
        <span style={{ fontSize: '18px', transition: 'transform 0.2s' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Panel ouvert */}
      {isOpen && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            background: 'rgba(4, 15, 31, 0.8)',
            border: '1px solid rgba(114, 123, 129, 0.3)',
            borderRadius: '8px',
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          {/* Filtres par tag */}
          {showAdvanced && allTags.length > 0 && (
            <div
              style={{
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(114, 123, 129, 0.2)',
              }}
            >
              <div style={{ fontSize: '11px', color: '#727B81', marginBottom: '6px' }}>
                Filtrer par:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterTag(null)}
                  style={{
                    padding: '4px 8px',
                    background:
                      filterTag === null
                        ? 'rgba(114, 123, 129, 0.5)'
                        : 'rgba(114, 123, 129, 0.2)',
                    border: '1px solid rgba(114, 123, 129, 0.3)',
                    borderRadius: '3px',
                    color: '#C4C4C4',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Tous
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    style={{
                      padding: '4px 8px',
                      background:
                        filterTag === tag
                          ? 'rgba(114, 123, 129, 0.5)'
                          : 'rgba(114, 123, 129, 0.2)',
                      border: '1px solid rgba(114, 123, 129, 0.3)',
                      borderRadius: '3px',
                      color: '#C4C4C4',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Liste des modèles */}
          {filteredModels.map(model => (
            <div
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
            >
              <ModelDetailsPanel model={model} isSelected={model.id === selectedModel} />
            </div>
          ))}

          {filteredModels.length === 0 && (
            <div style={{ textAlign: 'center', color: '#727B81', padding: '12px' }}>
              Aucun modèle ne correspond au filtre
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
