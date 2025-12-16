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
} from '@/config/chatModes.config';

import { secureInvoke } from '@/lib/security';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES INTERNES
// ═══════════════════════════════════════════════════════════════════════════

type ModeChangeCallback = (event: ChatModeChangedEvent) => void;

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'titane_chat_mode_state';
const STORAGE_KEY_XP = 'titane_user_xp';

// ═══════════════════════════════════════════════════════════════════════════
// CHAT MODE SERVICE (SINGLETON)
// ═══════════════════════════════════════════════════════════════════════════

class ChatModeService {
  private static instance: ChatModeService;

  private state: ChatModeState;
  private userXP: number = 0;
  // ✨ v24.2.1: Use Set for O(1) add/delete instead of Array O(n)
  private listeners: Set<ModeChangeCallback> = new Set();
  private initialized: boolean = false;

  private constructor() {
    this.state = { ...INITIAL_CHAT_MODE_STATE };
    this.loadState();
  }

  public static getInstance(): ChatModeService {
    if (!ChatModeService.instance) {
      ChatModeService.instance = new ChatModeService();
    }
    return ChatModeService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialiser le service (charger état persisté)
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Charger l'état depuis localStorage
      this.loadState();

      // Synchroniser avec le backend Tauri
      await this.syncWithBackend();

      this.initialized = true;
      console.log(
        '[ChatModeService] ✅ Initialized with mode:',
        this.state.current_mode_id
      );
    } catch (error) {
      console.error('[ChatModeService] ❌ Initialization failed:', error);
      // Fallback: utiliser l'état par défaut
      this.state = { ...INITIAL_CHAT_MODE_STATE };
    }
  }

  /**
   * Charger l'état depuis le stockage local
   */
  private loadState(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ChatModeState>;
        this.state = { ...INITIAL_CHAT_MODE_STATE, ...parsed };
      }

      const storedXP = localStorage.getItem(STORAGE_KEY_XP);
      if (storedXP) {
        this.userXP = parseInt(storedXP, 10) || 0;
      }
    } catch (error) {
      console.warn('[ChatModeService] Failed to load state from storage:', error);
    }
  }

  /**
   * Sauvegarder l'état dans le stockage local
   */
  private saveState(): void {
    try {
      this.state.last_updated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      localStorage.setItem(STORAGE_KEY_XP, this.userXP.toString());
    } catch (error) {
      console.warn('[ChatModeService] Failed to save state:', error);
    }
  }

  /**
   * Synchroniser avec le backend Rust
   */
  private async syncWithBackend(): Promise<void> {
    try {
      await secureInvoke('chat_mode_sync', {
        mode_id: this.state.current_mode_id,
        permissions_level: this.getCurrentMode()?.permissions_level ?? 1,
      });
    } catch (error) {
      // Backend non disponible - continuer en mode local
      console.debug('[ChatModeService] Backend sync skipped:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtenir le mode actuel
   */
  public getCurrentMode(): ChatMode | undefined {
    return getChatMode(this.state.current_mode_id);
  }

  /**
   * Obtenir l'ID du mode actuel
   */
  public getCurrentModeId(): string {
    return this.state.current_mode_id;
  }

  /**
   * Obtenir le prompt système du mode actuel
   */
  public getCurrentSystemPrompt(): string {
    return getSystemPrompt(this.state.current_mode_id);
  }

  /**
   * Obtenir l'état complet
   */
  public getState(): ChatModeState {
    return { ...this.state };
  }

  /**
   * Obtenir tous les modes disponibles pour l'utilisateur
   */
  public getAvailableModes(): ChatMode[] {
    return getAvailableModes(this.userXP);
  }

  /**
   * Obtenir tous les modes (même verrouillés)
   */
  public getAllModes(): ChatMode[] {
    return Object.values(CHAT_MODES);
  }

  /**
   * Obtenir l'XP utilisateur
   */
  public getUserXP(): number {
    return this.userXP;
  }

  /**
   * Obtenir l'XP accumulé pour un mode
   */
  public getModeXP(modeId: string): number {
    return this.state.mode_xp[modeId] ?? 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANGEMENT DE MODE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Changer de mode
   */
  public async changeMode(request: ChatModeChangeRequest): Promise<ChatModeChangeResult> {
    const { new_mode_id, preserve_context = true } = request;
    const previousModeId = this.state.current_mode_id;

    // Validation: mode existe?
    const newMode = getChatMode(new_mode_id);
    if (!newMode) {
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
    if (!isModeUnlocked(new_mode_id, this.userXP)) {
      return {
        success: false,
        previous_mode_id: previousModeId,
        new_mode_id,
        system_prompt_applied: false,
        tools_updated: false,
        error: `Mode verrouillé. XP requis: ${newMode.xp_required}, XP actuel: ${this.userXP}`,
      };
    }

    // Validation: mode activé?
    if (!newMode.enabled) {
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
        permissions_level: newMode.permissions_level,
        preserve_context,
      });

      // Mettre à jour l'état local
      const previousMode = this.getCurrentMode();
      this.state.current_mode_id = new_mode_id;

      // Mettre à jour l'historique
      this.state.mode_history = [
        new_mode_id,
        ...this.state.mode_history.filter(id => id !== new_mode_id),
      ].slice(0, 10);

      // Sauvegarder
      this.saveState();

      // Notifier les listeners
      const event: ChatModeChangedEvent = {
        timestamp: Date.now(),
        previous_mode: previousMode ?? null,
        new_mode: newMode,
        triggered_by: 'user',
        context_preserved: preserve_context,
      };
      this.notifyListeners(event);

      console.log(
        `[ChatModeService] ✅ Mode changed: ${previousModeId} → ${new_mode_id}`
      );

      return {
        success: true,
        previous_mode_id: previousModeId,
        new_mode_id,
        system_prompt_applied: true,
        tools_updated: true,
      };
    } catch (error) {
      console.error('[ChatModeService] ❌ Mode change failed:', error);
      return {
        success: false,
        previous_mode_id: previousModeId,
        new_mode_id,
        system_prompt_applied: false,
        tools_updated: false,
        error: String(error),
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION DES OUTILS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Vérifier si un outil est autorisé dans le mode actuel
   */
  public validateToolAccess(toolId: keyof ToolsPermissions): ToolAccessValidation {
    const modeId = this.state.current_mode_id;
    const allowed = isToolAllowed(modeId, toolId);

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
  public getAllowedTools(): (keyof ToolsPermissions)[] {
    const mode = this.getCurrentMode();
    if (!mode) return [];

    return (Object.entries(mode.tools_allowed) as [keyof ToolsPermissions, boolean][])
      .filter(([_, allowed]) => allowed)
      .map(([toolId]) => toolId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION XP
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajouter de l'XP (global + mode spécifique)
   */
  public addXP(amount: number, forMode?: string): void {
    // XP global
    this.userXP += amount;

    // XP pour le mode spécifique (ou mode actuel)
    const modeId = forMode ?? this.state.current_mode_id;
    this.state.mode_xp[modeId] = (this.state.mode_xp[modeId] ?? 0) + amount;

    this.saveState();
    console.log(
      `[ChatModeService] +${amount} XP (mode: ${modeId}, total: ${this.userXP})`
    );
  }

  /**
   * Définir l'XP global
   */
  public setUserXP(xp: number): void {
    this.userXP = Math.max(0, xp);
    this.saveState();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAVORIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajouter un mode aux favoris
   */
  public addFavorite(modeId: string): void {
    if (!this.state.favorite_modes.includes(modeId)) {
      this.state.favorite_modes.push(modeId);
      this.saveState();
    }
  }

  /**
   * Retirer un mode des favoris
   */
  public removeFavorite(modeId: string): void {
    this.state.favorite_modes = this.state.favorite_modes.filter(id => id !== modeId);
    this.saveState();
  }

  /**
   * Obtenir les modes favoris
   */
  public getFavorites(): ChatMode[] {
    return this.state.favorite_modes
      .map(id => getChatMode(id))
      .filter((mode): mode is ChatMode => mode !== undefined);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * S'abonner aux changements de mode
   * ✨ v24.2.1: O(1) add/delete with Set
   */
  public onModeChange(callback: ModeChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(event: ChatModeChangedEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[ChatModeService] Listener error:', error);
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
    this.state = { ...INITIAL_CHAT_MODE_STATE };
    this.userXP = 0;
    this.saveState();
    console.log('[ChatModeService] State reset');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const chatModeService = ChatModeService.getInstance();

// Export pour tests
export { ChatModeService };
