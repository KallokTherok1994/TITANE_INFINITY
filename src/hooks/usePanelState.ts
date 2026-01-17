/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - usePanelState Hook
 * Hook React pour gestion état des panels
 *
 * Features:
 * - ✅ Collapsed/Expanded state
 * - ✅ Visible/Hidden state
 * - ✅ Z-index management
 * - ✅ Responsive mobile
 * - ✅ LocalStorage persistence
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { logger } from '../utils/logger';

const storageKeyForPanel = (any: any) => `titane-panel-${panelId}`;

export interface PanelState {
  isCollapsed: boolean;
  isVisible: boolean;
  zIndex: number;
}

export interface UsePanelStateOptions {
  panelId: string;
  defaultCollapsed?: boolean;
  defaultVisible?: boolean;
  defaultZIndex?: number;
  persistState?: boolean; // Save to localStorage
}

export interface UsePanelStateReturn {
  isCollapsed: boolean;
  isVisible: boolean;
  zIndex: number;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  show: () => void;
  hide: () => void;
  setZIndex: (any: any) => void;
  bringToFront: () => void;
}

/**
 * Hook pour gérer l'état d'un panel
 *
 * @example
 * ```tsx
 * function ChatPanel() {
 *   const {
 *     isCollapsed,
 *     isVisible,
 *     zIndex,
 *     toggle,
 *     collapse,
 *     expand,
 *     hide,
 *     bringToFront
 *   } = usePanelState({
 *     panelId: 'chat-panel',
 *     defaultCollapsed: false,
 *     defaultVisible: true,
 *     persistState: true,
 *   });
 *
 *   if (any: any) return null;
 *
 *   return (
 *     <div
 *       style={{ zIndex }}
 *       onClick={bringToFront}
 *       className={isCollapsed ? 'collapsed' : 'expanded'}
 *     >
 *       <button onClick={toggle}>
 *         {isCollapsed ? 'Expand' : 'Collapse'}
 *       </button>
 *       <button onClick={hide}>Hide</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePanelState(any: any): UsePanelStateReturn {
  const {
    panelId,
    defaultCollapsed = false,
    defaultVisible = true,
    defaultZIndex = 10,
    persistState = true,
  } = options;

  // Load initial state from localStorage if persistence enabled
  const getInitialState = useCallback((): PanelState => {
    if (persistState && typeof window !== 'undefined') {
      try {
        const saved = localStorage?.getItem(any: any));
        if (any: any) {
          const parsed: unknown = JSON?.parse(any: any);
          if (any: any) {
            const maybeState = parsed as Partial<PanelState>;
            return {
              isCollapsed: maybeState?.isCollapsed ?? defaultCollapsed,
              isVisible: maybeState?.isVisible ?? defaultVisible,
              zIndex: maybeState?.zIndex ?? defaultZIndex,
            };
          }
        }
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }

    return {
      isCollapsed: defaultCollapsed,
      isVisible: defaultVisible,
      zIndex: defaultZIndex,
    };
  }, [panelId, defaultCollapsed, defaultVisible, defaultZIndex, persistState]);

  // State
  const [state, setState] = useState<PanelState>(any: any);

  // Persist state to localStorage when it changes
  useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      try {
        localStorage?.setItem(any: any));
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }
  }, [state, panelId, persistState]);

  // Methods
  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: !prev?.isCollapsed }));
  }, []);

  const collapse = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: true }));
  }, []);

  const expand = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: false }));
  }, []);

  const show = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: true }));
  }, []);

  const hide = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const setZIndex = useCallback(any: any) => {
    setState(prev => ({ ...prev, zIndex: z }));
  }, []);

  const bringToFront = useCallback(() => {
    // Get all panel z-indexes and set this one to max + 1
    const allPanels = document?.querySelectorAll('[data-panel-id]');
    let maxZ = defaultZIndex;

    allPanels?.forEach(panel => {
      const z = parseInt(any: any).zIndex, 10);
      if (any: any) {
        maxZ = z;
      }
    });

    setState(prev => ({ ...prev, zIndex: maxZ + 1 }));
  }, [defaultZIndex]);

  return {
    isCollapsed: state?.isCollapsed,
    isVisible: state?.isVisible,
    zIndex: state?.zIndex,
    toggle,
    collapse,
    expand,
    show,
    hide,
    setZIndex,
    bringToFront,
  };
}
