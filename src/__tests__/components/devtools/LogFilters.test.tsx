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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter controls', () => {
      render(<LogFilters onChange={mockOnChange} />);
      expect(screen.getByLabelText(/level/i)).toBeInTheDocument();
    });

    it('should show all filter options', () => {
      render(<LogFilters onChange={mockOnChange} />);
      expect(screen.getByLabelText(/level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });
  });

  describe('Level Filters', () => {
    it('should filter by info level', () => {
      render(<LogFilters onChange={mockOnChange} />);

      const infoCheckbox = screen.getByLabelText(/info/i);
      fireEvent.click(infoCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          levels: expect.arrayContaining(['info']),
        })
      );
    });

    it('should filter by error level', () => {
      render(<LogFilters onChange={mockOnChange} />);

      const errorCheckbox = screen.getByLabelText(/error/i);
      fireEvent.click(errorCheckbox);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should support multiple levels', () => {
      render(<LogFilters onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText(/info/i));
      fireEvent.click(screen.getByLabelText(/warning/i));

      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          levels: expect.arrayContaining(['info', 'warning']),
        })
      );
    });
  });

  describe('Category Filters', () => {
    it('should filter by category', () => {
      render(<LogFilters onChange={mockOnChange} categories={['system', 'api', 'ui']} />);

      const categorySelect = screen.getByLabelText(/category/i);
      fireEvent.change(categorySelect, { target: { value: 'system' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'system',
        })
      );
    });

    it('should show custom categories', () => {
      render(<LogFilters onChange={mockOnChange} categories={['custom1', 'custom2']} />);

      expect(screen.getByText('custom1')).toBeInTheDocument();
      expect(screen.getByText('custom2')).toBeInTheDocument();
    });
  });

  describe('Date Range', () => {
    it('should filter by start date', () => {
      render(<LogFilters onChange={mockOnChange} showDateRange />);

      const startDate = screen.getByLabelText(/start date/i);
      fireEvent.change(startDate, { target: { value: '2026-01-01' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should filter by end date', () => {
      render(<LogFilters onChange={mockOnChange} showDateRange />);

      const endDate = screen.getByLabelText(/end date/i);
      fireEvent.change(endDate, { target: { value: '2026-01-31' } });

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Reset', () => {
    it('should reset all filters', () => {
      render(<LogFilters onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText(/info/i));

      const resetButton = screen.getByRole('button', { name: /reset|clear/i });
      fireEvent.click(resetButton);

      expect(mockOnChange).toHaveBeenLastCalledWith({
        levels: [],
        category: null,
        startDate: null,
        endDate: null,
      });
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<LogFilters onChange={mockOnChange} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
