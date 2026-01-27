// @ts-nocheck
/**
 * Tests pour LogViewer Component
 * Coverage: Log display, Filtering, Search, Virtual scrolling
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogViewer } from '@/components/devtools/LogViewer';
import type { LogEntry } from '@/types';

describe('LogViewer Component', () => {
  const mockLogs: LogEntry[] = [
    { id: '1', timestamp: Date.now(), level: 'info', message: 'Info message', category: 'system' },
    { id: '2', timestamp: Date.now(), level: 'error', message: 'Error message', category: 'api' },
    { id: '3', timestamp: Date.now(), level: 'warning', message: 'Warning message', category: 'ui' },
  ];

  describe('Rendering', () => {
    it('should render log viewer', () => {
      render(<LogViewer logs={mockLogs} />);
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('should render empty state', () => {
      render(<LogViewer logs={[]} />);
      expect(screen.getByText(/no logs|empty/i)).toBeInTheDocument();
    });

    it('should show all log levels', () => {
      render(<LogViewer logs={mockLogs} />);
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter by level', () => {
      render(<LogViewer logs={mockLogs} />);
      
      const errorFilter = screen.getByLabelText(/error/i);
      fireEvent.click(errorFilter);
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
    });

    it('should filter by category', () => {
      render(<LogViewer logs={mockLogs} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /category/i });
      fireEvent.change(categorySelect, { target: { value: 'api' } });
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
    });

    it('should combine filters', () => {
      render(<LogViewer logs={mockLogs} />);
      
      const errorFilter = screen.getByLabelText(/error/i);
      fireEvent.click(errorFilter);
      
      const categorySelect = screen.getByRole('combobox', { name: /category/i });
      fireEvent.change(categorySelect, { target: { value: 'api' } });
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should search logs', () => {
      render(<LogViewer logs={mockLogs} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Error' } });
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
    });

    it('should be case-insensitive', () => {
      render(<LogViewer logs={mockLogs} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'error' } });
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should clear logs', () => {
      const onClear = vi.fn();
      render(<LogViewer logs={mockLogs} onClear={onClear} />);
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);
      
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('should export logs', () => {
      const onExport = vi.fn();
      render(<LogViewer logs={mockLogs} onExport={onExport} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);
      
      expect(onExport).toHaveBeenCalledWith(mockLogs);
    });
  });

  describe('Virtual Scrolling', () => {
    it('should handle large log lists', () => {
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        timestamp: Date.now(),
        level: 'info',
        message: `Log ${i}`,
        category: 'test'
      }));

      render(<LogViewer logs={largeLogs} />);
      // Should render without performance issues
      expect(screen.getByText('Log 0')).toBeInTheDocument();
    });
  });
});
