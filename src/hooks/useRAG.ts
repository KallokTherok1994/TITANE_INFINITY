/**
 * useRAG Hook (v19.0 Task 10)
 *
 * React hook for RAG operations
 */

import { useState, useCallback, useEffect } from 'react';
import ragService, { type DocumentChunk, type SearchResult, type RAGQueryOptions } from '../services/ragService';

interface RAGState {
  loading: boolean;
  error: string | null;
  indexedDocuments: string[];
  searchResults: SearchResult[] | null;
  answer: string | null;
}

export function useRAG() {
  const [state, setState] = useState<RAGState>({
    loading: false,
    error: null,
    indexedDocuments: [],
    searchResults: null,
    answer: null,
  });

  /**
   * Initialize RAG service
   */
  useEffect(() => {
    ragService.initialize().catch(err => {
      setState(prev => ({ ...prev, error: err.message }));
    });
  }, []);

  /**
   * Refresh indexed documents list
   */
  const refreshDocuments = useCallback(() => {
    const docs = ragService.getIndexedDocuments();
    setState(prev => ({ ...prev, indexedDocuments: docs }));
  }, []);

  /**
   * Ingest document
   */
  const ingestDocument = useCallback(
    async (
      content: string,
      metadata: Omit<DocumentChunk['metadata'], 'timestamp'>
    ) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        await ragService.ingestDocument(content, metadata);
        refreshDocuments();
        setState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ingestion failed';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [refreshDocuments]
  );

  /**
   * Semantic search
   */
  const search = useCallback(async (query: string, options?: RAGQueryOptions) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const results = await ragService.search(query, options);
      setState(prev => ({ ...prev, searchResults: results, loading: false }));
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * RAG-enhanced query
   */
  const query = useCallback(async (question: string, options?: RAGQueryOptions) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ragService.query(question, options);
      setState(prev => ({
        ...prev,
        answer: result.answer,
        searchResults: result.sources,
        loading: false,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Query failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Delete document
   */
  const deleteDocument = useCallback(
    async (source: string) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        await ragService.deleteDocument(source);
        refreshDocuments();
        setState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Delete failed';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [refreshDocuments]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      indexedDocuments: [],
      searchResults: null,
      answer: null,
    });
  }, []);

  // Auto-refresh documents on mount
  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return {
    ...state,
    ingestDocument,
    search,
    query,
    deleteDocument,
    refreshDocuments,
    reset,
  };
}
