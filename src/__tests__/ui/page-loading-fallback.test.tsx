import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { PageLoadingFallback } from '../../ui/components/PageLoadingFallback';

describe('PageLoadingFallback desktop safety', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    delete (window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
      .__TAURI__;
    delete (window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
      .__TAURI_INTERNALS__;
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    localStorage.clear();
    delete (window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
      .__TAURI__;
    delete (window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
      .__TAURI_INTERNALS__;
    vi.restoreAllMocks();
  });

  it('does not force auto-reload in Tauri desktop mode', () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      configurable: true,
      value: {},
    });

    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

    render(<PageLoadingFallback />);

    act(() => {
      vi.advanceTimersByTime(22_500);
    });

    expect(screen.getByTestId('long-loading-warning')).toBeInTheDocument();
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('keeps browser auto-recovery behavior outside Tauri mode', () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

    render(<PageLoadingFallback />);

    act(() => {
      vi.advanceTimersByTime(22_500);
    });

    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});
