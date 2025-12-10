/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React, { useMemo } from 'react';
import type {
  EvolutionPhaseId,
  EvolutionState,
  Capability,
  CapabilityStatus,
} from '../../services/evolution/evolutionIA.config';
import {
  EVOLUTION_PHASES,
  getPhaseProgress,
  getNextPhase,
  canTransitionToPhase,
  getUnlockableCapabilities,
  CAPABILITY_CATEGORY_LABELS,
  TIER_COLORS,
  TOTAL_CAPABILITIES,
} from '../../services/evolution/evolutionIA.config';
import {
  calculateLevel,
  levelProgress,
  xpToNextLevel,
} from '../../services/xp/xpExtended.config';
import './EvolutionTracker.css';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface EvolutionTrackerProps {
  /** XP total */
  totalXP: number;
  /** État d'évolution (optionnel - si pas fourni, utilise l'état initial) */
  evolutionState?: EvolutionState;
  /** Callback pour débloquer une capability */
  onUnlockCapability?: (capabilityId: string) => void;
  /** Mode compact */
  compact?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

interface CapabilityCardProps {
  capability: Capability;
  status: CapabilityStatus;
  canUnlock: boolean;
  onUnlock: () => void;
}

interface PhaseIndicatorProps {
  phase: EvolutionPhaseId;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT: PhaseIndicator
// ─────────────────────────────────────────────────────────────────────────────

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  phase,
  isActive,
  isCompleted,
  progress,
}) => {
  const phaseData = EVOLUTION_PHASES[phase];

  return (
    <div
      className={`phase-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
      style={{ '--phase-color': phaseData.color } as React.CSSProperties}
      title={`${phaseData.name}: ${phaseData.description}`}
    >
      <div className="phase-indicator__icon">{isCompleted ? '✓' : phaseData.icon}</div>
      <div className="phase-indicator__name">{phaseData.name}</div>
      {isActive && (
        <div className="phase-indicator__progress">
          <div
            className="phase-indicator__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT: CapabilityCard
// ─────────────────────────────────────────────────────────────────────────────

const CapabilityCard: React.FC<CapabilityCardProps> = ({
  capability,
  status,
  canUnlock,
  onUnlock,
}) => {
  const categoryInfo = CAPABILITY_CATEGORY_LABELS[capability.category];
  const tierColor = TIER_COLORS[capability.tier];

  return (
    <div
      className={`capability-card ${status}`}
      style={{ '--tier-color': tierColor } as React.CSSProperties}
    >
      <div className="capability-card__header">
        <span className="capability-card__icon">{capability.icon}</span>
        <span className="capability-card__tier">T{capability.tier}</span>
      </div>

      <div className="capability-card__name">{capability.name}</div>

      <div className="capability-card__category">
        <span>{categoryInfo.icon}</span>
        <span>{categoryInfo.label}</span>
      </div>

      {status === 'unlockable' && canUnlock && (
        <button className="capability-card__unlock-btn" onClick={onUnlock}>
          Débloquer ({capability.talentCost} pt)
        </button>
      )}

      {status === 'unlocked' && (
        <div className="capability-card__status-badge unlocked">✓ Débloqué</div>
      )}

      {status === 'mastered' && (
        <div className="capability-card__status-badge mastered">⭐ Maîtrisé</div>
      )}

      {status === 'locked' && (
        <div className="capability-card__status-badge locked">🔒 Verrouillé</div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT: XPBar
// ─────────────────────────────────────────────────────────────────────────────

const XPBar: React.FC<{ totalXP: number; compact?: boolean }> = ({
  totalXP,
  compact,
}) => {
  const level = calculateLevel(totalXP);
  const progress = levelProgress(totalXP);
  const remaining = xpToNextLevel(totalXP);

  return (
    <div className={`xp-bar ${compact ? 'compact' : ''}`}>
      <div className="xp-bar__header">
        <span className="xp-bar__level">Niveau {level}</span>
        <span className="xp-bar__xp">{totalXP.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar__track">
        <div className="xp-bar__fill" style={{ width: `${progress}%` }} />
      </div>
      {!compact && (
        <div className="xp-bar__footer">
          <span>
            {remaining} XP pour niveau {level + 1}
          </span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL: EvolutionTracker
// ─────────────────────────────────────────────────────────────────────────────

export const EvolutionTracker: React.FC<EvolutionTrackerProps> = ({
  totalXP,
  evolutionState,
  onUnlockCapability,
  compact = false,
  className = '',
}) => {
  const level = calculateLevel(totalXP);

  // Phase actuelle (depuis state ou calculée)
  const currentPhase = evolutionState?.currentPhase || 'phase_1_nascent';
  const currentPhaseData = EVOLUTION_PHASES[currentPhase];

  // Capabilities débloquées
  const unlockedCapabilities = useMemo(() => {
    if (evolutionState?.capabilities) {
      return Object.keys(evolutionState.capabilities).filter(
        id =>
          evolutionState.capabilities[id].status === 'unlocked' ||
          evolutionState.capabilities[id].status === 'mastered'
      );
    }
    // Par défaut: capabilities initiales de la phase 1
    return EVOLUTION_PHASES.phase_1_nascent.unlockedCapabilities;
  }, [evolutionState]);

  // Progression vers prochaine phase
  const phaseProgress = useMemo(() => {
    return getPhaseProgress(currentPhase, level, totalXP, unlockedCapabilities);
  }, [currentPhase, level, totalXP, unlockedCapabilities]);

  // Prochaine phase
  const nextPhase = getNextPhase(currentPhase);
  const nextPhaseData = nextPhase ? EVOLUTION_PHASES[nextPhase] : null;

  // Vérifier si transition possible
  const transitionCheck = useMemo(() => {
    if (!nextPhase) return { possible: false, missingRequirements: [] };
    return canTransitionToPhase(
      nextPhase,
      level,
      totalXP,
      unlockedCapabilities,
      evolutionState?.stats || {
        totalCapabilitiesUnlocked: unlockedCapabilities.length,
        totalCapabilitiesMastered: 0,
        totalPhaseTransitions: 0,
        totalDaysActive: 1,
        totalAutomationsRun: 0,
        totalMessagesSent: 0,
        totalProjectsAnalyzed: 0,
        firstActivation: Date.now(),
        lastActivity: Date.now(),
      }
    );
  }, [nextPhase, level, totalXP, unlockedCapabilities, evolutionState?.stats]);

  // Capabilities débloquables
  const unlockableCapabilities = useMemo(() => {
    return getUnlockableCapabilities(level, currentPhase, unlockedCapabilities);
  }, [level, currentPhase, unlockedCapabilities]);

  // Toutes les phases pour affichage
  const allPhases = Object.values(EVOLUTION_PHASES).sort((a, b) => a.order - b.order);

  if (compact) {
    return (
      <div className={`evolution-tracker compact ${className}`}>
        <div className="evolution-tracker__compact-header">
          <span
            className="evolution-tracker__phase-badge"
            style={{ background: currentPhaseData.color }}
          >
            {currentPhaseData.icon} {currentPhaseData.name}
          </span>
          <XPBar totalXP={totalXP} compact />
        </div>
        <div className="evolution-tracker__compact-stats">
          <span>
            🌟 {unlockedCapabilities.length}/{TOTAL_CAPABILITIES} capabilities
          </span>
          <span>
            📈 {phaseProgress}% vers {nextPhaseData?.name || 'OMEGA'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`evolution-tracker ${className}`}>
      {/* Header avec phase actuelle */}
      <div className="evolution-tracker__header">
        <div
          className="evolution-tracker__current-phase"
          style={{ '--phase-color': currentPhaseData.color } as React.CSSProperties}
        >
          <span className="evolution-tracker__phase-icon">{currentPhaseData.icon}</span>
          <div className="evolution-tracker__phase-info">
            <span className="evolution-tracker__phase-name">{currentPhaseData.name}</span>
            <span className="evolution-tracker__phase-desc">
              {currentPhaseData.description}
            </span>
          </div>
          <span className="evolution-tracker__multiplier">
            x{currentPhaseData.xpMultiplier} XP
          </span>
        </div>
      </div>

      {/* Barre XP */}
      <XPBar totalXP={totalXP} />

      {/* Timeline des phases */}
      <div className="evolution-tracker__timeline">
        <div className="evolution-tracker__timeline-track" />
        {allPhases.map(phase => {
          const isActive = phase.id === currentPhase;
          const isCompleted = phase.order < currentPhaseData.order;
          return (
            <PhaseIndicator
              key={phase.id}
              phase={phase.id}
              isActive={isActive}
              isCompleted={isCompleted}
              progress={isActive ? phaseProgress : 0}
            />
          );
        })}
      </div>

      {/* Progression vers prochaine phase */}
      {nextPhaseData && (
        <div className="evolution-tracker__next-phase">
          <div className="evolution-tracker__next-header">
            <span>
              Prochaine: {nextPhaseData.icon} {nextPhaseData.name}
            </span>
            <span className="evolution-tracker__progress-pct">{phaseProgress}%</span>
          </div>

          <div className="evolution-tracker__requirements">
            {transitionCheck.missingRequirements.length > 0 ? (
              transitionCheck.missingRequirements.slice(0, 3).map((req, i) => (
                <div key={i} className="evolution-tracker__requirement missing">
                  <span>❌</span> {req}
                </div>
              ))
            ) : (
              <div className="evolution-tracker__requirement met">
                <span>✅</span> Prêt pour la transition!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Capabilities débloquables */}
      {unlockableCapabilities.length > 0 && (
        <div className="evolution-tracker__unlockable">
          <div className="evolution-tracker__section-title">
            Capabilities disponibles ({unlockableCapabilities.length})
          </div>
          <div className="evolution-tracker__capabilities-grid">
            {unlockableCapabilities.slice(0, 4).map(cap => (
              <CapabilityCard
                key={cap.id}
                capability={cap}
                status="unlockable"
                canUnlock={true}
                onUnlock={() => onUnlockCapability?.(cap.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="evolution-tracker__stats">
        <div className="evolution-tracker__stat">
          <span className="evolution-tracker__stat-value">
            {unlockedCapabilities.length}
          </span>
          <span className="evolution-tracker__stat-label">Capabilities</span>
        </div>
        <div className="evolution-tracker__stat">
          <span className="evolution-tracker__stat-value">{currentPhaseData.order}</span>
          <span className="evolution-tracker__stat-label">Phase</span>
        </div>
        <div className="evolution-tracker__stat">
          <span className="evolution-tracker__stat-value">{level}</span>
          <span className="evolution-tracker__stat-label">Niveau</span>
        </div>
      </div>
    </div>
  );
};

export default EvolutionTracker;
