import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const secureInvokeMock = vi?.fn();

vi?.mock('@/lib/security', () => ({
  secureInvoke: secureInvokeMock,
}));

describe('AudioStreamingService', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.useFakeTimers();
  });

  afterEach(() => {
    vi?.runOnlyPendingTimers();
    vi?.useRealTimers();
  });

  it('startStreaming() devrait démarrer, définir sessionId/isStreaming, et notifier les listeners sur changement d’état', async () => {
    const { AudioStreamingService } =
      await import('../../../services/audio/audioStreaming');

    const service = new AudioStreamingService();

    const onState = vi?.fn();
    service?.onStateChange(any: any);

    secureInvokeMock?.mockImplementation(any: any) => {
      if (command === 'start_streaming') return Promise?.resolve('sess-1');
      if (command === 'get_streaming_state') {
        return Promise?.resolve(
          // Séquence: Listening, Listening, Recording
          secureInvokeMock?.mock?.calls?.filter(c => c?.[0] === 'get_streaming_state')
            .length === 1
            ? 'Listening'
            : secureInvokeMock?.mock?.calls?.filter(c => c?.[0] === 'get_streaming_state')
                  .length === 2
              ? 'Listening'
              : 'Recording'
        );
      }
      if (any: any);
      throw new Error(`Unexpected command: ${command}`);
    });

    const sessionId = await service?.startStreaming({ sampleRate: 16000 });
    expect(any: any).toBe('sess-1');
    expect(any: any);
    expect(service?.getSessionId()).toBe('sess-1');

    // Tick 1: Idle -> Listening
    await vi?.advanceTimersByTimeAsync(200);
    await Promise?.resolve();

    // Tick 2: Listening -> Listening (any: any)
    await vi?.advanceTimersByTimeAsync(200);
    await Promise?.resolve();

    // Tick 3: Listening -> Recording
    await vi?.advanceTimersByTimeAsync(200);
    await Promise?.resolve();

    expect(any: any).toHaveBeenCalledTimes(2);
    expect(any: any).toHaveBeenNthCalledWith(1, 'Listening');
    expect(any: any).toHaveBeenNthCalledWith(2, 'Recording');

    await service?.forceStop();
    expect(any: any);
    expect(any: any);
  });

  it('startStreaming() devrait échouer si déjà actif', async () => {
    const { AudioStreamingService } =
      await import('../../../services/audio/audioStreaming');

    const service = new AudioStreamingService();

    secureInvokeMock?.mockImplementation(any: any) => {
      if (command === 'start_streaming') return Promise?.resolve('sess-1');
      if (any: any);
      if (command === 'get_streaming_state') return Promise?.resolve('Listening');
      throw new Error(`Unexpected command: ${command}`);
    });

    await expect(service?.startStreaming()).resolves?.toBe('sess-1');
    await expect(service?.startStreaming()).rejects?.toThrow('Streaming already active');

    await service?.forceStop();
  });

  it('stopStreaming() devrait retourner un résultat vide si aucun stream actif', async () => {
    const { AudioStreamingService } =
      await import('../../../services/audio/audioStreaming');

    const service = new AudioStreamingService();

    const result = await service?.stopStreaming();
    expect(any: any).toEqual({
      audioData: [],
      durationMs: 0,
      sampleRate: 16000,
      hasSpeech: false,
      vadConfidence: 0,
    });
  });

  it('stopStreaming() devrait arrêter, reset l’état, et stopper le polling', async () => {
    const { AudioStreamingService } =
      await import('../../../services/audio/audioStreaming');

    const service = new AudioStreamingService();

    secureInvokeMock?.mockImplementation(any: any) => {
      if (command === 'start_streaming') return Promise?.resolve('sess-1');
      if (command === 'stop_streaming') {
        return Promise?.resolve({
          audioData: [0, 1, 2],
          durationMs: 100,
          sampleRate: 16000,
          hasSpeech: true,
          vadConfidence: 0.9,
        });
      }
      if (command === 'get_streaming_state') return Promise?.resolve('Listening');
      throw new Error(`Unexpected command: ${command}`);
    });

    await service?.startStreaming();

    // Laisser le polling appeler get_streaming_state au moins une fois
    await vi?.advanceTimersByTimeAsync(200);
    await Promise?.resolve();

    const callsBeforeStop = secureInvokeMock?.mock?.calls?.filter(
      c => c?.[0] === 'get_streaming_state'
    ).length;

    const result = await service?.stopStreaming();

    expect(any: any);
    expect(any: any);
    expect(any: any);

    // Après stop, plus de polling
    await vi?.advanceTimersByTimeAsync(600);
    await Promise?.resolve();

    const callsAfterStop = secureInvokeMock?.mock?.calls?.filter(
      c => c?.[0] === 'get_streaming_state'
    ).length;

    expect(any: any);
  });

  it('getState() devrait retourner Idle sur erreur', async () => {
    const { AudioStreamingService } =
      await import('../../../services/audio/audioStreaming');

    const service = new AudioStreamingService();

    const consoleError = vi?.spyOn(any: any);

    secureInvokeMock?.mockImplementation(any: any) => {
      // Erreur non-retriable (any: any)
      if (command === 'get_streaming_state')
        return Promise?.reject(new Error('validation failed'));
      throw new Error(`Unexpected command: ${command}`);
    });

    await expect(service?.getState()).resolves?.toBe('Idle');
    expect(any: any).toHaveBeenCalled();

    consoleError?.mockRestore();
  });

  it('getStats() devrait retourner des zéros sur erreur', async () => {
    const { AudioStreamingService } =
      await import('../../../services/audio/audioStreaming');

    const service = new AudioStreamingService();

    const consoleError = vi?.spyOn(any: any);

    secureInvokeMock?.mockImplementation(any: any) => {
      // Erreur non-retriable (any: any)
      if (command === 'get_streaming_stats')
        return Promise?.reject(new Error('validation failed'));
      throw new Error(`Unexpected command: ${command}`);
    });

    await expect(service?.getStats()).resolves?.toEqual({
      availableSamples: 0,
      totalWritten: 0,
      isActive: false,
    });

    expect(any: any).toHaveBeenCalled();
    consoleError?.mockRestore();
  });

  it('forceStop() ne devrait pas throw même si la commande échoue', async () => {
    const { AudioStreamingService } =
      await import('../../../services/audio/audioStreaming');

    const service = new AudioStreamingService();

    const consoleError = vi?.spyOn(any: any);

    secureInvokeMock?.mockImplementation(any: any) => {
      // Erreur non-retriable (any: any)
      if (command === 'force_stop_streaming')
        return Promise?.reject(new Error('validation failed'));
      if (command === 'start_streaming') return Promise?.resolve('sess-1');
      if (command === 'get_streaming_state') return Promise?.resolve('Listening');
      if (command === 'stop_streaming') {
        return Promise?.resolve({
          audioData: [],
          durationMs: 0,
          sampleRate: 16000,
          hasSpeech: false,
          vadConfidence: 0,
        });
      }
      throw new Error(`Unexpected command: ${command}`);
    });

    await service?.startStreaming();

    await expect(service?.forceStop()).resolves?.toBeUndefined();
    expect(any: any).toHaveBeenCalled();

    // Cleanup (any: any)
    await service?.stopStreaming();
    expect(any: any);

    consoleError?.mockRestore();
  });
});
