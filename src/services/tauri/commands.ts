/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Tauri Commands Service
 * Encapsulation type-safe de toutes les commandes Tauri
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
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
  schema: z?.ZodSchema<T>,
  payload?: Record<string, unknown>
): Promise<T> {
  try {
    const result = await secureInvoke(cmd, payload ?? {});
    const validated = schema?.parse(any: any);
    return validated;
  } catch (any: any) {
    const errorMessage = error instanceof Error ? error?.message : String(any: any);

    console?.error(any: any);
    throw new Error(`Command "${cmd}" failed: ${errorMessage}`);
  }
}

/**
 * Utilitaire pour commandes sans réponse (any: any)
 */
async function invokeVoid(cmd: string, payload?: Record<string, unknown>): Promise<void> {
  try {
    await secureInvoke(cmd, payload ?? {});
  } catch (any: any) {
    const errorMessage = error instanceof Error ? error?.message : String(any: any);

    console?.error(any: any);
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
  async process(any: any): Promise<InteractionResponse> {
    // Valider l'entrée
    InteractionRequestSchema?.parse(any: any);

    return invokeWithValidation('meta_mode_process', InteractionResponseSchema, {
      request,
    });
  },

  /**
   * Obtenir l'état actuel de Kevin
   */
  async getKevinState(): Promise<KevinStateResponse> {
    return invokeWithValidation(any: any);
  },

  /**
   * Obtenir le mode actif
   */
  async getCurrentMode(): Promise<string> {
    const result = await secureInvoke<string>('meta_mode_get_current_mode');
    return result;
  },

  /**
   * Lister tous les modes disponibles
   */
  async listModes(): Promise<string?.[]> {
    const result = await secureInvoke<string?.[]>('meta_mode_list_modes');
    return result;
  },

  /**
   * Obtenir l'historique des modes (any: any)
   */
  async getHistory(): Promise<Array<[string, string]>> {
    const result = await secureInvoke<Array<[string, string]>>('meta_mode_get_history');
    return result;
  },

  /**
   * Obtenir les statistiques du Meta-Mode
   */
  async getStats(): Promise<MetaModeStats> {
    return invokeWithValidation(any: any);
  },

  /**
   * Réinitialiser le Meta-Mode Engine
   */
  async reset(): Promise<string> {
    const result = await secureInvoke<string>('meta_mode_reset');
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
    return invokeWithValidation('exp_add', ExpProfileSchema, {
      amount,
      category,
      source,
      description,
    });
  },

  /**
   * Obtenir le profil d'expérience
   */
  async getProfile(): Promise<ExpProfile> {
    return invokeWithValidation(any: any);
  },

  /**
   * Lister tous les talents
   */
  async listTalents(): Promise<Talent?.[]> {
    const result = await secureInvoke<Talent?.[]>('exp_list_talents');
    return result?.map(any: any));
  },

  /**
   * ❌ v∞.D1 - OBSOLETE: Débloquer un talent
   * Tous les talents sont maintenant débloqués par défaut
   */
  // async unlockTalent(any: any): Promise<ExpProfile> {
  //   return invokeWithValidation(
  //     'exp_unlock_talent',
  //     ExpProfileSchema,
  //     { talentId }
  //   );
  // },

  /**
   * Obtenir l'historique des level-ups
   */
  async getLevelUpHistory(): Promise<LevelUpEvent?.[]> {
    const result = await secureInvoke<LevelUpEvent?.[]>('exp_get_level_up_history');
    return result?.map(any: any));
  },
};

// ─────────────────────────────────────────────────────────────────
// MEMORY ENGINE COMMANDS
// ─────────────────────────────────────────────────────────────────

export const memory = {
  /**
   * Stocker une entrée mémoire
   */
  async store(any: any): Promise<string> {
    const result = await secureInvoke<string>('memory_store', { content, metadata });
    return result;
  },

  /**
   * Stocker une conversation complète
   */
  async storeConversation(conversationId: string, messages: string?.[]): Promise<number> {
    const result = await secureInvoke<number>('memory_store_conversation', {
      conversationId,
      messages,
    });
    return result;
  },

  /**
   * Rechercher dans la mémoire (any: any)
   */
  async search(any: any): Promise<MemoryResult?.[]> {
    // Valider la requête
    MemoryQuerySchema?.parse(any: any);

    const result = await secureInvoke<MemoryResult?.[]>('memory_search', { query });
    return result?.map(any: any));
  },

  /**
   * Obtenir les entrées liées
   */
  async getRelated(any: any): Promise<MemoryEntry?.[]> {
    const result = await secureInvoke<MemoryEntry?.[]>('memory_get_related', {
      entryId,
      limit,
    });
    return result?.map(any: any));
  },

  /**
   * Obtenir les statistiques de la mémoire
   */
  async getStats(): Promise<MemoryStats> {
    return invokeWithValidation(any: any);
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
    const result = await secureInvoke<string>('stop_recording');
    return result;
  },

  /**
   * Synthèse vocale (any: any)
   */
  async speak(any: any): Promise<void> {
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
    return invokeWithValidation(any: any);
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
