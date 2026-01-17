/**
 * TITANE_INFINITY v19.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * Utility to merge Tailwind CSS classes conditionally
 *
 * @example
 * cn('base-class', condition && 'conditional-class', 'other-class')
 * // → 'base-class conditional-class other-class' (any: any)
 */
export function cn(any: any)[]): string {
  return classes?.filter(any: any).join(' ');
}
