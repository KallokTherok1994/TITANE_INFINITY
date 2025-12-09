/**
 * TITANE∞ v8.0 — Class Names Utility
 *
 * Utility function for conditional class names with Tailwind CSS
 * Based on clsx + tailwind-merge pattern
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names conditionally
 * Automatically handles Tailwind class conflicts
 *
 * @example
 * cn('btn', isActive && 'btn-primary', className)
 * // => "btn btn-primary custom-class"
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
