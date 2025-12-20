import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    hybridTTS: {
      speak: vi.fn<
        (text: string, options: Record<string, unknown>, useOnline: boolean) => Promise<void>
      >(),
      stop: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    },
    emotionalTTS: {
      speak: vi.fn<
        (
          text: string,
          intent: { emotion: string; intensity: number },
          options: { useSSML: boolean; fallbackToRaw: boolean }
        ) => Promise<void>
      >(),
      stop: vi.fn<() => void>(),
    },
    emotionalAnalyzer: {
      analyze: vi.fn<
        (
          text: string,
          context?: Record<string, unknown>
        ) => { intent: { emotion: 'neutral' | 'joy'; intensity: number } }
      >(),
    },
    audioStateMachine: {
      transition: vi.fn<(evt: string) => boolean>().mockReturnValue(true),
      reset: vi.fn<() => void>(),
    },
    attentionEngine: {
      startProcessing: vi.fn<() => void>(),
      startResponding: vi.fn<() => void>(),
      endResponse: vi.fn<() => void>(),
    },
    interruptionController: {
      startMonitoring: vi.fn<() => void>(),
      stopMonitoring: vi.fn<() => void>(),
    },
    haloEngine: {
      startPulsing: vi.fn<() => void>(),
      startShimmer: vi.fn<() => void>(),
      reset: vi.fn<() => void>(),
      setError: vi.fn<() => void>(),
    },
  };
});

vi.mock('@/services/tts/hybridTTS', () => ({ hybridTTS: mocks.hybridTTS }));
vi.mock('@/services/audio/audioStateMachine', () => ({ audioStateMachine: mocks.audioStateMachine }));
vi.mock('@/services/voice/emotionalAnalyzer', () => ({ emotionalAnalyzer: mocks.emotionalAnalyzer }));
vi.mock('@/services/voice/emotionalTTS', () => ({ emotionalTTS: mocks.emotionalTTS }));
vi.mock('@/services/voice/attentionEngine', () => ({ attentionEngine: mocks.attentionEngine }));
vi.mock('@/services/voice/interruptionController', () => ({
  interruptionController: mocks.interruptionController,
}));
vi.mock('@/services/voice/haloEngine', () => ({ haloEngine: mocks.haloEngine }));

describe('services/voice/voiceRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mocks.emotionalAnalyzer.analyze.mockReturnValue({
      intent: { emotion: 'neutral', intensity: 0.1 },
    });

    mocks.hybridTTS.speak.mockResolvedValue(undefined);
    mocks.emotionalTTS.speak.mockResolvedValue(undefined);
  });

  it('retourne une erreur si transcript vide (et startProcessing est appelé)', async () => {
    const { voiceRouter } = await import('../../../services/voice/voiceRouter');

    const send = vi.fn();
    const result = await voiceRouter.processVoiceTurn('   ', send);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Empty transcript');
    expect(send).not.toHaveBeenCalled();

    expect(mocks.attentionEngine.startProcessing).toHaveBeenCalledTimes(1);
  });

  it('pipeline complet (émotionnel): IA → analyse → emotionalTTS + callbacks', async () => {
    const { voiceRouter } = await import('../../../services/voice/voiceRouter');

    const send = vi.fn().mockResolvedValue({
      role: 'assistant',
      content: 'Bonjour',
      timestamp: Date.now(),
    });

    const states: string[] = [];
    const onStateChange = (s: any) => {
      states.push(String(s));
    };

    const onAIResponse = vi.fn();
    const onEmotionDetected = vi.fn();
    const onTTSStart = vi.fn();
    const onTTSEnd = vi.fn();

    const resultPromise = voiceRouter.processVoiceTurn('salut', send, {
      onStateChange,
      onAIResponse,
      onEmotionDetected,
      onTTSStart,
      onTTSEnd,
      useEmotionalEngine: true,
    });

    const result = await resultPromise;

    expect(result.success).toBe(true);
    expect(result.aiResponse?.content).toBe('Bonjour');

    expect(mocks.attentionEngine.startProcessing).toHaveBeenCalledTimes(1);
    expect(mocks.attentionEngine.startResponding).toHaveBeenCalledTimes(1);
    expect(mocks.attentionEngine.endResponse).toHaveBeenCalledTimes(1);

    expect(mocks.haloEngine.startPulsing).toHaveBeenCalledTimes(1);
    expect(mocks.haloEngine.startShimmer).toHaveBeenCalledTimes(1);
    expect(mocks.haloEngine.reset).toHaveBeenCalledTimes(1);

    expect(mocks.emotionalAnalyzer.analyze).toHaveBeenCalledWith('Bonjour', undefined);
    expect(mocks.emotionalTTS.speak).toHaveBeenCalledTimes(1);

    expect(mocks.interruptionController.startMonitoring).toHaveBeenCalledTimes(1);
    expect(mocks.interruptionController.stopMonitoring).toHaveBeenCalledTimes(1);

    expect(onAIResponse).toHaveBeenCalledTimes(1);
    expect(onEmotionDetected).toHaveBeenCalledWith('neutral', 0.1);
    expect(onTTSStart).toHaveBeenCalledTimes(1);
    expect(onTTSEnd).toHaveBeenCalledTimes(1);

    // Audio state machine transitions + reset
    expect(mocks.audioStateMachine.transition).toHaveBeenCalledWith('STT_COMPLETE');
    expect(mocks.audioStateMachine.transition).toHaveBeenCalledWith('TTS_START');
    expect(mocks.audioStateMachine.transition).toHaveBeenCalledWith('TTS_END');
    expect(mocks.audioStateMachine.reset).toHaveBeenCalledTimes(1);

    // Auto reset done → idle à 100ms
    await vi.advanceTimersByTimeAsync(100);
    expect(voiceRouter.getState()).toBe('idle');

    // Progression attendue des états (au minimum)
    expect(states).toEqual(expect.arrayContaining(['processing', 'speaking', 'done']));
  });

  it('timeout IA: retourne success=false, stage=ai et reset vers idle après 1s', async () => {
    const { voiceRouter } = await import('../../../services/voice/voiceRouter');

    const send = vi.fn(() => new Promise(() => {}));

    const onError = vi.fn();

    const promise = voiceRouter.processVoiceTurn('salut', send, { aiTimeout: 50, onError });

    // Laisse le setTimeout du timeout IA se déclencher
    await vi.advanceTimersByTimeAsync(50);

    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.error?.stage).toBe('ai');
    expect(result.error?.message).toBe('AI timeout');
    expect(mocks.haloEngine.setError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);

    // Auto reset error → idle à 1000ms
    expect(voiceRouter.getState()).toBe('error');
    await vi.advanceTimersByTimeAsync(1000);
    expect(voiceRouter.getState()).toBe('idle');
    expect(mocks.audioStateMachine.reset).toHaveBeenCalled();
  });

  it('abort(): stoppe TTS si speaking et reset audioStateMachine', async () => {
    const { voiceRouter } = await import('../../../services/voice/voiceRouter');

    const send = vi.fn().mockResolvedValue({
      role: 'assistant',
      content: 'Bonjour',
      timestamp: Date.now(),
    });

    let resolveSpeak: (() => void) | null = null;
    mocks.emotionalTTS.speak.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveSpeak = resolve;
        })
    );

    const turnPromise = voiceRouter.processVoiceTurn('salut', send, {
      useEmotionalEngine: true,
    });

    // Attendre que le router soit effectivement en "speaking".
    // (processVoiceTurn fait plusieurs await internes avant de setter l'état)
    for (let i = 0; i < 20; i++) {
      if (voiceRouter.getState() === 'speaking') break;
      // flush microtasks
      // eslint-disable-next-line no-await-in-loop -- boucle bornée pour synchroniser l'état
      await Promise.resolve();
    }

    expect(voiceRouter.getState()).toBe('speaking');

    // Abort pendant le speak
    await voiceRouter.abort();

    expect(mocks.hybridTTS.stop).toHaveBeenCalledTimes(1);
    expect(mocks.emotionalTTS.stop).toHaveBeenCalledTimes(1);
    expect(mocks.audioStateMachine.reset).toHaveBeenCalled();
    expect(voiceRouter.getState()).toBe('idle');

    // Termine le tour pour éviter fuite de promesse
    resolveSpeak?.();

    const result = await turnPromise;
    // L'abort reset le state, donc le résultat peut finir en success ou non selon timing.
    // On s'assure au moins qu'on ne throw pas.
    expect(result).toHaveProperty('duration');

    // Le tour peut poursuivre après l'abort; on laisse passer les timers d'auto-reset.
    await vi.runOnlyPendingTimersAsync();
    expect(voiceRouter.getState()).toBe('idle');
  });
});
