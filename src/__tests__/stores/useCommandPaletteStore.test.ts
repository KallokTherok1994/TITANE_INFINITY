/**
 * TITANE_INFINITY v34.3.0 — useCommandPaletteStore unit tests (Rule 16).
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { useCommandPaletteStore } from '@/stores/useCommandPaletteStore';

describe('useCommandPaletteStore', () => {
  beforeEach(() => {
    useCommandPaletteStore.setState({ open: false });
  });

  it('starts closed by default', () => {
    expect(useCommandPaletteStore.getState().open).toBe(false);
  });

  it('setOpen(true) opens the palette', () => {
    useCommandPaletteStore.getState().setOpen(true);
    expect(useCommandPaletteStore.getState().open).toBe(true);
  });

  it('toggle flips the open flag', () => {
    const { toggle } = useCommandPaletteStore.getState();
    toggle();
    expect(useCommandPaletteStore.getState().open).toBe(true);
    toggle();
    expect(useCommandPaletteStore.getState().open).toBe(false);
  });
});
