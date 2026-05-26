/**
 * TITANE_INFINITY v34.2.0 — QueryPilotsLiveStatus wiring tests
 *
 * Asserts: 5 tiles render, each has stable data-testid, secureInvoke is called
 * once per pilot with the canonical command name and empty payload, and success
 * states converge to `data-state="success"` after the QueryClient resolves.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { TestProviders } from '../../../test-utils/TestProviders';
import React from 'react';

vi.mock('../../../lib/security', () => ({
  secureInvoke: vi.fn(async (cmd: string) => ({ ok: true, cmd })),
}));

import { secureInvoke } from '../../../lib/security';
import { QueryPilotsLiveStatus } from '../../../components/runtime/QueryPilotsLiveStatus';

const mocked = vi.mocked(secureInvoke);

describe('QueryPilotsLiveStatus (v34.2.0)', () => {
  beforeEach(() => {
    mocked.mockClear();
  });

  it('renders 5 pilot tiles with stable data-testid', () => {
    const { getByTestId } = render(
      <TestProviders>
        <QueryPilotsLiveStatus />
      </TestProviders>
    );
    expect(getByTestId('query-pilots-live-status')).toBeTruthy();
    [
      'query-pilot-system-health',
      'query-pilot-engines-status',
      'query-pilot-providers-status',
      'query-pilot-conversation-health',
      'query-pilot-devtools-memory-health',
    ].forEach(id => {
      expect(getByTestId(id)).toBeTruthy();
    });
  });

  it('calls each canonical IPC command exactly once with empty payload', async () => {
    render(
      <TestProviders>
        <QueryPilotsLiveStatus />
      </TestProviders>
    );
    await waitFor(() => {
      const calls = mocked.mock.calls.map(c => c[0]);
      [
        'get_system_health',
        'get_engines_status',
        'chat_get_providers_status',
        'conversation_health_check',
        'devtools_memory_health',
      ].forEach(cmd => expect(calls).toContain(cmd));
    });
    mocked.mock.calls.forEach(c => expect(c[1]).toEqual({}));
  });

  it('converges all tiles to data-state="success" after queries resolve', async () => {
    const { getByTestId } = render(
      <TestProviders>
        <QueryPilotsLiveStatus />
      </TestProviders>
    );
    await waitFor(() => {
      expect(getByTestId('query-pilot-system-health').getAttribute('data-state')).toBe(
        'success'
      );
      expect(getByTestId('query-pilot-engines-status').getAttribute('data-state')).toBe(
        'success'
      );
      expect(getByTestId('query-pilot-providers-status').getAttribute('data-state')).toBe(
        'success'
      );
      expect(
        getByTestId('query-pilot-conversation-health').getAttribute('data-state')
      ).toBe('success');
      expect(
        getByTestId('query-pilot-devtools-memory-health').getAttribute('data-state')
      ).toBe('success');
    });
  });
});
