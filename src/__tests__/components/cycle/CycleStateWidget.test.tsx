/**
 * Test Vitest — CycleStateWidget
 * V32 Phase 5 — Rule 16 compliance
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CycleStateWidget } from '../../../components/CycleStateWidget';

// Mock secureInvoke
vi.mock('../../../lib/security', () => ({
  secureInvoke: vi.fn(),
}));

import { secureInvoke } from '../../../lib/security';
const mockInvoke = vi.mocked(secureInvoke);

const mockState = {
  daily_phase: 'Peak',
  weekly_phase: 'WorkWeek',
  monthly_phase: 'MidMonth',
  seasonal_phase: 'Summer',
  cognitive_mode: 'Analytical',
  timestamp: Date.now(),
};

const mockRhythm = {
  omega_depth: 0.8,
  analysis_intensity: 0.7,
  speed_vs_quality: 0.5,
  memory_consolidation: 0.6,
  creative_temperature: 0.4,
  engine_weights: [0.8, 0.7, 0.5],
};

const mockDiag = {
  clock_running: true,
  current_hour: 14,
  uptime_seconds: 3600,
  daily_phase: 'Peak',
  cognitive_mode: 'Analytical',
  omega_intensity: 0.8,
  alignment_score: 0.95,
};

describe('CycleStateWidget', () => {
  beforeEach(() => {
    // Promise.all receives 3 calls: state, rhythm, diagnostics
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === 'cycle_get_state') return mockState;
      if (cmd === 'cycle_get_rhythm') return mockRhythm;
      if (cmd === 'cycle_get_diagnostics') return mockDiag;
      throw new Error(`Unexpected command: ${cmd}`);
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders with stable data-testid', async () => {
    render(<CycleStateWidget />);
    // Initially loading
    expect(screen.getByTestId('cycle-state-widget')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<CycleStateWidget />);
    expect(screen.getByText('Chargement rythmes…')).toBeInTheDocument();
  });

  it('displays phase after load', async () => {
    render(<CycleStateWidget />);
    await waitFor(() => {
      expect(screen.queryByText('Chargement rythmes…')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('cycle-state-widget')).toBeInTheDocument();
    expect(screen.getByText('Peak')).toBeInTheDocument();
  });

  it('displays rhythm bars after load', async () => {
    render(<CycleStateWidget />);
    await waitFor(() => {
      expect(screen.getByTestId('cycle-rhythm')).toBeInTheDocument();
    });
  });

  it('displays diagnostics after load', async () => {
    render(<CycleStateWidget />);
    await waitFor(() => {
      expect(screen.getByTestId('cycle-diagnostics')).toBeInTheDocument();
    });
    expect(screen.getByText(/95%/)).toBeInTheDocument(); // alignment_score
  });

  it('shows error state when invocation fails', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC error'));
    render(<CycleStateWidget />);
    await waitFor(() => {
      expect(screen.getByText(/Cycle Engine indisponible/)).toBeInTheDocument();
    });
  });

  it('calls all 3 cycle commands via secureInvoke', async () => {
    render(<CycleStateWidget />);
    await waitFor(() => {
      expect(screen.queryByText('Chargement rythmes…')).not.toBeInTheDocument();
    });
    expect(mockInvoke).toHaveBeenCalledWith('cycle_get_state');
    expect(mockInvoke).toHaveBeenCalledWith('cycle_get_rhythm');
    expect(mockInvoke).toHaveBeenCalledWith('cycle_get_diagnostics');
  });
});
