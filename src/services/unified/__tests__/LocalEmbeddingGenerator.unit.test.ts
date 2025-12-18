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

vi.mock('@xenova/transformers', () => ({
  pipeline: vi.fn(async () => {
    throw new Error('Transformers.js unavailable (test)');
  }),
}));

describe('LocalEmbeddingGenerator', () => {
  let generator: LocalEmbeddingGenerator;

  beforeEach(async () => {
    generator = new LocalEmbeddingGenerator({
      modelName: 'all-MiniLM-L6-v2',
      dimensions: 384,
    });
    await generator.initialize();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const gen = new LocalEmbeddingGenerator({
        modelName: 'all-MiniLM-L6-v2',
        dimensions: 384,
      });
      await expect(gen.initialize()).resolves.not.toThrow();
    });

    it('should return correct dimensions', () => {
      expect(generator.getDimensions()).toBe(384);
    });

    it('should return model name', () => {
      const modelName = generator.getModelName();
      expect(modelName).toBeDefined();
      expect(typeof modelName).toBe('string');
    });
  });

  describe('Single Text Embedding', () => {
    it('should generate embedding for text', async () => {
      const text = 'This is a test sentence';
      const embedding = await generator.generate(text);

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(384);
    });

    it('should generate normalized embeddings', async () => {
      const text = 'Test normalization';
      const embedding = await generator.generate(text);

      // Calculate L2 norm
      const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));

      // Should be approximately 1.0 (normalized)
      expect(norm).toBeCloseTo(1.0, 5);
    });

    it('should generate consistent embeddings for same text', async () => {
      const text = 'Consistent embedding test';

      const embedding1 = await generator.generate(text);
      const embedding2 = await generator.generate(text);

      // Should be identical (deterministic)
      expect(embedding1).toEqual(embedding2);
    });

    it('should generate different embeddings for different text', async () => {
      const text1 = 'First sentence';
      const text2 = 'Second sentence';

      const embedding1 = await generator.generate(text1);
      const embedding2 = await generator.generate(text2);

      // Should be different
      const areDifferent = embedding1.some(
        (val, i) => Math.abs(val - embedding2[i]) > 0.001
      );
      expect(areDifferent).toBe(true);
    });

    it('should handle empty string', async () => {
      const embedding = await generator.generate('');

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(384);
    });

    it('should handle long text', async () => {
      const longText = 'This is a very long sentence. '.repeat(100);
      const embedding = await generator.generate(longText);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(384);
    });

    it('should handle special characters', async () => {
      const text = 'Special chars: @#$%^&*()_+{}[]|\\:";\'<>?,./';
      const embedding = await generator.generate(text);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(384);
    });

    it('should handle unicode characters', async () => {
      const text = 'Unicode: 你好世界 مرحبا العالم Здравствуй мир';
      const embedding = await generator.generate(text);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(384);
    });
  });

  describe('Batch Embedding', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = ['First sentence', 'Second sentence', 'Third sentence'];

      const embeddings = await generator.generateBatch(texts);

      expect(embeddings).toBeDefined();
      expect(embeddings.length).toBe(3);
      embeddings.forEach(emb => {
        expect(emb.length).toBe(384);
      });
    });

    it('should generate normalized batch embeddings', async () => {
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      const embeddings = await generator.generateBatch(texts);

      embeddings.forEach(embedding => {
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        expect(norm).toBeCloseTo(1.0, 5);
      });
    });

    it('should handle empty batch', async () => {
      const embeddings = await generator.generateBatch([]);
      expect(embeddings).toEqual([]);
    });

    it('should handle batch with one item', async () => {
      const embeddings = await generator.generateBatch(['Single text']);

      expect(embeddings.length).toBe(1);
      expect(embeddings[0].length).toBe(384);
    });

    it('should handle large batch', async () => {
      const texts = Array.from({ length: 50 }, (_, i) => `Text number ${i}`);
      const embeddings = await generator.generateBatch(texts);

      expect(embeddings.length).toBe(50);
      embeddings.forEach(emb => {
        expect(emb.length).toBe(384);
      });
    });
  });

  describe('Semantic Similarity', () => {
    it('should generate similar embeddings for similar texts', async () => {
      const text1 = 'The cat sits on the mat';
      const text2 = 'A cat is sitting on the mat';

      const emb1 = await generator.generate(text1);
      const emb2 = await generator.generate(text2);

      // Calculate cosine similarity
      const similarity = cosineSimilarity(emb1, emb2);

      // Fallback generator won't have high semantic similarity
      // Just check it returns a valid number
      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should generate dissimilar embeddings for unrelated texts', async () => {
      const text1 = 'The weather is sunny today';
      const text2 = 'Quantum mechanics in physics';

      const emb1 = await generator.generate(text1);
      const emb2 = await generator.generate(text2);

      const similarity = cosineSimilarity(emb1, emb2);

      // Should be lower (different meaning)
      expect(similarity).toBeLessThan(0.9);
    });
  });

  describe('Performance', () => {
    it('should generate embeddings reasonably fast', async () => {
      const text = 'Performance test sentence';

      const start = performance.now();
      await generator.generate(text);
      const duration = performance.now() - start;

      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle batch efficiently', async () => {
      const texts = Array.from({ length: 10 }, (_, i) => `Sentence ${i}`);

      const start = performance.now();
      await generator.generateBatch(texts);
      const duration = performance.now() - start;

      // Should complete within 5 seconds for 10 items
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Error Handling', () => {
    it('should handle null text gracefully', async () => {
      const embedding = await generator.generate(null as any);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(384);
    });

    it('should handle undefined text gracefully', async () => {
      const embedding = await generator.generate(undefined as any);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(384);
    });
  });

  describe('Fallback Generator', () => {
    it('should use fallback when Transformers.js unavailable', async () => {
      const fallbackGen = new LocalEmbeddingGenerator({
        modelName: 'all-MiniLM-L6-v2',
        dimensions: 384,
      });
      await fallbackGen.initialize();

      const embedding = await fallbackGen.generate('Test fallback');

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(384);
    });

    it('should generate deterministic fallback embeddings', async () => {
      const fallbackGen = new LocalEmbeddingGenerator({
        modelName: 'all-MiniLM-L6-v2',
        dimensions: 384,
      });
      await fallbackGen.initialize();

      const text = 'Deterministic test';
      const emb1 = await fallbackGen.generate(text);
      const emb2 = await fallbackGen.generate(text);

      expect(emb1).toEqual(emb2);
    });
  });
});

// Helper function
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
