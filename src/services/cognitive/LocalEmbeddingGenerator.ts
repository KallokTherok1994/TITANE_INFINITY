/**
 * LOCAL EMBEDDING GENERATOR v∞
 * 
 * Génère des embeddings vectoriels en local en utilisant Transformers.js
 * Pas besoin d'API externe, tout fonctionne dans le navigateur/Tauri
 * 
 * Models supportés:
 * - all-MiniLM-L6-v2 (384D) - Rapide, léger, excellent pour la similarité
 * - all-mpnet-base-v2 (768D) - Plus précis mais plus lent
 * - multilingual-e5-small (384D) - Multilingue
 * 
 * Features:
 * - Génération locale (privacy-first)
 * - Batch processing pour efficacité
 * - Caching des embeddings
 * - Auto-normalization
 */

import type { EmbeddingGenerator } from './semanticMemory.types';

// Types pour Transformers.js (sans import direct pour éviter erreurs de build)
interface Pipeline {
  (text: string | string[], options?: any): Promise<any>;
  dispose(): Promise<void>;
}

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
    progress_callback?: (progress: any) => void;
  };
  
  /** Cache des embeddings */
  enableCache?: boolean;
  maxCacheSize?: number;
}

/**
 * Local Embedding Generator
 * 
 * Utilise Transformers.js pour générer des embeddings localement
 * Sans dépendance à des services externes
 */
export class LocalEmbeddingGenerator implements EmbeddingGenerator {
  private config: LocalEmbeddingGeneratorConfig;
  private pipeline?: Pipeline;
  private isInitialized = false;
  private cache: Map<string, number[]> = new Map();

  // Modèles disponibles
  private static readonly MODELS = {
    'all-MiniLM-L6-v2': {
      id: 'Xenova/all-MiniLM-L6-v2',
      dimensions: 384,
      description: 'Rapide et léger, excellent pour similarité sémantique'
    },
    'all-mpnet-base-v2': {
      id: 'Xenova/all-mpnet-base-v2',
      dimensions: 768,
      description: 'Plus précis mais plus lent'
    },
    'multilingual-e5-small': {
      id: 'Xenova/multilingual-e5-small',
      dimensions: 384,
      description: 'Support multilingue (100+ langues)'
    }
  };

  constructor(config: LocalEmbeddingGeneratorConfig) {
    this.config = {
      enableCache: true,
      maxCacheSize: 1000,
      ...config
    };
  }

  /**
   * Initialiser le générateur
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('[LocalEmbedding] Loading model:', this.config.modelName);

      // Import dynamique de Transformers.js
      const { pipeline } = await import('@xenova/transformers');

      // Obtenir l'ID du modèle
      const modelInfo = LocalEmbeddingGenerator.MODELS[this.config.modelName as keyof typeof LocalEmbeddingGenerator.MODELS];
      if (!modelInfo) {
        throw new Error(`Unknown model: ${this.config.modelName}`);
      }

      // Créer le pipeline
      this.pipeline = await pipeline(
        'feature-extraction',
        modelInfo.id,
        this.config.pipelineOptions
      );

      this.isInitialized = true;
      console.log('[LocalEmbedding] Model loaded successfully');
    } catch (error) {
      console.error('[LocalEmbedding] Initialization failed:', error);
      // Fallback: utiliser un générateur d'embeddings déterministe simple
      this.useFallbackGenerator();
    }
  }

  /**
   * Générer un embedding pour un texte
   */
  async generate(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Vérifier le cache
    if (this.config.enableCache) {
      const cached = this.cache.get(text);
      if (cached) return cached;
    }

    try {
      let embedding: number[];

      if (this.pipeline) {
        // Générer avec Transformers.js
        const output = await this.pipeline(text, {
          pooling: 'mean',
          normalize: true
        });

        // Extraire le vecteur
        embedding = Array.from(output.data);

        // Normaliser (si pas déjà fait)
        embedding = this.normalizeVector(embedding);
      } else {
        // Fallback: générateur déterministe
        embedding = this.generateFallbackEmbedding(text);
      }

      // Mettre en cache
      if (this.config.enableCache) {
        this.addToCache(text, embedding);
      }

      return embedding;
    } catch (error) {
      console.error('[LocalEmbedding] Generation failed:', error);
      // Fallback
      return this.generateFallbackEmbedding(text);
    }
  }

  /**
   * Générer plusieurs embeddings en batch
   */
  async generateBatch(texts: string[]): Promise<number[][]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Vérifier le cache et séparer cached/uncached
    const results: (number[] | null)[] = new Array(texts.length).fill(null);
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    if (this.config.enableCache) {
      texts.forEach((text, index) => {
        const cached = this.cache.get(text);
        if (cached) {
          results[index] = cached;
        } else {
          uncachedIndices.push(index);
          uncachedTexts.push(text);
        }
      });
    } else {
      uncachedIndices.push(...texts.map((_, i) => i));
      uncachedTexts.push(...texts);
    }

    // Générer les embeddings manquants
    if (uncachedTexts.length > 0) {
      try {
        if (this.pipeline) {
          // Batch processing avec Transformers.js
          const output = await this.pipeline(uncachedTexts, {
            pooling: 'mean',
            normalize: true
          });

          // Extraire les vecteurs
          for (let i = 0; i < uncachedTexts.length; i++) {
            const startIdx = i * this.config.dimensions;
            const endIdx = startIdx + this.config.dimensions;
            const embedding = Array.from(output.data.slice(startIdx, endIdx));
            const normalizedEmbedding = this.normalizeVector(embedding);

            results[uncachedIndices[i]] = normalizedEmbedding;

            // Cache
            if (this.config.enableCache) {
              this.addToCache(uncachedTexts[i], normalizedEmbedding);
            }
          }
        } else {
          // Fallback
          for (let i = 0; i < uncachedTexts.length; i++) {
            const embedding = this.generateFallbackEmbedding(uncachedTexts[i]);
            results[uncachedIndices[i]] = embedding;

            if (this.config.enableCache) {
              this.addToCache(uncachedTexts[i], embedding);
            }
          }
        }
      } catch (error) {
        console.error('[LocalEmbedding] Batch generation failed:', error);
        // Fallback pour les manquants
        for (let i = 0; i < uncachedTexts.length; i++) {
          if (!results[uncachedIndices[i]]) {
            results[uncachedIndices[i]] = this.generateFallbackEmbedding(uncachedTexts[i]);
          }
        }
      }
    }

    return results as number[][];
  }

  /**
   * Dimensions du vecteur
   */
  getDimensions(): number {
    return this.config.dimensions;
  }

  /**
   * Nom du modèle
   */
  getModelName(): string {
    return this.config.modelName;
  }

  /**
   * Nettoyer le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtenir les stats du cache
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize || 1000,
      hitRate: 0 // À implémenter avec compteurs
    };
  }

  /**
   * Libérer les ressources
   */
  async dispose(): Promise<void> {
    if (this.pipeline) {
      await this.pipeline.dispose();
      this.pipeline = undefined;
    }
    this.cache.clear();
    this.isInitialized = false;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Normaliser un vecteur (L2 normalization)
   */
  private normalizeVector(vector: number[]): number[] {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vector;
    return vector.map(val => val / norm);
  }

  /**
   * Ajouter au cache avec gestion de la taille
   */
  private addToCache(text: string, embedding: number[]): void {
    if (!this.config.enableCache) return;

    // Si le cache est plein, supprimer le plus ancien (FIFO simple)
    if (this.cache.size >= (this.config.maxCacheSize || 1000)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(text, embedding);
  }

  /**
   * Utiliser un générateur fallback (si Transformers.js échoue)
   */
  private useFallbackGenerator(): void {
    console.warn('[LocalEmbedding] Using fallback generator (deterministic hashing)');
    this.isInitialized = true;
  }

  /**
   * Générateur d'embeddings fallback (déterministe)
   * 
   * Utilise un hash simple pour créer un vecteur cohérent
   * Pas aussi bon qu'un vrai modèle, mais permet au système de fonctionner
   */
  private generateFallbackEmbedding(text: string): number[] {
    const dimensions = this.config.dimensions;
    const embedding = new Array(dimensions).fill(0);

    // Hash le texte pour obtenir des valeurs déterministes
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * (i + 1)) % dimensions;
      embedding[index] += charCode / 1000;
    }

    // Ajouter des composantes basées sur les n-grams
    const ngrams = this.extractNgrams(text, 2);
    ngrams.forEach((ngram, idx) => {
      const hash = this.simpleHash(ngram);
      const index = hash % dimensions;
      embedding[index] += 0.5;
    });

    // Normaliser
    return this.normalizeVector(embedding);
  }

  /**
   * Extraire des n-grams
   */
  private extractNgrams(text: string, n: number): string[] {
    const ngrams: string[] = [];
    const cleaned = text.toLowerCase().replace(/[^\w\s]/g, '');
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);

    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }

    return ngrams;
  }

  /**
   * Hash simple pour strings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Obtenir la liste des modèles disponibles
   */
  static getAvailableModels(): Array<{
    name: string;
    dimensions: number;
    description: string;
  }> {
    return Object.entries(LocalEmbeddingGenerator.MODELS).map(([name, info]) => ({
      name,
      dimensions: info.dimensions,
      description: info.description
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
      quantized: true // Utiliser version quantized pour rapidité
    },
    enableCache: true,
    maxCacheSize: 1000
  });
}
