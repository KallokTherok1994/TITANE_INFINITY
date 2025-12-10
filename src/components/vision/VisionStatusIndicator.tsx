/**
 * TITANE∞ vΩ∞ — VISION STATUS INDICATOR COMPONENT
 * Super Prompt #9: Indicateur compact de l'état du Vision Engine
 *
 * Petit badge discret montrant si la vision est active
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React from 'react';
import {
  useVisionStore,
  selectIsObservationActive,
  selectIsCameraActive,
  selectConfidence,
  selectEnergyLevel,
} from '@/stores/useVisionStore';
import type { VisualLevel } from '@/types/visionAffect';
import './VisionStatusIndicator.css';

// ============================================================================
// TYPES
// ============================================================================

export interface VisionStatusIndicatorProps {
  /** Afficher le niveau d'énergie */
  showEnergyLevel?: boolean;
  /** Afficher la confiance */
  showConfidence?: boolean;
  /** Taille */
  size?: 'small' | 'medium' | 'large';
  /** Callback au clic */
  onClick?: () => void;
  /** Class CSS additionnelle */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const levelToEmoji = (level: VisualLevel): string => {
  switch (level) {
    case 'low':
      return '🔋';
    case 'medium':
      return '⚡';
    case 'high':
      return '🔥';
    default:
      return '❓';
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export const VisionStatusIndicator: React.FC<VisionStatusIndicatorProps> = ({
  showEnergyLevel = false,
  showConfidence = false,
  size = 'medium',
  onClick,
  className = '',
}) => {
  // Store state
  const isObservationActive = useVisionStore(selectIsObservationActive);
  const isCameraActive = useVisionStore(selectIsCameraActive);
  const confidence = useVisionStore(selectConfidence);
  const energyLevel = useVisionStore(selectEnergyLevel);
  const toggleCameraPreview = useVisionStore(s => s.toggleCameraPreview);

  // Handler click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleCameraPreview();
    }
  };

  // Status
  const status = isObservationActive
    ? isCameraActive
      ? 'active'
      : 'paused'
    : 'inactive';

  // Labels
  const statusLabel =
    status === 'active'
      ? 'Vision Active'
      : status === 'paused'
        ? 'Vision Pause'
        : 'Vision Off';

  // Classes
  const sizeClass = `vision-status--${size}`;
  const statusClass = `vision-status--${status}`;

  return (
    <button
      className={`vision-status ${sizeClass} ${statusClass} ${className}`}
      onClick={handleClick}
      title={statusLabel}
      aria-label={statusLabel}
    >
      {/* Icône œil */}
      <span className="vision-status__icon">
        {status === 'active' ? '👁️' : status === 'paused' ? '👁️‍🗨️' : '🙈'}
      </span>

      {/* Dot indicateur */}
      <span className={`vision-status__dot vision-status__dot--${status}`} />

      {/* Energy level (optionnel) */}
      {showEnergyLevel && isObservationActive && (
        <span className="vision-status__energy" title={`Énergie: ${energyLevel}`}>
          {levelToEmoji(energyLevel)}
        </span>
      )}

      {/* Confidence (optionnel) */}
      {showConfidence && isObservationActive && (
        <span
          className="vision-status__confidence"
          title={`Confiance: ${(confidence * 100).toFixed(0)}%`}
        >
          {(confidence * 100).toFixed(0)}%
        </span>
      )}
    </button>
  );
};

export default VisionStatusIndicator;
