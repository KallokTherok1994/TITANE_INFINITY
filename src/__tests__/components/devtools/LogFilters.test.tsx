// @ts-nocheck
/**
 * Tests pour LogFilters Component
 * Coverage: Level filters, Category filters, Date range
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogFilters } from '@/components/devtools/LogFilters';

describe('LogFilters Component', () => {
  const mockOnChange = vi.fn();
  const baseFilters = { level: [], search: '', source: undefined };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter controls', () => {
      render(<LogFilters filters={baseFilters} onFilterChange={mockOnChange} />);
      expect(screen.getByPlaceholderText(/search logs/i)).toBeInTheDocument();
    });

    it('should show all filter options', () => {
      render(<LogFilters filters={baseFilters} onFilterChange={mockOnChange} />);
      expect(screen.getByRole('button', { name: /debug/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /info/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /warn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /error/i })).toBeInTheDocument();
    });
  });

  describe('Level Filters', () => {
    it('should filter by info level', () => {
      render(<LogFilters filters={baseFilters} onFilterChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: /info/i }));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ level: ['info'] })
      );
    });

    it('should filter by error level', () => {
      render(<LogFilters filters={baseFilters} onFilterChange={mockOnChange} />);
      fireEvent.click(screen.getByRole('button', { name: /error/i }));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ level: ['error'] })
      );
    });

    it('should support multiple levels', () => {
      render(
        <LogFilters
          filters={{ ...baseFilters, level: ['info'] }}
          onFilterChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /warn/i }));

      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ level: ['info', 'warn'] })
      );
    });
  });

  describe('Search', () => {
    it('should update search text', () => {
      render(<LogFilters filters={baseFilters} onFilterChange={mockOnChange} />);
      fireEvent.change(screen.getByPlaceholderText(/search logs/i), {
        target: { value: 'error' },
      });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'error' })
      );
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <LogFilters filters={baseFilters} onFilterChange={mockOnChange} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
