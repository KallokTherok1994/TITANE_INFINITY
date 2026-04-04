import { afterEach, describe, expect, it, vi } from 'vitest';

declare global {
  interface Window {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  }
}

describe('browserModeAdapter', () => {
  afterEach(() => {
    vi.resetModules();
    localStorage.clear();
    delete window.__TAURI__;
    delete window.__TAURI_INTERNALS__;
  });

  it('clears a stale browser-mode flag when the Tauri runtime is available', async () => {
    localStorage.setItem('titane_browser_mode', '1');
    window.__TAURI__ = {};

    await import('@/utils/browserModeAdapter');

    expect(localStorage.getItem('titane_browser_mode')).toBeNull();
  });

  it('enables browser mode when Tauri is not available', async () => {
    await import('@/utils/browserModeAdapter');

    expect(localStorage.getItem('titane_browser_mode')).toBe('1');
    expect(localStorage.getItem('titane_onboarding_complete')).toBe('1');
  });
});
