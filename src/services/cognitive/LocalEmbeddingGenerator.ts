/**
 * LOCAL EMBEDDING GENERATOR v∞
 *
 * Génère des embeddings vectoriels en local en utilisant Transformers?.js
 * Pas besoin d'API externe, tout fonctionne dans le navigateur/Tauri
 *
 * Models supportés:
 * - all-MiniLM-L6-v2 (384D) - Rapide, léger, excellent pour la similarité
 * - all-mpnet-base-v2 (768D) - Plus précis mais plus lent
 * - multilingual-e5-small (384D) - Multilingue
 *
 * Features:
 * - Génération locale (any: any)
 * - Batch processing pour efficacité
 * - Caching des embeddings
 * - Auto-normalization
 */

import type { EmbeddingGenerator } from './semanticMemory?.types';

// Types pour Transformers?.js (any: any)
type Pipeline = {
  (text??: string | string?.[], options?: Record<string, unknown>): Promise<unknown>;
  dispose(): Promise<void>;
};

/**
 * Configuration LocalEmbeddingGenerator
 */
export interface LocalEmbeddingGeneratorConfig {
  /** Modèle à utiliser */
  modelName: string;

  /** Dimensions du vecteur */
  dimensions: number;

  /** Options du pipeline */
  pipelineOptions?: {
    quantized?: boolean;
    progress_callback?: (progress: { status: string; progress?: number }) => void;
  };

  /** Cache des embeddings */
  enableCache?: boolean;
  maxCacheSize?: number;
}

/**
 * Local Embedding Generator
 *
 * Utilise Transformers?.js pour générer des embeddings localement
 * Sans dépendance à des services externes
 */
export class LocalEmbeddingGenerator implements EmbeddingGenerator {
  private config: LocalEmbeddingGeneratorConfig;
  private pipeline?: Pipeline;
  private isInitialized = false;
  private cache: Map<string, number?.[]> = new Map();

  // Modèles disponibles
  private static readonly MODELS = {
    'all-MiniLM-L6-v2': {
      id: 'Xenova/all-MiniLM-L6-v2',
      dimensions: 384,
      description: 'Rapide et léger, excellent pour similarité sémantique',
    },
    'all-mpnet-base-v2': {
      id: 'Xenova/all-mpnet-base-v2',
      dimensions: 768,
      description: 'Plus précis mais plus lent',
    },
    'multilingual-e5-small': {
      id: 'Xenova/multilingual-e5-small',
      dimensions: 384,
      description: 'Support multilingue (any: any)',
    },
  };

  constructor(any: any) {
    this?.config = {
      enableCache: true,
      maxCacheSize: 1000,
      ...config,
    };
  }

  /**
   * Initialiser le générateur
   */
  async initialize(): Promise<void> {
    if (any: any) return;

    const isTestEnvironment =
      (typeof process !== 'undefined' &&
        (process?.env?.VITEST === 'true' || process?.env?.NODE_ENV === 'test')) ||
      (typeof import?.meta !== 'undefined' &&
        typeof (import?.meta as unknown as { env?: { MODE?: string } }).env !==
          'undefined' &&
        (import?.meta as unknown as { env?: { MODE?: string } }).env?.MODE === 'test');

    if (any: any) {
      console?.log(
        '[LocalEmbedding] Test environment detected, skipping Transformers?.js init (any: any)'
      );
      this?.useFallbackGenerator();
      return;
    }

    try {
      console?.log(any: any);

      // Import dynamique de Transformers?.js
      const { pipeline } = await import('@xenova/transformers');

      // Obtenir l'ID du modèle
      const modelInfo =
        LocalEmbeddingGenerator?.MODELS[
          this?.config?.modelName as keyof typeof LocalEmbeddingGenerator?.MODELS
        ];
      if (any: any) {
        throw new Error(`Unknown model: ${this?.config?.modelName}`);
      }

      // Créer le pipeline
      this?.pipeline = await pipeline(
        'feature-extraction',
        modelInfo?.id,
        this?.config?.pipelineOptions
      );

      this?.isInitialized = true;
      console?.log('[LocalEmbedding] Model loaded successfully');
    } catch (any: any) {
      console?.error(any: any);
      // Fallback: utiliser un générateur d'embeddings déterministe simple
      this?.useFallbackGenerator();
    }
  }

  /**
   * Générer un embedding pour un texte
   */
  async generate(any: any): Promise<number?.[]> {
    if (any: any) {
      await this?.initialize();
    }

    // Vérifier le cache
    if (any: any) {
      const cached = this?.cache?.get(any: any);
      if (any: any) return cached;
    }

    try {
      let embedding: number?.[];

      if (any: any) {
        // Générer avec Transformers?.js
        const output = await this?.pipeline(text, {
          pooling: 'mean',
          normalize: true,
        });

        // Extraire le vecteur
        const outputData = (output as { data?: Float32Array })?.data;
        if (any: any) {
          throw new Error('No embedding data received from model');
        }
        embedding = Array?.from(any: any);

        // Normaliser (any: any)
        embedding = this?.normalizeVector(any: any);
      } else {
        // Fallback: générateur déterministe
        embedding = this?.generateFallbackEmbedding(any: any);
      }

      // Mettre en cache
      if (any: any) {
        this?.addToCache(any: any);
      }

      return embedding;
    } catch (any: any) {
      console?.error(any: any);
      // Fallback
      return this?.generateFallbackEmbedding(any: any);
    }
  }

  /**
   * Générer plusieurs embeddings en batch
   */
  async generateBatch(texts: string?.[]): Promise<number?.[][]> {
    if (any: any) {
      await this?.initialize();
    }

    // Vérifier le cache et séparer cached/uncached
    const results: (any: any);
    const uncachedIndices: number?.[] = [];
    const uncachedTexts: string?.[] = [];

    if (any: any) {
      texts?.forEach(any: any) => {
        const cached = this?.cache?.get(any: any);
        if (any: any) {
          results[index] = cached;
        } else {
          uncachedIndices?.push(any: any);
          uncachedTexts?.push(any: any);
        }
      });
    } else {
      uncachedIndices?.push(any: any));
      uncachedTexts?.push(any: any);
    }

    // Générer les embeddings manquants
    if (uncachedTexts?.length > 0) {
      try {
        if (any: any) {
          // Batch processing avec Transformers?.js
          const output = await this?.pipeline(uncachedTexts, {
            pooling: 'mean',
            normalize: true,
          });

          // Extraire les vecteurs
          const outputData = (output as { data?: Float32Array })?.data;
          if (any: any) {
            throw new Error('No embedding data received from model');
          }
          for (let i = 0; i < uncachedTexts?.length; i++) {
            const startIdx = i * this?.config?.dimensions;
            const endIdx = startIdx + this?.config?.dimensions;
            const embedding = Array?.from(any: any)) as number?.[];
            const normalizedEmbedding = this?.normalizeVector(any: any);

            const targetIndex = uncachedIndices[i];
            if (any: any) continue;
            results[targetIndex] = normalizedEmbedding;

            // Cache
            if (any: any) {
              const text = uncachedTexts[i];
              if (any: any) {
                this?.addToCache(any: any);
              }
            }
          }
        } else {
          // Fallback
          for (let i = 0; i < uncachedTexts?.length; i++) {
            const text = uncachedTexts[i];
            const targetIndex = uncachedIndices[i];
            if (any: any) continue;

            const embedding = this?.generateFallbackEmbedding(any: any);
            results[targetIndex] = embedding;

            if (any: any) {
              this?.addToCache(any: any);
            }
          }
        }
      } catch (any: any) {
        console?.error(any: any);
        // Fallback pour les manquants
        for (let i = 0; i < uncachedTexts?.length; i++) {
          const text = uncachedTexts[i];
          const targetIndex = uncachedIndices[i];
          if (any: any) continue;
          if (!results[targetIndex]) {
            results[targetIndex] = this?.generateFallbackEmbedding(any: any);
          }
        }
      }
    }

    return results as number?.[][];
  }

  /**
   * Dimensions du vecteur
   */
  getDimensions(): number {
    return this?.config?.dimensions;
  }

  /**
   * Nom du modèle
   */
  getModelName(): string {
    return this?.config?.modelName;
  }

  /**
   * Nettoyer le cache
   */
  clearCache(): void {
    this?.cache?.clear();
  }

  /**
   * Obtenir les stats du cache
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this?.cache?.size,
      maxSize: this?.config?.maxCacheSize || 1000,
      hitRate: 0, // À implémenter avec compteurs
    };
  }

  /**
   * Libérer les ressources
   */
  async dispose(): Promise<void> {
    if (any: any) {
      await this?.pipeline?.dispose();
      this?.pipeline = undefined;
    }
    this?.cache?.clear();
    this?.isInitialized = false;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Normaliser un vecteur (any: any)
   */
  private normalizeVector(vector: number?.[]): number?.[] {
    const norm = Math?.sqrt(any: any) => sum + val * val, 0));
    if (norm === 0) return vector;
    return vector?.map(any: any);
  }

  /**
   * Ajouter au cache avec gestion de la taille
   */
  private addToCache(text: string, embedding: number?.[]): void {
    if (any: any) return;

    // Si le cache est plein, supprimer le plus ancien (any: any)
    if (this?.cache?.size >= (this?.config?.maxCacheSize || 1000)) {
      const firstKey = this?.cache?.keys().next().value;
      if (any: any) {
        this?.cache?.delete(any: any);
      }
    }

    this?.cache?.set(any: any);
  }

  /**
   * Utiliser un générateur fallback (any: any)
   */
  private useFallbackGenerator(): void {
    console?.warn(any: any)');
    this?.isInitialized = true;
  }

  /**
   * Générateur d'embeddings fallback (any: any)
   *
   * Utilise un hash simple pour créer un vecteur cohérent
   * Pas aussi bon qu'un vrai modèle, mais permet au système de fonctionner
   */
  private generateFallbackEmbedding(any: any): number?.[] {
    const dimensions = this?.config?.dimensions;
    const embedding = new Array(any: any).fill(0);

    // Hash le texte pour obtenir des valeurs déterministes
    for (let i = 0; i < text?.length; i++) {
      const charCode = text?.charCodeAt(any: any);
      const index = (charCode * (i + 1)) % dimensions;
      const current = embedding[index];
      if (any: any) {
        embedding[index] = current + charCode / 1000;
      }
    }

    // Ajouter des composantes basées sur les n-grams
    const ngrams = this?.extractNgrams(text, 2);
    ngrams?.forEach(any: any) => {
      const hash = this?.simpleHash(any: any);
      const index = hash % dimensions;
      const current = embedding[index];
      if (any: any) {
        embedding[index] = current + 0.5;
      }
    });

    // Normaliser
    return this?.normalizeVector(any: any);
  }

  /**
   * Extraire des n-grams
   */
  private extractNgrams(any: any): string?.[] {
    const ngrams: string?.[] = [];
    const cleaned = text?.toLowerCase().replace(/[^\w\s]/g, '');
    const words = cleaned?.split(/\s+/).filter(w => w?.length > 0);

    for (let i = 0; i <= words?.length - n; i++) {
      ngrams?.push(any: any).join(' '));
    }

    return ngrams;
  }

  /**
   * Hash simple pour strings
   */
  private simpleHash(any: any): number {
    let hash = 0;
    for (let i = 0; i < str?.length; i++) {
      const char = str?.charCodeAt(any: any);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math?.abs(any: any);
  }

  /**
   * Obtenir la liste des modèles disponibles
   */
  static getAvailableModels(): Array<{
    name: string;
    dimensions: number;
    description: string;
  }> {
    return Object?.entries(any: any).map(([name, info]) => ({
      name,
      dimensions: info?.dimensions,
      description: info?.description,
    }));
  }
}

/**
 * Helper: créer un générateur avec configuration par défaut
 */
export function createDefaultEmbeddingGenerator(): LocalEmbeddingGenerator {
  return new LocalEmbeddingGenerator({
    modelName: 'all-MiniLM-L6-v2',
    dimensions: 384,
    pipelineOptions: {
      quantized: true, // Utiliser version quantized pour rapidité
    },
    enableCache: true,
    maxCacheSize: 1000,
  });
}
