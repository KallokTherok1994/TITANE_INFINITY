/**
 * TITANE∞ vΩΩΩ — TTSButton Component
 * © 2025 TITANE Team. All rights reserved.
 *
 * Bouton de lecture TTS avec indicateur d'émotion.
 */

import React, { useState, useCallback } from 'react';
import { useTTS } from '@/hooks/useTTS';
import type { TTSEmotion } from '@/services/tts/ttsEngine.config';
import './TTSButton.css';

// =============================================================================
// TYPES
// =============================================================================

export interface TTSButtonProps {
  /** Text to speak */
  text: string;
  /** Message ID for caching */
  messageId?: string;
  /** Pre-detected emotion */
  emotion?: TTSEmotion;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Show emotion indicator */
  showEmotion?: boolean;
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** On speak start callback */
  onSpeakStart?: () => void;
  /** On speak end callback */
  onSpeakEnd?: () => void;
}

// =============================================================================
// EMOTION ICONS
// =============================================================================

const EMOTION_ICONS: Record<TTSEmotion, string> = {
  neutral: '😐',
  calm: '😌',
  focusing: '🎯',
  excited: '🎉',
  soft: '🤗',
  grounded: '🌳',
  uplifting: '💪',
  empathetic: '💙',
  disciplined: '📋',
  inspired: '✨',
};

const EMOTION_COLORS: Record<TTSEmotion, string> = {
  neutral: '#6B7280',
  calm: '#3B82F6',
  focusing: '#8B5CF6',
  excited: '#F59E0B',
  soft: '#EC4899',
  grounded: '#10B981',
  uplifting: '#EF4444',
  empathetic: '#06B6D4',
  disciplined: '#1F2937',
  inspired: '#F97316',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function TTSButton({
  text,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  messageId,
  emotion: propEmotion,
  size = 'medium',
  showEmotion = true,
  className = '',
  disabled = false,
  onSpeakStart,
  onSpeakEnd,
}: TTSButtonProps): JSX.Element {
  const { speak, stop, isAvailable, detectEmotion } = useTTS();
  const [isPlaying, setIsPlaying] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<TTSEmotion>(propEmotion ?? 'neutral');

  // Detect emotion on mount or when text changes
  React.useEffect(() => {
    if (!propEmotion && text) {
      const emotion = detectEmotion(text);
      setDetectedEmotion(emotion);
    } else if (propEmotion) {
      setDetectedEmotion(propEmotion);
    }
  }, [text, propEmotion, detectEmotion]);

  const currentEmotion = propEmotion ?? detectedEmotion;

  const handleClick = useCallback(async () => {
    if (!text.trim()) return;

    if (isPlaying) {
      await stop();
      setIsPlaying(false);
      onSpeakEnd?.();
      return;
    }

    try {
      setIsPlaying(true);
      onSpeakStart?.();
      await speak(text, currentEmotion);
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsPlaying(false);
      onSpeakEnd?.();
    }
  }, [text, isPlaying, currentEmotion, speak, stop, onSpeakStart, onSpeakEnd]);

  // Size classes
  const sizeClasses = {
    small: 'tts-button--small',
    medium: 'tts-button--medium',
    large: 'tts-button--large',
  };

  const isDisabled = disabled || !isAvailable || !text.trim();

  return (
    <button
      className={`tts-button ${sizeClasses[size]} ${isPlaying ? 'tts-button--playing' : ''} ${className}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={isPlaying ? 'Arrêter la lecture' : 'Écouter'}
      aria-label={isPlaying ? 'Arrêter l\'audio' : 'Lire l\'audio'}
      style={{
        '--tts-emotion-color': EMOTION_COLORS[currentEmotion],
      } as React.CSSProperties}
    >
      {/* Speaker Icon */}
      <span className="tts-button__icon">
        {isPlaying ? (
          <SpeakingIcon />
        ) : (
          <SpeakerIcon />
        )}
      </span>

      {/* Emotion Indicator */}
      {showEmotion && (
        <span className="tts-button__emotion" title={`Émotion: ${currentEmotion}`}>
          {EMOTION_ICONS[currentEmotion]}
        </span>
      )}

      {/* Loading/Playing Animation */}
      {isPlaying && (
        <span className="tts-button__wave">
          <span className="tts-button__wave-bar"></span>
          <span className="tts-button__wave-bar"></span>
          <span className="tts-button__wave-bar"></span>
        </span>
      )}
    </button>
  );
}

// =============================================================================
// ICONS
// =============================================================================

function SpeakerIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="tts-icon"
    >
      <path d="M11.553 3.064A.75.75 0 0112 3.75v16.5a.75.75 0 01-1.255.555L5.46 16H2.75A1.75 1.75 0 011 14.25v-4.5C1 8.784 1.784 8 2.75 8h2.71l5.285-4.805a.75.75 0 01.808-.131z" />
      <path d="M14.5 8.25a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM16.25 11.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM14.5 15.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75z" />
    </svg>
  );
}

function SpeakingIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="tts-icon tts-icon--speaking"
    >
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
      <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
    </svg>
  );
}

// =============================================================================
// COMPACT VERSION
// =============================================================================

export interface TTSIconButtonProps {
  text: string;
  emotion?: TTSEmotion;
  className?: string;
}

export function TTSIconButton({ text, emotion, className }: TTSIconButtonProps): JSX.Element {
  return (
    <TTSButton
      text={text}
      emotion={emotion}
      size="small"
      showEmotion={false}
      className={className}
    />
  );
}

export default TTSButton;
