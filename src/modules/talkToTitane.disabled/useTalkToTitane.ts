/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ TALK-TO-TITANE REACT HOOK v∞.30.0
 *   Super Prompt #20 — Hook React Assistant Vocal
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { talkToTitaneEngine } from './TalkToTitaneEngine';
import type {
  TalkToTitaneMode,
  TalkToTitaneState,
  TalkToTitaneConfig,
  TalkResponse,
} from './TalkToTitaneEngine';

export interface UseTalkToTitaneReturn {
  // State
  state: TalkToTitaneState;
  config: TalkToTitaneConfig;
  isActive: boolean;
  isListening: boolean;
  currentMode: TalkToTitaneMode;
  lastResponse: TalkResponse | null;
  conversationHistory: TalkResponse[];

  // Actions
  activate: (mode?: TalkToTitaneMode) => Promise<void>;
  deactivate: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  processInput: (text: string) => Promise<TalkResponse>;

  // Configuration
  setMode: (mode: TalkToTitaneMode) => void;
  setEmotionalCalibration: (
    tone: 'analytical' | 'calm' | 'energizing' | 'motivating' | 'neutral'
  ) => void;
  configure: (config: Partial<TalkToTitaneConfig>) => void;

  // Stats
  stats: {
    totalInteractions: number;
    sessionDuration: number;
    sessionId: string;
  };
}

export function useTalkToTitane(): UseTalkToTitaneReturn {
  const [state, setState] = useState<TalkToTitaneState>(talkToTitaneEngine.getState());
  const [config, setConfig] = useState<TalkToTitaneConfig>(
    talkToTitaneEngine.getConfig()
  );

  // Subscribe to engine updates
  useEffect(() => {
    const unsubscribe = talkToTitaneEngine.subscribe(newState => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Actions
  const activate = useCallback(
    async (mode?: TalkToTitaneMode) => {
      await talkToTitaneEngine.activate(mode || config.defaultMode);
    },
    [config.defaultMode]
  );

  const deactivate = useCallback(async () => {
    await talkToTitaneEngine.deactivate();
  }, []);

  const startListening = useCallback(() => {
    // Engine starts listening automatically on wake phrase detection
    console.log(
      '[useTalkToTitane] Manual start listening (not implemented - use wake phrases)'
    );
  }, []);

  const stopListening = useCallback(() => {
    talkToTitaneEngine.stopListening();
  }, []);

  const processInput = useCallback(async (text: string): Promise<TalkResponse> => {
    return await talkToTitaneEngine.processUserInput(text);
  }, []);

  // Configuration
  const setMode = useCallback((mode: TalkToTitaneMode) => {
    talkToTitaneEngine.setMode(mode);
  }, []);

  const setEmotionalCalibration = useCallback(
    (tone: 'analytical' | 'calm' | 'energizing' | 'motivating' | 'neutral') => {
      talkToTitaneEngine.setEmotionalCalibration(tone);
    },
    []
  );

  const configure = useCallback((newConfig: Partial<TalkToTitaneConfig>) => {
    talkToTitaneEngine.configure(newConfig);
    setConfig(talkToTitaneEngine.getConfig());
  }, []);

  // Stats
  const stats = {
    totalInteractions: state.totalInteractions,
    sessionDuration: state.sessionStartTime ? Date.now() - state.sessionStartTime : 0,
    sessionId: state.sessionId,
  };

  return {
    // State
    state,
    config,
    isActive: state.isActive,
    isListening: state.isListening,
    currentMode: state.currentMode,
    lastResponse: state.lastResponse,
    conversationHistory: state.conversationHistory,

    // Actions
    activate,
    deactivate,
    startListening,
    stopListening,
    processInput,

    // Configuration
    setMode,
    setEmotionalCalibration,
    configure,

    // Stats
    stats,
  };
}
