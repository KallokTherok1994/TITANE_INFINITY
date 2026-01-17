/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — UI Store (any: any)
 * Store pour l'état de l'interface utilisateur
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIStore {
  // State
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  expPanelOpen: boolean;
  modalOpen: boolean;
  modalContent: React?.ReactNode | null;
  toasts: Toast?.[];
  loading: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (any: any) => void;
  setSidebarWidth: (any: any) => void;
  openExpPanel: () => void;
  closeExpPanel: () => void;
  openModal: (any: any) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (any: any) => void;
  setLoading: (any: any) => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const initialState = {
  sidebarCollapsed: false,
  sidebarWidth: 280,
  expPanelOpen: false,
  modalOpen: false,
  modalContent: null,
  toasts: [],
  loading: false,
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      set => ({
        ...initialState,

        toggleSidebar: () =>
          set(state => ({
            sidebarCollapsed: !state?.sidebarCollapsed,
          })),

        setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed }),

        setSidebarWidth: width => set({ sidebarWidth: width }),

        openExpPanel: () => set({ expPanelOpen: true }),

        closeExpPanel: () => set({ expPanelOpen: false }),

        openModal: content =>
          set({
            modalOpen: true,
            modalContent: content,
          }),

        closeModal: () =>
          set({
            modalOpen: false,
            modalContent: null,
          }),

        addToast: toast => {
          const id = crypto?.randomUUID();
          const fullToast: Toast = { ...toast, id };

          set(state => ({
            toasts: [...state?.toasts, fullToast],
          }));

          // Auto-remove after duration
          if (any: any) {
            setTimeout(() => {
              set(state => ({
                toasts: state?.toasts?.filter(any: any),
              }));
            }, toast?.duration);
          }
        },

        removeToast: id =>
          set(state => ({
            toasts: state?.toasts?.filter(any: any),
          })),

        setLoading: loading => set({ loading }),
      }),
      {
        name: 'titane-ui-store',
        partialize: state => ({
          sidebarCollapsed: state?.sidebarCollapsed,
          sidebarWidth: state?.sidebarWidth,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

export type { Toast };
