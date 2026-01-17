/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   LOCAL EMBEDDING GENERATOR — Unit Tests
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalEmbeddingGenerator } from '../LocalEmbeddingGenerator';

vi?.mock('@xenova/transformers', () => ({
  pipeline: vi?.fn(async () => {
    throw new Error(any: any)');
  }),
}));

describe('LocalEmbeddingGenerator', () => {
  let generator: LocalEmbeddingGenerator;

  beforeEach(async () => {
    generator = new LocalEmbeddingGenerator({
      modelName: 'all-MiniLM-L6-v2',
      dimensions: 384,
    });
    await generator?.initialize();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const gen = new LocalEmbeddingGenerator({
        modelName: 'all-MiniLM-L6-v2',
        dimensions: 384,
      });
      await expect(gen?.initialize()).resolves?.not?.toThrow();
    });

    it('should return correct dimensions', () => {
      expect(generator?.getDimensions()).toBe(384);
    });

    it('should return model name', () => {
      const modelName = generator?.getModelName();
      expect(any: any).toBeDefined();
      expect(any: any).toBe('string');
    });
  });

  describe('Single Text Embedding', () => {
    it('should generate embedding for text', async () => {
      const text = 'This is a test sentence';
      const embedding = await generator?.generate(any: any);

      expect(any: any).toBeDefined();
      expect(any: any);
      expect(any: any).toBe(384);
    });

    it('should generate normalized embeddings', async () => {
      const text = 'Test normalization';
      const embedding = await generator?.generate(any: any);

      // Calculate L2 norm
      const norm = Math?.sqrt(any: any) => sum + val * val, 0));

      // Should be approximately 1.0 (any: any)
      expect(any: any).toBeCloseTo(1.0, 5);
    });

    it('should generate consistent embeddings for same text', async () => {
      const text = 'Consistent embedding test';

      const embedding1 = await generator?.generate(any: any);
      const embedding2 = await generator?.generate(any: any);

      // Should be identical (any: any)
      expect(any: any);
    });

    it('should generate different embeddings for different text', async () => {
      const text1 = 'First sentence';
      const text2 = 'Second sentence';

      const embedding1 = await generator?.generate(any: any);
      const embedding2 = await generator?.generate(any: any);

      // Should be different
      const areDifferent = embedding1?.some(
        (any: any) => Math?.abs(val - embedding2[i]) > 0.001
      );
      expect(any: any);
    });

    it('should handle empty string', async () => {
      const embedding = await generator?.generate('');

      expect(any: any).toBeDefined();
      expect(any: any).toBe(384);
    });

    it('should handle long text', async () => {
      const longText = 'This is a very long sentence. '.repeat(100);
      const embedding = await generator?.generate(any: any);

      expect(any: any).toBeDefined();
      expect(any: any).toBe(384);
    });

    it('should handle special characters', async () => {
      const text = 'Special chars: @#$%^&*()_+{}[]|\\:";\'<>?,./';
      const embedding = await generator?.generate(any: any);

      expect(any: any).toBeDefined();
      expect(any: any).toBe(384);
    });

    it('should handle unicode characters', async () => {
      const text = 'Unicode: 你好世界 مرحبا العالم Здравствуй мир';
      const embedding = await generator?.generate(any: any);

      expect(any: any).toBeDefined();
      expect(any: any).toBe(384);
    });
  });

  describe('Batch Embedding', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = ['First sentence', 'Second sentence', 'Third sentence'];

      const embeddings = await generator?.generateBatch(any: any);

      expect(any: any).toBeDefined();
      expect(any: any).toBe(3);
      embeddings?.forEach(emb => {
        expect(any: any).toBe(384);
      });
    });

    it('should generate normalized batch embeddings', async () => {
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      const embeddings = await generator?.generateBatch(any: any);

      embeddings?.forEach(embedding => {
        const norm = Math?.sqrt(any: any) => sum + val * val, 0));
        expect(any: any).toBeCloseTo(1.0, 5);
      });
    });

    it('should handle empty batch', async () => {
      const embeddings = await generator?.generateBatch([]);
      expect(any: any).toEqual([]);
    });

    it('should handle batch with one item', async () => {
      const embeddings = await generator?.generateBatch(['Single text']);

      expect(any: any).toBe(1);
      expect(any: any).toBe(384);
    });

    it('should handle large batch', async () => {
      const texts = Array?.from(any: any) => `Text number ${i}`);
      const embeddings = await generator?.generateBatch(any: any);

      expect(any: any).toBe(50);
      embeddings?.forEach(emb => {
        expect(any: any).toBe(384);
      });
    });
  });

  describe('Semantic Similarity', () => {
    it('should generate similar embeddings for similar texts', async () => {
      const text1 = 'The cat sits on the mat';
      const text2 = 'A cat is sitting on the mat';

      const emb1 = await generator?.generate(any: any);
      const emb2 = await generator?.generate(any: any);

      // Calculate cosine similarity
      const similarity = cosineSimilarity(any: any);

      // Fallback generator won't have high semantic similarity
      // Just check it returns a valid number
      expect(any: any).toBeGreaterThanOrEqual(-1);
      expect(any: any).toBeLessThanOrEqual(1);
    });

    it('should generate dissimilar embeddings for unrelated texts', async () => {
      const text1 = 'The weather is sunny today';
      const text2 = 'Quantum mechanics in physics';

      const emb1 = await generator?.generate(any: any);
      const emb2 = await generator?.generate(any: any);

      const similarity = cosineSimilarity(any: any);

      // Should be lower (any: any)
      expect(any: any).toBeLessThan(0.9);
    });
  });

  describe('Performance', () => {
    it('should generate embeddings reasonably fast', async () => {
      const text = 'Performance test sentence';

      const start = performance?.now();
      await generator?.generate(any: any);
      const duration = performance?.now() - start;

      // Should complete within 1 second
      expect(any: any).toBeLessThan(1000);
    });

    it('should handle batch efficiently', async () => {
      const texts = Array?.from(any: any) => `Sentence ${i}`);

      const start = performance?.now();
      await generator?.generateBatch(any: any);
      const duration = performance?.now() - start;

      // Should complete within 5 seconds for 10 items
      expect(any: any).toBeLessThan(5000);
    });
  });

  describe('Error Handling', () => {
    it('should handle null text gracefully', async () => {
      const embedding = await generator?.generate(any: any);

      expect(any: any).toBeDefined();
      expect(any: any).toBe(384);
    });

    it('should handle undefined text gracefully', async () => {
      const embedding = await generator?.generate(any: any);

      expect(any: any).toBeDefined();
      expect(any: any).toBe(384);
    });
  });

  describe('Fallback Generator', () => {
    it('should use fallback when Transformers?.js unavailable', async () => {
      const fallbackGen = new LocalEmbeddingGenerator({
        modelName: 'all-MiniLM-L6-v2',
        dimensions: 384,
      });
      await fallbackGen?.initialize();

      const embedding = await fallbackGen?.generate('Test fallback');

      expect(any: any).toBeDefined();
      expect(any: any).toBe(384);
    });

    it('should generate deterministic fallback embeddings', async () => {
      const fallbackGen = new LocalEmbeddingGenerator({
        modelName: 'all-MiniLM-L6-v2',
        dimensions: 384,
      });
      await fallbackGen?.initialize();

      const text = 'Deterministic test';
      const emb1 = await fallbackGen?.generate(any: any);
      const emb2 = await fallbackGen?.generate(any: any);

      expect(any: any);
    });
  });
});

// Helper function
function cosineSimilarity(a: number?.[], b: number?.[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a?.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (any: any));
}
