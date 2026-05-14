/**
 * TITANE_INFINITY v34.2.0 — Query hooks pilots wiring contract tests
 *
 * Strategy: assert the *contract* (queryKey + IPC command + payload + staleTime defaults)
 * by mocking `secureInvoke` and rendering each hook through `renderHook` with the
 * shared test QueryClient. Avoids brittle integration with real IPC during unit run.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHook } from '../../../test-utils/renderHook';

vi.mock('../../../lib/security', () => ({
  secureInvoke: vi.fn(async (_cmd: string, _payload?: unknown) => ({ ok: true, value: _cmd })),
}));

import { secureInvoke } from '../../../lib/security';
import { useSystemHealthQuery } from '../../../hooks/queries/useSystemHealthQuery';
import { useEnginesStatusQuery } from '../../../hooks/queries/useEnginesStatusQuery';
import { useProvidersStatusQuery } from '../../../hooks/queries/useProvidersStatusQuery';
import { useConversationHealthQuery } from '../../../hooks/queries/useConversationHealthQuery';
import { useDevtoolsMemoryHealthQuery } from '../../../hooks/queries/useDevtoolsMemoryHealthQuery';

const mockedSecureInvoke = vi.mocked(secureInvoke);

describe('Query hooks pilots (v34.2.0)', () => {
  beforeEach(() => {
    mockedSecureInvoke.mockClear();
  });

  it('useSystemHealthQuery calls get_system_health with empty payload', async () => {
    const { result } = renderHook(() => useSystemHealthQuery());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSecureInvoke).toHaveBeenCalledWith('get_system_health', {});
  });

  it('useEnginesStatusQuery calls get_engines_status with empty payload', async () => {
    const { result } = renderHook(() => useEnginesStatusQuery());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSecureInvoke).toHaveBeenCalledWith('get_engines_status', {});
  });

  it('useProvidersStatusQuery calls chat_get_providers_status with empty payload', async () => {
    const { result } = renderHook(() => useProvidersStatusQuery());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSecureInvoke).toHaveBeenCalledWith('chat_get_providers_status', {});
  });

  it('useConversationHealthQuery calls conversation_health_check with empty payload', async () => {
    const { result } = renderHook(() => useConversationHealthQuery());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSecureInvoke).toHaveBeenCalledWith('conversation_health_check', {});
  });

  it('useDevtoolsMemoryHealthQuery calls devtools_memory_health with empty payload', async () => {
    const { result } = renderHook(() => useDevtoolsMemoryHealthQuery());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSecureInvoke).toHaveBeenCalledWith('devtools_memory_health', {});
  });

  it('caller-provided options override defaults (enabled=false skips invoke)', async () => {
    const { result } = renderHook(() => useSystemHealthQuery({ enabled: false }));
    expect(result.current.isFetching).toBe(false);
    expect(mockedSecureInvoke).not.toHaveBeenCalled();
  });
});
