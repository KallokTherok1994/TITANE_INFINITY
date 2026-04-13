import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { deriveAiStatus } from '../TopNav';
import * as zoomScale from '@/hooks/zoomScale';

describe('TopNav AI status truth', () => {
  it('ignores local fallback in cloud health percentage', () => {
    const result = deriveAiStatus([
      { provider: 'gemini', available: false },
      { provider: 'ollama', available: true },
      { provider: 'local', available: true },
    ]);

    expect(result).toEqual({
      percent: 50,
      available: 1,
      total: 2,
    });
  });

  it('returns unknown percentage when only local fallback exists', () => {
    const result = deriveAiStatus([{ provider: 'local', available: true }]);

    expect(result).toEqual({
      percent: null,
      available: 0,
      total: 0,
    });
  });
});

describe('zoomScale utilities (used by TopNav zoom controls)', () => {
  const ORIGINAL_ZOOM = 0.75;

  beforeEach(() => {
    // Simulate a document root with initial zoom
    vi.spyOn(zoomScale, 'readCurrentZoomScale').mockReturnValue(ORIGINAL_ZOOM);
    vi.spyOn(zoomScale, 'applyZoomScale').mockImplementation((v) => zoomScale.clampZoomScale(v));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('zoom in increases level by ~10%', () => {
    const current = zoomScale.readCurrentZoomScale();
    const next = zoomScale.clampZoomScale(current * 1.1);
    expect(next).toBeCloseTo(0.825, 2);
  });

  it('zoom out decreases level by ~10%', () => {
    const current = zoomScale.readCurrentZoomScale();
    const next = zoomScale.clampZoomScale(current * 0.9);
    expect(next).toBeCloseTo(0.675, 2);
  });

  it('clamps at MIN_ZOOM_SCALE (0.5)', () => {
    expect(zoomScale.clampZoomScale(0.1)).toBe(zoomScale.MIN_ZOOM_SCALE);
  });

  it('clamps at MAX_ZOOM_SCALE (2.0)', () => {
    expect(zoomScale.clampZoomScale(5.0)).toBe(zoomScale.MAX_ZOOM_SCALE);
  });

  it('clampZoomScale preserves value within range', () => {
    expect(zoomScale.clampZoomScale(1.0)).toBe(1.0);
    expect(zoomScale.clampZoomScale(0.5)).toBe(0.5);
    expect(zoomScale.clampZoomScale(2.0)).toBe(2.0);
  });
});
