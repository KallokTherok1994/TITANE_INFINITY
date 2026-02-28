/**
 * Tests pour MemorySearchPanel Component
 * Coverage: recherche, filtres, callbacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
  });

  describe('Interactions', () => {
    it('should handle search input', () => {
      render(<MemorySearchPanel entries={entries} />);
      const input = screen.getByPlaceholderText(/recherche sémantique/i);
      fireEvent.change(input, { target: { value: 'architecture' } });
      expect(screen.getByText('Architecture TITANE')).toBeInTheDocument();
      expect(screen.queryByText('Session active')).not.toBeInTheDocument();
    });

    it('should trigger onEntryClick callback', () => {
      render(<MemorySearchPanel entries={entries} onEntryClick={mockOnEntryClick} />);
      fireEvent.click(screen.getByText('Architecture TITANE'));
      expect(mockOnEntryClick).toHaveBeenCalledTimes(1);
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
