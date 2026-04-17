import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { deriveAiStatus, TopNav, type TopNavItem } from '../TopNav';
import * as zoomScale from '@/hooks/zoomScale';
import * as tauriProtector from '@/utils/tauriProtector';

const TOPNAV_ITEMS: TopNavItem[] = [
  {
    id: 'titane',
    label: 'Titane',
    icon: null,
    route: '/titane',
  },
];

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
  const ORIGINAL_ZOOM = 1;

  beforeEach(() => {
    // Simulate a document root with initial zoom
    vi.spyOn(zoomScale, 'readCurrentZoomScale').mockReturnValue(ORIGINAL_ZOOM);
    vi.spyOn(zoomScale, 'applyZoomScale').mockImplementation(v =>
      zoomScale.clampZoomScale(v)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('zoom in increases level by ~10%', () => {
    const current = zoomScale.readCurrentZoomScale();
    const next = zoomScale.stepZoomScale(current, 1);
    expect(next).toBeCloseTo(1.1, 2);
  });

  it('zoom out decreases level by ~10%', () => {
    const current = zoomScale.readCurrentZoomScale();
    const next = zoomScale.stepZoomScale(current, -1);
    expect(next).toBeCloseTo(0.9, 2);
  });

  it('returns exactly to baseline after one zoom in and one zoom out', () => {
    const zoomIn = zoomScale.stepZoomScale(ORIGINAL_ZOOM, 1);
    const zoomOut = zoomScale.stepZoomScale(zoomIn, -1);

    expect(zoomIn).toBe(1.1);
    expect(zoomOut).toBe(1);
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

describe('TopNav zoom display', () => {
  beforeEach(() => {
    vi.spyOn(zoomScale, 'readCurrentZoomScale').mockReturnValue(1);
    vi.spyOn(tauriProtector, 'isTauriRuntimeAvailable').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the zoom indicator with the canonical width utility', () => {
    render(<TopNav items={TOPNAV_ITEMS} currentRoute="/titane" onNavigate={vi.fn()} />);

    const zoomIndicator = screen.getByText('100%');

    expect(zoomIndicator).toHaveClass('min-w-12');
    expect(zoomIndicator).not.toHaveClass('min-w-[3rem]');
  });
});
