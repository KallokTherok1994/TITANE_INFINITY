/**
 * Tests TemporalFlowCenter (module) — Rule 16 (AH-v99 Phase 7.B)
 * DYNAMIC badge via temporal_get_today_state probe
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const mockInvoke = vi.fn();

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: (cmd: string) => mockInvoke(cmd),
  safeInvoke: (cmd: string) => mockInvoke(cmd),
}));

vi.mock('@/design-system', () => ({
  TBadge: ({ children }: any) => <span>{children}</span>,
  TMetric: ({ children }: any) => <span>{children}</span>,
  TSectionHeader: ({ title }: any) => <h2>{title}</h2>,
}));

import TemporalFlowCenter from '@/modules/TemporalFlowCenter';

describe('TemporalFlowCenter (Phase 7.B — DYNAMIC badge)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the module container', () => {
    mockInvoke.mockResolvedValue({ ok: false, content: null, error: null });
    render(<TemporalFlowCenter />);
    expect(screen.getByTestId('module-temporal-flow-center')).toBeInTheDocument();
  });

  it('shows LIVE badge when temporal_get_today_state returns valid state', async () => {
    mockInvoke.mockResolvedValue({
      ok: true,
      content: { current_energy: 72, today_blocks: [], current_block_id: null },
      error: null,
    });
    render(<TemporalFlowCenter />);
    await waitFor(() => {
      expect(screen.getByTestId('surface-truth-badge-live')).toBeInTheDocument();
    });
  });

  it('shows DEGRADED badge when probe fails', async () => {
    mockInvoke.mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'IPC_ERROR', message: 'fail' },
    });
    render(<TemporalFlowCenter />);
    await waitFor(() => {
      expect(screen.getByTestId('surface-truth-badge-degraded')).toBeInTheDocument();
    });
  });
});
