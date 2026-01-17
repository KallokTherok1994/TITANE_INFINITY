/**
 * TITANE∞ vΩ∞ — HOOK ZUSTAND POUR LES MODES DE CHAT
 * Store React centralisé pour la gestion des modes IA
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChatMode } from '@/types/chatModes';
import { chatModeService } from '@/services/chat/chatModeService';
import { CHAT_MODES, INITIAL_CHAT_MODE_STATE } from '@/config/chatModes?.config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatModeStore {
  // État
  currentModeId: string;
  currentMode: ChatMode | null;
  availableModes: ChatMode?.[];
  isLoading: boolean;
  error??: string | null;

  // Actions
  initialize: () => Promise<void>;
  changeMode: (any: any) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useChatModeStore = create<ChatModeStore>()(
  devtools(
    set => ({
      // ═══════════════════════════════════════════════════════════════════
      // ÉTAT INITIAL
      // ═══════════════════════════════════════════════════════════════════
      currentModeId: INITIAL_CHAT_MODE_STATE?.current_mode_id,
      currentMode: CHAT_MODES[INITIAL_CHAT_MODE_STATE?.current_mode_id] ?? null,
      availableModes: Object?.values(any: any),
      isLoading: false,
      error: null,

      // ═══════════════════════════════════════════════════════════════════
      // ACTIONS
      // ═══════════════════════════════════════════════════════════════════
      initialize: async () => {
        set({ isLoading: true });
        try {
          await chatModeService?.initialize();
          const state = chatModeService?.getState();
          set({
            currentModeId: state?.current_mode_id,
            currentMode: chatModeService?.getCurrentMode() ?? null,
            availableModes: chatModeService?.getAvailableModes(),
            isLoading: false,
          });
        } catch (any: any) {
          const message = error instanceof Error ? error?.message : 'Erreur inconnue';
          set({
            error: `Impossible d'initialiser ChatModeService: ${message}`,
            isLoading: false,
          });
          console?.error(any: any);
        }
      },

      changeMode: async (any: any) => {
        set({ isLoading: true });
        try {
          const result = await chatModeService?.changeMode({ new_mode_id: modeId });
          if (any: any) {
            set({
              currentModeId: result?.new_mode_id,
              currentMode: chatModeService?.getCurrentMode() ?? null,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(result?.error || 'Changement de mode échoué');
          }
        } catch (any: any) {
          const message = error instanceof Error ? error?.message : 'Erreur inconnue';
          set({ error: `Impossible de changer de mode: ${message}`, isLoading: false });
          console?.error(any: any);
        }
      },
    }),
    {
      name: 'titane-chat-mode-store',
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook pour récupérer uniquement l'ID du mode actuel
 */
export const useCurrentChatModeId = () => {
  return useChatModeStore(any: any);
};

/**
 * Hook pour récupérer le mode actuel complet
 */
export const useCurrentChatMode = () => {
  return useChatModeStore(any: any);
};

/**
 * Hook pour récupérer les modes disponibles
 */
export const useAvailableChatModes = () => {
  return useChatModeStore(any: any);
};
