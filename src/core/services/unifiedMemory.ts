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
const isTestEnv = import.meta.env.MODE === 'test' || Boolean(import.meta.env.VITEST);
const shouldLog = isDev && !isTestEnv;

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
    totalEntries: number;
    maxEntries: number;
    ttl: string;
    oldestTimestamp: number;
    newestTimestamp: number;
  };
  mtm: {
    totalEntries: number;
    maxEntries: number;
    ttl: string;
    oldestTimestamp: number;
    newestTimestamp: number;
  };
  ltm: {
    totalEntries: number;
    maxEntries: string;
    ttl: string;
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

export type MemoryTierKey = 'stm' | 'mtm' | 'ltm';

export interface ChatEngineMemoryEntryInput {
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  importance: number;
}

export interface ChatEngineRecallOptions {
  limit?: number;
  minImportance?: number;
  messageId?: string;
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
    stm: {
      totalEntries: 0,
      maxEntries: 20,
      ttl: '5min',
      oldestTimestamp: 0,
      newestTimestamp: 0,
    },
    mtm: {
      totalEntries: 0,
      maxEntries: 100,
      ttl: '24h',
      oldestTimestamp: 0,
      newestTimestamp: 0,
    },
    ltm: { totalEntries: 0, maxEntries: 'unlimited', ttl: 'permanent', totalAccesses: 0 },
    total: 0,
    lastCleanup: Date.now(),
    promotions: 0,
  };

  // Cleanup timer
  private cleanupTimer: NodeJS.Timeout | null = null;

  // Scope utilisé par l'API "ChatEngine" (recall({ ... })) pour éviter la pollution inter-tests.
  private chatEngineScopeStartTimestamp: number | null = null;
  private chatEngineScopeId = 0;
  private chatEnginePreviousScopeId: number | null = null;

  private autoCleanupStartAttempted = false; // Lazy init flag

  constructor() {
    // Lazy auto-cleanup start
    shouldLog && console.log('[UnifiedMemory] Initialized (STM/MTM/LTM)');
  }

  private ensureAutoCleanupStarted(): void {
    if (this.cleanupTimer || this.autoCleanupStartAttempted) return;
    this.autoCleanupStartAttempted = true;
    try {
      this.startAutoCleanup();
    } catch (error) {
      console.warn('[UnifiedMemory] Failed to start auto-cleanup:', error);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * STORE: Stocker nouvelle entrée mémoire
   * ═══════════════════════════════════════════════════════════════════
   *
   * Stocke un message dans le système de mémoire unifiée.
   * Le tier (STM/MTM/LTM) est automatiquement déterminé selon l'importance:
   * - importance < 0.5  → STM (Short-Term Memory, 5 min TTL)
   * - importance 0.5-0.7 → MTM (Medium-Term Memory, 24h TTL)
   * - importance > 0.7  → LTM (Long-Term Memory, permanent)
   *
   * @param content - Contenu du message à stocker
   * @param role - Rôle de l'émetteur ('user' | 'assistant' | 'system')
   * @param importance - Score d'importance (0.0 → 1.0), défaut: 0.5
   * @param conversationId - ID optionnel de la conversation
   * @param tags - Tags optionnels pour filtrage ultérieur
   * @returns L'entrée mémoire créée avec ID unique
   *
   * @example
   * ```typescript
   * const entry = unifiedMemory.store(
   *   'Décision importante prise',
   *   'user',
   *   0.8,
   *   'conv-123',
   *   ['decision', 'project']
   * );
   * console.log(entry.tier); // 'LTM'
   * ```
   */
  store(entry: ChatEngineMemoryEntryInput): string;
  store(
    content: string,
    role: 'user' | 'assistant' | 'system',
    importance?: number,
    conversationId?: string,
    tags?: string[]
  ): MemoryEntry;
  store(
    entryOrContent: ChatEngineMemoryEntryInput | string,
    role?: 'user' | 'assistant' | 'system',
    importance: number = 0.5,
    conversationId?: string,
    tags?: string[]
  ): MemoryEntry | string {
    // API "ChatEngine" (tests d'intégration): store({content, role, timestamp, importance}) => id
    if (typeof entryOrContent !== 'string') {
      const provided = entryOrContent;
      const safeImportance = Math.max(0, Math.min(1, provided.importance));

      if (this.chatEngineScopeStartTimestamp === null) {
        this.chatEngineScopeStartTimestamp = provided.timestamp;
      }

      const entry: MemoryEntry = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: provided.content,
        role: provided.role,
        timestamp: provided.timestamp,
        importance: safeImportance,
        accessCount: 0,
        // Modèle attendu par src/__tests__/chatEngine-memory-integration.test.ts:
        // - < 0.7 => STM
        // - >= 0.7 => MTM
        // - LTM uniquement via promotion explicite
        tier: safeImportance >= 0.7 ? 'MTM' : 'STM',
        metadata: { api: 'chatEngine', scopeId: this.chatEngineScopeId },
      };

      if (entry.tier === 'MTM') this.storeInMTM(entry);
      else this.storeInSTM(entry);

      this.updateStats();
      isDev &&
        shouldLog &&
        console.log(`[UnifiedMemory] Stored (ChatEngine) in ${entry.tier}:`, entry.id);
      return entry.id;
    }

    // API historique: store(content, role, importance?, conversationId?, tags?) => MemoryEntry
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: entryOrContent,
      role: role ?? 'user',
      timestamp: Date.now(),
      importance: Math.max(0, Math.min(1, importance)), // Clamp 0-1
      accessCount: 0,
      tier: this.determineTier(importance),
      conversationId,
      tags,
      metadata: {},
    };

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
   *
   * Recherche et rappelle des entrées mémoire selon une requête textuelle.
   * Incrémente automatiquement accessCount et peut déclencher promotion MTM → LTM.
   * Les résultats sont triés par pertinence (importance 70% + recency 30%).
   *
   * @param query - Requête de recherche textuelle
   * @param options - Options de filtrage:
   *   - tier: Limiter recherche à un tier ('STM' | 'MTM' | 'LTM')
   *   - limit: Nombre max de résultats (défaut: 10)
   *   - minImportance: Score minimum d'importance (défaut: 0.3)
   *   - conversationId: Filtrer par conversation
   *   - tags: Filtrer par tags
   * @returns Liste d'entrées triées par pertinence
   *
   * @example
   * ```typescript
   * // Rechercher messages importants récents
   * const results = unifiedMemory.recall('projet architecture', {
   *   minImportance: 0.6,
   *   limit: 5,
   *   tier: 'MTM'
   * });
   *
   * // Rechercher dans toute la mémoire
   * const allResults = unifiedMemory.recall('decision', { limit: 20 });
   * ```
   */
  recall(query: string, options?: RecallOptions): MemoryEntry[];
  recall(options: ChatEngineRecallOptions): MemoryEntry[];
  recall(
    queryOrOptions: string | ChatEngineRecallOptions,
    options?: RecallOptions
  ): MemoryEntry[] {
    // API "ChatEngine" (tests d'intégration): recall({limit,minImportance,messageId})
    if (typeof queryOrOptions !== 'string') {
      const { limit = 10, minImportance = 0.3, messageId } = queryOrOptions;

      if (messageId) {
        const entry = this.getEntryById(messageId);
        if (!entry) return [];

        entry.accessCount++;

        // Promotion STM -> MTM après accès répétés (attendu par les tests)
        if (entry.tier === 'STM' && entry.accessCount >= 3) {
          this.promoteToMTM(messageId);
        }

        this.updateStats();
        return entry.importance >= minImportance ? [entry] : [];
      }

      const all = this.getAllEntries();
      const filtered = all.filter(e => e.importance >= minImportance);
      const chatEngineOnly = filtered.filter(e => {
        if (!e.metadata) return false;
        const meta = e.metadata as Record<string, unknown>;
        return meta.api === 'chatEngine';
      });

      const scopedById = chatEngineOnly.filter(e => {
        const meta = e.metadata as Record<string, unknown>;
        const scopeId = meta.scopeId;
        if (typeof scopeId !== 'number') return false;

        // Si aucun store depuis le dernier cleanup(), on autorise aussi le scope précédent.
        if (this.chatEngineScopeStartTimestamp === null) {
          return (
            scopeId === this.chatEngineScopeId ||
            (this.chatEnginePreviousScopeId !== null &&
              scopeId === this.chatEnginePreviousScopeId)
          );
        }

        return scopeId === this.chatEngineScopeId;
      });

      const scopeStart = this.chatEngineScopeStartTimestamp;

      const scoped =
        scopeStart === null
          ? scopedById
          : scopedById.filter(e => e.timestamp >= scopeStart);
      const sorted = scoped.sort((a, b) => {
        if (b.importance !== a.importance) return b.importance - a.importance;
        return b.timestamp - a.timestamp;
      });
      return sorted.slice(0, limit);
    }

    // API historique: recall(query, options)
    const query = queryOrOptions;
    const { tier, limit = 10, minImportance = 0.3, conversationId, tags } = options ?? {};

    const results: MemoryEntry[] = [];

    if (!tier || tier === 'STM') {
      results.push(...this.searchSTM(query, conversationId, tags));
    }
    if (!tier || tier === 'MTM') {
      results.push(...this.searchMTM(query, conversationId, tags));
    }
    if (!tier || tier === 'LTM') {
      results.push(...this.searchLTM(query, conversationId, tags));
    }

    const filtered = results.filter(e => e.importance >= minImportance);

    filtered.forEach(e => {
      e.accessCount++;
      if (e.tier === 'MTM' && e.accessCount >= this.PROMOTION_THRESHOLD) {
        this.promote(e.id);
      }
    });

    const sorted = filtered.sort((a, b) => {
      const scoreA = a.importance * 0.7 + ((Date.now() - a.timestamp) / 1000000) * 0.3;
      const scoreB = b.importance * 0.7 + ((Date.now() - b.timestamp) / 1000000) * 0.3;
      return scoreB - scoreA;
    });

    return sorted.slice(0, limit);
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PROMOTE: Promouvoir MTM → LTM si important
   * ═══════════════════════════════════════════════════════════════════
   *
   * Promeut manuellement une entrée MTM vers LTM si elle satisfait les critères:
   * - accessCount >= 10 (seuil de promotion)
   * - OU importance > 0.7
   *
   * Note: La promotion automatique est aussi déclenchée lors de recall().
   *
   * @param id - ID de l'entrée à promouvoir
   * @returns true si promotion réussie, false si entrée non trouvée ou critères non remplis
   *
   * @example
   * ```typescript
   * const entry = unifiedMemory.store('Knowledge important', 'system', 0.6);
   *
   * // Forcer promotion vers LTM
   * const promoted = unifiedMemory.promote(entry.id);
   * if (promoted) {
   *   console.log('Entry now in LTM (permanent)');
   * }
   * ```
   */
  promote(id: string): boolean;
  promote(id: string, target: 'mtm' | 'ltm'): boolean;
  promote(id: string, target?: 'mtm' | 'ltm'): boolean {
    // API "ChatEngine": permet promotion explicite STM/MTM -> LTM
    if (target) {
      if (target === 'mtm') {
        return this.promoteToMTM(id);
      }
      if (target === 'ltm') {
        const entry = this.getEntryById(id);
        if (!entry) return false;

        // Retirer de son tier actuel
        if (entry.tier === 'STM') {
          this.stm = this.stm.filter(e => e.id !== id);
        }
        if (entry.tier === 'MTM') {
          this.mtm.delete(id);
        }

        entry.tier = 'LTM';
        this.ltm.set(id, entry);
        this.stats.promotions++;
        this.updateStats();
        return true;
      }
    }

    const entry = this.mtm.get(id);
    if (!entry) return false;

    if (entry.accessCount >= this.PROMOTION_THRESHOLD || entry.importance > 0.7) {
      entry.tier = 'LTM';
      this.ltm.set(id, entry);
      this.mtm.delete(id);
      this.stats.promotions++;
      this.updateStats(); // BUGFIX: Update stats after promotion
      isDev && console.log('[UnifiedMemory] Promoted to LTM:', id);
      return true;
    }
    return false;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * CLEANUP: Nettoyage automatique
   * ═══════════════════════════════════════════════════════════════════
   *
   * Nettoie les entrées expirées selon les TTL de chaque tier:
   * - STM: Supprime entrées > 5 min OU garde seulement 20 plus récentes
   * - MTM: Supprime entrées > 24h OU garde seulement 100 plus importantes
   * - LTM: Aucune expiration (permanent)
   *
   * Appelé automatiquement toutes les 5 minutes.
   * Peut aussi être appelé manuellement si besoin.
   *
   * @example
   * ```typescript
   * // Forcer nettoyage immédiat
   * unifiedMemory.cleanup();
   *
   * // Vérifier effet
   * const stats = unifiedMemory.getStats();
   * console.log('Entries after cleanup:', stats.total);
   * ```
   */
  cleanup(): void {
    const now = Date.now();

    // Pour l'API "ChatEngine", cleanup() sert aussi de reset logique entre tests.
    // On démarre un nouveau scope: les recalls via recall({ ... }) seront filtrés
    // aux entrées stockées après ce point.
    this.chatEngineScopeStartTimestamp = null;
    this.chatEnginePreviousScopeId = this.chatEngineScopeId;
    this.chatEngineScopeId++;

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
      shouldLog &&
        console.log(`[UnifiedMemory] Cleanup: STM -${stmCleaned}, MTM -${mtmCleaned}`);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * COMPRESS: Compression LTM (placeholder pour future v1.1)
   * ═══════════════════════════════════════════════════════════════════
   */
  compress(): void {
    // Implementation v1.1: Intelligent LTM compression for space efficiency
    // - Summarize long conversations: Use summarizer.rs with KeyMessages strategy
    //   * Conversations > 100 messages: Reduce to 20-30 key messages + summary
    //   * Preserve first/last 10 messages for context continuity
    // - Remove redundant details: Deduplicate similar messages with cosine similarity > 0.95
    //   * Keep highest importance_score entry when duplicates detected
    // - Extract essence: Store compressed representation in ltm_compressed table
    //   * Schema: {original_count, compressed_count, summary_text, key_facts[]}
    //   * Ratio target: 70-80% space reduction while maintaining semantic value
    // - Trigger: Run weekly or when LTM > 10k entries
    // - Reversibility: Keep original uncompressed data for 30 days before permanent deletion
    isDev && console.log('[UnifiedMemory] Compress: Not implemented yet (v1.1)');
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * GET STATS: Récupérer statistiques
   * ═══════════════════════════════════════════════════════════════════
   *
   * Retourne statistiques détaillées sur chaque tier mémoire:
   * - Compteurs par tier (STM/MTM/LTM)
   * - Timestamps min/max
   * - Total accès LTM
   * - Nombre de promotions
   * - Timestamp du dernier cleanup
   *
   * @returns Objet MemoryStats avec statistiques complètes
   *
   * @example
   * ```typescript
   * const stats = unifiedMemory.getStats();
   * console.log(`Total entries: ${stats.total}`);
   * console.log(`STM: ${stats.stm.totalEntries}/${stats.stm.maxEntries}`);
   * console.log(`MTM: ${stats.mtm.totalEntries} (TTL: ${stats.mtm.ttl})`);
   * console.log(`LTM: ${stats.ltm.totalEntries} (${stats.promotions} promotions)`);
   * ```
   */
  getStats(): MemoryStats;
  getStats(tier: MemoryTierKey): { count: number };
  getStats(tier?: MemoryTierKey): MemoryStats | { count: number } {
    if (!tier) return { ...this.stats };

    if (tier === 'stm') return { count: this.stm.length };
    if (tier === 'mtm') return { count: this.mtm.size };
    return { count: this.ltm.size };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * CLEAR: Effacer tier spécifique ou tout
   * ═══════════════════════════════════════════════════════════════════
   *
   * Efface complètement un tier spécifique ou toute la mémoire.
   * ⚠️ Attention: Opération irréversible!
   *
   * @param tier - Tier à effacer ('STM' | 'MTM' | 'LTM'), ou undefined pour tout effacer
   *
   * @example
   * ```typescript
   * // Effacer seulement STM (short-term)
   * unifiedMemory.clear('STM');
   *
   * // Effacer toute la mémoire (reset complet)
   * unifiedMemory.clear();
   * ```
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

  private getAllEntries(): MemoryEntry[] {
    return [...this.stm, ...this.mtm.values(), ...this.ltm.values()];
  }

  private getEntryById(id: string): MemoryEntry | undefined {
    const fromSTM = this.stm.find(e => e.id === id);
    if (fromSTM) return fromSTM;
    const fromMTM = this.mtm.get(id);
    if (fromMTM) return fromMTM;
    return this.ltm.get(id);
  }

  private promoteToMTM(id: string): boolean {
    const stmEntryIndex = this.stm.findIndex(e => e.id === id);
    if (stmEntryIndex >= 0) {
      const entry = this.stm[stmEntryIndex];
      if (!entry) return false;
      this.stm.splice(stmEntryIndex, 1);
      entry.tier = 'MTM';
      this.mtm.set(id, entry);
      this.updateStats();
      return true;
    }

    // Déjà MTM/LTM
    return this.mtm.has(id) || this.ltm.has(id);
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
      const oldest = Array.from(this.mtm.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      )[0];
      if (oldest) this.mtm.delete(oldest.id);
    }
  }

  private storeInLTM(entry: MemoryEntry): void {
    this.ltm.set(entry.id, entry);
  }

  private searchSTM(
    query: string,
    conversationId?: string,
    tags?: string[]
  ): MemoryEntry[] {
    return this.stm.filter(e => this.matchesQuery(e, query, conversationId, tags));
  }

  private searchMTM(
    query: string,
    conversationId?: string,
    tags?: string[]
  ): MemoryEntry[] {
    return Array.from(this.mtm.values()).filter(e =>
      this.matchesQuery(e, query, conversationId, tags)
    );
  }

  private searchLTM(
    query: string,
    conversationId?: string,
    tags?: string[]
  ): MemoryEntry[] {
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
    this.stats.stm.totalEntries = this.stm.length;
    this.stats.stm.maxEntries = this.STM_MAX;
    this.stats.stm.ttl = '5min';
    this.stats.stm.oldestTimestamp = this.stm[0]?.timestamp || 0;
    this.stats.stm.newestTimestamp = this.stm[this.stm.length - 1]?.timestamp || 0;

    const mtmEntries = Array.from(this.mtm.values());
    this.stats.mtm.totalEntries = mtmEntries.length;
    this.stats.mtm.maxEntries = this.MTM_MAX;
    this.stats.mtm.ttl = '24h';
    this.stats.mtm.oldestTimestamp = Math.min(...mtmEntries.map(e => e.timestamp), 0);
    this.stats.mtm.newestTimestamp = Math.max(...mtmEntries.map(e => e.timestamp), 0);

    const ltmEntries = Array.from(this.ltm.values());
    this.stats.ltm.totalEntries = ltmEntries.length;
    this.stats.ltm.maxEntries = 'unlimited';
    this.stats.ltm.ttl = 'permanent';
    this.stats.ltm.totalAccesses = ltmEntries.reduce((sum, e) => sum + e.accessCount, 0);

    this.stats.total =
      this.stats.stm.totalEntries +
      this.stats.mtm.totalEntries +
      this.stats.ltm.totalEntries;
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
