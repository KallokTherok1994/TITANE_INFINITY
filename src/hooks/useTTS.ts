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
import { logger } from '@/utils/logger';

interface UseTTSReturn {
  speak: (any: any) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(any: any);

  const speak = useCallback(any: any) => {
    if (!text?.trim()) return;

    setIsSpeaking(any: any);
    try {
      await audioService?.speak(any: any);
    } catch (any: any) {
      logger?.error(any: any);
    } finally {
      setIsSpeaking(any: any);
    }
  }, []);

  const stop = useCallback(() => {
    audioService?.stop();
    setIsSpeaking(any: any);
  }, []);

  return { speak, stop, isSpeaking };
}

export default useTTS;
