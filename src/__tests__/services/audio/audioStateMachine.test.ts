import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('services/audio/audioStateMachine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  it('AudioStateMachine: transitions valides + listener + history', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const onChange = vi.fn();
    const machine = new AudioStateMachine({
      enableLogging: true,
      onStateChange: onChange,
    });

    expect(machine.getState()).toBe('idle');
    expect(machine.canTransition('VAD_SPEECH_START')).toBe(true);

    expect(machine.transition('VAD_SPEECH_START')).toBe(true);
    expect(machine.getState()).toBe('user_speaking');

    expect(machine.transition('VAD_SPEECH_END')).toBe(true);
    expect(machine.getState()).toBe('processing');

    expect(machine.transition('TTS_START')).toBe(true);
    expect(machine.getState()).toBe('ai_speaking');

    expect(machine.transition('TTS_END')).toBe(true);
    expect(machine.getState()).toBe('idle');

    expect(onChange).toHaveBeenCalled();

    const history = machine.getHistory();
    expect(history.length).toBeGreaterThanOrEqual(4);
    expect(history[0]).toHaveProperty('timestamp');

    expect(consoleLog).toHaveBeenCalled();
    consoleLog.mockRestore();
  });

  it('AudioStateMachine: transition invalide retourne false (sans auto-recovery)', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const machine = new AudioStateMachine({ enableLogging: true });

    // idle + TTS_END n'est pas valide
    expect(machine.transition('TTS_END')).toBe(false);
    expect(machine.getState()).toBe('idle');

    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  it('AudioStateMachine: auto-recovery force idle sur ERROR / RESET invalides', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const onChange = vi.fn();
    const machine = new AudioStateMachine({
      enableLogging: true,
      onStateChange: onChange,
    });

    // On provoque un event invalide mais critique depuis idle.
    expect(machine.transition('RESET')).toBe(true);
    expect(machine.getState()).toBe('idle');

    // ERROR est une transition valide depuis idle (idle -> error).
    // Pour tester l'auto-recovery (uniquement sur transition invalide), on part de paused.
    const pausedMachine = new AudioStateMachine({
      enableLogging: true,
      onStateChange: onChange,
      initialState: 'paused',
    });

    expect(pausedMachine.transition('ERROR')).toBe(true);
    expect(pausedMachine.getState()).toBe('idle');

    expect(onChange).toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalled();

    consoleWarn.mockRestore();
  });

  it('AudioStateMachine: history est bornée à 50 entrées', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const machine = new AudioStateMachine({ enableLogging: true });

    // On boucle sur une séquence valide pour remplir l'historique.
    for (let i = 0; i < 80; i++) {
      machine.transition('VAD_SPEECH_START');
      machine.transition('VAD_SPEECH_END');
      machine.transition('TTS_START');
      machine.transition('TTS_END');
    }

    expect(machine.getHistory().length).toBeLessThanOrEqual(50);

    consoleLog.mockRestore();
  });

  it('AudioStateMachine: helpers canUserSpeak/canAISpeak suivent l’état', async () => {
    const { AudioStateMachine } =
      await import('../../../services/audio/audioStateMachine');

    const machine = new AudioStateMachine({ enableLogging: false });

    expect(machine.isIdle()).toBe(true);
    expect(machine.canUserSpeak()).toBe(true);
    expect(machine.canAISpeak()).toBe(true);

    machine.transition('VAD_SPEECH_START');
    expect(machine.isUserSpeaking()).toBe(true);
    expect(machine.canUserSpeak()).toBe(false);

    machine.transition('VAD_SPEECH_END');
    expect(machine.isProcessing()).toBe(true);
    expect(machine.canAISpeak()).toBe(true);

    machine.transition('TTS_START');
    expect(machine.isAISpeaking()).toBe(true);
    expect(machine.canUserSpeak()).toBe(true); // barge-in autorisé
  });
});
