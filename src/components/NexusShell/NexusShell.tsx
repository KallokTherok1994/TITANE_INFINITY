/**
 * TITANE∞ — NexusShell (NEXUS v36 Gate 12)
 *
 * Mode context provider for Daily / System / Dev navigation modes.
 * Pure React context — additive, no App.tsx changes required.
 * App.tsx wrapping (P36-07) is deferred to Gate 13.
 *
 * Usage (future, Gate 13+):
 *   <NexusShell defaultMode="DAILY">
 *     <AppRouter />
 *   </NexusShell>
 */

import React, { createContext, useContext, useState } from 'react';
import type { NavMode } from '@/lib/navigationMode';

// ─── Context ──────────────────────────────────────────────────────────────────

interface NexusShellContextValue {
  readonly mode: NavMode;
  readonly setMode: (mode: NavMode) => void;
}

const NexusShellContext = createContext<NexusShellContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface NexusShellProps {
  children: React.ReactNode;
  defaultMode?: NavMode;
}

export const NexusShell: React.FC<NexusShellProps> = ({
  children,
  defaultMode = 'DAILY',
}) => {
  const [mode, setMode] = useState<NavMode>(defaultMode);

  return (
    <NexusShellContext.Provider value={{ mode, setMode }}>
      {children}
    </NexusShellContext.Provider>
  );
};

// ─── Context accessor (safe) ──────────────────────────────────────────────────

export function useNexusShellContext(): NexusShellContextValue | null {
  return useContext(NexusShellContext);
}
