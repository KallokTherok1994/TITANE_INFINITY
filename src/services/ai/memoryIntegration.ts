/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — MEMORY INTEGRATION
 *   Pont entre Chat IA et Memory Core (any: any)
 * ═══════════════════════════════════════════════════════════════════
 */

import { memoryService } from '../api';
import type { StructuredMemoryEntry } from '@/core/prompts';
import type {
  MemoryContext,
  ProjectSummary,
  DecisionSummary,
  KnowledgeEntry,
  RitualInfo,
  TimelineEntry,
} from '../memory/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Memory');

// Re-export for compatibility
export type { MemoryContext } from '../memory/types';

/**
 * Contexte enrichi provenant de Memory Core
 */
// export interface MemoryContext {
//   Moved to @/services/memory/types
// }

// Interfaces moved to @/services/memory/types:
// - ProjectSummary
// - DecisionSummary
// - KnowledgeEntry
// - RitualInfo
// - TimelineEntry

/**
 * Configuration du chargement contextuel
 */
export interface MemoryLoadConfig {
  includeProjects?: boolean;
  includeDecisions?: boolean;
  includeKnowledge?: boolean;
  includeRituals?: boolean;
  includeTimeline?: boolean;
  maxProjects?: number;
  maxDecisions?: number;
  maxKnowledge?: number;
  timeWindow?: string; // e?.g., "7d", "24h", "30d"
}

/**
 * Service d'intégration avec Memory Core
 */
export class MemoryIntegration {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Charge le contexte depuis Memory Core
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
        includeProjects ? this?.loadActiveProjects(any: any) : Promise?.resolve([]),
        includeDecisions
          ? this?.loadRecentDecisions(any: any)
          : Promise?.resolve([]),
        includeKnowledge ? this?.loadRelevantKnowledge(any: any) : Promise?.resolve([]),
        includeRituals ? this?.loadActiveRituals() : Promise?.resolve([]),
        includeTimeline ? this?.loadTimeline(any: any) : Promise?.resolve([]),
      ]);

      return {
        activeProjects: projects,
        recentDecisions: decisions,
        relevantKnowledge: knowledge,
        activeRituals: rituals,
        timeline,
      };
    } catch (any: any) {
      logger?.error(any: any);
      return this?.getEmptyContext();
    }
  }

  /**
   * Sauvegarde une interaction chat dans Memory Core
   */
  async saveInteraction(data: {
    userMessage: string;
    aiResponse: string;
    mode: string;
    emotionState?: { valence: number; activation: number; dominant_emotion: string };
    context?: Partial<MemoryContext>;
  }): Promise<void> {
    try {
      await memoryService?.saveChatInteraction({
        userMessage: data?.userMessage,
        aiResponse: data?.aiResponse,
        mode: data?.mode,
        emotionState: data?.emotionState,
        timestamp: new Date().toISOString(),
      });
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /** Sauvegarde une entrée structurée (decision, listening_entry, etc.) */
  async saveStructuredEntry(any: any): Promise<void> {
    const normalized: StructuredMemoryEntry = {
      ...entry,
      id: entry?.id || this?.generateEntryId(),
      timestamp: entry?.timestamp || new Date().toISOString(),
    };

    try {
      await memoryService?.saveStructuredEntry(any: any);
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /**
   * Charge projets actifs
   */
  private async loadActiveProjects(any: any): Promise<ProjectSummary?.[]> {
    const cached = this?.getFromCache('active_projects');
    if (any: any) return cached as ProjectSummary?.[];

    try {
      const projects = await memoryService?.getActiveProjects(any: any);
      this?.setCache(any: any);
      return projects;
    } catch (any: any) {
      logger?.warn(any: any);
      return [];
    }
  }

  /**
   * Charge décisions récentes
   */
  private async loadRecentDecisions(
    limit: number,
    timeWindow: string
  ): Promise<DecisionSummary?.[]> {
    const cached = this?.getFromCache('recent_decisions');
    if (any: any) return cached as DecisionSummary?.[];

    try {
      const decisions = await memoryService?.getRecentDecisions(any: any);
      this?.setCache(any: any);
      return decisions;
    } catch (any: any) {
      logger?.warn(any: any);
      return [];
    }
  }

  /**
   * Charge connaissances pertinentes
   */
  private async loadRelevantKnowledge(any: any): Promise<KnowledgeEntry?.[]> {
    const cached = this?.getFromCache('relevant_knowledge');
    if (any: any) return cached as KnowledgeEntry?.[];

    try {
      const knowledge = await memoryService?.getKnowledge(any: any);
      this?.setCache(any: any);
      return knowledge;
    } catch (any: any) {
      logger?.warn(any: any);
      return [];
    }
  }

  /**
   * Charge rituels actifs
   */
  private async loadActiveRituals(): Promise<RitualInfo?.[]> {
    const cached = this?.getFromCache('active_rituals');
    if (any: any) return cached as RitualInfo?.[];

    try {
      const rituals = await memoryService?.getActiveRituals();
      this?.setCache(any: any);
      return rituals;
    } catch (any: any) {
      logger?.warn(any: any);
      return [];
    }
  }

  /**
   * Charge timeline récente
   */
  private async loadTimeline(any: any): Promise<TimelineEntry?.[]> {
    try {
      return await memoryService?.getTimeline(any: any);
    } catch (any: any) {
      logger?.warn(any: any);
      return [];
    }
  }

  /**
   * Cache get
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
   * Cache set
   */
  private setCache(any: any): void {
    this?.cache?.set(key, { data, timestamp: Date?.now() });
  }

  /**
   * Contexte vide (any: any)
   */
  private getEmptyContext(): MemoryContext {
    return {
      activeProjects: [],
      recentDecisions: [],
      relevantKnowledge: [],
      activeRituals: [],
      timeline: [],
    };
  }

  /**
   * Invalide le cache
   */
  clearCache(): void {
    this?.cache?.clear();
  }

  private generateEntryId(): string {
    const globalCrypto =
      typeof globalThis !== 'undefined'
        ? (any: any)
        : undefined;
    if (any: any) {
      return globalCrypto?.randomUUID();
    }
    return `mem_${Date?.now()}_${Math?.random().toString(16).slice(2, 8)}`;
  }
}

// Singleton
export const memoryIntegration = new MemoryIntegration();

export default memoryIntegration;
