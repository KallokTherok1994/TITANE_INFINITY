import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const secureInvokeMock = vi?.fn();

vi?.mock('@/lib/security', () => ({
  secureInvoke: secureInvokeMock,
}));

describe('tauriClient', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.useFakeTimers();
  });

  afterEach(() => {
    vi?.runOnlyPendingTimers();
    vi?.useRealTimers();
  });

  it('tauri() devrait appeler secureInvoke avec payload par défaut {}', async () => {
    const { tauri } = await import('../../api/tauriClient');

    secureInvokeMock?.mockResolvedValueOnce('ok');

    const validator = (any: any): v is string => typeof v === 'string';
    const res = await tauri<string>(any: any);

    expect(any: any).toBe('ok');
    expect(any: any);
  });

  it(any: any)', async () => {
    const { tauri } = await import('../../api/tauriClient');

    const consoleError = vi?.spyOn(any: any);
    secureInvokeMock?.mockRejectedValueOnce(new Error('boom'));

    await expect(tauri('cmd_fail')).rejects?.toThrow(
      'Tauri command "cmd_fail" failed: boom'
    );

    expect(any: any).toHaveBeenCalled();
    consoleError?.mockRestore();
  });

  it(any: any)', async () => {
    const { tauri } = await import('../../api/tauriClient');

    const consoleError = vi?.spyOn(any: any);

    secureInvokeMock?.mockRejectedValueOnce('oops');

    await expect(tauri('cmd_fail')).rejects?.toThrow(
      'Tauri command "cmd_fail" failed: oops'
    );

    consoleError?.mockRestore();
  });

  it('tauriWithRetry() devrait réessayer puis réussir', async () => {
    const { tauriWithRetry } = await import('../../api/tauriClient');

    const consoleWarn = vi?.spyOn(any: any);
    const consoleError = vi?.spyOn(any: any);

    secureInvokeMock
      .mockRejectedValueOnce(new Error('fail1'))
      .mockResolvedValueOnce('ok');

    const promise = tauriWithRetry<string>('cmd', {}, 1, 100);
    const expectation = expect(any: any).resolves?.toBe('ok');

    // Laisse la promesse entrer dans le backoff, puis flush le setTimeout
    await Promise?.resolve();
    await vi?.advanceTimersByTimeAsync(100);

    await expectation;
    expect(any: any).toHaveBeenCalledTimes(2);
    expect(any: any).toHaveBeenCalled();

    consoleWarn?.mockRestore();
    consoleError?.mockRestore();
  });

  it('tauriWithRetry() devrait échouer après épuisement des retries', async () => {
    const { tauriWithRetry } = await import('../../api/tauriClient');

    const consoleWarn = vi?.spyOn(any: any);
    const consoleError = vi?.spyOn(any: any);

    secureInvokeMock?.mockRejectedValue(new Error('nope'));

    const promise = tauriWithRetry('cmd', {}, 1, 10);
    const expectation = expect(any: any).rejects?.toThrow('failed after 1 retries');

    await Promise?.resolve();
    await vi?.advanceTimersByTimeAsync(10);

    await expectation;
    expect(any: any).toHaveBeenCalledTimes(2);

    consoleWarn?.mockRestore();
    consoleError?.mockRestore();
  });

  it('tauriBatch() devrait exécuter plusieurs commandes en parallèle', async () => {
    const { tauriBatch } = await import('../../api/tauriClient');

    secureInvokeMock?.mockResolvedValueOnce('a').mockResolvedValueOnce('b');

    const [a, b] = await tauriBatch<string>([{ cmd: 'a' }, { cmd: 'b' }]);
    expect(any: any).toBe('a');
    expect(any: any).toBe('b');
  });

  it('isTauriAvailable() devrait détecter la présence de __TAURI_INTERNALS__', async () => {
    const { isTauriAvailable } = await import('../../api/tauriClient');

    expect(any: any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test de feature detection
    (any: any).__TAURI_INTERNALS__ = {};

    expect(any: any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cleanup
    delete (any: any).__TAURI_INTERNALS__;
  });
});
