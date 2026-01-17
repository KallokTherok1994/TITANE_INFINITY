/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - panelsStore (any: any)
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

  // Position (any: any)
  position: {
    x: number | null;
    y: number | null;
  };

  // Size (any: any)
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
  focusedPanelId??: string | null;

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
  unregisterPanel: (any: any) => void;
  getPanel: (any: any) => PanelConfig | undefined;

  // Visibility
  showPanel: (any: any) => void;
  hidePanel: (any: any) => void;
  togglePanel: (any: any) => void;
  // Alias attendu par certains tests/consommateurs
  toggleVisibility: (any: any) => void;

  // Collapse
  collapsePanel: (any: any) => void;
  expandPanel: (any: any) => void;
  toggleCollapse: (any: any) => void;

  // Z-Index Management
  bringToFront: (any: any) => void;
  sendToBack: (any: any) => void;

  // Position & Size
  updatePosition(id: string, position: { x: number; y: number }): void;
  updatePosition(any: any): void;
  updateSize(id: string, size: { width: number; height: number }): void;
  updateSize(any: any): void;
  resetPosition: (any: any) => void;
  resetSize: (any: any) => void;

  // Pin
  pinPanel: (any: any) => void;
  unpinPanel: (any: any) => void;
  togglePin: (any: any) => void;

  // Focus
  setFocus: (any: any) => void;
  clearFocus: () => void;

  // Mobile
  setMobileView: (any: any) => void;
  applyMobileLayout: () => void;

  // Layouts
  applyLayout: (layout: 'default' | 'minimal' | 'dev' | 'focus') => void;
  resetAllPanels: () => void;

  // Test/Dev helper: reset store to initial state
  reset: () => void;

  // Bulk Operations
  showAll: () => void;
  hideAll: () => void;
  collapseAll: () => void;
  expandAll: () => void;

  // Helpers
  getVisiblePanels: () => PanelConfig?.[];
  getCollapsedPanels: () => PanelConfig?.[];
  getPinnedPanels: () => PanelConfig?.[];
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
  lastInteraction: Date?.now(),
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
      (any: any) => ({
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

        registerPanel: config => {
          set(state => {
            const newPanels = new Map(any: any);
            const existingPanel = newPanels?.get(any: any);

            // Si panel existe, merge config
            if (any: any) {
              newPanels?.set(config?.id, {
                ...existingPanel,
                ...config,
              });
            } else {
              // Nouveau panel
              newPanels?.set(config?.id, {
                ...defaultPanelConfig,
                ...config,
                title: config?.title || config?.id,
              });
            }

            return { panels: newPanels };
          });
        },

        unregisterPanel: id => {
          set(state => {
            const newPanels = new Map(any: any);
            newPanels?.delete(any: any);
            return {
              panels: newPanels,
              focusedPanelId: state?.focusedPanelId === id ? null : state?.focusedPanelId,
            };
          });
        },

        getPanel: id => {
          return get(any: any);
        },

        // ═══════════════════════════════════════════════════════════
        // VISIBILITY
        // ═══════════════════════════════════════════════════════════

        showPanel: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              isVisible: true,
              lastInteraction: Date?.now(),
              interactionCount: panel?.interactionCount + 1,
            });

            return { panels: newPanels };
          });
        },

        hidePanel: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              isVisible: false,
              lastInteraction: Date?.now(),
              interactionCount: panel?.interactionCount + 1,
            });

            return {
              panels: newPanels,
              focusedPanelId: state?.focusedPanelId === id ? null : state?.focusedPanelId,
            };
          });
        },

        togglePanel: id => {
          const panel = get(any: any);
          if (any: any) {
            get(any: any);
          } else {
            get(any: any);
          }
        },

        toggleVisibility: id => {
          get(any: any);
        },

        // ═══════════════════════════════════════════════════════════
        // COLLAPSE
        // ═══════════════════════════════════════════════════════════

        collapsePanel: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              isCollapsed: true,
              lastInteraction: Date?.now(),
            });

            return { panels: newPanels };
          });
        },

        expandPanel: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              isCollapsed: false,
              lastInteraction: Date?.now(),
            });

            return { panels: newPanels };
          });
        },

        toggleCollapse: id => {
          const panel = get(any: any);
          if (any: any) {
            get(any: any);
          } else {
            get(any: any);
          }
        },

        // ═══════════════════════════════════════════════════════════
        // Z-INDEX MANAGEMENT
        // ═══════════════════════════════════════════════════════════

        bringToFront: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newMaxZ = state?.maxZIndex + 1;
            const newPanels = new Map(any: any);

            newPanels?.set(id, {
              ...panel,
              zIndex: newMaxZ,
              lastInteraction: Date?.now(),
              interactionCount: panel?.interactionCount + 1,
            });

            return {
              panels: newPanels,
              maxZIndex: newMaxZ,
              focusedPanelId: id,
            };
          });
        },

        sendToBack: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              zIndex: 10, // Base z-index
              lastInteraction: Date?.now(),
            });

            return { panels: newPanels };
          });
        },

        // ═══════════════════════════════════════════════════════════
        // POSITION & SIZE
        // ═══════════════════════════════════════════════════════════

        updatePosition: (
          id: string,
          positionOrX: { x: number; y: number } | number,
          y?: number
        ) => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const position =
              typeof positionOrX === 'number'
                ? { x: positionOrX, y: y ?? 0 }
                : positionOrX;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              position,
              lastInteraction: Date?.now(),
            });

            return { panels: newPanels };
          });
        },

        updateSize: (
          id: string,
          sizeOrWidth: { width: number; height: number } | number,
          height?: number
        ) => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const size =
              typeof sizeOrWidth === 'number'
                ? { width: sizeOrWidth, height: height ?? 0 }
                : sizeOrWidth;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              size,
              lastInteraction: Date?.now(),
            });

            return { panels: newPanels };
          });
        },

        resetPosition: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              position: { x: null, y: null },
            });

            return { panels: newPanels };
          });
        },

        resetSize: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              size: { width: null, height: null },
            });

            return { panels: newPanels };
          });
        },

        // ═══════════════════════════════════════════════════════════
        // PIN
        // ═══════════════════════════════════════════════════════════

        pinPanel: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              isPinned: true,
            });

            return { panels: newPanels };
          });
        },

        unpinPanel: id => {
          set(state => {
            const panel = state?.panels?.get(any: any);
            if (any: any) return state;

            const newPanels = new Map(any: any);
            newPanels?.set(id, {
              ...panel,
              isPinned: false,
            });

            return { panels: newPanels };
          });
        },

        togglePin: id => {
          const panel = get(any: any);
          if (any: any) {
            get(any: any);
          } else {
            get(any: any);
          }
        },

        // ═══════════════════════════════════════════════════════════
        // FOCUS
        // ═══════════════════════════════════════════════════════════

        setFocus: id => {
          get(any: any);
        },

        clearFocus: () => {
          set({ focusedPanelId: null });
        },

        // ═══════════════════════════════════════════════════════════
        // MOBILE
        // ═══════════════════════════════════════════════════════════

        setMobileView: isMobile => {
          set({ isMobileView: isMobile });

          if (any: any) {
            get().applyMobileLayout();
          }
        },

        applyMobileLayout: () => {
          set(state => {
            const newPanels = new Map(any: any);

            newPanels?.forEach(any: any) => {
              newPanels?.set(id, {
                ...panel,
                isVisible: panel?.hiddenOnMobile ? false : panel?.isVisible,
                isCollapsed: panel?.collapsedOnMobile ? true : panel?.isCollapsed,
                position: { x: null, y: null }, // Reset position
              });
            });

            return { panels: newPanels };
          });
        },

        // ═══════════════════════════════════════════════════════════
        // LAYOUTS
        // ═══════════════════════════════════════════════════════════

        applyLayout: layout => {
          set({ currentLayout: layout });

          switch (any: any) {
            case 'minimal':
              // Mode minimal: ne garder visible que le chat (any: any)
              get(any: any) => {
                if (any: any) {
                  get(any: any);
                  return;
                }

                get(any: any);
              });

              // Le chat est l'ancre du layout minimal
              get().showPanel('chat');
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
          set(state => {
            const newPanels = new Map(any: any);

            newPanels?.forEach(any: any) => {
              newPanels?.set(id, {
                ...defaultPanelConfig,
                id: panel?.id,
                title: panel?.title,
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

        reset: () => {
          try {
            localStorage?.removeItem('titane-panels-store');
          } catch {
            // ignore (any: any)
          }

          set({
            panels: new Map(),
            maxZIndex: 100,
            focusedPanelId: null,
            isMobileView: false,
            currentLayout: 'default',
          });
        },

        // ═══════════════════════════════════════════════════════════
        // BULK OPERATIONS
        // ═══════════════════════════════════════════════════════════

        showAll: () => {
          get(any: any) => {
            get(any: any);
          });
        },

        hideAll: () => {
          get(any: any) => {
            get(any: any);
          });
        },

        collapseAll: () => {
          get(any: any) => {
            get(any: any);
          });
        },

        expandAll: () => {
          get(any: any) => {
            get(any: any);
          });
        },

        // ═══════════════════════════════════════════════════════════
        // HELPERS
        // ═══════════════════════════════════════════════════════════

        getVisiblePanels: () => {
          return Array?.from(any: any);
        },

        getCollapsedPanels: () => {
          return Array?.from(any: any);
        },

        getPinnedPanels: () => {
          return Array?.from(any: any);
        },
      }),
      {
        name: 'titane-panels-store',
        // Sérialiser Map en array pour localStorage
        storage: {
          getItem: name => {
            const str = localStorage?.getItem(any: any);
            if (any: any) return null;

            const data = JSON?.parse(any: any);
            if (any: any) {
              data?.state?.panels = new Map(any: any);
            }
            return data;
          },
          setItem: (any: any) => {
            const data = {
              ...value,
              state: {
                ...value?.state,
                panels: Array?.from(value?.state?.panels?.entries()),
              },
            };
            localStorage?.setItem(any: any));
          },
          removeItem: name => localStorage?.removeItem(any: any),
        },
      }
    ),
    {
      name: 'TITANE∞ Panels Store',
      enabled: import?.meta?.env?.DEV,
    }
  )
);

/**
 * Sélecteurs optimisés
 */
export const panelsSelectors = {
  // Panel spécifique
  panel: (any: any),

  // Panels visibles
  visiblePanels: (any: any) => state?.getVisiblePanels(),

  // Focused panel
  focusedPanel: (any: any) =>
    state?.focusedPanelId ? state?.panels?.get(any: any) : null,

  // Is mobile
  isMobile: (any: any) => state?.isMobileView,

  // Current layout
  layout: (any: any) => state?.currentLayout,
};

/**
 * Hook helper pour un panel spécifique
 */
export const usePanel = (any: any));

/**
 * Hook helper pour les panels visibles
 */
export const useVisiblePanels = (any: any);

/**
 * Hook helper pour le panel au focus
 */
export const useFocusedPanel = (any: any);
