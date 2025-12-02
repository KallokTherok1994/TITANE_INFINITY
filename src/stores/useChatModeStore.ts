/**
 * TITANE∞ vΩ∞ — HOOK ZUSTAND POUR LES MODES DE CHAT
 * Store React centralisé pour la gestion des modes IA
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  ChatMode,
  ChatModeState,
  ChatModeChangeRequest,
  ChatModeChangeResult,
  ToolAccessValidation,
  ToolsPermissions,
} from '@/types/chatModes';
import { chatModeService } from '@/services/chat/chatModeService';
import { CHAT_MODES, INITIAL_CHAT_MODE_STATE } from '@/config/chatModes.config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatModeStore {
  // État
  currentModeId: string;
  currentMode: ChatMode | null;
  availableModes: ChatMode[];
  allModes: ChatMode[];
  favoriteModes: string[];
  modeHistory: string[];
  userXP: number;
  modeXP: Record<string, number>;
  isLoading: boolean;
  error: string | null;

  // Actions de mode
  changeMode: (request: ChatModeChangeRequest) => Promise<ChatModeChangeResult>;
  setMode: (modeId: string) => Promise<ChatModeChangeResult>;

  // Actions XP
  addXP: (amount: number, forMode?: string) => void;
  setUserXP: (xp: number) => void;

  // Actions favoris
  addFavorite: (modeId: string) => void;
  removeFavorite: (modeId: string) => void;
  toggleFavorite: (modeId: string) => void;

  // Validation outils
  validateToolAccess: (toolId: keyof ToolsPermissions) => ToolAccessValidation;
  getAllowedTools: () => (keyof ToolsPermissions)[];
  isToolAllowed: (toolId: keyof ToolsPermissions) => boolean;

  // Utilitaires
  getModeById: (modeId: string) => ChatMode | undefined;
  getModesByCategory: (category: string) => ChatMode[];
  getSystemPrompt: () => string;

  // Lifecycle
  initialize: () => Promise<void>;
  reset: () => void;
  sync: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useChatModeStore = create<ChatModeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ═══════════════════════════════════════════════════════════════════
        // ÉTAT INITIAL
        // ═══════════════════════════════════════════════════════════════════
        currentModeId: INITIAL_CHAT_MODE_STATE.current_mode_id,
        currentMode: CHAT_MODES[INITIAL_CHAT_MODE_STATE.current_mode_id] ?? null,
        availableModes: Object.values(CHAT_MODES).filter((m) => m.enabled),
        allModes: Object.values(CHAT_MODES),
        favoriteModes: [],
        modeHistory: [],
        userXP: 0,
        modeXP: {},
        isLoading: false,
        error: null,

        // ═══════════════════════════════════════════════════════════════════
        // CHANGEMENT DE MODE
        // ═══════════════════════════════════════════════════════════════════
        changeMode: async (request: ChatModeChangeRequest): Promise<ChatModeChangeResult> => {
          set({ isLoading: true, error: null });

          try {
            const result = await chatModeService.changeMode(request);

            if (result.success) {
              const newMode = chatModeService.getCurrentMode();
              const state = chatModeService.getState();

              set({
                currentModeId: result.new_mode_id,
                currentMode: newMode ?? null,
                modeHistory: state.mode_history,
                isLoading: false,
              });
            } else {
              set({ error: result.error ?? 'Échec du changement de mode', isLoading: false });
            }

            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            set({ error: errorMessage, isLoading: false });
            return {
              success: false,
              previous_mode_id: get().currentModeId,
              new_mode_id: request.new_mode_id,
              system_prompt_applied: false,
              tools_updated: false,
              error: errorMessage,
            };
          }
        },

        setMode: async (modeId: string): Promise<ChatModeChangeResult> => {
          return get().changeMode({ new_mode_id: modeId });
        },

        // ═══════════════════════════════════════════════════════════════════
        // GESTION XP
        // ═══════════════════════════════════════════════════════════════════
        addXP: (amount: number, forMode?: string) => {
          chatModeService.addXP(amount, forMode);

          set((state) => {
            const modeId = forMode ?? state.currentModeId;
            return {
              userXP: state.userXP + amount,
              modeXP: {
                ...state.modeXP,
                [modeId]: (state.modeXP[modeId] ?? 0) + amount,
              },
              // Mettre à jour les modes disponibles si XP change
              availableModes: chatModeService.getAvailableModes(),
            };
          });
        },

        setUserXP: (xp: number) => {
          chatModeService.setUserXP(xp);
          set({
            userXP: xp,
            availableModes: chatModeService.getAvailableModes(),
          });
        },

        // ═══════════════════════════════════════════════════════════════════
        // FAVORIS
        // ═══════════════════════════════════════════════════════════════════
        addFavorite: (modeId: string) => {
          chatModeService.addFavorite(modeId);
          set((state) => ({
            favoriteModes: [...new Set([...state.favoriteModes, modeId])],
          }));
        },

        removeFavorite: (modeId: string) => {
          chatModeService.removeFavorite(modeId);
          set((state) => ({
            favoriteModes: state.favoriteModes.filter((id) => id !== modeId),
          }));
        },

        toggleFavorite: (modeId: string) => {
          const { favoriteModes, addFavorite, removeFavorite } = get();
          if (favoriteModes.includes(modeId)) {
            removeFavorite(modeId);
          } else {
            addFavorite(modeId);
          }
        },

        // ═══════════════════════════════════════════════════════════════════
        // VALIDATION OUTILS
        // ═══════════════════════════════════════════════════════════════════
        validateToolAccess: (toolId: keyof ToolsPermissions): ToolAccessValidation => {
          return chatModeService.validateToolAccess(toolId);
        },

        getAllowedTools: (): (keyof ToolsPermissions)[] => {
          return chatModeService.getAllowedTools();
        },

        isToolAllowed: (toolId: keyof ToolsPermissions): boolean => {
          return chatModeService.validateToolAccess(toolId).allowed;
        },

        // ═══════════════════════════════════════════════════════════════════
        // UTILITAIRES
        // ═══════════════════════════════════════════════════════════════════
        getModeById: (modeId: string): ChatMode | undefined => {
          return CHAT_MODES[modeId];
        },

        getModesByCategory: (category: string): ChatMode[] => {
          return Object.values(CHAT_MODES).filter((mode) => mode.category === category);
        },

        getSystemPrompt: (): string => {
          return chatModeService.getCurrentSystemPrompt();
        },

        // ═══════════════════════════════════════════════════════════════════
        // LIFECYCLE
        // ═══════════════════════════════════════════════════════════════════
        initialize: async () => {
          set({ isLoading: true });

          try {
            await chatModeService.initialize();

            const currentMode = chatModeService.getCurrentMode();
            const state = chatModeService.getState();

            set({
              currentModeId: state.current_mode_id,
              currentMode: currentMode ?? null,
              availableModes: chatModeService.getAvailableModes(),
              allModes: chatModeService.getAllModes(),
              favoriteModes: state.favorite_modes,
              modeHistory: state.mode_history,
              userXP: chatModeService.getUserXP(),
              modeXP: state.mode_xp,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erreur d\'initialisation',
              isLoading: false,
            });
          }
        },

        reset: () => {
          chatModeService.reset();
          set({
            currentModeId: INITIAL_CHAT_MODE_STATE.current_mode_id,
            currentMode: CHAT_MODES[INITIAL_CHAT_MODE_STATE.current_mode_id] ?? null,
            availableModes: Object.values(CHAT_MODES).filter((m) => m.enabled),
            favoriteModes: [],
            modeHistory: [],
            userXP: 0,
            modeXP: {},
            error: null,
          });
        },

        sync: () => {
          const state = chatModeService.getState();
          const currentMode = chatModeService.getCurrentMode();

          set({
            currentModeId: state.current_mode_id,
            currentMode: currentMode ?? null,
            favoriteModes: state.favorite_modes,
            modeHistory: state.mode_history,
            userXP: chatModeService.getUserXP(),
            modeXP: state.mode_xp,
          });
        },
      }),
      {
        name: 'titane-chat-mode-store',
        partialize: (state) => ({
          favoriteModes: state.favoriteModes,
          // Note: XP et mode sont persistés dans le service
        }),
      }
    ),
    { name: 'ChatModeStore' }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS DÉRIVÉS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook pour obtenir le mode actuel
 */
export const useCurrentChatMode = () => {
  return useChatModeStore((state) => state.currentMode);
};

/**
 * Hook pour obtenir l'ID du mode actuel
 */
export const useCurrentChatModeId = () => {
  return useChatModeStore((state) => state.currentModeId);
};

/**
 * Hook pour les modes disponibles
 */
export const useAvailableChatModes = () => {
  return useChatModeStore((state) => state.availableModes);
};

/**
 * Hook pour vérifier si un outil est autorisé
 */
export const useToolAllowed = (toolId: keyof ToolsPermissions) => {
  const isToolAllowed = useChatModeStore((state) => state.isToolAllowed);
  return isToolAllowed(toolId);
};

/**
 * Hook pour l'XP utilisateur
 */
export const useUserXP = () => {
  return useChatModeStore((state) => ({
    userXP: state.userXP,
    modeXP: state.modeXP,
    addXP: state.addXP,
  }));
};
