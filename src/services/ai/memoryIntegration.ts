/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v17.3.0 — MEMORY INTEGRATION
 *   Pont entre Chat IA et Memory Core (court/moyen/long terme)
 * ═══════════════════════════════════════════════════════════════════
 */

import { memoryService } from '../api';

/**
 * Contexte enrichi provenant de Memory Core
 */
export interface MemoryContext {
  activeProjects: ProjectSummary[];
  recentDecisions: DecisionSummary[];
  relevantKnowledge: KnowledgeEntry[];
  activeRituals: RitualInfo[];
  timeline: TimelineEntry[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  priority: number;
  lastActivity: string;
  tags: string[];
}

export interface DecisionSummary {
  id: string;
  title: string;
  context: string;
  outcome: string;
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
}

export interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  source: string;
  relevance: number;
  timestamp: string;
}

export interface RitualInfo {
  id: string;
  name: string;
  frequency: string;
  lastExecution: string;
  nextScheduled?: string;
  impact: string;
}

export interface TimelineEntry {
  timestamp: string;
  type: 'chat' | 'decision' | 'project' | 'ritual' | 'emotion';
  content: string;
  metadata?: Record<string, unknown>;
}

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
  timeWindow?: string; // e.g., "7d", "24h", "30d"
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
      const [projects, decisions, knowledge, rituals, timeline] = await Promise.all([
        includeProjects ? this.loadActiveProjects(maxProjects) : Promise.resolve([]),
        includeDecisions ? this.loadRecentDecisions(maxDecisions, timeWindow) : Promise.resolve([]),
        includeKnowledge ? this.loadRelevantKnowledge(maxKnowledge) : Promise.resolve([]),
        includeRituals ? this.loadActiveRituals() : Promise.resolve([]),
        includeTimeline ? this.loadTimeline(timeWindow) : Promise.resolve([]),
      ]);

      return {
        activeProjects: projects,
        recentDecisions: decisions,
        relevantKnowledge: knowledge,
        activeRituals: rituals,
        timeline,
      };
    } catch (error) {
      console.error('[MemoryIntegration] Erreur chargement contexte:', error);
      return this.getEmptyContext();
    }
  }

  /**
   * Sauvegarde une interaction chat dans Memory Core
   */
  async saveInteraction(data: {
    userMessage: string;
    aiResponse: string;
    mode: string;
    emotionState?: { valence: number; intensity: number; energy: number };
    context?: Partial<MemoryContext>;
  }): Promise<void> {
    try {
      await memoryService.saveChatInteraction({
        userMessage: data.userMessage,
        aiResponse: data.aiResponse,
        mode: data.mode,
        emotionState: data.emotionState,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[MemoryIntegration] Erreur sauvegarde interaction:', error);
    }
  }

  /**
   * Charge projets actifs
   */
  private async loadActiveProjects(limit: number): Promise<ProjectSummary[]> {
    const cached = this.getFromCache('active_projects');
    if (cached) return cached as ProjectSummary[];

    try {
      const projects = await memoryService.getActiveProjects(limit);
      this.setCache('active_projects', projects);
      return projects;
    } catch (error) {
      console.warn('[MemoryIntegration] Projets non disponibles:', error);
      return [];
    }
  }

  /**
   * Charge décisions récentes
   */
  private async loadRecentDecisions(limit: number, timeWindow: string): Promise<DecisionSummary[]> {
    const cached = this.getFromCache('recent_decisions');
    if (cached) return cached as DecisionSummary[];

    try {
      const decisions = await memoryService.getRecentDecisions(limit, timeWindow);
      this.setCache('recent_decisions', decisions);
      return decisions;
    } catch (error) {
      console.warn('[MemoryIntegration] Décisions non disponibles:', error);
      return [];
    }
  }

  /**
   * Charge connaissances pertinentes
   */
  private async loadRelevantKnowledge(limit: number): Promise<KnowledgeEntry[]> {
    const cached = this.getFromCache('relevant_knowledge');
    if (cached) return cached as KnowledgeEntry[];

    try {
      const knowledge = await memoryService.getKnowledge(limit);
      this.setCache('relevant_knowledge', knowledge);
      return knowledge;
    } catch (error) {
      console.warn('[MemoryIntegration] Connaissances non disponibles:', error);
      return [];
    }
  }

  /**
   * Charge rituels actifs
   */
  private async loadActiveRituals(): Promise<RitualInfo[]> {
    const cached = this.getFromCache('active_rituals');
    if (cached) return cached as RitualInfo[];

    try {
      const rituals = await memoryService.getActiveRituals();
      this.setCache('active_rituals', rituals);
      return rituals;
    } catch (error) {
      console.warn('[MemoryIntegration] Rituels non disponibles:', error);
      return [];
    }
  }

  /**
   * Charge timeline récente
   */
  private async loadTimeline(timeWindow: string): Promise<TimelineEntry[]> {
    try {
      return await memoryService.getTimeline(timeWindow);
    } catch (error) {
      console.warn('[MemoryIntegration] Timeline non disponible:', error);
      return [];
    }
  }

  /**
   * Cache get
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
   * Cache set
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Contexte vide (fallback)
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
    this.cache.clear();
  }
}

// Singleton
export const memoryIntegration = new MemoryIntegration();

export default memoryIntegration;
