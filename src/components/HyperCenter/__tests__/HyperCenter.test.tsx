import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HyperCenter } from '@/components/HyperCenter/HyperCenter';

vi.mock('@/hooks/useIdentityMatrix', () => ({
  useIdentityMatrix: () => ({ loading: false }),
}));

vi.mock('@/hooks/useSingularityStateSafe', () => ({
  useSingularityStateSafe: () => ({ state: 'idle' }),
}));

const tauriMocks = vi.hoisted(() => ({
  hyperGetState: vi.fn(),
  hyperInit: vi.fn(),
  hyperGetThoughts: vi.fn(),
  hyperGetInsights: vi.fn(),
  hyperSetMode: vi.fn(),
  hyperThink: vi.fn(),
  hyperReason: vi.fn(),
  hyperImagine: vi.fn(),
  hyperGenerateInsight: vi.fn(),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: tauriMocks,
}));

const buildState = (mode?: string) => ({
  active: true,
  mode,
  consciousness_level: 'Aware',
  consciousness_score: 0.7,
  thought_count: 4,
  active_thoughts: 1,
  insight_count: 2,
  reasoning_depth: 3,
  creativity_index: 0.5,
  coherence_score: 0.8,
  uptime_seconds: 120,
});

describe('HyperCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tauriMocks.hyperGetThoughts.mockResolvedValue([]);
    tauriMocks.hyperGetInsights.mockResolvedValue([]);
  });

  it('renders canonical HyperCenter surface with stable testids', async () => {
    tauriMocks.hyperGetState.mockResolvedValue(buildState('analytical'));

    render(<HyperCenter />);

    expect(await screen.findByTestId('page-hyper-center')).toBeInTheDocument();
    expect(screen.getByTestId('hyper-center-root')).toBeInTheDocument();
    expect(screen.getByTestId('hyper-center-mode-selector')).toBeInTheDocument();
    expect(screen.getByTestId('hyper-center-mode-analytical')).toBeInTheDocument();
  });

  it('stays stable when state.mode is undefined', async () => {
    tauriMocks.hyperGetState.mockResolvedValue(buildState(undefined));

    render(<HyperCenter />);

    expect(await screen.findByTestId('page-hyper-center')).toBeInTheDocument();
    expect(screen.getByTestId('hyper-center-mode-selector')).toBeInTheDocument();
  });
});
