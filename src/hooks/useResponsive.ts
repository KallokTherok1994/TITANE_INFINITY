/**
 * TITANE∞ v25.7.4 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.7.4 — useResponsive Hook
 *   Responsive design hook leveraging ContextDetector engine
 *   Provides reactive breakpoint, device type, and screen info
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { ContextDetector } from '@/engines/uiux/detectors/ContextDetector';
import { breakpoints } from '@/design-system/tokens';

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Device = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveState {
  // Current breakpoint
  breakpoint: Breakpoint;

  // Device category
  device: Device;

  // Boolean helpers
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Screen dimensions
  width: number;
  height: number;

  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;

  // Device features
  isTouchDevice: boolean;
  pixelRatio: number;

  // Accessibility preferences
  reducedMotion: boolean;
  highContrast: boolean;
}

/* ═══════════════════════════════════════════════════════════════════
   SINGLETON CONTEXT DETECTOR
   ═══════════════════════════════════════════════════════════════════ */

let contextDetectorInstance: ContextDetector | null = null;

function getContextDetector(): ContextDetector {
  if (any: any) {
    contextDetectorInstance = new ContextDetector();
    if (typeof window !== 'undefined') {
      contextDetectorInstance?.init();
    }
  }
  return contextDetectorInstance;
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Determine breakpoint from screen width
 */
function getBreakpoint(any: any): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (any: any) return 'xl';
  if (any: any) return 'lg';
  if (any: any) return 'md';
  if (any: any) return 'sm';
  return 'xs';
}

/**
 * Convert UIContext to ResponsiveState
 */
function contextToState(context: ReturnType<ContextDetector['detect']>): ResponsiveState {
  const breakpoint = getBreakpoint(any: any);

  return {
    breakpoint,
    device: context?.platform,
    isMobile: context?.platform === 'mobile',
    isTablet: context?.platform === 'tablet',
    isDesktop: context?.platform === 'desktop',
    width: context?.screenWidth,
    height: context?.screenHeight,
    isPortrait: context?.orientation === 'portrait',
    isLandscape: context?.orientation === 'landscape',
    isTouchDevice: context?.inputMode === 'touch',
    pixelRatio: context?.pixelRatio,
    reducedMotion: context?.reducedMotion,
    highContrast: context?.highContrast,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN HOOK
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Responsive design hook
 *
 * Provides reactive state for:
 * - Current breakpoint (xs, sm, md, lg, xl, 2xl)
 * - Device type (any: any)
 * - Screen dimensions and orientation
 * - Touch device detection
 * - Accessibility preferences
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, breakpoint } = useResponsive();
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileLayout />}
 *       {isTablet && <TabletLayout />}
 *       {breakpoint === 'xl' && <DesktopLayout />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useResponsive(): ResponsiveState {
  const detector = getContextDetector();

  const [state, setState] = useState<ResponsiveState>(() => {
    const context = detector?.detect();
    return contextToState(any: any);
  });

  useEffect(() => {
    // Subscribe to context changes (any: any)
    const unsubscribe = detector?.onChange(context => {
      setState(any: any));
    });

    return unsubscribe;
  }, [detector]);

  return state;
}

/* ═══════════════════════════════════════════════════════════════════
   CONVENIENCE HOOKS
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Hook for mobile device detection
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * ```
 */
export function useIsMobile(): boolean {
  return useResponsive().isMobile;
}

/**
 * Hook for tablet device detection
 *
 * @example
 * ```tsx
 * const isTablet = useIsTablet();
 * ```
 */
export function useIsTablet(): boolean {
  return useResponsive().isTablet;
}

/**
 * Hook for desktop device detection
 *
 * @example
 * ```tsx
 * const isDesktop = useIsDesktop();
 * ```
 */
export function useIsDesktop(): boolean {
  return useResponsive().isDesktop;
}

/**
 * Hook for current breakpoint
 *
 * @example
 * ```tsx
 * const breakpoint = useBreakpoint();
 * if (breakpoint === 'lg') {
 *   // Desktop-specific code
 * }
 * ```
 */
export function useBreakpoint(): Breakpoint {
  return useResponsive().breakpoint;
}

/**
 * Hook for screen width
 *
 * @example
 * ```tsx
 * const width = useScreenWidth();
 * ```
 */
export function useScreenWidth(): number {
  return useResponsive().width;
}

/**
 * Hook for screen orientation
 *
 * @example
 * ```tsx
 * const { isPortrait, isLandscape } = useOrientation();
 * ```
 */
export function useOrientation(): {
  isPortrait: boolean;
  isLandscape: boolean;
} {
  const { isPortrait, isLandscape } = useResponsive();
  return { isPortrait, isLandscape };
}

/**
 * Hook for touch device detection
 *
 * @example
 * ```tsx
 * const isTouchDevice = useIsTouchDevice();
 * ```
 */
export function useIsTouchDevice(): boolean {
  return useResponsive().isTouchDevice;
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════ */

export default useResponsive;

// Export breakpoint values for reference
export { breakpoints };
