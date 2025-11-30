/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SEARCH + TOOLS ENGINE — Configuration & Types
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SUPER PROMPT #6 — SEARCH + TOOLS ENGINE TITANE∞ vΩ∞+
 *
 * Moteur hybride de recherche web et d'outils locaux avec gouvernance
 * par mode IA (Standard, Dev, Architect, Autonomous).
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    SEARCH + TOOLS ENGINE                        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  ┌─────────────────┐    ┌─────────────────┐                    │
 * │  │  Search Engine  │    │  Tools Engine   │                    │
 * │  │  (Web/Local)    │    │  (Local Only)   │                    │
 * │  └────────┬────────┘    └────────┬────────┘                    │
 * │           │                      │                              │
 * │           └──────────┬───────────┘                              │
 * │                      ▼                                          │
 * │           ┌─────────────────────┐                               │
 * │           │ Permission Manager  │                               │
 * │           │ (Mode-Based Access) │                               │
 * │           └─────────────────────┘                               │
 * │                      │                                          │
 * │           ┌──────────┴──────────┐                               │
 * │           ▼                     ▼                               │
 * │    ┌────────────┐       ┌────────────┐                          │
 * │    │ Execution  │       │ Result     │                          │
 * │    │ Sandbox    │       │ Formatter  │                          │
 * │    └────────────┘       └────────────┘                          │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * @module searchTools.config
 * @version Ω∞+
 */

// =============================================================================
// TYPES DE BASE — MODE IA
// =============================================================================

/**
 * Modes IA disponibles dans TITANE∞
 * Chaque mode a des permissions différentes pour les outils
 */
export type IAMode = 'standard' | 'dev' | 'architect' | 'autonomous';

/**
 * Niveau de permission pour les outils
 */
export type PermissionLevel = 'none' | 'read' | 'write' | 'execute' | 'admin';

/**
 * Catégorie d'outil
 */
export type ToolCategory =
  | 'search'        // Recherche web
  | 'file'          // Opérations fichiers
  | 'code'          // Analyse/génération de code
  | 'system'        // Commandes système
  | 'network'       // Requêtes réseau
  | 'database'      // Accès base de données
  | 'ai'            // Appels IA externes
  | 'automation'    // Scripts d'automatisation
  | 'security'      // Outils de sécurité
  | 'utility';      // Utilitaires divers

/**
 * Niveau de risque d'un outil
 */
export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

// =============================================================================
// TYPES SEARCH ENGINE
// =============================================================================

/**
 * Provider de recherche web supporté
 */
export type SearchProvider =
  | 'duckduckgo'
  | 'google'
  | 'bing'
  | 'brave'
  | 'searxng'
  | 'local';  // Recherche locale dans les fichiers

/**
 * Type de recherche
 */
export type SearchType =
  | 'web'           // Recherche web générale
  | 'images'        // Recherche d'images
  | 'news'          // Actualités
  | 'code'          // Recherche de code (GitHub, etc.)
  | 'docs'          // Documentation
  | 'local'         // Fichiers locaux
  | 'semantic';     // Recherche sémantique

/**
 * Configuration d'un provider de recherche
 */
export interface SearchProviderConfig {
  id: SearchProvider;
  name: string;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  maxResults: number;
  timeout: number;
  rateLimit: number;  // requêtes par minute
  supportedTypes: SearchType[];
  priority: number;   // 1 = plus haute priorité
}

/**
 * Requête de recherche
 */
export interface SearchQuery {
  id: string;
  query: string;
  type: SearchType;
  provider?: SearchProvider;  // Auto-sélection si non spécifié
  filters?: SearchFilters;
  options?: SearchOptions;
  metadata?: Record<string, unknown>;
}

/**
 * Filtres de recherche
 */
export interface SearchFilters {
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  domain?: string[];       // Domaines à inclure
  excludeDomains?: string[]; // Domaines à exclure
  language?: string;
  region?: string;
  safeSearch?: 'off' | 'moderate' | 'strict';
  fileType?: string[];     // Pour recherche fichiers
  codeLanguage?: string[]; // Pour recherche code
}

/**
 * Options de recherche
 */
export interface SearchOptions {
  maxResults?: number;
  page?: number;
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;  // en secondes
  includeSnippets?: boolean;
  includeMetadata?: boolean;
}

/**
 * Résultat de recherche individuel
 */
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: SearchProvider;
  type: SearchType;
  relevanceScore: number;  // 0-100
  timestamp: number;
  metadata?: {
    favicon?: string;
    image?: string;
    author?: string;
    publishDate?: string;
    language?: string;
    wordCount?: number;
    [key: string]: unknown;
  };
}

/**
 * Réponse de recherche complète
 */
export interface SearchResponse {
  queryId: string;
  query: string;
  provider: SearchProvider;
  type: SearchType;
  results: SearchResult[];
  totalResults: number;
  page: number;
  hasMore: boolean;
  executionTime: number;
  cached: boolean;
  timestamp: number;
  error?: string;
}

/**
 * Cache de recherche
 */
export interface SearchCache {
  key: string;
  response: SearchResponse;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

// =============================================================================
// TYPES TOOLS ENGINE
// =============================================================================

/**
 * Définition d'un outil
 */
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  version: string;
  author: string;

  // Permissions requises
  requiredPermissions: PermissionLevel[];
  minIAMode: IAMode;  // Mode minimum requis

  // Risque et sécurité
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
  canUndo: boolean;

  // Schéma d'entrée/sortie
  inputSchema: ToolInputSchema;
  outputSchema: ToolOutputSchema;

  // Métadonnées
  tags: string[];
  enabled: boolean;
  deprecated: boolean;
  deprecationMessage?: string;

  // Statistiques d'utilisation
  usageCount: number;
  lastUsed?: number;
  avgExecutionTime: number;
  successRate: number;
}

/**
 * Schéma d'entrée d'un outil
 */
export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, ToolParameterSchema>;
  required: string[];
  additionalProperties?: boolean;
}

/**
 * Schéma d'un paramètre d'outil
 */
export interface ToolParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: ToolParameterSchema;
  properties?: Record<string, ToolParameterSchema>;
}

/**
 * Schéma de sortie d'un outil
 */
export interface ToolOutputSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'void';
  description: string;
  properties?: Record<string, ToolParameterSchema>;
}

/**
 * Invocation d'un outil
 */
export interface ToolInvocation {
  id: string;
  toolId: string;
  input: Record<string, unknown>;
  invokedBy: 'user' | 'ia' | 'automation' | 'system';
  iaMode: IAMode;
  timestamp: number;
  confirmed: boolean;
  timeout?: number;
}

/**
 * Résultat d'exécution d'un outil
 */
export interface ToolExecutionResult {
  invocationId: string;
  toolId: string;
  success: boolean;
  output?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  executionTime: number;
  memoryUsed?: number;
  logs: ToolExecutionLog[];
  undoAvailable: boolean;
  undoToken?: string;
}

/**
 * Log d'exécution d'un outil
 */
export interface ToolExecutionLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  data?: unknown;
}

/**
 * État d'annulation d'une action
 */
export interface ToolUndoState {
  token: string;
  toolId: string;
  invocationId: string;
  originalState: unknown;
  createdAt: number;
  expiresAt: number;
  executed: boolean;
}

// =============================================================================
// TYPES PERMISSION MANAGER
// =============================================================================

/**
 * Matrice de permissions par mode IA
 */
export interface PermissionMatrix {
  [mode: string]: {
    [category: string]: PermissionLevel;
  };
}

/**
 * Règle de permission personnalisée
 */
export interface PermissionRule {
  id: string;
  name: string;
  description: string;
  condition: PermissionCondition;
  effect: 'allow' | 'deny';
  priority: number;  // Plus élevé = plus prioritaire
  enabled: boolean;
}

/**
 * Condition de permission
 */
export interface PermissionCondition {
  type: 'mode' | 'category' | 'tool' | 'time' | 'context' | 'custom';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'matches' | 'custom';
  value: unknown;
  customEvaluator?: string;  // Nom de la fonction d'évaluation
}

/**
 * Demande de permission
 */
export interface PermissionRequest {
  id: string;
  toolId: string;
  category: ToolCategory;
  iaMode: IAMode;
  requestedLevel: PermissionLevel;
  reason: string;
  context: Record<string, unknown>;
  timestamp: number;
}

/**
 * Décision de permission
 */
export interface PermissionDecision {
  requestId: string;
  granted: boolean;
  effectiveLevel: PermissionLevel;
  reason: string;
  appliedRules: string[];
  requiresConfirmation: boolean;
  expiresAt?: number;
}

// =============================================================================
// TYPES EXECUTION SANDBOX
// =============================================================================

/**
 * Configuration du sandbox d'exécution
 */
export interface SandboxConfig {
  enabled: boolean;
  maxExecutionTime: number;  // ms
  maxMemory: number;         // bytes
  allowedModules: string[];
  blockedModules: string[];
  networkAccess: boolean;
  fileSystemAccess: 'none' | 'read' | 'write' | 'full';
  allowedPaths: string[];
  blockedPaths: string[];
}

/**
 * État du sandbox
 */
export interface SandboxState {
  id: string;
  active: boolean;
  startTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeProcesses: number;
  violations: SandboxViolation[];
}

/**
 * Violation du sandbox
 */
export interface SandboxViolation {
  type: 'timeout' | 'memory' | 'network' | 'filesystem' | 'module' | 'security';
  message: string;
  timestamp: number;
  severity: RiskLevel;
  blocked: boolean;
}

// =============================================================================
// TYPES RESULT FORMATTER
// =============================================================================

/**
 * Format de sortie des résultats
 */
export type OutputFormat =
  | 'text'
  | 'markdown'
  | 'json'
  | 'html'
  | 'table'
  | 'code'
  | 'structured';

/**
 * Configuration du formateur de résultats
 */
export interface FormatterConfig {
  defaultFormat: OutputFormat;
  maxLength?: number;
  truncateWith?: string;
  includeMetadata: boolean;
  syntaxHighlight: boolean;
  linkify: boolean;
  sanitize: boolean;
}

/**
 * Résultat formaté
 */
export interface FormattedResult {
  format: OutputFormat;
  content: string;
  rawContent?: unknown;
  metadata?: {
    length: number;
    truncated: boolean;
    processingTime: number;
  };
}

// =============================================================================
// CONFIGURATION GLOBALE
// =============================================================================

/**
 * Configuration du Search Engine
 */
export interface SearchEngineConfig {
  enabled: boolean;
  defaultProvider: SearchProvider;
  providers: SearchProviderConfig[];
  cacheEnabled: boolean;
  cacheTTL: number;  // secondes
  maxCacheSize: number;  // nombre d'entrées
  retryAttempts: number;
  retryDelay: number;  // ms
  userAgent: string;
  respectRobotsTxt: boolean;
}

/**
 * Configuration du Tools Engine
 */
export interface ToolsEngineConfig {
  enabled: boolean;
  sandbox: SandboxConfig;
  formatter: FormatterConfig;
  maxConcurrentTools: number;
  defaultTimeout: number;
  confirmationRequired: boolean;
  undoHistorySize: number;
  auditLogging: boolean;
}

/**
 * Configuration du Permission Manager
 */
export interface PermissionManagerConfig {
  enabled: boolean;
  defaultLevel: PermissionLevel;
  strictMode: boolean;  // Refuse tout ce qui n'est pas explicitement autorisé
  matrix: PermissionMatrix;
  customRules: PermissionRule[];
  cacheDecisions: boolean;
  decisionCacheTTL: number;
}

/**
 * Configuration globale Search + Tools
 */
export interface SearchToolsConfig {
  search: SearchEngineConfig;
  tools: ToolsEngineConfig;
  permissions: PermissionManagerConfig;
}

// =============================================================================
// CONSTANTES — PERMISSIONS PAR MODE
// =============================================================================

/**
 * Matrice de permissions par défaut
 */
export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = {
  standard: {
    search: 'read',
    file: 'read',
    code: 'read',
    system: 'none',
    network: 'read',
    database: 'none',
    ai: 'read',
    automation: 'none',
    security: 'none',
    utility: 'read',
  },
  dev: {
    search: 'read',
    file: 'write',
    code: 'execute',
    system: 'read',
    network: 'read',
    database: 'read',
    ai: 'execute',
    automation: 'read',
    security: 'read',
    utility: 'execute',
  },
  architect: {
    search: 'execute',
    file: 'write',
    code: 'execute',
    system: 'execute',
    network: 'execute',
    database: 'write',
    ai: 'execute',
    automation: 'execute',
    security: 'execute',
    utility: 'execute',
  },
  autonomous: {
    search: 'admin',
    file: 'admin',
    code: 'admin',
    system: 'admin',
    network: 'admin',
    database: 'admin',
    ai: 'admin',
    automation: 'admin',
    security: 'admin',
    utility: 'admin',
  },
};

/**
 * Priorité des niveaux de permission (pour comparaison)
 */
export const PERMISSION_LEVEL_PRIORITY: Record<PermissionLevel, number> = {
  none: 0,
  read: 1,
  write: 2,
  execute: 3,
  admin: 4,
};

/**
 * Poids de risque pour calcul de score
 */
export const RISK_WEIGHTS: Record<RiskLevel, number> = {
  safe: 0,
  low: 10,
  medium: 25,
  high: 50,
  critical: 100,
};

/**
 * Mode IA minimum requis par catégorie
 */
export const CATEGORY_MIN_MODE: Record<ToolCategory, IAMode> = {
  search: 'standard',
  file: 'standard',
  code: 'dev',
  system: 'architect',
  network: 'dev',
  database: 'dev',
  ai: 'standard',
  automation: 'dev',
  security: 'architect',
  utility: 'standard',
};

// =============================================================================
// VALEURS PAR DÉFAUT
// =============================================================================

/**
 * Configuration par défaut des providers de recherche
 */
export const DEFAULT_SEARCH_PROVIDERS: SearchProviderConfig[] = [
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    enabled: true,
    baseUrl: 'https://api.duckduckgo.com/',
    maxResults: 25,
    timeout: 10000,
    rateLimit: 30,
    supportedTypes: ['web', 'images', 'news'],
    priority: 1,
  },
  {
    id: 'brave',
    name: 'Brave Search',
    enabled: true,
    baseUrl: 'https://api.search.brave.com/res/v1/',
    maxResults: 20,
    timeout: 10000,
    rateLimit: 15,
    supportedTypes: ['web', 'images', 'news', 'code'],
    priority: 2,
  },
  {
    id: 'searxng',
    name: 'SearXNG (Self-hosted)',
    enabled: false,
    baseUrl: 'http://localhost:8080/',
    maxResults: 30,
    timeout: 15000,
    rateLimit: 60,
    supportedTypes: ['web', 'images', 'news', 'code', 'docs'],
    priority: 3,
  },
  {
    id: 'local',
    name: 'Local Search',
    enabled: true,
    maxResults: 100,
    timeout: 5000,
    rateLimit: 100,
    supportedTypes: ['local', 'code', 'docs'],
    priority: 0,  // Toujours disponible
  },
];

/**
 * Configuration par défaut du sandbox
 */
export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  enabled: true,
  maxExecutionTime: 30000,  // 30 secondes
  maxMemory: 256 * 1024 * 1024,  // 256 MB
  allowedModules: ['path', 'url', 'querystring', 'crypto'],
  blockedModules: ['child_process', 'fs', 'net', 'http', 'https'],
  networkAccess: false,
  fileSystemAccess: 'none',
  allowedPaths: [],
  blockedPaths: ['/', '/etc', '/var', '/usr'],
};

/**
 * Configuration par défaut du formateur
 */
export const DEFAULT_FORMATTER_CONFIG: FormatterConfig = {
  defaultFormat: 'markdown',
  maxLength: 10000,
  truncateWith: '...[truncated]',
  includeMetadata: true,
  syntaxHighlight: true,
  linkify: true,
  sanitize: true,
};

/**
 * Configuration par défaut du Search Engine
 */
export const DEFAULT_SEARCH_ENGINE_CONFIG: SearchEngineConfig = {
  enabled: true,
  defaultProvider: 'duckduckgo',
  providers: DEFAULT_SEARCH_PROVIDERS,
  cacheEnabled: true,
  cacheTTL: 3600,  // 1 heure
  maxCacheSize: 1000,
  retryAttempts: 3,
  retryDelay: 1000,
  userAgent: 'TITANE-Infinity/1.0 SearchBot',
  respectRobotsTxt: true,
};

/**
 * Configuration par défaut du Tools Engine
 */
export const DEFAULT_TOOLS_ENGINE_CONFIG: ToolsEngineConfig = {
  enabled: true,
  sandbox: DEFAULT_SANDBOX_CONFIG,
  formatter: DEFAULT_FORMATTER_CONFIG,
  maxConcurrentTools: 3,
  defaultTimeout: 30000,
  confirmationRequired: true,
  undoHistorySize: 50,
  auditLogging: true,
};

/**
 * Configuration par défaut du Permission Manager
 * NOTE: matrix utilise une copie profonde pour éviter les mutations globales
 */
export const DEFAULT_PERMISSION_MANAGER_CONFIG: PermissionManagerConfig = {
  enabled: true,
  defaultLevel: 'none',
  strictMode: true,
  matrix: JSON.parse(JSON.stringify(DEFAULT_PERMISSION_MATRIX)) as PermissionMatrix,
  customRules: [],
  cacheDecisions: true,
  decisionCacheTTL: 300,  // 5 minutes
};

/**
 * Configuration globale par défaut
 */
export const DEFAULT_SEARCH_TOOLS_CONFIG: SearchToolsConfig = {
  search: DEFAULT_SEARCH_ENGINE_CONFIG,
  tools: DEFAULT_TOOLS_ENGINE_CONFIG,
  permissions: DEFAULT_PERMISSION_MANAGER_CONFIG,
};

// =============================================================================
// OUTILS INTÉGRÉS — CATALOGUE
// =============================================================================

/**
 * Catalogue des outils intégrés
 */
export const BUILTIN_TOOLS: ToolDefinition[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // OUTILS DE RECHERCHE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'web_search',
    name: 'Recherche Web',
    description: 'Effectue une recherche sur le web via les providers configurés',
    category: 'search',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'standard',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Requête de recherche' },
        provider: { type: 'string', description: 'Provider à utiliser', enum: ['duckduckgo', 'brave', 'searxng'] },
        maxResults: { type: 'number', description: 'Nombre max de résultats', default: 10, minimum: 1, maximum: 50 },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'object',
      description: 'Résultats de recherche',
    },
    tags: ['search', 'web', 'internet'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 2000,
    successRate: 0.95,
  },
  {
    id: 'local_search',
    name: 'Recherche Locale',
    description: 'Recherche dans les fichiers du projet',
    category: 'search',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'standard',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Terme à rechercher' },
        path: { type: 'string', description: 'Chemin de recherche', default: '.' },
        fileTypes: { type: 'array', description: 'Types de fichiers', items: { type: 'string', description: 'Extension de fichier' } },
        caseSensitive: { type: 'boolean', description: 'Sensible à la casse', default: false },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'array',
      description: 'Fichiers correspondants avec contexte',
    },
    tags: ['search', 'local', 'files'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 500,
    successRate: 0.99,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OUTILS FICHIERS
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'file_read',
    name: 'Lire Fichier',
    description: 'Lit le contenu d\'un fichier',
    category: 'file',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'standard',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Chemin du fichier' },
        encoding: { type: 'string', description: 'Encodage', default: 'utf-8' },
        startLine: { type: 'number', description: 'Ligne de début (optionnel)' },
        endLine: { type: 'number', description: 'Ligne de fin (optionnel)' },
      },
      required: ['path'],
    },
    outputSchema: {
      type: 'string',
      description: 'Contenu du fichier',
    },
    tags: ['file', 'read', 'content'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 100,
    successRate: 0.98,
  },
  {
    id: 'file_write',
    name: 'Écrire Fichier',
    description: 'Écrit ou modifie un fichier',
    category: 'file',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['write'],
    minIAMode: 'dev',
    riskLevel: 'medium',
    requiresConfirmation: true,
    canUndo: true,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Chemin du fichier' },
        content: { type: 'string', description: 'Contenu à écrire' },
        mode: { type: 'string', description: 'Mode d\'écriture', enum: ['write', 'append', 'prepend'], default: 'write' },
        createDirs: { type: 'boolean', description: 'Créer les répertoires parents', default: true },
      },
      required: ['path', 'content'],
    },
    outputSchema: {
      type: 'object',
      description: 'Résultat de l\'écriture',
    },
    tags: ['file', 'write', 'edit'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 150,
    successRate: 0.95,
  },
  {
    id: 'file_list',
    name: 'Lister Répertoire',
    description: 'Liste le contenu d\'un répertoire',
    category: 'file',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'standard',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Chemin du répertoire', default: '.' },
        recursive: { type: 'boolean', description: 'Récursif', default: false },
        includeHidden: { type: 'boolean', description: 'Inclure fichiers cachés', default: false },
        pattern: { type: 'string', description: 'Pattern glob (optionnel)' },
      },
      required: [],
    },
    outputSchema: {
      type: 'array',
      description: 'Liste des fichiers/dossiers',
    },
    tags: ['file', 'list', 'directory'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 200,
    successRate: 0.99,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OUTILS CODE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'code_analyze',
    name: 'Analyser Code',
    description: 'Analyse statique d\'un fichier de code',
    category: 'code',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'dev',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Chemin du fichier' },
        language: { type: 'string', description: 'Langage (auto-détecté si omis)' },
        checks: { type: 'array', description: 'Types de vérifications', items: { type: 'string', description: 'Type de check' } },
      },
      required: ['path'],
    },
    outputSchema: {
      type: 'object',
      description: 'Rapport d\'analyse',
    },
    tags: ['code', 'analyze', 'lint'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 1000,
    successRate: 0.95,
  },
  {
    id: 'code_execute',
    name: 'Exécuter Code',
    description: 'Exécute un snippet de code dans un sandbox',
    category: 'code',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['execute'],
    minIAMode: 'dev',
    riskLevel: 'high',
    requiresConfirmation: true,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code à exécuter' },
        language: { type: 'string', description: 'Langage', enum: ['javascript', 'typescript', 'python', 'rust'] },
        timeout: { type: 'number', description: 'Timeout en ms', default: 5000 },
        args: { type: 'array', description: 'Arguments', items: { type: 'string', description: 'Argument' } },
      },
      required: ['code', 'language'],
    },
    outputSchema: {
      type: 'object',
      description: 'Résultat d\'exécution',
    },
    tags: ['code', 'execute', 'run'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 3000,
    successRate: 0.85,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OUTILS SYSTÈME
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'system_info',
    name: 'Info Système',
    description: 'Récupère les informations système',
    category: 'system',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'dev',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        include: { type: 'array', description: 'Sections à inclure', items: { type: 'string', description: 'Section' } },
      },
      required: [],
    },
    outputSchema: {
      type: 'object',
      description: 'Informations système',
    },
    tags: ['system', 'info', 'hardware'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 500,
    successRate: 0.99,
  },
  {
    id: 'system_command',
    name: 'Commande Système',
    description: 'Exécute une commande shell',
    category: 'system',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['execute'],
    minIAMode: 'architect',
    riskLevel: 'critical',
    requiresConfirmation: true,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Commande à exécuter' },
        cwd: { type: 'string', description: 'Répertoire de travail' },
        timeout: { type: 'number', description: 'Timeout en ms', default: 30000 },
        env: { type: 'object', description: 'Variables d\'environnement' },
      },
      required: ['command'],
    },
    outputSchema: {
      type: 'object',
      description: 'Sortie de la commande',
    },
    tags: ['system', 'shell', 'command'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 5000,
    successRate: 0.90,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OUTILS UTILITAIRES
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'util_hash',
    name: 'Calculer Hash',
    description: 'Calcule le hash d\'une chaîne ou fichier',
    category: 'utility',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'standard',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Chaîne ou chemin de fichier' },
        algorithm: { type: 'string', description: 'Algorithme', enum: ['md5', 'sha1', 'sha256', 'sha512'], default: 'sha256' },
        isFile: { type: 'boolean', description: 'Input est un fichier', default: false },
      },
      required: ['input'],
    },
    outputSchema: {
      type: 'string',
      description: 'Hash calculé',
    },
    tags: ['utility', 'hash', 'crypto'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 50,
    successRate: 0.99,
  },
  {
    id: 'util_encode',
    name: 'Encoder/Décoder',
    description: 'Encode ou décode une chaîne',
    category: 'utility',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'standard',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Chaîne à traiter' },
        operation: { type: 'string', description: 'Opération', enum: ['encode', 'decode'] },
        format: { type: 'string', description: 'Format', enum: ['base64', 'url', 'html', 'hex'], default: 'base64' },
      },
      required: ['input', 'operation'],
    },
    outputSchema: {
      type: 'string',
      description: 'Résultat encodé/décodé',
    },
    tags: ['utility', 'encode', 'decode'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 10,
    successRate: 0.99,
  },
  {
    id: 'util_json',
    name: 'Traiter JSON',
    description: 'Parse, formate ou transforme du JSON',
    category: 'utility',
    version: '1.0.0',
    author: 'TITANE∞',
    requiredPermissions: ['read'],
    minIAMode: 'standard',
    riskLevel: 'safe',
    requiresConfirmation: false,
    canUndo: false,
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'JSON en entrée' },
        operation: { type: 'string', description: 'Opération', enum: ['parse', 'stringify', 'format', 'minify', 'query'] },
        query: { type: 'string', description: 'JSONPath query (si operation=query)' },
        indent: { type: 'number', description: 'Indentation', default: 2 },
      },
      required: ['input', 'operation'],
    },
    outputSchema: {
      type: 'object',
      description: 'Résultat JSON',
    },
    tags: ['utility', 'json', 'transform'],
    enabled: true,
    deprecated: false,
    usageCount: 0,
    avgExecutionTime: 20,
    successRate: 0.98,
  },
];

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Génère un ID unique pour une requête de recherche
 */
export function generateSearchQueryId(): string {
  return `search_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Génère un ID unique pour une invocation d'outil
 */
export function generateToolInvocationId(): string {
  return `tool_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Génère un ID unique pour une demande de permission
 */
export function generatePermissionRequestId(): string {
  return `perm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Génère un token d'annulation
 */
export function generateUndoToken(): string {
  return `undo_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Vérifie si un niveau de permission est suffisant
 */
export function hasPermission(
  required: PermissionLevel,
  current: PermissionLevel
): boolean {
  return PERMISSION_LEVEL_PRIORITY[current] >= PERMISSION_LEVEL_PRIORITY[required];
}

/**
 * Vérifie si un mode IA est suffisant
 */
export function hasModeAccess(required: IAMode, current: IAMode): boolean {
  const modeOrder: IAMode[] = ['standard', 'dev', 'architect', 'autonomous'];
  return modeOrder.indexOf(current) >= modeOrder.indexOf(required);
}

/**
 * Récupère la permission effective pour une catégorie et un mode
 */
export function getEffectivePermission(
  matrix: PermissionMatrix,
  mode: IAMode,
  category: ToolCategory
): PermissionLevel {
  return matrix[mode]?.[category] ?? 'none';
}

/**
 * Calcule le score de risque d'un outil
 */
export function calculateToolRiskScore(tool: ToolDefinition): number {
  let score = RISK_WEIGHTS[tool.riskLevel];

  // Ajustements
  if (tool.requiresConfirmation) score -= 10;
  if (tool.canUndo) score -= 5;
  if (tool.deprecated) score += 20;

  // Permissions requises
  const maxPerm = Math.max(
    ...tool.requiredPermissions.map(p => PERMISSION_LEVEL_PRIORITY[p])
  );
  score += maxPerm * 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Filtre les outils accessibles pour un mode IA
 */
export function filterToolsByMode(
  tools: ToolDefinition[],
  mode: IAMode,
  matrix: PermissionMatrix
): ToolDefinition[] {
  return tools.filter(tool => {
    // Vérifier le mode minimum
    if (!hasModeAccess(tool.minIAMode, mode)) return false;

    // Vérifier les permissions
    const permission = getEffectivePermission(matrix, mode, tool.category);
    const requiredLevel = Math.max(
      ...tool.requiredPermissions.map(p => PERMISSION_LEVEL_PRIORITY[p])
    );

    return PERMISSION_LEVEL_PRIORITY[permission] >= requiredLevel;
  });
}

/**
 * Trouve un outil par ID
 */
export function findToolById(toolId: string): ToolDefinition | undefined {
  return BUILTIN_TOOLS.find(t => t.id === toolId);
}

/**
 * Trouve un provider de recherche par ID
 */
export function findSearchProvider(
  providerId: SearchProvider,
  config: SearchEngineConfig
): SearchProviderConfig | undefined {
  return config.providers.find(p => p.id === providerId);
}

/**
 * Sélectionne le meilleur provider pour un type de recherche
 */
export function selectBestProvider(
  type: SearchType,
  config: SearchEngineConfig
): SearchProviderConfig | undefined {
  return config.providers
    .filter(p => p.enabled && p.supportedTypes.includes(type))
    .sort((a, b) => a.priority - b.priority)[0];
}

/**
 * Valide les paramètres d'entrée d'un outil
 */
export function validateToolInput(
  tool: ToolDefinition,
  input: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const schema = tool.inputSchema;

  // Vérifier les champs requis
  for (const required of schema.required) {
    if (!(required in input) || input[required] === undefined) {
      errors.push(`Missing required field: ${required}`);
    }
  }

  // Vérifier les types et contraintes
  for (const [key, value] of Object.entries(input)) {
    const propSchema = schema.properties[key];
    if (!propSchema) {
      if (!schema.additionalProperties) {
        errors.push(`Unknown field: ${key}`);
      }
      continue;
    }

    // Vérification de type basique
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (propSchema.type !== actualType && value !== undefined) {
      errors.push(`Invalid type for ${key}: expected ${propSchema.type}, got ${actualType}`);
    }

    // Contraintes numériques
    if (propSchema.type === 'number' && typeof value === 'number') {
      if (propSchema.minimum !== undefined && value < propSchema.minimum) {
        errors.push(`${key} must be >= ${propSchema.minimum}`);
      }
      if (propSchema.maximum !== undefined && value > propSchema.maximum) {
        errors.push(`${key} must be <= ${propSchema.maximum}`);
      }
    }

    // Contraintes de chaîne
    if (propSchema.type === 'string' && typeof value === 'string') {
      if (propSchema.minLength !== undefined && value.length < propSchema.minLength) {
        errors.push(`${key} must be at least ${propSchema.minLength} characters`);
      }
      if (propSchema.maxLength !== undefined && value.length > propSchema.maxLength) {
        errors.push(`${key} must be at most ${propSchema.maxLength} characters`);
      }
      if (propSchema.pattern && !new RegExp(propSchema.pattern).test(value)) {
        errors.push(`${key} does not match pattern ${propSchema.pattern}`);
      }
      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push(`${key} must be one of: ${propSchema.enum.join(', ')}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Génère une clé de cache pour une recherche
 */
export function generateSearchCacheKey(query: SearchQuery): string {
  const parts = [
    query.query,
    query.type,
    query.provider ?? 'auto',
    JSON.stringify(query.filters ?? {}),
  ];
  return `search_cache_${Buffer.from(parts.join('|')).toString('base64').substring(0, 40)}`;
}

// =============================================================================
// EXPORT PAR DÉFAUT
// =============================================================================

export default {
  // Configurations par défaut
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
};
