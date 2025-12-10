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

/**
 * Configuration
 */
export interface LocalEmbeddingGeneratorConfig {
  modelName: string;
  dimensions: number;
  enableCache?: boolean;
  maxCacheSize?: number;
  pipelineOptions?: {
    quantized?: boolean;
    progress_callback?: (progress: any) => void;
  };
}

/**
 * Pipeline type for Transformers.js
 */
interface Pipeline {
  (text: string | string[], options?: any): Promise<any>;
  dispose(): Promise<void>;
}

/**
 * Local Embedding Generator for UnifiedMemory
 *
 * Uses Transformers.js to generate embeddings locally
 * No external API required, privacy-first approach
 */
export class LocalEmbeddingGenerator implements IEmbeddingGenerator {
  private config: LocalEmbeddingGeneratorConfig;
  private pipeline?: Pipeline;
  private isInitialized = false;
  private cache: Map<string, number[]> = new Map();

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
      description: 'Multilingual support (100+ languages)',
    },
  };

  constructor(config: LocalEmbeddingGeneratorConfig) {
    this.config = {
      enableCache: true,
      maxCacheSize: 1000,
      ...config,
    };
  }

  /**
   * Initialize generator
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('[LocalEmbedding] Loading model:', this.config.modelName);

      // Dynamic import of Transformers.js
      const { pipeline } = await import('@xenova/transformers');

      // Get model info
      const modelInfo =
        LocalEmbeddingGenerator.MODELS[
          this.config.modelName as keyof typeof LocalEmbeddingGenerator.MODELS
        ];

      if (!modelInfo) {
        throw new Error(`Unknown model: ${this.config.modelName}`);
      }

      // Create pipeline
      this.pipeline = await pipeline(
        'feature-extraction',
        modelInfo.id,
        this.config.pipelineOptions
      );

      this.isInitialized = true;
      console.log('[LocalEmbedding] Model loaded successfully');
    } catch (error) {
      console.error('[LocalEmbedding] Initialization failed:', error);
      // Fallback to deterministic generator
      this.useFallbackGenerator();
    }
  }

  /**
   * Generate embedding for text
   */
  async generate(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check cache
    if (this.config.enableCache) {
      const cached = this.cache.get(text);
      if (cached) return cached;
    }

    try {
      let embedding: number[];

      if (this.pipeline) {
        // Generate with Transformers.js
        const output = await this.pipeline(text, {
          pooling: 'mean',
          normalize: true,
        });

        // Extract vector
        embedding = Array.from(output.data);

        // Normalize (if not already done)
        embedding = this.normalizeVector(embedding);
      } else {
        // Fallback generator
        embedding = this.generateFallbackEmbedding(text);
      }

      // Cache result
      if (this.config.enableCache) {
        if (this.cache.size >= (this.config.maxCacheSize || 1000)) {
          // Remove oldest entry (first in Map)
          const firstKey = this.cache.keys().next().value as string;
          this.cache.delete(firstKey);
        }
        this.cache.set(text, embedding);
      }

      return embedding;
    } catch (error) {
      console.error('[LocalEmbedding] Generation failed:', error);
      // Fallback to deterministic embedding
      return this.generateFallbackEmbedding(text);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateBatch(texts: string[]): Promise<number[][]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.pipeline) {
        // Batch generation with Transformers.js
        const output = await this.pipeline(texts, {
          pooling: 'mean',
          normalize: true,
        });

        // Extract vectors
        const embeddings: number[][] = [];
        const dim = this.getDimensions();

        for (let i = 0; i < texts.length; i++) {
          const start = i * dim;
          const end = start + dim;
          const embedding = Array.from(output.data?.slice(start, end) || []) as number[];
          embeddings.push(this.normalizeVector(embedding));
        }

        return embeddings;
      } else {
        // Fallback: generate one by one
        return Promise.all(texts.map(t => this.generate(t)));
      }
    } catch (error) {
      console.error('[LocalEmbedding] Batch generation failed:', error);
      // Fallback to individual generation
      return Promise.all(texts.map(t => this.generate(t)));
    }
  }

  /**
   * Get embedding dimensions
   */
  getDimensions(): number {
    return this.config.dimensions;
  }

  /**
   * Get model name
   */
  getModelName(): string {
    return this.config.modelName || 'fallback-generator';
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Dispose pipeline and free memory
   */
  async dispose(): Promise<void> {
    if (this.pipeline) {
      await this.pipeline.dispose();
      this.pipeline = undefined;
    }
    this.cache.clear();
    this.isInitialized = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Normalize vector to unit length
   */
  private normalizeVector(vector: number[]): number[] {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vector;
    return vector.map(val => val / norm);
  }

  /**
   * Use fallback generator (deterministic)
   */
  private useFallbackGenerator(): void {
    console.warn('[LocalEmbedding] Using fallback deterministic generator');
    this.isInitialized = true;
    this.pipeline = undefined;
  }

  /**
   * Generate fallback embedding (deterministic hash-based)
   *
   * Simple but deterministic approach:
   * - Hash text to get seed
   * - Generate vector using seeded random
   * - Normalize to unit length
   */
  private generateFallbackEmbedding(text: string): number[] {
    const dim = this.config.dimensions;
    const embedding = new Array(dim);

    // Handle null/undefined text
    const safeText = text?.toString() || '';

    // Simple hash function to get seed
    let hash = 0;
    for (let i = 0; i < safeText.length; i++) {
      const char = safeText.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Seeded random generator (LCG)
    let seed = Math.abs(hash);
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // Generate vector
    for (let i = 0; i < dim; i++) {
      embedding[i] = random() * 2 - 1; // Range [-1, 1]
    }

    // Normalize
    return this.normalizeVector(embedding);
  }

  /**
   * Get available models
   */
  static getAvailableModels(): typeof LocalEmbeddingGenerator.MODELS {
    return LocalEmbeddingGenerator.MODELS;
  }
}
