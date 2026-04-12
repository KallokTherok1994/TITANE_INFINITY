/**
 * TITANE∞ v32.0.0 — Performance Store Selectors
 * Optimized selectors with shallow equality for usePerformanceStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useShallow } from 'zustand/react/shallow';
import { usePerformanceStore } from './usePerformanceStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const usePerformanceMetrics = () => usePerformanceStore(state => state.metrics);
export const usePerformanceSuggestions = () =>
  usePerformanceStore(state => state.suggestions);
export const usePerformanceInitialized = () =>
  usePerformanceStore(state => state.isInitialized);
export const usePerformanceMonitoring = () =>
  usePerformanceStore(state => state.isMonitoring);
export const usePerformanceProfiling = () =>
  usePerformanceStore(state => state.isProfiling);
export const usePerformanceLoading = () => usePerformanceStore(state => state.isLoading);
export const usePerformanceError = () => usePerformanceStore(state => state.error);
export const usePerformanceStats = () => usePerformanceStore(state => state.stats);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

export const usePerformanceSnapshot = () =>
  usePerformanceStore(
    useShallow(state => ({
      metrics: state.metrics,
      suggestions: state.suggestions,
      stats: state.stats,
      isInitialized: state.isInitialized,
      isMonitoring: state.isMonitoring,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const usePerformanceActions = () =>
  usePerformanceStore(
    useShallow(state => ({
      initialize: state.initialize,
      reset: state.reset,
      recordMetric: state.recordMetric,
      clearMetrics: state.clearMetrics,
      startMonitoring: state.startMonitoring,
      stopMonitoring: state.stopMonitoring,
      startProfiling: state.startProfiling,
      stopProfiling: state.stopProfiling,
      generateSuggestions: state.generateSuggestions,
      applySuggestion: state.applySuggestion,
      setError: state.setError,
    }))
  );
