/**
 * TITANE∞ v32.0.0 — MemoryEngine Store Selectors
 * Optimized selectors with shallow equality for useMemoryEngineStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useShallow } from 'zustand/react/shallow';
import { useMemoryEngineStore } from './useMemoryEngineStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useMemoryEngineMemories = () =>
  useMemoryEngineStore(state => state.memories);
export const useMemoryEngineContext = () => useMemoryEngineStore(state => state.context);
export const useMemoryEngineInitialized = () =>
  useMemoryEngineStore(state => state.isInitialized);
export const useMemoryEngineLoading = () =>
  useMemoryEngineStore(state => state.isLoading);
export const useMemoryEngineError = () => useMemoryEngineStore(state => state.error);
export const useMemoryEngineStats = () => useMemoryEngineStore(state => state.stats);
export const useMemoryEngineIsCompressing = () =>
  useMemoryEngineStore(state => state.isCompressing);
export const useMemoryEngineIsSearching = () =>
  useMemoryEngineStore(state => state.isSearching);
export const useMemoryEngineSearchResults = () =>
  useMemoryEngineStore(state => state.searchResults);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

export const useMemoryEngineSnapshot = () =>
  useMemoryEngineStore(
    useShallow(state => ({
      memories: state.memories,
      stats: state.stats,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

export const useMemoryEngineSearchState = () =>
  useMemoryEngineStore(
    useShallow(state => ({
      searchResults: state.searchResults,
      isSearching: state.isSearching,
    }))
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const useMemoryEngineActions = () =>
  useMemoryEngineStore(
    useShallow(state => ({
      initialize: state.initialize,
      reset: state.reset,
      addMemory: state.addMemory,
      deleteMemory: state.deleteMemory,
      searchMemories: state.searchMemories,
      setContext: state.setContext,
      clearContext: state.clearContext,
      compressMemories: state.compressMemories,
      cleanup: state.cleanup,
      syncFromBackend: state.syncFromBackend,
      setError: state.setError,
      clearError: state.clearError,
    }))
  );
