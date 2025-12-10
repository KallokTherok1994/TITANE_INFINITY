/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SEARCH ENGINE — Moteur de Recherche Web et Local
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Moteur de recherche unifié supportant plusieurs providers web
 * et recherche locale dans les fichiers du projet.
 *
 * Providers supportés:
 * - DuckDuckGo (défaut, pas de clé API requise)
 * - Brave Search (clé API optionnelle)
 * - SearXNG (self-hosted)
 * - Local (grep/ripgrep dans les fichiers)
 *
 * @module searchEngine
 * @version Ω∞+
 */

import { secureInvoke } from '@/lib/security';
import {
  type SearchProvider,
  type SearchType,
  type SearchProviderConfig,
  type SearchQuery,
  type SearchResult,
  type SearchResponse,
  type SearchCache,
  type SearchEngineConfig,
  DEFAULT_SEARCH_ENGINE_CONFIG,
  generateSearchQueryId,
  generateSearchCacheKey,
  findSearchProvider,
  selectBestProvider,
} from './searchTools.config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES INTERNES
// ═══════════════════════════════════════════════════════════════════════════

interface SearchState {
  isSearching: boolean;
  currentQueryId: string | null;
  lastSearchTime: number;
  consecutiveErrors: number;
}

interface ProviderRateLimitInfo {
  provider: SearchProvider;
  requestCount: number;
  windowStart: number;
  blocked: boolean;
  blockUntil: number;
}

type SearchCallback = (response: SearchResponse) => void;
type SearchErrorCallback = (error: Error, query: SearchQuery) => void;

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Search Engine — Singleton
 *
 * Moteur de recherche unifié avec cache et rate limiting.
 */
export class SearchEngine {
  private static instance: SearchEngine | null = null;

  private config: SearchEngineConfig;
  private state: SearchState;
  private cache: Map<string, SearchCache> = new Map();
  private rateLimits: Map<SearchProvider, ProviderRateLimitInfo> = new Map();
  private callbacks: Set<SearchCallback> = new Set();
  private errorCallbacks: Set<SearchErrorCallback> = new Set();
  private abortController: AbortController | null = null;

  // Stats
  private stats = {
    totalSearches: 0,
    successfulSearches: 0,
    failedSearches: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
    totalResponseTime: 0,
    searchesByProvider: {} as Record<string, number>,
    searchesByType: {} as Record<string, number>,
  };

  private constructor() {
    this.config = { ...DEFAULT_SEARCH_ENGINE_CONFIG };
    this.state = {
      isSearching: false,
      currentQueryId: null,
      lastSearchTime: 0,
      consecutiveErrors: 0,
    };

    this.initializeRateLimits();

    console.log('[SearchEngine] 🔍 Initialized');
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine();
    }
    return SearchEngine.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    SearchEngine.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Configure le search engine
   */
  configure(config: Partial<SearchEngineConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.providers) {
      this.initializeRateLimits();
    }

    console.log('[SearchEngine] ⚙️ Configuration updated');
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): SearchEngineConfig {
    return { ...this.config };
  }

  /**
   * Active/désactive un provider
   */
  setProviderEnabled(providerId: SearchProvider, enabled: boolean): void {
    const provider = this.config.providers.find(p => p.id === providerId);
    if (provider) {
      provider.enabled = enabled;
      console.log(
        `[SearchEngine] Provider ${providerId}: ${enabled ? 'enabled' : 'disabled'}`
      );
    }
  }

  /**
   * Configure un provider
   */
  configureProvider(
    providerId: SearchProvider,
    config: Partial<SearchProviderConfig>
  ): void {
    const index = this.config.providers.findIndex(p => p.id === providerId);
    if (index >= 0) {
      this.config.providers[index] = {
        ...this.config.providers[index],
        ...config,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECHERCHE PRINCIPALE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Effectue une recherche
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    if (!this.config.enabled) {
      throw new Error('Search engine is disabled');
    }

    // Générer un ID si non fourni
    if (!query.id) {
      query.id = generateSearchQueryId();
    }

    this.stats.totalSearches++;
    this.state.isSearching = true;
    this.state.currentQueryId = query.id;

    const startTime = Date.now();

    try {
      // Vérifier le cache
      if (this.config.cacheEnabled && query.options?.cache !== false) {
        const cached = this.getCachedResponse(query);
        if (cached) {
          this.stats.cacheHits++;
          console.log(
            `[SearchEngine] 📦 Cache hit for: ${query.query.substring(0, 30)}...`
          );
          return { ...cached, queryId: query.id, cached: true };
        }
        this.stats.cacheMisses++;
      }

      // Sélectionner le provider
      const provider = query.provider
        ? findSearchProvider(query.provider, this.config)
        : selectBestProvider(query.type, this.config);

      if (!provider) {
        throw new Error(`No available provider for search type: ${query.type}`);
      }

      // Vérifier le rate limit
      if (this.isRateLimited(provider.id)) {
        throw new Error(`Rate limit exceeded for provider: ${provider.id}`);
      }

      // Effectuer la recherche selon le provider
      let response: SearchResponse;

      if (provider.id === 'local') {
        response = await this.searchLocal(query, provider);
      } else {
        response = await this.searchWeb(query, provider);
      }

      // Mettre à jour les stats
      const executionTime = Date.now() - startTime;
      response.executionTime = executionTime;
      this.updateStats(provider.id, query.type, executionTime, true);

      // Mettre en cache
      if (this.config.cacheEnabled) {
        this.cacheResponse(query, response);
      }

      // Notifier les callbacks
      this.notifyCallbacks(response);

      this.state.consecutiveErrors = 0;
      console.log(
        `[SearchEngine] ✅ Search completed: ${response.results.length} results in ${executionTime}ms`
      );

      return response;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.stats.failedSearches++;
      this.state.consecutiveErrors++;

      console.error('[SearchEngine] ❌ Search failed:', error);

      // Notifier les error callbacks
      this.notifyErrorCallbacks(error as Error, query);

      // Créer une réponse d'erreur
      const errorResponse: SearchResponse = {
        queryId: query.id,
        query: query.query,
        provider: query.provider ?? this.config.defaultProvider,
        type: query.type,
        results: [],
        totalResults: 0,
        page: 1,
        hasMore: false,
        executionTime,
        cached: false,
        timestamp: Date.now(),
        error: (error as Error).message,
      };

      return errorResponse;
    } finally {
      this.state.isSearching = false;
      this.state.currentQueryId = null;
      this.state.lastSearchTime = Date.now();
    }
  }

  /**
   * Recherche rapide avec paramètres minimaux
   */
  async quickSearch(
    queryText: string,
    type: SearchType = 'web',
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    const query: SearchQuery = {
      id: generateSearchQueryId(),
      query: queryText,
      type,
      options: { maxResults },
    };

    const response = await this.search(query);
    return response.results;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECHERCHE WEB
  // ─────────────────────────────────────────────────────────────────────────

  private async searchWeb(
    query: SearchQuery,
    provider: SearchProviderConfig
  ): Promise<SearchResponse> {
    // Créer un AbortController pour le timeout
    this.abortController = new AbortController();
    const timeout = query.options?.timeout ?? provider.timeout;

    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, timeout);

    try {
      // Incrémenter le rate limit
      this.incrementRateLimit(provider.id);

      // Appeler le backend Tauri pour la recherche web
      const results = await secureInvoke<SearchResult[]>('search_web', {
        provider: provider.id,
        query: query.query,
        searchType: query.type,
        maxResults: query.options?.maxResults ?? provider.maxResults,
        filters: query.filters ?? {},
      });

      clearTimeout(timeoutId);

      return {
        queryId: query.id,
        query: query.query,
        provider: provider.id,
        type: query.type,
        results: results.map((r, i) => ({
          ...r,
          id: `${query.id}_${i}`,
          source: provider.id,
          type: query.type,
          timestamp: Date.now(),
        })),
        totalResults: results.length,
        page: query.options?.page ?? 1,
        hasMore: results.length >= (query.options?.maxResults ?? provider.maxResults),
        executionTime: 0, // Sera mis à jour par l'appelant
        cached: false,
        timestamp: Date.now(),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Fallback: recherche simulée pour le développement
      if (import.meta.env.DEV) {
        console.warn('[SearchEngine] Using mock search results in dev mode');
        return this.mockSearchResults(query, provider);
      }

      throw error;
    }
  }

  /**
   * Résultats simulés pour le développement
   */
  private mockSearchResults(
    query: SearchQuery,
    provider: SearchProviderConfig
  ): SearchResponse {
    const mockResults: SearchResult[] = Array.from(
      { length: Math.min(5, query.options?.maxResults ?? 10) },
      (_, i) => ({
        id: `mock_${query.id}_${i}`,
        title: `Résultat ${i + 1} pour "${query.query}"`,
        url: `https://example.com/result/${i + 1}`,
        snippet: `Ceci est un résultat simulé pour la requête "${query.query}". Lorem ipsum dolor sit amet...`,
        source: provider.id,
        type: query.type,
        relevanceScore: 100 - i * 10,
        timestamp: Date.now(),
        metadata: {
          mock: true,
        },
      })
    );

    return {
      queryId: query.id,
      query: query.query,
      provider: provider.id,
      type: query.type,
      results: mockResults,
      totalResults: mockResults.length,
      page: 1,
      hasMore: false,
      executionTime: 100,
      cached: false,
      timestamp: Date.now(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECHERCHE LOCALE
  // ─────────────────────────────────────────────────────────────────────────

  private async searchLocal(
    query: SearchQuery,
    provider: SearchProviderConfig
  ): Promise<SearchResponse> {
    try {
      // Appeler le backend Tauri pour la recherche locale
      const results = await secureInvoke<SearchResult[]>('search_local', {
        query: query.query,
        path: query.filters?.domain?.[0] ?? '.',
        fileTypes: query.filters?.fileType ?? [],
        caseSensitive: false,
        maxResults: query.options?.maxResults ?? provider.maxResults,
      });

      return {
        queryId: query.id,
        query: query.query,
        provider: 'local',
        type: 'local',
        results: results.map((r, i) => ({
          ...r,
          id: `${query.id}_local_${i}`,
          source: 'local',
          type: 'local',
          timestamp: Date.now(),
        })),
        totalResults: results.length,
        page: 1,
        hasMore: false,
        executionTime: 0,
        cached: false,
        timestamp: Date.now(),
      };
    } catch (error) {
      // Fallback pour le dev
      if (import.meta.env.DEV) {
        console.warn('[SearchEngine] Using mock local search in dev mode');
        return this.mockLocalSearchResults(query);
      }
      throw error;
    }
  }

  private mockLocalSearchResults(query: SearchQuery): SearchResponse {
    const mockResults: SearchResult[] = [
      {
        id: `local_${query.id}_1`,
        title: 'src/App.tsx',
        url: 'file://src/App.tsx',
        snippet: `...${query.query}...`,
        source: 'local',
        type: 'local',
        relevanceScore: 95,
        timestamp: Date.now(),
        metadata: {
          lineNumber: 42,
          language: 'typescript',
        },
      },
    ];

    return {
      queryId: query.id,
      query: query.query,
      provider: 'local',
      type: 'local',
      results: mockResults,
      totalResults: mockResults.length,
      page: 1,
      hasMore: false,
      executionTime: 50,
      cached: false,
      timestamp: Date.now(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CACHE
  // ─────────────────────────────────────────────────────────────────────────

  private getCachedResponse(query: SearchQuery): SearchResponse | null {
    const key = generateSearchCacheKey(query);
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      cached.hits++;
      return cached.response;
    }

    // Expirer l'entrée
    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  private cacheResponse(query: SearchQuery, response: SearchResponse): void {
    // Vérifier la taille du cache
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestCache();
    }

    const key = generateSearchCacheKey(query);
    const ttl = query.options?.cacheTTL ?? this.config.cacheTTL;

    this.cache.set(key, {
      key,
      response,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl * 1000,
      hits: 0,
    });
  }

  private evictOldestCache(): void {
    let oldest: { key: string; createdAt: number } | null = null;

    for (const [key, entry] of this.cache) {
      if (!oldest || entry.createdAt < oldest.createdAt) {
        oldest = { key, createdAt: entry.createdAt };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
    }
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[SearchEngine] 🗑️ Cache cleared');
  }

  /**
   * Retourne les statistiques du cache
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    const total = this.stats.cacheHits + this.stats.cacheMisses;
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: total > 0 ? this.stats.cacheHits / total : 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RATE LIMITING
  // ─────────────────────────────────────────────────────────────────────────

  private initializeRateLimits(): void {
    this.rateLimits.clear();

    for (const provider of this.config.providers) {
      this.rateLimits.set(provider.id, {
        provider: provider.id,
        requestCount: 0,
        windowStart: Date.now(),
        blocked: false,
        blockUntil: 0,
      });
    }
  }

  private isRateLimited(providerId: SearchProvider): boolean {
    const info = this.rateLimits.get(providerId);
    if (!info) return false;

    const now = Date.now();

    // Vérifier si bloqué
    if (info.blocked && now < info.blockUntil) {
      return true;
    }

    // Réinitialiser si la fenêtre est passée
    if (now - info.windowStart > 60000) {
      info.requestCount = 0;
      info.windowStart = now;
      info.blocked = false;
    }

    // Vérifier la limite
    const provider = this.config.providers.find(p => p.id === providerId);
    if (provider && info.requestCount >= provider.rateLimit) {
      info.blocked = true;
      info.blockUntil = info.windowStart + 60000;
      return true;
    }

    return false;
  }

  private incrementRateLimit(providerId: SearchProvider): void {
    const info = this.rateLimits.get(providerId);
    if (info) {
      info.requestCount++;
    }
  }

  /**
   * Retourne l'état du rate limiting pour un provider
   */
  getRateLimitStatus(providerId: SearchProvider): ProviderRateLimitInfo | null {
    return this.rateLimits.get(providerId) ?? null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * S'abonne aux résultats de recherche
   */
  onSearchResult(callback: SearchCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * S'abonne aux erreurs de recherche
   */
  onSearchError(callback: SearchErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  private notifyCallbacks(response: SearchResponse): void {
    for (const callback of this.callbacks) {
      try {
        callback(response);
      } catch (error) {
        console.error('[SearchEngine] Callback error:', error);
      }
    }
  }

  private notifyErrorCallbacks(error: Error, query: SearchQuery): void {
    for (const callback of this.errorCallbacks) {
      try {
        callback(error, query);
      } catch (e) {
        console.error('[SearchEngine] Error callback error:', e);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTRÔLE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Annule la recherche en cours
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.state.isSearching = false;
      console.log('[SearchEngine] 🛑 Search aborted');
    }
  }

  /**
   * Retourne l'état actuel
   */
  getState(): SearchState {
    return { ...this.state };
  }

  /**
   * Vérifie si une recherche est en cours
   */
  isSearching(): boolean {
    return this.state.isSearching;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATISTIQUES
  // ─────────────────────────────────────────────────────────────────────────

  private updateStats(
    provider: string,
    type: string,
    executionTime: number,
    success: boolean
  ): void {
    if (success) {
      this.stats.successfulSearches++;
    }

    // Mettre à jour le temps de réponse moyen
    this.stats.totalResponseTime += executionTime;
    this.stats.avgResponseTime =
      this.stats.totalResponseTime / this.stats.successfulSearches;

    // Par provider
    this.stats.searchesByProvider[provider] =
      (this.stats.searchesByProvider[provider] ?? 0) + 1;

    // Par type
    this.stats.searchesByType[type] = (this.stats.searchesByType[type] ?? 0) + 1;
  }

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
      totalSearches: 0,
      successfulSearches: 0,
      failedSearches: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      searchesByProvider: {},
      searchesByType: {},
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PROVIDERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne la liste des providers disponibles
   */
  getAvailableProviders(): SearchProviderConfig[] {
    return this.config.providers.filter(p => p.enabled);
  }

  /**
   * Retourne les providers supportant un type de recherche
   */
  getProvidersForType(type: SearchType): SearchProviderConfig[] {
    return this.config.providers.filter(
      p => p.enabled && p.supportedTypes.includes(type)
    );
  }

  /**
   * Vérifie si un provider est disponible (enabled et non rate-limited)
   */
  isProviderAvailable(providerId: SearchProvider): boolean {
    const provider = this.config.providers.find(p => p.id === providerId);
    if (!provider?.enabled) return false;
    return !this.isRateLimited(providerId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const searchEngine = SearchEngine.getInstance();

export default SearchEngine;
