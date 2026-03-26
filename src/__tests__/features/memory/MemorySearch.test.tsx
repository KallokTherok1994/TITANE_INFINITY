/**
 * Tests pour MemorySearchPanel Component
 * Coverage: recherche, filtres, callbacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemorySearchPanel } from '@/features/memory/MemorySearchPanel';

describe('MemorySearchPanel Component', () => {
  const entries = [
    {
      id: '1',
      content: 'Architecture TITANE',
      type: 'long' as const,
      timestamp: Date.now(),
      tags: ['architecture'],
      relevance: 0.9,
    },
    {
      id: '2',
      content: 'Session active',
      type: 'short' as const,
      timestamp: Date.now(),
      tags: ['session'],
      relevance: 0.8,
    },
  ];

  const mockOnEntryClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<MemorySearchPanel entries={entries} />);
      expect(screen.getByPlaceholderText(/recherche sémantique/i)).toBeInTheDocument();
    });

    it('should render memory entries', () => {
      render(<MemorySearchPanel entries={entries} />);
      expect(screen.getByText('Architecture TITANE')).toBeInTheDocument();
      expect(screen.getByText('Session active')).toBeInTheDocument();
    });

    it('should render type and date filters', () => {
      render(<MemorySearchPanel entries={entries} />);
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('should render an honest empty state without illustrative fallback', () => {
      render(<MemorySearchPanel entries={[]} />);
      expect(screen.getByText(/aucune entrée mémoire indexée/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /la recherche sémantique s'activera dès qu'une entrée réelle sera consolidée/i
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/données illustratives — backend tauri inactif/i)
      ).not.toBeInTheDocument();
      expect(screen.getByText(/0 entrée mémoire/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/recherche sémantique/i)).toBeDisabled();
      expect(screen.getAllByRole('combobox')[0]).toBeDisabled();
      expect(
        screen.getByText(/la recherche sémantique restera inactive/i)
      ).toBeInTheDocument();
    });

    it('should render a bootstrap loading state before persistent entries are available', () => {
      render(<MemorySearchPanel entries={[]} isLoading={true} />);
      expect(
        screen.getByText(/chargement de l'index mémoire persistant/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/chargement de la mémoire persistante/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/aucune entrée mémoire indexée/i)
      ).not.toBeInTheDocument();
      expect(screen.getByText(/chargement\.\.\./i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/recherche sémantique/i)).toBeDisabled();
    });

    it('should only render illustrative fallback when explicitly allowed', () => {
      render(<MemorySearchPanel allowIllustrativeFallback={true} />);
      expect(
        screen.getByText(/données illustratives — backend tauri inactif/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/5 résultats/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle search input', () => {
      vi.useFakeTimers();
      try {
        render(<MemorySearchPanel entries={entries} />);
        const input = screen.getByPlaceholderText(/recherche sémantique/i);
        fireEvent.change(input, { target: { value: 'architecture' } });
        // Advance past the 300ms useDebounce delay (added in debounce optimization)
        act(() => { vi.advanceTimersByTime(350); });
        expect(screen.getByText('Architecture TITANE')).toBeInTheDocument();
        expect(screen.queryByText('Session active')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it('should trigger onEntryClick callback', () => {
      render(<MemorySearchPanel entries={entries} onEntryClick={mockOnEntryClick} />);
      fireEvent.click(screen.getByText('Architecture TITANE'));
      expect(mockOnEntryClick).toHaveBeenCalledTimes(1);
    });

    it('should reflect an externally synchronized selected entry', () => {
      render(<MemorySearchPanel entries={entries} selectedEntryId="2" />);

      expect(screen.getByTestId('memory-search-entry-2')).toHaveAttribute(
        'data-selected',
        'true'
      );
      expect(screen.getByTestId('memory-search-entry-1')).toHaveAttribute(
        'data-selected',
        'false'
      );
    });

    it('should filter by type selection', () => {
      render(<MemorySearchPanel entries={entries} />);
      const [typeSelect] = screen.getAllByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'short' } });
      expect(screen.getByText('Session active')).toBeInTheDocument();
      expect(screen.queryByText('Architecture TITANE')).not.toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MemorySearchPanel entries={entries} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
