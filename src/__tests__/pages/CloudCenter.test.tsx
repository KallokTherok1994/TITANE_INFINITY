/**
 * Tests CloudCenter — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CloudCenterPage from '@/pages/CloudCenter';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    cloudGetStatus: vi.fn().mockResolvedValue(null),
    cloudInitVault: vi.fn().mockResolvedValue(null),
    cloudSync: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi
    .fn()
    .mockResolvedValue({ ok: false, content: null, error: null }),
  safeInvoke: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn().mockReturnValue({ showToast: vi.fn() }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CloudCenterPage />
    </MemoryRouter>
  );
}

describe('CloudCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-cloud-center')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant when cloudStatus is null', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
