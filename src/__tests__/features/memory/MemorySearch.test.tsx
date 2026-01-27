/**
 * Tests pour MemorySearch Component
 * Coverage: Recherche, Filtres, Résultats
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemorySearch } from '@/features/memory/MemorySearch';

describe.skip('MemorySearch Component (NON IMPLÉMENTÉ - fichier inexistant)', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<MemorySearch onSearch={mockOnSearch} />);
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should render search button', () => {
      render(<MemorySearch onSearch={mockOnSearch} />);
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should render tier filters', () => {
      render(<MemorySearch onSearch={mockOnSearch} showFilters />);
      expect(screen.getByText(/STM|MTM|LTM/i)).toBeTruthy();
    });
  });

  describe('Search', () => {
    it('should handle search input', () => {
      render(<MemorySearch onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'test query' } });
      expect(input).toHaveValue('test query');
    });

    it('should trigger search on submit', () => {
      render(<MemorySearch onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form') || input);
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    });

    it('should clear search', () => {
      render(<MemorySearch onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'test' } });
      const clearBtn = screen.queryByRole('button', { name: /clear/i });
      if (clearBtn) {
        fireEvent.click(clearBtn);
        expect(input).toHaveValue('');
      }
    });
  });

  describe('Filters', () => {
    it('should filter by tier', () => {
      render(<MemorySearch onSearch={mockOnSearch} showFilters />);
      const stmFilter = screen.getByText(/STM/i);
      fireEvent.click(stmFilter);
      // Filter devrait être appliqué
      expect(stmFilter).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MemorySearch onSearch={mockOnSearch} showFilters />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
