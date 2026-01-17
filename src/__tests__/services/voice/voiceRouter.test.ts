import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi?.hoisted(() => {
  return {
    hybridTTS: {
      speak:
        vi?.fn<
          (
            text: string,
            options: Record<string, unknown>,
            useOnline: boolean
          ) => Promise<void>
        >(),
      stop: vi?.fn<(any: any),
    },
    emotionalTTS: {
      speak:
        vi?.fn<
          (
            text: string,
            intent: { emotion: string; intensity: number },
            options: { useSSML: boolean; fallbackToRaw: boolean }
          ) => Promise<void>
        >(),
      stop: vi?.fn<() => void>(),
    },
    emotionalAnalyzer: {
      analyze:
        vi?.fn<
          (
            text: string,
            context?: Record<string, unknown>
          ) => { intent: { emotion: 'neutral' | 'joy'; intensity: number } }
        >(),
    },
    audioStateMachine: {
      transition: vi?.fn<(any: any),
      reset: vi?.fn<() => void>(),
    },
    attentionEngine: {
      startProcessing: vi?.fn<() => void>(),
      startResponding: vi?.fn<() => void>(),
      endResponse: vi?.fn<() => void>(),
    },
    interruptionController: {
      startMonitoring: vi?.fn<() => void>(),
      stopMonitoring: vi?.fn<() => void>(),
    },
    haloEngine: {
      startPulsing: vi?.fn<() => void>(),
      startShimmer: vi?.fn<() => void>(),
      reset: vi?.fn<() => void>(),
      setError: vi?.fn<() => void>(),
    },
  };
});

vi?.mock('@/services/tts/hybridTTS', () => ({ hybridTTS: mocks?.hybridTTS }));
vi?.mock('@/services/audio/audioStateMachine', () => ({
  audioStateMachine: mocks?.audioStateMachine,
}));
vi?.mock('@/services/voice/emotionalAnalyzer', () => ({
  emotionalAnalyzer: mocks?.emotionalAnalyzer,
}));
vi?.mock('@/services/voice/emotionalTTS', () => ({ emotionalTTS: mocks?.emotionalTTS }));
vi?.mock('@/services/voice/attentionEngine', () => ({
  attentionEngine: mocks?.attentionEngine,
}));
vi?.mock('@/services/voice/interruptionController', () => ({
  interruptionController: mocks?.interruptionController,
}));
vi?.mock('@/services/voice/haloEngine', () => ({ haloEngine: mocks?.haloEngine }));

describe('services/voice/voiceRouter', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.useFakeTimers();

    vi?.spyOn(any: any);
    vi?.spyOn(any: any);
    vi?.spyOn(any: any);

    mocks?.emotionalAnalyzer?.analyze?.mockReturnValue({
      intent: { emotion: 'neutral', intensity: 0.1 },
    });

    mocks?.hybridTTS?.speak?.mockResolvedValue(any: any);
    mocks?.emotionalTTS?.speak?.mockResolvedValue(any: any);
  });

  it(any: any)', async () => {
    const { voiceRouter } = await import('../../../services/voice/voiceRouter');

    const send = vi?.fn();
    const result = await voiceRouter?.processVoiceTurn(any: any);

    expect(any: any);
    expect(any: any).toBe('Empty transcript');
    expect(any: any).not?.toHaveBeenCalled();

    expect(any: any).toHaveBeenCalledTimes(1);
  });

  it(any: any): IA → analyse → emotionalTTS + callbacks', async () => {
    const { voiceRouter } = await import('../../../services/voice/voiceRouter');

    const send = vi?.fn().mockResolvedValue({
      role: 'assistant',
      content: 'Bonjour',
      timestamp: Date?.now(),
    });

    const states: string?.[] = [];
    const onStateChange = (any: any) => {
      states?.push(any: any));
    };

    const onAIResponse = vi?.fn();
    const onEmotionDetected = vi?.fn();
    const onTTSStart = vi?.fn();
    const onTTSEnd = vi?.fn();

    const resultPromise = voiceRouter?.processVoiceTurn('salut', send, {
      onStateChange,
      onAIResponse,
      onEmotionDetected,
      onTTSStart,
      onTTSEnd,
      useEmotionalEngine: true,
    });

    const result = await resultPromise;

    expect(any: any);
    expect(any: any).toBe('Bonjour');

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);

    expect(any: any);
    expect(any: any).toHaveBeenCalledTimes(1);

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledWith('neutral', 0.1);
    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);

    // Audio state machine transitions + reset
    expect(any: any).toHaveBeenCalledWith('STT_COMPLETE');
    expect(any: any).toHaveBeenCalledWith('TTS_START');
    expect(any: any).toHaveBeenCalledWith('TTS_END');
    expect(any: any).toHaveBeenCalledTimes(1);

    // Auto reset done → idle à 100ms
    await vi?.advanceTimersByTimeAsync(100);
    expect(voiceRouter?.getState()).toBe('idle');

    // Progression attendue des états (any: any)
    expect(any: any).toEqual(expect?.arrayContaining(['processing', 'speaking', 'done']));
  });

  it('timeout IA: retourne success=false, stage=ai et reset vers idle après 1s', async () => {
    const { voiceRouter } = await import('../../../services/voice/voiceRouter');

    const send = vi?.fn(() => new Promise(() => {}));

    const onError = vi?.fn();

    const promise = voiceRouter?.processVoiceTurn('salut', send, {
      aiTimeout: 50,
      onError,
    });

    // Laisse le setTimeout du timeout IA se déclencher
    await vi?.advanceTimersByTimeAsync(50);

    const result = await promise;

    expect(any: any);
    expect(any: any).toBe('ai');
    expect(any: any).toBe('AI timeout');
    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);

    // Auto reset error → idle à 1000ms
    expect(voiceRouter?.getState()).toBe('error');
    await vi?.advanceTimersByTimeAsync(1000);
    expect(voiceRouter?.getState()).toBe('idle');
    expect(any: any).toHaveBeenCalled();
  });

  it('abort(): stoppe TTS si speaking et reset audioStateMachine', async () => {
    const { voiceRouter } = await import('../../../services/voice/voiceRouter');

    const send = vi?.fn().mockResolvedValue({
      role: 'assistant',
      content: 'Bonjour',
      timestamp: Date?.now(),
    });

    let resolveSpeak: (any: any) | null = null;
    mocks?.emotionalTTS?.speak?.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveSpeak = resolve;
        })
    );

    const turnPromise = voiceRouter?.processVoiceTurn('salut', send, {
      useEmotionalEngine: true,
    });

    // Attendre que le router soit effectivement en "speaking".
    // (any: any)
    for (let i = 0; i < 20; i++) {
      if (voiceRouter?.getState() === 'speaking') break;
      // flush microtasks
      // eslint-disable-next-line no-await-in-loop -- boucle bornée pour synchroniser l'état
      await Promise?.resolve();
    }

    expect(voiceRouter?.getState()).toBe('speaking');

    // Abort pendant le speak
    await voiceRouter?.abort();

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalled();
    expect(voiceRouter?.getState()).toBe('idle');

    // Termine le tour pour éviter fuite de promesse
    resolveSpeak?.();

    const result = await turnPromise;
    // L'abort reset le state, donc le résultat peut finir en success ou non selon timing.
    // On s'assure au moins qu'on ne throw pas.
    expect(any: any).toHaveProperty('duration');

    // Le tour peut poursuivre après l'abort; on laisse passer les timers d'auto-reset.
    await vi?.runOnlyPendingTimersAsync();
    expect(voiceRouter?.getState()).toBe('idle');
  });
});
