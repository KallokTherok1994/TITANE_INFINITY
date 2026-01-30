/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   RECORDING TIMER COMPONENT
 *   Affiche la durée d'enregistrement audio en real-time
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useElapsedTime, formatElapsedTime } from '@/hooks/useAutoTimeout';
import './RecordingTimer.css';

export interface RecordingTimerProps {
  /** Est-ce que l'enregistrement est actif */
  isRecording: boolean;
  /** Durée maximale en secondes (défaut: 5 minutes) */
  maxDuration?: number;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Composant affichant le timer d'enregistrement audio
 * Affiche le temps écoulé et un warning quand on approche de la limite
 */
export const RecordingTimer: React.FC<RecordingTimerProps> = ({
  isRecording,
  maxDuration = 5 * 60, // 5 minutes par défaut
  className = '',
}) => {
  // ✅ Hook pour tracker le temps écoulé
  const elapsedSeconds = useElapsedTime(isRecording);

  // Calculer les proportions
  const percentageUsed = Math.min((elapsedSeconds / maxDuration) * 100, 100);
  const isNearLimit = percentageUsed >= 80; // Warning à 80%
  const isAtLimit = percentageUsed >= 100;

  // Formater le texte du timer
  const formattedTime = useMemo(() => {
    return formatElapsedTime(elapsedSeconds);
  }, [elapsedSeconds]);

  // Formater la limite max
  const formattedMax = useMemo(() => {
    return formatElapsedTime(maxDuration);
  }, [maxDuration]);

  if (!isRecording) {
    return null;
  }

  return (
    <div
      className={`recording-timer ${isNearLimit ? 'warning' : ''} ${isAtLimit ? 'at-limit' : ''} ${className}`}
    >
      {/* Barre de progression */}
      <div className="recording-timer-bar-container">
        <div
          className={`recording-timer-bar ${isNearLimit ? 'warning' : ''} ${isAtLimit ? 'danger' : ''}`}
          style={{ width: `${percentageUsed}%` }}
        />
      </div>

      {/* Texte du timer */}
      <div className="recording-timer-content">
        <span className={`recording-timer-text ${isNearLimit ? 'warning' : ''}`}>
          🔴 {formattedTime}
        </span>

        {/* Afficher la limite si on est proche */}
        {isNearLimit && (
          <span className="recording-timer-limit">
            <AlertCircle size={14} /> Limite: {formattedMax}
          </span>
        )}

        {/* Message d'avertissement si au-delà du max */}
        {isAtLimit && (
          <span className="recording-timer-max-reached">
            ⏹️ Limite atteinte - Arrêt automatique!
          </span>
        )}
      </div>
    </div>
  );
};

RecordingTimer.displayName = 'RecordingTimer';

export default RecordingTimer;
