/**
 * Tests SecureSettings — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SecureSettings } from '@/pages/SecureSettings';

vi.mock('@/utils/tauriProtector', () => ({
  isTauriRuntimeAvailable: vi.fn().mockReturnValue(false),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi
    .fn()
    .mockResolvedValue({ ok: false, content: null, error: null }),
  safeInvoke: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    secureSettingsGetGeminiStatus: vi.fn().mockResolvedValue(null),
    secureSettingsGetOpenaiStatus: vi.fn().mockResolvedValue(null),
    secureSettingsGetAnthropicStatus: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn().mockReturnValue({ showToast: vi.fn() }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <SecureSettings />
    </MemoryRouter>
  );
}

describe('SecureSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-secure-settings')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant when Tauri unavailable', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
