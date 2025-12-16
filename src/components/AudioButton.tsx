/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v15 - AudioButton Component

// Button component for text-to-speech functionality

import React from 'react';

export interface AudioButtonProps {
  text: string;
  isPlaying?: boolean;
  onToggle?: () => void;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  isPlaying = false,
  onToggle,
}) => {
  const handleClick = () => {
    // IMPLEMENTATION: Text-to-speech functionality
    // 1. Hook: const { speak, stop, isPlaying } = useVoiceMode() from '@/hooks/useVoiceMode'
    // 2. Speak: await speak(text, { voice: 'natural', emotion: 'neutral' })
    // 3. State: Update isPlaying based on hook state, show loading during synthesis
    // 4. Toggle: If isPlaying, call stop(), else call speak()
    // 5. Error handling: Show toast if TTS unavailable, fallback to visual feedback
    // 6. Integration: Use hybridTTS from '@/services/voice/hybridTTS' for backend TTS
    // Will integrate with useVoiceMode hook for TTS
    // Future use: speak(text)
    onToggle?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`audio-button ${isPlaying ? 'playing' : ''}`}
      aria-label={isPlaying ? 'Arrêter la lecture' : 'Lire à voix haute'}
      aria-pressed={isPlaying}
      disabled={!text.trim()}
      title={isPlaying ? 'Arrêter la lecture (Esc)' : 'Lire ce texte à voix haute'}
    >
      <span aria-hidden="true">{isPlaying ? '⏹️' : '🔊'}</span>
      {isPlaying && (
        <span role="status" aria-live="polite" className="sr-only">
          Lecture en cours
        </span>
      )}
    </button>
  );
};
