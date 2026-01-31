/**
 * TITANE∞ v29.0.0 — UI Store Selectors
 * Optimized selectors with shallow equality for uiStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useUIStore } from './uiStore';
import { useShallow } from 'zustand/react/shallow';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useSidebarCollapsed = () => useUIStore(state => state.sidebarCollapsed);
export const useSidebarWidth = () => useUIStore(state => state.sidebarWidth);
export const useExpPanelOpen = () => useUIStore(state => state.expPanelOpen);
export const useModalOpen = () => useUIStore(state => state.modalOpen);
export const useModalContent = () => useUIStore(state => state.modalContent);
export const useToasts = () => useUIStore(state => state.toasts);
export const useLoading = () => useUIStore(state => state.loading);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

/**
 * Sidebar state (collapsed + width)
 * Use when component needs both values
 */
export const useSidebarState = () =>
  useUIStore(
    useShallow(state => ({
      collapsed: state.sidebarCollapsed,
      width: state.sidebarWidth,
    }))
  );

/**
 * Modal state (open + content)
 * Use when component needs both values
 */
export const useModalState = () =>
  useUIStore(
    useShallow(state => ({
      open: state.modalOpen,
      content: state.modalContent,
    }))
  );

/**
 * Loading state with toasts count
 * Use for UI components that show loading + notification badge
 */
export const useLoadingState = () =>
  useUIStore(
    useShallow(state => ({
      loading: state.loading,
      toastsCount: state.toasts.length,
    }))
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

/**
 * Sidebar actions
 * Use when component only needs actions, not state
 */
export const useSidebarActions = () =>
  useUIStore(
    useShallow(state => ({
      toggleSidebar: state.toggleSidebar,
      setSidebarCollapsed: state.setSidebarCollapsed,
      setSidebarWidth: state.setSidebarWidth,
    }))
  );

/**
 * Modal actions
 * Use when component only needs actions, not state
 */
export const useModalActions = () =>
  useUIStore(
    useShallow(state => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

/**
 * Toast actions
 * Use when component only needs actions, not state
 */
export const useToastActions = () =>
  useUIStore(
    useShallow(state => ({
      addToast: state.addToast,
      removeToast: state.removeToast,
    }))
  );

/**
 * ExpPanel actions
 * Use when component only needs actions, not state
 */
export const useExpPanelActions = () =>
  useUIStore(
    useShallow(state => ({
      openExpPanel: state.openExpPanel,
      closeExpPanel: state.closeExpPanel,
    }))
  );

// ═══════════════════════════════════════════════════════════════
// COMPUTED SELECTORS (Derived State with Memoization)
// ═══════════════════════════════════════════════════════════════

/**
 * Has active toasts (boolean)
 * Use for components that only need to know if toasts exist
 */
export const useHasToasts = () => useUIStore(state => state.toasts.length > 0);

/**
 * Toast count (number)
 * Use for badge displays
 */
export const useToastCount = () => useUIStore(state => state.toasts.length);

/**
 * Is sidebar expanded (boolean, inverse of collapsed)
 * Use for components that prefer "expanded" logic
 */
export const useSidebarExpanded = () => useUIStore(state => !state.sidebarCollapsed);

/**
 * Is any modal or panel open (boolean)
 * Use for backdrop/overlay components
 */
export const useHasOverlay = () =>
  useUIStore(state => state.modalOpen || state.expPanelOpen);
