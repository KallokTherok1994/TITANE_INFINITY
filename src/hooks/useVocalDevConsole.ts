/**
 * TITANE∞ v∞.28.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ VOCAL DEV CONSOLE HOOK v∞
 *   React Hook pour Vocal Dev Console global state
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { vocalDevConsole } from './VocalDevConsoleEngine';
import type {
  VocalDevState,
  VocalDevConfig,
  VocalExecutionResult,
  VocalConsoleLog,
} from './VocalDevConsoleEngine';

export interface UseVocalDevConsoleReturn {
  // State
  state: VocalDevState;
  config: VocalDevConfig;

  // Lifecycle
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  open: () => void;
  close: () => void;
  toggleVisibility: () => void;

  // Recording
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  isRecording: boolean;

  // Execution
  executeCommand: (transcript: string) => Promise<VocalExecutionResult>;
  lastExecution: VocalExecutionResult | null;
  executionHistory: VocalExecutionResult[];

  // TTS
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  isSpeaking: boolean;

  // Utilities
  clearLogs: () => void;
  clearHistory: () => void;
  configure: (config: Partial<VocalDevConfig>) => void;
  healthScore: number;

  // Logs
  consoleLogs: VocalConsoleLog[];
}

/**
 * Hook React pour Vocal Dev Console
 */
export function useVocalDevConsole(): UseVocalDevConsoleReturn {
  const [state, setState] = useState<VocalDevState>(vocalDevConsole.getState());
  const [config, setConfig] = useState<VocalDevConfig>(vocalDevConsole.getConfig());

  // Subscribe to engine state changes
  useEffect(() => {
    const unsubscribe = vocalDevConsole.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // ═══ LIFECYCLE ═══

  const activate = useCallback(async () => {
    await vocalDevConsole.activate();
  }, []);

  const deactivate = useCallback(async () => {
    await vocalDevConsole.deactivate();
  }, []);

  const open = useCallback(() => {
    vocalDevConsole.open();
  }, []);

  const close = useCallback(() => {
    vocalDevConsole.close();
  }, []);

  const toggleVisibility = useCallback(() => {
    vocalDevConsole.toggleVisibility();
  }, []);

  // ═══ RECORDING ═══

  const startRecording = useCallback(async () => {
    await vocalDevConsole.startRecording();
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return await vocalDevConsole.stopRecording();
  }, []);

  // ═══ EXECUTION ═══

  const executeCommand = useCallback(async (transcript: string): Promise<VocalExecutionResult> => {
    return await vocalDevConsole.processTranscript(transcript);
  }, []);

  // ═══ TTS ═══

  const speak = useCallback(async (text: string) => {
    await vocalDevConsole.speak(text);
  }, []);

  const stopSpeaking = useCallback(async () => {
    await vocalDevConsole.stopSpeaking();
  }, []);

  // ═══ UTILITIES ═══

  const clearLogs = useCallback(() => {
    vocalDevConsole.clearLogs();
  }, []);

  const clearHistory = useCallback(() => {
    vocalDevConsole.clearHistory();
  }, []);

  const configure = useCallback((newConfig: Partial<VocalDevConfig>) => {
    vocalDevConsole.configure(newConfig);
    setConfig(vocalDevConsole.getConfig());
  }, []);

  return {
    // State
    state,
    config,

    // Lifecycle
    activate,
    deactivate,
    open,
    close,
    toggleVisibility,

    // Recording
    startRecording,
    stopRecording,
    isRecording: state.recordingState.isRecording,

    // Execution
    executeCommand,
    lastExecution: state.lastExecution,
    executionHistory: state.executionHistory,

    // TTS
    speak,
    stopSpeaking,
    isSpeaking: state.recordingState.isSpeaking,

    // Utilities
    clearLogs,
    clearHistory,
    configure,
    healthScore: vocalDevConsole.getHealthScore(),

    // Logs
    consoleLogs: state.consoleLogs,
  };
}
