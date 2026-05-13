/**
 * Tests Settings — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge (PARTIAL — local state only)
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Settings } from '@/pages/Settings';

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

vi.mock('@/components/AudioSettings', () => ({
  AudioSettings: () => <div data-testid="audio-settings-mock" />,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  );
}

describe('Settings', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-settings')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant (local state)', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
