/**
 * TITANE∞ v20Ω — Memory Explorer
 * Exploration du système de mémoire
 */

export interface MemoryEntry {
  id: string;
  tier: 'stm' | 'mtm' | 'ltm';
  type: string;
  content: string;
  timestamp: number;
  accessCount: number;
  relevance: number;
}

export interface MemorySnapshot {
  timestamp: number;
  stm: MemoryTierStats;
  mtm: MemoryTierStats;
  ltm: MemoryTierStats;
  total: number;
  recentAccess: MemoryEntry[];
}

export interface MemoryTierStats {
  count: number;
  totalSize: number;
  avgRelevance: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
}

/**
 * Explorateur de mémoire
 */
export class MemoryExplorer {
  private entries: Map<string, MemoryEntry> = new Map();
  private accessLog: string[] = [];
  private maxAccessLog = 100;

  /**
   * Enregistre une entrée mémoire
   */
  record(entry: Omit<MemoryEntry, 'accessCount'>): void {
    const existing = this.entries.get(entry.id);

    this.entries.set(entry.id, {
      ...entry,
      accessCount: existing ? existing.accessCount + 1 : 1,
    });

    this.logAccess(entry.id);
  }

  /**
   * Enregistre un accès
   */
  logAccess(id: string): void {
    this.accessLog.push(id);
    if (this.accessLog.length > this.maxAccessLog) {
      this.accessLog.shift();
    }

    const entry = this.entries.get(id);
    if (entry) {
      entry.accessCount++;
    }
  }

  /**
   * Retourne les entrées par tier
   */
  getByTier(tier: 'stm' | 'mtm' | 'ltm'): MemoryEntry[] {
    return Array.from(this.entries.values()).filter(e => e.tier === tier);
  }

  /**
   * Calcule les stats d'un tier
   */
  private getTierStats(tier: 'stm' | 'mtm' | 'ltm'): MemoryTierStats {
    const entries = this.getByTier(tier);

    if (entries.length === 0) {
      return {
        count: 0,
        totalSize: 0,
        avgRelevance: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
      };
    }

    const totalSize = entries.reduce((sum, e) => sum + e.content.length, 0);
    const avgRelevance =
      entries.reduce((sum, e) => sum + e.relevance, 0) / entries.length;
    const timestamps = entries.map(e => e.timestamp);

    return {
      count: entries.length,
      totalSize,
      avgRelevance,
      oldestTimestamp: Math.min(...timestamps),
      newestTimestamp: Math.max(...timestamps),
    };
  }

  /**
   * Crée un snapshot
   */
  async snapshot(): Promise<MemorySnapshot> {
    const recentIds = [...new Set(this.accessLog.slice(-10))];
    const recentAccess = recentIds
      .map(id => this.entries.get(id))
      .filter((e): e is MemoryEntry => e !== undefined);

    return {
      timestamp: Date.now(),
      stm: this.getTierStats('stm'),
      mtm: this.getTierStats('mtm'),
      ltm: this.getTierStats('ltm'),
      total: this.entries.size,
      recentAccess,
    };
  }

  /**
   * Recherche dans les mémoires
   */
  search(query: string): MemoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.entries.values()).filter(e =>
      e.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Retourne les entrées les plus accédées
   */
  getMostAccessed(limit = 10): MemoryEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Retourne les entrées les plus récentes
   */
  getMostRecent(limit = 10): MemoryEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Supprime une entrée
   */
  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  /**
   * Efface tout
   */
  clear(): void {
    this.entries.clear();
    this.accessLog = [];
  }
}

export default MemoryExplorer;
