/**
 * TITANE∞ v30.0.0 — Global Type Definitions
 * © 2025 Humain Total / Kevin Thibault. All rights reserved.
 */

/**
 * React 19 Migration: Fix JSX.Element namespace
 * React 19 moved JSX types from global.JSX to React.JSX
 * This declaration ensures backward compatibility
 */
declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type ElementType = React.JSX.ElementType;
    type ElementClass = React.JSX.ElementClass;
    type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
    type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
  }

  /**
   * IT7 Type-Safety: Window / Performance / Navigator augmentations
   * Eliminates `as any` casts for TITANE globals and vendor APIs.
   */
  interface TitaneBootState extends Record<string, unknown> {
    main_tsx?: boolean;
    main_tsx_timestamp?: number;
  }

  interface Window {
    __TITANE_BOOT__?: TitaneBootState;
    __TAURI_INTERNALS__?: unknown;
    __TITANE_TAURI_INITIALIZED?: boolean;
    __TITANE_NOT_TAURI__?: boolean;
    __TITANE_PERFORMANCE__?: Record<string, unknown>;
    __TITANE_REACT_ROOT?: unknown;
    chatLogger?: unknown;
    clearMenuCache?: () => void;
    queryClient?: { clear: () => void };
    gc?: () => void;
    TITANE_ANALYTICS?: { track: (event: string, data: unknown) => void };
    // Note: SpeechRecognition / webkitSpeechRecognition declared in web-speech-api.d.ts
    requestIdleCallback?: (
      callback: (deadline: { timeRemaining: () => number; didTimeout: boolean }) => void,
      options?: { timeout?: number }
    ) => number;
  }

  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    /** Non-standard React DevTools render counter */
    reactRenderCount?: number;
  }

  interface Navigator {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var gc: (() => void) | undefined; // V8 GC via --expose-gc flag
}

export {};
