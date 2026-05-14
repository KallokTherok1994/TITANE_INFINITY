/**
 * TITANE_INFINITY v34.2.0 — TanStack Query Keys Factory
 *
 * Canonical hierarchical query key factory used by every Query hook.
 * Keys are typed `as const` so TanStack Query can derive precise types
 * and so cache invalidation by prefix (`queryClient.invalidateQueries({ queryKey: keys.system.all })`)
 * stays type-safe and exhaustive.
 *
 * Discipline:
 *  - Every cluster exposes `all` (root prefix) for bulk invalidation.
 *  - Every leaf returns a tuple of literal segments; never serialize objects unless required.
 *  - When a hook needs parameters, the param tuple element is JSON-stable (primitives only).
 *
 * Rule 6 alignment: keys never embed IPC envelopes; they only describe identity.
 */

export const queryKeys = {
  system: {
    all: ['system'] as const,
    health: () => ['system', 'health'] as const,
  },
  engines: {
    all: ['engines'] as const,
    status: () => ['engines', 'status'] as const,
  },
  providers: {
    all: ['providers'] as const,
    status: () => ['providers', 'status'] as const,
  },
  conversation: {
    all: ['conversation'] as const,
    health: () => ['conversation', 'health'] as const,
  },
  devtools: {
    all: ['devtools'] as const,
    memoryHealth: () => ['devtools', 'memory-health'] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
