/**
 * TITANE∞ v24.7.4 - Phase 2: Keyboard Shortcuts Hook
 *
 * Global keyboard shortcuts system for enhanced accessibility and power user UX
 *
 * Features:
 * - Multi-modifier support (Ctrl/Cmd, Shift, Alt, Meta)
 * - Input field exclusion (don't trigger in text inputs)
 * - Enable/disable toggle
 * - Debug mode for development
 * - Mac/Windows compatibility
 *
 * WCAG 2.1 Level AA compliant
 */

import { useEffect, useRef } from 'react';

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
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  excludeInputs?: boolean;
  debug?: boolean;
}

/**
 * Check if the current element is an input field
 */
const isInputElement = (element: Element | null): boolean => {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.getAttribute('contenteditable') === 'true'
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
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Skip if in input field
      if (excludeInputs && isInputElement(event.target as Element)) {
        return;
      }

      // Check each shortcut
      for (const shortcut of shortcutsRef.current) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !shortcut.ctrl || event.ctrlKey || event.metaKey;
        const shiftMatches = !shortcut.shift || event.shiftKey;
        const altMatches = !shortcut.alt || event.altKey;
        const metaMatches = !shortcut.meta || event.metaKey;

        // Check if Ctrl is required but not pressed
        const ctrlRequired = shortcut.ctrl && !(event.ctrlKey || event.metaKey);
        // Check if Shift is required but not pressed
        const shiftRequired = shortcut.shift && !event.shiftKey;
        // Check if Alt is required but not pressed
        const altRequired = shortcut.alt && !event.altKey;

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
          if (debug) {
            console.log('[Keyboard Shortcut]', {
              key: shortcut.key,
              ctrl: shortcut.ctrl,
              shift: shortcut.shift,
              alt: shortcut.alt,
              description: shortcut.description,
            });
          }

          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }

          shortcut.action();
          break; // Only execute first matching shortcut
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, excludeInputs, debug]);
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const modifiers: string[] = [];

  if (shortcut.ctrl) modifiers.push(isMac() ? 'Cmd' : 'Ctrl');
  if (shortcut.shift) modifiers.push('Shift');
  if (shortcut.alt) modifiers.push('Alt');
  if (shortcut.meta) modifiers.push('Meta');

  modifiers.push(shortcut.key.toUpperCase());

  return modifiers.join('+');
}

/**
 * Check if running on Mac
 */
export function isMac(): boolean {
  return (
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  );
}

/**
 * Get modifier key symbol for current platform
 */
export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}
