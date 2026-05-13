/**
 * Tests IdentityMemoryEvolutionCenter (module) — Rule 16 (AH-v99 Phase 7.B)
 * DYNAMIC badge via memory_get_state probe
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

import IdentityMemoryEvolutionCenter from '@/modules/IdentityMemoryEvolutionCenter';

describe('IdentityMemoryEvolutionCenter (Phase 7.B — DYNAMIC badge)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the module container', () => {
    mockInvoke.mockResolvedValue({ ok: false, content: null, error: null });
    render(<IdentityMemoryEvolutionCenter />);
    expect(screen.getByTestId('module-identity-memory-evolution-center')).toBeInTheDocument();
  });

  it('shows LIVE badge when memory_get_state returns initialized=true', async () => {
    mockInvoke.mockResolvedValue({
      ok: true,
      content: { initialized: true, total_memories: 42 },
      error: null,
    });
    render(<IdentityMemoryEvolutionCenter />);
    await waitFor(() => {
      expect(screen.getByTestId('surface-truth-badge-live')).toBeInTheDocument();
    });
  });

  it('shows DEGRADED badge when memory_get_state probe fails', async () => {
    mockInvoke.mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'IPC_ERROR', message: 'fail' },
    });
    render(<IdentityMemoryEvolutionCenter />);
    await waitFor(() => {
      expect(screen.getByTestId('surface-truth-badge-degraded')).toBeInTheDocument();
    });
  });
});
