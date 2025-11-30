/**
 * TITANE∞ vΩΩΩ — TTSControls Component
 * © 2025 TITANE Team. All rights reserved.
 *
 * Panneau de contrôle TTS complet avec:
 * - Volume slider
 * - Vitesse slider
 * - Sélection provider
 * - Indicateur de statut
 */

import React, { useState, useCallback } from 'react';
import { useTTS } from '@/hooks/useTTS';
import type { TTSProvider } from '@/services/tts/ttsEngine.config';
import './TTSControls.css';

// =============================================================================
// TYPES
// =============================================================================

export interface TTSControlsProps {
  /** Expanded by default */
  defaultExpanded?: boolean;
  /** Show provider selection */
  showProviderSelect?: boolean;
  /** Show emotion indicator */
  showEmotion?: boolean;
  /** Custom className */
  className?: string;
  /** Compact mode */
  compact?: boolean;
}

// =============================================================================
// PROVIDER LABELS
// =============================================================================

const PROVIDER_LABELS: Record<TTSProvider, string> = {
  elevenlabs: '🎭 ElevenLabs',
  piper: '🔊 Piper',
  espeak: '📢 Espeak',
  webspeech: '🌐 Web Speech',
};

const PROVIDER_ICONS: Record<TTSProvider, string> = {
  elevenlabs: '🎭',
  piper: '🔊',
  espeak: '📢',
  webspeech: '🌐',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function TTSControls({
  defaultExpanded = false,
  showProviderSelect = true,
  showEmotion = true,
  className = '',
  compact = false,
}: TTSControlsProps): JSX.Element {
  const {
    preferences,
    isSpeaking,
    isPaused,
    isAvailable,
    providerStatus,
    stop,
    pause,
    resume,
    setVolume,
    setSpeed,
    setPreferences,
  } = useTTS();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Valeurs par défaut si preferences est null
  const currentVolume = preferences?.globalVolume ?? 0.8;
  const currentSpeed = preferences?.globalSpeed ?? 1.0;
  const autoPlayResponses = preferences?.autoPlayResponses ?? false;
  const emotionalAdaptation = preferences?.emotionalAdaptation ?? true;
  const preferredProvider = preferences?.preferredProvider ?? 'elevenlabs';

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  }, [setVolume]);

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(e.target.value));
  }, [setSpeed]);

  const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences({ preferredProvider: e.target.value as TTSProvider });
  }, [setPreferences]);

  const handleToggleAutoSpeak = useCallback(() => {
    setPreferences({ autoPlayResponses: !autoPlayResponses });
  }, [autoPlayResponses, setPreferences]);

  const handleToggleEmotionalAdaptation = useCallback(() => {
    setPreferences({ emotionalAdaptation: !emotionalAdaptation });
  }, [emotionalAdaptation, setPreferences]);

  // ===========================================================================
  // RENDER
  // ===========================================================================

  if (compact) {
    return (
      <div className={`tts-controls tts-controls--compact ${className}`}>
        <div className="tts-controls__mini">
          {/* Status Indicator */}
          <div className={`tts-status-dot ${isAvailable ? 'tts-status-dot--active' : ''}`} />

          {/* Volume */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={currentVolume}
            onChange={handleVolumeChange}
            className="tts-volume-slider tts-volume-slider--mini"
            title={`Volume: ${Math.round(currentVolume * 100)}%`}
          />

          {/* Playback Controls */}
          {isSpeaking && (
            <>
              <button
                className="tts-control-btn tts-control-btn--mini"
                onClick={isPaused ? resume : pause}
                title={isPaused ? 'Reprendre' : 'Pause'}
              >
                {isPaused ? '▶️' : '⏸️'}
              </button>
              <button
                className="tts-control-btn tts-control-btn--mini"
                onClick={stop}
                title="Arrêter"
              >
                ⏹️
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`tts-controls ${isExpanded ? 'tts-controls--expanded' : ''} ${className}`}>
      {/* Header */}
      <button
        className="tts-controls__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="tts-controls__title">
          🔊 Synthèse vocale
          <span className={`tts-status-indicator ${isAvailable ? 'active' : 'inactive'}`}>
            {isAvailable ? '●' : '○'}
          </span>
        </span>
        <span className={`tts-controls__chevron ${isExpanded ? 'rotated' : ''}`}>
          ▼
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="tts-controls__content">
          {/* Current Status */}
          {isSpeaking && (
            <div className="tts-now-playing">
              <span className="tts-now-playing__icon">
                {isPaused ? '⏸️' : '🔊'}
              </span>
              <span className="tts-now-playing__text">
                {isPaused ? 'En pause' : 'En cours de lecture...'}
              </span>
              <div className="tts-now-playing__controls">
                <button
                  className="tts-control-btn"
                  onClick={isPaused ? resume : pause}
                >
                  {isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
                </button>
                <button className="tts-control-btn tts-control-btn--danger" onClick={stop}>
                  ⏹️ Arrêter
                </button>
              </div>
            </div>
          )}

          {/* Volume Control */}
          <div className="tts-control-group">
            <label className="tts-control-label">
              🔉 Volume
              <span className="tts-control-value">{Math.round(currentVolume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={currentVolume}
              onChange={handleVolumeChange}
              className="tts-slider"
            />
          </div>

          {/* Speed Control */}
          <div className="tts-control-group">
            <label className="tts-control-label">
              ⚡ Vitesse
              <span className="tts-control-value">{currentSpeed.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={currentSpeed}
              onChange={handleSpeedChange}
              className="tts-slider"
            />
          </div>

          {/* Provider Selection */}
          {showProviderSelect && (
            <div className="tts-control-group">
              <label className="tts-control-label">🎤 Moteur vocal</label>
              <select
                value={preferredProvider}
                onChange={handleProviderChange}
                className="tts-select"
              >
                {Object.entries(PROVIDER_LABELS).map(([provider, label]) => (
                  <option
                    key={provider}
                    value={provider}
                    disabled={providerStatus[provider as TTSProvider] === 'unavailable'}
                  >
                    {label} {providerStatus[provider as TTSProvider] === 'available' ? '✓' : '✗'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Toggle Options */}
          <div className="tts-toggles">
            <label className="tts-toggle">
              <input
                type="checkbox"
                checked={autoPlayResponses}
                onChange={handleToggleAutoSpeak}
              />
              <span className="tts-toggle__text">🔄 Lecture auto des réponses</span>
            </label>

            {showEmotion && (
              <label className="tts-toggle">
                <input
                  type="checkbox"
                  checked={emotionalAdaptation}
                  onChange={handleToggleEmotionalAdaptation}
                />
                <span className="tts-toggle__text">💭 Adaptation émotionnelle</span>
              </label>
            )}
          </div>

          {/* Provider Status Grid */}
          <div className="tts-provider-status">
            <span className="tts-provider-status__title">État des moteurs:</span>
            <div className="tts-provider-status__grid">
              {Object.entries(providerStatus).map(([provider, status]) => (
                <div
                  key={provider}
                  className={`tts-provider-status__item tts-provider-status--${status}`}
                  title={`${provider}: ${status}`}
                >
                  <span>{PROVIDER_ICONS[provider as TTSProvider]}</span>
                  <span className="tts-provider-status__dot" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MINI CONTROLS (for toolbar)
// =============================================================================

export function TTSMiniControls(): JSX.Element {
  return <TTSControls compact />;
}

export default TTSControls;
