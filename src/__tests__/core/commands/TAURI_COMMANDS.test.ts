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

  it('invokeTauri() devrait appeler @tauri-apps/api/core.invoke et retourner payload canonique', async () => {
    const invoke = vi.fn().mockResolvedValueOnce({ ok: true });

    vi.doMock('@tauri-apps/api/core', () => ({ invoke }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<{ ok: boolean }>(TAURI_COMMANDS.HELIOS_GET_STATE, {
      foo: 'bar',
    });

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        content: { ok: true },
        error: null,
      })
    );
    expect(invoke).toHaveBeenCalledWith(TAURI_COMMANDS.HELIOS_GET_STATE, { foo: 'bar' });
  });

  it('invokeTauri() devrait retourner un payload canonique en cas de commande invalide', async () => {
    const { invokeTauri } = await import('../../../core/commands/TAURI_COMMANDS');

    // Cast volontaire pour simuler une entrée non valide
    const result = await invokeTauri('bad-command' as never);

    expect(result).toEqual({
      ok: false,
      content: null,
      error: {
        code: 'INVALID_COMMAND',
        message: 'Invalid Tauri command: bad-command',
      },
    });
  });

  it('invokeTauri() devrait retourner un payload canonique si invoke échoue', async () => {
    const invoke = vi.fn().mockRejectedValueOnce(new Error('backend down'));

    vi.doMock('@tauri-apps/api/core', () => ({ invoke }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<Record<string, unknown>>(
      TAURI_COMMANDS.CHAT_GENERATE
    );

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        content: null,
      })
    );
    expect(result.error?.message).toContain('backend down');
  });

  it('invokeTauri() devrait retourner un payload canonique si invoke est indisponible', async () => {
    vi.doMock('@tauri-apps/api/core', () => ({ invoke: undefined }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<Record<string, unknown>>(
      TAURI_COMMANDS.HELIOS_GET_HEALTH
    );

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        content: null,
      })
    );
    expect(result.error?.message).toContain('is not a function');
  });
});
