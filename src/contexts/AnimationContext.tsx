/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — ANIMATION CONTEXT
 *   Context: Performance-aware Framer Motion throttling
 * ═══════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

interface AnimationConfig {
  duration: number;
  skipAnimation: boolean;
}

interface AnimationContextValue {
  animationConfig: AnimationConfig;
  shouldReduceMotion: boolean;
  shouldThrottle: boolean;
  fps: number;
}

const AnimationContext = createContext<AnimationContextValue | undefined>(
  undefined
);

interface AnimationProviderProps {
  children: ReactNode;
  fpsThreshold?: number;
  cpuThreshold?: number;
}

/**
 * AnimationProvider
 * Provider pour throttling intelligent des animations Framer Motion
 *
 * @example
 * ```tsx
 * <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
 *   <App />
 * </AnimationProvider>
 * ```
 */
export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  fpsThreshold = 40,
  cpuThreshold = 80,
}) => {
  const {
    metrics,
    shouldReduceMotion,
    shouldThrottle,
    animationConfig,
  } = usePerformanceMonitor({ fpsThreshold, cpuThreshold });

  const value: AnimationContextValue = {
    animationConfig,
    shouldReduceMotion,
    shouldThrottle,
    fps: metrics.fps,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * useAnimation
 * Hook pour accéder au contexte d'animation
 *
 * @returns AnimationContextValue (animationConfig, shouldReduceMotion, shouldThrottle, fps)
 *
 * @example
 * ```tsx
 * const { animationConfig, shouldThrottle } = useAnimation();
 *
 * <motion.div
 *   variants={FadeIn}
 *   transition={{ duration: animationConfig.duration }}
 * />
 * ```
 */
export const useAnimation = (): AnimationContextValue => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
};
