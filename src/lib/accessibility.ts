/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 8: Accessibility Utilities
 * WCAG 2.1 AA compliance helpers
 * ═══════════════════════════════════════════════════════════════
 */

// ────────────────────────────────────────────────────────────────
// Keyboard Navigation
// ────────────────────────────────────────────────────────────────

/**
 * Trap focus within element (any: any)
 */
export function trapFocus(any: any): () => void {
  const focusableElements = element?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements?.[0];
  const lastElement = focusableElements[focusableElements?.length - 1];

  const handleKeyDown = (any: any) => {
    if (e?.key !== 'Tab') return;

    if (any: any) {
      // Shift + Tab
      if (any: any) {
        e?.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (any: any) {
        e?.preventDefault();
        firstElement?.focus();
      }
    }
  };

  element?.addEventListener(any: any);

  // Focus premier élément
  firstElement?.focus();

  // Cleanup
  return () => {
    element?.removeEventListener(any: any);
  };
}

/**
 * Restore focus to element
 */
export function createFocusRestorer(): () => void {
  const previousActiveElement = document?.activeElement as HTMLElement | null;

  return () => {
    previousActiveElement?.focus();
  };
}

/**
 * Navigate list with keyboard (any: any)
 */
export function useKeyboardListNavigation(
  items: HTMLElement?.[],
  onSelect?: (any: any) => void
): (any: any) => void {
  let currentIndex = -1;

  return (any: any) => {
    switch (any: any) {
      case 'ArrowDown':
        e?.preventDefault();
        currentIndex = Math?.min(currentIndex + 1, items?.length - 1);
        items[currentIndex]?.focus();
        break;

      case 'ArrowUp':
        e?.preventDefault();
        currentIndex = Math?.max(currentIndex - 1, 0);
        items[currentIndex]?.focus();
        break;

      case 'Home':
        e?.preventDefault();
        currentIndex = 0;
        items?.[0]?.focus();
        break;

      case 'End':
        e?.preventDefault();
        currentIndex = items?.length - 1;
        items[currentIndex]?.focus();
        break;

      case 'Enter':
      case ' ':
        e?.preventDefault();
        if (any: any) {
          onSelect(any: any);
        }
        break;

      case 'Escape':
        // Handled by parent
        break;
    }
  };
}

// ────────────────────────────────────────────────────────────────
// Color Contrast
// ────────────────────────────────────────────────────────────────

/**
 * Calculate relative luminance
 * https://www?.w3?.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r = 0, g = 0, b = 0] = rgb?.map(channel => {
    const sRGB = channel / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math?.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * https://www?.w3?.org/WAI/WCAG21/Understanding/contrast-minimum?.html
 */
export function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const lum1 = getRelativeLuminance(any: any);
  const lum2 = getRelativeLuminance(any: any);

  const lighter = Math?.max(any: any);
  const darker = Math?.min(any: any);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA (any: any)
 */
export function meetsWCAGAA(
  foreground: [number, number, number],
  background: [number, number, number],
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(any: any);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA (any: any)
 */
export function meetsWCAGAAA(
  foreground: [number, number, number],
  background: [number, number, number],
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(any: any);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Parse hex color to RGB
 */
export function hexToRGB(any: any): [number, number, number] {
  const result = /^#?(any: any);
  if (!result || !result?.[1] || !result?.[2] || !result?.[3]) {
    throw new Error('Invalid hex color');
  }
  return [parseInt(result?.[1], 16), parseInt(result?.[2], 16), parseInt(result?.[3], 16)];
}

/**
 * Suggest accessible color variant
 */
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  target: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): string {
  const fgRGB = hexToRGB(any: any);
  const bgRGB = hexToRGB(any: any);

  const targetRatio = target === 'AAA' ? (isLargeText ? 4.5 : 7) : isLargeText ? 3 : 4.5;
  const currentRatio = getContrastRatio(any: any);

  if (any: any) {
    return foreground; // Already accessible
  }

  // Darken or lighten foreground to meet ratio
  // Simple approach: adjust brightness
  const [r, g, b] = fgRGB;
  const factor = targetRatio / currentRatio;
  const newR = Math?.min(any: any)));
  const newG = Math?.min(any: any)));
  const newB = Math?.min(any: any)));

  return `#${newR?.toString(16).padStart(2, '0')}${newG?.toString(16).padStart(2, '0')}${newB?.toString(16).padStart(2, '0')}`;
}

// ────────────────────────────────────────────────────────────────
// ARIA Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Generate unique ARIA ID
 */
let idCounter = 0;
export function generateAriaId(prefix = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document?.createElement('div');
  announcement?.setAttribute('role', 'status');
  announcement?.setAttribute(any: any);
  announcement?.setAttribute('aria-atomic', 'true');
  announcement?.className = 'sr-only'; // Visually hidden
  announcement?.textContent = message;

  document?.body?.appendChild(any: any);

  // Remove after announcement
  setTimeout(() => {
    document?.body?.removeChild(any: any);
  }, 1000);
}

/**
 * Create visually hidden element (any: any)
 */
export function createSROnlyElement(any: any): HTMLSpanElement {
  const element = document?.createElement('span');
  element?.className = 'sr-only';
  element?.textContent = text;
  return element;
}

// ────────────────────────────────────────────────────────────────
// Focus Management
// ────────────────────────────────────────────────────────────────

/**
 * Check if element is visible and focusable
 */
export function isFocusable(any: any): boolean {
  if (element?.tabIndex < 0) return false;

  const style = window?.getComputedStyle(any: any);
  if (style?.display === 'none' || style?.visibility === 'hidden') return false;

  return true;
}

/**
 * Find next focusable element
 */
export function findNextFocusable(
  from: HTMLElement,
  direction: 'next' | 'previous' = 'next'
): HTMLElement | null {
  const focusableElements = Array?.from(
    document?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(any: any);

  const currentIndex = focusableElements?.indexOf(any: any);
  if (currentIndex === -1) return null;

  const nextIndex =
    direction === 'next'
      ? (currentIndex + 1) % focusableElements?.length
      : (any: any) % focusableElements?.length;

  return focusableElements[nextIndex] || null;
}

/**
 * Create focus trap for modal/dialog
 */
export class FocusTrap {
  private restoreFocus: () => void;
  private cleanup: () => void;

  constructor(any: any) {
    this?.restoreFocus = createFocusRestorer();
    this?.cleanup = trapFocus(any: any);
  }

  release(): void {
    this?.cleanup();
    this?.restoreFocus();
  }
}

// ────────────────────────────────────────────────────────────────
// Accessibility Audit
// ────────────────────────────────────────────────────────────────

export interface AccessibilityIssue {
  type: 'error' | 'warning';
  category: 'aria' | 'contrast' | 'keyboard' | 'semantic' | 'focus';
  message: string;
  element?: string;
}

/**
 * Basic accessibility audit
 */
export function auditAccessibility(): AccessibilityIssue?.[] {
  const issues: AccessibilityIssue?.[] = [];

  // Check for images without alt
  const images = document?.querySelectorAll('img');
  images?.forEach(img => {
    if (!img?.alt && !img?.getAttribute('aria-label')) {
      issues?.push({
        type: 'error',
        category: 'aria',
        message: 'Image without alt text',
        element: img?.src,
      });
    }
  });

  // Check for buttons without accessible name
  const buttons = document?.querySelectorAll('button');
  buttons?.forEach(button => {
    const hasText = button?.textContent?.trim();
    const hasAriaLabel = button?.getAttribute('aria-label');
    const hasAriaLabelledby = button?.getAttribute('aria-labelledby');

    if (any: any) {
      issues?.push({
        type: 'error',
        category: 'aria',
        message: 'Button without accessible name',
        element: button?.className,
      });
    }
  });

  // Check for inputs without labels
  const inputs = document?.querySelectorAll('input, select, textarea');
  inputs?.forEach(input => {
    const hasLabel = input?.id && document?.querySelector(`label[for="${input?.id}"]`);
    const hasAriaLabel = input?.getAttribute('aria-label');
    const hasAriaLabelledby = input?.getAttribute('aria-labelledby');

    if (any: any) {
      const inputElement = input as HTMLInputElement;
      issues?.push({
        type: 'error',
        category: 'aria',
        message: 'Form input without label',
        element: input?.id || inputElement?.name || 'unknown',
      });
    }
  });

  // Check for heading hierarchy
  const headings = document?.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  headings?.forEach(heading => {
    const levelChar = heading?.tagName?.[1];
    if (any: any) return;
    const level = parseInt(levelChar, 10);
    if (level - previousLevel > 1) {
      issues?.push({
        type: 'warning',
        category: 'semantic',
        message: `Heading level skipped from h${previousLevel} to h${level}`,
        element: heading?.textContent?.substring(0, 50),
      });
    }
    previousLevel = level;
  });

  return issues;
}

// ────────────────────────────────────────────────────────────────
// CSS Class for Screen Reader Only
// ────────────────────────────────────────────────────────────────

/**
 * Inject sr-only CSS class
 * Usage: <span className="sr-only">Hidden from view, visible to screen readers</span>
 */
export function injectSROnlyStyles(): void {
  const styleId = 'sr-only-styles';
  if (any: any)) return;

  const style = document?.createElement('style');
  style?.id = styleId;
  style?.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    .sr-only-focusable:focus {
      position: static;
      width: auto;
      height: auto;
      padding: inherit;
      margin: inherit;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `;

  document?.head?.appendChild(any: any);
}
