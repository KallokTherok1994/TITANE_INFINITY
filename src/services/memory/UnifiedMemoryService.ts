/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * @legacy FILE-BASED MEMORY SERVICE
 * ATTENTION: Utilise `fs/promises` (Node.js natif) — non compatible WebView Tauri en production.
 * Usage prouvé: tests/dev uniquement.
 * CANONICAL: Utiliser `services/unified/UnifiedMemory.ts` pour le frontend,
 *             `src-tauri/src/unified_memory_v2/` pour le backend.
 * Voir: docs/architecture/MEMORY_AUTHORITY_MAP.md
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — Unified Memory Service
 *   Service unifié pour gérer la mémoire à trois niveaux (STM/MTM/LTM)
 *   Connecté aux fichiers mémoire JSON et au MemoryBridge
 * ═══════════════════════════════════════════════════════════════
 */

import fs from 'fs/promises';
import path from 'path';

// Types pour la mémoire unifiée
export interface MemoryEntry {
  id: string;
  content: string;
  type:
    | 'fact'
    | 'preference'
    | 'context'
    | 'conversation'
    | 'knowledge'
    | 'decision'
    | 'project';
  importance: number; // 0-1
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  conversationId?: string;
  metadata?: Record<string, unknown>;
  ttl?: number; // Time to live in milliseconds
}

export interface MemoryTierStats {
  totalEntries: number;
  totalSizeBytes: number;
  avgImportance: number;
  lastCleanup: number;
}

export interface UnifiedMemoryConfig {
  persistenceEnabled: boolean;
  autoCompaction: boolean;
  maxEntriesPerTier: {
    STM: number;
    MTM: number;
    LTM: number;
  };
  cleanupIntervals: {
    STM: number; // ms
    MTM: number; // ms
    LTM: number; // ms (longer for LTM)
  };
}

// Chemins des fichiers mémoire
const MEMORY_PATHS = {
  STM: path.join(process.cwd(), 'memory', 'stm.json'),
  MTM: path.join(process.cwd(), 'memory', 'mtm.json'),
  LTM: path.join(process.cwd(), 'memory', 'ltm.json'),
};

export class UnifiedMemoryService {
  private config: UnifiedMemoryConfig;
  private stm: MemoryEntry[] = [];
  private mtm: MemoryEntry[] = [];
  private ltm: MemoryEntry[] = [];
  private cleanupTimers: Record<string, NodeJS.Timeout> = {};

  constructor(config?: Partial<UnifiedMemoryConfig>) {
    this.config = {
      persistenceEnabled: true,
      autoCompaction: true,
      maxEntriesPerTier: {
        STM: 50,
        MTM: 200,
        LTM: 1000,
      },
      cleanupIntervals: {
        STM: 5 * 60 * 1000, // 5 minutes
        MTM: 30 * 60 * 1000, // 30 minutes
        LTM: 24 * 60 * 60 * 1000, // 24 hours
      },
      ...config,
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.config.persistenceEnabled) {
        await this.loadFromFiles();
      }
      this.setupCleanupTimers();
    } catch (error) {
      console.error('Failed to initialize UnifiedMemoryService:', error);
    }
  }

  private setupCleanupTimers(): void {
    // Setup periodic cleanup for each tier
    this.cleanupTimers.STM = setInterval(() => {
      this.cleanup('STM');
    }, this.config.cleanupIntervals.STM);

    this.cleanupTimers.MTM = setInterval(() => {
      this.cleanup('MTM');
    }, this.config.cleanupIntervals.MTM);

    this.cleanupTimers.LTM = setInterval(() => {
      this.cleanup('LTM');
    }, this.config.cleanupIntervals.LTM);
  }

  private async loadFromFiles(): Promise<void> {
    try {
      // Load STM
      try {
        const stmData = await fs.readFile(MEMORY_PATHS.STM, 'utf-8');
        this.stm = JSON.parse(stmData);
      } catch (e) {
        // File doesn't exist, create empty array
        this.stm = [];
        await this.saveToFile('STM');
      }

      // Load MTM
      try {
        const mtmData = await fs.readFile(MEMORY_PATHS.MTM, 'utf-8');
        this.mtm = JSON.parse(mtmData);
      } catch (e) {
        this.mtm = [];
        await this.saveToFile('MTM');
      }

      // Load LTM
      try {
        const ltmData = await fs.readFile(MEMORY_PATHS.LTM, 'utf-8');
        this.ltm = JSON.parse(ltmData);
      } catch (e) {
        this.ltm = [];
        await this.saveToFile('LTM');
      }
    } catch (error) {
      console.error('Failed to load memory from files:', error);
    }
  }

  private async saveToFile(tier: 'STM' | 'MTM' | 'LTM'): Promise<void> {
    if (!this.config.persistenceEnabled) return;

    try {
      const data = this.getTier(tier);
      const filePath = MEMORY_PATHS[tier];

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write file
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to save ${tier} to file:`, error);
    }
  }

  private getTier(tier: 'STM' | 'MTM' | 'LTM'): MemoryEntry[] {
    switch (tier) {
      case 'STM':
        return this.stm;
      case 'MTM':
        return this.mtm;
      case 'LTM':
        return this.ltm;
    }
  }

  private setTier(tier: 'STM' | 'MTM' | 'LTM', entries: MemoryEntry[]): void {
    switch (tier) {
      case 'STM':
        this.stm = entries;
        break;
      case 'MTM':
        this.mtm = entries;
        break;
      case 'LTM':
        this.ltm = entries;
        break;
    }
  }

  /**
   * Stocke une entrée dans le niveau approprié basé sur l'importance
   */
  async store(
    content: string,
    type: MemoryEntry['type'],
    importance: number,
    conversationId?: string,
    metadata?: Record<string, unknown>
  ): Promise<MemoryEntry> {
    const entry: MemoryEntry = {
      id: crypto.randomUUID(),
      content,
      type,
      importance,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      conversationId,
      metadata,
      ...(type === 'conversation' && importance < 0.3 ? { ttl: 5 * 60 * 1000 } : {}), // 5min TTL for low-importance conversations
    };

    let targetTier: 'STM' | 'MTM' | 'LTM';

    if (importance < 0.3) {
      targetTier = 'STM';
    } else if (importance < 0.7) {
      targetTier = 'MTM';
    } else {
      targetTier = 'LTM';
    }

    // Add to appropriate tier
    const tier = this.getTier(targetTier);
    tier.push(entry);

    // Apply tier-specific limits
    await this.enforceLimits(targetTier);

    // Save to file if persistence enabled
    if (this.config.persistenceEnabled) {
      await this.saveToFile(targetTier);
    }

    return entry;
  }

  /**
   * Récupère les entrées pertinentes basées sur les mots-clés et l'importance
   */
  async recall(options: {
    keywords?: string[];
    limit?: number;
    minImportance?: number;
    conversationId?: string;
    types?: MemoryEntry['type'][];
  }): Promise<MemoryEntry[]> {
    const {
      keywords = [],
      limit = 10,
      minImportance = 0,
      conversationId,
      types,
    } = options;

    // Search across all tiers
    const allEntries = [...this.stm, ...this.mtm, ...this.ltm];

    // Filter entries
    const filtered = allEntries.filter(entry => {
      // Minimum importance filter
      if (entry.importance < minImportance) return false;

      // Conversation filter
      if (conversationId && entry.conversationId !== conversationId) return false;

      // Type filter
      if (types && !types.includes(entry.type)) return false;

      // Keyword filter
      if (keywords.length > 0) {
        const contentLower = entry.content.toLowerCase();
        return keywords.some(keyword => contentLower.includes(keyword.toLowerCase()));
      }

      return true;
    });

    // Update access counts and timestamps
    filtered.forEach(entry => {
      entry.accessCount++;
      entry.lastAccessed = Date.now();

      // Auto-promote MTM entries with high access count
      if (this.mtm.includes(entry) && entry.accessCount >= 10) {
        this.promote(entry.id, 'LTM');
      }
    });

    // Sort by relevance (importance * recency boost)
    const now = Date.now();
    filtered.sort((a, b) => {
      const aRecency = Math.max(
        0,
        1 - (now - a.lastAccessed) / (7 * 24 * 60 * 60 * 1000)
      );
      const bRecency = Math.max(
        0,
        1 - (now - b.lastAccessed) / (7 * 24 * 60 * 60 * 1000)
      );

      const aScore = a.importance * 0.7 + aRecency * 0.3;
      const bScore = b.importance * 0.7 + bRecency * 0.3;

      return bScore - aScore;
    });

    // Limit results
    const results = filtered.slice(0, limit);

    // Save updated access counts
    if (this.config.persistenceEnabled && results.length > 0) {
      await Promise.all([
        this.saveToFile('STM'),
        this.saveToFile('MTM'),
        this.saveToFile('LTM'),
      ]);
    }

    return results;
  }

  /**
   * Promouvoir une entrée d'un niveau à un autre
   */
  async promote(entryId: string, targetTier: 'STM' | 'MTM' | 'LTM'): Promise<boolean> {
    // Find entry in any tier
    let entry: MemoryEntry | undefined;
    let sourceTier: 'STM' | 'MTM' | 'LTM' | undefined;

    // Search STM
    const stmIndex = this.stm.findIndex(e => e.id === entryId);
    if (stmIndex !== -1) {
      entry = this.stm[stmIndex];
      sourceTier = 'STM';
      this.stm.splice(stmIndex, 1);
    }

    // Search MTM
    if (!entry) {
      const mtmIndex = this.mtm.findIndex(e => e.id === entryId);
      if (mtmIndex !== -1) {
        entry = this.mtm[mtmIndex];
        sourceTier = 'MTM';
        this.mtm.splice(mtmIndex, 1);
      }
    }

    // Search LTM
    if (!entry) {
      const ltmIndex = this.ltm.findIndex(e => e.id === entryId);
      if (ltmIndex !== -1) {
        entry = this.ltm[ltmIndex];
        sourceTier = 'LTM';
        this.ltm.splice(ltmIndex, 1);
      }
    }

    if (!entry || !sourceTier) {
      return false;
    }

    // Add to target tier
    const targetArray = this.getTier(targetTier);
    targetArray.push(entry);

    // Save changes
    if (this.config.persistenceEnabled) {
      await Promise.all([this.saveToFile(sourceTier), this.saveToFile(targetTier)]);
    }

    return true;
  }

  /**
   * Nettoyer les entrées expirées ou inutiles
   */
  async cleanup(tier: 'STM' | 'MTM' | 'LTM'): Promise<void> {
    const now = Date.now();
    const tierArray = this.getTier(tier);

    const beforeCount = tierArray.length;

    // Remove expired entries
    const filtered = tierArray.filter(entry => {
      // Remove TTL-expired entries
      if (entry.ttl && now - entry.timestamp > entry.ttl) {
        return false;
      }

      // Remove old STM entries (older than 1 hour)
      if (tier === 'STM' && now - entry.timestamp > 60 * 60 * 1000) {
        return false;
      }

      // Remove old MTM entries (older than 1 week)
      if (tier === 'MTM' && now - entry.timestamp > 7 * 24 * 60 * 60 * 1000) {
        return false;
      }

      return true;
    });

    // Update tier
    this.setTier(tier, filtered);

    const afterCount = filtered.length;
    const removedCount = beforeCount - afterCount;

    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} entries from ${tier}`);

      // Save changes
      if (this.config.persistenceEnabled) {
        await this.saveToFile(tier);
      }
    }
  }

  /**
   * Appliquer les limites de taille pour chaque niveau
   */
  private async enforceLimits(tier: 'STM' | 'MTM' | 'LTM'): Promise<void> {
    const tierArray = this.getTier(tier);
    const maxEntries = this.config.maxEntriesPerTier[tier];

    if (tierArray.length > maxEntries) {
      // Sort by importance and recency for pruning
      tierArray.sort((a, b) => {
        // Higher importance first
        if (b.importance !== a.importance) {
          return b.importance - a.importance;
        }
        // More recently accessed first
        return b.lastAccessed - a.lastAccessed;
      });

      // Keep only the most important/recent entries
      const pruned = tierArray.slice(0, maxEntries);
      this.setTier(tier, pruned);

      // Save changes
      if (this.config.persistenceEnabled) {
        await this.saveToFile(tier);
      }
    }
  }

  /**
   * Obtenir les statistiques de chaque niveau
   */
  getStats(): Record<'STM' | 'MTM' | 'LTM', MemoryTierStats> {
    const calculateStats = (entries: MemoryEntry[]): MemoryTierStats => {
      const totalSizeBytes = entries.reduce(
        (sum, entry) => sum + entry.content.length,
        0
      );
      const avgImportance =
        entries.length > 0
          ? entries.reduce((sum, entry) => sum + entry.importance, 0) / entries.length
          : 0;

      return {
        totalEntries: entries.length,
        totalSizeBytes,
        avgImportance,
        lastCleanup: Date.now(), // This should track actual last cleanup time
      };
    };

    return {
      STM: calculateStats(this.stm),
      MTM: calculateStats(this.mtm),
      LTM: calculateStats(this.ltm),
    };
  }

  /**
   * Vider un niveau spécifique ou tous les niveaux
   */
  async clear(tier?: 'STM' | 'MTM' | 'LTM'): Promise<void> {
    if (tier) {
      this.setTier(tier, []);
      if (this.config.persistenceEnabled) {
        await this.saveToFile(tier);
      }
    } else {
      this.stm = [];
      this.mtm = [];
      this.ltm = [];
      if (this.config.persistenceEnabled) {
        await Promise.all([
          this.saveToFile('STM'),
          this.saveToFile('MTM'),
          this.saveToFile('LTM'),
        ]);
      }
    }
  }

  /**
   * Nettoie les entrées expirées de tous les niveaux
   */
  async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();

    // Nettoyer chaque niveau séparément
    const cleanupTier = (tierArray: MemoryEntry[]): MemoryEntry[] => {
      return tierArray.filter((entry: MemoryEntry) => {
        // Vérifier TTL si présent
        if (entry.ttl && now - entry.timestamp > entry.ttl) {
          return false;
        }

        // Vérifier âge selon le type de mémoire
        const age = now - entry.timestamp;
        switch (entry.type) {
          case 'conversation':
            // Conversations : TTL ou 1 heure max
            return !entry.ttl || age < entry.ttl;
          case 'fact':
          case 'knowledge':
            // Faits/knowledge : pas de limite d'âge stricte
            return true;
          case 'preference':
            // Préférences : max 30 jours
            return age < 30 * 24 * 60 * 60 * 1000;
          case 'context':
            // Contexte : max 7 jours
            return age < 7 * 24 * 60 * 60 * 1000;
          case 'decision':
            // Décisions : max 90 jours
            return age < 90 * 24 * 60 * 60 * 1000;
          case 'project':
            // Projets : max 365 jours
            return age < 365 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });
    };

    // Appliquer le nettoyage à chaque niveau
    const newStm = cleanupTier(this.stm);
    const newMtm = cleanupTier(this.mtm);
    const newLtm = cleanupTier(this.ltm);

    // Mettre à jour les tableaux internes
    this.stm = newStm;
    this.mtm = newMtm;
    this.ltm = newLtm;

    // Sauvegarder les données mises à jour
    if (this.config.persistenceEnabled) {
      await Promise.all([
        this.saveToFile('STM'),
        this.saveToFile('MTM'),
        this.saveToFile('LTM'),
      ]);
    }

    // Log les statistiques de nettoyage
    const removedStm = this.stm.length - newStm.length;
    const removedMtm = this.mtm.length - newMtm.length;
    const removedLtm = this.ltm.length - newLtm.length;

    if (removedStm > 0 || removedMtm > 0 || removedLtm > 0) {
      console.log(
        `cleanupExpiredEntries: Removed ${removedStm} STM, ${removedMtm} MTM, ${removedLtm} LTM entries`
      );
    }
  }

  /**
   * Compacter la mémoire (supprimer les doublons, optimiser)
   */
  async compact(): Promise<void> {
    if (!this.config.autoCompaction) return;

    // Simple deduplication based on content hash
    const getContentHash = (content: string): string => {
      // Simple hash function for deduplication
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString();
    };

    const processTier = (tierArray: MemoryEntry[]): MemoryEntry[] => {
      const seen = new Map<string, MemoryEntry>();

      for (const entry of tierArray) {
        const hash = getContentHash(entry.content);
        const existing = seen.get(hash);

        if (existing) {
          // Merge access counts and keep the most recent
          existing.accessCount += entry.accessCount;
          existing.lastAccessed = Math.max(existing.lastAccessed, entry.lastAccessed);
          if (entry.importance > existing.importance) {
            existing.importance = entry.importance;
          }
        } else {
          seen.set(hash, entry);
        }
      }

      return Array.from(seen.values());
    };

    this.stm = processTier(this.stm);
    this.mtm = processTier(this.mtm);
    this.ltm = processTier(this.ltm);

    // Save compacted data
    if (this.config.persistenceEnabled) {
      await Promise.all([
        this.saveToFile('STM'),
        this.saveToFile('MTM'),
        this.saveToFile('LTM'),
      ]);
    }
  }

  /**
   * Exporter toutes les mémoires pour backup/debug
   */
  export(): {
    STM: MemoryEntry[];
    MTM: MemoryEntry[];
    LTM: MemoryEntry[];
    stats: Record<'STM' | 'MTM' | 'LTM', MemoryTierStats>;
  } {
    return {
      STM: [...this.stm],
      MTM: [...this.mtm],
      LTM: [...this.ltm],
      stats: this.getStats(),
    };
  }

  /**
   * Importer des mémoires depuis un export
   */
  async import(data: {
    STM: MemoryEntry[];
    MTM: MemoryEntry[];
    LTM: MemoryEntry[];
  }): Promise<void> {
    this.stm = data.STM;
    this.mtm = data.MTM;
    this.ltm = data.LTM;

    if (this.config.persistenceEnabled) {
      await Promise.all([
        this.saveToFile('STM'),
        this.saveToFile('MTM'),
        this.saveToFile('LTM'),
      ]);
    }
  }
}

// Singleton instance
let unifiedMemoryInstance: UnifiedMemoryService | null = null;

export function getUnifiedMemory(): UnifiedMemoryService {
  if (!unifiedMemoryInstance) {
    unifiedMemoryInstance = new UnifiedMemoryService();
  }
  return unifiedMemoryInstance;
}

export default UnifiedMemoryService;
