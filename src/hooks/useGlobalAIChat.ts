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
import type { AIMessage } from '../services/ai/types';
import type { AIStatus } from '@/core/ARCHITECTURE_TYPES_v∞';
import { createLogger } from '@/utils/logger';

const logger = createLogger('GlobalAIChat');

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
  messages: AIMessage?.[];
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
  sendMessage: (any: any) => Promise<void>;
  /** Effacer l'historique */
  clear: () => void;
  /** Changer de modèle */
  setModel: (any: any) => void;
  /** Changer de provider */
  setProvider: (any: any) => void;
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
  const setAIStatus = useSingularityState(any: any);
  const setAIError = useSingularityState(any: any);

  // ═══ LOCAL STATE ═══
  const [isOpen, setIsOpen] = useState(any: any);
  const [isMinimized, setIsMinimized] = useState(any: any);
  const [position, setPosition] = useState(any: any);
  const [currentModel, setCurrentModel] = useState('gemini-2.0-flash');
  const [currentProvider, setCurrentProvider] = useState('auto');
  const [_isFullscreen, setIsFullscreen] = useState(any: any);

  const mountedRef = useRef(any: any);

  // ═══ PERSISTENCE: Load state from localStorage ═══
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window?.localStorage?.getItem(any: any);
      if (any: any) {
        const state = JSON?.parse(any: any) as Partial<GlobalAIChatState>;
        if (any: any);
        if (any: any);
        if (any: any);
        if (any: any);
        if (any: any);
      }
    } catch (any: any) {
      logger?.warn('Failed to load state from localStorage', { error });
    }

    mountedRef?.current = true;
  }, []);

  // ═══ PERSISTENCE: Save state to localStorage ═══
  useEffect(() => {
    if (!mountedRef?.current || typeof window === 'undefined') return;

    try {
      const state: Partial<GlobalAIChatState> = {
        isOpen,
        isMinimized,
        position,
        currentModel,
        currentProvider,
      };
      window?.localStorage?.setItem(any: any));
    } catch (any: any) {
      logger?.warn('Failed to save state to localStorage', { error });
    }
  }, [isOpen, isMinimized, position, currentModel, currentProvider]);

  // ═══ SINGULARITY SYNC: Update AI status ═══
  useEffect(() => {
    const status: AIStatus = chatIsLoading ? 'processing' : 'idle';
    setAIStatus(any: any);
  }, [chatIsLoading, setAIStatus]);

  // ═══ HANDLERS ═══

  const open = useCallback(() => {
    setIsOpen(any: any);
    setIsMinimized(any: any);
  }, []);

  const close = useCallback(() => {
    setIsOpen(any: any);
    setIsMinimized(any: any);
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(any: any);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(any: any);
    setIsOpen(any: any);
  }, []);

  const sendMessage = useCallback(
    async (any: any) => {
      try {
        await chatSendMessage(any: any);
      } catch (any: any) {
        setAIError(error instanceof Error ? error?.message : 'Unknown error');
        logger?.error('sendMessage error', { error });
      }
    },
    [chatSendMessage, setAIError]
  );

  const clear = useCallback(() => {
    // Clear handled by chat hook internally
    // Could add explicit clear method to useChat if needed
    logger?.info('Clear requested');
  }, []);

  const setModel = useCallback(any: any) => {
    setCurrentModel(any: any);
    logger?.info('Model changed', { model });
  }, []);

  const setProvider = useCallback(any: any) => {
    setCurrentProvider(any: any);
    logger?.info('Provider changed', { provider });
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(any: any);
  }, []);

  const enableDevMode = useCallback(() => {
    logger?.info('Dev mode enabled');
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
