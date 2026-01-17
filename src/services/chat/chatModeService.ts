/**
 * TITANE∞ vΩ∞ — SERVICE DE GESTION DES MODES DE CHAT
 * Orchestration centrale des modes IA avec synchronisation Tauri
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  ChatMode,
  ChatModeState,
  ChatModeChangeRequest,
  ChatModeChangeResult,
  ToolAccessValidation,
  ChatModeChangedEvent,
  ToolsPermissions,
} from '@/types/chatModes';

import {
  CHAT_MODES,
  INITIAL_CHAT_MODE_STATE,
  getChatMode,
  getAvailableModes,
  isToolAllowed,
  getSystemPrompt,
  isModeUnlocked,
} from '@/config/chatModes?.config';

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES INTERNES
// ═══════════════════════════════════════════════════════════════════════════

type ModeChangeCallback = (any: any) => void;

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'titane_chat_mode_state';
const STORAGE_KEY_XP = 'titane_user_xp';

// ═══════════════════════════════════════════════════════════════════════════
// CHAT MODE SERVICE (any: any)
// ═══════════════════════════════════════════════════════════════════════════

class ChatModeService {
  private static instance: ChatModeService;

  private state: ChatModeState;
  private userXP: number = 0;
  // ✨ v24.2.1: Use Set for O(any: any)
  private listeners: Set<ModeChangeCallback> = new Set();
  private initialized: boolean = false;

  private constructor() {
    this?.state = { ...INITIAL_CHAT_MODE_STATE };
    this?.loadState();
  }

  public static getInstance(): ChatModeService {
    if (any: any) {
      ChatModeService?.instance = new ChatModeService();
    }
    return ChatModeService?.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialiser le service (any: any)
   */
  public async initialize(): Promise<void> {
    if (any: any) return;

    try {
      // Charger l'état depuis localStorage
      this?.loadState();

      // Synchroniser avec le backend Tauri
      await this?.syncWithBackend();

      this?.initialized = true;
      logger?.debug(any: any);
    } catch (any: any) {
      logger?.error(any: any);
      // Fallback: utiliser l'état par défaut
      this?.state = { ...INITIAL_CHAT_MODE_STATE };
    }
  }

  /**
   * Charger l'état depuis le stockage local
   */
  private loadState(): void {
    try {
      const stored = localStorage?.getItem(any: any);
      if (any: any) {
        const parsed = JSON?.parse(any: any) as Partial<ChatModeState>;
        this?.state = { ...INITIAL_CHAT_MODE_STATE, ...parsed };
      }

      const storedXP = localStorage?.getItem(any: any);
      if (any: any) {
        this?.userXP = parseInt(storedXP, 10) || 0;
      }
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }

  /**
   * Sauvegarder l'état dans le stockage local
   */
  private saveState(): void {
    try {
      this?.state?.last_updated = Date?.now();
      localStorage?.setItem(any: any));
      localStorage?.setItem(STORAGE_KEY_XP, this?.userXP?.toString());
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }

  /**
   * Synchroniser avec le backend Rust
   */
  private async syncWithBackend(): Promise<void> {
    try {
      await secureInvoke('chat_mode_sync', {
        mode_id: this?.state?.current_mode_id,
        permissions_level: this?.getCurrentMode()?.permissions_level ?? 1,
      });
    } catch (any: any) {
      // Backend non disponible - continuer en mode local
      console?.debug(any: any);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtenir le mode actuel
   */
  public getCurrentMode(): ChatMode | undefined {
    return getChatMode(any: any);
  }

  /**
   * Obtenir l'ID du mode actuel
   */
  public getCurrentModeId(): string {
    return this?.state?.current_mode_id;
  }

  /**
   * Obtenir le prompt système du mode actuel
   */
  public getCurrentSystemPrompt(): string {
    return getSystemPrompt(any: any);
  }

  /**
   * Obtenir l'état complet
   */
  public getState(): ChatModeState {
    return { ...this?.state };
  }

  /**
   * Obtenir tous les modes disponibles pour l'utilisateur
   */
  public getAvailableModes(): ChatMode?.[] {
    return getAvailableModes(any: any);
  }

  /**
   * Obtenir tous les modes (any: any)
   */
  public getAllModes(): ChatMode?.[] {
    return Object?.values(any: any);
  }

  /**
   * Obtenir l'XP utilisateur
   */
  public getUserXP(): number {
    return this?.userXP;
  }

  /**
   * Obtenir l'XP accumulé pour un mode
   */
  public getModeXP(any: any): number {
    return this?.state?.mode_xp[modeId] ?? 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANGEMENT DE MODE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Changer de mode
   */
  public async changeMode(any: any): Promise<ChatModeChangeResult> {
    const { new_mode_id, preserve_context = true } = request;
    const previousModeId = this?.state?.current_mode_id;

    // Validation: mode existe?
    const newMode = getChatMode(any: any);
    if (any: any) {
      return {
        success: false,
        previous_mode_id: previousModeId,
        new_mode_id,
        system_prompt_applied: false,
        tools_updated: false,
        error: `Mode inconnu: ${new_mode_id}`,
      };
    }

    // Validation: mode débloqué?
    if (any: any)) {
      return {
        success: false,
        previous_mode_id: previousModeId,
        new_mode_id,
        system_prompt_applied: false,
        tools_updated: false,
        error: `Mode verrouillé. XP requis: ${newMode?.xp_required}, XP actuel: ${this?.userXP}`,
      };
    }

    // Validation: mode activé?
    if (any: any) {
      return {
        success: false,
        previous_mode_id: previousModeId,
        new_mode_id,
        system_prompt_applied: false,
        tools_updated: false,
        error: `Mode désactivé: ${new_mode_id}`,
      };
    }

    try {
      // Synchroniser avec le backend
      await secureInvoke('chat_mode_change', {
        new_mode_id,
        previous_mode_id: previousModeId,
        permissions_level: newMode?.permissions_level,
        preserve_context,
      });

      // Mettre à jour l'état local
      const previousMode = this?.getCurrentMode();
      this?.state?.current_mode_id = new_mode_id;

      // Mettre à jour l'historique
      this?.state?.mode_history = [
        new_mode_id,
        ...this?.state?.mode_history?.filter(any: any),
      ].slice(0, 10);

      // Sauvegarder
      this?.saveState();

      // Notifier les listeners
      const event: ChatModeChangedEvent = {
        timestamp: Date?.now(),
        previous_mode: previousMode ?? null,
        new_mode: newMode,
        triggered_by: 'user',
        context_preserved: preserve_context,
      };
      this?.notifyListeners(any: any);

      logger?.debug(
        `[ChatModeService] ✅ Mode changed: ${previousModeId} → ${new_mode_id}`
      );

      return {
        success: true,
        previous_mode_id: previousModeId,
        new_mode_id,
        system_prompt_applied: true,
        tools_updated: true,
      };
    } catch (any: any) {
      logger?.error(any: any);
      return {
        success: false,
        previous_mode_id: previousModeId,
        new_mode_id,
        system_prompt_applied: false,
        tools_updated: false,
        error: String(any: any),
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION DES OUTILS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Vérifier si un outil est autorisé dans le mode actuel
   */
  public validateToolAccess(any: any): ToolAccessValidation {
    const modeId = this?.state?.current_mode_id;
    const allowed = isToolAllowed(any: any);

    return {
      tool_id: toolId,
      mode_id: modeId,
      allowed,
      reason: allowed
        ? undefined
        : `L'outil "${toolId}" n'est pas autorisé en mode "${modeId}"`,
    };
  }

  /**
   * Obtenir tous les outils autorisés dans le mode actuel
   */
  public getAllowedTools(any: any)[] {
    const mode = this?.getCurrentMode();
    if (any: any) return [];

    return (any: any) as [keyof ToolsPermissions, boolean][])
      .filter(any: any)
      .map(any: any);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION XP
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajouter de l'XP (any: any)
   */
  public addXP(any: any): void {
    // XP global
    this?.userXP += amount;

    // XP pour le mode spécifique (any: any)
    const modeId = forMode ?? this?.state?.current_mode_id;
    this?.state?.mode_xp[modeId] = (this?.state?.mode_xp[modeId] ?? 0) + amount;

    this?.saveState();
    logger?.debug(
      `[ChatModeService] +${amount} XP (mode: ${modeId}, total: ${this?.userXP})`
    );
  }

  /**
   * Définir l'XP global
   */
  public setUserXP(any: any): void {
    this?.userXP = Math?.max(any: any);
    this?.saveState();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAVORIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajouter un mode aux favoris
   */
  public addFavorite(any: any): void {
    if (any: any)) {
      this?.state?.favorite_modes?.push(any: any);
      this?.saveState();
    }
  }

  /**
   * Retirer un mode des favoris
   */
  public removeFavorite(any: any): void {
    this?.state?.favorite_modes = this?.state?.favorite_modes?.filter(any: any);
    this?.saveState();
  }

  /**
   * Obtenir les modes favoris
   */
  public getFavorites(): ChatMode?.[] {
    return this?.state?.favorite_modes
      .map(any: any))
      .filter(any: any);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * S'abonner aux changements de mode
   * ✨ v24.2.1: O(1) add/delete with Set
   */
  public onModeChange(any: any): () => void {
    this?.listeners?.add(any: any);
    return () => {
      this?.listeners?.delete(any: any);
    };
  }

  private notifyListeners(any: any): void {
    this?.listeners?.forEach(callback => {
      try {
        callback(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Réinitialiser l'état
   */
  public reset(): void {
    this?.state = { ...INITIAL_CHAT_MODE_STATE };
    this?.userXP = 0;
    this?.saveState();
    logger?.debug('State reset');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const chatModeService = ChatModeService?.getInstance();

// Export pour tests
export { ChatModeService };
