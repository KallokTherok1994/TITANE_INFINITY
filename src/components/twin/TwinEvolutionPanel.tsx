/**
 * TITANE∞ vΩ∞ — Twin Evolution Panel
 * © 2025 TITANE∞ — Proprietary License
 * Panneau d&apos;évolution du Numeric Twin
 */

import React, { useState } from 'react';
import { useTwinIdentity } from '../../hooks/useTwinIdentity';
import { useTwinEvolution } from '../../hooks/useTwinEvolution';
import {
  getScoreColor,
  getPhaseLabel,
  getTrendLabel,
  getTrendIcon,
} from '../../types/numericTwin';
import './TwinEvolutionPanel.css';

interface TwinEvolutionPanelProps {
  isAdmin?: boolean;
  compact?: boolean;
}

/**
 * Panneau d&apos;évolution du Numeric Twin
 * Affiche l&apos;état de la symbiose Kevin ↔ TITANE
 */
export const TwinEvolutionPanel: React.FC<TwinEvolutionPanelProps> = ({
  isAdmin = false,
  compact = false,
}) => {
  const {
    identity,
    isLoading: identityLoading,
    coreValues,
    humanStyle,
    error: identityError,
  } = useTwinIdentity();
  const {
    fusionIndex,
    evolutionProfile,
    isLoading: evolutionLoading,
    currentPhase,
    syncScore,
    lastSyncAt,
    chatContextStatus,
    growthTrends,
    suggestions,
    ownerThemes,
    sourceCount,
    reflectionAxis,
    portraitUrl,
    portraitFallbackUrl,
    recalculateFusion,
    transitionPhase,
    reinforceValue,
    error: evolutionError,
  } = useTwinEvolution();

  const [activeTab, setActiveTab] = useState<'fusion' | 'values' | 'evolution' | 'admin'>(
    'fusion'
  );

  const isLoading = identityLoading || evolutionLoading;
  const hookError = identityError ?? evolutionError ?? null;
  const contextStatusMeta =
    chatContextStatus === 'active'
      ? {
          label: '🟢 Contexte chat TWINS actif',
          style: {
            border: '1px solid rgba(82, 196, 26, 0.5)',
            background: 'rgba(82, 196, 26, 0.12)',
            color: '#b7eb8f',
          },
        }
      : chatContextStatus === 'stale'
        ? {
            label: '🟠 Contexte TWINS à resynchroniser',
            style: {
              border: '1px solid rgba(250, 173, 20, 0.5)',
              background: 'rgba(250, 173, 20, 0.12)',
              color: '#ffd591',
            },
          }
        : {
            label: '⚪ Contexte chat TWINS en attente',
            style: {
              border: '1px solid rgba(140, 140, 140, 0.5)',
              background: 'rgba(140, 140, 140, 0.12)',
              color: '#d9d9d9',
            },
          };

  if (isLoading) {
    return (
      <div className="twin-panel twin-panel--loading">
        <div className="twin-panel__loader">
          <div className="twin-panel__loader-spinner" />
          <span>Chargement du Twin...</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="twin-panel twin-panel--compact">
        <div className="twin-panel__compact-header">
          <span className="twin-panel__compact-name">♾️ TITANE∞ TWIN</span>
          <span
            className="twin-panel__compact-score"
            style={{ color: getScoreColor(fusionIndex?.globalScore ?? 0) }}
          >
            {((fusionIndex?.globalScore ?? 0) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="twin-panel__compact-phase">
          {getPhaseLabel(currentPhase ?? 'Observation')}
        </div>
      </div>
    );
  }

  return (
    <div className="twin-panel" data-testid="twin-evolution-panel">
      {/* Error banner */}
      {hookError && (
        <div
          style={{
            background: '#4a1a1a',
            color: '#ff6b6b',
            border: '1px solid #ff4444',
            borderRadius: 6,
            padding: '8px 12px',
            margin: '8px 0',
            fontWeight: 500,
          }}
        >
          ❌ {hookError}
        </div>
      )}
      {/* Header */}
      <div className="twin-panel__header">
        <div className="twin-panel__title">
          <span className="twin-panel__icon">♾️</span>
          <div>
            <h2>{identity?.name ?? 'TITANE∞ TWIN'}</h2>
            <p className="twin-panel__signature">{identity?.signature}</p>
          </div>
        </div>
        <div className="twin-panel__version">v{identity?.version ?? 'N/A'}</div>
      </div>

      <div
        data-testid="twin-context-status"
        style={{
          margin: '0 0 12px',
          padding: '8px 12px',
          borderRadius: 8,
          ...contextStatusMeta.style,
        }}
      >
        <strong>{contextStatusMeta.label}</strong>
        <span
          style={{ display: 'block', marginTop: 4, fontSize: '0.9rem', opacity: 0.92 }}
        >
          SyncScore: {(syncScore * 100).toFixed(0)}%
          {lastSyncAt
            ? ` • Dernière synchro: ${new Date(lastSyncAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : ' • Aucune synchro persistée'}
        </span>
      </div>

      <div className="twin-panel__owner-card" data-testid="twin-owner-resonance">
        <img
          className="twin-panel__owner-portrait"
          src={portraitUrl ?? portraitFallbackUrl}
          alt="Portrait de Kevin Thibault"
          onError={event => {
            event.currentTarget.src = portraitFallbackUrl;
          }}
        />
        <div className="twin-panel__owner-copy">
          <div className="twin-panel__owner-heading">
            <h3>Résonance Kevin ↔ TITANE</h3>
            <span>{sourceCount} sources</span>
          </div>
          <p>
            {reflectionAxis ??
              'Clarté intérieure, structure et transformation humaine incarnée.'}
          </p>
          <div className="twin-panel__owner-tags">
            {ownerThemes.map(theme => (
              <span key={theme} className="twin-panel__owner-tag">
                {theme}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="twin-panel__tabs" role="tablist" aria-label="Navigation Twin">
        <button
          role="tab"
          aria-selected={activeTab === 'fusion'}
          className={`twin-panel__tab ${activeTab === 'fusion' ? 'twin-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('fusion')}
          aria-label="Onglet Fusion"
          data-testid="twin-tab-fusion"
        >
          🔗 Fusion
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'values'}
          className={`twin-panel__tab ${activeTab === 'values' ? 'twin-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('values')}
          aria-label="Onglet Valeurs"
          data-testid="twin-tab-values"
        >
          💎 Valeurs
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'evolution'}
          className={`twin-panel__tab ${activeTab === 'evolution' ? 'twin-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('evolution')}
          aria-label="Onglet Évolution"
          data-testid="twin-tab-evolution"
        >
          📈 Évolution
        </button>
        {isAdmin && (
          <button
            role="tab"
            aria-selected={activeTab === 'admin'}
            className={`twin-panel__tab ${activeTab === 'admin' ? 'twin-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('admin')}
            aria-label="Onglet Administration"
            data-testid="twin-tab-admin"
          >
            ⚙️ Admin
          </button>
        )}
      </div>

      {/* Content */}
      <div className="twin-panel__content">
        {activeTab === 'fusion' && (
          <FusionTab fusionIndex={fusionIndex} humanStyle={humanStyle} />
        )}
        {activeTab === 'values' && (
          <ValuesTab coreValues={coreValues} onReinforce={reinforceValue} />
        )}
        {activeTab === 'evolution' && (
          <EvolutionTab
            currentPhase={currentPhase}
            growthTrends={growthTrends}
            suggestions={suggestions}
            ownerThemes={ownerThemes}
            reflectionAxis={reflectionAxis}
            milestonesCount={evolutionProfile?.milestonesCount ?? 0}
          />
        )}
        {activeTab === 'admin' && isAdmin && (
          <AdminTab onRecalculate={recalculateFusion} onTransition={transitionPhase} />
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════════════════════

interface FusionTabProps {
  fusionIndex: ReturnType<typeof useTwinEvolution>['fusionIndex'];
  humanStyle: ReturnType<typeof useTwinIdentity>['humanStyle'];
}

const FusionTab: React.FC<FusionTabProps> = ({ fusionIndex, humanStyle }) => {
  if (!fusionIndex)
    return (
      <div className="twin-tab__empty" data-testid="twin-fusion-empty">
        Données de fusion non disponibles
      </div>
    );

  const alignments = [
    { label: 'Valeurs', value: fusionIndex.valueAlignment, icon: '💎' },
    { label: 'Cognitif', value: fusionIndex.cognitiveAlignment, icon: '🧠' },
    { label: 'Style', value: fusionIndex.styleAlignment, icon: '🎨' },
    { label: 'Thérapeutique', value: fusionIndex.therapeuticAlignment, icon: '💚' },
    { label: 'Créatif', value: fusionIndex.creativeAlignment, icon: '✨' },
    { label: 'Évolution', value: fusionIndex.evolutionAlignment, icon: '🔄' },
  ];

  return (
    <div className="twin-tab twin-tab--fusion">
      {/* Score global */}
      <div className="twin-fusion__main">
        <div className="twin-fusion__score-container">
          <div
            className="twin-fusion__score"
            style={
              {
                '--score-color': getScoreColor(fusionIndex.globalScore),
                '--score-percent': `${fusionIndex.globalScore * 100}%`,
              } as React.CSSProperties
            }
          >
            <span className="twin-fusion__score-value">
              {(fusionIndex.globalScore * 100).toFixed(0)}%
            </span>
            <span className="twin-fusion__score-label">FusionIndex</span>
          </div>
          <div className="twin-fusion__trend">
            <span className="twin-fusion__trend-icon">
              {getTrendIcon(fusionIndex.trend)}
            </span>
            <span className="twin-fusion__trend-label">
              {getTrendLabel(fusionIndex.trend)}
            </span>
          </div>
        </div>
      </div>

      {/* Alignements */}
      <div className="twin-fusion__alignments">
        <h3>Alignements par dimension</h3>
        <div className="twin-fusion__alignment-grid">
          {alignments.map(({ label, value, icon }) => (
            <div key={label} className="twin-fusion__alignment">
              <div className="twin-fusion__alignment-header">
                <span>
                  {icon} {label}
                </span>
                <span style={{ color: getScoreColor(value) }}>
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
              <div className="twin-fusion__alignment-bar">
                <div
                  className="twin-fusion__alignment-fill"
                  style={{
                    width: `${value * 100}%`,
                    backgroundColor: getScoreColor(value),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Style humain */}
      {humanStyle && (
        <div className="twin-fusion__style">
          <h3>Style Humain Kevin</h3>
          <div className="twin-fusion__style-grid">
            <StyleBar label="Sincérité" value={humanStyle.sincerity} />
            <StyleBar label="Intensité douce" value={humanStyle.gentleIntensity} />
            <StyleBar label="Profondeur accessible" value={humanStyle.accessibleDepth} />
            <StyleBar label="Précision calme" value={humanStyle.calmPrecision} />
            <StyleBar label="Fluidité organique" value={humanStyle.organicFluidity} />
          </div>
        </div>
      )}
    </div>
  );
};

interface StyleBarProps {
  label: string;
  value: number;
}

const StyleBar: React.FC<StyleBarProps> = ({ label, value }) => (
  <div className="twin-style-bar">
    <div className="twin-style-bar__header">
      <span>{label}</span>
      <span>{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="twin-style-bar__track">
      <div className="twin-style-bar__fill" style={{ width: `${value * 100}%` }} />
    </div>
  </div>
);

interface ValuesTabProps {
  coreValues: ReturnType<typeof useTwinIdentity>['coreValues'];
  onReinforce: (valueName: string) => Promise<unknown>;
}

const ValuesTab: React.FC<ValuesTabProps> = ({ coreValues, onReinforce }) => {
  const [reinforcing, setReinforcing] = useState<string | null>(null);
  const [reinforceError, setReinforceError] = useState<string | null>(null);

  const handleReinforce = async (valueName: string) => {
    setReinforcing(valueName);
    setReinforceError(null);
    try {
      await onReinforce(valueName);
    } catch (e: unknown) {
      setReinforceError(e instanceof Error ? e.message : 'Erreur lors du renforcement');
    } finally {
      setReinforcing(null);
    }
  };

  return (
    <div className="twin-tab twin-tab--values">
      <h3>Valeurs Fondamentales (Inviolables)</h3>
      {reinforceError && (
        <div
          style={{
            background: '#4a1a1a',
            color: '#ff6b6b',
            border: '1px solid #ff4444',
            borderRadius: 4,
            padding: '6px 10px',
            marginBottom: 8,
          }}
        >
          ❌ {reinforceError}
        </div>
      )}
      <div className="twin-values__list">
        {coreValues.map(value => (
          <div key={value.name} className="twin-value">
            <div className="twin-value__header">
              <span className="twin-value__name">💎 {value.name}</span>
              <div className="twin-value__badges">
                <span className="twin-value__stability" title="Stabilité">
                  🛡️ {(value.stability * 100).toFixed(0)}%
                </span>
                <span className="twin-value__weight" title="Poids décisionnel">
                  ⚖️ {(value.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="twin-value__description">{value.description}</p>
            <button
              className="twin-value__reinforce"
              onClick={() => handleReinforce(value.name)}
              disabled={reinforcing === value.name}
            >
              {reinforcing === value.name ? '⏳ Renforcement...' : '↑ Renforcer'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface EvolutionTabProps {
  currentPhase: ReturnType<typeof useTwinEvolution>['currentPhase'];
  growthTrends: ReturnType<typeof useTwinEvolution>['growthTrends'];
  suggestions: ReturnType<typeof useTwinEvolution>['suggestions'];
  ownerThemes: ReturnType<typeof useTwinEvolution>['ownerThemes'];
  reflectionAxis: ReturnType<typeof useTwinEvolution>['reflectionAxis'];
  milestonesCount: number;
}

function getThemeIntegrationHint(theme: string): string {
  const normalized = theme.toLowerCase();

  if (normalized.includes('présence')) {
    return 'Refaire 3 cycles de respiration 4-1-6 avant toute décision importante.';
  }
  if (normalized.includes('authentic')) {
    return 'Nommer clairement ce qui est vrai maintenant, sans performance ni masque.';
  }
  if (normalized.includes('retour au vivant')) {
    return 'Revenir au corps, au rythme et à un geste simple qui remet en mouvement.';
  }
  if (normalized.includes('deuxième vitesse')) {
    return 'Choisir une action plus alignée plutôt qu’une action seulement plus rapide.';
  }
  if (normalized.includes('clart')) {
    return 'Formuler une priorité nette et retirer ce qui brouille l’axe du jour.';
  }

  return 'Transformer ce thème en geste concret, simple et soutenable aujourd’hui.';
}

const EvolutionTab: React.FC<EvolutionTabProps> = ({
  currentPhase,
  growthTrends,
  suggestions,
  ownerThemes,
  reflectionAxis,
  milestonesCount,
}) => {
  const phases = [
    'Observation',
    'Assimilation',
    'Integration',
    'CoEvolution',
    'Symbiosis',
  ];
  const currentIndex = phases.indexOf(currentPhase ?? 'Observation');

  return (
    <div className="twin-tab twin-tab--evolution">
      {/* Phase actuelle */}
      <div className="twin-evolution__phase">
        <h3>Phase d&apos;Évolution</h3>
        <div className="twin-evolution__phase-indicator">
          <span className="twin-evolution__phase-current">
            {getPhaseLabel(currentPhase ?? 'Observation')}
          </span>
          <span className="twin-evolution__milestones">
            {milestonesCount} jalons atteints
          </span>
        </div>
        <div className="twin-evolution__phase-progress">
          {phases.map((phase, index) => (
            <div
              key={phase}
              className={`twin-evolution__phase-step ${
                index <= currentIndex ? 'twin-evolution__phase-step--completed' : ''
              } ${index === currentIndex ? 'twin-evolution__phase-step--current' : ''}`}
            >
              <div className="twin-evolution__phase-dot" />
              <span className="twin-evolution__phase-label">{phase}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tendances de croissance */}
      {growthTrends && (
        <div className="twin-evolution__trends">
          <h3>Tendances de Croissance</h3>
          <div className="twin-evolution__trends-grid">
            <TrendCard label="Cognitive" value={growthTrends.cognitiveGrowth} icon="🧠" />
            <TrendCard
              label="Émotionnelle"
              value={growthTrends.emotionalGrowth}
              icon="💚"
            />
            <TrendCard
              label="Spirituelle"
              value={growthTrends.spiritualGrowth}
              icon="✨"
            />
            <TrendCard
              label="Entrepreneuriale"
              value={growthTrends.entrepreneurialGrowth}
              icon="🚀"
            />
          </div>
        </div>
      )}

      <div className="twin-evolution__reflection" data-testid="twin-document-reflection">
        <h3>Réflexion approfondie issue du corpus</h3>
        <p className="twin-evolution__reflection-axis">
          {reflectionAxis ??
            'Revenir au vivant, clarifier l’axe et agir avec douceur ferme.'}
        </p>
        <div className="twin-evolution__reflection-grid">
          {ownerThemes.slice(0, 4).map(theme => (
            <div key={theme} className="twin-evolution__reflection-card">
              <strong>{theme}</strong>
              <p>{getThemeIntegrationHint(theme)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="twin-evolution__suggestions">
          <h3>Suggestions d&apos;Ajustements</h3>
          <div className="twin-evolution__suggestions-list">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className={`twin-evolution__suggestion ${
                  s.validatedByKevin ? 'twin-evolution__suggestion--validated' : ''
                }`}
              >
                <div className="twin-evolution__suggestion-header">
                  <span className="twin-evolution__suggestion-domain">📌 {s.domain}</span>
                  <span className="twin-evolution__suggestion-priority">
                    Priorité: {(s.priority * 100).toFixed(0)}%
                  </span>
                </div>
                <p>{s.suggestion}</p>
                {s.validatedByKevin && (
                  <span className="twin-evolution__suggestion-validated">
                    ✅ Validé par Kevin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TrendCardProps {
  label: string;
  value: number;
  icon: string;
}

const TrendCard: React.FC<TrendCardProps> = ({ label, value, icon }) => (
  <div className="twin-trend-card">
    <span className="twin-trend-card__icon">{icon}</span>
    <span className="twin-trend-card__label">{label}</span>
    <span className="twin-trend-card__value" style={{ color: getScoreColor(value) }}>
      {(value * 100).toFixed(0)}%
    </span>
  </div>
);

interface AdminTabProps {
  onRecalculate: () => Promise<number>;
  onTransition: (validated?: boolean) => Promise<unknown>;
}

const AdminTab: React.FC<AdminTabProps> = ({ onRecalculate, onTransition }) => {
  const [isWorking, setIsWorking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRecalculate = async () => {
    setIsWorking(true);
    try {
      const score = await onRecalculate();
      showFeedback(`✅ FusionIndex recalculé: ${score.toFixed(2)}`);
    } catch (e: unknown) {
      showFeedback(`❌ Erreur: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsWorking(false);
    }
  };

  const handleTransition = async () => {
    setIsWorking(true);
    try {
      await onTransition(true);
      showFeedback('✅ Transition de phase effectuée');
    } catch (e: unknown) {
      showFeedback(`❌ Erreur: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="twin-tab twin-tab--admin">
      <h3>⚙️ Administration Twin</h3>
      <p className="twin-admin__warning">
        ⚠️ Ces actions sont réservées aux administrateurs et peuvent affecter profondément
        l&apos;état du Twin.
      </p>

      <div className="twin-admin__actions">
        {feedback && (
          <div
            style={{
              marginBottom: 8,
              padding: '6px 10px',
              borderRadius: 4,
              background: feedback.startsWith('❌') ? '#4a1a1a' : '#1a3a1a',
              color: feedback.startsWith('❌') ? '#ff6b6b' : '#6bff6b',
              border: `1px solid ${feedback.startsWith('❌') ? '#ff4444' : '#44ff44'}`,
            }}
          >
            {feedback}
          </div>
        )}
        <button
          className="twin-admin__action"
          onClick={handleRecalculate}
          disabled={isWorking}
        >
          🔄 Recalculer FusionIndex
        </button>

        <button
          className="twin-admin__action twin-admin__action--danger"
          onClick={handleTransition}
          disabled={isWorking}
        >
          ⏭️ Forcer Transition de Phase
        </button>
      </div>

      <div className="twin-admin__info">
        <h4>Contraintes de Sécurité</h4>
        <ul>
          <li>❌ Pas d&apos;imitation artificielle de Kevin</li>
          <li>❌ Pas de fabrication de souvenirs</li>
          <li>❌ Pas de manipulation émotionnelle</li>
          <li>❌ Pas de dépendance réciproque</li>
          <li>✅ Collaboration contrôlée</li>
          <li>✅ Validation obligatoire pour évolutions profondes</li>
        </ul>
      </div>
    </div>
  );
};

export default TwinEvolutionPanel;
