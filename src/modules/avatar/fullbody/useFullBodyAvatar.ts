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

// ═══════════════════════════════════════════════════════════════════════════
// HOOK OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface UseFullBodyAvatarOptions {
  autoStart?: boolean;
  bodyProfile?: Partial<BodyProfile>;
  onSkeletonUpdate?: (snapshot: SkeletonSnapshot) => void;
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
  activateGesture: (gesture: GestureType) => Promise<void>;
  updateExpression: (expression: ExpressionType, intensity?: number) => Promise<void>;
  updateLipSync: (phoneme: string, morphWeights: LipSyncMorphWeights) => Promise<void>;
  updateState: (state: AvatarStateSnapshot) => Promise<void>;
  updateContext: (context: ConversationalContext) => Promise<void>;
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

  const [isRunning, setIsRunning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSkeleton, setCurrentSkeleton] = useState<SkeletonSnapshot | null>(null);
  const [stats, setStats] = useState<FullBodyStats | null>(null);

  const bridgeRef = useRef<FullBodyAvatarBridge | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZE
  // ─────────────────────────────────────────────────────────────────────────

  const initialize = useCallback(async () => {
    if (isInitialized) {
      if (enableLogging) logger.debug('Already initialized');
      return;
    }

    try {
      const bridge = getFullBodyBridge();
      bridgeRef.current = bridge;

      await bridge.initialize(bodyProfile);
      setIsInitialized(true);

      if (enableLogging) logger.debug('Initialized successfully');
    } catch (error) {
      logger.error('Initialization failed:', error);
      throw error;
    }
  }, [isInitialized, bodyProfile, enableLogging]);

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION CONTROL
  // ─────────────────────────────────────────────────────────────────────────

  const startAnimation = useCallback(() => {
    if (!bridgeRef.current) {
      logger.error('Bridge not initialized');
      return;
    }

    if (isRunning) {
      if (enableLogging) logger.debug('Animation already running');
      return;
    }

    const handleSkeletonUpdate = (snapshot: SkeletonSnapshot) => {
      setCurrentSkeleton(snapshot);
      if (onSkeletonUpdate) {
        onSkeletonUpdate(snapshot);
      }
    };

    bridgeRef.current.startAnimationLoop(handleSkeletonUpdate);
    setIsRunning(true);

    if (enableLogging) logger.debug('Animation started');
  }, [isRunning, onSkeletonUpdate, enableLogging]);

  const stopAnimation = useCallback(() => {
    if (!bridgeRef.current) return;

    bridgeRef.current.stopAnimationLoop();
    setIsRunning(false);

    if (enableLogging) logger.debug('Animation stopped');
  }, [enableLogging]);

  // ─────────────────────────────────────────────────────────────────────────
  // GESTURE & EXPRESSION ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const activateGesture = useCallback(
    async (gesture: GestureType) => {
      if (!bridgeRef.current) {
        logger.error('Bridge not initialized');
        return;
      }

      try {
        await bridgeRef.current.activateGesture(gesture);
        if (enableLogging) logger.debug('Gesture activated:', gesture);
      } catch (error) {
        logger.error('Gesture activation failed:', error);
        throw error;
      }
    },
    [enableLogging]
  );

  const updateExpression = useCallback(
    async (expression: ExpressionType, intensity: number = 0.7) => {
      if (!bridgeRef.current) {
        logger.error('Bridge not initialized');
        return;
      }

      try {
        await bridgeRef.current.updateExpression(expression, intensity);
        if (enableLogging)
          logger.debug('Expression updated:', expression);
      } catch (error) {
        logger.error('Expression update failed:', error);
        throw error;
      }
    },
    [enableLogging]
  );

  const updateLipSync = useCallback(
    async (phoneme: string, morphWeights: LipSyncMorphWeights) => {
      if (!bridgeRef.current) return;

      try {
        await bridgeRef.current.updateLipSync(phoneme, morphWeights);
      } catch (error) {
        logger.error('Lip-sync update failed:', error);
      }
    },
    []
  );

  // ─────────────────────────────────────────────────────────────────────────
  // STATE & CONTEXT ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const updateState = useCallback(
    async (state: AvatarStateSnapshot) => {
      if (!bridgeRef.current) return;

      try {
        await bridgeRef.current.updateState(state);
        if (enableLogging) logger.debug('State updated:', state);
      } catch (error) {
        logger.error('State update failed:', error);
      }
    },
    [enableLogging]
  );

  const updateContext = useCallback(
    async (context: ConversationalContext) => {
      if (!bridgeRef.current) return;

      try {
        await bridgeRef.current.updateContext(context);
        if (enableLogging) logger.debug('Context updated:', context);
      } catch (error) {
        logger.error('Context update failed:', error);
      }
    },
    [enableLogging]
  );

  const onWakeWord = useCallback(async () => {
    if (!bridgeRef.current) return;

    try {
      await bridgeRef.current.onWakeWord();
      if (enableLogging) logger.debug('Wake-word reaction triggered');
    } catch (error) {
      logger.error('Wake-word reaction failed:', error);
    }
  }, [enableLogging]);

  // ─────────────────────────────────────────────────────────────────────────
  // STATS REFRESH
  // ─────────────────────────────────────────────────────────────────────────

  const refreshStats = useCallback(async () => {
    if (!bridgeRef.current) return;

    try {
      const newStats = await bridgeRef.current.getStats();
      setStats(newStats);
    } catch (error) {
      logger.error('Stats refresh failed:', error);
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
    if (isInitialized && autoStart && !isRunning) {
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
