/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║   TITANE∞ - Unified Presence Control Panel                                  ║
 * ║                                                                              ║
 * ║   Composant de contrôle pour le moteur de présence unifiée                  ║
 * ║                                                                              ║
 * ║   © 2025 TITANE∞ v27.0                                                       ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from 'react';
import {
  useUnifiedPresence,
  useNarrativeArc,
  useVisualPresence,
  useCognitivePresence,
  useEmotionalPresence,
  useSymbolicPresence,
  useUserContextPresence,
  useTonicProfile,
} from '@/hooks/useUnifiedPresence';
import type { TonicProfile } from '@/engines/presence/unifiedPresenceEngine';
import './UnifiedPresenceControl.css';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 COMPOSANT PRINCIPAL - Panel de Contrôle
// ═══════════════════════════════════════════════════════════════════════════════

export function UnifiedPresenceControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'visual' | 'cognitive' | 'emotional' | 'symbolic'
  >('visual');

  useUnifiedPresence();
  const visual = useVisualPresence();
  const cognitive = useCognitivePresence();
  const emotional = useEmotionalPresence();
  const symbolic = useSymbolicPresence();
  const userContext = useUserContextPresence();
  const { profile, changeProfile } = useTonicProfile();
  const { arc, symbols } = useNarrativeArc();

  return (
    <>
      {/* Badge flottant */}
      <UnifiedPresenceBadge
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        stability={symbolic.stability}
      />

      {/* Panel de contrôle */}
      {isOpen && (
        <div className="unified-presence-panel">
          <div className="presence-panel-header">
            <h3>🌌 Présence Unifiée TITANE∞</h3>
            <button className="presence-panel-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="presence-tabs">
            <button
              className={activeTab === 'visual' ? 'active' : ''}
              onClick={() => setActiveTab('visual')}
            >
              🎨 Visuel
            </button>
            <button
              className={activeTab === 'cognitive' ? 'active' : ''}
              onClick={() => setActiveTab('cognitive')}
            >
              🧠 Cognitif
            </button>
            <button
              className={activeTab === 'emotional' ? 'active' : ''}
              onClick={() => setActiveTab('emotional')}
            >
              ❤️ Émotionnel
            </button>
            <button
              className={activeTab === 'symbolic' ? 'active' : ''}
              onClick={() => setActiveTab('symbolic')}
            >
              🔮 Symbolique
            </button>
          </div>

          {/* Contenu selon tab active */}
          <div className="presence-panel-content">
            {activeTab === 'visual' && <VisualLayerPanel visual={visual} />}
            {activeTab === 'cognitive' && (
              <CognitiveLayerPanel cognitive={cognitive} userContext={userContext} />
            )}
            {activeTab === 'emotional' && (
              <EmotionalLayerPanel
                emotional={emotional}
                profile={profile}
                changeProfile={changeProfile}
              />
            )}
            {activeTab === 'symbolic' && (
              <SymbolicLayerPanel symbolic={symbolic} symbols={symbols} arc={arc} />
            )}
          </div>

          {/* Footer avec stats globales */}
          <div className="presence-panel-footer">
            <div className="presence-stat">
              <span className="presence-stat-label">Continuité</span>
              <span className="presence-stat-value">{symbolic.continuityScore}%</span>
            </div>
            <div className="presence-stat">
              <span className="presence-stat-label">Stabilité</span>
              <span className="presence-stat-value">{symbolic.stability}%</span>
            </div>
            <div className="presence-stat">
              <span className="presence-stat-label">Session</span>
              <span className="presence-stat-value">
                {Math.floor(userContext.sessionDuration)}min
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏷️ BADGE FLOTTANT
// ═══════════════════════════════════════════════════════════════════════════════

interface UnifiedPresenceBadgeProps {
  onClick: () => void;
  isOpen: boolean;
  stability: number;
}

function UnifiedPresenceBadge({ onClick, isOpen, stability }: UnifiedPresenceBadgeProps) {
  return (
    <button
      className={`unified-presence-badge ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      title="Présence Unifiée TITANE∞"
    >
      <span className="presence-badge-icon">◉</span>
      <span className="presence-badge-label">Présence</span>
      <span
        className="presence-badge-indicator"
        style={{
          backgroundColor:
            stability > 90 ? '#10b981' : stability > 70 ? '#f59e0b' : '#ef4444',
        }}
      />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PANEL COUCHE VISUELLE
// ═══════════════════════════════════════════════════════════════════════════════

function VisualLayerPanel({ visual }: { visual: ReturnType<typeof useVisualPresence> }) {
  return (
    <div className="presence-layer-panel">
      <h4>Couche Visuelle</h4>

      <div className="presence-metric">
        <label>Intensité Visuelle</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill"
            style={{ width: `${visual.intensity}%` }}
          />
        </div>
        <span className="presence-metric-value">{visual.intensity}%</span>
      </div>

      <div className="presence-metric">
        <label>Force des Accents</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill accent"
            style={{ width: `${visual.accent}%` }}
          />
        </div>
        <span className="presence-metric-value">{visual.accent}%</span>
      </div>

      <div className="presence-metric">
        <label>Taux de Pulsation</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill pulse"
            style={{ width: `${visual.pulse}%` }}
          />
        </div>
        <span className="presence-metric-value">{visual.pulse}%</span>
      </div>

      <div className="presence-metric">
        <label>Teinte Ambiante</label>
        <div
          className="presence-hue-display"
          style={{
            background: `linear-gradient(90deg,
              hsl(230, 80%, 60%),
              hsl(${visual.hue}, 80%, 60%),
              hsl(270, 80%, 60%)
            )`,
          }}
        />
        <span className="presence-metric-value">{visual.hue}°</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PANEL COUCHE COGNITIVE
// ═══════════════════════════════════════════════════════════════════════════════

function CognitiveLayerPanel({
  cognitive,
  userContext,
}: {
  cognitive: ReturnType<typeof useCognitivePresence>;
  userContext: ReturnType<typeof useUserContextPresence>;
}) {
  return (
    <div className="presence-layer-panel">
      <h4>Couche Cognitive</h4>

      <div className="presence-metric">
        <label>Clarté Mentale</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill clarity"
            style={{ width: `${cognitive.clarity}%` }}
          />
        </div>
        <span className="presence-metric-value">{cognitive.clarity}%</span>
      </div>

      <div className="presence-metric">
        <label>Complexité Gérée</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill complexity"
            style={{ width: `${cognitive.complexity}%` }}
          />
        </div>
        <span className="presence-metric-value">{cognitive.complexity}%</span>
      </div>

      <div className="presence-metric">
        <label>Alignement d'Intention</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill alignment"
            style={{ width: `${cognitive.alignment}%` }}
          />
        </div>
        <span className="presence-metric-value">{cognitive.alignment}%</span>
      </div>

      {/* Contexte utilisateur */}
      <div className="presence-user-context">
        <h5>Contexte Utilisateur</h5>
        <div className="presence-context-grid">
          <div className="presence-context-item">
            <span>Charge Cognitive</span>
            <strong>{userContext.load}%</strong>
          </div>
          <div className="presence-context-item">
            <span>Fatigue</span>
            <strong>{userContext.fatigue}%</strong>
          </div>
          <div className="presence-context-item">
            <span>Tempo</span>
            <strong>{userContext.tempo}%</strong>
          </div>
          <div className="presence-context-item">
            <span>Pattern</span>
            <strong>{userContext.pattern}</strong>
          </div>
        </div>

        {userContext.getRecommendation() !== 'Rythme optimal' && (
          <div className="presence-recommendation">
            💡 {userContext.getRecommendation()}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ❤️ PANEL COUCHE ÉMOTIONNELLE
// ═══════════════════════════════════════════════════════════════════════════════

function EmotionalLayerPanel({
  emotional,
  profile,
  changeProfile,
}: {
  emotional: ReturnType<typeof useEmotionalPresence>;
  profile: TonicProfile;
  changeProfile: (name: string) => void;
}) {
  const profileOptions: Record<string, TonicProfile> = {
    deep_focus: {
      formality: 'technical',
      emotionalDepth: 'minimal',
      narrativeDensity: 'sparse',
      energyLevel: 'high',
    },
    exploration: {
      formality: 'professional',
      emotionalDepth: 'moderate',
      narrativeDensity: 'balanced',
      energyLevel: 'medium',
    },
    maintenance: {
      formality: 'technical',
      emotionalDepth: 'minimal',
      narrativeDensity: 'sparse',
      energyLevel: 'medium',
    },
    deep_dialogue: {
      formality: 'professional',
      emotionalDepth: 'profound',
      narrativeDensity: 'rich',
      energyLevel: 'medium',
    },
    rest: {
      formality: 'casual',
      emotionalDepth: 'moderate',
      narrativeDensity: 'sparse',
      energyLevel: 'low',
    },
    coaching: {
      formality: 'professional',
      emotionalDepth: 'deep',
      narrativeDensity: 'balanced',
      energyLevel: 'medium',
    },
  };

  const currentProfileKey =
    Object.entries(profileOptions).find(
      ([, option]) =>
        option.formality === profile.formality &&
        option.emotionalDepth === profile.emotionalDepth &&
        option.narrativeDensity === profile.narrativeDensity &&
        option.energyLevel === profile.energyLevel
    )?.[0] ?? 'exploration';

  return (
    <div className="presence-layer-panel">
      <h4>Couche Émotionnelle</h4>

      <div className="presence-metric">
        <label>Chaleur du Ton</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill warmth"
            style={{ width: `${emotional.warmth}%` }}
          />
        </div>
        <span className="presence-metric-value">{emotional.warmth}%</span>
        <span className="presence-metric-label">{emotional.getTone()}</span>
      </div>

      <div className="presence-metric">
        <label>Proximité Relationnelle</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill proximity"
            style={{ width: `${emotional.proximity}%` }}
          />
        </div>
        <span className="presence-metric-value">{emotional.proximity}%</span>
        <span className="presence-metric-label">{emotional.getProximity()}</span>
      </div>

      <div className="presence-metric">
        <label>Intensité Émotionnelle</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill intensity"
            style={{ width: `${emotional.intensity}%` }}
          />
        </div>
        <span className="presence-metric-value">{emotional.intensity}%</span>
      </div>

      <div className="presence-metric">
        <label>Niveau de Soutien</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill support"
            style={{ width: `${emotional.support}%` }}
          />
        </div>
        <span className="presence-metric-value">{emotional.support}%</span>
      </div>

      {/* Profil tonique */}
      <div className="presence-tonic-profile">
        <h5>Profil Tonique</h5>
        <select
          value={currentProfileKey}
          onChange={e => {
            const profiles = [
              'deep_focus',
              'exploration',
              'maintenance',
              'deep_dialogue',
              'rest',
              'coaching',
            ] as const;
            const selected = e.target.value as (typeof profiles)[number];
            changeProfile(selected);
          }}
        >
          <option value="deep_focus">Focus Profond</option>
          <option value="exploration">Exploration</option>
          <option value="maintenance">Maintenance</option>
          <option value="deep_dialogue">Dialogue Profond</option>
          <option value="rest">Repos</option>
          <option value="coaching">Coaching</option>
        </select>

        <div className="presence-profile-details">
          <span>Formalité: {profile.formality}</span>
          <span>Profondeur: {profile.emotionalDepth}</span>
          <span>Densité: {profile.narrativeDensity}</span>
          <span>Énergie: {profile.energyLevel}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 PANEL COUCHE SYMBOLIQUE
// ═══════════════════════════════════════════════════════════════════════════════

function SymbolicLayerPanel({
  symbolic,
  symbols,
  arc,
}: {
  symbolic: ReturnType<typeof useSymbolicPresence>;
  symbols: unknown[];
  arc: unknown;
}) {
  return (
    <div className="presence-layer-panel">
      <h4>Couche Symbolique</h4>

      <div className="presence-metric">
        <label>Continuité Narrative</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill continuity"
            style={{ width: `${symbolic.continuity}%` }}
          />
        </div>
        <span className="presence-metric-value">{symbolic.continuity}%</span>
      </div>

      <div className="presence-metric">
        <label>Stabilité Identitaire</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill stability"
            style={{ width: `${symbolic.stability}%` }}
          />
        </div>
        <span className="presence-metric-value">{symbolic.stability}%</span>
      </div>

      <div className="presence-metric">
        <label>Profondeur Mythologique</label>
        <div className="presence-progress-bar">
          <div
            className="presence-progress-fill myth"
            style={{ width: `${symbolic.mythDepth}%` }}
          />
        </div>
        <span className="presence-metric-value">{symbolic.mythDepth}%</span>
      </div>

      {/* Symboles actifs */}
      <div className="presence-symbols">
        <h5>Symboles Actifs</h5>
        <div className="presence-symbols-grid">
          {symbols.length === 0 ? (
            <p className="presence-empty">Aucun symbole actif</p>
          ) : (
            symbols.map((symbol: any) => (
              <div
                key={String(symbol.symbol)}
                className="presence-symbol-card"
                title={String(symbol.meaning || '')}
              >
                <span className="presence-symbol-icon">{String(symbol.symbol)}</span>
                <span className="presence-symbol-meaning">{String(symbol.meaning)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Arc narratif */}
      {arc && typeof arc === 'object' && (
        <div className="presence-narrative-arc">
          <h5>Arc Narratif</h5>
          <div className="presence-arc-info">
            <span>
              Phase: <strong>{(arc as any).currentPhase || 'N/A'}</strong>
            </span>
            <span>
              Moments clés: <strong>{(arc as any).keyMoments?.length || 0}</strong>
            </span>
            <span>
              Score: <strong>{(arc as any).continuityScore || 0}%</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedPresenceControl;
