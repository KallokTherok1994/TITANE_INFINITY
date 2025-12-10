/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SEARCH + TOOLS ENGINE — Exports Principaux
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Point d'entrée unique pour le Search + Tools Engine.
 *
 * @module searchTools
 * @version Ω∞+
 */

// ─────────────────────────────────────────────────────────────────────────
// TYPES ET CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────

export type {
  // Types de base
  IAMode,
  PermissionLevel,
  ToolCategory,
  RiskLevel,

  // Types Search
  SearchProvider,
  SearchType,
  SearchProviderConfig,
  SearchQuery,
  SearchFilters,
  SearchOptions,
  SearchResult,
  SearchResponse,
  SearchCache,
  SearchEngineConfig,

  // Types Tools
  ToolDefinition,
  ToolInputSchema,
  ToolParameterSchema,
  ToolOutputSchema,
  ToolInvocation,
  ToolExecutionResult,
  ToolExecutionLog,
  ToolUndoState,
  ToolsEngineConfig,
  SandboxConfig,

  // Types Permission
  PermissionMatrix,
  PermissionRule,
  PermissionCondition,
  PermissionRequest,
  PermissionDecision,
  PermissionManagerConfig,

  // Types Formatter
  OutputFormat,
  FormatterConfig,
  FormattedResult,

  // Config globale
  SearchToolsConfig,
} from './searchTools.config';

// ─────────────────────────────────────────────────────────────────────────
// CONSTANTES ET DEFAULTS
// ─────────────────────────────────────────────────────────────────────────

export {
  // Defaults
  DEFAULT_SEARCH_TOOLS_CONFIG,
  DEFAULT_SEARCH_ENGINE_CONFIG,
  DEFAULT_TOOLS_ENGINE_CONFIG,
  DEFAULT_PERMISSION_MANAGER_CONFIG,
  DEFAULT_SANDBOX_CONFIG,
  DEFAULT_FORMATTER_CONFIG,
  DEFAULT_SEARCH_PROVIDERS,
  DEFAULT_PERMISSION_MATRIX,

  // Constantes
  PERMISSION_LEVEL_PRIORITY,
  RISK_WEIGHTS,
  CATEGORY_MIN_MODE,
  BUILTIN_TOOLS,

  // Fonctions utilitaires
  generateSearchQueryId,
  generateToolInvocationId,
  generatePermissionRequestId,
  generateUndoToken,
  hasPermission,
  hasModeAccess,
  getEffectivePermission,
  calculateToolRiskScore,
  filterToolsByMode,
  findToolById,
  findSearchProvider,
  selectBestProvider,
  validateToolInput,
  generateSearchCacheKey,
} from './searchTools.config';

// ─────────────────────────────────────────────────────────────────────────
// CLASSES ET SINGLETONS
// ─────────────────────────────────────────────────────────────────────────

// Permission Manager
export { PermissionManager, permissionManager } from './permissionManager';

// Search Engine
export { SearchEngine, searchEngine } from './searchEngine';

// Tools Engine
export { ToolsEngine, toolsEngine } from './toolsEngine';

// ─────────────────────────────────────────────────────────────────────────
// ORCHESTRATEUR
// ─────────────────────────────────────────────────────────────────────────

import { PermissionManager } from './permissionManager';
import { SearchEngine } from './searchEngine';
import { ToolsEngine } from './toolsEngine';
import type {
  IAMode,
  SearchQuery,
  SearchResponse,
  ToolExecutionResult,
} from './searchTools.config';

/**
 * SearchToolsOrchestrator — Façade unifiée
 *
 * Fournit une interface simplifiée pour utiliser Search + Tools Engine.
 */
export class SearchToolsOrchestrator {
  private static instance: SearchToolsOrchestrator | null = null;

  private permissionManager: PermissionManager;
  private searchEngine: SearchEngine;
  private toolsEngine: ToolsEngine;

  private constructor() {
    this.permissionManager = PermissionManager.getInstance();
    this.searchEngine = SearchEngine.getInstance();
    this.toolsEngine = ToolsEngine.getInstance();

    console.log('[SearchToolsOrchestrator] 🎯 Initialized');
  }

  static getInstance(): SearchToolsOrchestrator {
    if (!SearchToolsOrchestrator.instance) {
      SearchToolsOrchestrator.instance = new SearchToolsOrchestrator();
    }
    return SearchToolsOrchestrator.instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODE IA
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Définit le mode IA actif
   */
  setMode(mode: IAMode): void {
    this.permissionManager.setMode(mode);
    console.log(`[Orchestrator] Mode set to: ${mode}`);
  }

  /**
   * Retourne le mode IA actif
   */
  getMode(): IAMode {
    return this.permissionManager.getMode();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECHERCHE RAPIDE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Effectue une recherche web rapide
   */
  async searchWeb(query: string, maxResults = 10): Promise<SearchResponse> {
    return this.searchEngine.search({
      id: `quick_${Date.now()}`,
      query,
      type: 'web',
      options: { maxResults },
    });
  }

  /**
   * Effectue une recherche locale
   */
  async searchLocal(query: string, path = '.'): Promise<SearchResponse> {
    return this.searchEngine.search({
      id: `local_${Date.now()}`,
      query,
      type: 'local',
      filters: { domain: [path] },
    });
  }

  /**
   * Recherche avancée
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    return this.searchEngine.search(query);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OUTILS RAPIDES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Lit un fichier
   */
  async readFile(path: string): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('file_read', { path });
  }

  /**
   * Écrit dans un fichier
   */
  async writeFile(path: string, content: string): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('file_write', { path, content });
  }

  /**
   * Liste un répertoire
   */
  async listDir(path = '.'): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('file_list', { path });
  }

  /**
   * Analyse du code
   */
  async analyzeCode(path: string): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('code_analyze', { path });
  }

  /**
   * Invoque un outil quelconque
   */
  async invokeTool(
    toolId: string,
    input: Record<string, unknown>
  ): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool(toolId, input);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Hash une chaîne
   */
  async hash(input: string, algorithm = 'sha256'): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('util_hash', { input, algorithm });
  }

  /**
   * Encode/décode une chaîne
   */
  async encode(
    input: string,
    format: 'base64' | 'url' | 'html' | 'hex' = 'base64'
  ): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('util_encode', {
      input,
      operation: 'encode',
      format,
    });
  }

  async decode(
    input: string,
    format: 'base64' | 'url' | 'html' | 'hex' = 'base64'
  ): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('util_encode', {
      input,
      operation: 'decode',
      format,
    });
  }

  /**
   * Parse/formate du JSON
   */
  async parseJson(input: string): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('util_json', {
      input,
      operation: 'parse',
    });
  }

  async formatJson(input: string, indent = 2): Promise<ToolExecutionResult> {
    return this.toolsEngine.invokeTool('util_json', {
      input,
      operation: 'format',
      indent,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACCÈS AUX ENGINES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne le Permission Manager
   */
  getPermissionManager(): PermissionManager {
    return this.permissionManager;
  }

  /**
   * Retourne le Search Engine
   */
  getSearchEngine(): SearchEngine {
    return this.searchEngine;
  }

  /**
   * Retourne le Tools Engine
   */
  getToolsEngine(): ToolsEngine {
    return this.toolsEngine;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INFO ET STATS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne les outils accessibles pour le mode actuel
   */
  getAccessibleTools() {
    return this.toolsEngine.getAccessibleTools();
  }

  /**
   * Retourne les providers de recherche disponibles
   */
  getSearchProviders() {
    return this.searchEngine.getAvailableProviders();
  }

  /**
   * Retourne les statistiques combinées
   */
  getStats() {
    return {
      permissions: this.permissionManager.getStats(),
      search: this.searchEngine.getStats(),
      tools: this.toolsEngine.getStats(),
    };
  }

  /**
   * Retourne un résumé de l'état
   */
  getStatus() {
    return {
      mode: this.permissionManager.getMode(),
      isSearching: this.searchEngine.isSearching(),
      isExecuting: this.toolsEngine.isExecuting(),
      accessibleTools: this.toolsEngine.getAccessibleTools().length,
      availableProviders: this.searchEngine.getAvailableProviders().length,
    };
  }
}

// Singleton
export const searchToolsOrchestrator = SearchToolsOrchestrator.getInstance();

// ─────────────────────────────────────────────────────────────────────────
// EXPORT PAR DÉFAUT
// ─────────────────────────────────────────────────────────────────────────

export default {
  // Orchestrator
  SearchToolsOrchestrator,
  searchToolsOrchestrator,

  // Engines
  PermissionManager,
  SearchEngine,
  ToolsEngine,
};
