/**
 * TITANE∞ v32.0.0 — Vision Store Selectors
 * Optimized selectors with shallow equality for useVisionStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { selectIsObservationActive, useVisionStore } from './useVisionStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useVisionObservationActive = () => useVisionStore(selectIsObservationActive);

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const useEnableVision = () => useVisionStore(state => state.enableVision);
export const useDisableVision = () => useVisionStore(state => state.disableVision);
