import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TAURI_COMMANDS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('isValidTauriCommand() devrait valider une commande connue', async () => {
    const { TAURI_COMMANDS, isValidTauriCommand } =
      await import('../../../core/commands/TAURI_COMMANDS');

    expect(isValidTauriCommand(TAURI_COMMANDS.HELIOS_GET_STATE)).toBe(true);
    expect(isValidTauriCommand('not-a-command')).toBe(false);
  });

  it('invokeTauri() devrait appeler @tauri-apps/api/core.invoke', async () => {
    const invoke = vi.fn().mockResolvedValueOnce({ ok: true });

    vi.doMock('@tauri-apps/api/core', () => ({ invoke }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<{ ok: boolean }>(TAURI_COMMANDS.HELIOS_GET_STATE, {
      foo: 'bar',
    });

    expect(result).toEqual({ ok: true });
    expect(invoke).toHaveBeenCalledWith(TAURI_COMMANDS.HELIOS_GET_STATE, { foo: 'bar' });
  });

  it('invokeTauri() devrait throw si commande invalide', async () => {
    const { invokeTauri } = await import('../../../core/commands/TAURI_COMMANDS');

    // Cast volontaire pour simuler une entrée non valide
    await expect(invokeTauri('bad-command' as never)).rejects.toThrow(
      'Invalid Tauri command'
    );
  });

  it('invokeTauri() devrait retourner un fallback chat si invoke échoue', async () => {
    const invoke = vi.fn().mockRejectedValueOnce(new Error('backend down'));

    vi.doMock('@tauri-apps/api/core', () => ({ invoke }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<Record<string, unknown>>(
      TAURI_COMMANDS.CHAT_SEND_MESSAGE
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        fallback: true,
        provider: 'titane-local',
      })
    );
  });

  it('invokeTauri() devrait retourner un fallback status/health si invoke indisponible', async () => {
    vi.doMock('@tauri-apps/api/core', () => ({ invoke: undefined }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<Record<string, unknown>>(
      TAURI_COMMANDS.HELIOS_GET_HEALTH
    );

    expect(result).toEqual(
      expect.objectContaining({
        status: 'offline',
        available: false,
        fallback: true,
      })
    );
  });
});
