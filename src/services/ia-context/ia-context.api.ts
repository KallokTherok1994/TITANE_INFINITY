/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — IA CONTEXT API SERVICE
 * Service TypeScript pour interagir avec IAContext (Phase 8)
 * ═══════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  IAContext,
  IAGlobalStats,
  IAEngineMetrics,
  IARequestRecord,
  CommandResult,
} from './ia-context.types';

/**
 * Service API pour la gestion du contexte IA
 */
export class IAContextAPIService {
  /**
   * Récupère le contexte IA complet
   */
  static async getIAContext(): Promise<IAContext> {
    try {
      const result = await invoke<CommandResult<IAContext>>('get_ia_context');

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get IA context');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error getting context:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques globales IA
   */
  static async getGlobalStats(): Promise<IAGlobalStats> {
    try {
      const result = await invoke<CommandResult<IAGlobalStats>>('get_ia_global_stats');

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get stats');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Définit le moteur IA actif
   */
  static async setActiveEngine(engine: string): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('set_active_ia_engine', {
        engine,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to set active engine');
      }

      console.log(`✅ [IAContextAPI] Active engine: ${engine}`);
      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error setting active engine:', error);
      throw error;
    }
  }

  /**
   * Met à jour la liste des moteurs disponibles
   */
  static async updateAvailableEngines(engines: string[]): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('update_available_ia_engines', {
        engines,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update engines');
      }

      console.log(`✅ [IAContextAPI] Updated engines: ${engines.join(', ')}`);
      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error updating engines:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un moteur
   */
  static async updateEngineStatus(engine: string, status: string): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('update_ia_engine_status', {
        engine,
        status,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update status');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error updating status:', error);
      throw error;
    }
  }

  /**
   * Enregistre une requête IA
   */
  static async recordRequest(record: IARequestRecord): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('record_ia_request', {
        record,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to record request');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error recording request:', error);
      throw error;
    }
  }

  /**
   * Récupère les métriques d'un moteur
   */
  static async getEngineMetrics(engine: string): Promise<IAEngineMetrics> {
    try {
      const result = await invoke<CommandResult<IAEngineMetrics>>('get_ia_engine_metrics', {
        engine,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get metrics');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error getting metrics:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des requêtes
   */
  static async getRequestHistory(limit?: number): Promise<IARequestRecord[]> {
    try {
      const result = await invoke<CommandResult<IARequestRecord[]>>('get_ia_request_history', {
        limit,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get history');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error getting history:', error);
      throw error;
    }
  }

  /**
   * Définit le dernier agent ayant utilisé l'IA
   */
  static async setLastUsedAgent(agentId: string): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('set_last_used_ia_agent', {
        agentId,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to set agent');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error setting agent:', error);
      throw error;
    }
  }

  /**
   * Met à jour la permission IA d'un agent
   */
  static async updateAgentPermission(agentId: string, permission: string): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('update_agent_ia_permission', {
        agentId,
        permission,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update permission');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error updating permission:', error);
      throw error;
    }
  }

  /**
   * Met à jour la recommandation de moteur pour un agent
   */
  static async updateAgentRecommendation(agentId: string, engine: string): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('update_agent_ia_recommendation', {
        agentId,
        engine,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update recommendation');
      }

      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error updating recommendation:', error);
      throw error;
    }
  }

  /**
   * Obtient le prochain moteur en cas de fallback
   */
  static async getNextFallbackEngine(currentEngine: string): Promise<string | null> {
    try {
      const result = await invoke<CommandResult<string | null>>('get_next_fallback_ia_engine', {
        currentEngine,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to get fallback engine');
      }

      return result.data ?? null;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error getting fallback engine:', error);
      throw error;
    }
  }

  /**
   * Active/désactive le fallback automatique
   */
  static async setAutoFallback(enabled: boolean): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('set_ia_auto_fallback', {
        enabled,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to set auto fallback');
      }

      console.log(`✅ [IAContextAPI] Auto-fallback: ${enabled ? 'enabled' : 'disabled'}`);
      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error setting auto fallback:', error);
      throw error;
    }
  }

  /**
   * Met à jour l'ordre de fallback
   */
  static async setFallbackOrder(order: string[]): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('set_ia_fallback_order', {
        order,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to set fallback order');
      }

      console.log(`✅ [IAContextAPI] Fallback order: ${order.join(' → ')}`);
      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error setting fallback order:', error);
      throw error;
    }
  }

  /**
   * Efface l'historique des requêtes
   */
  static async clearRequestHistory(): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('clear_ia_request_history');

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to clear history');
      }

      console.log(`✅ [IAContextAPI] History cleared`);
      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error clearing history:', error);
      throw error;
    }
  }

  /**
   * Réinitialise les métriques d'un moteur
   */
  static async resetEngineMetrics(engine: string): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('reset_ia_engine_metrics', {
        engine,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to reset metrics');
      }

      console.log(`✅ [IAContextAPI] Metrics reset for ${engine}`);
      return result.data;
    } catch (error) {
      console.error('❌ [IAContextAPI] Error resetting metrics:', error);
      throw error;
    }
  }
}

/**
 * Hook React Query keys pour le cache
 */
export const iaContextQueryKeys = {
  all: ['ia-context'] as const,
  context: () => [...iaContextQueryKeys.all, 'full'] as const,
  stats: () => [...iaContextQueryKeys.all, 'stats'] as const,
  metrics: (engine: string) => [...iaContextQueryKeys.all, 'metrics', engine] as const,
  history: (limit?: number) => [...iaContextQueryKeys.all, 'history', limit] as const,
};
