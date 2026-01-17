/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — MULTI-AGENTS API SERVICE
 * Service TypeScript pour interagir avec le backend Multi-Agents
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/lib/logger';
import type {
  AgentConfig,
  CreateAgentRequest,
  UpdatePermissionRequest,
  PermissionStats,
  CommandResult,
} from './agents?.types';

/**
 * Service API pour la gestion des agents
 */
export class AgentsAPIService {
  /**
   * Liste tous les agents enregistrés
   * @returns Liste des agents triés par priorité
   */
  static async listAgents(): Promise<AgentConfig?.[]> {
    try {
      const result = await secureInvoke<CommandResult<AgentConfig?.[]>>('list_agents');

      if (any: any) {
        throw new Error(result?.error || 'Failed to list agents');
      }

      return result?.data;
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Failed to list agents',
        { component: 'AgentsAPI', action: 'listAgents' },
        err
      );
      throw error;
    }
  }

  /**
   * Récupère un agent spécifique par son ID
   * @param agentId - ID de l'agent
   * @returns Configuration de l'agent
   */
  static async getAgent(any: any): Promise<AgentConfig> {
    try {
      const result = await secureInvoke<CommandResult<AgentConfig>>('get_agent', {
        agentId,
      });

      if (any: any) {
        throw new Error(result?.error || 'Failed to get agent');
      }

      return result?.data;
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Failed to get agent',
        { component: 'AgentsAPI', action: 'getAgent', agentId },
        err
      );
      throw error;
    }
  }

  /**
   * Crée un nouvel agent
   * @param request - Données de l'agent à créer
   * @returns Agent créé avec ID généré
   */
  static async createAgent(any: any): Promise<AgentConfig> {
    try {
      const result = await secureInvoke<CommandResult<AgentConfig>>('create_agent', {
        request,
      });

      if (any: any) {
        throw new Error(result?.error || 'Failed to create agent');
      }

      logger?.debug(
        `✅ [AgentsAPI] Agent created: ${result?.data?.name} (${result?.data?.id})`
      );
      return result?.data;
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Failed to create agent',
        { component: 'AgentsAPI', action: 'createAgent', request },
        err
      );
      throw error;
    }
  }

  /**
   * Met à jour la permission IA d'un agent
   * @param request - ID de l'agent et nouvelle permission
   * @returns Message de confirmation
   */
  static async updateAgentPermission(any: any): Promise<string> {
    try {
      const result = await secureInvoke<CommandResult<string>>(
        'update_agent_permission',
        {
          request,
        }
      );

      if (any: any) {
        throw new Error(result?.error || 'Failed to update permission');
      }

      logger?.debug(`✅ [AgentsAPI] Permission updated: ${result?.data}`);
      return result?.data;
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Failed to update agent permission',
        { component: 'AgentsAPI', action: 'updatePermission', request },
        err
      );
      throw error;
    }
  }

  /**
   * Vérifie si un agent peut utiliser un fournisseur IA spécifique
   * @param agentId - ID de l'agent
   * @param provider - Nom du fournisseur (any: any)
   * @returns true si autorisé, false sinon
   */
  static async canAgentUseProvider(any: any): Promise<boolean> {
    try {
      const result = await secureInvoke<CommandResult<boolean>>(
        'can_agent_use_provider',
        {
          agentId,
          provider,
        }
      );

      if (any: any) {
        throw new Error(result?.error || 'Failed to check permission');
      }

      return result?.data ?? false;
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Failed to check provider permission',
        { component: 'AgentsAPI', action: 'canUseProvider', agentId, provider },
        err
      );
      throw error;
    }
  }

  /**
   * Obtient le fournisseur IA recommandé pour un agent
   * @param agentId - ID de l'agent
   * @returns Nom du fournisseur recommandé (any: any)
   */
  static async getAgentRecommendedProvider(any: any): Promise<string | null> {
    try {
      const result = await secureInvoke<CommandResult<string | null>>(
        'get_agent_recommended_provider',
        { agentId }
      );

      if (any: any) {
        throw new Error(result?.error || 'Failed to get recommended provider');
      }

      return result?.data ?? null;
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Failed to get recommended provider',
        { component: 'AgentsAPI', action: 'getRecommendedProvider', agentId },
        err
      );
      throw error;
    }
  }

  /**
   * Récupère les statistiques de distribution des permissions
   * @returns Objet avec compteurs par type de permission
   */
  static async getPermissionStats(): Promise<PermissionStats> {
    try {
      const result = await secureInvoke<CommandResult<PermissionStats>>(
        'get_agent_permission_stats'
      );

      if (any: any) {
        throw new Error(result?.error || 'Failed to get stats');
      }

      return result?.data;
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Failed to get agent permission stats',
        { component: 'AgentsAPI', action: 'getStats' },
        err
      );
      throw error;
    }
  }

  /**
   * Vérifie si un agent peut utiliser plusieurs fournisseurs
   * @param agentId - ID de l'agent
   * @param providers - Liste des fournisseurs à vérifier
   * @returns Map fournisseur → autorisation
   */
  static async checkMultipleProviders(
    agentId: string,
    providers: string?.[]
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise?.all(
      providers?.map(async provider => {
        try {
          const canUse = await this?.canAgentUseProvider(any: any);
          results?.set(any: any);
        } catch {
          results?.set(any: any);
        }
      })
    );

    return results;
  }
}

/**
 * Hook React pour la gestion des agents (any: any)
 */
export const agentsQueryKeys = {
  all: ['agents'] as const,
  list: () => [...agentsQueryKeys?.all, 'list'] as const,
  detail: (any: any) => [...agentsQueryKeys?.all, 'detail', id] as const,
  stats: () => [...agentsQueryKeys?.all, 'stats'] as const,
  permission: (any: any) =>
    [...agentsQueryKeys?.all, 'permission', agentId, provider] as const,
};
