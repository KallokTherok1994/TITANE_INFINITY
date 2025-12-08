/**
 * TITANE∞ v1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v1.0 — UNIFIED MEMORY SYSTEM
 *   Architecture STM / MTM / LTM minimale et stable
 *   
 *   STM (Short-Term Memory)  : 20 derniers messages, expire 5min
 *   MTM (Medium-Term Memory) : Contexte session, expire 24h
 *   LTM (Long-Term Memory)   : Connaissances durables, permanent
 * ═══════════════════════════════════════════════════════════════════
 */

const isDev = import.meta.env.DEV;

// ─────────────────────────────────────────────────────────────────
// TYPES UNIFIED MEMORY
// ─────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  importance: number; // 0.0 → 1.0
  accessCount: number;
  tier: 'STM' | 'MTM' | 'LTM';
  conversationId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface MemoryStats {
  stm: {
    count: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  };
  mtm: {
    count: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  };
  ltm: {
    count: number;
    totalAccesses: number;
  };
  total: number;
  lastCleanup: number;
  promotions: number;
}

export interface RecallOptions {
  tier?: 'STM' | 'MTM' | 'LTM';
  limit?: number;
  minImportance?: number;
  conversationId?: string;
  tags?: string[];
}

// ─────────────────────────────────────────────────────────────────
// UNIFIED MEMORY SYSTEM CLASS
// ─────────────────────────────────────────────────────────────────

class UnifiedMemorySystem {
  // Configuration
  private readonly STM_MAX = 20;
  private readonly STM_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MTM_MAX = 100;
  private readonly MTM_TTL = 24 * 60 * 60 * 1000; // 24 heures
  private readonly PROMOTION_THRESHOLD = 10; // Accès pour promouvoir MTM → LTM
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Storage
  private stm: MemoryEntry[] = [];
  private mtm: Map<string, MemoryEntry> = new Map();
  private ltm: Map<string, MemoryEntry> = new Map();

  // Stats
  private stats: MemoryStats = {
    stm: { count: 0, oldestTimestamp: 0, newestTimestamp: 0 },
    mtm: { count: 0, oldestTimestamp: 0, newestTimestamp: 0 },
    ltm: { count: 0, totalAccesses: 0 },
    total: 0,
    lastCleanup: Date.now(),
    promotions: 0
  };

  // Cleanup timer
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoCleanup();
    isDev && console.log('[UnifiedMemory] Initialized (STM/MTM/LTM)');
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * STORE: Stocker nouvelle entrée mémoire
   * ═══════════════════════════════════════════════════════════════════
   */
  store(
    content: string,
    role: 'user' | 'assistant' | 'system',
    importance: number = 0.5,
    conversationId?: string,
    tags?: string[]
  ): MemoryEntry {
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      role,
      timestamp: Date.now(),
      importance: Math.max(0, Math.min(1, importance)), // Clamp 0-1
      accessCount: 0,
      tier: this.determineTier(importance),
      conversationId,
      tags,
      metadata: {}
    };

    // Router vers bon tier
    switch (entry.tier) {
      case 'STM':
        this.storeInSTM(entry);
        break;
      case 'MTM':
        this.storeInMTM(entry);
        break;
      case 'LTM':
        this.storeInLTM(entry);
        break;
    }

    this.updateStats();
    isDev && console.log(`[UnifiedMemory] Stored in ${entry.tier}:`, entry.id);
    
    return entry;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * RECALL: Rappeler mémoire selon requête
   * ═══════════════════════════════════════════════════════════════════
   */
  recall(query: string, options: RecallOptions = {}): MemoryEntry[] {
    const {
      tier,
      limit = 10,
      minImportance = 0.3,
      conversationId,
      tags
    } = options;

    const results: MemoryEntry[] = [];

    // Chercher dans tiers demandés
    if (!tier || tier === 'STM') {
      results.push(...this.searchSTM(query, conversationId, tags));
    }
    if (!tier || tier === 'MTM') {
      results.push(...this.searchMTM(query, conversationId, tags));
    }
    if (!tier || tier === 'LTM') {
      results.push(...this.searchLTM(query, conversationId, tags));
    }

    // Filtrer par importance
    const filtered = results.filter(e => e.importance >= minImportance);

    // Incrémenter accessCount
    filtered.forEach(e => {
      e.accessCount++;
      // Vérifier promotion MTM → LTM
      if (e.tier === 'MTM' && e.accessCount >= this.PROMOTION_THRESHOLD) {
        this.promote(e.id);
      }
    });

    // Trier par pertinence (importance + recency)
    const sorted = filtered.sort((a, b) => {
      const scoreA = a.importance * 0.7 + (Date.now() - a.timestamp) / 1000000 * 0.3;
      const scoreB = b.importance * 0.7 + (Date.now() - b.timestamp) / 1000000 * 0.3;
      return scoreB - scoreA;
    });

    return sorted.slice(0, limit);
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PROMOTE: Promouvoir MTM → LTM si important
   * ═══════════════════════════════════════════════════════════════════
   */
  promote(id: string): boolean {
    const entry = this.mtm.get(id);
    if (!entry) return false;

    if (entry.accessCount >= this.PROMOTION_THRESHOLD || entry.importance > 0.7) {
      entry.tier = 'LTM';
      this.ltm.set(id, entry);
      this.mtm.delete(id);
      this.stats.promotions++;
      isDev && console.log('[UnifiedMemory] Promoted to LTM:', id);
      return true;
    }
    return false;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * CLEANUP: Nettoyage automatique
   * ═══════════════════════════════════════════════════════════════════
   */
  cleanup(): void {
    const now = Date.now();

    // STM: Supprimer > 5min ou overflow
    const stmBefore = this.stm.length;
    this.stm = this.stm.filter(e => now - e.timestamp < this.STM_TTL);
    if (this.stm.length > this.STM_MAX) {
      this.stm = this.stm.slice(-this.STM_MAX);
    }

    // MTM: Supprimer > 24h ou promouvoir
    const mtmBefore = this.mtm.size;
    for (const [id, entry] of this.mtm) {
      if (now - entry.timestamp > this.MTM_TTL) {
        if (entry.accessCount >= this.PROMOTION_THRESHOLD / 2) {
          this.promote(id);
        } else {
          this.mtm.delete(id);
        }
      }
    }

    this.stats.lastCleanup = now;
    this.updateStats();

    if (isDev) {
      const stmCleaned = stmBefore - this.stm.length;
      const mtmCleaned = mtmBefore - this.mtm.size;
      console.log(`[UnifiedMemory] Cleanup: STM -${stmCleaned}, MTM -${mtmCleaned}`);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * COMPRESS: Compression LTM (placeholder pour future v1.1)
   * ═══════════════════════════════════════════════════════════════════
   */
  compress(): void {
    // TODO v1.1: Résumer conversations longues
    // TODO v1.1: Supprimer détails inutiles
    // TODO v1.1: Garder essence
    isDev && console.log('[UnifiedMemory] Compress: Not implemented yet (v1.1)');
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * GET STATS: Récupérer statistiques
   * ═══════════════════════════════════════════════════════════════════
   */
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * CLEAR: Effacer tier spécifique ou tout
   * ═══════════════════════════════════════════════════════════════════
   */
  clear(tier?: 'STM' | 'MTM' | 'LTM'): void {
    if (!tier) {
      this.stm = [];
      this.mtm.clear();
      this.ltm.clear();
      isDev && console.log('[UnifiedMemory] Cleared all tiers');
    } else {
      switch (tier) {
        case 'STM':
          this.stm = [];
          break;
        case 'MTM':
          this.mtm.clear();
          break;
        case 'LTM':
          this.ltm.clear();
          break;
      }
      isDev && console.log(`[UnifiedMemory] Cleared ${tier}`);
    }
    this.updateStats();
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * SHUTDOWN: Arrêter le système
   * ═══════════════════════════════════════════════════════════════════
   */
  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    isDev && console.log('[UnifiedMemory] Shutdown');
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────

  private determineTier(importance: number): 'STM' | 'MTM' | 'LTM' {
    if (importance < 0.3) return 'STM';
    if (importance < 0.7) return 'MTM';
    return 'LTM';
  }

  private storeInSTM(entry: MemoryEntry): void {
    this.stm.push(entry);
    if (this.stm.length > this.STM_MAX) {
      this.stm.shift(); // FIFO
    }
  }

  private storeInMTM(entry: MemoryEntry): void {
    this.mtm.set(entry.id, entry);
    if (this.mtm.size > this.MTM_MAX) {
      // Supprimer le plus ancien
      const oldest = Array.from(this.mtm.values())
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      if (oldest) this.mtm.delete(oldest.id);
    }
  }

  private storeInLTM(entry: MemoryEntry): void {
    this.ltm.set(entry.id, entry);
  }

  private searchSTM(query: string, conversationId?: string, tags?: string[]): MemoryEntry[] {
    return this.stm.filter(e => 
      this.matchesQuery(e, query, conversationId, tags)
    );
  }

  private searchMTM(query: string, conversationId?: string, tags?: string[]): MemoryEntry[] {
    return Array.from(this.mtm.values()).filter(e => 
      this.matchesQuery(e, query, conversationId, tags)
    );
  }

  private searchLTM(query: string, conversationId?: string, tags?: string[]): MemoryEntry[] {
    return Array.from(this.ltm.values()).filter(e => 
      this.matchesQuery(e, query, conversationId, tags)
    );
  }

  private matchesQuery(
    entry: MemoryEntry,
    query: string,
    conversationId?: string,
    tags?: string[]
  ): boolean {
    // Match content
    const contentMatch = entry.content.toLowerCase().includes(query.toLowerCase());
    
    // Match conversationId
    const conversationMatch = !conversationId || entry.conversationId === conversationId;
    
    // Match tags
    const tagsMatch = !tags || tags.some(tag => entry.tags?.includes(tag));
    
    return contentMatch && conversationMatch && tagsMatch;
  }

  private updateStats(): void {
    this.stats.stm.count = this.stm.length;
    this.stats.stm.oldestTimestamp = this.stm[0]?.timestamp || 0;
    this.stats.stm.newestTimestamp = this.stm[this.stm.length - 1]?.timestamp || 0;

    const mtmEntries = Array.from(this.mtm.values());
    this.stats.mtm.count = mtmEntries.length;
    this.stats.mtm.oldestTimestamp = Math.min(...mtmEntries.map(e => e.timestamp), 0);
    this.stats.mtm.newestTimestamp = Math.max(...mtmEntries.map(e => e.timestamp), 0);

    const ltmEntries = Array.from(this.ltm.values());
    this.stats.ltm.count = ltmEntries.length;
    this.stats.ltm.totalAccesses = ltmEntries.reduce((sum, e) => sum + e.accessCount, 0);

    this.stats.total = this.stats.stm.count + this.stats.mtm.count + this.stats.ltm.count;
  }

  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────

export const unifiedMemory = new UnifiedMemorySystem();
export default unifiedMemory;
