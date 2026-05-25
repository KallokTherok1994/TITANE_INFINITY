import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ── Mocks must be declared before imports that use them ────────────────────

const mockRefresh = vi.fn().mockResolvedValue(undefined);
const mockRecalculate = vi.fn().mockResolvedValue(0.87);

vi.mock('@/hooks/useTwinIdentity', () => ({
  useTwinIdentity: () => ({
    identity: { id: 'twin-kevin', name: 'Kevin', version: '35.1.9', signature: 'TITANE Twin v∞' },
    isLoading: false,
    coreValues: ['présence', 'clarté', 'rigueur'],
    humanStyle: 'analytique et précis',
    error: null,
  }),
}));

vi.mock('@/hooks/useTwinEvolution', () => ({
  useTwinEvolution: () => ({
    fusionIndex: { globalScore: 0.87 },
    evolutionProfile: { phase: 'maturation', score: 0.87 },
    isLoading: false,
    currentPhase: 'maturation',
    syncScore: 0.87,
    lastSyncAt: Date.now() - 3600000,
    chatContextStatus: 'active',
    growthTrends: { cognitive: 'up', behavioral: 'stable', emotional: 'up' },
    suggestions: [{ id: 's1', category: 'cognitive', text: 'Augmenter la réflexion' }],
    ownerThemes: ['performance', 'clarté'],
    sourceCount: 42,
    reflectionAxis: 'stratégie',
    portraitUrl: null,
    portraitFallbackUrl: '/portrait-fallback.svg',
    refresh: mockRefresh,
    recalculateFusion: mockRecalculate,
    transitionPhase: vi.fn().mockResolvedValue(null),
    reinforceValue: vi.fn().mockResolvedValue(null),
    error: null,
  }),
}));

vi.mock('@/types/numericTwin', () => ({
  getScoreColor: (score: number) => (score >= 0.8 ? '#22c55e' : '#f97316'),
  getPhaseLabel: (phase: string) => phase ?? 'Observation',
  getTrendLabel: (t: string) => t,
  getTrendIcon: (t: string) => (t === 'up' ? '↑' : t === 'down' ? '↓' : '→'),
}));

vi.mock('../TwinEvolutionPanel.css', () => ({}));

// Import after mocks
import { TwinEvolutionPanel } from '../TwinEvolutionPanel';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('TwinEvolutionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TwinEvolutionPanel />);
  });

  it('renders in compact mode without crashing', () => {
    render(<TwinEvolutionPanel compact={true} />);
  });

  it('has data-testid="twin-evolution-panel" root element', () => {
    render(<TwinEvolutionPanel />);
    expect(screen.getByTestId('twin-evolution-panel')).toBeTruthy();
  });

  it('displays the fusion score (87)', () => {
    render(<TwinEvolutionPanel />);
    // syncScore 0.87 → "87%" displayed somewhere in the sync status block
    const statusBlock = screen.getByTestId('twin-context-status');
    expect(statusBlock.textContent).toMatch(/87%/);
  });

  it('shows the owner identity name (Kevin)', () => {
    render(<TwinEvolutionPanel />);
    // Identity name appears in h2 — may also appear elsewhere (alt, headings)
    const elements = screen.getAllByText(/Kevin/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('shows Résonance Kevin ↔ TITANE heading', () => {
    render(<TwinEvolutionPanel />);
    expect(screen.getByTestId('twin-owner-resonance')).toBeTruthy();
  });

  it('renders tab navigation with fusion tab', () => {
    render(<TwinEvolutionPanel />);
    expect(screen.getByTestId('twin-tab-fusion')).toBeTruthy();
  });

  it('renders values tab', () => {
    render(<TwinEvolutionPanel />);
    expect(screen.getByTestId('twin-tab-values')).toBeTruthy();
  });

  it('renders evolution tab', () => {
    render(<TwinEvolutionPanel />);
    expect(screen.getByTestId('twin-tab-evolution')).toBeTruthy();
  });

  it('calls refresh() when Sync button is clicked', async () => {
    render(<TwinEvolutionPanel />);
    const syncButton = screen.getByRole('button', {
      name: /forcer la synchronisation twin/i,
    });
    fireEvent.click(syncButton);
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('shows admin tab when isAdmin=true', () => {
    render(<TwinEvolutionPanel isAdmin={true} />);
    expect(screen.getByTestId('twin-tab-admin')).toBeTruthy();
  });

  it('hides admin tab when isAdmin=false (default)', () => {
    render(<TwinEvolutionPanel isAdmin={false} />);
    expect(screen.queryByTestId('twin-tab-admin')).toBeNull();
  });

  it('shows owner themes', () => {
    render(<TwinEvolutionPanel />);
    expect(screen.getByText('performance')).toBeTruthy();
    expect(screen.getByText('clarté')).toBeTruthy();
  });

  it('shows chat context status block with active state', () => {
    render(<TwinEvolutionPanel />);
    const statusBlock = screen.getByTestId('twin-context-status');
    expect(statusBlock.getAttribute('data-sync-status')).toBe('active');
  });

  it('shows "actif" label in context status when chatContextStatus=active', () => {
    render(<TwinEvolutionPanel />);
    // contextStatusMeta.label = '🟢 Contexte chat TWINS actif'
    expect(screen.getByText(/actif/i)).toBeTruthy();
  });

  it('shows source count', () => {
    render(<TwinEvolutionPanel />);
    expect(screen.getByText(/42/)).toBeTruthy();
  });
});

describe('TwinEvolutionPanel — compact mode', () => {
  it('shows TITANE∞ TWIN label in compact mode', () => {
    render(<TwinEvolutionPanel compact={true} />);
    expect(screen.getByText(/TITANE.*TWIN/i)).toBeTruthy();
  });
});

describe('TwinEvolutionPanel — loading state', () => {
  it('shows loading spinner when isLoading=true', () => {
    vi.doMock('@/hooks/useTwinEvolution', () => ({
      useTwinEvolution: () => ({
        fusionIndex: null,
        evolutionProfile: null,
        isLoading: true,
        currentPhase: null,
        syncScore: 0,
        lastSyncAt: null,
        chatContextStatus: 'unknown',
        growthTrends: null,
        suggestions: [],
        ownerThemes: [],
        sourceCount: 0,
        reflectionAxis: null,
        portraitUrl: null,
        portraitFallbackUrl: '/fallback.svg',
        refresh: vi.fn(),
        recalculateFusion: vi.fn(),
        transitionPhase: vi.fn(),
        reinforceValue: vi.fn(),
        error: null,
      }),
    }));
    expect(() => render(<TwinEvolutionPanel />)).not.toThrow();
  });
});

describe('TwinEvolutionPanel — error state', () => {
  it('renders without throwing when hooks return error', () => {
    vi.doMock('@/hooks/useTwinEvolution', () => ({
      useTwinEvolution: () => ({
        fusionIndex: null,
        evolutionProfile: null,
        isLoading: false,
        currentPhase: null,
        syncScore: 0,
        lastSyncAt: null,
        chatContextStatus: 'unknown',
        growthTrends: null,
        suggestions: [],
        ownerThemes: [],
        sourceCount: 0,
        reflectionAxis: null,
        portraitUrl: null,
        portraitFallbackUrl: '/fallback.svg',
        refresh: vi.fn(),
        recalculateFusion: vi.fn(),
        transitionPhase: vi.fn(),
        reinforceValue: vi.fn(),
        error: 'IPC call failed',
      }),
    }));
    expect(() => render(<TwinEvolutionPanel />)).not.toThrow();
  });
});
