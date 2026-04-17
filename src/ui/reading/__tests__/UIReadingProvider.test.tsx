import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyZoomScale } from '@/hooks/zoomScale';
import { UIReadingProvider } from '../UIReadingProvider';
import { useZoom } from '../useUIReading';

function ZoomProbe(): JSX.Element {
  const { zoomPercent } = useZoom();
  return <span>{zoomPercent}%</span>;
}

describe('UIReadingProvider zoom synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.zoom = '1';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('starts from the canonical zoom truth', () => {
    document.documentElement.style.zoom = '1.2';

    render(
      <UIReadingProvider>
        <ZoomProbe />
      </UIReadingProvider>
    );

    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('tracks external canonical zoom changes', () => {
    render(
      <UIReadingProvider>
        <ZoomProbe />
      </UIReadingProvider>
    );

    act(() => {
      applyZoomScale(1.3);
    });

    expect(screen.getByText('130%')).toBeInTheDocument();
  });
});