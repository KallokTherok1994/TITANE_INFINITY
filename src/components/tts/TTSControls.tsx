/**
 * TITANE∞ v19.2 — TTSControls Component
 * © 2025 TITANE Team. All rights reserved.
 *
 * Contrôles TTS simplifiés.
 */

import { useTTS } from '@/hooks/useTTS';
import './TTSControls.css';

export interface TTSControlsProps {
  text: string;
  className?: string;
}

export function TTSControls({ text, className = '' }: TTSControlsProps): JSX.Element {
  const { speak, stop, isSpeaking } = useTTS();

  const handlePlayStop = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <div className={`tts-controls ${className}`}>
      <button
        className={`tts-controls__button ${isSpeaking ? 'tts-controls__button--active' : ''}`}
        onClick={handlePlayStop}
        title={isSpeaking ? 'Arrêter' : 'Écouter'}
      >
        {isSpeaking ? '⏹️ Stop' : '🔊 Écouter'}
      </button>
    </div>
  );
}

export function TTSMiniControls({ text, className = '' }: TTSControlsProps): JSX.Element {
  const { speak, stop, isSpeaking } = useTTS();

  return (
    <button
      className={`tts-mini-control ${className}`}
      onClick={() => isSpeaking ? stop() : speak(text)}
      title={isSpeaking ? 'Arrêter' : 'Écouter'}
    >
      {isSpeaking ? '⏹️' : '🔊'}
    </button>
  );
}

export default TTSControls;
