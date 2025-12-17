/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — MULTI-AGENTS API SERVICE
 * Service TypeScript pour interagir avec le backend Multi-Agents
 * ═══════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import { logger } from '@/lib/logger';
import type {
  AgentConfig,
  CreateAgentRequest,
  UpdatePermissionRequest,
  PermissionStats,
  CommandResult,
} from './agents.types';

/**
 * Service API pour la gestion des agents
 */
export class AgentsAPIService {
  /**
   * Liste tous les agents enregistrés
   * @returns Liste des agents triés par priorité
   */
  static async listAgents(): Promise<AgentConfig[]> {
    try {
      const result = await invoke<CommandResult<AgentConfig[]>>('list_agents');

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to list agents');
      }

      return result.data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
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
  static async getAgent(agentId: string): Promise<AgentConfig> {
    try {
      const result = await invoke<CommandResult<AgentConfig>>('get_agent', {
        agentId,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get agent');
      }

      return result.data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
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
  static async createAgent(request: CreateAgentRequest): Promise<AgentConfig> {
    try {
      const result = await invoke<CommandResult<AgentConfig>>('create_agent', {
        request,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create agent');
      }

      console.log(
        `✅ [AgentsAPI] Agent created: ${result.data?.name} (${result.data?.id})`
      );
      return result.data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
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
  static async updateAgentPermission(request: UpdatePermissionRequest): Promise<string> {
    try {
      const result = await invoke<CommandResult<string>>('update_agent_permission', {
        request,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update permission');
      }

      console.log(`✅ [AgentsAPI] Permission updated: ${result.data}`);
      return result.data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
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
   * @param provider - Nom du fournisseur (openai, claude, gemini, local)
   * @returns true si autorisé, false sinon
   */
  static async canAgentUseProvider(agentId: string, provider: string): Promise<boolean> {
    try {
      const result = await invoke<CommandResult<boolean>>('can_agent_use_provider', {
        agentId,
        provider,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to check permission');
      }

      return result.data ?? false;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
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
   * @returns Nom du fournisseur recommandé (ou null si aucun)
   */
  static async getAgentRecommendedProvider(agentId: string): Promise<string | null> {
    try {
      const result = await invoke<CommandResult<string | null>>(
        'get_agent_recommended_provider',
        { agentId }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to get recommended provider');
      }

      return result.data ?? null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
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
      const result = await invoke<CommandResult<PermissionStats>>(
        'get_agent_permission_stats'
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get stats');
      }

      return result.data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
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
    providers: string[]
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise.all(
      providers.map(async provider => {
        try {
          const canUse = await this.canAgentUseProvider(agentId, provider);
          results.set(provider, canUse);
        } catch {
          results.set(provider, false);
        }
      })
    );

    return results;
  }
}

/**
 * Hook React pour la gestion des agents (compatible avec React Query)
 */
export const agentsQueryKeys = {
  all: ['agents'] as const,
  list: () => [...agentsQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...agentsQueryKeys.all, 'detail', id] as const,
  stats: () => [...agentsQueryKeys.all, 'stats'] as const,
  permission: (agentId: string, provider: string) =>
    [...agentsQueryKeys.all, 'permission', agentId, provider] as const,
};
