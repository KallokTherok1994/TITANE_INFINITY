/**
 * TITANE_INFINITY v34.1.0 — Admin Clear WebView Cache wiring contract test
 *
 * Verifies (without full page render, which requires deep runtime config):
 *   1. TAURI_COMMANDS.CLEAR_WEBVIEW_CACHE constant registered.
 *   2. tauriClient.clearWebviewCache() delegates to the canonical command via
 *      the secureInvoke pipeline.
 *   3. Returns the expected {cleared, skipped, errors} envelope shape.
 *   4. Frontend ALLOWED_COMMANDS allowlist contains the command.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/security', async () => {
  const actual = await vi.importActual<typeof import('@/lib/security')>('@/lib/security');
  return {
    ...actual,
    secureInvoke: vi.fn(async () => ({
      cleared: ['Cache', 'GPUCache'],
      skipped: ['Code Cache'],
      errors: [],
    })),
  };
});

describe('AdminClearWebviewCacheButton — wiring contract (v34.1.0)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes TAURI_COMMANDS.CLEAR_WEBVIEW_CACHE constant', async () => {
    const { TAURI_COMMANDS } = await import('@/lib/tauriCommands');
    expect(TAURI_COMMANDS.CLEAR_WEBVIEW_CACHE).toBe('clear_webview_cache');
  });

  it('clearWebviewCache() invokes secureInvoke with canonical command name', async () => {
    const security = await import('@/lib/security');
    const { tauriClient } = await import('@/lib/tauriClient');
    const result = await tauriClient.clearWebviewCache();
    expect(security.secureInvoke).toHaveBeenCalledWith(
      'clear_webview_cache',
      {},
      undefined
    );
    expect(result).toEqual({
      cleared: ['Cache', 'GPUCache'],
      skipped: ['Code Cache'],
      errors: [],
    });
  });

  it('ALLOWED_COMMANDS allowlist contains clear_webview_cache', async () => {
    const security =
      await vi.importActual<typeof import('@/lib/security')>('@/lib/security');
    expect(security.ALLOWED_COMMANDS.has('clear_webview_cache')).toBe(true);
  });
});
