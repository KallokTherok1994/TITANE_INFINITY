/**
 * Tests Nexus — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nexus } from '@/pages/Nexus';

vi.mock('@/hooks/useEngineSubscription', () => ({
  useEngineSubscription: vi.fn().mockReturnValue({ data: null, loading: false }),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi
    .fn()
    .mockResolvedValue({ ok: false, content: null, error: null }),
  safeInvoke: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <Nexus />
    </MemoryRouter>
  );
}

describe('Nexus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-nexus')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant by default (no engine data)', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
