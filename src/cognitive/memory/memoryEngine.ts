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
import type {
  MemoryState,
  MemoryEntry,
  MemoryType,
  MemoryStats,
  RecallResult,
} from '../types';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const MEMORY_STORAGE_KEY = 'titane_memory_engine';
const MAX_MEMORIES = 10000;
const DECAY_RATE = 0.01; // Taux de décroissance par jour
const CONSOLIDATION_THRESHOLD = 0.7; // Seuil pour la consolidation
const RECALL_BOOST = 0.15; // Bonus de force au rappel

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
      // Charger depuis le backend
      const savedState = await secureInvoke<string | null>('memory_get_entry', {
        key: MEMORY_STORAGE_KEY,
      });

      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.state = { ...this.getDefaultState(), ...parsed };
      }

      // Appliquer le decay depuis la dernière session
      if (this.state.decayEnabled) {
        this.applyDecay();
      }

      this.initialized = true;
      console.log('[MemoryEngine] Initialized with', this.state.stats.totalMemories, 'memories');
    } catch (error) {
      console.warn('[MemoryEngine] Init error, using defaults:', error);
      this.state = this.getDefaultState();
      this.initialized = true;
    }
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
    const memory: MemoryEntry = {
      id: `mem_${now}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      type,
      context: context || '',
      tags: tags || [],
      importance: importance ?? 0.5,
      strength: 1.0, // Force initiale maximale
      createdAt: now,
      lastAccess: now,
      accessCount: 0,
      consolidated: false,
      associations: [],
    };

    // Ajouter à la mémoire
    this.state.memories.push(memory);

    // Limiter le nombre de souvenirs
    if (this.state.memories.length > MAX_MEMORIES) {
      this.pruneWeakMemories();
    }

    // Mettre à jour les stats
    this.updateStats();

    // Persister
    await this.persist();

    console.log(`[MemoryEngine] Stored memory: ${memory.id} (${type})`);
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
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

    // Filtrer et scorer les souvenirs
    const results: RecallResult[] = this.state.memories
      .filter(memory => {
        // Filtre par type
        if (type && memory.type !== type) return false;
        // Filtre par force
        if (memory.strength < minStrength) return false;
        // Filtre par tags
        if (tags && tags.length > 0) {
          if (!tags.some(tag => memory.tags.includes(tag))) return false;
        }
        return true;
      })
      .map(memory => {
        // Calculer la pertinence
        const contentLower = memory.content.toLowerCase();
        const contextLower = memory.context.toLowerCase();

        let relevance = 0;

        // Correspondance exacte
        if (contentLower.includes(queryLower)) {
          relevance += 0.5;
        }

        // Correspondance par termes
        for (const term of queryTerms) {
          if (contentLower.includes(term)) relevance += 0.15;
          if (contextLower.includes(term)) relevance += 0.05;
          if (memory.tags.some(t => t.toLowerCase().includes(term))) relevance += 0.1;
        }

        // Bonus pour l'importance et la force
        relevance += memory.importance * 0.2;
        relevance += memory.strength * 0.1;

        // Normaliser
        relevance = Math.min(relevance, 1.0);

        return {
          memory,
          relevance,
          confidence: memory.strength * relevance,
        };
      })
      .filter(r => r.relevance > 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

    // Mettre à jour les accès
    for (const result of results) {
      await this.accessMemory(result.memory.id);
    }

    // Mettre à jour les stats
    this.state.stats.totalRecalls++;
    await this.persist();

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
  async associate(memoryId1: string, memoryId2: string, _strength: number = 0.5): Promise<boolean> {
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

    this.state.memories.splice(index, 1);

    // Nettoyer les associations
    for (const memory of this.state.memories) {
      memory.associations = memory.associations.filter(id => id !== memoryId);
    }

    this.updateStats();
    await this.persist();

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
    this.state.stats.consolidationRate = consolidated / Math.max(this.state.memories.length, 1);

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
    const daysSinceConsolidation = (now - this.state.lastConsolidation) / (1000 * 60 * 60 * 24);

    for (const memory of this.state.memories) {
      // Les souvenirs consolidés décroissent moins vite
      const decayMultiplier = memory.consolidated ? 0.3 : 1.0;
      const daysSinceAccess = (now - memory.lastAccess) / (1000 * 60 * 60 * 24);

      // Décroissance exponentielle
      const decay = DECAY_RATE * decayMultiplier * daysSinceAccess;
      memory.strength = Math.max(0.01, memory.strength - decay);
    }

    console.log(`[MemoryEngine] Applied decay over ${daysSinceConsolidation.toFixed(1)} days`);
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
      averageStrength: memories.length > 0
        ? memories.reduce((sum, m) => sum + m.strength, 0) / memories.length
        : 0,
      oldestMemory: memories.length > 0
        ? Math.min(...memories.map(m => m.createdAt))
        : null,
      newestMemory: memories.length > 0
        ? Math.max(...memories.map(m => m.createdAt))
        : null,
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
