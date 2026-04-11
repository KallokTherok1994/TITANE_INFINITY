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

  it('invokeTauri() devrait appeler secureInvoke et retourner le contrat canonique', async () => {
    const secureInvokeMock = vi.fn().mockResolvedValueOnce({ ok: true });

    vi.doMock('@/lib/security', () => ({ secureInvoke: secureInvokeMock }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<{ ok: boolean }>(TAURI_COMMANDS.HELIOS_GET_STATE, {
      foo: 'bar',
    });

    expect(result).toEqual({ ok: true, content: { ok: true }, error: null });
    expect(secureInvokeMock).toHaveBeenCalledWith(TAURI_COMMANDS.HELIOS_GET_STATE, {
      foo: 'bar',
    });
  });

  it('invokeTauri() devrait retourner { ok: false } si commande invalide', async () => {
    const { invokeTauri } = await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri('bad-command' as never);

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('INVALID_COMMAND');
    expect(result.error?.message).toContain('Invalid Tauri command');
  });

  it('invokeTauri() devrait retourner { ok: false, error } si secureInvoke échoue', async () => {
    const secureInvokeMock = vi.fn().mockRejectedValueOnce(new Error('backend down'));

    vi.doMock('@/lib/security', () => ({ secureInvoke: secureInvokeMock }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<Record<string, unknown>>(TAURI_COMMANDS.CHAT_GENERATE);

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('IPC_ERROR');
    expect(result.error?.message).toContain('backend down');
  });

  it('invokeTauri() devrait retourner { ok: false, error } si secureInvoke indisponible', async () => {
    const secureInvokeMock = vi.fn().mockRejectedValueOnce(new Error('invoke not available'));

    vi.doMock('@/lib/security', () => ({ secureInvoke: secureInvokeMock }));

    const { TAURI_COMMANDS, invokeTauri } =
      await import('../../../core/commands/TAURI_COMMANDS');

    const result = await invokeTauri<Record<string, unknown>>(TAURI_COMMANDS.HELIOS_GET_HEALTH);

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error).toBeDefined();
  });
});
