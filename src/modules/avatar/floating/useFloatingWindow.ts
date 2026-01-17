// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — USE FLOATING WINDOW HOOK
//   React Hook for Floating Avatar Window Management
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  AvatarDisplayState,
  AvatarDisplayStateUpdate,
  AnchorPosition,
  ScreenInfo,
} from './AvatarDisplayState';
import { DEFAULT_DISPLAY_STATE } from './AvatarDisplayState';
import {
  getDisplayState,
  listScreens,
  moveToScreen as engineMoveToScreen,
  resetDisplayState as engineResetDisplayState,
  setAlwaysOnTop as engineSetAlwaysOnTop,
  setAnchor as engineSetAnchor,
  setAnchorByName as engineSetAnchorByName,
  setClickThrough as engineSetClickThrough,
  setLocked as engineSetLocked,
  setMirrorMode as engineSetMirrorMode,
  setModeEmbed as engineSetModeEmbed,
  setModeFloating as engineSetModeFloating,
  setModeHidden as engineSetModeHidden,
  setOpacity as engineSetOpacity,
  setPosition as engineSetPosition,
  setScale as engineSetScale,
  setSize as engineSetSize,
  updateDisplayState as engineUpdateDisplayState,
} from './avatarFloatingEngine';
import { useSingularityState } from '@/core/state/SingularityState';

export interface UseFloatingWindowResult {
  displayState: AvatarDisplayState;
  screens: ScreenInfo[];
  loading: boolean;
  error: string | null;

  // Mode Management
  setModeFloating: () => Promise<void>;
  setModeEmbed: () => Promise<void>;
  setModeHidden: () => Promise<void>;

  // Window Properties
  setPosition: (x: number, y: number) => Promise<void>;
  setSize: (width: number, height: number) => Promise<void>;
  setScale: (scale: number) => Promise<void>;
  setOpacity: (opacity: number) => Promise<void>;

  // Behavior Toggles
  toggleAlwaysOnTop: () => Promise<void>;
  toggleLocked: () => Promise<void>;
  toggleMirrorMode: () => Promise<void>;
  toggleClickThrough: () => Promise<void>;

  // Anchors & Multi-Screen
  setAnchor: (anchor: AnchorPosition) => Promise<void>;
  setAnchorByName: (name: string) => Promise<void>;
  moveToScreen: (screenIndex: number) => Promise<void>;

  // State Management
  updateState: (update: AvatarDisplayStateUpdate) => Promise<void>;
  resetState: () => Promise<void>;
  refreshState: () => Promise<void>;
  refreshScreens: () => Promise<void>;
}

/**
 * React Hook pour gérer la fenêtre flottante avatar
 *
 * v24.12: Synchronisation bidirectionnelle avec SingularityState
 * - Backend → Frontend: Refresh auto toutes les 60Hz (16.6ms)
 * - Frontend → Backend: Mise à jour immédiate + sync SingularityState
 * - Persistence: localStorage via SingularityState zustand
 */
export function useFloatingWindow(): UseFloatingWindowResult {
  const [displayState, setDisplayState] =
    useState<AvatarDisplayState>(DEFAULT_DISPLAY_STATE);
  const [screens, setScreens] = useState<ScreenInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync bidirectionnel avec SingularityState
  const { avatarDisplay, updateAvatarDisplay } = useSingularityState();
  const syncTimerRef = useRef<number | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // SYNC BIDIRECTIONNEL 60Hz
  // ═══════════════════════════════════════════════════════════════

  /**
   * Synchroniser l'état local avec SingularityState (Frontend → SingularityState)
   */
  const syncToSingularity = useCallback(
    (state: AvatarDisplayState) => {
      updateAvatarDisplay(state);
    },
    [updateAvatarDisplay]
  );

  /**
   * Synchroniser l'état depuis SingularityState (SingularityState → Local)
   */
  const syncFromSingularity = useCallback(() => {
    if (avatarDisplay && avatarDisplay.last_updated > displayState.last_updated) {
      setDisplayState(avatarDisplay);
    }
  }, [avatarDisplay, displayState.last_updated]);

  /**
   * Boucle de synchronisation 60Hz (16.6ms)
   */
  useEffect(() => {
    syncTimerRef.current = window.setInterval(() => {
      syncFromSingularity();
    }, 16.6); // 60Hz

    return () => {
      if (syncTimerRef.current !== null) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [syncFromSingularity]);

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  const refreshState = useCallback(async () => {
    try {
      const state = await getDisplayState();
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to fetch display state: ${err}`);
      console.error('Failed to fetch display state:', err);
    }
  }, [syncToSingularity]);

  const refreshScreens = useCallback(async () => {
    try {
      const screenList = await listScreens();
      setScreens(screenList);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch screens: ${err}`);
      console.error('Failed to fetch screens:', err);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      // 1. Essayer de charger depuis SingularityState (localStorage)
      if (avatarDisplay) {
        setDisplayState(avatarDisplay);
      }

      // 2. Charger depuis backend (source de vérité)
      await Promise.all([refreshState(), refreshScreens()]);

      setLoading(false);
    };

    void initialize();
  }, [refreshState, refreshScreens, avatarDisplay]);

  // ═══════════════════════════════════════════════════════════════
  // MODE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  const setModeFloating = useCallback(async () => {
    try {
      const state = await engineSetModeFloating();
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to set floating mode: ${err}`);
      console.error('Failed to set floating mode:', err);
    }
  }, [syncToSingularity]);

  const setModeEmbed = useCallback(async () => {
    try {
      const state = await engineSetModeEmbed();
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to set embed mode: ${err}`);
      console.error('Failed to set embed mode:', err);
    }
  }, [syncToSingularity]);

  const setModeHidden = useCallback(async () => {
    try {
      const state = await engineSetModeHidden();
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to set hidden mode: ${err}`);
      console.error('Failed to set hidden mode:', err);
    }
  }, [syncToSingularity]);

  // ═══════════════════════════════════════════════════════════════
  // WINDOW PROPERTIES
  // ═══════════════════════════════════════════════════════════════

  const setPosition = useCallback(
    async (x: number, y: number) => {
      try {
        const state = await engineSetPosition(x, y);
        setDisplayState(state);
        syncToSingularity(state); // Sync vers SingularityState
        setError(null);
      } catch (err) {
        setError(`Failed to set position: ${err}`);
        console.error('Failed to set position:', err);
      }
    },
    [syncToSingularity]
  );

  const setSize = useCallback(
    async (width: number, height: number) => {
      try {
        const state = await engineSetSize(width, height);
        setDisplayState(state);
        syncToSingularity(state); // Sync vers SingularityState
        setError(null);
      } catch (err) {
        setError(`Failed to set size: ${err}`);
        console.error('Failed to set size:', err);
      }
    },
    [syncToSingularity]
  );

  const setScale = useCallback(
    async (scale: number) => {
      try {
        const state = await engineSetScale(scale);
        setDisplayState(state);
        syncToSingularity(state); // Sync vers SingularityState
        setError(null);
      } catch (err) {
        setError(`Failed to set scale: ${err}`);
        console.error('Failed to set scale:', err);
      }
    },
    [syncToSingularity]
  );

  const setOpacity = useCallback(
    async (opacity: number) => {
      try {
        const state = await engineSetOpacity(opacity);
        setDisplayState(state);
        syncToSingularity(state); // Sync vers SingularityState
        setError(null);
      } catch (err) {
        setError(`Failed to set opacity: ${err}`);
        console.error('Failed to set opacity:', err);
      }
    },
    [syncToSingularity]
  );

  // ═══════════════════════════════════════════════════════════════
  // BEHAVIOR TOGGLES
  // ═══════════════════════════════════════════════════════════════

  const toggleAlwaysOnTop = useCallback(async () => {
    try {
      const state = await engineSetAlwaysOnTop(!displayState.always_on_top);
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to toggle always on top: ${err}`);
      console.error('Failed to toggle always on top:', err);
    }
  }, [displayState.always_on_top, syncToSingularity]);

  const toggleLocked = useCallback(async () => {
    try {
      const state = await engineSetLocked(!displayState.locked);
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to toggle locked: ${err}`);
      console.error('Failed to toggle locked:', err);
    }
  }, [displayState.locked, syncToSingularity]);

  const toggleMirrorMode = useCallback(async () => {
    try {
      const state = await engineSetMirrorMode(!displayState.mirror_mode);
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to toggle mirror mode: ${err}`);
      console.error('Failed to toggle mirror mode:', err);
    }
  }, [displayState.mirror_mode, syncToSingularity]);

  const toggleClickThrough = useCallback(async () => {
    try {
      const state = await engineSetClickThrough(!displayState.click_through);
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to toggle click through: ${err}`);
      console.error('Failed to toggle click through:', err);
    }
  }, [displayState.click_through, syncToSingularity]);

  // ═══════════════════════════════════════════════════════════════
  // ANCHORS & MULTI-SCREEN
  // ═══════════════════════════════════════════════════════════════

  const setAnchor = useCallback(
    async (anchor: AnchorPosition) => {
      try {
        const state = await engineSetAnchor(anchor);
        setDisplayState(state);
        syncToSingularity(state); // Sync vers SingularityState
        setError(null);
      } catch (err) {
        setError(`Failed to set anchor: ${err}`);
        console.error('Failed to set anchor:', err);
      }
    },
    [syncToSingularity]
  );

  const setAnchorByName = useCallback(
    async (name: string) => {
      try {
        const state = await engineSetAnchorByName(name);
        setDisplayState(state);
        syncToSingularity(state); // Sync vers SingularityState
        setError(null);
      } catch (err) {
        setError(`Failed to set anchor by name: ${err}`);
        console.error('Failed to set anchor by name:', err);
      }
    },
    [syncToSingularity]
  );

  const moveToScreen = useCallback(
    async (screenIndex: number) => {
      try {
        const state = await engineMoveToScreen(screenIndex);
        setDisplayState(state);
        syncToSingularity(state); // Sync vers SingularityState
        setError(null);
      } catch (err) {
        setError(`Failed to move to screen: ${err}`);
        console.error('Failed to move to screen:', err);
      }
    },
    [syncToSingularity]
  );

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  const updateState = useCallback(
    async (update: AvatarDisplayStateUpdate) => {
      try {
        const state = await engineUpdateDisplayState(update);
        setDisplayState(state);
        syncToSingularity(state); // Sync vers SingularityState
        setError(null);
      } catch (err) {
        setError(`Failed to update display state: ${err}`);
        console.error('Failed to update display state:', err);
      }
    },
    [syncToSingularity]
  );

  const resetState = useCallback(async () => {
    try {
      const state = await engineResetDisplayState();
      setDisplayState(state);
      syncToSingularity(state); // Sync vers SingularityState
      setError(null);
    } catch (err) {
      setError(`Failed to reset display state: ${err}`);
      console.error('Failed to reset display state:', err);
    }
  }, [syncToSingularity]);

  // ═══════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════

  return {
    displayState,
    screens,
    loading,
    error,

    setModeFloating,
    setModeEmbed,
    setModeHidden,

    setPosition,
    setSize,
    setScale,
    setOpacity,

    toggleAlwaysOnTop,
    toggleLocked,
    toggleMirrorMode,
    toggleClickThrough,

    setAnchor,
    setAnchorByName,
    moveToScreen,

    updateState,
    resetState,
    refreshState,
    refreshScreens,
  };
}
