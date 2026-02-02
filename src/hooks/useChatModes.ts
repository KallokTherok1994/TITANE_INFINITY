/**
 * Chat Modes Hook — Manage conversation modes and presets
 * Extracted from useChat.ts (Phase 4 refactoring)
 */

import { useState, useCallback, useMemo } from 'react';
import type { ChatMode } from '@/services/ai/chatTypes';

export interface CustomMode extends ChatMode {
  custom: boolean;
  userDefined?: boolean;
}

export const BUILT_IN_MODES: CustomMode[] = [
  {
    id: 'default',
    name: 'Normal',
    icon: '💬',
    description: 'Conversation standard',
    custom: false,
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    icon: '💡',
    description: 'Idéation créative',
    custom: false,
  },
  {
    id: 'synthesis',
    name: 'Synthèse',
    icon: '📝',
    description: 'Résumé et analyse',
    custom: false,
  },
  {
    id: 'planning',
    name: 'Planification',
    icon: '📋',
    description: 'Stratégie et organisation',
    custom: false,
  },
  {
    id: 'journal',
    name: 'Journal',
    icon: '📔',
    description: 'Réflexion personnelle',
    custom: false,
  },
  {
    id: 'debug_cognitive',
    name: 'Debug Cognitif',
    icon: '🔧',
    description: 'Analyse système',
    custom: false,
  },
];

/**
 * Load custom modes from localStorage
 */
const loadCustomModes = (): CustomMode[] => {
  try {
    const stored = localStorage.getItem('chat-custom-modes');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load custom modes:', error);
    return [];
  }
};

/**
 * Save custom modes to localStorage
 */
const saveCustomModes = (modes: CustomMode[]): void => {
  try {
    localStorage.setItem('chat-custom-modes', JSON.stringify(modes));
  } catch (error) {
    console.warn('Failed to save custom modes:', error);
  }
};

/**
 * Hook for managing chat modes
 */
export const useChatModes = () => {
  const [customModes, setCustomModes] = useState<CustomMode[]>(loadCustomModes);

  const allModes = useMemo(
    () => [...BUILT_IN_MODES, ...customModes],
    [customModes]
  );

  const addMode = useCallback((mode: CustomMode) => {
    const newModes = [...customModes, { ...mode, custom: true, userDefined: true }];
    setCustomModes(newModes);
    saveCustomModes(newModes);
  }, [customModes]);

  const removeMode = useCallback((modeId: string) => {
    const newModes = customModes.filter(m => m.id !== modeId);
    setCustomModes(newModes);
    saveCustomModes(newModes);
  }, [customModes]);

  const updateMode = useCallback((modeId: string, updates: Partial<CustomMode>) => {
    const newModes = customModes.map(m => 
      m.id === modeId ? { ...m, ...updates } : m
    );
    setCustomModes(newModes);
    saveCustomModes(newModes);
  }, [customModes]);

  const getMode = useCallback((modeId: string): CustomMode | undefined => {
    return allModes.find(m => m.id === modeId);
  }, [allModes]);

  return {
    modes: allModes,
    customModes,
    addMode,
    removeMode,
    updateMode,
    getMode,
  };
};
