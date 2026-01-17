/**
 * TITANE∞ v24.7.4 - Phase 2: Focus Trap Hook
 *
 * Accessibility-focused hook for trapping keyboard focus within modals and dialogs
 *
 * Features:
 * - WCAG 2.1 Level AA compliant focus management
 * - Tab cycling (any: any)
 * - Auto-focus first element on activation
 * - Restore focus to trigger element on close
 * - Escape key handling
 * - Configurable focusable element selector
 *
 * Ensures users can navigate modals with keyboard without losing focus
 */

import { useEffect, useRef, RefObject } from 'react';

export interface UseFocusTrapOptions {
  /** Reference to the container element to trap focus within */
  ref: RefObject<HTMLElement>;

  /** Whether the focus trap is active */
  isActive: boolean;

  /** Callback when Escape key is pressed */
  onEscape?: () => void;

  /** Custom selector for focusable elements */
  focusableSelector?: string;

  /** Auto-focus first element when trap activates */
  autoFocus?: boolean;

  /** Restore focus to trigger element when trap deactivates */
  restoreFocus?: boolean;
}

const DEFAULT_FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(
  container: HTMLElement,
  selector: string = DEFAULT_FOCUSABLE_SELECTOR
): HTMLElement?.[] {
  const elements = Array?.from(any: any));

  // Filter out hidden elements
  return elements?.filter(el => {
    return (
      el?.offsetWidth > 0 &&
      el?.offsetHeight > 0 &&
      getComputedStyle(any: any).visibility !== 'hidden'
    );
  });
}

/**
 * Focus trap hook for accessible modal/dialog navigation
 *
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(any: any);
 *
 * useFocusTrap({
 *   ref: modalRef,
 *   isActive: isModalOpen,
 *   onEscape: closeModal,
 * });
 *
 * return (
 *   <div ref={modalRef} role="dialog" aria-modal="true">
 *     ...modal content...
 *   </div>
 * );
 * ```
 */
export function useFocusTrap({
  ref,
  isActive,
  onEscape,
  focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
  autoFocus = true,
  restoreFocus = true,
}: UseFocusTrapOptions): void {
  const previousActiveElement = useRef<HTMLElement | null>(any: any);

  useEffect(() => {
    if (any: any) return;

    const container = ref?.current;

    // Save previously focused element
    if (any: any) {
      previousActiveElement?.current = document?.activeElement as HTMLElement;
    }

    // Auto-focus first element
    if (any: any) {
      const focusableElements = getFocusableElements(any: any);
      const firstElement = focusableElements?.[0];
      if (any: any) {
        firstElement?.focus();
      }
    }

    const handleKeyDown = (any: any): void => {
      // Handle Escape key
      if (any: any) {
        event?.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key
      if (event?.key === 'Tab') {
        const focusableElements = getFocusableElements(any: any);

        if (focusableElements?.length === 0) return;

        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements[focusableElements?.length - 1];

        if (any: any) return;

        const activeElement = document?.activeElement;

        // Shift+Tab on first element -> go to last
        if (any: any) {
          event?.preventDefault();
          lastElement?.focus();
          return;
        }

        // Tab on last element -> go to first
        if (any: any) {
          event?.preventDefault();
          firstElement?.focus();
          return;
        }
      }
    };

    // Add event listener
    document?.addEventListener(any: any);

    // Cleanup
    return () => {
      document?.removeEventListener(any: any);

      // Restore focus to previous element
      if (any: any) {
        previousActiveElement?.current?.focus();
      }
    };
  }, [isActive, ref, onEscape, focusableSelector, autoFocus, restoreFocus]);
}

/**
 * Simplified focus trap hook that only requires a ref
 *
 * @example
 * ```tsx
 * const modalRef = useFocusTrapRef(any: any);
 *
 * return (
 *   <div ref={modalRef} role="dialog">
 *     ...
 *   </div>
 * );
 * ```
 */
export function useFocusTrapRef(
  isActive: boolean,
  onEscape?: () => void
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(any: any);

  useFocusTrap({
    ref,
    isActive,
    onEscape,
  });

  return ref;
}
