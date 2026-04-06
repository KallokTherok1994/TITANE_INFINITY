import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryDashboard } from '@/components/chat/MemoryDashboard';

const mockUsePersistentMemory = vi.fn();

vi.mock('@/hooks/usePersistentMemory', () => ({
  usePersistentMemory: (options: unknown) => mockUsePersistentMemory(options),
}));

describe('MemoryDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables dashboard controls when persistent memory is empty', () => {
    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: {
        countByLevel: { session: 0, intermediate: 0, long_term: 0 },
        sizeByLevel: { session: 0, intermediate: 0, long_term: 0 },
      },
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      sessionCount: 0,
      intermediateCount: 0,
      longTermCount: 0,
    });

    render(<MemoryDashboard modeId="admin" compact={true} />);

    expect(screen.getByText(/0 entrée mémoire/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /le dashboard mémoire restera inactif tant qu'aucune entrée mémoire réelle/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/aucune entrée mémoire consolidée/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/rechercher dans la mémoire/i);
    expect(searchInput).toBeDisabled();

    const filters = screen.getAllByRole('combobox');
    expect(filters[0]).toBeDisabled();
    expect(filters[1]).toBeDisabled();
    expect(filters[2]).toBeDisabled();
  });

  it('distinguishes filtered-empty results from truly empty persistent memory', () => {
    mockUsePersistentMemory.mockReturnValue({
      entries: [
        {
          id: 'ltm-1',
          level: 'long_term',
          topic: 'preferences',
          importance: 5,
          content: 'Souvenir persistant de préférence utilisateur',
          tags: ['memoire'],
          metadata: {
            createdAt: Date.now(),
            accessCount: 2,
          },
        },
      ],
      stats: {
        countByLevel: { session: 0, intermediate: 0, long_term: 1 },
        sizeByLevel: { session: 0, intermediate: 0, long_term: 512 },
      },
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      sessionCount: 0,
      intermediateCount: 0,
      longTermCount: 1,
    });

    render(<MemoryDashboard modeId="admin" compact={true} />);

    const searchInput = screen.getByPlaceholderText(/rechercher dans la mémoire/i);
    expect(searchInput).not.toBeDisabled();

    fireEvent.change(searchInput, { target: { value: 'introuvable' } });

    expect(
      screen.getByText(/aucun résultat pour les filtres actifs/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ajustez la recherche ou les filtres pour retrouver une entrée/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/aucune mémoire persistante consolidée/i)
    ).not.toBeInTheDocument();
  });

  it('reflects an externally synchronized selected entry', () => {
    mockUsePersistentMemory.mockReturnValue({
      entries: [
        {
          id: 'ltm-1',
          level: 'long_term',
          topic: 'preferences',
          importance: 5,
          content: 'Souvenir persistant de préférence utilisateur',
          tags: ['memoire'],
          metadata: {
            createdAt: Date.now(),
            accessCount: 2,
          },
        },
        {
          id: 'ltm-2',
          level: 'intermediate',
          topic: 'general',
          importance: 3,
          content: 'Souvenir secondaire',
          tags: ['session'],
          metadata: {
            createdAt: Date.now() - 10_000,
            accessCount: 1,
          },
        },
      ],
      stats: {
        countByLevel: { session: 0, intermediate: 1, long_term: 1 },
        sizeByLevel: { session: 0, intermediate: 128, long_term: 512 },
      },
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      sessionCount: 0,
      intermediateCount: 1,
      longTermCount: 1,
    });

    render(<MemoryDashboard modeId="admin" compact={true} selectedEntryId="ltm-2" />);

    expect(screen.getByTestId('memory-entry-card-ltm-2')).toHaveAttribute(
      'data-selected',
      'true'
    );
    expect(screen.getByTestId('memory-entry-card-ltm-1')).toHaveAttribute(
      'data-selected',
      'false'
    );
  });
});
