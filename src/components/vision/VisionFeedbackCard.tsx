/**
 * TITANE∞ vΩ∞ — VISION FEEDBACK CARD COMPONENT
 * Super Prompt #9: Carte affichant le feedback prudent du Vision Engine
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Formulations TOUJOURS prudentes
 * - Disclaimer obligatoire
 * - Pas de certitudes
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React, { useMemo } from 'react';
import { useVisionStore, useVisionFeedback } from '@/stores/useVisionStore';
import type { VisualLevel, CoachingSuggestion } from '@/types/visionAffect';
import './VisionFeedbackCard.css';

// ============================================================================
// TYPES
// ============================================================================

export interface VisionFeedbackCardProps {
  /** Afficher le disclaimer */
  showDisclaimer?: boolean;
  /** Afficher les suggestions */
  showSuggestions?: boolean;
  /** Afficher les niveaux détaillés */
  showDetailedLevels?: boolean;
  /** Callback suggestion cliquée */
  onSuggestionClick?: (suggestion: CoachingSuggestion) => void;
  /** Class CSS additionnelle */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const levelToColor = (level: VisualLevel): string => {
  switch (level) {
    case 'low':
      return 'var(--color-warning, #ff6b6b)';
    case 'medium':
      return 'var(--color-neutral, #ffd93d)';
    case 'high':
      return 'var(--color-success, #6bcb77)';
  }
};

const levelToIcon = (level: VisualLevel, type: 'energy' | 'tension' | 'engagement'): string => {
  if (type === 'energy') {
    return level === 'low' ? '🔋' : level === 'medium' ? '⚡' : '🔥';
  }
  if (type === 'tension') {
    return level === 'low' ? '😌' : level === 'medium' ? '😐' : '😰';
  }
  // engagement
  return level === 'low' ? '😴' : level === 'medium' ? '🙂' : '🎯';
};

// ============================================================================
// COMPONENT
// ============================================================================

export const VisionFeedbackCard: React.FC<VisionFeedbackCardProps> = ({
  showDisclaimer = true,
  showSuggestions = true,
  showDetailedLevels = false,
  onSuggestionClick,
  className = '',
}) => {
  // Feedback
  const feedback = useVisionFeedback();
  const isActive = useVisionStore((s) => s.isObservationActive);
  const dismissSuggestion = useVisionStore((s) => s.dismissSuggestion);
  const pendingSuggestions = useVisionStore((s) => s.pendingSuggestions);

  // Combine suggestions
  const allSuggestions = useMemo(() => {
    return [...feedback.suggestions, ...pendingSuggestions];
  }, [feedback.suggestions, pendingSuggestions]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: CoachingSuggestion, index: number) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    // Dismiss if in pending
    const pendingIndex = index - feedback.suggestions.length;
    if (pendingIndex >= 0) {
      dismissSuggestion(pendingIndex);
    }
  };

  // Pas actif = pas de feedback
  if (!isActive) {
    return (
      <div className={`vision-feedback vision-feedback--inactive ${className}`}>
        <div className="vision-feedback__header">
          <span className="vision-feedback__icon">👁️‍🗨️</span>
          <span className="vision-feedback__title">Vision Engine</span>
        </div>
        <div className="vision-feedback__body">
          <p className="vision-feedback__message vision-feedback__message--inactive">
            Le mode observation n'est pas actif.
          </p>
        </div>
      </div>
    );
  }

  // Confiance trop basse
  if (feedback.confidence < 0.3) {
    return (
      <div className={`vision-feedback vision-feedback--low-confidence ${className}`}>
        <div className="vision-feedback__header">
          <span className="vision-feedback__icon">👁️</span>
          <span className="vision-feedback__title">Vision Active</span>
          <span className="vision-feedback__badge vision-feedback__badge--warning">
            Confiance faible
          </span>
        </div>
        <div className="vision-feedback__body">
          <p className="vision-feedback__message">
            La confiance dans les indices visuels est trop faible pour un feedback fiable.
            Assure-toi d'être bien visible par la caméra.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`vision-feedback ${className}`}>
      {/* Header */}
      <div className="vision-feedback__header">
        <span className="vision-feedback__icon">👁️</span>
        <span className="vision-feedback__title">Perception Visuelle</span>
        <span className="vision-feedback__confidence">
          {(feedback.confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Body */}
      <div className="vision-feedback__body">
        {/* Message principal prudent */}
        <p className="vision-feedback__message">{feedback.prudentMessage}</p>

        {/* Niveaux détaillés (optionnel) */}
        {showDetailedLevels && (
          <div className="vision-feedback__levels">
            <div className="vision-feedback__level">
              <span className="vision-feedback__level-icon">
                {levelToIcon(feedback.energyLevel, 'energy')}
              </span>
              <span className="vision-feedback__level-label">Énergie</span>
              <span
                className="vision-feedback__level-value"
                style={{ color: levelToColor(feedback.energyLevel) }}
              >
                {feedback.energyLevel}
              </span>
            </div>
            <div className="vision-feedback__level">
              <span className="vision-feedback__level-icon">
                {levelToIcon(feedback.tensionLevel, 'tension')}
              </span>
              <span className="vision-feedback__level-label">Tension</span>
              <span
                className="vision-feedback__level-value"
                style={{ color: levelToColor(feedback.tensionLevel) }}
              >
                {feedback.tensionLevel}
              </span>
            </div>
            <div className="vision-feedback__level">
              <span className="vision-feedback__level-icon">
                {levelToIcon(feedback.engagementLevel, 'engagement')}
              </span>
              <span className="vision-feedback__level-label">Engagement</span>
              <span
                className="vision-feedback__level-value"
                style={{ color: levelToColor(feedback.engagementLevel) }}
              >
                {feedback.engagementLevel}
              </span>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && allSuggestions.length > 0 && (
          <div className="vision-feedback__suggestions">
            <h4 className="vision-feedback__suggestions-title">Suggestions</h4>
            {allSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${index}`}
                className={`vision-feedback__suggestion vision-feedback__suggestion--${suggestion.priority}`}
                onClick={() => handleSuggestionClick(suggestion, index)}
              >
                <span className="vision-feedback__suggestion-message">{suggestion.message}</span>
                {suggestion.actionable && (
                  <span className="vision-feedback__suggestion-action">→</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="vision-feedback__disclaimer">
          <span className="vision-feedback__disclaimer-icon">⚠️</span>
          <span className="vision-feedback__disclaimer-text">{feedback.disclaimer}</span>
        </div>
      )}
    </div>
  );
};

export default VisionFeedbackCard;
