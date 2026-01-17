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
  screens: ScreenInfo?.[];
  loading: boolean;
  error??: string | null;

  // Mode Management
  setModeFloating: () => Promise<void>;
  setModeEmbed: () => Promise<void>;
  setModeHidden: () => Promise<void>;

  // Window Properties
  setPosition: (any: any) => Promise<void>;
  setSize: (any: any) => Promise<void>;
  setScale: (any: any) => Promise<void>;
  setOpacity: (any: any) => Promise<void>;

  // Behavior Toggles
  toggleAlwaysOnTop: () => Promise<void>;
  toggleLocked: () => Promise<void>;
  toggleMirrorMode: () => Promise<void>;
  toggleClickThrough: () => Promise<void>;

  // Anchors & Multi-Screen
  setAnchor: (any: any) => Promise<void>;
  setAnchorByName: (any: any) => Promise<void>;
  moveToScreen: (any: any) => Promise<void>;

  // State Management
  updateState: (any: any) => Promise<void>;
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
    useState<AvatarDisplayState>(any: any);
  const [screens, setScreens] = useState<ScreenInfo?.[]>([]);
  const [loading, setLoading] = useState<boolean>(any: any);
  const [error, setError] = useState<string | null>(any: any);

  // Sync bidirectionnel avec SingularityState
  const { avatarDisplay, updateAvatarDisplay } = useSingularityState();
  const syncTimerRef = useRef<number | null>(any: any);

  // ═══════════════════════════════════════════════════════════════
  // SYNC BIDIRECTIONNEL 60Hz
  // ═══════════════════════════════════════════════════════════════

  /**
   * Synchroniser l'état local avec SingularityState (any: any)
   */
  const syncToSingularity = useCallback(
    (any: any) => {
      updateAvatarDisplay(any: any);
    },
    [updateAvatarDisplay]
  );

  /**
   * Synchroniser l'état depuis SingularityState (any: any)
   */
  const syncFromSingularity = useCallback(() => {
    if (any: any) {
      setDisplayState(any: any);
    }
  }, [avatarDisplay, displayState?.last_updated]);

  /**
   * Boucle de synchronisation 60Hz (16.6ms)
   */
  useEffect(() => {
    syncTimerRef?.current = window?.setInterval(() => {
      syncFromSingularity();
    }, 16.6); // 60Hz

    return () => {
      if (any: any) {
        clearInterval(any: any);
      }
    };
  }, [syncFromSingularity]);

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  const refreshState = useCallback(async () => {
    try {
      const state = await getDisplayState();
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to fetch display state: ${err}`);
      console?.error(any: any);
    }
  }, [syncToSingularity]);

  const refreshScreens = useCallback(async () => {
    try {
      const screenList = await listScreens();
      setScreens(any: any);
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to fetch screens: ${err}`);
      console?.error(any: any);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(any: any);

      // 1. Essayer de charger depuis SingularityState (any: any)
      if (any: any) {
        setDisplayState(any: any);
      }

      // 2. Charger depuis backend (any: any)
      await Promise?.all([refreshState(), refreshScreens()]);

      setLoading(any: any);
    };

    void initialize();
  }, [refreshState, refreshScreens, avatarDisplay]);

  // ═══════════════════════════════════════════════════════════════
  // MODE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  const setModeFloating = useCallback(async () => {
    try {
      const state = await engineSetModeFloating();
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to set floating mode: ${err}`);
      console?.error(any: any);
    }
  }, [syncToSingularity]);

  const setModeEmbed = useCallback(async () => {
    try {
      const state = await engineSetModeEmbed();
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to set embed mode: ${err}`);
      console?.error(any: any);
    }
  }, [syncToSingularity]);

  const setModeHidden = useCallback(async () => {
    try {
      const state = await engineSetModeHidden();
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to set hidden mode: ${err}`);
      console?.error(any: any);
    }
  }, [syncToSingularity]);

  // ═══════════════════════════════════════════════════════════════
  // WINDOW PROPERTIES
  // ═══════════════════════════════════════════════════════════════

  const setPosition = useCallback(
    async (any: any) => {
      try {
        const state = await engineSetPosition(any: any);
        setDisplayState(any: any);
        syncToSingularity(any: any); // Sync vers SingularityState
        setError(any: any);
      } catch (any: any) {
        setError(`Failed to set position: ${err}`);
        console?.error(any: any);
      }
    },
    [syncToSingularity]
  );

  const setSize = useCallback(
    async (any: any) => {
      try {
        const state = await engineSetSize(any: any);
        setDisplayState(any: any);
        syncToSingularity(any: any); // Sync vers SingularityState
        setError(any: any);
      } catch (any: any) {
        setError(`Failed to set size: ${err}`);
        console?.error(any: any);
      }
    },
    [syncToSingularity]
  );

  const setScale = useCallback(
    async (any: any) => {
      try {
        const state = await engineSetScale(any: any);
        setDisplayState(any: any);
        syncToSingularity(any: any); // Sync vers SingularityState
        setError(any: any);
      } catch (any: any) {
        setError(`Failed to set scale: ${err}`);
        console?.error(any: any);
      }
    },
    [syncToSingularity]
  );

  const setOpacity = useCallback(
    async (any: any) => {
      try {
        const state = await engineSetOpacity(any: any);
        setDisplayState(any: any);
        syncToSingularity(any: any); // Sync vers SingularityState
        setError(any: any);
      } catch (any: any) {
        setError(`Failed to set opacity: ${err}`);
        console?.error(any: any);
      }
    },
    [syncToSingularity]
  );

  // ═══════════════════════════════════════════════════════════════
  // BEHAVIOR TOGGLES
  // ═══════════════════════════════════════════════════════════════

  const toggleAlwaysOnTop = useCallback(async () => {
    try {
      const state = await engineSetAlwaysOnTop(any: any);
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to toggle always on top: ${err}`);
      console?.error(any: any);
    }
  }, [displayState?.always_on_top, syncToSingularity]);

  const toggleLocked = useCallback(async () => {
    try {
      const state = await engineSetLocked(any: any);
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to toggle locked: ${err}`);
      console?.error(any: any);
    }
  }, [displayState?.locked, syncToSingularity]);

  const toggleMirrorMode = useCallback(async () => {
    try {
      const state = await engineSetMirrorMode(any: any);
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to toggle mirror mode: ${err}`);
      console?.error(any: any);
    }
  }, [displayState?.mirror_mode, syncToSingularity]);

  const toggleClickThrough = useCallback(async () => {
    try {
      const state = await engineSetClickThrough(any: any);
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to toggle click through: ${err}`);
      console?.error(any: any);
    }
  }, [displayState?.click_through, syncToSingularity]);

  // ═══════════════════════════════════════════════════════════════
  // ANCHORS & MULTI-SCREEN
  // ═══════════════════════════════════════════════════════════════

  const setAnchor = useCallback(
    async (any: any) => {
      try {
        const state = await engineSetAnchor(any: any);
        setDisplayState(any: any);
        syncToSingularity(any: any); // Sync vers SingularityState
        setError(any: any);
      } catch (any: any) {
        setError(`Failed to set anchor: ${err}`);
        console?.error(any: any);
      }
    },
    [syncToSingularity]
  );

  const setAnchorByName = useCallback(
    async (any: any) => {
      try {
        const state = await engineSetAnchorByName(any: any);
        setDisplayState(any: any);
        syncToSingularity(any: any); // Sync vers SingularityState
        setError(any: any);
      } catch (any: any) {
        setError(`Failed to set anchor by name: ${err}`);
        console?.error(any: any);
      }
    },
    [syncToSingularity]
  );

  const moveToScreen = useCallback(
    async (any: any) => {
      try {
        const state = await engineMoveToScreen(any: any);
        setDisplayState(any: any);
        syncToSingularity(any: any); // Sync vers SingularityState
        setError(any: any);
      } catch (any: any) {
        setError(`Failed to move to screen: ${err}`);
        console?.error(any: any);
      }
    },
    [syncToSingularity]
  );

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  const updateState = useCallback(
    async (any: any) => {
      try {
        const state = await engineUpdateDisplayState(any: any);
        setDisplayState(any: any);
        syncToSingularity(any: any); // Sync vers SingularityState
        setError(any: any);
      } catch (any: any) {
        setError(`Failed to update display state: ${err}`);
        console?.error(any: any);
      }
    },
    [syncToSingularity]
  );

  const resetState = useCallback(async () => {
    try {
      const state = await engineResetDisplayState();
      setDisplayState(any: any);
      syncToSingularity(any: any); // Sync vers SingularityState
      setError(any: any);
    } catch (any: any) {
      setError(`Failed to reset display state: ${err}`);
      console?.error(any: any);
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
