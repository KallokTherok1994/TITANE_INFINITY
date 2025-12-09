/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - panelsStore (Zustand)
 * Store global pour gestion d'état de tous les panels
 *
 * Features:
 * - ✅ Multi-panel state management
 * - ✅ Position & size tracking
 * - ✅ Collapsed/Expanded states
 * - ✅ Z-index orchestration
 * - ✅ LocalStorage persistence
 * - ✅ Mobile responsive helpers
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

/**
 * Interface pour un panel individuel
 */
export interface PanelConfig {
  id: string;
  title: string;
  isVisible: boolean;
  isCollapsed: boolean;
  isPinned: boolean; // Pin to stay always visible
  zIndex: number;

  // Position (null = auto-position)
  position: {
    x: number | null;
    y: number | null;
  };

  // Size (null = auto-size)
  size: {
    width: number | null;
    height: number | null;
  };

  // Responsive
  hiddenOnMobile: boolean; // Auto-hide on mobile
  collapsedOnMobile: boolean; // Auto-collapse on mobile

  // Metadata
  lastInteraction: number; // Timestamp
  interactionCount: number;
}

/**
 * IDs des panels connus
 */
export type PanelId =
  | 'chat'
  | 'memory'
  | 'devtools'
  | 'selfhealing'
  | 'governance'
  | 'effects'
  | 'performance'
  | 'settings';

/**
 * Interface pour l'état global des panels
 */
export interface PanelsState {
  // Map de tous les panels
  panels: Map<string, PanelConfig>;

  // Z-index max actuel
  maxZIndex: number;

  // Panel actuellement au focus
  focusedPanelId: string | null;

  // Mobile mode
  isMobileView: boolean;

  // Layout presets
  currentLayout: 'default' | 'minimal' | 'dev' | 'focus';
}

/**
 * Interface pour les actions du store
 */
export interface PanelsStoreActions {
  // Panel Management
  registerPanel: (config: Partial<PanelConfig> & { id: string }) => void;
  unregisterPanel: (id: string) => void;
  getPanel: (id: string) => PanelConfig | undefined;

  // Visibility
  showPanel: (id: string) => void;
  hidePanel: (id: string) => void;
  togglePanel: (id: string) => void;

  // Collapse
  collapsePanel: (id: string) => void;
  expandPanel: (id: string) => void;
  toggleCollapse: (id: string) => void;

  // Z-Index Management
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // Position & Size
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;
  resetPosition: (id: string) => void;
  resetSize: (id: string) => void;

  // Pin
  pinPanel: (id: string) => void;
  unpinPanel: (id: string) => void;
  togglePin: (id: string) => void;

  // Focus
  setFocus: (id: string) => void;
  clearFocus: () => void;

  // Mobile
  setMobileView: (isMobile: boolean) => void;
  applyMobileLayout: () => void;

  // Layouts
  applyLayout: (layout: 'default' | 'minimal' | 'dev' | 'focus') => void;
  resetAllPanels: () => void;

  // Bulk Operations
  showAll: () => void;
  hideAll: () => void;
  collapseAll: () => void;
  expandAll: () => void;

  // Helpers
  getVisiblePanels: () => PanelConfig[];
  getCollapsedPanels: () => PanelConfig[];
  getPinnedPanels: () => PanelConfig[];
}

/**
 * Type combiné du store
 */
export type PanelsStore = PanelsState & PanelsStoreActions;

/**
 * Configuration par défaut d'un panel
 */
const defaultPanelConfig: Omit<PanelConfig, 'id' | 'title'> = {
  isVisible: true,
  isCollapsed: false,
  isPinned: false,
  zIndex: 10,
  position: { x: null, y: null },
  size: { width: null, height: null },
  hiddenOnMobile: false,
  collapsedOnMobile: true,
  lastInteraction: Date.now(),
  interactionCount: 0,
};

/**
 * Store Zustand pour les Panels v21
 *
 * @example
 * ```tsx
 * import { usePanelsStore } from '@/stores/panelsStore';
 *
 * function MyPanel() {
 *   const {
 *     getPanel,
 *     showPanel,
 *     collapsePanel,
 *     bringToFront
 *   } = usePanelsStore();
 *
 *   const panel = getPanel('chat');
 *
 *   return (
 *     <div
 *       style={{ zIndex: panel?.zIndex }}
 *       onClick={() => bringToFront('chat')}
 *     >
 *       {panel?.isCollapsed ? 'Collapsed' : 'Expanded'}
 *       <button onClick={() => collapsePanel('chat')}>
 *         Collapse
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const usePanelsStore = create<PanelsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ═══════════════════════════════════════════════════════════
        // STATE INITIAL
        // ═══════════════════════════════════════════════════════════

        panels: new Map(),
        maxZIndex: 100,
        focusedPanelId: null,
        isMobileView: false,
        currentLayout: 'default',

        // ═══════════════════════════════════════════════════════════
        // PANEL MANAGEMENT
        // ═══════════════════════════════════════════════════════════

        registerPanel: (config) => {
          set((state) => {
            const newPanels = new Map(state.panels);
            const existingPanel = newPanels.get(config.id);

            // Si panel existe, merge config
            if (existingPanel) {
              newPanels.set(config.id, {
                ...existingPanel,
                ...config,
              });
            } else {
              // Nouveau panel
              newPanels.set(config.id, {
                ...defaultPanelConfig,
                ...config,
                title: config.title || config.id,
              });
            }

            return { panels: newPanels };
          });
        },

        unregisterPanel: (id) => {
          set((state) => {
            const newPanels = new Map(state.panels);
            newPanels.delete(id);
            return {
              panels: newPanels,
              focusedPanelId:
                state.focusedPanelId === id ? null : state.focusedPanelId,
            };
          });
        },

        getPanel: (id) => {
          return get().panels.get(id);
        },

        // ═══════════════════════════════════════════════════════════
        // VISIBILITY
        // ═══════════════════════════════════════════════════════════

        showPanel: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              isVisible: true,
              lastInteraction: Date.now(),
              interactionCount: panel.interactionCount + 1,
            });

            return { panels: newPanels };
          });
        },

        hidePanel: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              isVisible: false,
              lastInteraction: Date.now(),
              interactionCount: panel.interactionCount + 1,
            });

            return {
              panels: newPanels,
              focusedPanelId: state.focusedPanelId === id ? null : state.focusedPanelId,
            };
          });
        },

        togglePanel: (id) => {
          const panel = get().panels.get(id);
          if (panel?.isVisible) {
            get().hidePanel(id);
          } else {
            get().showPanel(id);
          }
        },

        // ═══════════════════════════════════════════════════════════
        // COLLAPSE
        // ═══════════════════════════════════════════════════════════

        collapsePanel: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              isCollapsed: true,
              lastInteraction: Date.now(),
            });

            return { panels: newPanels };
          });
        },

        expandPanel: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              isCollapsed: false,
              lastInteraction: Date.now(),
            });

            return { panels: newPanels };
          });
        },

        toggleCollapse: (id) => {
          const panel = get().panels.get(id);
          if (panel?.isCollapsed) {
            get().expandPanel(id);
          } else {
            get().collapsePanel(id);
          }
        },

        // ═══════════════════════════════════════════════════════════
        // Z-INDEX MANAGEMENT
        // ═══════════════════════════════════════════════════════════

        bringToFront: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newMaxZ = state.maxZIndex + 1;
            const newPanels = new Map(state.panels);

            newPanels.set(id, {
              ...panel,
              zIndex: newMaxZ,
              lastInteraction: Date.now(),
              interactionCount: panel.interactionCount + 1,
            });

            return {
              panels: newPanels,
              maxZIndex: newMaxZ,
              focusedPanelId: id,
            };
          });
        },

        sendToBack: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              zIndex: 10, // Base z-index
              lastInteraction: Date.now(),
            });

            return { panels: newPanels };
          });
        },

        // ═══════════════════════════════════════════════════════════
        // POSITION & SIZE
        // ═══════════════════════════════════════════════════════════

        updatePosition: (id, x, y) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              position: { x, y },
              lastInteraction: Date.now(),
            });

            return { panels: newPanels };
          });
        },

        updateSize: (id, width, height) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              size: { width, height },
              lastInteraction: Date.now(),
            });

            return { panels: newPanels };
          });
        },

        resetPosition: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              position: { x: null, y: null },
            });

            return { panels: newPanels };
          });
        },

        resetSize: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              size: { width: null, height: null },
            });

            return { panels: newPanels };
          });
        },

        // ═══════════════════════════════════════════════════════════
        // PIN
        // ═══════════════════════════════════════════════════════════

        pinPanel: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              isPinned: true,
            });

            return { panels: newPanels };
          });
        },

        unpinPanel: (id) => {
          set((state) => {
            const panel = state.panels.get(id);
            if (!panel) return state;

            const newPanels = new Map(state.panels);
            newPanels.set(id, {
              ...panel,
              isPinned: false,
            });

            return { panels: newPanels };
          });
        },

        togglePin: (id) => {
          const panel = get().panels.get(id);
          if (panel?.isPinned) {
            get().unpinPanel(id);
          } else {
            get().pinPanel(id);
          }
        },

        // ═══════════════════════════════════════════════════════════
        // FOCUS
        // ═══════════════════════════════════════════════════════════

        setFocus: (id) => {
          get().bringToFront(id);
        },

        clearFocus: () => {
          set({ focusedPanelId: null });
        },

        // ═══════════════════════════════════════════════════════════
        // MOBILE
        // ═══════════════════════════════════════════════════════════

        setMobileView: (isMobile) => {
          set({ isMobileView: isMobile });

          if (isMobile) {
            get().applyMobileLayout();
          }
        },

        applyMobileLayout: () => {
          set((state) => {
            const newPanels = new Map(state.panels);

            newPanels.forEach((panel, id) => {
              newPanels.set(id, {
                ...panel,
                isVisible: panel.hiddenOnMobile ? false : panel.isVisible,
                isCollapsed: panel.collapsedOnMobile ? true : panel.isCollapsed,
                position: { x: null, y: null }, // Reset position
              });
            });

            return { panels: newPanels };
          });
        },

        // ═══════════════════════════════════════════════════════════
        // LAYOUTS
        // ═══════════════════════════════════════════════════════════

        applyLayout: (layout) => {
          set({ currentLayout: layout });

          switch (layout) {
            case 'minimal':
              // Tout collapser sauf pinned
              get().panels.forEach((panel, id) => {
                if (!panel.isPinned) {
                  get().collapsePanel(id);
                }
              });
              break;

            case 'dev':
              // Afficher devtools, selfhealing, performance
              get().showPanel('devtools');
              get().showPanel('selfhealing');
              get().showPanel('performance');
              get().expandPanel('devtools');
              break;

            case 'focus':
              // Tout masquer sauf chat et memory
              get().hideAll();
              get().showPanel('chat');
              get().showPanel('memory');
              break;

            case 'default':
            default:
              // Reset all
              get().resetAllPanels();
              break;
          }
        },

        resetAllPanels: () => {
          set((state) => {
            const newPanels = new Map(state.panels);

            newPanels.forEach((panel, id) => {
              newPanels.set(id, {
                ...defaultPanelConfig,
                id: panel.id,
                title: panel.title,
              });
            });

            return {
              panels: newPanels,
              maxZIndex: 100,
              focusedPanelId: null,
              currentLayout: 'default',
            };
          });
        },

        // ═══════════════════════════════════════════════════════════
        // BULK OPERATIONS
        // ═══════════════════════════════════════════════════════════

        showAll: () => {
          get().panels.forEach((_, id) => {
            get().showPanel(id);
          });
        },

        hideAll: () => {
          get().panels.forEach((_, id) => {
            get().hidePanel(id);
          });
        },

        collapseAll: () => {
          get().panels.forEach((_, id) => {
            get().collapsePanel(id);
          });
        },

        expandAll: () => {
          get().panels.forEach((_, id) => {
            get().expandPanel(id);
          });
        },

        // ═══════════════════════════════════════════════════════════
        // HELPERS
        // ═══════════════════════════════════════════════════════════

        getVisiblePanels: () => {
          return Array.from(get().panels.values()).filter((p) => p.isVisible);
        },

        getCollapsedPanels: () => {
          return Array.from(get().panels.values()).filter((p) => p.isCollapsed);
        },

        getPinnedPanels: () => {
          return Array.from(get().panels.values()).filter((p) => p.isPinned);
        },
      }),
      {
        name: 'titane-panels-store',
        // Sérialiser Map en array pour localStorage
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;

            const data = JSON.parse(str);
            if (data.state?.panels) {
              data.state.panels = new Map(data.state.panels);
            }
            return data;
          },
          setItem: (name, value) => {
            const data = {
              ...value,
              state: {
                ...value.state,
                panels: Array.from(value.state.panels.entries()),
              },
            };
            localStorage.setItem(name, JSON.stringify(data));
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    ),
    {
      name: 'TITANE∞ Panels Store',
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Sélecteurs optimisés
 */
export const panelsSelectors = {
  // Panel spécifique
  panel: (id: string) => (state: PanelsStore) => state.panels.get(id),

  // Panels visibles
  visiblePanels: (state: PanelsStore) => state.getVisiblePanels(),

  // Focused panel
  focusedPanel: (state: PanelsStore) =>
    state.focusedPanelId ? state.panels.get(state.focusedPanelId) : null,

  // Is mobile
  isMobile: (state: PanelsStore) => state.isMobileView,

  // Current layout
  layout: (state: PanelsStore) => state.currentLayout,
};

/**
 * Hook helper pour un panel spécifique
 */
export const usePanel = (id: string) =>
  usePanelsStore((state) => state.panels.get(id));

/**
 * Hook helper pour les panels visibles
 */
export const useVisiblePanels = () => usePanelsStore(panelsSelectors.visiblePanels);

/**
 * Hook helper pour le panel au focus
 */
export const useFocusedPanel = () => usePanelsStore(panelsSelectors.focusedPanel);
