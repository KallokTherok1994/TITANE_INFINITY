/**
 * TITANE∞ vΩ∞ — VISION DEBUG OVERLAY COMPONENT
 * Super Prompt #9: Overlay debug pour visualiser landmarks et scores
 *
 * ⚠️ Composant DEV/DEBUG uniquement
 * Affiche les données brutes pour vérification
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React from 'react';
import {
  useVisionStore,
  selectIsObservationActive,
  selectEnergyLevel,
  selectTensionLevel,
  selectEngagementLevel,
  selectConfidence,
  selectIsDebugVisible,
} from '@/stores/useVisionStore';
import type { VisualLevel } from '@/types/visionAffect';
import './VisionDebugOverlay.css';

// ============================================================================
// TYPES
// ============================================================================

export interface VisionDebugOverlayProps {
  /** Afficher même si désactivé dans config */
  forceShow?: boolean;
  /** Position */
  position?: 'left' | 'right';
  /** Class CSS additionnelle */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const levelToColor = (level: VisualLevel): string => {
  switch (level) {
    case 'low':
      return '#ff6b6b';
    case 'medium':
      return '#ffd93d';
    case 'high':
      return '#6bcb77';
    default:
      return '#888';
  }
};

const levelToLabel = (level: VisualLevel): string => {
  switch (level) {
    case 'low':
      return 'Bas';
    case 'medium':
      return 'Moyen';
    case 'high':
      return 'Élevé';
    default:
      return '?';
  }
};

const confidenceToBar = (value: number): string => {
  const filled = Math.round(value * 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
};

// ============================================================================
// COMPONENT
// ============================================================================

export const VisionDebugOverlay: React.FC<VisionDebugOverlayProps> = ({
  forceShow = false,
  position = 'right',
  className = '',
}) => {
  // Store state
  const isDebugVisible = useVisionStore(selectIsDebugVisible);
  const isActive = useVisionStore(selectIsObservationActive);
  const energyLevel = useVisionStore(selectEnergyLevel);
  const tensionLevel = useVisionStore(selectTensionLevel);
  const engagementLevel = useVisionStore(selectEngagementLevel);
  const confidence = useVisionStore(selectConfidence);
  const bodyLanguage = useVisionStore(s => s.bodyLanguage);
  const visionInput = useVisionStore(s => s.visionInput);
  const affectEstimation = useVisionStore(s => s.affectEstimation);
  const toggleDebugOverlay = useVisionStore(s => s.toggleDebugOverlay);

  // Ne pas afficher si pas actif ou pas en mode debug
  if (!forceShow && !isDebugVisible) {
    return null;
  }

  // Classes
  const positionClass = `vision-debug--${position}`;

  return (
    <div className={`vision-debug ${positionClass} ${className}`}>
      {/* Header */}
      <div className="vision-debug__header">
        <span className="vision-debug__title">🔬 Vision Debug</span>
        <button
          className="vision-debug__close"
          onClick={toggleDebugOverlay}
          aria-label="Fermer le debug overlay"
        >
          ✕
        </button>
      </div>

      {/* Status */}
      <div className="vision-debug__section">
        <h4 className="vision-debug__section-title">Status</h4>
        <div className="vision-debug__row">
          <span>Observation:</span>
          <span className={isActive ? 'text-green' : 'text-red'}>
            {isActive ? '● ACTIVE' : '○ INACTIVE'}
          </span>
        </div>
        <div className="vision-debug__row">
          <span>Caméra:</span>
          <span className={visionInput.streamActive ? 'text-green' : 'text-red'}>
            {visionInput.streamActive ? '● STREAMING' : '○ OFF'}
          </span>
        </div>
        <div className="vision-debug__row">
          <span>Permission:</span>
          <span>{visionInput.permissionStatus}</span>
        </div>
        <div className="vision-debug__row">
          <span>FPS:</span>
          <span>{visionInput.fpsEstimate.toFixed(1)}</span>
        </div>
        <div className="vision-debug__row">
          <span>Frames:</span>
          <span>{visionInput.framesProcessed}</span>
        </div>
      </div>

      {/* Body Language */}
      <div className="vision-debug__section">
        <h4 className="vision-debug__section-title">Body Language</h4>
        <div className="vision-debug__row">
          <span>Landmarks:</span>
          <span className={bodyLanguage.landmarksDetected ? 'text-green' : 'text-yellow'}>
            {bodyLanguage.landmarksDetected ? '✓ Détectés' : '✗ Non détectés'}
          </span>
        </div>
        <div className="vision-debug__row">
          <span>Posture:</span>
          <span>{(bodyLanguage.postureScore * 100).toFixed(0)}%</span>
        </div>
        <div className="vision-debug__row">
          <span>Mouvement:</span>
          <span>{(bodyLanguage.movementScore * 100).toFixed(0)}%</span>
        </div>
        <div className="vision-debug__row">
          <span>Gaze:</span>
          <span>{(bodyLanguage.gazeStabilityScore * 100).toFixed(0)}%</span>
        </div>
        <div className="vision-debug__row">
          <span>Confiance:</span>
          <span>{(bodyLanguage.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Affect Estimation */}
      <div className="vision-debug__section">
        <h4 className="vision-debug__section-title">Affect Indices</h4>

        {/* Énergie */}
        <div className="vision-debug__metric">
          <div className="vision-debug__metric-header">
            <span>⚡ Énergie</span>
            <span style={{ color: levelToColor(energyLevel) }}>
              {levelToLabel(energyLevel)}
            </span>
          </div>
          <div
            className="vision-debug__bar"
            style={
              {
                '--fill-color': levelToColor(energyLevel),
                '--fill-width':
                  energyLevel === 'low'
                    ? '33%'
                    : energyLevel === 'medium'
                      ? '66%'
                      : '100%',
              } as React.CSSProperties
            }
          />
        </div>

        {/* Tension */}
        <div className="vision-debug__metric">
          <div className="vision-debug__metric-header">
            <span>💪 Tension</span>
            <span style={{ color: levelToColor(tensionLevel) }}>
              {levelToLabel(tensionLevel)}
            </span>
          </div>
          <div
            className="vision-debug__bar"
            style={
              {
                '--fill-color': levelToColor(tensionLevel),
                '--fill-width':
                  tensionLevel === 'low'
                    ? '33%'
                    : tensionLevel === 'medium'
                      ? '66%'
                      : '100%',
              } as React.CSSProperties
            }
          />
        </div>

        {/* Engagement */}
        <div className="vision-debug__metric">
          <div className="vision-debug__metric-header">
            <span>🎯 Engagement</span>
            <span style={{ color: levelToColor(engagementLevel) }}>
              {levelToLabel(engagementLevel)}
            </span>
          </div>
          <div
            className="vision-debug__bar"
            style={
              {
                '--fill-color': levelToColor(engagementLevel),
                '--fill-width':
                  engagementLevel === 'low'
                    ? '33%'
                    : engagementLevel === 'medium'
                      ? '66%'
                      : '100%',
              } as React.CSSProperties
            }
          />
        </div>

        {/* Confiance globale */}
        <div className="vision-debug__metric">
          <div className="vision-debug__metric-header">
            <span>🎲 Confiance</span>
            <span>{(confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="vision-debug__confidence-bar">
            <code>{confidenceToBar(confidence)}</code>
          </div>
        </div>
      </div>

      {/* Confidence Factors */}
      <div className="vision-debug__section">
        <h4 className="vision-debug__section-title">Confiance Factors</h4>
        <div className="vision-debug__row">
          <span>Landmarks:</span>
          <span>
            {(affectEstimation.confidenceFactors.landmarkQuality * 100).toFixed(0)}%
          </span>
        </div>
        <div className="vision-debug__row">
          <span>Stabilité:</span>
          <span>
            {(affectEstimation.confidenceFactors.temporalStability * 100).toFixed(0)}%
          </span>
        </div>
        <div className="vision-debug__row">
          <span>Éclairage:</span>
          <span>
            {(affectEstimation.confidenceFactors.lightingConditions * 100).toFixed(0)}%
          </span>
        </div>
        <div className="vision-debug__row">
          <span>Visage:</span>
          <span>
            {(affectEstimation.confidenceFactors.faceVisibility * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* History Count */}
      <div className="vision-debug__section">
        <h4 className="vision-debug__section-title">Historique</h4>
        <div className="vision-debug__row">
          <span>Entrées:</span>
          <span>{affectEstimation.history.length}</span>
        </div>
        <div className="vision-debug__row">
          <span>Estimations:</span>
          <span>{affectEstimation.estimationCount}</span>
        </div>
        <div className="vision-debug__row">
          <span>Baseline:</span>
          <span
            className={affectEstimation.baselineProfile ? 'text-green' : 'text-yellow'}
          >
            {affectEstimation.baselineProfile?.isCalibrated
              ? '✓ Calibré'
              : '✗ Non calibré'}
          </span>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="vision-debug__footer">
        <small>⚠️ Indices approximatifs • Pas de diagnostic</small>
      </div>
    </div>
  );
};

export default VisionDebugOverlay;
