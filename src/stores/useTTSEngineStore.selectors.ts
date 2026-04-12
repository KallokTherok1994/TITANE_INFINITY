/**
 * TITANE∞ v32.0.0 — TTSEngine Store Selectors
 * Optimized selectors with shallow equality for useTTSEngineStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useShallow } from 'zustand/react/shallow';
import { useTTSEngineStore } from './useTTSEngineStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useTTSQueue = () => useTTSEngineStore(state => state.queue);
export const useTTSCurrentItem = () => useTTSEngineStore(state => state.currentItem);
export const useTTSIsPlaying = () => useTTSEngineStore(state => state.isPlaying);
export const useTTSIsPaused = () => useTTSEngineStore(state => state.isPaused);
export const useTTSIsMuted = () => useTTSEngineStore(state => state.isMuted);
export const useTTSIsSpeaking = () => useTTSEngineStore(state => state.isSpeaking);
export const useTTSProgress = () => useTTSEngineStore(state => state.progress);
export const useTTSSettings = () => useTTSEngineStore(state => state.settings);
export const useTTSInitialized = () => useTTSEngineStore(state => state.isInitialized);
export const useTTSLoading = () => useTTSEngineStore(state => state.isLoading);
export const useTTSError = () => useTTSEngineStore(state => state.error);
export const useTTSMetrics = () => useTTSEngineStore(state => state.metrics);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

export const useTTSPlaybackState = () =>
  useTTSEngineStore(
    useShallow(state => ({
      isPlaying: state.isPlaying,
      isPaused: state.isPaused,
      isMuted: state.isMuted,
      isSpeaking: state.isSpeaking,
      progress: state.progress,
      currentItem: state.currentItem,
    }))
  );

export const useTTSSnapshot = () =>
  useTTSEngineStore(
    useShallow(state => ({
      queue: state.queue,
      currentItem: state.currentItem,
      isPlaying: state.isPlaying,
      isSpeaking: state.isSpeaking,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const useTTSActions = () =>
  useTTSEngineStore(
    useShallow(state => ({
      initialize: state.initialize,
      reset: state.reset,
      addToQueue: state.addToQueue,
      removeFromQueue: state.removeFromQueue,
      clearQueue: state.clearQueue,
      play: state.play,
      pause: state.pause,
      resume: state.resume,
      stop: state.stop,
      skip: state.skip,
      speak: state.speak,
      stopSpeaking: state.stopSpeaking,
      setActiveVoice: state.setActiveVoice,
    }))
  );
