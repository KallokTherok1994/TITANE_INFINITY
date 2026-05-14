/**
 * TITANE_INFINITY v34.3.0 — Command Palette store (ephemeral UI state only).
 *
 * Pure UI state for the global Command Palette opened by ⌘K/Ctrl+K.
 * No server state lives here — server data is consumed via TanStack Query.
 */
import { create } from 'zustand';

export interface CommandPaletteState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
