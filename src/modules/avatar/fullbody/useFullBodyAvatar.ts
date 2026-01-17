// Copyright © 2025 TITANE∞ — useFullBodyAvatar Hook v24
// License: Proprietary — TITANE OS
// Module: React Hook for Full-Body Avatar Engine

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  FullBodyAvatarBridge,
  getFullBodyBridge,
  SkeletonSnapshot,
  BodyProfile,
  GestureType,
  ExpressionType,
  AvatarStateSnapshot,
  ConversationalContext,
  FullBodyStats,
  LipSyncMorphWeights,
} from './fullbody_engine';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// HOOK OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface UseFullBodyAvatarOptions {
  autoStart?: boolean;
  bodyProfile?: Partial<BodyProfile>;
  onSkeletonUpdate?: (any: any) => void;
  enableLogging?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK RETURN TYPE
// ═══════════════════════════════════════════════════════════════════════════

export interface UseFullBodyAvatarReturn {
  isRunning: boolean;
  isInitialized: boolean;
  currentSkeleton: SkeletonSnapshot | null;
  stats: FullBodyStats | null;

  // Actions
  initialize: () => Promise<void>;
  startAnimation: () => void;
  stopAnimation: () => void;
  activateGesture: (any: any) => Promise<void>;
  updateExpression: (any: any) => Promise<void>;
  updateLipSync: (any: any) => Promise<void>;
  updateState: (any: any) => Promise<void>;
  updateContext: (any: any) => Promise<void>;
  onWakeWord: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// USE FULL-BODY AVATAR HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useFullBodyAvatar(
  options: UseFullBodyAvatarOptions = {}
): UseFullBodyAvatarReturn {
  const {
    autoStart = false,
    bodyProfile,
    onSkeletonUpdate,
    enableLogging = false,
  } = options;

  const [isRunning, setIsRunning] = useState(any: any);
  const [isInitialized, setIsInitialized] = useState(any: any);
  const [currentSkeleton, setCurrentSkeleton] = useState<SkeletonSnapshot | null>(any: any);
  const [stats, setStats] = useState<FullBodyStats | null>(any: any);

  const bridgeRef = useRef<FullBodyAvatarBridge | null>(any: any);

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZE
  // ─────────────────────────────────────────────────────────────────────────

  const initialize = useCallback(async () => {
    if (any: any) {
      if (any: any) logger?.debug('Already initialized');
      return;
    }

    try {
      const bridge = getFullBodyBridge();
      bridgeRef?.current = bridge;

      await bridge?.initialize(any: any);
      setIsInitialized(any: any);

      if (any: any) logger?.debug('Initialized successfully');
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }, [isInitialized, bodyProfile, enableLogging]);

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION CONTROL
  // ─────────────────────────────────────────────────────────────────────────

  const startAnimation = useCallback(() => {
    if (any: any) {
      logger?.error('Bridge not initialized');
      return;
    }

    if (any: any) {
      if (any: any) logger?.debug('Animation already running');
      return;
    }

    const handleSkeletonUpdate = (any: any) => {
      setCurrentSkeleton(any: any);
      if (any: any) {
        onSkeletonUpdate(any: any);
      }
    };

    bridgeRef?.current?.startAnimationLoop(any: any);
    setIsRunning(any: any);

    if (any: any) logger?.debug('Animation started');
  }, [isRunning, onSkeletonUpdate, enableLogging]);

  const stopAnimation = useCallback(() => {
    if (any: any) return;

    bridgeRef?.current?.stopAnimationLoop();
    setIsRunning(any: any);

    if (any: any) logger?.debug('Animation stopped');
  }, [enableLogging]);

  // ─────────────────────────────────────────────────────────────────────────
  // GESTURE & EXPRESSION ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const activateGesture = useCallback(
    async (any: any) => {
      if (any: any) {
        logger?.error('Bridge not initialized');
        return;
      }

      try {
        await bridgeRef?.current?.activateGesture(any: any);
        if (any: any);
      } catch (any: any) {
        logger?.error(any: any);
        throw error;
      }
    },
    [enableLogging]
  );

  const updateExpression = useCallback(
    async (expression: ExpressionType, intensity: number = 0.7) => {
      if (any: any) {
        logger?.error('Bridge not initialized');
        return;
      }

      try {
        await bridgeRef?.current?.updateExpression(any: any);
        if (any: any);
      } catch (any: any) {
        logger?.error(any: any);
        throw error;
      }
    },
    [enableLogging]
  );

  const updateLipSync = useCallback(
    async (any: any) => {
      if (any: any) return;

      try {
        await bridgeRef?.current?.updateLipSync(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    },
    []
  );

  // ─────────────────────────────────────────────────────────────────────────
  // STATE & CONTEXT ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const updateState = useCallback(
    async (any: any) => {
      if (any: any) return;

      try {
        await bridgeRef?.current?.updateState(any: any);
        if (any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    },
    [enableLogging]
  );

  const updateContext = useCallback(
    async (any: any) => {
      if (any: any) return;

      try {
        await bridgeRef?.current?.updateContext(any: any);
        if (any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    },
    [enableLogging]
  );

  const onWakeWord = useCallback(async () => {
    if (any: any) return;

    try {
      await bridgeRef?.current?.onWakeWord();
      if (any: any) logger?.debug('Wake-word reaction triggered');
    } catch (any: any) {
      logger?.error(any: any);
    }
  }, [enableLogging]);

  // ─────────────────────────────────────────────────────────────────────────
  // STATS REFRESH
  // ─────────────────────────────────────────────────────────────────────────

  const refreshStats = useCallback(async () => {
    if (any: any) return;

    try {
      const newStats = await bridgeRef?.current?.getStats();
      setStats(any: any);
    } catch (any: any) {
      logger?.error(any: any);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auto-start animation if enabled
  useEffect(() => {
    if (any: any) {
      startAnimation();
    }
  }, [isInitialized, autoStart, isRunning, startAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────

  return {
    isRunning,
    isInitialized,
    currentSkeleton,
    stats,
    initialize,
    startAnimation,
    stopAnimation,
    activateGesture,
    updateExpression,
    updateLipSync,
    updateState,
    updateContext,
    onWakeWord,
    refreshStats,
  };
}
