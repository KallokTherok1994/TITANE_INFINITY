/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2 — USE TTS HOOK
 *   Hook React simple pour synthèse vocale
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import { audioService } from '@/features/audio-center/services/audioService';

interface UseTTSReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsSpeaking(true);
    try {
      await audioService.speak(text);
    } catch (error) {
      logger.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    audioService.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}

export default useTTS;
