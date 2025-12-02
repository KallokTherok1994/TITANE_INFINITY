/**
 * TITANE∞ vΩ∞ — VISION TOGGLE BUTTON COMPONENT
 * Super Prompt #9: Bouton pour activer/désactiver le Vision Engine
 *
 * ⚠️ Opt-in explicite avec confirmation
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React, { useState, useCallback } from 'react';
import {
  useVisionStore,
  selectIsObservationActive,
  selectHasCameraPermission,
} from '@/stores/useVisionStore';
import './VisionToggleButton.css';

// ============================================================================
// TYPES
// ============================================================================

export interface VisionToggleButtonProps {
  /** Afficher le label */
  showLabel?: boolean;
  /** Demander confirmation avant activation */
  requireConfirmation?: boolean;
  /** Durée d'observation (ms) */
  durationMs?: number;
  /** Variante */
  variant?: 'default' | 'compact' | 'pill';
  /** Callback changement état */
  onChange?: (active: boolean) => void;
  /** Class CSS additionnelle */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const VisionToggleButton: React.FC<VisionToggleButtonProps> = ({
  showLabel = true,
  requireConfirmation = true,
  durationMs,
  variant = 'default',
  onChange,
  className = '',
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Store
  const isActive = useVisionStore(selectIsObservationActive);
  const hasPermission = useVisionStore(selectHasCameraPermission);
  const enableVision = useVisionStore((s) => s.enableVision);
  const disableVision = useVisionStore((s) => s.disableVision);
  const requestPermission = useVisionStore((s) => s.requestCameraPermission);

  // Handle toggle
  const handleToggle = useCallback(async () => {
    if (isActive) {
      // Désactivation directe
      disableVision();
      onChange?.(false);
      return;
    }

    // Activation
    if (requireConfirmation && !isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsLoading(true);

    try {
      // Demander permission si nécessaire
      if (!hasPermission) {
        const status = await requestPermission();
        if (status !== 'granted') {
          setIsLoading(false);
          setIsConfirming(false);
          return;
        }
      }

      // Activer
      const success = await enableVision(durationMs);
      onChange?.(success);
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  }, [
    isActive,
    isConfirming,
    requireConfirmation,
    hasPermission,
    durationMs,
    enableVision,
    disableVision,
    requestPermission,
    onChange,
  ]);

  // Cancel confirmation
  const handleCancel = useCallback(() => {
    setIsConfirming(false);
  }, []);

  // Classes
  const variantClass = `vision-toggle--${variant}`;
  const stateClass = isActive
    ? 'vision-toggle--active'
    : isConfirming
      ? 'vision-toggle--confirming'
      : '';

  // Confirmation mode
  if (isConfirming) {
    return (
      <div className={`vision-toggle vision-toggle--confirmation ${variantClass} ${className}`}>
        <div className="vision-toggle__confirmation-content">
          <span className="vision-toggle__confirmation-icon">👁️</span>
          <span className="vision-toggle__confirmation-text">
            Activer le mode observation ?
          </span>
          <span className="vision-toggle__confirmation-disclaimer">
            Traitement 100% local • Aucune vidéo stockée
          </span>
        </div>
        <div className="vision-toggle__confirmation-actions">
          <button
            className="vision-toggle__btn vision-toggle__btn--cancel"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            className="vision-toggle__btn vision-toggle__btn--confirm"
            onClick={handleToggle}
            disabled={isLoading}
          >
            {isLoading ? 'Activation...' : 'Activer'}
          </button>
        </div>
      </div>
    );
  }

  // Normal button
  return (
    <button
      className={`vision-toggle ${variantClass} ${stateClass} ${className}`}
      onClick={handleToggle}
      disabled={isLoading}
      aria-pressed={isActive}
      aria-label={isActive ? 'Désactiver le mode observation' : 'Activer le mode observation'}
    >
      {/* Icon */}
      <span className="vision-toggle__icon">
        {isLoading ? '⏳' : isActive ? '👁️' : '👁️‍🗨️'}
      </span>

      {/* Label */}
      {showLabel && (
        <span className="vision-toggle__label">
          {isLoading
            ? 'Chargement...'
            : isActive
              ? 'Vision Active'
              : 'Activer Vision'}
        </span>
      )}

      {/* Status dot */}
      <span className={`vision-toggle__dot ${isActive ? 'vision-toggle__dot--active' : ''}`} />
    </button>
  );
};

export default VisionToggleButton;
