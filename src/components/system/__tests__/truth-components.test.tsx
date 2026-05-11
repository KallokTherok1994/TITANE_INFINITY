/**
 * System components tests — SurfaceTruthBadge, PageHealthBanner, RuntimeSourceIndicator
 * Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46
 * Rule 16: mandatory tests for every new UI component.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SurfaceTruthBadge } from '../SurfaceTruthBadge';
import { PageHealthBanner } from '../PageHealthBanner';
import { RuntimeSourceIndicator } from '../RuntimeSourceIndicator';

// ─────────────────────────────────────────────────────────────────────────────
// SurfaceTruthBadge
// ─────────────────────────────────────────────────────────────────────────────

describe('SurfaceTruthBadge', () => {
  it('renders SIMULATED badge with correct testid', () => {
    render(<SurfaceTruthBadge variant="SIMULATED" />);
    expect(screen.getByTestId('surface-truth-badge-simulated')).toBeInTheDocument();
    expect(screen.getByText('SIMULATED')).toBeInTheDocument();
  });

  it('renders LIVE badge', () => {
    render(<SurfaceTruthBadge variant="LIVE" />);
    expect(screen.getByTestId('surface-truth-badge-live')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders PARTIAL badge', () => {
    render(<SurfaceTruthBadge variant="PARTIAL" />);
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });

  it('renders DISPLAY_ONLY badge', () => {
    render(<SurfaceTruthBadge variant="DISPLAY_ONLY" />);
    expect(screen.getByTestId('surface-truth-badge-display_only')).toBeInTheDocument();
    expect(screen.getByText('DISPLAY')).toBeInTheDocument();
  });

  it('shows verbose label when verbose=true', () => {
    render(<SurfaceTruthBadge variant="SIMULATED" verbose />);
    expect(screen.getByText(/Simulated/i)).toBeInTheDocument();
  });

  it('shows custom label when provided', () => {
    render(<SurfaceTruthBadge variant="LIVE" label="CUSTOM LABEL" />);
    expect(screen.getByText('CUSTOM LABEL')).toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    render(<SurfaceTruthBadge variant="ERROR" />);
    const badge = screen.getByTestId('surface-truth-badge-error');
    expect(badge).toHaveAttribute('aria-label');
    expect(badge.getAttribute('aria-label')).toContain('Surface truth status');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PageHealthBanner
// ─────────────────────────────────────────────────────────────────────────────

describe('PageHealthBanner', () => {
  it('renders banner with correct testid based on route', () => {
    render(
      <PageHealthBanner
        route="/orchestration-intelligence"
        variant="SIMULATED"
        message="Surface simulée — données de démonstration"
      />
    );
    expect(
      screen.getByTestId('page-health-banner-orchestration-intelligence')
    ).toBeInTheDocument();
  });

  it('shows the message text', () => {
    render(
      <PageHealthBanner
        route="/test"
        variant="PARTIAL"
        message="Données partielles disponibles"
      />
    );
    expect(screen.getByText('Données partielles disponibles')).toBeInTheDocument();
  });

  it('shows the SIMULATED badge', () => {
    render(
      <PageHealthBanner
        route="/quantum-center"
        variant="SIMULATED"
        message="Surface simulée"
      />
    );
    expect(screen.getByTestId('surface-truth-badge-simulated')).toBeInTheDocument();
  });

  it('shows dismiss button when dismissible=true', () => {
    render(
      <PageHealthBanner route="/test" variant="SIMULATED" message="Test" dismissible />
    );
    expect(screen.getByTestId('page-health-banner-dismiss-test')).toBeInTheDocument();
  });

  it('hides when dismissed', () => {
    render(
      <PageHealthBanner
        route="/test"
        variant="SIMULATED"
        message="Test dismissible"
        dismissible
      />
    );
    const banner = screen.getByTestId('page-health-banner-test');
    const dismissBtn = screen.getByTestId('page-health-banner-dismiss-test');
    fireEvent.click(dismissBtn);
    expect(banner).not.toBeInTheDocument();
  });

  it('shows learn more link when provided', () => {
    render(
      <PageHealthBanner
        route="/test"
        variant="PARTIAL"
        message="Learn more test"
        learnMoreHref="https://docs.example.com"
      />
    );
    const link = screen.getByTestId('page-health-banner-learn-more-test');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://docs.example.com');
  });

  it('does not render dismiss when dismissible=false (default)', () => {
    render(
      <PageHealthBanner route="/test" variant="DEGRADED" message="Non dismissible" />
    );
    expect(
      screen.queryByTestId('page-health-banner-dismiss-test')
    ).not.toBeInTheDocument();
  });

  it('has role=status for accessibility', () => {
    render(<PageHealthBanner route="/test" variant="LIVE" message="Live" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RuntimeSourceIndicator
// ─────────────────────────────────────────────────────────────────────────────

describe('RuntimeSourceIndicator', () => {
  it('renders TAURI_IPC source', () => {
    render(<RuntimeSourceIndicator source="TAURI_IPC" />);
    expect(screen.getByTestId('runtime-source-indicator-tauri_ipc')).toBeInTheDocument();
    expect(screen.getByText('IPC')).toBeInTheDocument();
  });

  it('renders SIMULATED source', () => {
    render(<RuntimeSourceIndicator source="SIMULATED" />);
    expect(screen.getByTestId('runtime-source-indicator-simulated')).toBeInTheDocument();
    expect(screen.getByText('SIM')).toBeInTheDocument();
  });

  it('renders STATIC source', () => {
    render(<RuntimeSourceIndicator source="STATIC" />);
    expect(screen.getByTestId('runtime-source-indicator-static')).toBeInTheDocument();
  });

  it('shows custom label when provided', () => {
    render(<RuntimeSourceIndicator source="HYBRID" label="MIXED" />);
    expect(screen.getByText('MIXED')).toBeInTheDocument();
  });

  it('has accessible title via aria-label', () => {
    render(<RuntimeSourceIndicator source="FALLBACK" />);
    const el = screen.getByTestId('runtime-source-indicator-fallback');
    expect(el).toHaveAttribute('aria-label');
  });
});
