/**
 * Tests AgendaPage — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AgendaPage } from '@/pages/AgendaPage';

vi.mock('@/hooks/useTimeAgenda', () => ({
  useTimeAgenda: vi.fn().mockReturnValue({
    loading: true,
    initialized: false,
    stats: null,
    timeState: null,
    events: [],
    viewEvents: [],
    addEvent: vi.fn(),
    removeEvent: vi.fn(),
    updateEvent: vi.fn(),
  }),
  default: vi.fn().mockReturnValue({
    loading: true,
    initialized: false,
    stats: null,
    timeState: null,
    events: [],
    viewEvents: [],
    addEvent: vi.fn(),
    removeEvent: vi.fn(),
    updateEvent: vi.fn(),
  }),
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
      <AgendaPage />
    </MemoryRouter>
  );
}

describe('AgendaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-agenda')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant when loading', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
