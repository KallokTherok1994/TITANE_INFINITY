import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryEvolutionCenter } from '@/components/MemoryEvolution/MemoryEvolutionCenter';

const mockTauriClient = vi.hoisted(() => ({
  memoryEvolutionStatus: vi.fn(),
  memoryHierarchyHealth: vi.fn(),
  memoryGetClusters: vi.fn(),
  persistentMemoryGetStats: vi.fn(),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: mockTauriClient,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('MemoryEvolutionCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockTauriClient.memoryEvolutionStatus.mockResolvedValue({
      total_items: 3,
      items_by_level: { CT: 2, MT: 1 },
      clusters_count: 0,
      last_evolution: null,
      config: {
        auto_evolution_enabled: false,
        kevin_only_full_evolution: true,
      },
    });

    mockTauriClient.memoryHierarchyHealth.mockResolvedValue({
      ct_health: 0.5,
      mt_health: 0.5,
      lt_health: 0.5,
      elt_health: 0.5,
      core_health: 0.5,
      overall_health: 0.5,
      balance_score: 0.5,
      flow_efficiency: 0.5,
      recommendations: [],
    });

    mockTauriClient.memoryGetClusters.mockResolvedValue([]);

    mockTauriClient.persistentMemoryGetStats.mockResolvedValue({
      count_by_level: {
        session: 4,
        intermediate: 5,
        long_term: 6,
      },
      total_size: 2048,
      health: {
        status: 'healthy',
        corrupted_files: 0,
        last_integrity_check: 0,
        disk_space_percent: 10,
        encryption_active: true,
        last_backup: 0,
      },
    });
  });

  it('shows the evolution engine as isolated from persistent memory and disables actions', async () => {
    render(<MemoryEvolutionCenter />);

    await waitFor(() => {
      expect(screen.getByTestId('memory-evolution-truth-banner')).toBeInTheDocument();
    });

    expect(screen.getByTestId('memory-evolution-truth-banner')).toHaveAttribute(
      'data-state',
      'isolated'
    );
    expect(screen.getByText(/moteur parallèle isolé/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /distinct de la mémoire persistante active du chat et de la page mémoire/i
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('persistent-entry-count')).toHaveTextContent('15');

    expect(screen.getByRole('button', { name: /analyser/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /synthétiser/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /clusteriser/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /compresser/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /évolution complète/i })).toBeDisabled();
  });
});
