/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — MEMORY SERVICE (UNIFIED)
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
export class MemoryService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Récupère projets actifs
   */
  async getActiveProjects(limit: number = 5): Promise<ProjectSummary[]> {
    const cached = this.getFromCache('active_projects');
    if (cached) return cached as ProjectSummary[];

    const projects = await invokeWithRetry<ProjectSummary[]>(
      'memory_get_active_projects',
      { limit },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    this.setCache('active_projects', projects);
    return projects;
  }

  /**
   * Récupère décisions récentes
   */
  async getRecentDecisions(
    limit: number = 10,
    timeWindow: string = '7d'
  ): Promise<DecisionSummary[]> {
    const cacheKey = `recent_decisions_${timeWindow}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as DecisionSummary[];

    const decisions = await invokeWithRetry<DecisionSummary[]>(
      'memory_get_recent_decisions',
      { limit, time_window: timeWindow },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    this.setCache(cacheKey, decisions);
    return decisions;
  }

  /**
   * Récupère connaissances pertinentes
   */
  async getKnowledge(limit: number = 20): Promise<KnowledgeEntry[]> {
    const cached = this.getFromCache('knowledge');
    if (cached) return cached as KnowledgeEntry[];

    const knowledge = await invokeWithRetry<KnowledgeEntry[]>(
      'memory_get_knowledge',
      { limit },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    this.setCache('knowledge', knowledge);
    return knowledge;
  }

  /**
   * Récupère rituels actifs
   */
  async getActiveRituals(): Promise<RitualInfo[]> {
    const cached = this.getFromCache('active_rituals');
    if (cached) return cached as RitualInfo[];

    const rituals = await invokeWithRetry<RitualInfo[]>(
      'memory_get_active_rituals',
      {},
      { ...FAST_COMMAND_OPTIONS, context: 'Memory' }
    );

    this.setCache('active_rituals', rituals);
    return rituals;
  }

  /**
   * Récupère timeline récente
   */
  async getTimeline(timeWindow: string = '7d'): Promise<TimelineEntry[]> {
    const timeline = await invokeWithRetry<TimelineEntry[]>(
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
      const [projects, decisions, knowledge, rituals, timeline] = await Promise.all([
        includeProjects ? this.getActiveProjects(maxProjects) : Promise.resolve([]),
        includeDecisions ? this.getRecentDecisions(maxDecisions, timeWindow) : Promise.resolve([]),
        includeKnowledge ? this.getKnowledge(maxKnowledge) : Promise.resolve([]),
        includeRituals ? this.getActiveRituals() : Promise.resolve([]),
        includeTimeline ? this.getTimeline(timeWindow) : Promise.resolve([]),
      ]);

      return {
        activeProjects: projects,
        recentDecisions: decisions,
        relevantKnowledge: knowledge,
        activeRituals: rituals,
        timeline,
      };
    } catch (error) {
      console.error('[MemoryService] Erreur chargement contexte:', error);
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
  async saveChatInteraction(interaction: ChatInteraction): Promise<void> {
    await invokeWithRetry<void>(
      'memory_save_chat_interaction',
      { interaction },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    // Invalider cache après sauvegarde
    this.clearCache();
  }

  /**
   * Sauvegarde une entrée structurée (medium/long terme)
   */
  async saveStructuredEntry(entry: StructuredMemoryEntry | string): Promise<void> {
    const serialized = typeof entry === 'string' ? entry : JSON.stringify(entry);

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
    this.cache.clear();
  }

  /**
   * Récupère depuis le cache
   */
  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Enregistre dans le cache
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// Singleton
export const memoryService = new MemoryService();

export default memoryService;
