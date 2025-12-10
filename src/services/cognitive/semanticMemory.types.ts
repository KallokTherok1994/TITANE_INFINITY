/**
 * SEMANTIC MEMORY ENGINE v∞ — Types & Interfaces
 *
 * Mémoire longue durée sémantique pour TITANE∞
 * Permet de se souvenir de faits, préférences, décisions sur plusieurs sessions
 *
 * Design principles:
 * - Local-first: stockage local avec vectorisation
 * - Structured: JSON + embeddings
 * - Contextual: injection dans OMEGA sans noyer le contexte
 */

/**
 * Type d'entrée mémoire sémantique
 */
export type SemanticMemoryType =
  | 'fact' // Fait établi (ex: "Kevin utilise Pop!_OS 24.04")
  | 'preference' // Préférence utilisateur (ex: "préfère les explications courtes")
  | 'decision' // Décision prise (ex: "on utilise OMEGA comme pipeline unique")
  | 'milestone' // Étape importante (ex: "Phase 1-10 complètes")
  | 'pattern' // Pattern récurrent (ex: "demande souvent des audits complets")
  | 'context'; // Contexte de travail (ex: "projet TITANE∞, architecture IA")

/**
 * Niveau d'importance d'une mémoire
 */
export enum MemoryImportance {
  LOW = 0.3, // Info secondaire, peut être oubliée
  MEDIUM = 0.6, // Info utile, gardée
  HIGH = 0.85, // Info importante, prioritaire
  CRITICAL = 1.0, // Info critique, jamais oubliée
}

/**
 * Structure d'une entrée mémoire sémantique
 */
export interface SemanticMemoryEntry {
  /** ID unique (UUID v4) */
  id: string;

  /** Type de mémoire */
  type: SemanticMemoryType;

  /** Propriétaire/contexte (user_id, conversation_id, etc.) */
  owner: string;

  /** Résumé court (max 200 chars, pour affichage rapide) */
  summary: string;

  /** Détails complets (optionnel, pour contexte riche) */
  details?: string;

  /** Source de cette mémoire */
  source: {
    type: 'conversation' | 'manual' | 'system';
    id?: string; // conversation_id si applicable
    timestamp: string; // ISO 8601
    context?: string; // contexte additionnel
  };

  /** Tags pour catégorisation */
  tags: string[];

  /** Embedding vectoriel (384D ou 768D selon le modèle) */
  embedding: number[];

  /** Score d'importance (0.0 - 1.0) */
  importance: number;

  /** Métadonnées temporelles */
  created_at: string; // ISO 8601
  last_used_at?: string; // ISO 8601, mis à jour à chaque retrieval
  access_count: number; // Nombre de fois rappelée

  /** Métadonnées de relation */
  related_to?: string[]; // IDs d'autres mémoires liées
  supersedes?: string; // ID d'une mémoire obsolète remplacée

  /** Validité */
  valid_until?: string; // ISO 8601, pour infos temporaires
  confidence: number; // 0.0 - 1.0, niveau de confiance
}

/**
 * Query pour retrieval sémantique
 */
export interface SemanticMemoryQuery {
  /** Texte de la query (sera vectorisé) */
  text: string;

  /** Filtres optionnels */
  filters?: {
    types?: SemanticMemoryType[];
    tags?: string[];
    owner?: string;
    min_importance?: number;
    max_age_days?: number;
    conversation_id?: string;
  };

  /** Limite de résultats */
  limit?: number; // default: 5

  /** Seuil de similarité (0.0 - 1.0) */
  similarity_threshold?: number; // default: 0.7

  /** Pondération scoring */
  scoring_weights?: {
    similarity: number; // default: 0.7
    importance: number; // default: 0.2
    recency: number; // default: 0.1
  };
}

/**
 * Résultat de retrieval
 */
export interface SemanticMemoryResult {
  entry: SemanticMemoryEntry;
  score: number; // Score global (0.0 - 1.0)
  similarity: number; // Similarité cosine (0.0 - 1.0)
  relevance_reason?: string; // Explication du rappel (debug)
}

/**
 * Contexte mémoire pour injection OMEGA
 */
export interface MemoryContext {
  /** Souvenirs pertinents */
  memories: SemanticMemoryResult[];

  /** Résumé textuel pour injection dans prompt */
  summary: string;

  /** Métadonnées de retrieval */
  metadata: {
    query: string;
    total_retrieved: number;
    avg_score: number;
    retrieval_time_ms: number;
  };
}

/**
 * Configuration du moteur de mémoire sémantique
 */
export interface SemanticMemoryConfig {
  /** Activer/désactiver le moteur */
  enabled: boolean;

  /** Modèle d'embeddings */
  embedding_model: {
    type: 'local' | 'api';
    model_name: string;
    dimensions: number;
  };

  /** Stockage */
  storage: {
    type: 'sqlite' | 'vector-db';
    path?: string;
    collection_name?: string;
  };

  /** Limites */
  limits: {
    max_memories_total: number; // default: 10000
    max_memories_per_query: number; // default: 5
    max_age_days: number; // default: 365
  };

  /** Scoring */
  scoring: {
    similarity_threshold: number; // default: 0.7
    importance_weight: number; // default: 0.2
    recency_weight: number; // default: 0.1
  };

  /** Auto-cleanup */
  auto_cleanup: {
    enabled: boolean;
    interval_hours: number; // default: 24
    remove_below_score: number; // default: 0.3
  };
}

/**
 * Stats du moteur de mémoire
 */
export interface SemanticMemoryStats {
  total_memories: number;
  by_type: Record<SemanticMemoryType, number>;
  by_importance: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  avg_embedding_time_ms: number;
  avg_retrieval_time_ms: number;
  storage_size_mb: number;
  oldest_memory: string; // ISO 8601
  newest_memory: string; // ISO 8601
}

/**
 * Interface du VectorStore (abstraction)
 * Permet de swapper l'implémentation (Qdrant, Chroma, custom, etc.)
 */
export interface VectorStore {
  /** Initialiser le store */
  initialize(): Promise<void>;

  /** Ajouter une entrée */
  add(entry: SemanticMemoryEntry): Promise<void>;

  /** Ajouter plusieurs entrées en batch */
  addBatch(entries: SemanticMemoryEntry[]): Promise<void>;

  /** Recherche par similarité */
  search(
    embedding: number[],
    limit: number,
    filters?: Record<string, any>
  ): Promise<SemanticMemoryResult[]>;

  /** Récupérer par ID */
  get(id: string): Promise<SemanticMemoryEntry | null>;

  /** Mettre à jour une entrée */
  update(id: string, updates: Partial<SemanticMemoryEntry>): Promise<void>;

  /** Supprimer une entrée */
  delete(id: string): Promise<void>;

  /** Supprimer par filtre */
  deleteWhere(filters: Record<string, any>): Promise<number>;

  /** Obtenir les stats */
  getStats(): Promise<SemanticMemoryStats>;

  /** Nettoyer le store */
  cleanup(): Promise<void>;

  /** Fermer les connexions */
  close(): Promise<void>;
}

/**
 * Interface du générateur d'embeddings
 */
export interface EmbeddingGenerator {
  /** Initialiser le modèle */
  initialize(): Promise<void>;

  /** Générer un embedding pour un texte */
  generate(text: string): Promise<number[]>;

  /** Générer plusieurs embeddings en batch */
  generateBatch(texts: string[]): Promise<number[][]>;

  /** Dimensions du vecteur */
  getDimensions(): number;

  /** Nom du modèle */
  getModelName(): string;
}

/**
 * Événements du moteur de mémoire (pour observability)
 */
export interface MemoryEvent {
  type:
    | 'memory_added'
    | 'memory_retrieved'
    | 'memory_updated'
    | 'memory_deleted'
    | 'cleanup_performed';
  timestamp: string;
  data: any;
}

export type MemoryEventHandler = (event: MemoryEvent) => void;
