/**
 * TITANE∞ v29.0.0 — UI Store Selectors
 * Optimized selectors with shallow equality for uiStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useUIStore } from './uiStore';
import { shallow } from 'zustand/shallow';

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
    state => ({
      collapsed: state.sidebarCollapsed,
      width: state.sidebarWidth,
    }),
    shallow
  );

/**
 * Modal state (open + content)
 * Use when component needs both values
 */
export const useModalState = () =>
  useUIStore(
    state => ({
      open: state.modalOpen,
      content: state.modalContent,
    }),
    shallow
  );

/**
 * Loading state with toasts count
 * Use for UI components that show loading + notification badge
 */
export const useLoadingState = () =>
  useUIStore(
    state => ({
      loading: state.loading,
      toastsCount: state.toasts.length,
    }),
    shallow
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
    state => ({
      toggleSidebar: state.toggleSidebar,
      setSidebarCollapsed: state.setSidebarCollapsed,
      setSidebarWidth: state.setSidebarWidth,
    }),
    shallow
  );

/**
 * Modal actions
 * Use when component only needs actions, not state
 */
export const useModalActions = () =>
  useUIStore(
    state => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }),
    shallow
  );

/**
 * Toast actions
 * Use when component only needs actions, not state
 */
export const useToastActions = () =>
  useUIStore(
    state => ({
      addToast: state.addToast,
      removeToast: state.removeToast,
    }),
    shallow
  );

/**
 * ExpPanel actions
 * Use when component only needs actions, not state
 */
export const useExpPanelActions = () =>
  useUIStore(
    state => ({
      openExpPanel: state.openExpPanel,
      closeExpPanel: state.closeExpPanel,
    }),
    shallow
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
