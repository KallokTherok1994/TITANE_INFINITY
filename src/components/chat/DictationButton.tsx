/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — DICTATION BUTTON
 *   Bouton discret de dictée micro → texte (sans IA, sans TTS)
 *   À placer à côté du bouton d'import de fichiers dans le Chat
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import './DictationButton.css';

interface DictationButtonProps {
  /** Callback quand le texte dicté est prêt */
  onDictationResult: (text: string) => void;
  /** Désactiver le bouton */
  disabled?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
  /** Titre/tooltip */
  title?: string;
}

export const DictationButton: FC<DictationButtonProps> = ({
  onDictationResult,
  disabled = false,
  className = '',
  title = 'Dictée vocale (micro → texte)',
}) => {
  const { status, startDictation, stopDictation } = useVoiceEngine({
    onTranscript: (text) => {
      if (text.trim()) {
        onDictationResult(text);
      }
    },
  });

  const [isActive, setIsActive] = useState(false);

  const handleClick = useCallback(async () => {
    if (disabled) return;

    if (isActive) {
      // Arrêter la dictée
      setIsActive(false);
      const result = await stopDictation();
      if (result.trim()) {
        onDictationResult(result);
      }
    } else {
      // Démarrer la dictée
      setIsActive(true);
      try {
        await startDictation();
      } catch {
        setIsActive(false);
      }
    }
  }, [disabled, isActive, startDictation, stopDictation, onDictationResult]);

  // Auto-stop si erreur
  useEffect(() => {
    if (status.state === 'error' && isActive) {
      setIsActive(false);
    }
  }, [status.state, isActive]);

  const isRecording = status.isRecording || isActive;
  const hasError = status.state === 'error';
  const isDisabled = disabled || !status.isMicAvailable;

  return (
    <button
      type="button"
      className={`dictation-button ${isRecording ? 'recording' : ''} ${hasError ? 'error' : ''} ${className}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={isDisabled ? 'Microphone non disponible' : title}
      aria-label={isRecording ? 'Arrêter la dictée' : 'Démarrer la dictée vocale'}
    >
      <span className="dictation-icon">
        {isRecording ? '⏹️' : '🎙️'}
      </span>
      {isRecording && (
        <span className="dictation-pulse" />
      )}
    </button>
  );
};

export default DictationButton;
