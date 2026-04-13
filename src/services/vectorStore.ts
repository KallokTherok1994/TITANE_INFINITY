/**
 * TITANE∞ — In-Memory Vector Store for RAG Pipeline
 *
 * Provides:
 * - Store embeddings with metadata
 * - Cosine similarity search
 * - CRUD operations on vectors
 * - Batch operations
 * - Export/import for optional persistence
 *
 * Rule 6: IPC canonical contract — no silent failures.
 * Rule 2: Proof before verdict — fully testable, no external dependencies.
 */

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface VectorEntry {
  id: string;
  embedding: number[];
  metadata: {
    source: string;
    content: string;
    type: string;
    timestamp: number;
  };
}

export interface VectorSearchResult {
  entry: VectorEntry;
  score: number;
}

// ─────────────────────────────────────────────────────────────────
// Utility: Cosine Similarity
// ─────────────────────────────────────────────────────────────────

/**
 * Compute cosine similarity between two vectors.
 * Returns 0 if lengths mismatch or either norm is 0.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const va = a[i] ?? 0;
    const vb = b[i] ?? 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─────────────────────────────────────────────────────────────────
// VectorStore class
// ─────────────────────────────────────────────────────────────────

export class VectorStore {
  private vectors: Map<string, VectorEntry> = new Map();

  /** Add a vector entry. Overwrites if id already exists. */
  add(entry: VectorEntry): void {
    this.vectors.set(entry.id, entry);
  }

  /** Add multiple entries in batch. */
  addBatch(entries: VectorEntry[]): void {
    for (const entry of entries) {
      this.vectors.set(entry.id, entry);
    }
  }

  /**
   * Search by cosine similarity.
   *
   * @param queryEmbedding - Query vector
   * @param topK - Maximum number of results (default: 5)
   * @param minScore - Minimum similarity threshold (default: 0.0)
   * @returns Results sorted by score descending
   */
  search(queryEmbedding: number[], topK = 5, minScore = 0.0): VectorSearchResult[] {
    if (queryEmbedding.length === 0) return [];

    const results: VectorSearchResult[] = [];

    for (const entry of this.vectors.values()) {
      if (entry.embedding.length !== queryEmbedding.length) continue;
      const score = cosineSimilarity(queryEmbedding, entry.embedding);
      if (score >= minScore) {
        results.push({ entry, score });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /** Get a single entry by ID. Returns undefined if not found. */
  get(id: string): VectorEntry | undefined {
    return this.vectors.get(id);
  }

  /** Delete an entry by ID. Returns true if it existed. */
  delete(id: string): boolean {
    return this.vectors.delete(id);
  }

  /**
   * Delete all entries from a given source.
   * @returns Number of entries deleted
   */
  deleteBySource(source: string): number {
    let count = 0;
    for (const [id, entry] of this.vectors.entries()) {
      if (entry.metadata.source === source) {
        this.vectors.delete(id);
        count++;
      }
    }
    return count;
  }

  /**
   * Get store statistics.
   */
  stats(): { totalVectors: number; sources: string[]; dimensions: number | null } {
    const sources = new Set<string>();
    let dimensions: number | null = null;

    for (const entry of this.vectors.values()) {
      sources.add(entry.metadata.source);
      if (dimensions === null && entry.embedding.length > 0) {
        dimensions = entry.embedding.length;
      }
    }

    return {
      totalVectors: this.vectors.size,
      sources: Array.from(sources),
      dimensions,
    };
  }

  /** Export all entries (for optional persistence). */
  export(): VectorEntry[] {
    return Array.from(this.vectors.values());
  }

  /**
   * Import entries (from optional persistence).
   * Overwrites existing entries with the same id.
   */
  import(entries: VectorEntry[]): void {
    for (const entry of entries) {
      this.vectors.set(entry.id, entry);
    }
  }

  /** Clear all vectors. */
  clear(): void {
    this.vectors.clear();
  }

  /** Number of vectors currently stored. */
  size(): number {
    return this.vectors.size;
  }
}

// Singleton instance for the RAG pipeline
export const vectorStore = new VectorStore();
export default vectorStore;
