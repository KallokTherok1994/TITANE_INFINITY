import { beforeEach, describe, expect, it, vi } from 'vitest';

const safeInvokeMock = vi.hoisted(() => vi.fn());
const safeInvokeCanonicalMock = vi.hoisted(() => vi.fn());

vi.mock('@/utils/invoke', () => ({
  safeInvoke: (...args: unknown[]) => safeInvokeMock(...args),
  safeInvokeCanonical: (...args: unknown[]) => safeInvokeCanonicalMock(...args),
}));

describe('governanceService transport guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('reads provider statuses through safeInvokeCanonical when no transport exists', async () => {
    safeInvokeCanonicalMock.mockResolvedValue({
      ok: false,
      content: null,
      error: {
        code: 'NO_TRANSPORT',
        message: 'No transport available',
      },
    });

    const { governanceService } = await import('../governanceService');

    const gemini = await governanceService.getGeminiStatus();
    const openai = await governanceService.getOpenAIStatus();

    expect(gemini).toEqual({ ok: false, data: null, error: 'No transport available' });
    expect(openai).toEqual({ ok: false, data: null, error: 'No transport available' });
    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('get_gemini_key_status');
    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('get_openai_key_status');
    expect(safeInvokeMock).not.toHaveBeenCalled();
  });

  it('routes governance bootstrap reads through safeInvokeCanonical when no transport exists', async () => {
    safeInvokeCanonicalMock.mockResolvedValue({
      ok: false,
      content: null,
      error: {
        code: 'NO_TRANSPORT',
        message: 'No transport available',
      },
    });

    const { governanceService } = await import('../governanceService');

    const [ollama, policies, matrix, audit, securityLog] = await Promise.all([
      governanceService.getOllamaStatus(),
      governanceService.getPolicies(),
      governanceService.getPermissionMatrix(),
      governanceService.getPermissionAudit(),
      governanceService.getSecurityLog(),
    ]);

    expect(ollama).toEqual({ ok: false, data: null, error: 'No transport available' });
    expect(policies).toEqual({ ok: false, data: null, error: 'No transport available' });
    expect(matrix).toEqual({ ok: false, data: null, error: 'No transport available' });
    expect(audit).toEqual({ ok: false, data: null, error: 'No transport available' });
    expect(securityLog).toEqual({
      ok: false,
      data: null,
      error: 'No transport available',
    });
    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('ai_check_ollama_status');
    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('get_ia_policies');
    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('get_permission_matrix');
    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('get_permission_audit');
    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('get_security_log', {
      filters: undefined,
    });
    expect(safeInvokeMock).not.toHaveBeenCalled();
  });

  it('normalizes canonical secrets-status envelopes without calling safeInvoke', async () => {
    safeInvokeCanonicalMock.mockResolvedValue({
      ok: true,
      content: [
        {
          key: 'gemini_api_key',
          configured: false,
          maskedValue: null,
          lastUpdated: null,
          category: 'api_key',
        },
      ],
      error: null,
    });

    const { governanceService } = await import('../governanceService');

    const response = await governanceService.getSecretsStatus();

    expect(response).toEqual({
      ok: true,
      data: [
        {
          key: 'gemini_api_key',
          configured: false,
          maskedValue: null,
          lastUpdated: null,
          category: 'api_key',
        },
      ],
      error: null,
    });
    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('get_secrets_status');
    expect(safeInvokeMock).not.toHaveBeenCalled();
  });
});
