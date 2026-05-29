/**
 * TITANE∞ — useNexusMode hook (NEXUS v36 Gate 12)
 *
 * Consumes the NexusShell context to read and set the current navigation mode.
 * Returns null values when called outside a NexusShell provider (safe fallback).
 */

import { useNexusShellContext } from './NexusShell';
import type { NavMode } from '@/lib/navigationMode';

export interface NexusModeResult {
  /** Current navigation mode, or null if outside NexusShell */
  readonly mode: NavMode | null;
  /** Setter for navigation mode, or null if outside NexusShell */
  readonly setMode: ((mode: NavMode) => void) | null;
  /** True if the NexusShell context is available */
  readonly isInShell: boolean;
}

export function useNexusMode(): NexusModeResult {
  const ctx = useNexusShellContext();
  return {
    mode: ctx?.mode ?? null,
    setMode: ctx?.setMode ?? null,
    isInShell: ctx !== null,
  };
}
