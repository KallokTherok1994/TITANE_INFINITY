/**
 * TITANE∞ vΩΩΩ — useTTS Hook
 * © 2025 TITANE Team. All rights reserved.
 *
 * React hook pour contrôle TTS intelligent.
 * Intégration avec ttsEngineService.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type TTSEmotion,
  type TTSState,
  type TTSPreferences,
  type TTSProvider,
  type TTSProviderStatus,
  createInitialTTSState,
} from '@/services/tts/ttsEngine.config';
import { getTTSEngine } from '@/services/tts/ttsEngineService';
import { detectEmotion } from '@/services/tts/emotionAnalyzer';

// =============================================================================
// TYPES
// =============================================================================

export interface UseTTSOptions {
  /** Auto-speak AI responses */
  autoSpeak?: boolean;
  /** Default emotion */
  defaultEmotion?: TTSEmotion;
  /** Enable emotional adaptation */
  emotionalAdaptation?: boolean;
}

export interface UseTTSReturn {
  // State
  state: TTSState;
  preferences: TTSPreferences | null;

  // Actions
  speak: (text: string, emotion?: TTSEmotion) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => void;
  resume: () => void;

  // Settings
  setVolume: (volume: number) => void;
  setSpeed: (speed: number) => void;
  setPreferences: (prefs: Partial<TTSPreferences>) => void;

  // Status
  isSpeaking: boolean;
  isPaused: boolean;
  isAvailable: boolean;
  currentProvider: TTSProvider | null;
  providerStatus: Record<TTSProvider, TTSProviderStatus>;

  // Utilities
  checkProviders: () => Promise<void>;
  detectEmotion: (text: string) => TTSEmotion;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for TTS control with emotional adaptation
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { autoSpeak = false, defaultEmotion = 'neutral', emotionalAdaptation = true } = options;

  const [state, setState] = useState<TTSState>(createInitialTTSState);
  const [preferences, setPreferencesState] = useState<TTSPreferences | null>(null);

  const engineRef = useRef<ReturnType<typeof getTTSEngine> | null>(null);
  const mountedRef = useRef(true);
  const initRef = useRef(false);

  // Initialize engine lazily to avoid infinite loops
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const engine = getTTSEngine();
    engineRef.current = engine;

    // Load preferences on mount
    setPreferencesState(engine.getPreferences());

    const unsubscribeState = engine.onStateChange((newState) => {
      if (mountedRef.current) {
        setState(newState);
      }
    });

    const unsubscribeError = engine.onError((error) => {
      if (mountedRef.current) {
        console.error('🔴 TTS Error:', error);
      }
    });

    // Initial provider check
    engine.checkProviders().catch(() => {
      // Ignore errors during init
    });

    return () => {
      mountedRef.current = false;
      unsubscribeState();
      unsubscribeError();
    };
  }, []);

  // ===========================================================================
  // ACTIONS
  // ===========================================================================

  const speak = useCallback(async (text: string, emotion?: TTSEmotion): Promise<void> => {
    const engine = engineRef.current;
    if (!engine) return;

    // Detect emotion if auto and not provided
    const finalEmotion = emotion ??
      (emotionalAdaptation ? detectEmotion(text) : defaultEmotion);

    await engine.speak(text, { emotion: finalEmotion });
  }, [emotionalAdaptation, defaultEmotion]);

  const stop = useCallback(async (): Promise<void> => {
    if (!engineRef.current) return;
    await engineRef.current.stop();
  }, []);

  const pause = useCallback((): void => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback((): void => {
    engineRef.current?.resume();
  }, []);

  // ===========================================================================
  // SETTINGS
  // ===========================================================================

  const setVolume = useCallback((volume: number): void => {
    engineRef.current?.setVolume(volume);
    setPreferencesState(prev => prev ? { ...prev, globalVolume: volume } : prev);
  }, []);

  const setSpeed = useCallback((speed: number): void => {
    engineRef.current?.setSpeed(speed);
    setPreferencesState(prev => prev ? { ...prev, globalSpeed: speed } : prev);
  }, []);

  const setPreferences = useCallback((prefs: Partial<TTSPreferences>): void => {
    engineRef.current?.setPreferences(prefs);
    setPreferencesState(prev => prev ? { ...prev, ...prefs } : prev);
  }, []);

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  const checkProviders = useCallback(async (): Promise<void> => {
    if (!engineRef.current) return;
    await engineRef.current.checkProviders();
  }, []);

  const detectEmotionFn = useCallback((text: string): TTSEmotion => {
    return detectEmotion(text);
  }, []);

  // ===========================================================================
  // COMPUTED
  // ===========================================================================

  const isAvailable = Object.values(state.providerStatus).some(
    s => s === 'available'
  );

  // ===========================================================================
  // RETURN
  // ===========================================================================

  return {
    // State
    state,
    preferences,

    // Actions
    speak,
    stop,
    pause,
    resume,

    // Settings
    setVolume,
    setSpeed,
    setPreferences,

    // Status
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    isAvailable,
    currentProvider: state.activeProvider,
    providerStatus: state.providerStatus,

    // Utilities
    checkProviders,
    detectEmotion: detectEmotionFn,
  };
}

// =============================================================================
// CONTEXT (optional for global TTS state)
// =============================================================================

import { createContext, useContext, type ReactNode } from 'react';

interface TTSContextValue extends UseTTSReturn {}

const TTSContext = createContext<TTSContextValue | null>(null);

export interface TTSProviderProps {
  children: ReactNode;
  options?: UseTTSOptions;
}

/**
 * TTS Provider component for global TTS state
 */
export function TTSProvider({ children, options }: TTSProviderProps): JSX.Element {
  const tts = useTTS(options);

  return (
    <TTSContext.Provider value={tts}>
      {children}
    </TTSContext.Provider>
  );
}

/**
 * Hook to use TTS context
 */
export function useTTSContext(): TTSContextValue {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTSContext must be used within a TTSProvider');
  }
  return context;
}

export default useTTS;
