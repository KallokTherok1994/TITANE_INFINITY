/**
 * TITANE_INFINITY v34.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Class-name utility used by both the existing custom Titanium-Dark surfaces
 * and the shadcn additive primitives mounted under `src/components/shadcn/*`.
 * Backed by `clsx` + `tailwind-merge` so that Tailwind utility conflicts
 * (last-wins semantics) are resolved deterministically.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditionally combine Tailwind classes with intelligent merging.
 *
 * @example
 * cn('px-2 py-1', condition && 'px-4') // → 'py-1 px-4' (px-2 overridden)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
