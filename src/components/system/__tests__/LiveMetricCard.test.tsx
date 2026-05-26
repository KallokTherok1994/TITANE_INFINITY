import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveMetricCard, ModuleHealthStrip, RuntimeStatusPill } from '../LiveMetricCard';

describe('LiveMetricCard', () => {
  it('renders value with source badge', () => {
    render(<LiveMetricCard label="Niveau" value={5} source="live" />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Niveau')).toBeInTheDocument();
    expect(screen.getByTestId('metric-niveau')).toHaveAttribute(
      'data-metric-source',
      'live'
    );
  });

  it('shows empty reason when value is null', () => {
    render(
      <LiveMetricCard
        label="Score"
        value={null}
        source="degraded"
        emptyReason="Service unavailable"
      />
    );
    expect(screen.getByText('Service unavailable')).toBeInTheDocument();
  });

  it('shows static_curated label for curated data', () => {
    render(<LiveMetricCard label="KPI" value="87%" source="static_curated" />);
    expect(screen.getByText('exemple')).toBeInTheDocument();
  });

  it('renders unit alongside value', () => {
    render(<LiveMetricCard label="Duration" value={90} unit="min" source="live" />);
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('min')).toBeInTheDocument();
  });
});

describe('ModuleHealthStrip', () => {
  it('renders all module statuses', () => {
    render(
      <ModuleHealthStrip
        modules={[
          { id: 'chat', label: 'Chat', status: 'live' },
          { id: 'memory', label: 'Memory', status: 'partial' },
          { id: 'time', label: 'Time', status: 'degraded' },
        ]}
      />
    );
    expect(screen.getByTestId('module-health-strip')).toBeInTheDocument();
    expect(screen.getByTestId('health-chat')).toBeInTheDocument();
    expect(screen.getByTestId('health-memory')).toBeInTheDocument();
    expect(screen.getByTestId('health-time')).toBeInTheDocument();
  });
});

describe('RuntimeStatusPill', () => {
  it('renders live status', () => {
    render(<RuntimeStatusPill status="live" />);
    expect(screen.getByTestId('status-pill-live')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<RuntimeStatusPill status="degraded" label="Service dégradé" />);
    expect(screen.getByText('Service dégradé')).toBeInTheDocument();
  });
});
