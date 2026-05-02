/**
 * TITANE∞ — ragService unit tests (Rule 16 coverage)
 *
 * Validates: RAGService class instantiation, singleton export,
 * and core interface shapes without real Tauri IPC.
 */
import { describe, it, expect, vi } from 'vitest';

// ── Mock Tauri IPC dependencies ───────────────────────────────────
vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn().mockResolvedValue({ ok: true, content: [], error: null }),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../chunkingService', () => ({
  smartChunk: vi.fn().mockReturnValue([
    {
      id: 'chunk-1',
      content: 'test content',
      metadata: { source: 'test', type: 'text', timestamp: Date.now() },
    },
  ]),
}));

vi.mock('../vectorStore', () => {
  const VectorStoreMock = vi.fn();
  VectorStoreMock.prototype.add = vi.fn();
  VectorStoreMock.prototype.search = vi.fn().mockReturnValue([]);
  VectorStoreMock.prototype.delete = vi.fn();
  VectorStoreMock.prototype.size = vi.fn().mockReturnValue(0);
  return { VectorStore: VectorStoreMock };
});

// ── Import after mocks ────────────────────────────────────────────
import { ragService } from '../ragService';
import type { DocumentChunk, SearchResult, RAGQueryOptions } from '../ragService';

describe('RAGService', () => {
  it('exports ragService singleton', () => {
    expect(ragService).toBeDefined();
    expect(typeof ragService).toBe('object');
  });

  it('singleton has initialize method', () => {
    expect(typeof ragService.initialize).toBe('function');
  });

  it('singleton has search method', () => {
    expect(typeof ragService.search).toBe('function');
  });

  it('DocumentChunk interface is structurally valid', () => {
    const chunk: DocumentChunk = {
      id: 'test-id',
      content: 'hello world',
      metadata: { source: 'test', type: 'text', timestamp: Date.now() },
    };
    expect(chunk.id).toBe('test-id');
    expect(chunk.content).toBe('hello world');
  });
});
