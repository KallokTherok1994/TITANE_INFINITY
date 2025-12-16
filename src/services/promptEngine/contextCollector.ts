/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PROMPT ENGINE — Context Collector
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Collecte le contexte depuis toutes les sources disponibles.
 * Gère le caching, les timeouts, et la collecte parallèle.
 *
 * Sources supportées:
 * - Mémoire (session, résumée, long terme)
 * - Outils (résultats, état)
 * - Recherche (résultats, cache)
 * - Vitals système (CPU, RAM, Disk, Network)
 * - Profil utilisateur et préférences
 * - Configuration IA
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  ContextNode,
  ContextSource,
  ContextSourceType,
  ContextNodeType,
  LayerId,
  CollectorConfig,
  IAMode,
  PriorityLevel,
  NodeMetadata,
  generateContextId,
  hashContent,
  estimateTokens,
  getSourcePriority,
  isSourceAllowedForMode,
  DEFAULT_PROMPT_ENGINE_CONFIG,
} from './promptEngine.config';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Résultat de collecte pour une source
 */
interface CollectionResult {
  source: ContextSourceType;
  success: boolean;
  nodes: ContextNode[];
  error?: string;
  duration: number;
}

/**
 * Cache entry
 */
interface CacheEntry {
  nodes: ContextNode[];
  expiresAt: number;
  hits: number;
}

/**
 * Adaptateur de source de contexte
 */
interface SourceAdapter {
  type: ContextSourceType;
  layerId: LayerId;
  nodeType: ContextNodeType;
  collect: () => Promise<unknown>;
  transform: (data: unknown) => ContextNode[];
}

// =============================================================================
// CLASSE CONTEXT COLLECTOR
// =============================================================================

/**
 * Collecteur de contexte unifié
 * Singleton pattern
 */
export class ContextCollector {
  private static instance: ContextCollector | null = null;

  private config: CollectorConfig;
  private cache: Map<ContextSourceType, CacheEntry> = new Map();
  private adapters: Map<ContextSourceType, SourceAdapter> = new Map();
  private stats = {
    totalCollections: 0,
    cacheHits: 0,
    cacheMisses: 0,
    failedCollections: 0,
    averageCollectionTime: 0,
  };

  private constructor() {
    this.config = { ...DEFAULT_PROMPT_ENGINE_CONFIG.collector };
    this.initializeAdapters();
    console.log('[ContextCollector] 📦 Initialized');
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(): ContextCollector {
    if (!ContextCollector.instance) {
      ContextCollector.instance = new ContextCollector();
    }
    return ContextCollector.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    ContextCollector.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Configure le collecteur
   */
  configure(config: Partial<CollectorConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[ContextCollector] ⚙️ Configuration updated');
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): CollectorConfig {
    return { ...this.config };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALISATION DES ADAPTATEURS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialise les adaptateurs de sources
   */
  private initializeAdapters(): void {
    // Mémoire Session
    this.registerAdapter({
      type: 'memory_session',
      layerId: 'cognitive',
      nodeType: 'memory',
      collect: async () => this.collectMemorySession(),
      transform: data => this.transformMemory(data, 'memory_session'),
    });

    // Mémoire Résumée
    this.registerAdapter({
      type: 'memory_summarized',
      layerId: 'cognitive',
      nodeType: 'memory',
      collect: async () => this.collectMemorySummarized(),
      transform: data => this.transformMemory(data, 'memory_summarized'),
    });

    // Mémoire Long Terme
    this.registerAdapter({
      type: 'memory_longterm',
      layerId: 'cognitive',
      nodeType: 'memory',
      collect: async () => this.collectMemoryLongterm(),
      transform: data => this.transformMemory(data, 'memory_longterm'),
    });

    // Résultats d'outils
    this.registerAdapter({
      type: 'tools_result',
      layerId: 'cognitive',
      nodeType: 'tool',
      collect: async () => this.collectToolsResults(),
      transform: data => this.transformToolsResults(data),
    });

    // État des outils
    this.registerAdapter({
      type: 'tools_state',
      layerId: 'physical',
      nodeType: 'state',
      collect: async () => this.collectToolsState(),
      transform: data => this.transformToolsState(data),
    });

    // Résultats de recherche
    this.registerAdapter({
      type: 'search_result',
      layerId: 'cognitive',
      nodeType: 'search',
      collect: async () => this.collectSearchResults(),
      transform: data => this.transformSearchResults(data),
    });

    // Cache de recherche
    this.registerAdapter({
      type: 'search_cache',
      layerId: 'cognitive',
      nodeType: 'search',
      collect: async () => this.collectSearchCache(),
      transform: data => this.transformSearchCache(data),
    });

    // Vitals CPU
    this.registerAdapter({
      type: 'vitals_cpu',
      layerId: 'physical',
      nodeType: 'vital',
      collect: async () => this.collectVitalsCPU(),
      transform: data => this.transformVitals(data, 'vitals_cpu'),
    });

    // Vitals RAM
    this.registerAdapter({
      type: 'vitals_ram',
      layerId: 'physical',
      nodeType: 'vital',
      collect: async () => this.collectVitalsRAM(),
      transform: data => this.transformVitals(data, 'vitals_ram'),
    });

    // Vitals Disk
    this.registerAdapter({
      type: 'vitals_disk',
      layerId: 'physical',
      nodeType: 'vital',
      collect: async () => this.collectVitalsDisk(),
      transform: data => this.transformVitals(data, 'vitals_disk'),
    });

    // Vitals Network
    this.registerAdapter({
      type: 'vitals_network',
      layerId: 'physical',
      nodeType: 'vital',
      collect: async () => this.collectVitalsNetwork(),
      transform: data => this.transformVitals(data, 'vitals_network'),
    });

    // Profil utilisateur
    this.registerAdapter({
      type: 'user_profile',
      layerId: 'adaptive',
      nodeType: 'profile',
      collect: async () => this.collectUserProfile(),
      transform: data => this.transformUserProfile(data),
    });

    // Préférences utilisateur
    this.registerAdapter({
      type: 'user_preferences',
      layerId: 'adaptive',
      nodeType: 'preference',
      collect: async () => this.collectUserPreferences(),
      transform: data => this.transformUserPreferences(data),
    });

    // Configuration IA
    this.registerAdapter({
      type: 'ia_config',
      layerId: 'meta',
      nodeType: 'rule',
      collect: async () => this.collectIAConfig(),
      transform: data => this.transformIAConfig(data),
    });

    // État Self-Healing
    this.registerAdapter({
      type: 'selfhealing_status',
      layerId: 'physical',
      nodeType: 'state',
      collect: async () => this.collectSelfHealingStatus(),
      transform: data => this.transformSelfHealingStatus(data),
    });

    // État TTS
    this.registerAdapter({
      type: 'tts_state',
      layerId: 'physical',
      nodeType: 'state',
      collect: async () => this.collectTTSState(),
      transform: data => this.transformTTSState(data),
    });

    // Données XP
    this.registerAdapter({
      type: 'xp_data',
      layerId: 'adaptive',
      nodeType: 'profile',
      collect: async () => this.collectXPData(),
      transform: data => this.transformXPData(data),
    });

    // Données Evolution
    this.registerAdapter({
      type: 'evolution_data',
      layerId: 'adaptive',
      nodeType: 'profile',
      collect: async () => this.collectEvolutionData(),
      transform: data => this.transformEvolutionData(data),
    });

    // État système
    this.registerAdapter({
      type: 'system_state',
      layerId: 'physical',
      nodeType: 'state',
      collect: async () => this.collectSystemState(),
      transform: data => this.transformSystemState(data),
    });
  }

  /**
   * Enregistre un adaptateur
   */
  registerAdapter(adapter: SourceAdapter): void {
    this.adapters.set(adapter.type, adapter);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE PRINCIPALE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Collecte le contexte depuis toutes les sources configurées
   */
  async collectAll(mode: IAMode): Promise<Map<LayerId, ContextNode[]>> {
    const startTime = performance.now();
    const results = new Map<LayerId, ContextNode[]>();

    // Initialiser les couches
    const layers: LayerId[] = [
      'physical',
      'cognitive',
      'symbolic',
      'adaptive',
      'meta',
      'singularity',
    ];
    for (const layer of layers) {
      results.set(layer, []);
    }

    // Filtrer les sources autorisées pour ce mode
    const allowedSources = this.config.sources.filter(source =>
      isSourceAllowedForMode(source, mode)
    );

    console.log(
      `[ContextCollector] 🔍 Collecting from ${allowedSources.length} sources for mode: ${mode}`
    );

    // Collecter en parallèle ou séquentiellement
    let collectionResults: CollectionResult[];
    if (this.config.parallelFetch) {
      collectionResults = await this.collectParallel(allowedSources);
    } else {
      collectionResults = await this.collectSequential(allowedSources);
    }

    // Organiser les résultats par couche
    for (const result of collectionResults) {
      if (result.success && result.nodes.length > 0) {
        const adapter = this.adapters.get(result.source);
        if (adapter) {
          const layerNodes = results.get(adapter.layerId) || [];
          layerNodes.push(...result.nodes);
          results.set(adapter.layerId, layerNodes);
        }
      }
    }

    // Stats
    this.stats.totalCollections++;
    const duration = performance.now() - startTime;
    this.stats.averageCollectionTime =
      (this.stats.averageCollectionTime * (this.stats.totalCollections - 1) + duration) /
      this.stats.totalCollections;

    console.log(
      `[ContextCollector] ✅ Collected ${this.countNodes(results)} nodes in ${duration.toFixed(2)}ms`
    );

    return results;
  }

  /**
   * Collecte depuis sources spécifiques
   */
  async collectFromSources(
    sources: ContextSourceType[],
    mode: IAMode
  ): Promise<Map<LayerId, ContextNode[]>> {
    const filteredSources = sources.filter(s => isSourceAllowedForMode(s, mode));

    const results = new Map<LayerId, ContextNode[]>();
    const layers: LayerId[] = [
      'physical',
      'cognitive',
      'symbolic',
      'adaptive',
      'meta',
      'singularity',
    ];
    for (const layer of layers) {
      results.set(layer, []);
    }

    const collectionResults = this.config.parallelFetch
      ? await this.collectParallel(filteredSources)
      : await this.collectSequential(filteredSources);

    for (const result of collectionResults) {
      if (result.success && result.nodes.length > 0) {
        const adapter = this.adapters.get(result.source);
        if (adapter) {
          const layerNodes = results.get(adapter.layerId) || [];
          layerNodes.push(...result.nodes);
          results.set(adapter.layerId, layerNodes);
        }
      }
    }

    return results;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE PARALLÈLE / SÉQUENTIELLE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Collecte en parallèle avec timeout
   */
  private async collectParallel(
    sources: ContextSourceType[]
  ): Promise<CollectionResult[]> {
    const promises = sources.map(source => this.collectFromSource(source));

    const results = await Promise.allSettled(
      promises.map(p =>
        Promise.race([
          p,
          new Promise<CollectionResult>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
          ),
        ])
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        source: sources[index],
        success: false,
        nodes: [],
        error: result.reason?.message || 'Unknown error',
        duration: 0,
      };
    });
  }

  /**
   * Collecte séquentielle
   */
  private async collectSequential(
    sources: ContextSourceType[]
  ): Promise<CollectionResult[]> {
    const results: CollectionResult[] = [];

    for (const source of sources) {
      try {
        const result = await Promise.race([
          this.collectFromSource(source),
          new Promise<CollectionResult>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
          ),
        ]);
        results.push(result);
      } catch (error) {
        results.push({
          source,
          success: false,
          nodes: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: 0,
        });
      }
    }

    return results;
  }

  /**
   * Collecte depuis une source unique
   */
  private async collectFromSource(source: ContextSourceType): Promise<CollectionResult> {
    const startTime = performance.now();

    // Vérifier le cache
    if (this.config.cacheEnabled) {
      const cached = this.getCached(source);
      if (cached) {
        this.stats.cacheHits++;
        return {
          source,
          success: true,
          nodes: cached,
          duration: performance.now() - startTime,
        };
      }
      this.stats.cacheMisses++;
    }

    // Collecter via l'adaptateur
    const adapter = this.adapters.get(source);
    if (!adapter) {
      return {
        source,
        success: false,
        nodes: [],
        error: `No adapter for source: ${source}`,
        duration: performance.now() - startTime,
      };
    }

    try {
      const rawData = await adapter.collect();
      const nodes = adapter.transform(rawData);

      // Mettre en cache
      if (this.config.cacheEnabled && nodes.length > 0) {
        this.setCache(source, nodes);
      }

      return {
        source,
        success: true,
        nodes,
        duration: performance.now() - startTime,
      };
    } catch (error) {
      this.stats.failedCollections++;
      return {
        source,
        success: false,
        nodes: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - startTime,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CACHE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Récupère depuis le cache
   */
  private getCached(source: ContextSourceType): ContextNode[] | null {
    const entry = this.cache.get(source);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(source);
      return null;
    }

    entry.hits++;
    return entry.nodes;
  }

  /**
   * Met en cache
   */
  private setCache(source: ContextSourceType, nodes: ContextNode[]): void {
    this.cache.set(source, {
      nodes,
      expiresAt: Date.now() + this.config.cacheTTL,
      hits: 0,
    });
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ContextCollector] 🗑️ Cache cleared');
  }

  /**
   * Vide le cache pour une source spécifique
   */
  invalidateCache(source: ContextSourceType): void {
    this.cache.delete(source);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTEURS DE SOURCES (STUBS - À CONNECTER AUX VRAIS SERVICES)
  // ─────────────────────────────────────────────────────────────────────────

  private async collectMemorySession(): Promise<unknown> {
    // INTEGRATION: Real memory service connection
    // 1. Import UnifiedMemoryV2 from '@/services/memory/UnifiedMemoryV2'
    // 2. Call UnifiedMemoryV2.getSessionContext(sessionId) to fetch STM messages
    // 3. Retrieve recent messages (last 50-100) from STM for context
    // 4. Include MTM summaries for longer-term context (past hour)
    // 5. Format: { messages: Message[], summaries: string[], context: string }
    // 6. Error handling: Fallback to empty session if service unavailable
    // For now, return mocked data for development
    return {
      messages: [],
      context: 'Session active',
      startedAt: Date.now() - 3600000,
    };
  }

  private async collectMemorySummarized(): Promise<unknown> {
    return {
      summaries: [],
      lastCompaction: Date.now() - 86400000,
    };
  }

  private async collectMemoryLongterm(): Promise<unknown> {
    return {
      facts: [],
      knowledge: [],
    };
  }

  private async collectToolsResults(): Promise<unknown> {
    return {
      lastResults: [],
      pendingResults: [],
    };
  }

  private async collectToolsState(): Promise<unknown> {
    return {
      activeTools: [],
      availableTools: 12,
    };
  }

  private async collectSearchResults(): Promise<unknown> {
    return {
      recent: [],
      providers: ['duckduckgo'],
    };
  }

  private async collectSearchCache(): Promise<unknown> {
    return {
      entries: [],
      size: 0,
    };
  }

  private async collectVitalsCPU(): Promise<unknown> {
    return {
      usage: Math.random() * 100,
      cores: navigator.hardwareConcurrency || 4,
    };
  }

  private async collectVitalsRAM(): Promise<unknown> {
    // @ts-expect-error - deviceMemory est une API expérimentale
    const deviceMemory = navigator.deviceMemory || 8;
    return {
      total: deviceMemory * 1024,
      used: Math.random() * deviceMemory * 1024,
      free: deviceMemory * 512,
    };
  }

  private async collectVitalsDisk(): Promise<unknown> {
    return {
      total: 500,
      used: 250,
      free: 250,
    };
  }

  private async collectVitalsNetwork(): Promise<unknown> {
    return {
      online: navigator.onLine,
      type: 'unknown',
    };
  }

  private async collectUserProfile(): Promise<unknown> {
    return {
      name: 'Kevin',
      level: 10,
      xp: 5000,
    };
  }

  private async collectUserPreferences(): Promise<unknown> {
    return {
      theme: 'dark',
      language: 'fr',
      notifications: true,
    };
  }

  private async collectIAConfig(): Promise<unknown> {
    return {
      defaultMode: 'standard',
      model: 'ollama',
      temperature: 0.7,
    };
  }

  private async collectSelfHealingStatus(): Promise<unknown> {
    return {
      status: 'healthy',
      lastCheck: Date.now(),
      pendingRepairs: 0,
    };
  }

  private async collectTTSState(): Promise<unknown> {
    return {
      enabled: true,
      voice: 'default',
      rate: 1.0,
    };
  }

  private async collectXPData(): Promise<unknown> {
    return {
      total: 5000,
      level: 10,
      toNextLevel: 500,
    };
  }

  private async collectEvolutionData(): Promise<unknown> {
    return {
      stage: 'advanced',
      unlocks: [],
    };
  }

  private async collectSystemState(): Promise<unknown> {
    return {
      version: '1.0.0',
      uptime: Date.now(),
      modules: [],
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSFORMATEURS
  // ─────────────────────────────────────────────────────────────────────────

  private transformMemory(data: unknown, sourceType: ContextSourceType): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    const content = JSON.stringify(data);
    return [
      this.createNode('memory', 'cognitive', sourceType, data, 0.8, 'high', content),
    ];
  }

  private transformToolsResults(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('tool', 'cognitive', 'tools_result', data, 0.7, 'medium')];
  }

  private transformToolsState(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('state', 'physical', 'tools_state', data, 0.5, 'low')];
  }

  private transformSearchResults(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('search', 'cognitive', 'search_result', data, 0.75, 'high')];
  }

  private transformSearchCache(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('search', 'cognitive', 'search_cache', data, 0.5, 'low')];
  }

  private transformVitals(data: unknown, sourceType: ContextSourceType): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('vital', 'physical', sourceType, data, 0.6, 'medium')];
  }

  private transformUserProfile(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [
      this.createNode('profile', 'adaptive', 'user_profile', data, 0.95, 'critical'),
    ];
  }

  private transformUserPreferences(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [
      this.createNode('preference', 'adaptive', 'user_preferences', data, 0.85, 'high'),
    ];
  }

  private transformIAConfig(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('rule', 'meta', 'ia_config', data, 0.9, 'critical')];
  }

  private transformSelfHealingStatus(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [
      this.createNode('state', 'physical', 'selfhealing_status', data, 0.7, 'high'),
    ];
  }

  private transformTTSState(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('state', 'physical', 'tts_state', data, 0.4, 'low')];
  }

  private transformXPData(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('profile', 'adaptive', 'xp_data', data, 0.6, 'medium')];
  }

  private transformEvolutionData(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [
      this.createNode('profile', 'adaptive', 'evolution_data', data, 0.55, 'medium'),
    ];
  }

  private transformSystemState(data: unknown): ContextNode[] {
    if (!data || typeof data !== 'object') return [];

    return [this.createNode('state', 'physical', 'system_state', data, 0.65, 'medium')];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crée un nœud de contexte
   */
  private createNode(
    type: ContextNodeType,
    layerId: LayerId,
    sourceType: ContextSourceType,
    content: unknown,
    relevance: number,
    priority: PriorityLevel,
    rawContent?: string
  ): ContextNode {
    const contentStr = rawContent || JSON.stringify(content);
    const tokens = estimateTokens(contentStr);

    const source: ContextSource = {
      type: sourceType,
      engine: 'ContextCollector',
      timestamp: Date.now(),
      reliability: 0.9,
      ttl: this.config.cacheTTL,
    };

    const metadata: NodeMetadata = {
      tokens,
      compressed: false,
      tags: [type, layerId, sourceType],
      linkedNodes: [],
    };

    return {
      id: generateContextId('node'),
      type,
      layerId,
      content,
      relevance,
      priority,
      timestamp: Date.now(),
      source,
      metadata,
      hash: hashContent(content),
    };
  }

  /**
   * Compte le nombre total de nœuds
   */
  private countNodes(results: Map<LayerId, ContextNode[]>): number {
    let count = 0;
    for (const nodes of results.values()) {
      count += nodes.length;
    }
    return count;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // API PUBLIQUE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne les statistiques
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.stats = {
      totalCollections: 0,
      cacheHits: 0,
      cacheMisses: 0,
      failedCollections: 0,
      averageCollectionTime: 0,
    };
  }

  /**
   * Vérifie si une source est disponible
   */
  isSourceAvailable(source: ContextSourceType): boolean {
    return this.adapters.has(source);
  }

  /**
   * Liste les sources disponibles
   */
  getAvailableSources(): ContextSourceType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Obtient la priorité d'une source
   */
  getSourcePriority(source: ContextSourceType): number {
    return getSourcePriority(source);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const contextCollector = ContextCollector.getInstance();
