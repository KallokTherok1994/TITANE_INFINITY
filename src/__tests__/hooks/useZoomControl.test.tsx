import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { loadSavedZoom, useZoomControl } from '@/hooks/useZoomControl';

describe('useZoomControl', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.zoom = '0.75';
  });

  it('applies keyboard zoom from the current computed scale instead of clamping to 50%', () => {
    document.documentElement.style.zoom = '1.1';

    renderHook(() => useZoomControl());

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '=',
        ctrlKey: true,
        bubbles: true,
      })
    );

    expect(document.documentElement.style.zoom).toBe('1.21');
    expect(localStorage.getItem('titane_zoom_level')).toBe('1.21');
  });

  it('restores the baseline zoom on Ctrl+0', () => {
    document.documentElement.style.zoom = '1.4';

    renderHook(() => useZoomControl());

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '0',
        ctrlKey: true,
        bubbles: true,
      })
    );

    expect(document.documentElement.style.zoom).toBe('0.75');
    expect(localStorage.getItem('titane_zoom_level')).toBe('0.75');
  });

  it('migrates legacy percent-like storage values when loading saved zoom', () => {
    localStorage.setItem('titane_zoom_level', '110');

    loadSavedZoom();

    expect(document.documentElement.style.zoom).toBe('1.1');
  });
});
