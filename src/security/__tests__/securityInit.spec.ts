import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CspManager } from '../CspManager';
import { SessionGuard } from '../SessionGuard';
import { initializeSecurity } from '../index';

describe('initializeSecurity', () => {
  const originalTauriInternals = (
    window as Window & { __TAURI_INTERNALS__?: unknown }
  ).__TAURI_INTERNALS__;

  beforeEach(() => {
    document.head.innerHTML = '';
    delete (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.head.innerHTML = '';
    if (typeof originalTauriInternals === 'undefined') {
      delete (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    } else {
      (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ =
        originalTauriInternals;
    }
    vi.restoreAllMocks();
  });

  it('applies meta CSP outside Tauri runtime', () => {
    const applySpy = vi
      .spyOn(CspManager, 'applyToDocument')
      .mockImplementation(() => undefined);
    vi.spyOn(CspManager, 'initialize').mockImplementation(() => undefined);
    vi.spyOn(SessionGuard, 'initialize').mockImplementation(() => undefined);

    initializeSecurity();

    expect(applySpy).toHaveBeenCalledTimes(1);
  });

  it('does not apply meta CSP in Tauri runtime', () => {
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {
      invoke: vi.fn(),
    };

    const applySpy = vi
      .spyOn(CspManager, 'applyToDocument')
      .mockImplementation(() => undefined);
    vi.spyOn(CspManager, 'initialize').mockImplementation(() => undefined);
    vi.spyOn(SessionGuard, 'initialize').mockImplementation(() => undefined);

    initializeSecurity();

    expect(applySpy).not.toHaveBeenCalled();
  });
});
