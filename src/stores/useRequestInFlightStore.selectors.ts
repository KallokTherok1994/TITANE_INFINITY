/**
 * TITANE∞ v32.0.0 — RequestInFlight Store Selectors
 * Optimized selectors for useRequestInFlightStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useRequestInFlightStore } from './useRequestInFlightStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useRequestInFlight = () =>
  useRequestInFlightStore(state => state.requestInFlight);

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const useSetRequestInFlight = () =>
  useRequestInFlightStore(state => state.setRequestInFlight);
