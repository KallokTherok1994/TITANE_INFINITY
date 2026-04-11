import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isTauriAvailable } from '@/api/tauriClient';
import { confirm as tauriConfirm } from '@tauri-apps/plugin-dialog';

import { createDevtoolsShortcutHandler, isDevtoolsShortcut } from '../devtoolsShortcuts';
import { confirmAction } from '../runtimeConfirm';

vi.mock('@/api/tauriClient', () => ({
  isTauriAvailable: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  confirm: vi.fn(),
}));

describe('devtools interaction guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('detects supported devtools shortcuts', () => {
    expect(isDevtoolsShortcut(new KeyboardEvent('keydown', { key: 'F12' }))).toBe(true);
    expect(
      isDevtoolsShortcut(
        new KeyboardEvent('keydown', { key: 'I', ctrlKey: true, shiftKey: true })
      )
    ).toBe(true);
    expect(isDevtoolsShortcut(new KeyboardEvent('keydown', { key: 'Escape' }))).toBe(
      false
    );
  });

  it('falls back to toggleDevtools when openDevtools fails', async () => {
    const openDevtools = vi.fn().mockRejectedValue(new Error('open failed'));
    const toggleDevtools = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    const handler = createDevtoolsShortcutHandler({
      isTauriRuntime: () => true,
      openDevtools,
      toggleDevtools,
      onError,
    });

    await handler({
      key: 'F12',
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault,
      stopPropagation,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(openDevtools).toHaveBeenCalledTimes(1);
    expect(toggleDevtools).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('ignores the shortcut outside Tauri runtime', async () => {
    const openDevtools = vi.fn();
    const handler = createDevtoolsShortcutHandler({
      isTauriRuntime: () => false,
      openDevtools,
    });

    await handler(new KeyboardEvent('keydown', { key: 'F12' }));

    expect(openDevtools).not.toHaveBeenCalled();
  });

  it('runs a fallback action when native DevTools APIs are unavailable', async () => {
    const openDevtools = vi.fn().mockRejectedValue(new Error('native API unavailable'));
    const fallbackAction = vi.fn();

    const handler = createDevtoolsShortcutHandler({
      isTauriRuntime: () => true,
      openDevtools,
      fallbackAction,
    });

    await handler(new KeyboardEvent('keydown', { key: 'F12' }));

    expect(openDevtools).toHaveBeenCalledTimes(1);
    expect(fallbackAction).toHaveBeenCalledTimes(1);
  });
});

describe('confirmAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses window.confirm first when available to avoid ACL issues', async () => {
    vi.mocked(isTauriAvailable).mockReturnValue(true);
    vi.mocked(tauriConfirm).mockResolvedValue(true);
    const confirmSpy = vi.fn(() => false);
    vi.stubGlobal('confirm', confirmSpy);

    await expect(
      confirmAction('Effacer le chat ?', { title: 'Confirmation requise' })
    ).resolves.toBe(false);

    expect(confirmSpy).toHaveBeenCalledWith('Effacer le chat ?');
    expect(tauriConfirm).not.toHaveBeenCalled();
  });

  it('defaults safely without calling the Tauri dialog when browser confirm is unavailable', async () => {
    vi.mocked(isTauriAvailable).mockReturnValue(true);
    vi.mocked(tauriConfirm).mockResolvedValue(true);
    vi.stubGlobal('confirm', undefined);

    await expect(
      confirmAction('Effacer le chat ?', {
        title: 'Confirmation requise',
        defaultToConfirmed: true,
      })
    ).resolves.toBe(true);

    expect(tauriConfirm).not.toHaveBeenCalled();
  });

  it('uses window.confirm as a browser fallback', async () => {
    vi.mocked(isTauriAvailable).mockReturnValue(false);
    const confirmSpy = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmSpy);

    await expect(confirmAction('Effacer le chat ?')).resolves.toBe(true);

    expect(confirmSpy).toHaveBeenCalledWith('Effacer le chat ?');
  });

  it('can default to confirmed when confirm APIs are unavailable', async () => {
    vi.mocked(isTauriAvailable).mockReturnValue(false);
    vi.stubGlobal('confirm', undefined);

    await expect(
      confirmAction('Effacer le chat ?', { defaultToConfirmed: true })
    ).resolves.toBe(true);
  });
});
