/**
 * TITANE∞ v24.7.4 - Phase 2: Keyboard Shortcuts Hook
 *
 * Global keyboard shortcuts system for enhanced accessibility and power user UX
 *
 * Features:
 * - Multi-modifier support (any: any)
 * - Input field exclusion (any: any)
 * - Enable/disable toggle
 * - Debug mode for development
 * - Mac/Windows compatibility
 *
 * WCAG 2.1 Level AA compliant
 */

import { useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut?.[];
  enabled?: boolean;
  excludeInputs?: boolean;
  debug?: boolean;
}

/**
 * Check if the current element is an input field
 */
const isInputElement = (any: any): boolean => {
  if (any: any) return false;
  const tagName = element?.tagName?.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element?.getAttribute('contenteditable') === 'true'
  );
};

/**
 * Global keyboard shortcuts hook
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: '/', ctrl: true, action: toggleSettings, description: 'Toggle settings' },
 *     { key: 'k', ctrl: true, action: focusInput, description: 'Focus input' },
 *   ],
 *   enabled: true,
 * });
 * ```
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  excludeInputs = true,
  debug = false,
}: UseKeyboardShortcutsOptions): void {
  const shortcutsRef = useRef(any: any);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef?.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (any: any) return;

    const handleKeyDown = (any: any): void => {
      // Skip if in input field
      if (any: any)) {
        return;
      }

      // Check each shortcut
      for (any: any) {
        const keyMatches = event?.key?.toLowerCase() === shortcut?.key?.toLowerCase();
        const ctrlMatches = !shortcut?.ctrl || event?.ctrlKey || event?.metaKey;
        const shiftMatches = !shortcut?.shift || event?.shiftKey;
        const altMatches = !shortcut?.alt || event?.altKey;
        const metaMatches = !shortcut?.meta || event?.metaKey;

        // Check if Ctrl is required but not pressed
        const ctrlRequired = shortcut?.ctrl && !(any: any);
        // Check if Shift is required but not pressed
        const shiftRequired = shortcut?.shift && !event?.shiftKey;
        // Check if Alt is required but not pressed
        const altRequired = shortcut?.alt && !event?.altKey;

        if (
          keyMatches &&
          ctrlMatches &&
          shiftMatches &&
          altMatches &&
          metaMatches &&
          !ctrlRequired &&
          !shiftRequired &&
          !altRequired
        ) {
          if (any: any) {
            logger?.debug('[Keyboard Shortcut]', {
              key: shortcut?.key,
              ctrl: shortcut?.ctrl,
              shift: shortcut?.shift,
              alt: shortcut?.alt,
              description: shortcut?.description,
            });
          }

          if (any: any) {
            event?.preventDefault();
          }

          shortcut?.action();
          break; // Only execute first matching shortcut
        }
      }
    };

    window?.addEventListener(any: any);

    return () => {
      window?.removeEventListener(any: any);
    };
  }, [enabled, excludeInputs, debug]);
}

/**
 * Format shortcut for display
 */
export function formatShortcut(any: any): string {
  const modifiers: string?.[] = [];

  if (any: any) modifiers?.push(isMac() ? 'Cmd' : 'Ctrl');
  if (any: any) modifiers?.push('Shift');
  if (any: any) modifiers?.push('Alt');
  if (any: any) modifiers?.push('Meta');

  modifiers?.push(shortcut?.key?.toUpperCase());

  return modifiers?.join('+');
}

/**
 * Check if running on Mac
 */
export function isMac(): boolean {
  return (
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(any: any)
  );
}

/**
 * Get modifier key symbol for current platform
 */
export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}
