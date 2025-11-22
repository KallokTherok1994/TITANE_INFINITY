/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Tauri Commands Service
 * Encapsulation type-safe de toutes les commandes Tauri
 * ═══════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';
import type {
  InteractionRequest,
  InteractionResponse,
  KevinStateResponse,
  MetaModeStats,
  ExpProfile,
  Talent,
  LevelUpEvent,
  MemoryEntry,
  MemoryQuery,
  MemoryResult,
  MemoryStats,
  MemoryMetadata,
  SystemStatus,
} from './types';
import {
  InteractionRequestSchema,
  InteractionResponseSchema,
  KevinStateResponseSchema,
  MetaModeStatsSchema,
  ExpProfileSchema,
  TalentSchema,
  LevelUpEventSchema,
  MemoryEntrySchema,
  MemoryQuerySchema,
  MemoryResultSchema,
  MemoryStatsSchema,
  SystemStatusSchema,
} from './validation';

/**
 * Utilitaire d'invocation type-safe avec validation Zod
 */
async function invokeWithValidation<T>(
  cmd: string,
  schema: z.ZodSchema<T>,
  payload?: Record<string, unknown>
): Promise<T> {
  try {
    const result = await invoke(cmd, payload ?? {});
    const validated = schema.parse(result);
    return validated;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    console.error(`[Tauri Command Error] ${cmd}:`, errorMessage);
    throw new Error(`Command "${cmd}" failed: ${errorMessage}`);
  }
}

/**
 * Utilitaire pour commandes sans réponse (void)
 */
async function invokeVoid(
  cmd: string,
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await invoke(cmd, payload ?? {});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    console.error(`[Tauri Command Error] ${cmd}:`, errorMessage);
    throw new Error(`Command "${cmd}" failed: ${errorMessage}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// META-MODE ENGINE COMMANDS
// ─────────────────────────────────────────────────────────────────

export const metaMode = {
  /**
   * Traiter une interaction avec le Meta-Mode Engine
   */
  async process(request: InteractionRequest): Promise<InteractionResponse> {
    // Valider l'entrée
    InteractionRequestSchema.parse(request);
    
    return invokeWithValidation(
      'meta_mode_process',
      InteractionResponseSchema,
      { request }
    );
  },

  /**
   * Obtenir l'état actuel de Kevin
   */
  async getKevinState(): Promise<KevinStateResponse> {
    return invokeWithValidation(
      'meta_mode_get_kevin_state',
      KevinStateResponseSchema
    );
  },

  /**
   * Obtenir le mode actif
   */
  async getCurrentMode(): Promise<string> {
    const result = await invoke<string>('meta_mode_get_current_mode');
    return result;
  },

  /**
   * Lister tous les modes disponibles
   */
  async listModes(): Promise<string[]> {
    const result = await invoke<string[]>('meta_mode_list_modes');
    return result;
  },

  /**
   * Obtenir l'historique des modes (10 derniers)
   */
  async getHistory(): Promise<Array<[string, string]>> {
    const result = await invoke<Array<[string, string]>>('meta_mode_get_history');
    return result;
  },

  /**
   * Obtenir les statistiques du Meta-Mode
   */
  async getStats(): Promise<MetaModeStats> {
    return invokeWithValidation(
      'meta_mode_get_stats',
      MetaModeStatsSchema
    );
  },

  /**
   * Réinitialiser le Meta-Mode Engine
   */
  async reset(): Promise<string> {
    const result = await invoke<string>('meta_mode_reset');
    return result;
  },
};

// ─────────────────────────────────────────────────────────────────
// EXP ENGINE COMMANDS
// ─────────────────────────────────────────────────────────────────

export const exp = {
  /**
   * Ajouter de l'expérience
   */
  async add(
    amount: number,
    category: string,
    source: string,
    description: string
  ): Promise<ExpProfile> {
    return invokeWithValidation(
      'exp_add',
      ExpProfileSchema,
      { amount, category, source, description }
    );
  },

  /**
   * Obtenir le profil d'expérience
   */
  async getProfile(): Promise<ExpProfile> {
    return invokeWithValidation('exp_get_profile', ExpProfileSchema);
  },

  /**
   * Lister tous les talents
   */
  async listTalents(): Promise<Talent[]> {
    const result = await invoke<Talent[]>('exp_list_talents');
    return result.map(t => TalentSchema.parse(t));
  },

  /**
   * Débloquer un talent
   */
  async unlockTalent(talentId: string): Promise<ExpProfile> {
    return invokeWithValidation(
      'exp_unlock_talent',
      ExpProfileSchema,
      { talentId }
    );
  },

  /**
   * Obtenir l'historique des level-ups
   */
  async getLevelUpHistory(): Promise<LevelUpEvent[]> {
    const result = await invoke<LevelUpEvent[]>('exp_get_level_up_history');
    return result.map(e => LevelUpEventSchema.parse(e));
  },
};

// ─────────────────────────────────────────────────────────────────
// MEMORY ENGINE COMMANDS
// ─────────────────────────────────────────────────────────────────

export const memory = {
  /**
   * Stocker une entrée mémoire
   */
  async store(content: string, metadata: MemoryMetadata): Promise<string> {
    const result = await invoke<string>('memory_store', { content, metadata });
    return result;
  },

  /**
   * Stocker une conversation complète
   */
  async storeConversation(
    conversationId: string,
    messages: string[]
  ): Promise<number> {
    const result = await invoke<number>('memory_store_conversation', {
      conversationId,
      messages,
    });
    return result;
  },

  /**
   * Rechercher dans la mémoire (similarité sémantique)
   */
  async search(query: MemoryQuery): Promise<MemoryResult[]> {
    // Valider la requête
    MemoryQuerySchema.parse(query);
    
    const result = await invoke<MemoryResult[]>('memory_search', { query });
    return result.map(r => MemoryResultSchema.parse(r));
  },

  /**
   * Obtenir les entrées liées
   */
  async getRelated(entryId: string, limit: number): Promise<MemoryEntry[]> {
    const result = await invoke<MemoryEntry[]>('memory_get_related', {
      entryId,
      limit,
    });
    return result.map(e => MemoryEntrySchema.parse(e));
  },

  /**
   * Obtenir les statistiques de la mémoire
   */
  async getStats(): Promise<MemoryStats> {
    return invokeWithValidation('memory_get_stats', MemoryStatsSchema);
  },

  /**
   * Effacer toute la mémoire
   */
  async clear(): Promise<void> {
    return invokeVoid('memory_clear');
  },
};

// ─────────────────────────────────────────────────────────────────
// VOICE MODE COMMANDS
// ─────────────────────────────────────────────────────────────────

export const voice = {
  /**
   * Démarrer l'enregistrement vocal
   */
  async startRecording(): Promise<void> {
    return invokeVoid('start_recording');
  },

  /**
   * Arrêter l'enregistrement vocal
   */
  async stopRecording(): Promise<string> {
    const result = await invoke<string>('stop_recording');
    return result;
  },

  /**
   * Synthèse vocale (TTS)
   */
  async speak(text: string, useOnline: boolean): Promise<void> {
    return invokeVoid('speak', { text, useOnline });
  },
};

// ─────────────────────────────────────────────────────────────────
// SYSTEM COMMANDS
// ─────────────────────────────────────────────────────────────────

export const system = {
  /**
   * Obtenir le statut système
   */
  async getStatus(): Promise<SystemStatus> {
    return invokeWithValidation('get_system_status', SystemStatusSchema);
  },

  /**
   * Vérifier si Tauri est disponible
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  },
};

// ─────────────────────────────────────────────────────────────────
// EXPORT UNIFIÉ
// ─────────────────────────────────────────────────────────────────

export const tauri = {
  metaMode,
  exp,
  memory,
  voice,
  system,
};
