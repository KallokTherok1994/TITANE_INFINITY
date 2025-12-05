/**
 * TITANE∞ v19.2 — TTSButton Component
 * © 2025 TITANE Team. All rights reserved.
 *
 * Bouton de lecture TTS simplifié.
 */

import { useCallback, useState } from 'react';
import { useTTS } from '@/hooks/useTTS';
import './TTSButton.css';

export interface TTSButtonProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  disabled?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

export function TTSButton({
  text,
  size = 'medium',
  className = '',
  disabled = false,
  onSpeakStart,
  onSpeakEnd,
}: TTSButtonProps): JSX.Element {
  const { speak, stop, isSpeaking } = useTTS();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = useCallback(async () => {
    if (!text.trim()) return;

    if (isPlaying || isSpeaking) {
      stop();
      setIsPlaying(false);
      onSpeakEnd?.();
      return;
    }

    try {
      setIsPlaying(true);
      onSpeakStart?.();
      await speak(text);
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsPlaying(false);
      onSpeakEnd?.();
    }
  }, [text, isPlaying, isSpeaking, speak, stop, onSpeakStart, onSpeakEnd]);

  const sizeClasses = {
    small: 'tts-button--small',
    medium: 'tts-button--medium',
    large: 'tts-button--large',
  };

  const isDisabled = disabled || !text.trim();

  return (
    <button
      className={`tts-button ${sizeClasses[size]} ${isPlaying ? 'tts-button--playing' : ''} ${className}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={isPlaying ? 'Arrêter la lecture' : 'Écouter'}
    >
      <span className="tts-button__icon">
        {isPlaying ? '⏹️' : '🔊'}
      </span>
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

export interface TTSIconButtonProps {
  text: string;
  className?: string;
}

export function TTSIconButton({ text, className }: TTSIconButtonProps): JSX.Element {
  return <TTSButton text={text} size="small" className={className} />;
}

export default TTSButton;
