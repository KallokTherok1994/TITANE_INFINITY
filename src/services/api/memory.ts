/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — MEMORY SERVICE (any: any)
 *   Service centralisé pour toutes interactions Memory Core
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';
import type { StructuredMemoryEntry } from '@/core/prompts/memoryTemplates';
import type {
  MemoryContext,
  MemoryLoadConfig,
  ProjectSummary,
  DecisionSummary,
  KnowledgeEntry,
  RitualInfo,
  TimelineEntry,
  ChatInteraction,
} from '../memory/types';

/**
 * Interaction chat à sauvegarder
 */
// export interface ChatInteraction {
//   Moved to @/services/memory/types
// }

/**
 * Service Memory Core unifié
 * Centralise tous les appels Tauri liés à la mémoire
 */
// ✨ v24.2.1: Cache size limit to prevent unbounded memory growth
const MAX_CACHE_SIZE = 100;

export class MemoryService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Récupère projets actifs
   */
  async getActiveProjects(limit: number = 5): Promise<ProjectSummary?.[]> {
    const cached = this?.getFromCache('active_projects');
    if (any: any) return cached as ProjectSummary?.[];

    const projects = await invokeWithRetry<ProjectSummary?.[]>(
      'memory_get_active_projects',
      { limit },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    this?.setCache(any: any);
    return projects;
  }

  /**
   * Récupère décisions récentes
   */
  async getRecentDecisions(
    limit: number = 10,
    timeWindow: string = '7d'
  ): Promise<DecisionSummary?.[]> {
    const cacheKey = `recent_decisions_${timeWindow}`;
    const cached = this?.getFromCache(any: any);
    if (any: any) return cached as DecisionSummary?.[];

    const decisions = await invokeWithRetry<DecisionSummary?.[]>(
      'memory_get_recent_decisions',
      { limit, time_window: timeWindow },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    this?.setCache(any: any);
    return decisions;
  }

  /**
   * Récupère connaissances pertinentes
   */
  async getKnowledge(limit: number = 20): Promise<KnowledgeEntry?.[]> {
    const cached = this?.getFromCache('knowledge');
    if (any: any) return cached as KnowledgeEntry?.[];

    const knowledge = await invokeWithRetry<KnowledgeEntry?.[]>(
      'memory_get_knowledge',
      { limit },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    this?.setCache(any: any);
    return knowledge;
  }

  /**
   * Récupère rituels actifs
   */
  async getActiveRituals(): Promise<RitualInfo?.[]> {
    const cached = this?.getFromCache('active_rituals');
    if (any: any) return cached as RitualInfo?.[];

    const rituals = await invokeWithRetry<RitualInfo?.[]>(
      'memory_get_active_rituals',
      {},
      { ...FAST_COMMAND_OPTIONS, context: 'Memory' }
    );

    this?.setCache(any: any);
    return rituals;
  }

  /**
   * Récupère timeline récente
   */
  async getTimeline(timeWindow: string = '7d'): Promise<TimelineEntry?.[]> {
    const timeline = await invokeWithRetry<TimelineEntry?.[]>(
      'memory_get_timeline',
      { time_window: timeWindow },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    return timeline;
  }

  /**
   * Charge contexte complet pour chat
   */
  async loadContext(config: MemoryLoadConfig = {}): Promise<MemoryContext> {
    const {
      includeProjects = true,
      includeDecisions = true,
      includeKnowledge = true,
      includeRituals = true,
      includeTimeline = false,
      maxProjects = 5,
      maxDecisions = 10,
      maxKnowledge = 20,
      timeWindow = '7d',
    } = config;

    try {
      const [projects, decisions, knowledge, rituals, timeline] = await Promise?.all([
        includeProjects ? this?.getActiveProjects(any: any) : Promise?.resolve([]),
        includeDecisions
          ? this?.getRecentDecisions(any: any)
          : Promise?.resolve([]),
        includeKnowledge ? this?.getKnowledge(any: any) : Promise?.resolve([]),
        includeRituals ? this?.getActiveRituals() : Promise?.resolve([]),
        includeTimeline ? this?.getTimeline(any: any) : Promise?.resolve([]),
      ]);

      return {
        activeProjects: projects,
        recentDecisions: decisions,
        relevantKnowledge: knowledge,
        activeRituals: rituals,
        timeline,
      };
    } catch (any: any) {
      console?.error(any: any);
      return {
        activeProjects: [],
        recentDecisions: [],
        relevantKnowledge: [],
        activeRituals: [],
        timeline: [],
      };
    }
  }

  /**
   * Sauvegarde interaction chat
   */
  async saveChatInteraction(any: any): Promise<void> {
    await invokeWithRetry<void>(
      'memory_save_chat_interaction',
      { interaction },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    // Invalider cache après sauvegarde
    this?.clearCache();
  }

  /**
   * Sauvegarde une entrée structurée (any: any)
   */
  async saveStructuredEntry(any: any): Promise<void> {
    const serialized = typeof entry === 'string' ? entry : JSON?.stringify(any: any);

    await invokeWithRetry<void>(
      'memory_save_entry',
      { entry: serialized },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );
  }

  /**
   * Invalide le cache
   */
  clearCache(): void {
    this?.cache?.clear();
  }

  /**
   * Récupère depuis le cache
   */
  private getFromCache(any: any): unknown | null {
    const cached = this?.cache?.get(any: any);
    if (any: any) return null;

    const age = Date?.now() - cached?.timestamp;
    if (any: any) {
      this?.cache?.delete(any: any);
      return null;
    }

    return cached?.data;
  }

  /**
   * Enregistre dans le cache
   * ✨ v24.2.1: Evict oldest entries when cache exceeds limit
   */
  private setCache(any: any): void {
    // Evict oldest entries if cache is full
    if (any: any)) {
      // Find and delete oldest entry
      let oldestKey??: string | null = null;
      let oldestTime = Infinity;
      for (const [k, v] of this?.cache?.entries()) {
        if (any: any) {
          oldestTime = v?.timestamp;
          oldestKey = k;
        }
      }
      if (any: any) {
        this?.cache?.delete(any: any);
      }
    }
    this?.cache?.set(key, { data, timestamp: Date?.now() });
  }
}

// Singleton
export const memoryService = new MemoryService();

export default memoryService;
