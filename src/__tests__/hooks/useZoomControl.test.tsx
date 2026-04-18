import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { loadSavedZoom, useZoomControl } from '@/hooks/useZoomControl';

describe('useZoomControl', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty('zoom');
    document.documentElement.style.fontSize = '16px';
    document.documentElement.style.setProperty('--titane-ui-scale', '1');
  });

  it('applies keyboard zoom from the current computed scale using the canonical +10pt step', () => {
    document.documentElement.style.fontSize = '17.6px';
    document.documentElement.style.setProperty('--titane-ui-scale', '1.1');

    renderHook(() => useZoomControl());

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '=',
        ctrlKey: true,
        bubbles: true,
      })
    );

    expect(document.documentElement.style.getPropertyValue('--titane-ui-scale')).toBe('1.2');
    expect(document.documentElement.style.fontSize).toBe('19.2px');
    expect(localStorage.getItem('titane_zoom_level')).toBe('1.2');
  });

  it('returns exactly to baseline after keyboard zoom in then zoom out', () => {
    renderHook(() => useZoomControl());

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '=',
        ctrlKey: true,
        bubbles: true,
      })
    );

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '-',
        ctrlKey: true,
        bubbles: true,
      })
    );

    expect(document.documentElement.style.getPropertyValue('--titane-ui-scale')).toBe('1');
    expect(document.documentElement.style.fontSize).toBe('16px');
    expect(localStorage.getItem('titane_zoom_level')).toBe('1');
  });

  it('restores the baseline zoom on Ctrl+0', () => {
    document.documentElement.style.fontSize = '22.4px';
    document.documentElement.style.setProperty('--titane-ui-scale', '1.4');

    renderHook(() => useZoomControl());

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '0',
        ctrlKey: true,
        bubbles: true,
      })
    );

    expect(document.documentElement.style.getPropertyValue('--titane-ui-scale')).toBe('1');
    expect(document.documentElement.style.fontSize).toBe('16px');
    expect(localStorage.getItem('titane_zoom_level')).toBe('1');
  });

  it('migrates legacy percent-like storage values when loading saved zoom', () => {
    localStorage.setItem('titane_zoom_level', '110');

    loadSavedZoom();

    expect(document.documentElement.style.getPropertyValue('--titane-ui-scale')).toBe('1.1');
    expect(document.documentElement.style.fontSize).toBe('17.6px');
  });
});
