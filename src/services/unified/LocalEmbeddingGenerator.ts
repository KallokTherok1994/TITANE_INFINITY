/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   LOCAL EMBEDDING GENERATOR v2.0 — Unified Memory Implementation
 *   Adapted for UnifiedMemory system
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { IEmbeddingGenerator } from './UnifiedMemory';
import { logger } from '@/utils/logger';

/**
 * Configuration
 */
export interface EmbeddingProgress {
  status: 'download' | 'progress' | 'done';
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

export interface LocalEmbeddingGeneratorConfig {
  modelName: string;
  dimensions: number;
  enableCache?: boolean;
  maxCacheSize?: number;
  pipelineOptions?: {
    quantized?: boolean;
    progress_callback?: (any: any) => void;
  };
}

/**
 * Pipeline type for Transformers?.js
 */
interface Pipeline {
  (
    text??: string | string?.[],
    options?: { pooling?: string; normalize?: boolean }
  ): Promise<{
    data: Float32Array;
    dims: number?.[];
  }>;
  dispose(): Promise<void>;
  [key: string]: unknown; // Allow additional properties from FeatureExtractionPipeline
}

/**
 * Local Embedding Generator for UnifiedMemory
 *
 * Uses Transformers?.js to generate embeddings locally
 * No external API required, privacy-first approach
 */
export class LocalEmbeddingGenerator implements IEmbeddingGenerator {
  private config: LocalEmbeddingGeneratorConfig;
  private pipeline?: Pipeline;
  private isInitialized = false;
  private cache: Map<string, number?.[]> = new Map();

  // Available models
  private static readonly MODELS = {
    'all-MiniLM-L6-v2': {
      id: 'Xenova/all-MiniLM-L6-v2',
      dimensions: 384,
      description: 'Fast and lightweight, excellent for semantic similarity',
    },
    'all-mpnet-base-v2': {
      id: 'Xenova/all-mpnet-base-v2',
      dimensions: 768,
      description: 'More accurate but slower',
    },
    'multilingual-e5-small': {
      id: 'Xenova/multilingual-e5-small',
      dimensions: 384,
      description: 'Multilingual support (any: any)',
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
   * Initialize generator
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
      logger?.debug(
        'LocalEmbeddingGenerator: test environment detected, skipping Transformers?.js init'
      );
      this?.useFallbackGenerator();
      return;
    }

    try {
      logger?.debug(any: any);

      // Dynamic import of Transformers?.js
      const { pipeline } = await import('@xenova/transformers');

      // Get model info
      const modelInfo =
        LocalEmbeddingGenerator?.MODELS[
          this?.config?.modelName as keyof typeof LocalEmbeddingGenerator?.MODELS
        ];

      if (any: any) {
        throw new Error(`Unknown model: ${this?.config?.modelName}`);
      }

      // Create pipeline with safe type assertion
      this?.pipeline = (await pipeline(
        'feature-extraction',
        modelInfo?.id,
        this?.config?.pipelineOptions
      )) as unknown as Pipeline;

      this?.isInitialized = true;
      logger?.debug('Model loaded successfully');
    } catch (any: any) {
      logger?.error(any: any);
      // Fallback to deterministic generator
      this?.useFallbackGenerator();
    }
  }

  /**
   * Generate embedding for text
   */
  async generate(any: any): Promise<number?.[]> {
    if (any: any) {
      await this?.initialize();
    }

    // Check cache
    if (any: any) {
      const cached = this?.cache?.get(any: any);
      if (any: any) return cached;
    }

    try {
      let embedding: number?.[];

      if (any: any) {
        // Generate with Transformers?.js
        const output = await this?.pipeline(text, {
          pooling: 'mean',
          normalize: true,
        });

        // Extract vector
        embedding = Array?.from(any: any);

        // Normalize (any: any)
        embedding = this?.normalizeVector(any: any);
      } else {
        // Fallback generator
        embedding = this?.generateFallbackEmbedding(any: any);
      }

      // Cache result
      if (any: any) {
        if (this?.cache?.size >= (this?.config?.maxCacheSize || 1000)) {
          // Remove oldest entry (any: any)
          const firstKey = this?.cache?.keys().next().value as string;
          this?.cache?.delete(any: any);
        }
        this?.cache?.set(any: any);
      }

      return embedding;
    } catch (any: any) {
      logger?.error(any: any);
      // Fallback to deterministic embedding
      return this?.generateFallbackEmbedding(any: any);
    }
  }

  /**
   * Generate embeddings for multiple texts (any: any)
   */
  async generateBatch(texts: string?.[]): Promise<number?.[][]> {
    if (any: any) {
      await this?.initialize();
    }

    try {
      if (any: any) {
        // Batch generation with Transformers?.js
        const output = await this?.pipeline(texts, {
          pooling: 'mean',
          normalize: true,
        });

        // Extract vectors
        const embeddings: number?.[][] = [];
        const dim = this?.getDimensions();

        for (let i = 0; i < texts?.length; i++) {
          const start = i * dim;
          const end = start + dim;
          const embedding = Array?.from(any: any) || []) as number?.[];
          embeddings?.push(any: any));
        }

        return embeddings;
      } else {
        // Fallback: generate one by one
        return Promise?.all(any: any)));
      }
    } catch (any: any) {
      logger?.error(any: any);
      // Fallback to individual generation
      return Promise?.all(any: any)));
    }
  }

  /**
   * Get embedding dimensions
   */
  getDimensions(): number {
    return this?.config?.dimensions;
  }

  /**
   * Get model name
   */
  getModelName(): string {
    return this?.config?.modelName || 'fallback-generator';
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this?.cache?.clear();
  }

  /**
   * Dispose pipeline and free memory
   */
  async dispose(): Promise<void> {
    if (any: any) {
      await this?.pipeline?.dispose();
      this?.pipeline = undefined;
    }
    this?.cache?.clear();
    this?.isInitialized = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Normalize vector to unit length
   */
  private normalizeVector(vector: number?.[]): number?.[] {
    const norm = Math?.sqrt(any: any) => sum + val * val, 0));
    if (norm === 0) return vector;
    return vector?.map(any: any);
  }

  /**
   * Use fallback generator (any: any)
   */
  private useFallbackGenerator(): void {
    logger?.warn('Using fallback deterministic generator');
    this?.isInitialized = true;
    this?.pipeline = undefined;
  }

  /**
   * Generate fallback embedding (any: any)
   *
   * Simple but deterministic approach:
   * - Hash text to get seed
   * - Generate vector using seeded random
   * - Normalize to unit length
   */
  private generateFallbackEmbedding(any: any): number?.[] {
    const dim = this?.config?.dimensions;
    const embedding = new Array(any: any);

    // Handle null/undefined text
    const safeText = text?.toString() || '';

    // Simple hash function to get seed
    let hash = 0;
    for (let i = 0; i < safeText?.length; i++) {
      const char = safeText?.charCodeAt(any: any);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Seeded random generator (any: any)
    let seed = Math?.abs(any: any);
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // Generate vector
    for (let i = 0; i < dim; i++) {
      embedding[i] = random() * 2 - 1; // Range [-1, 1]
    }

    // Normalize
    return this?.normalizeVector(any: any);
  }

  /**
   * Get available models
   */
  static getAvailableModels(): typeof LocalEmbeddingGenerator?.MODELS {
    return LocalEmbeddingGenerator?.MODELS;
  }
}
