/**
 * TITANE∞ v32.0.0 — ChatMode Store Selectors
 * Optimized selectors with shallow equality for useChatModeStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useShallow } from 'zustand/react/shallow';
import {
  useChatModeStore,
  useCurrentChatModeId,
  useCurrentChatMode,
  useAvailableChatModes,
} from './useChatModeStore';

// ═══════════════════════════════════════════════════════════════
// RE-EXPORT EXISTING PRIMITIVE SELECTORS
// ═══════════════════════════════════════════════════════════════

export { useCurrentChatModeId, useCurrentChatMode, useAvailableChatModes };

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

export const useChatModeSnapshot = () =>
  useChatModeStore(
    useShallow(state => ({
      currentModeId: state.currentModeId,
      currentMode: state.currentMode,
      availableModes: state.availableModes,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const useChatModeActions = () =>
  useChatModeStore(
    useShallow(state => ({
      initialize: state.initialize,
      changeMode: state.changeMode,
    }))
  );
