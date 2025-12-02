/**
 * TITANE∞ vΩ∞ — TYPES SEARCH + TOOLS ENGINE
 * Super Prompt #6: Moteur de recherche et outils intégrés
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// TYPES DE RECHERCHE
// ============================================================================

export type SearchScope = 'workspace' | 'memory' | 'web' | 'docs' | 'all';
export type SearchType = 'semantic' | 'keyword' | 'fuzzy' | 'exact';

export interface SearchQuery {
  id: string;
  text: string;
  scope: SearchScope[];
  type: SearchType;
  filters?: SearchFilters;
  limit: number;
  offset?: number;
}

export interface SearchFilters {
  fileTypes?: string[];
  dateRange?: { start?: number; end?: number };
  tags?: string[];
  categories?: string[];
}

export interface SearchResult {
  id: string;
  type: 'file' | 'memory' | 'web' | 'doc' | 'tool';
  title: string;
  content: string;
  snippet: string;
  score: number;
  source: string;
  metadata: Record<string, unknown>;
  timestamp: number;
}

export interface SearchResponse {
  query: SearchQuery;
  results: SearchResult[];
  totalCount: number;
  searchTimeMs: number;
  suggestions?: string[];
}

// ============================================================================
// OUTILS INTÉGRÉS
// ============================================================================

export type ToolId =
  | 'calculator'
  | 'code_runner'
  | 'file_manager'
  | 'web_browser'
  | 'image_analyzer'
  | 'document_parser'
  | 'data_visualizer'
  | 'api_tester'
  | 'translator'
  | 'summarizer';

export interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  category: string;
  enabled: boolean;

  // Schéma des paramètres
  inputSchema: ToolInputSchema;
  outputSchema: ToolOutputSchema;

  // Métadonnées
  version: string;
  author: string;
}

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, ToolSchemaProperty>;
  required: string[];
}

export interface ToolOutputSchema {
  type: string;
  description: string;
}

export interface ToolSchemaProperty {
  type: string;
  description: string;
  enum?: string[];
  default?: unknown;
}

export interface ToolExecution {
  id: string;
  toolId: ToolId;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface SearchToolsConfig {
  // Recherche
  defaultScope: SearchScope[];
  defaultType: SearchType;
  maxResults: number;
  semanticEnabled: boolean;

  // Outils
  enabledTools: ToolId[];
  toolExecutionTimeout: number;
  maxConcurrentTools: number;

  // Cache
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface SearchToolsState {
  isInitialized: boolean;
  isSearching: boolean;

  // Recherche
  currentQuery: SearchQuery | null;
  searchHistory: SearchQuery[];
  results: SearchResult[];

  // Outils
  tools: Tool[];
  activeExecutions: ToolExecution[];
  executionHistory: ToolExecution[];
}
