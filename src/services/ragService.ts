/**
 * RAG Service (v19.0 Task 10)
 *
 * Retrieval-Augmented Generation for TITANE∞
 *
 * Features:
 * - Document ingestion and chunking
 * - Vector embeddings
 * - Semantic search
 * - Context-aware AI responses
 *
 * Architecture:
 * - Local vector storage (in-memory or IndexedDB)
 * - Integration with AI chat for RAG-enhanced responses
 * - Support for multiple document types (code, markdown, text)
 */

import { invokeTauriCommand } from './tauriBridge';

/**
 * Document chunk with metadata
 */
export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'code' | 'markdown' | 'text' | 'documentation';
    timestamp: number;
    language?: string;
    filePath?: string;
  };
  embedding?: number[]; // Vector embedding
}

/**
 * Search result with relevance score
 */
export interface SearchResult {
  chunk: DocumentChunk;
  score: number; // Similarity score (0-1)
  context?: string; // Surrounding context
}

/**
 * RAG query options
 */
export interface RAGQueryOptions {
  topK?: number; // Number of results to return (default: 5)
  minScore?: number; // Minimum similarity score (default: 0.7)
  includeContext?: boolean; // Include surrounding chunks
  filters?: {
    type?: DocumentChunk['metadata']['type'];
    source?: string;
    language?: string;
  };
}

/**
 * RAG Service Class
 */
class RAGService {
  private chunks: Map<string, DocumentChunk> = new Map();
  private initialized = false;

  /**
   * Initialize RAG service
   */
  async initialize() {
    if (this.initialized) return;

    // Load existing chunks from backend
    try {
      const response = await invokeTauriCommand<DocumentChunk[]>(
        'rag_get_all_chunks',
        {}
      );
      if (response.success && response.data) {
        response.data?.forEach(chunk => {
          this.chunks.set(chunk.id, chunk);
        });
      }
      this.initialized = true;
    } catch (error) {
      console.error('[RAG] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ingest document and create chunks
   */
  async ingestDocument(
    content: string,
    metadata: Omit<DocumentChunk['metadata'], 'timestamp'>
  ): Promise<DocumentChunk[]> {
    // Split content into chunks (simple paragraph-based chunking)
    const chunks = this.chunkContent(content);

    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
      id: `${metadata.source}_${index}_${Date.now()}`,
      content: chunk,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
      },
    }));

    // Generate embeddings (via backend)
    const chunksWithEmbeddings = await this.generateEmbeddings(documentChunks);

    // Store chunks
    chunksWithEmbeddings.forEach(chunk => {
      this.chunks.set(chunk.id, chunk);
    });

    // Persist to backend
    await invokeTauriCommand('rag_store_chunks', { chunks: chunksWithEmbeddings });

    return chunksWithEmbeddings;
  }

  /**
   * Semantic search
   */
  async search(query: string, options: RAGQueryOptions = {}): Promise<SearchResult[]> {
    const { topK = 5, minScore = 0.7, includeContext = false, filters } = options;

    // Generate query embedding (via backend)
    const queryEmbedding = await this.generateQueryEmbedding(query);

    // Calculate similarity scores
    const results: SearchResult[] = [];

    for (const [_id, chunk] of this.chunks.entries()) {
      // Apply filters
      if (filters) {
        if (filters.type && chunk.metadata?.type !== filters.type) continue;
        if (filters.source && chunk.metadata?.source !== filters.source) continue;
        if (filters.language && chunk.metadata?.language !== filters.language) continue;
      }

      // Calculate cosine similarity
      if (chunk.embedding) {
        const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);

        if (score >= minScore) {
          results.push({
            chunk,
            score,
            context: includeContext ? this.getContext(chunk.id) : undefined,
          });
        }
      }
    }

    // Sort by score and return top K
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * RAG-enhanced query (search + AI response)
   */
  async query(
    question: string,
    options: RAGQueryOptions = {}
  ): Promise<{
    answer: string;
    sources: SearchResult[];
  }> {
    // 1. Semantic search
    const sources = await this.search(question, options);

    // 2. Build context from top results
    const context = sources.map(result => result.chunk.content).join('\n\n---\n\n');

    // 3. Query AI with context
    const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer based on the context above:`;

    // Call AI chat service (assumes aiChatClient is available)
    const response = await invokeTauriCommand<string>('ai_chat', {
      message: prompt,
      system_prompt:
        'You are a helpful assistant that answers questions based on provided context.',
    });

    return {
      answer: response.data || 'No answer generated',
      sources,
    };
  }

  /**
   * Delete document chunks
   */
  async deleteDocument(source: string): Promise<void> {
    const toDelete = Array.from(this.chunks.values())
      .filter(chunk => chunk.metadata?.source === source)
      .map(chunk => chunk.id);

    toDelete.forEach(id => this.chunks.delete(id));

    await invokeTauriCommand('rag_delete_chunks', { ids: toDelete });
  }

  /**
   * Get all indexed documents
   */
  getIndexedDocuments(): string[] {
    const sources = new Set<string>();
    this.chunks.forEach(chunk => sources.add(chunk.metadata?.source));
    return Array.from(sources);
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Chunk content into smaller pieces
   */
  private chunkContent(content: string, maxChunkSize: number = 500): string[] {
    // Simple paragraph-based chunking
    const paragraphs = content.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const para of paragraphs) {
      if ((currentChunk + para).length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  /**
   * Generate embeddings for chunks
   */
  private async generateEmbeddings(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    try {
      const response = await invokeTauriCommand<{ embeddings: number[][] }>(
        'rag_generate_embeddings',
        {
          texts: chunks.map(c => c.content),
        }
      );

      if (response.success && response.data) {
        return chunks.map((chunk, index) => ({
          ...chunk,
          embedding: response.data?.embeddings[index] || [],
        }));
      }
    } catch (error) {
      console.error('[RAG] Embedding generation failed:', error);
    }

    return chunks;
  }

  /**
   * Generate embedding for query
   */
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const response = await invokeTauriCommand<{ embedding: number[] }>(
        'rag_generate_embedding',
        {
          text: query,
        }
      );

      if (response.success && response.data) {
        return response.data?.embedding;
      }
    } catch (error) {
      console.error('[RAG] Query embedding failed:', error);
    }

    // Fallback: random embedding (for testing)
    return Array(384)
      .fill(0)
      .map(() => Math.random());
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get context (surrounding chunks) for a given chunk
   */
  private getContext(chunkId: string): string {
    const chunk = this.chunks.get(chunkId);
    if (!chunk) return '';

    // Find chunks from same source
    const sameSource = Array.from(this.chunks.values())
      .filter(c => c.metadata?.source === chunk.metadata?.source)
      .sort((a, b) => a.metadata?.timestamp - b.metadata?.timestamp);

    const index = sameSource.findIndex(c => c.id === chunkId);

    // Get previous and next chunks
    const contextChunks = [
      sameSource[index - 1],
      sameSource[index],
      sameSource[index + 1],
    ].filter(Boolean);

    return contextChunks.map(c => c.content).join('\n\n');
  }
}

// Export singleton instance
export const ragService = new RAGService();
export default ragService;
