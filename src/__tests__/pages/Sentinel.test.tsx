/**
 * Tests Sentinel — Rule 16 coverage
 * Smoke render + page container landmark
 * AH-v89-RULE16-ENGINE-PAGES-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sentinel } from '@/pages/Sentinel';

// ── Mock useEngineSubscription ───────────────────────────────────
vi.mock('../hooks/useEngineSubscription', () => ({
  useEngineSubscription: () => ({ data: null, loading: false }),
}));
vi.mock('@/hooks/useEngineSubscription', () => ({
  useEngineSubscription: () => ({ data: null, loading: false }),
}));

// ── Mock @tauri-apps/api/core ────────────────────────────────────
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn().mockResolvedValue(null) }));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <Sentinel />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('Sentinel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-sentinel')).toBeInTheDocument();
  });
});
