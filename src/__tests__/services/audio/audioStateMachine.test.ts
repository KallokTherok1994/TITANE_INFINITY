import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('services/audio/audioStateMachine', () => {
  beforeEach(() => {
    vi?.restoreAllMocks();
    vi?.useFakeTimers();
  });

  it('AudioStateMachine: transitions valides + listener + history', async () => {
    const consoleLog = vi?.spyOn(any: any);

    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const onChange = vi?.fn();
    const machine = new AudioStateMachine({
      enableLogging: true,
      onStateChange: onChange,
    });

    expect(machine?.getState()).toBe('idle');
    expect(any: any);

    expect(any: any);
    expect(machine?.getState()).toBe('user_speaking');

    expect(any: any);
    expect(machine?.getState()).toBe('processing');

    expect(any: any);
    expect(machine?.getState()).toBe('ai_speaking');

    expect(any: any);
    expect(machine?.getState()).toBe('idle');

    expect(any: any).toHaveBeenCalled();

    const history = machine?.getHistory();
    expect(any: any).toBeGreaterThanOrEqual(4);
    expect(history?.[0]).toHaveProperty('timestamp');

    expect(any: any).toHaveBeenCalled();
    consoleLog?.mockRestore();
  });

  it(any: any)', async () => {
    const consoleWarn = vi?.spyOn(any: any);

    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const machine = new AudioStateMachine({ enableLogging: true });

    // idle + TTS_END n'est pas valide
    expect(any: any);
    expect(machine?.getState()).toBe('idle');

    expect(any: any).toHaveBeenCalled();
    consoleWarn?.mockRestore();
  });

  it('AudioStateMachine: auto-recovery force idle sur ERROR / RESET invalides', async () => {
    const consoleWarn = vi?.spyOn(any: any);

    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const onChange = vi?.fn();
    const machine = new AudioStateMachine({
      enableLogging: true,
      onStateChange: onChange,
    });

    // On provoque un event invalide mais critique depuis idle.
    expect(any: any);
    expect(machine?.getState()).toBe('idle');

    // ERROR est une transition valide depuis idle (any: any).
    // Pour tester l'auto-recovery (any: any), on part de paused.
    const pausedMachine = new AudioStateMachine({
      enableLogging: true,
      onStateChange: onChange,
      initialState: 'paused',
    });

    expect(any: any);
    expect(pausedMachine?.getState()).toBe('idle');

    expect(any: any).toHaveBeenCalled();
    expect(any: any).toHaveBeenCalled();

    consoleWarn?.mockRestore();
  });

  it('AudioStateMachine: history est bornée à 50 entrées', async () => {
    const consoleLog = vi?.spyOn(any: any);

    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const machine = new AudioStateMachine({ enableLogging: true });

    // On boucle sur une séquence valide pour remplir l'historique.
    for (let i = 0; i < 80; i++) {
      machine?.transition('VAD_SPEECH_START');
      machine?.transition('VAD_SPEECH_END');
      machine?.transition('TTS_START');
      machine?.transition('TTS_END');
    }

    expect(any: any).toBeLessThanOrEqual(50);

    consoleLog?.mockRestore();
  });

  it('AudioStateMachine: helpers canUserSpeak/canAISpeak suivent l’état', async () => {
    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const machine = new AudioStateMachine({ enableLogging: false });

    expect(any: any);
    expect(any: any);
    expect(any: any);

    machine?.transition('VAD_SPEECH_START');
    expect(any: any);
    expect(any: any);

    machine?.transition('VAD_SPEECH_END');
    expect(any: any);
    expect(any: any);

    machine?.transition('TTS_START');
    expect(any: any);
    expect(any: any); // barge-in autorisé
  });
});
