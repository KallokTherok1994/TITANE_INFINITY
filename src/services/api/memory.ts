/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — MEMORY SERVICE (UNIFIED)
 *   Service centralisé pour toutes interactions Memory Core
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';
import { getAllEntries as getBundledKbEntries } from '@/services/api/defaultKnowledgeBase';
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

function mapStructuredTargetToLevel(target: StructuredMemoryEntry['target']) {
  switch (target) {
    case 'short':
      return 'session';
    case 'medium':
      return 'intermediate';
    case 'long':
      return 'long_term';
  }
}

function mapStructuredTemplate(templateId: StructuredMemoryEntry['templateId']) {
  switch (templateId) {
    case 'decision':
      return { contentType: 'decision', topic: 'decisions', importance: 5 };
    case 'project_snapshot':
      return { contentType: 'project_context', topic: 'project', importance: 4 };
    case 'season_summary':
      return { contentType: 'identity', topic: 'personal', importance: 5 };
    case 'rhythm_report':
      return { contentType: 'summary', topic: 'personal', importance: 3 };
    case 'listening_entry':
    default:
      return { contentType: 'summary', topic: 'personal', importance: 3 };
  }
}

function deriveStructuredTitle(entry: StructuredMemoryEntry): string {
  const data = entry.data ?? {};
  const titleCandidate =
    typeof data.title === 'string'
      ? data.title
      : typeof data.project === 'string'
        ? data.project
        : typeof data.season === 'string'
          ? data.season
          : typeof data.week === 'string'
            ? data.week
            : typeof data.timestamp === 'string'
              ? data.timestamp
              : entry.templateId;

  return String(titleCandidate).slice(0, 120);
}

function deriveChatInteractionTitle(interaction: ChatInteraction): string {
  const userMessage = interaction.userMessage?.trim();
  if (userMessage && userMessage.length > 0) {
    return userMessage.slice(0, 120);
  }
  return 'interaction-chat';
}

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
  async getActiveProjects(limit: number = 5): Promise<ProjectSummary[]> {
    if (!isTauriRuntimeAvailable()) return [];
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
    if (!isTauriRuntimeAvailable()) return [];
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
   * Phase 3: When Tauri is unavailable, falls back to bundled KB entries
   * so TITANE has knowledge access on all platforms (web, dev, Android).
   */
  async getKnowledge(limit: number = 20): Promise<KnowledgeEntry[]> {
    if (!isTauriRuntimeAvailable()) {
      // Fallback: map bundled static KB entries to KnowledgeEntry format
      try {
        const bundled = await getBundledKbEntries();
        return bundled.slice(0, limit).map(entry => ({
          id: entry.id,
          title: entry.description || entry.category,
          category: entry.category,
          content: JSON.stringify(entry.content).substring(0, 500),
          relevance: 0.8,
          lastAccessed: new Date().toISOString(),
          tags: [entry.category],
          source: 'bundled_kb',
        }));
      } catch {
        return [];
      }
    }
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
    if (!isTauriRuntimeAvailable()) return [];
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
    if (!isTauriRuntimeAvailable()) return [];
    const timeline = await invokeWithRetry<TimelineEntry[]>(
      'memory_get_timeline',
      { time_window: timeWindow },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    return timeline;
  }

  /**
   * Charge contexte complet pour chat
   * Phase 3 fix: When Tauri unavailable, do NOT return early — delegate to
   * each sub-method which has its own guard + bundled fallback (getKnowledge).
   * This ensures relevantKnowledge is populated from bundled KB in all contexts.
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
        includeDecisions
          ? this.getRecentDecisions(maxDecisions, timeWindow)
          : Promise.resolve([]),
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
   * Phase 2B: Guard — when Tauri is unavailable (web/dev), skip IPC silently.
   * Conversation history is already persisted by chatMemoryCompactor (localStorage)
   * and by useChat P0 PATCH (SQLite). No data loss, no IPC error noise.
   */
  async saveChatInteraction(interaction: ChatInteraction): Promise<void> {
    if (!isTauriRuntimeAvailable()) return;
    const tags = Array.from(
      new Set(
        [
          'chat-interaction',
          interaction.mode,
          interaction.emotionState?.dominant_emotion,
        ].filter(
          (value): value is string => typeof value === 'string' && value.length > 0
        )
      )
    );

    const content = [
      `Utilisateur: ${interaction.userMessage}`,
      `Assistant: ${interaction.aiResponse}`,
      `Mode: ${interaction.mode}`,
      interaction.emotionState?.dominant_emotion
        ? `Emotion dominante: ${interaction.emotionState.dominant_emotion}`
        : null,
      `Timestamp: ${interaction.timestamp}`,
    ]
      .filter((line): line is string => typeof line === 'string' && line.length > 0)
      .join('\n');

    // P1-FIX 2026-04-30: interactions chat sauvegardées en long_term (permanent)
    // Raison: level:'session' = 24h max + 100 entrées = perte garantie de mémoire.
    // long_term = permanent chiffré sur disque, survit aux réinstallations.
    await invokeWithRetry<void>(
      'persistent_memory_write_entry',
      {
        level: 'long_term',
        contentType: 'message',
        content,
        topic: 'general',
        importance: 4,
        title: deriveChatInteractionTitle(interaction),
        tags: [...tags, 'chat-permanent'],
        projectId:
          typeof interaction.metadata?.projectId === 'string'
            ? interaction.metadata.projectId
            : undefined,
        modeId: interaction.mode,
      },
      { ...STANDARD_COMMAND_OPTIONS, context: 'Memory' }
    );

    // Invalider cache après sauvegarde
    this.clearCache();
  }

  /**
   * Sauvegarde une entrée structurée (medium/long terme)
   * Guard: skip when Tauri unavailable — no IPC in web/dev mode.
   */
  async saveStructuredEntry(entry: StructuredMemoryEntry | string): Promise<void> {
    if (!isTauriRuntimeAvailable()) return;
    const normalized: StructuredMemoryEntry =
      typeof entry === 'string'
        ? {
            templateId: 'season_summary',
            target: 'medium',
            data: { raw: entry },
            tags: ['structured-memory'],
            source: 'memory-service',
          }
        : entry;

    const template = mapStructuredTemplate(normalized.templateId);
    const payload = {
      level: mapStructuredTargetToLevel(normalized.target),
      contentType: template.contentType,
      content: JSON.stringify({
        templateId: normalized.templateId,
        timestamp: normalized.timestamp,
        data: normalized.data,
      }),
      topic: template.topic,
      importance: template.importance,
      source: 'manual_save',
      tags: Array.from(
        new Set([
          normalized.templateId,
          normalized.target,
          ...(Array.isArray(normalized.tags) ? normalized.tags : []),
        ])
      ),
      title: deriveStructuredTitle(normalized),
    };

    await invokeWithRetry<void>('persistent_memory_write_entry', payload, {
      ...STANDARD_COMMAND_OPTIONS,
      context: 'Memory',
    });

    this.clearCache();
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
   * ✨ v24.2.1: Evict oldest entries when cache exceeds limit
   */
  private setCache(key: string, data: unknown): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(key)) {
      // Find and delete oldest entry
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// Singleton
export const memoryService = new MemoryService();

export default memoryService;
