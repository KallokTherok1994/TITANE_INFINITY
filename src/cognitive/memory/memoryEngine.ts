/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — MEMORY ENGINE (OPUS #4)
 *   Gestion de la mémoire cognitive avec recall, oubli et consolidation
 *   Fait partie du Centre d'Évolution Cognitive
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { normalizePersistentMemoryReadResponse } from '@/services/memory/persistentMemory.normalize';
import type {
  MemoryState,
  MemoryEntry,
  MemoryType,
  MemoryStats,
  RecallResult,
} from '../types';
import type {
  MemoryEntry as PersistentMemoryEntry,
  MemoryLevel as PersistentMemoryLevel,
  MemoryContentType as PersistentMemoryContentType,
} from '@/services/memory/persistentMemory.config';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const MEMORY_STORAGE_KEY = 'titane_memory_engine';
const MAX_MEMORIES = 10000;
const DECAY_RATE = 0.01; // Taux de décroissance par jour
const CONSOLIDATION_THRESHOLD = 0.7; // Seuil pour la consolidation
const RECALL_BOOST = 0.15; // Bonus de force au rappel
const DEFAULT_PERSISTENT_MODE = 'default';
const ALL_PERSISTENT_LEVELS: PersistentMemoryLevel[] = [
  'session',
  'intermediate',
  'long_term',
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mapPersistentEntryToLegacy(entry: PersistentMemoryEntry): MemoryEntry {
  const confidenceScore =
    'confidenceScore' in entry && typeof entry.confidenceScore === 'number'
      ? entry.confidenceScore
      : undefined;
  const title = 'title' in entry && typeof entry.title === 'string' ? entry.title : '';
  const sourceEntryIds =
    'sourceEntryIds' in entry && Array.isArray(entry.sourceEntryIds)
      ? entry.sourceEntryIds
      : [];

  const derivedType: MemoryType =
    entry.level === 'long_term'
      ? 'long-term'
      : entry.contentType === 'code_snippet' || entry.contentType === 'automation_result'
        ? 'procedural'
        : entry.contentType === 'knowledge' ||
            entry.contentType === 'reference' ||
            entry.contentType === 'identity' ||
            entry.contentType === 'decision' ||
            entry.contentType === 'preference'
          ? 'semantic'
          : entry.contentType === 'summary' || entry.contentType === 'message'
            ? 'episodic'
            : 'short-term';

  const confidenceStrength =
    typeof confidenceScore === 'number' ? confidenceScore / 100 : entry.importance / 5;

  return {
    id: entry.id,
    content: entry.content,
    type: derivedType,
    context:
      entry.metadata?.projectId || entry.metadata?.modeId || title || entry.topic || '',
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    importance: clamp(entry.importance ?? 3, 0, 1_000),
    strength: clamp(confidenceStrength, 0.05, 1),
    createdAt: entry.metadata?.createdAt ?? Date.now(),
    lastAccess:
      entry.metadata?.lastAccessedAt ||
      entry.metadata?.updatedAt ||
      entry.metadata?.createdAt ||
      Date.now(),
    accessCount: entry.metadata?.accessCount ?? 0,
    consolidated: entry.level !== 'session',
    associations: sourceEntryIds,
  };
}

function mapLegacyTypeFilters(type?: MemoryType | string): {
  levels?: PersistentMemoryLevel[];
  contentTypes?: PersistentMemoryContentType[];
} {
  switch (type) {
    case 'short-term':
      return { levels: ['session'] };
    case 'long-term':
      return { levels: ['long_term'] };
    case 'episodic':
    case 'interaction':
      return { contentTypes: ['message', 'summary'] };
    case 'semantic':
      return {
        contentTypes: ['knowledge', 'reference', 'identity', 'decision', 'preference'],
      };
    case 'procedural':
      return { contentTypes: ['project_context', 'code_snippet', 'automation_result'] };
    case 'code':
      return { contentTypes: ['code_snippet', 'project_context', 'reference'] };
    default:
      return {};
  }
}

function mapLegacyTypeToPersistentWrite(type: MemoryType): {
  level: PersistentMemoryLevel;
  contentType: PersistentMemoryContentType;
} {
  switch (type) {
    case 'long-term':
      return { level: 'long_term', contentType: 'knowledge' };
    case 'procedural':
      return { level: 'intermediate', contentType: 'code_snippet' };
    case 'semantic':
      return { level: 'intermediate', contentType: 'reference' };
    case 'episodic':
      return { level: 'session', contentType: 'summary' };
    case 'short-term':
    default:
      return { level: 'session', contentType: 'message' };
  }
}

// ─────────────────────────────────────────────────────────────────
// Memory Engine Class
// ─────────────────────────────────────────────────────────────────

class MemoryEngineClass {
  private state: MemoryState;
  private initialized: boolean = false;

  constructor() {
    this.state = this.getDefaultState();
  }

  // ─────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────

  private getDefaultState(): MemoryState {
    return {
      memories: [],
      stats: {
        totalMemories: 0,
        shortTermCount: 0,
        longTermCount: 0,
        episodicCount: 0,
        semanticCount: 0,
        proceduralCount: 0,
        averageStrength: 0,
        oldestMemory: null,
        newestMemory: null,
        totalRecalls: 0,
        consolidationRate: 0,
      },
      lastConsolidation: Date.now(),
      decayEnabled: true,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.refreshFromPersistentMemory(MAX_MEMORIES);
      this.state.lastConsolidation = Date.now();
      this.initialized = true;

      console.log(
        '[MemoryEngine] Initialized from persistent memory with',
        this.state.stats.totalMemories,
        'memories'
      );
    } catch (error) {
      console.warn('[MemoryEngine] Init error, using defaults:', error);
      this.state = this.getDefaultState();
      this.initialized = true;
    }
  }

  private async refreshFromPersistentMemory(limit = MAX_MEMORIES): Promise<void> {
    const response = normalizePersistentMemoryReadResponse(
      await secureInvoke('persistent_memory_read', {
        levels: ALL_PERSISTENT_LEVELS,
        currentMode: DEFAULT_PERSISTENT_MODE,
        limit,
        includeSummaries: false,
      })
    );

    this.state.memories = response.entries.map(mapPersistentEntryToLegacy);
    this.state.decayEnabled = false;
    this.updateStats();
  }

  // ─────────────────────────────────────────────────────────────────
  // Memory Operations
  // ─────────────────────────────────────────────────────────────────

  /**
   * Stocker un nouveau souvenir
   */
  async store(
    content: string,
    type: MemoryType,
    context?: string,
    tags?: string[],
    importance?: number
  ): Promise<MemoryEntry> {
    await this.ensureInitialized();

    const now = Date.now();
    const { level, contentType } = mapLegacyTypeToPersistentWrite(type);
    const entryId = await secureInvoke<string>('persistent_memory_write_entry', {
      level,
      contentType,
      content,
      topic:
        typeof context === 'string' && context.toLowerCase().includes('project')
          ? 'project'
          : 'general',
      importance: clamp(Math.round((importance ?? 0.5) * 5), 1, 5),
      source: 'manual_save',
      tags: tags || [],
      title: content.slice(0, 80),
      modeId: DEFAULT_PERSISTENT_MODE,
    });

    await this.refreshFromPersistentMemory(MAX_MEMORIES);

    const memory =
      this.state.memories.find(candidate => candidate.id === entryId) ||
      ({
        id: typeof entryId === 'string' && entryId.length > 0 ? entryId : `mem_${now}`,
        content,
        type,
        context: context || '',
        tags: tags || [],
        importance: importance ?? 0.5,
        strength: 1.0,
        createdAt: now,
        lastAccess: now,
        accessCount: 0,
        consolidated: level !== 'session',
        associations: [],
      } as MemoryEntry);

    console.log(
      `[MemoryEngine] Stored memory in persistent layer: ${memory.id} (${type})`
    );
    return memory;
  }

  /**
   * Rappeler des souvenirs par requête
   */
  async recall(
    query: string,
    options?: {
      type?: MemoryType;
      minStrength?: number;
      limit?: number;
      tags?: string[];
    }
  ): Promise<RecallResult[]> {
    await this.ensureInitialized();

    const { type, minStrength = 0.1, limit = 10, tags } = options || {};
    const { levels, contentTypes } = mapLegacyTypeFilters(type);
    const response = normalizePersistentMemoryReadResponse(
      await secureInvoke('persistent_memory_read', {
        levels: levels ?? ALL_PERSISTENT_LEVELS,
        contentTypes,
        currentMode: DEFAULT_PERSISTENT_MODE,
        query: query.trim().length > 0 ? query : undefined,
        tags,
        limit,
        includeSummaries: false,
      })
    );

    const results = response.entries
      .map(entry => {
        const memory = mapPersistentEntryToLegacy(entry);
        const relevance = clamp(
          response.relevanceScores?.[entry.id] ?? memory.importance / 5,
          0,
          1
        );

        return {
          memory,
          relevance,
          confidence: clamp(memory.strength * relevance, 0, 1),
        };
      })
      .filter(result => result.memory.strength >= minStrength)
      .slice(0, limit);

    this.state.stats.totalRecalls++;
    return results;
  }

  /**
   * Accéder à un souvenir (booste sa force)
   */
  async accessMemory(memoryId: string): Promise<MemoryEntry | null> {
    await this.ensureInitialized();

    const memory = this.state.memories.find(m => m.id === memoryId);
    if (!memory) return null;

    memory.lastAccess = Date.now();
    memory.accessCount++;
    memory.strength = Math.min(1.0, memory.strength + RECALL_BOOST);

    return memory;
  }

  /**
   * Créer une association entre deux souvenirs
   */
  async associate(
    memoryId1: string,
    memoryId2: string,
    _strength: number = 0.5
  ): Promise<boolean> {
    await this.ensureInitialized();

    const memory1 = this.state.memories.find(m => m.id === memoryId1);
    const memory2 = this.state.memories.find(m => m.id === memoryId2);

    if (!memory1 || !memory2) return false;

    // Ajouter l'association bidirectionnelle
    if (!memory1.associations.includes(memoryId2)) {
      memory1.associations.push(memoryId2);
    }
    if (!memory2.associations.includes(memoryId1)) {
      memory2.associations.push(memoryId1);
    }

    await this.persist();
    return true;
  }

  /**
   * Oublier un souvenir spécifique
   */
  async forget(memoryId: string): Promise<boolean> {
    await this.ensureInitialized();
    const index = this.state.memories.findIndex(m => m.id === memoryId);
    if (index === -1) return false;

    await secureInvoke('persistent_memory_delete_entry', { entryId: memoryId });
    await this.refreshFromPersistentMemory(MAX_MEMORIES);
    return true;
  }

  // ─────────────────────────────────────────────────────────────────
  // Memory Consolidation & Decay
  // ─────────────────────────────────────────────────────────────────

  /**
   * Consolider les souvenirs (short-term → long-term)
   */
  async consolidate(): Promise<number> {
    await this.ensureInitialized();

    let consolidated = 0;

    for (const memory of this.state.memories) {
      if (memory.consolidated) continue;

      // Critères de consolidation:
      // - Haute importance
      // - Accès fréquents
      // - Force suffisante
      const score =
        memory.importance * 0.4 +
        Math.min(memory.accessCount / 10, 1) * 0.3 +
        memory.strength * 0.3;

      if (score >= CONSOLIDATION_THRESHOLD) {
        memory.consolidated = true;
        memory.type = memory.type === 'short-term' ? 'long-term' : memory.type;
        consolidated++;
      }
    }

    this.state.lastConsolidation = Date.now();
    this.state.stats.consolidationRate =
      consolidated / Math.max(this.state.memories.length, 1);

    this.updateStats();
    await this.persist();

    console.log(`[MemoryEngine] Consolidated ${consolidated} memories`);
    return consolidated;
  }

  /**
   * Appliquer le decay (oubli naturel)
   */
  private applyDecay(): void {
    const now = Date.now();
    const daysSinceConsolidation =
      (now - this.state.lastConsolidation) / (1000 * 60 * 60 * 24);

    for (const memory of this.state.memories) {
      // Les souvenirs consolidés décroissent moins vite
      const decayMultiplier = memory.consolidated ? 0.3 : 1.0;
      const daysSinceAccess = (now - memory.lastAccess) / (1000 * 60 * 60 * 24);

      // Décroissance exponentielle
      const decay = DECAY_RATE * decayMultiplier * daysSinceAccess;
      memory.strength = Math.max(0.01, memory.strength - decay);
    }

    console.log(
      `[MemoryEngine] Applied decay over ${daysSinceConsolidation.toFixed(1)} days`
    );
  }

  /**
   * Supprimer les souvenirs trop faibles
   */
  private pruneWeakMemories(): void {
    const threshold = 0.05;
    const before = this.state.memories.length;

    this.state.memories = this.state.memories
      .filter(m => m.strength > threshold || m.consolidated || m.importance > 0.8)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, MAX_MEMORIES);

    const pruned = before - this.state.memories.length;
    if (pruned > 0) {
      console.log(`[MemoryEngine] Pruned ${pruned} weak memories`);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Stats & Getters
  // ─────────────────────────────────────────────────────────────────

  private updateStats(): void {
    const memories = this.state.memories;

    this.state.stats = {
      totalMemories: memories.length,
      shortTermCount: memories.filter(m => m.type === 'short-term').length,
      longTermCount: memories.filter(m => m.type === 'long-term').length,
      episodicCount: memories.filter(m => m.type === 'episodic').length,
      semanticCount: memories.filter(m => m.type === 'semantic').length,
      proceduralCount: memories.filter(m => m.type === 'procedural').length,
      averageStrength:
        memories.length > 0
          ? memories.reduce((sum, m) => sum + m.strength, 0) / memories.length
          : 0,
      oldestMemory:
        memories.length > 0 ? Math.min(...memories.map(m => m.createdAt)) : null,
      newestMemory:
        memories.length > 0 ? Math.max(...memories.map(m => m.createdAt)) : null,
      totalRecalls: this.state.stats.totalRecalls,
      consolidationRate: this.state.stats.consolidationRate,
    };
  }

  getState(): MemoryState {
    return { ...this.state };
  }

  getStats(): MemoryStats {
    return { ...this.state.stats };
  }

  getMemoryById(id: string): MemoryEntry | undefined {
    return this.state.memories.find(m => m.id === id);
  }

  getRecentMemories(count: number = 10): MemoryEntry[] {
    return [...this.state.memories]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count);
  }

  getStrongestMemories(count: number = 10): MemoryEntry[] {
    return [...this.state.memories]
      .sort((a, b) => b.strength - a.strength)
      .slice(0, count);
  }

  // ─────────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────────

  private async persist(): Promise<void> {
    try {
      await secureInvoke('memory_save_entry', {
        key: MEMORY_STORAGE_KEY,
        value: JSON.stringify(this.state),
      });
    } catch (error) {
      console.warn('[MemoryEngine] Persist error:', error);
      // Fallback localStorage
      try {
        localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Ignore
      }
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Export & Import
  // ─────────────────────────────────────────────────────────────────

  async exportMemories(): Promise<string> {
    await this.ensureInitialized();
    return JSON.stringify(this.state, null, 2);
  }

  async importMemories(jsonData: string, merge: boolean = true): Promise<number> {
    await this.ensureInitialized();

    try {
      const imported: MemoryState = JSON.parse(jsonData);

      if (merge) {
        // Fusionner avec les souvenirs existants
        const existingIds = new Set(this.state.memories.map(m => m.id));
        const newMemories = imported.memories.filter(m => !existingIds.has(m.id));
        this.state.memories.push(...newMemories);
        this.updateStats();
        await this.persist();
        return newMemories.length;
      } else {
        // Remplacer complètement
        this.state = imported;
        this.updateStats();
        await this.persist();
        return imported.memories.length;
      }
    } catch (error) {
      console.error('[MemoryEngine] Import error:', error);
      return 0;
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────────

export const MemoryEngine = new MemoryEngineClass();
export default MemoryEngine;
