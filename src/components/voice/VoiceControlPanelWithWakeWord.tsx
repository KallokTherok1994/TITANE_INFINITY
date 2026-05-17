/**
 * TITANE_INFINITY v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v35.1.8 — VOICE CONTROL PANEL WITH WAKE WORD
 *
 *   Panneau de contrôle unifié pour la voix:
 *   - Mode push-to-talk classique
 *   - Mode wake word ("Titane ?")
 *   - Indicateur visuel d&apos;attention
 *   - Integration complète streaming + VoiceEngine
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback } from 'react';
import { createLogger } from '@/utils/logger';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import { useActiveListening } from '@/hooks/useActiveListening';
import { WakeWordIndicator } from './WakeWordIndicator';
import { cn } from '@/lib/utils';

const logger = createLogger('VoiceControlPanel');

interface VoiceControlPanelWithWakeWordProps {
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   COMPOSANT PRINCIPAL
 * ═══════════════════════════════════════════════════════════════════
 */
export const VoiceControlPanelWithWakeWord: React.FC<
  VoiceControlPanelWithWakeWordProps
> = ({ className }) => {
  // ═══ STATE ═══

  const [mode, setMode] = useState<'push_to_talk' | 'wake_word'>('push_to_talk');

  // ═══ HOOKS ═══

  const voiceEngine = useVoiceEngine();

  const activeListening = useActiveListening(
    {
      enableWakeWord: mode === 'wake_word',
      autoArm: false,
      sensitivity: 0.5,
    },
    {
      onWakeDetected: event => {
        logger.info('🎯 Wake detected:', event.mode);
      },

      onCommand: (text, _wakeEvent) => {
        logger.info('📝 Command:', text);

        // Traiter la commande via VoiceEngine
        voiceEngine.completeTurnWithText(text);
      },

      onAttentionChange: state => {
        logger.info('🧠 Attention:', state);
      },
    }
  );

  // ═══ HANDLERS ═══

  /**
   * Toggle mode push-to-talk / wake word
   */
  const toggleMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'push_to_talk' ? 'wake_word' : 'push_to_talk';

      if (newMode === 'wake_word') {
        // Activer wake word
        activeListening.arm();
        voiceEngine.activateWakeWord();
      } else {
        // Désactiver wake word
        activeListening.disarm();
        voiceEngine.deactivateWakeWord();
      }

      return newMode;
    });
  }, [activeListening, voiceEngine]);

  /**
   * Push-to-talk: Start recording
   */
  const handleStartRecording = useCallback(async () => {
    if (mode === 'push_to_talk' && voiceEngine.status.state === 'idle') {
      await voiceEngine.startTurn();
    }
  }, [mode, voiceEngine]);

  /**
   * Push-to-talk: Stop recording
   */
  const handleStopRecording = useCallback(async () => {
    if (mode === 'push_to_talk' && voiceEngine.status.isRecording) {
      await voiceEngine.completeTurn();
    }
  }, [mode, voiceEngine]);

  /**
   * Cancel current turn
   */
  const handleCancel = useCallback(async () => {
    await voiceEngine.cancelTurn();

    if (mode === 'wake_word') {
      activeListening.reset();
    }
  }, [voiceEngine, activeListening, mode]);

  // ═══ RENDER ═══

  const isProcessing =
    voiceEngine.status.state === 'processing' || voiceEngine.status.state === 'speaking';
  const canRecord = voiceEngine.status.isMicAvailable && !isProcessing;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 p-6 bg-titanium-bg-elevated rounded-lg shadow-lg',
        className
      )}
    >
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMode}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-all',
            mode === 'push_to_talk'
              ? 'bg-blue-500 text-titanium-text-primary'
              : 'bg-titanium-bg-interactive text-titanium-text-secondary'
          )}
        >
          🎤 Push-to-Talk
        </button>

        <button
          onClick={toggleMode}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-all',
            mode === 'wake_word'
              ? 'bg-purple-500 text-titanium-text-primary'
              : 'bg-titanium-bg-interactive text-titanium-text-secondary'
          )}
        >
          👂 Wake Word
        </button>
      </div>

      {/* Wake Word Indicator */}
      {mode === 'wake_word' && (
        <WakeWordIndicator
          attentionState={activeListening.state.attentionState}
          size="lg"
          showLabel={true}
        />
      )}

      {/* Push-to-Talk Controls */}
      {mode === 'push_to_talk' && (
        <div className="flex flex-col items-center gap-2">
          <button
            onMouseDown={handleStartRecording}
            onMouseUp={handleStopRecording}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
            disabled={!canRecord}
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center',
              'transition-all duration-200',
              'text-3xl',
              voiceEngine.status.isRecording
                ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse'
                : canRecord
                  ? 'bg-blue-500 hover:bg-blue-600 shadow-lg'
                  : 'bg-titanium-bg-overlay opacity-60 cursor-not-allowed'
            )}
          >
            {voiceEngine.status.isRecording ? '⏸️' : '🎤'}
          </button>

          <span className="text-sm text-titanium-text-disabled dark:text-titanium-text-tertiary">
            {voiceEngine.status.isRecording ? 'Maintenez...' : 'Appuyez pour parler'}
          </span>
        </div>
      )}

      {/* Status Text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-titanium-text-secondary dark:text-titanium-text-secondary">
          {voiceEngine.status.state === 'idle' &&
            (mode === 'wake_word' ? 'Dites "Titane" pour m\'activer' : 'Prêt à écouter')}
          {voiceEngine.status.state === 'listening' && 'Écoute en cours...'}
          {voiceEngine.status.state === 'processing' && 'Traitement...'}
          {voiceEngine.status.state === 'speaking' && 'Je réponds...'}
        </p>

        {voiceEngine.status.transcript && (
          <p className="text-xs text-titanium-text-disabled dark:text-titanium-text-tertiary italic">
            &quot;{voiceEngine.status.transcript}&quot;
          </p>
        )}
      </div>

      {/* Cancel Button */}
      {isProcessing && (
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg bg-error-500 text-titanium-text-inverse hover:bg-error-700 transition-colors"
        >
          🛑 Annuler
        </button>
      )}

      {/* Error Display */}
      {voiceEngine.status.lastError && (
        <div className="w-full p-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          ⚠️ {voiceEngine.status.lastError}
        </div>
      )}
    </div>
  );
};

export default VoiceControlPanelWithWakeWord;
