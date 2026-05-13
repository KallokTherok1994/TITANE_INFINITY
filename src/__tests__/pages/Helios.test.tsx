/**
 * Tests Helios — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Helios } from '@/pages/Helios';

vi.mock('@/hooks/useEngineSubscription', () => ({
  useEngineSubscription: vi.fn().mockReturnValue({ data: null, loading: false }),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
  safeInvoke: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <Helios />
    </MemoryRouter>
  );
}

describe('Helios', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-helios')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant by default (no engine data)', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
