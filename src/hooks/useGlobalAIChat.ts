/**
 * TITANE∞ v∞.25.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.25.0 — USE GLOBAL AI CHAT HOOK
 *   Hook global pour gérer l'état du Chat Bulle IA
 *   État persistant + Singularity sync + Memory integration
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useChat } from './useChat';
import { useSingularityState } from '../core/state/SingularityState';
import { useAIActions } from '../core/state/SingularityState.selectors';
import type { AIMessage } from '../services/ai/types';
import type { AIStatus } from '@/core/ARCHITECTURE_TYPES_v∞';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GlobalAIChatState {
  /** Chat bulle ouvert */
  isOpen: boolean;
  /** Chat bulle minimisé */
  isMinimized: boolean;
  /** Position de la bulle */
  position: { x: number; y: number };
  /** Historique des messages */
  messages: AIMessage[];
  /** Loading state */
  isLoading: boolean;
  /** Modèle IA actuel */
  currentModel: string;
  /** Provider actif */
  currentProvider: string;
}

export interface UseGlobalAIChatReturn extends GlobalAIChatState {
  /** Ouvrir le chat bulle */
  open: () => void;
  /** Fermer le chat bulle */
  close: () => void;
  /** Minimiser le chat bulle */
  minimize: () => void;
  /** Maximiser le chat bulle */
  maximize: () => void;
  /** Envoyer un message */
  sendMessage: (content: string) => Promise<void>;
  /** Effacer l'historique */
  clear: () => void;
  /** Changer de modèle */
  setModel: (model: string) => void;
  /** Changer de provider */
  setProvider: (provider: string) => void;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
  /** Activer mode dev */
  enableDevMode: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'titane-global-chat-state';
const DEFAULT_POSITION = { x: 24, y: 24 };

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useGlobalAIChat(): UseGlobalAIChatReturn {
  // ═══ CHAT HOOK ═══
  const chatHook = useChat();
  const {
    messages: chatMessages,
    isLoading: chatIsLoading,
    sendMessage: chatSendMessage,
    currentMode: _currentMode,
  } = chatHook;

  // ═══ SINGULARITY STATE ═══
  const { setAIStatus, setAIError } = useAIActions();

  // ═══ LOCAL STATE ═══
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [currentModel, setCurrentModel] = useState('gemini-2.0-flash');
  const [currentProvider, setCurrentProvider] = useState('auto');
  const [_isFullscreen, setIsFullscreen] = useState(false);

  const mountedRef = useRef(false);

  // ═══ PERSISTENCE: Load state from localStorage ═══
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored) as Partial<GlobalAIChatState>;
        if (state.isOpen !== undefined) setIsOpen(state.isOpen);
        if (state.isMinimized !== undefined) setIsMinimized(state.isMinimized);
        if (state.position) setPosition(state.position);
        if (state.currentModel) setCurrentModel(state.currentModel);
        if (state.currentProvider) setCurrentProvider(state.currentProvider);
      }
    } catch (error) {
      console.warn('[GlobalAIChat] Failed to load state from localStorage', error);
    }

    mountedRef.current = true;
  }, []);

  // ═══ PERSISTENCE: Save state to localStorage ═══
  useEffect(() => {
    if (!mountedRef.current || typeof window === 'undefined') return;

    try {
      const state: Partial<GlobalAIChatState> = {
        isOpen,
        isMinimized,
        position,
        currentModel,
        currentProvider,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('[GlobalAIChat] Failed to save state to localStorage', error);
    }
  }, [isOpen, isMinimized, position, currentModel, currentProvider]);

  // ═══ SINGULARITY SYNC: Update AI status ═══
  useEffect(() => {
    const status: AIStatus = chatIsLoading ? 'processing' : 'idle';
    setAIStatus(status);
  }, [chatIsLoading, setAIStatus]);

  // ═══ HANDLERS ═══

  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
    setIsOpen(true);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        await chatSendMessage(content);
      } catch (error) {
        setAIError(error instanceof Error ? error.message : 'Unknown error');
        console.error('[GlobalAIChat] sendMessage error:', error);
      }
    },
    [chatSendMessage, setAIError]
  );

  const clear = useCallback(() => {
    // Clear handled by chat hook internally
    // Could add explicit clear method to useChat if needed
    console.info('[GlobalAIChat] Clear requested');
  }, []);

  const setModel = useCallback((model: string) => {
    setCurrentModel(model);
    console.info('[GlobalAIChat] Model changed:', model);
  }, []);

  const setProvider = useCallback((provider: string) => {
    setCurrentProvider(provider);
    console.info('[GlobalAIChat] Provider changed:', provider);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const enableDevMode = useCallback(() => {
    console.info('[GlobalAIChat] Dev mode enabled');
    // Could trigger devSudo mode or specific dev features
  }, []);

  // ═══ RETURN ═══
  return {
    // State
    isOpen,
    isMinimized,
    position,
    messages: chatMessages,
    isLoading: chatIsLoading,
    currentModel,
    currentProvider,

    // Actions
    open,
    close,
    minimize,
    maximize,
    sendMessage,
    clear,
    setModel,
    setProvider,
    toggleFullscreen,
    enableDevMode,
  };
}
