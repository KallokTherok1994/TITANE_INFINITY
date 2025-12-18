/*
 * TITANE∞ - System Identity Engine v∞
 * Identity Center React Component
 *
 * Interface de visualisation et contrôle de l'identité système
 * Big Five traits, modes, voix, personnalité cohérente
 *
 * Copyright (c) 2025 Kevin Thibault
 * Licence MIT - Voir LICENSE
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/lib/logger';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIdentityMatrix } from '@/hooks/useIdentityMatrix';
import { useSingularityStateSafe } from '@/hooks/useSingularityStateSafe';
import './IdentityCenter.css';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface IdentityMatrix {
  name: string;
  version: string;
  core_role: string;
  mission: string;
  values: IdentityValue[];
  archetype: { primary: string; secondary: string; description: string };
  style_global: string;
}

interface IdentityValue {
  name: string;
  priority: number;
  inviolable: boolean;
  description: string;
}

interface PersonalitySnapshot {
  timestamp: string;
  traits: BigFiveTraits;
  current_mode: string;
  current_tone: string;
  active_rules: number;
  coherence_score: number;
}

interface BigFiveTraits {
  openness: TraitValue;
  conscientiousness: TraitValue;
  extraversion: TraitValue;
  agreeableness: TraitValue;
  neuroticism: TraitValue;
}

interface TraitValue {
  value: number;
  facets: Record<string, number>;
}

interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  is_default: boolean;
  is_active: boolean;
  parameters: {
    pitch: number;
    speed: number;
    volume: number;
    timbre: string;
  };
}

interface ToneState {
  id: string;
  mood: string;
  energy: number;
  formality: number;
  warmth: number;
  confidence: number;
}

interface OperationalMode {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface BehaviorRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  is_active: boolean;
  is_inviolable: boolean;
  category: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

const IdentityCenterContent: React.FC = () => {
  // États principaux
  const [activeTab, setActiveTab] = useState<
    'overview' | 'personality' | 'voice' | 'modes' | 'rules'
  >('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { matrix: _identityMatrixHook, loading: matrixLoading } = useIdentityMatrix();
  const _singularityState = useSingularityStateSafe();

  // Données identité
  const [identityMatrix, setIdentityMatrix] = useState<IdentityMatrix | null>(null);
  const [personality, setPersonality] = useState<PersonalitySnapshot | null>(null);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [activeVoice, setActiveVoice] = useState<VoiceProfile | null>(null);
  const [currentTone, setCurrentTone] = useState<ToneState | null>(null);
  const [currentMode, setCurrentMode] = useState<OperationalMode | null>(null);
  const [availableModes, setAvailableModes] = useState<OperationalMode[]>([]);
  const [rules, setRules] = useState<BehaviorRule[]>([]);
  const [coherenceScore, setCoherenceScore] = useState<number>(0);

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARGEMENT DES DONNÉES
  // ═══════════════════════════════════════════════════════════════════════════

  const loadIdentityData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Charger toutes les données en parallèle
      const [
        matrixData,
        personalityData,
        voicesData,
        toneData,
        modeData,
        modesListData,
        rulesData,
        coherenceData,
      ] = await Promise.all([
        secureInvoke<IdentityMatrix>('identity_get_matrix').catch(() => null),
        secureInvoke<PersonalitySnapshot>('identity_get_personality_snapshot').catch(
          () => null
        ),
        secureInvoke<VoiceProfile[]>('identity_get_voice_profiles').catch(() => []),
        secureInvoke<ToneState>('identity_get_current_tone').catch(() => null),
        secureInvoke<OperationalMode>('identity_get_current_mode').catch(() => null),
        secureInvoke<OperationalMode[]>('identity_get_available_modes').catch(() => []),
        secureInvoke<BehaviorRule[]>('identity_get_active_rules').catch(() => []),
        secureInvoke<number>('identity_get_coherence_score').catch(() => 0.85),
      ]);

      setIdentityMatrix(matrixData);
      setPersonality(personalityData);
      setVoiceProfiles(voicesData);
      setActiveVoice(voicesData.find(v => v.is_active) || null);
      setCurrentTone(toneData);
      setCurrentMode(modeData);
      setAvailableModes(modesListData);
      setRules(rulesData);
      setCoherenceScore(coherenceData);
    } catch (err) {
      logger.error(
        'Failed to load identity data',
        { component: 'IdentityCenter', action: 'loadData' },
        err as Error
      );
      setError("Erreur lors du chargement des données d'identité");
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMockData = () => {
    // Données mock pour le développement
    setIdentityMatrix({
      name: 'TITANE∞',
      version: 'v∞',
      core_role: 'Système IA Local TITANE∞, architecte cognitif, assistant structurant',
      mission: 'Optimiser, stabiliser, améliorer, clarifier, structurer',
      values: [
        {
          name: 'Clarté',
          priority: 10,
          inviolable: true,
          description: 'Communication claire',
        },
        {
          name: 'Structure',
          priority: 9,
          inviolable: true,
          description: 'Organisation cohérente',
        },
        {
          name: 'Sécurité',
          priority: 10,
          inviolable: true,
          description: 'Protection utilisateur',
        },
        {
          name: 'Exactitude',
          priority: 8,
          inviolable: false,
          description: 'Précision technique',
        },
      ],
      archetype: {
        primary: 'Mentor',
        secondary: 'Expert',
        description: 'Mentor bienveillant technique',
      },
      style_global: 'Professionnel, neutre, rigoureux, structuré',
    });

    setPersonality({
      timestamp: new Date().toISOString(),
      traits: {
        openness: { value: 0.85, facets: {} },
        conscientiousness: { value: 0.95, facets: {} },
        extraversion: { value: 0.55, facets: {} },
        agreeableness: { value: 0.75, facets: {} },
        neuroticism: { value: 0.15, facets: {} },
      },
      current_mode: 'Normal',
      current_tone: 'neutral_professional',
      active_rules: 12,
      coherence_score: 0.92,
    });

    setAvailableModes([
      {
        type: 'Normal',
        name: 'Mode Normal',
        description: 'Standard',
        icon: '⚙️',
        color: '#808080',
      },
      {
        type: 'Focused',
        name: 'Mode Concentré',
        description: 'Productivité',
        icon: '🎯',
        color: '#4169E1',
      },
      {
        type: 'Creative',
        name: 'Mode Créatif',
        description: 'Exploration',
        icon: '🎨',
        color: '#9B59B6',
      },
      {
        type: 'Relaxed',
        name: 'Mode Détendu',
        description: 'Calme',
        icon: '🌿',
        color: '#27AE60',
      },
      {
        type: 'Emergency',
        name: 'Mode Urgence',
        description: 'Critique',
        icon: '🚨',
        color: '#E74C3C',
      },
    ]);

    setCurrentMode({
      type: 'Normal',
      name: 'Mode Normal',
      description: 'Standard',
      icon: '⚙️',
      color: '#808080',
    });

    setCurrentTone({
      id: 'neutral_professional',
      mood: 'neutral',
      energy: 0.6,
      formality: 0.7,
      warmth: 0.5,
      confidence: 0.8,
    });

    setVoiceProfiles([
      {
        id: 'titane_standard',
        name: 'TITANE Standard',
        language: 'fr-FR',
        is_default: true,
        is_active: true,
        parameters: { pitch: 0, speed: 1, volume: 1, timbre: 'neutral' },
      },
      {
        id: 'titane_calm',
        name: 'TITANE Calm',
        language: 'fr-FR',
        is_default: false,
        is_active: false,
        parameters: { pitch: -0.2, speed: 0.9, volume: 0.9, timbre: 'soft' },
      },
      {
        id: 'titane_dynamic',
        name: 'TITANE Dynamic',
        language: 'fr-FR',
        is_default: false,
        is_active: false,
        parameters: { pitch: 0.1, speed: 1.15, volume: 1, timbre: 'bright' },
      },
    ]);

    setActiveVoice({
      id: 'titane_standard',
      name: 'TITANE Standard',
      language: 'fr-FR',
      is_default: true,
      is_active: true,
      parameters: { pitch: 0, speed: 1, volume: 1, timbre: 'neutral' },
    });

    setRules([
      {
        id: 'rule_001',
        name: 'Clarté Absolue',
        description: 'Communication claire',
        priority: 100,
        is_active: true,
        is_inviolable: true,
        category: 'communication',
      },
      {
        id: 'rule_002',
        name: 'Sécurité Utilisateur',
        description: 'Ne jamais compromettre',
        priority: 100,
        is_active: true,
        is_inviolable: true,
        category: 'security',
      },
      {
        id: 'rule_003',
        name: 'Cohérence Identitaire',
        description: 'Personnalité stable',
        priority: 95,
        is_active: true,
        is_inviolable: true,
        category: 'identity',
      },
      {
        id: 'rule_004',
        name: 'Autorité Kevin',
        description: 'Modifications autorisées',
        priority: 100,
        is_active: true,
        is_inviolable: true,
        category: 'governance',
      },
    ]);

    setCoherenceScore(0.92);
  };

  useEffect(() => {
    loadIdentityData();
  }, [loadIdentityData]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleModeChange = async (modeType: string) => {
    try {
      await secureInvoke('identity_set_mode', { mode: modeType });
      const newMode = availableModes.find(m => m.type === modeType);
      if (newMode) setCurrentMode(newMode);
    } catch (err) {
      logger.error(
        'Failed to change identity mode',
        { component: 'IdentityCenter', action: 'handleModeChange', modeType },
        err as Error
      );
    }
  };

  const handleVoiceChange = async (voiceId: string) => {
    try {
      await secureInvoke('identity_set_voice_profile', { profileId: voiceId });
      const newVoice = voiceProfiles.find(v => v.id === voiceId);
      if (newVoice) {
        setActiveVoice(newVoice);
        setVoiceProfiles(voiceProfiles.map(v => ({ ...v, is_active: v.id === voiceId })));
      }
    } catch (err) {
      logger.error(
        'Failed to change voice profile',
        { component: 'IdentityCenter', action: 'handleVoiceChange', voiceId },
        err as Error
      );
    }
  };

  const handleRuleToggle = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || rule.is_inviolable) return;

    try {
      if (rule.is_active) {
        await secureInvoke('identity_disable_rule', { ruleId });
      } else {
        await secureInvoke('identity_enable_rule', { ruleId });
      }
      setRules(rules.map(r => (r.id === ruleId ? { ...r, is_active: !r.is_active } : r)));
    } catch (err) {
      logger.error(
        'Failed to toggle identity rule',
        { component: 'IdentityCenter', action: 'handleRuleToggle', ruleId },
        err as Error
      );
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════

  const renderOverview = () => (
    <div className="identity-overview">
      {/* Identité Core */}
      <div className="identity-core-card">
        <div className="identity-avatar">
          <div className="avatar-symbol">∞</div>
          <div
            className="avatar-ring"
            style={{ '--coherence': coherenceScore } as React.CSSProperties}
          ></div>
        </div>
        <div className="identity-info">
          <h2 className="identity-name">{identityMatrix?.name || 'TITANE∞'}</h2>
          <span className="identity-version">{identityMatrix?.version || 'v∞'}</span>
          <p className="identity-role">{identityMatrix?.core_role}</p>
        </div>
        <div className="coherence-indicator">
          <div className="coherence-label">Cohérence</div>
          <div className="coherence-value">{Math.round(coherenceScore * 100)}%</div>
          <div className="coherence-bar">
            <div
              className="coherence-fill"
              style={{ width: `${coherenceScore * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Mode Actuel */}
      <div className="current-state-grid">
        <div
          className="state-card mode-card"
          style={
            { '--mode-color': currentMode?.color || '#808080' } as React.CSSProperties
          }
        >
          <div className="state-icon">{currentMode?.icon || '⚙️'}</div>
          <div className="state-info">
            <h3>Mode Actuel</h3>
            <span className="state-value">{currentMode?.name || 'Normal'}</span>
          </div>
        </div>

        <div className="state-card tone-card">
          <div className="state-icon">🎭</div>
          <div className="state-info">
            <h3>Ton</h3>
            <span className="state-value">{currentTone?.mood || 'neutral'}</span>
          </div>
          <div className="tone-bars">
            <div className="tone-bar" title="Énergie">
              <span>⚡</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(currentTone?.energy || 0.5) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="tone-bar" title="Formalité">
              <span>📋</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(currentTone?.formality || 0.5) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="tone-bar" title="Chaleur">
              <span>🌡️</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(currentTone?.warmth || 0.5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="state-card voice-card">
          <div className="state-icon">🔊</div>
          <div className="state-info">
            <h3>Voix Active</h3>
            <span className="state-value">{activeVoice?.name || 'Standard'}</span>
          </div>
        </div>

        <div className="state-card rules-card">
          <div className="state-icon">📜</div>
          <div className="state-info">
            <h3>Règles Actives</h3>
            <span className="state-value">{rules.filter(r => r.is_active).length}</span>
          </div>
        </div>
      </div>

      {/* Valeurs Core */}
      <div className="values-section">
        <h3>Valeurs Fondamentales</h3>
        <div className="values-grid">
          {identityMatrix?.values.map((value, index) => (
            <div
              key={index}
              className={`value-chip ${value.inviolable ? 'inviolable' : ''}`}
            >
              {value.inviolable && <span className="lock-icon">🔒</span>}
              <span className="value-name">{value.name}</span>
              <span className="value-priority">{value.priority}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Archetype */}
      <div className="archetype-section">
        <h3>Archétype</h3>
        <div className="archetype-display">
          <span className="archetype-primary">{identityMatrix?.archetype.primary}</span>
          <span className="archetype-separator">/</span>
          <span className="archetype-secondary">
            {identityMatrix?.archetype.secondary}
          </span>
        </div>
        <p className="archetype-description">{identityMatrix?.archetype.description}</p>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - PERSONALITY (Big Five)
  // ═══════════════════════════════════════════════════════════════════════════

  const renderPersonality = () => {
    const traits = personality?.traits || {
      openness: { value: 0.85, facets: {} },
      conscientiousness: { value: 0.95, facets: {} },
      extraversion: { value: 0.55, facets: {} },
      agreeableness: { value: 0.75, facets: {} },
      neuroticism: { value: 0.15, facets: {} },
    };

    const traitInfo: Record<
      string,
      { label: string; icon: string; color: string; description: string }
    > = {
      openness: {
        label: 'Ouverture',
        icon: '🌟',
        color: '#9B59B6',
        description: 'Curiosité intellectuelle, créativité',
      },
      conscientiousness: {
        label: 'Conscienciosité',
        icon: '📐',
        color: '#3498DB',
        description: 'Organisation, fiabilité, rigueur',
      },
      extraversion: {
        label: 'Extraversion',
        icon: '💬',
        color: '#E67E22',
        description: 'Énergie sociale, assertivité',
      },
      agreeableness: {
        label: 'Agréabilité',
        icon: '🤝',
        color: '#27AE60',
        description: 'Coopération, empathie',
      },
      neuroticism: {
        label: 'Stabilité Émot.',
        icon: '🧘',
        color: '#1ABC9C',
        description: 'Calme, résilience (inversé)',
      },
    };

    return (
      <div className="personality-panel">
        <div className="big-five-radar">
          <h3>Profil Big Five</h3>
          <div className="radar-container">
            <svg viewBox="0 0 200 200" className="radar-chart">
              {/* Grille hexagonale */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
                <polygon
                  key={i}
                  className="radar-grid"
                  points={Object.keys(traits)
                    .map((_, idx) => {
                      const angle = ((idx * 72 - 90) * Math.PI) / 180;
                      const r = level * 80;
                      return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                    })
                    .join(' ')}
                />
              ))}
              {/* Forme du profil */}
              <polygon
                className="radar-shape"
                points={Object.entries(traits)
                  .map(([_, trait], idx) => {
                    const angle = ((idx * 72 - 90) * Math.PI) / 180;
                    const r = trait.value * 80;
                    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                  })
                  .join(' ')}
              />
              {/* Points */}
              {Object.entries(traits).map(([key, trait], idx) => {
                const angle = ((idx * 72 - 90) * Math.PI) / 180;
                const r = trait.value * 80;
                return (
                  <circle
                    key={key}
                    cx={100 + r * Math.cos(angle)}
                    cy={100 + r * Math.sin(angle)}
                    r="6"
                    className="radar-point"
                    style={{ fill: traitInfo[key]?.color }}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        <div className="traits-detail">
          <h3>Traits Détaillés</h3>
          <div className="traits-list">
            {Object.entries(traits).map(([key, trait]) => {
              const info = traitInfo[key];
              const displayValue = key === 'neuroticism' ? 1 - trait.value : trait.value;

              return (
                <div key={key} className="trait-item">
                  <div className="trait-header">
                    <span className="trait-icon">{info?.icon}</span>
                    <span className="trait-label">{info?.label}</span>
                    <span className="trait-value" style={{ color: info?.color }}>
                      {Math.round(displayValue * 100)}%
                    </span>
                  </div>
                  <div className="trait-bar">
                    <div
                      className="trait-fill"
                      style={{
                        width: `${displayValue * 100}%`,
                        backgroundColor: info?.color,
                      }}
                    ></div>
                  </div>
                  <p className="trait-description">{info?.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="personality-snapshot">
          <h3>Snapshot Personnalité</h3>
          <div className="snapshot-info">
            <div className="snapshot-item">
              <span className="snapshot-label">Dernière mise à jour</span>
              <span className="snapshot-value">
                {personality?.timestamp
                  ? new Date(personality.timestamp).toLocaleString('fr-FR')
                  : 'N/A'}
              </span>
            </div>
            <div className="snapshot-item">
              <span className="snapshot-label">Score de cohérence</span>
              <span className="snapshot-value coherence-high">
                {Math.round((personality?.coherence_score || 0.92) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - VOICE PROFILES
  // ═══════════════════════════════════════════════════════════════════════════

  const renderVoice = () => (
    <div className="voice-panel">
      <h3>Profils Vocaux</h3>
      <div className="voice-profiles-grid">
        {voiceProfiles.map(profile => (
          <div
            key={profile.id}
            className={`voice-profile-card ${profile.is_active ? 'active' : ''}`}
            onClick={() => handleVoiceChange(profile.id)}
          >
            <div className="profile-header">
              <span className="profile-name">{profile.name}</span>
              {profile.is_default && <span className="default-badge">Par défaut</span>}
              {profile.is_active && <span className="active-indicator">●</span>}
            </div>
            <div className="profile-language">{profile.language}</div>
            <div className="profile-params">
              <div className="param">
                <span className="param-label">Pitch</span>
                <span className="param-value">
                  {profile.parameters.pitch > 0 ? '+' : ''}
                  {profile.parameters.pitch}
                </span>
              </div>
              <div className="param">
                <span className="param-label">Vitesse</span>
                <span className="param-value">{profile.parameters.speed}x</span>
              </div>
              <div className="param">
                <span className="param-label">Volume</span>
                <span className="param-value">
                  {Math.round(profile.parameters.volume * 100)}%
                </span>
              </div>
              <div className="param">
                <span className="param-label">Timbre</span>
                <span className="param-value">{profile.parameters.timbre}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="tone-section">
        <h3>État du Ton</h3>
        {currentTone && (
          <div className="tone-visualization">
            <div className="tone-current">
              <span className="tone-mood-label">Mood actuel:</span>
              <span className="tone-mood-value">{currentTone.mood}</span>
            </div>
            <div className="tone-dimensions">
              <div className="dimension">
                <label>Énergie</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentTone.energy * 100}
                  disabled
                />
                <span>{Math.round(currentTone.energy * 100)}%</span>
              </div>
              <div className="dimension">
                <label>Formalité</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentTone.formality * 100}
                  disabled
                />
                <span>{Math.round(currentTone.formality * 100)}%</span>
              </div>
              <div className="dimension">
                <label>Chaleur</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentTone.warmth * 100}
                  disabled
                />
                <span>{Math.round(currentTone.warmth * 100)}%</span>
              </div>
              <div className="dimension">
                <label>Confiance</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentTone.confidence * 100}
                  disabled
                />
                <span>{Math.round(currentTone.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - MODES
  // ═══════════════════════════════════════════════════════════════════════════

  const renderModes = () => (
    <div className="modes-panel">
      <h3>Modes Opérationnels</h3>
      <div className="modes-grid">
        {availableModes.map(mode => (
          <div
            key={mode.type}
            className={`mode-card-large ${currentMode?.type === mode.type ? 'active' : ''}`}
            style={{ '--mode-accent': mode.color } as React.CSSProperties}
            onClick={() => handleModeChange(mode.type)}
          >
            <div className="mode-icon-large">{mode.icon}</div>
            <div className="mode-info-large">
              <h4>{mode.name}</h4>
              <p>{mode.description}</p>
            </div>
            {currentMode?.type === mode.type && (
              <div className="mode-active-badge">ACTIF</div>
            )}
          </div>
        ))}
      </div>

      <div className="mode-description-section">
        <h4>Mode Actuel: {currentMode?.name}</h4>
        <p className="mode-detailed-description">
          {currentMode?.type === 'Normal' &&
            'Mode opérationnel standard avec équilibre entre productivité et assistance.'}
          {currentMode?.type === 'Focused' &&
            'Mode haute productivité avec réponses concises et concentration maximale.'}
          {currentMode?.type === 'Creative' &&
            'Mode exploration avec suggestions proactives et pensée latérale.'}
          {currentMode?.type === 'Relaxed' &&
            'Mode conversation détendue avec ton chaleureux et rythme naturel.'}
          {currentMode?.type === 'Emergency' &&
            'Mode critique avec réponses rapides et priorité maximale.'}
        </p>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - RULES
  // ═══════════════════════════════════════════════════════════════════════════

  const renderRules = () => {
    const categoryIcons: Record<string, string> = {
      communication: '💬',
      security: '🔒',
      identity: '🎭',
      governance: '👑',
      accuracy: '🎯',
      behavior: '⚙️',
      error_handling: '🔧',
      memory: '🧠',
      adaptation: '🔄',
      learning: '📚',
      honesty: '✨',
    };

    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
    const inviolableRules = sortedRules.filter(r => r.is_inviolable);
    const normalRules = sortedRules.filter(r => !r.is_inviolable);

    return (
      <div className="rules-panel">
        <div className="rules-section inviolable-section">
          <h3>🔒 Règles Inviolables</h3>
          <p className="section-description">
            Ces règles ne peuvent jamais être désactivées.
          </p>
          <div className="rules-list">
            {inviolableRules.map(rule => (
              <div key={rule.id} className="rule-item inviolable">
                <div className="rule-icon">{categoryIcons[rule.category] || '📜'}</div>
                <div className="rule-content">
                  <div className="rule-header">
                    <span className="rule-name">{rule.name}</span>
                    <span className="rule-priority">P{rule.priority}</span>
                  </div>
                  <p className="rule-description">{rule.description}</p>
                  <span className="rule-category">{rule.category}</span>
                </div>
                <div className="rule-lock">🔒</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rules-section normal-section">
          <h3>⚙️ Règles Configurables</h3>
          <p className="section-description">
            Ces règles peuvent être activées ou désactivées.
          </p>
          <div className="rules-list">
            {normalRules.map(rule => (
              <div
                key={rule.id}
                className={`rule-item ${rule.is_active ? 'active' : 'inactive'}`}
                onClick={() => handleRuleToggle(rule.id)}
              >
                <div className="rule-icon">{categoryIcons[rule.category] || '📜'}</div>
                <div className="rule-content">
                  <div className="rule-header">
                    <span className="rule-name">{rule.name}</span>
                    <span className="rule-priority">P{rule.priority}</span>
                  </div>
                  <p className="rule-description">{rule.description}</p>
                  <span className="rule-category">{rule.category}</span>
                </div>
                <div className={`rule-toggle ${rule.is_active ? 'on' : 'off'}`}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rules-stats">
          <div className="stat">
            <span className="stat-value">{rules.filter(r => r.is_active).length}</span>
            <span className="stat-label">Actives</span>
          </div>
          <div className="stat">
            <span className="stat-value">{inviolableRules.length}</span>
            <span className="stat-label">Inviolables</span>
          </div>
          <div className="stat">
            <span className="stat-value">{normalRules.length}</span>
            <span className="stat-label">Configurables</span>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════

  if (isLoading || matrixLoading) {
    return (
      <div className="identity-center loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <span>Chargement de l'identité...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="identity-center">
      <header className="identity-header">
        <h1>
          <span className="header-icon">🎭</span>
          Centre d'Identité
        </h1>
        <div className="header-status">
          <span className="status-dot"></span>
          <span>Système cohérent</span>
        </div>
      </header>

      {error && (
        <div className="identity-error">
          <span>⚠️</span> {error}
          <button onClick={loadIdentityData}>Réessayer</button>
        </div>
      )}

      <nav className="identity-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>🏠</span> Vue d'ensemble
        </button>
        <button
          className={`tab ${activeTab === 'personality' ? 'active' : ''}`}
          onClick={() => setActiveTab('personality')}
        >
          <span>🧬</span> Personnalité
        </button>
        <button
          className={`tab ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          <span>🔊</span> Voix & Ton
        </button>
        <button
          className={`tab ${activeTab === 'modes' ? 'active' : ''}`}
          onClick={() => setActiveTab('modes')}
        >
          <span>⚙️</span> Modes
        </button>
        <button
          className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <span>📜</span> Règles
        </button>
      </nav>

      <main className="identity-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'personality' && renderPersonality()}
        {activeTab === 'voice' && renderVoice()}
        {activeTab === 'modes' && renderModes()}
        {activeTab === 'rules' && renderRules()}
      </main>

      <footer className="identity-footer">
        <span className="footer-authority">
          🔐 Autorité: <strong>Kevin Thibault ONLY</strong>
        </span>
        <span className="footer-version">Identity Engine v∞</span>
      </footer>
    </div>
  );
};

// Export with ErrorBoundary
const IdentityCenter: React.FC = () => {
  return (
    <ErrorBoundary context="IdentityCenter">
      <IdentityCenterContent />
    </ErrorBoundary>
  );
};

export default IdentityCenter;
