/**
 * TITANE∞ vΩ∞ — SEARCH TOOLS CONFIG
 * Super Prompt #6: Configuration pour Search & Tools Engine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// SEARCH CONFIGURATION
// ============================================================================

export const SEARCH_CONFIG = {
  // Limites par défaut
  defaults: {
    limit: 10,
    maxResults: 100,
    timeout: 30000, // 30s
    minScore: 0.3,
  },

  // Configuration du cache
  cache: {
    enabled: true,
    maxSize: 1000,
    ttlMs: 5 * 60 * 1000, // 5 minutes
  },

  // Ranking
  ranking: {
    weights: {
      textMatch: 0.4,
      semanticScore: 0.35,
      recency: 0.15,
      popularity: 0.1,
    },
    boosts: {
      exactMatch: 2.0,
      titleMatch: 1.5,
      tagMatch: 1.3,
    },
  },

  // Filters
  filters: {
    maxTerms: 10,
    minTermLength: 2,
    stopWords: ['le', 'la', 'les', 'un', 'une', 'de', 'du', 'des', 'et', 'ou'],
  },
} as const;

// ============================================================================
// TOOLS CONFIGURATION
// ============================================================================

export const TOOLS_CONFIG = {
  // Limites d'exécution
  execution: {
    timeout: 30000, // 30s par défaut
    maxConcurrent: 5,
    retryCount: 3,
    retryDelayMs: 1000,
  },

  // Permissions par catégorie
  permissions: {
    file: ['read', 'write', 'list', 'delete'],
    code: ['analyze', 'format', 'refactor', 'execute'],
    network: ['http', 'fetch', 'websocket'],
    system: ['info', 'clipboard', 'notification'],
    data: ['parse', 'transform', 'validate'],
    ai: ['generate', 'summarize', 'translate'],
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    costMultipliers: {
      file: 1,
      code: 2,
      network: 3,
      system: 1,
      data: 1,
      ai: 5,
    },
  },

  // Validation
  validation: {
    maxInputSize: 1024 * 1024, // 1 MB
    allowedProtocols: ['http', 'https'],
    blockedDomains: [],
    sanitizeOutput: true,
  },
} as const;

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'code' | 'network' | 'system' | 'data' | 'ai';
  permissions: string[];
  timeout: number;
  enabled: boolean;
}

export const DEFAULT_TOOLS: ToolDefinition[] = [
  {
    id: 'read_file',
    name: 'Lire fichier',
    description: "Lit le contenu d'un fichier",
    category: 'file',
    permissions: ['read'],
    timeout: 5000,
    enabled: true,
  },
  {
    id: 'write_file',
    name: 'Écrire fichier',
    description: 'Écrit du contenu dans un fichier',
    category: 'file',
    permissions: ['write'],
    timeout: 5000,
    enabled: true,
  },
  {
    id: 'list_files',
    name: 'Lister fichiers',
    description: "Liste les fichiers d'un répertoire",
    category: 'file',
    permissions: ['list'],
    timeout: 10000,
    enabled: true,
  },
  {
    id: 'analyze_code',
    name: 'Analyser code',
    description: 'Analyse et valide du code source',
    category: 'code',
    permissions: ['analyze'],
    timeout: 30000,
    enabled: true,
  },
  {
    id: 'format_code',
    name: 'Formater code',
    description: 'Formate du code selon les conventions',
    category: 'code',
    permissions: ['format'],
    timeout: 10000,
    enabled: true,
  },
  {
    id: 'http_request',
    name: 'Requête HTTP',
    description: 'Effectue une requête HTTP',
    category: 'network',
    permissions: ['http'],
    timeout: 30000,
    enabled: true,
  },
  {
    id: 'fetch_webpage',
    name: 'Récupérer page web',
    description: "Récupère le contenu d'une page web",
    category: 'network',
    permissions: ['fetch'],
    timeout: 30000,
    enabled: true,
  },
  {
    id: 'parse_json',
    name: 'Parser JSON',
    description: 'Parse des données JSON',
    category: 'data',
    permissions: ['parse'],
    timeout: 5000,
    enabled: true,
  },
  {
    id: 'transform_data',
    name: 'Transformer données',
    description: 'Transforme des données selon un schéma',
    category: 'data',
    permissions: ['transform'],
    timeout: 10000,
    enabled: true,
  },
  {
    id: 'generate_text',
    name: 'Générer texte',
    description: "Génère du texte avec l'IA",
    category: 'ai',
    permissions: ['generate'],
    timeout: 60000,
    enabled: true,
  },
  {
    id: 'summarize',
    name: 'Résumer',
    description: 'Résume un texte',
    category: 'ai',
    permissions: ['summarize'],
    timeout: 60000,
    enabled: true,
  },
  {
    id: 'system_info',
    name: 'Info système',
    description: 'Récupère les informations système',
    category: 'system',
    permissions: ['info'],
    timeout: 5000,
    enabled: true,
  },
  {
    id: 'clipboard',
    name: 'Presse-papiers',
    description: 'Accès au presse-papiers',
    category: 'system',
    permissions: ['clipboard'],
    timeout: 1000,
    enabled: true,
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

export const searchToolsConfig = {
  search: SEARCH_CONFIG,
  tools: TOOLS_CONFIG,
  defaultTools: DEFAULT_TOOLS,
};

export default searchToolsConfig;
