/**
 * Tests AdminPage — Rule 16 coverage (AH-v99 Phase 7.C)
 * Render + DYNAMIC SurfaceTruthBadge via quick_health_check
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockInvoke = vi.fn();

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: (cmd: string) => mockInvoke(cmd),
  safeInvoke: (cmd: string) => mockInvoke(cmd),
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (props: any) => <div {...props}>{props.children}</div> }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/features/admin/types', async () => {
  const actual = await vi.importActual<any>('@/features/admin/types');
  return actual;
});

// Mock lazy children to avoid loading entire admin tree
vi.mock('@/features/system-center/SystemCenterPage', () => ({
  SystemCenterPage: () => <div data-testid="admin-system-center" />,
}));
vi.mock('@/pages/ConfigurationHub', () => ({
  ConfigurationHub: () => <div data-testid="admin-config-hub" />,
}));
vi.mock('@/features/audio-center', () => ({
  AudioCenterPage: () => <div data-testid="admin-audio-center" />,
}));
vi.mock('@/features/design-center', () => ({
  DesignCenterPage: () => <div data-testid="admin-design-center" />,
}));
vi.mock('@/features/governance-center/GovernanceCenterPage', () => ({
  GovernanceCenterPage: () => <div data-testid="admin-governance-center" />,
}));
vi.mock('@/ui/pages/SelfHealingDashboard', () => ({
  SelfHealingDashboard: () => <div data-testid="admin-self-healing" />,
}));
vi.mock('@/features/production-health/ProductionHealthPanel', () => ({
  ProductionHealthPanel: () => <div data-testid="admin-production-health" />,
}));
vi.mock('@/components/RemoteKeyDashboard', () => ({
  default: () => <div data-testid="admin-remote-keys" />,
}));

import AdminPage from '@/features/admin/AdminPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>
  );
}

describe('AdminPage (Phase 7.C — DYNAMIC badge)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    mockInvoke.mockResolvedValue({ ok: false, content: null, error: null });
    renderPage();
    expect(screen.getByTestId('page-admin')).toBeInTheDocument();
  });

  it('shows PARTIAL badge on initial render (before probe completes)', () => {
    mockInvoke.mockResolvedValue({ ok: false, content: null, error: null });
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });

  it('flips to LIVE badge when quick_health_check returns Healthy', async () => {
    mockInvoke.mockResolvedValue({ ok: true, content: 'Healthy', error: null });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('surface-truth-badge-live')).toBeInTheDocument();
    });
  });

  it('flips to DEGRADED badge when quick_health_check returns Critical', async () => {
    mockInvoke.mockResolvedValue({ ok: true, content: 'Critical', error: null });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('surface-truth-badge-degraded')).toBeInTheDocument();
    });
  });
});
