// @ts-nocheck
/**
 * Tests pour LogViewer Component
 * Coverage: Log display, Filtering, Search, Virtual scrolling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogViewer } from '@/components/devtools/LogViewer';
import { secureInvoke } from '@/lib/security';

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

describe('LogViewer Component', () => {
  const mockSecureInvoke = secureInvoke as unknown as ReturnType<typeof vi.fn>;

  const mockLogs = [
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      source: 'system',
      message: 'Info message',
    },
    {
      timestamp: new Date().toISOString(),
      level: 'error',
      source: 'api',
      message: 'Error message',
    },
    {
      timestamp: new Date().toISOString(),
      level: 'warn',
      source: 'ui',
      message: 'Warning message',
    },
  ];

  beforeEach(() => {
    mockSecureInvoke.mockReset();
    mockSecureInvoke.mockImplementation(async (command: string, payload?: any) => {
      if (command === 'get_logs') {
        const level = payload?.level ?? 'all';
        const filtered =
          level === 'all' ? mockLogs : mockLogs.filter(log => log.level === level);
        return {
          logs: filtered,
          total: filtered.length,
          has_more: false,
        };
      }

      if (command === 'clear_logs' || command === 'clear_system_logs') {
        return { ok: true };
      }

      return { ok: true };
    });
  });

  describe('Rendering', () => {
    it('should render log viewer', async () => {
      render(<LogViewer />);
      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });
    });

    it('should render empty state', () => {
      mockSecureInvoke.mockResolvedValueOnce({ logs: [], total: 0, has_more: false });
      render(<LogViewer />);
      expect(screen.getByText(/no logs|empty/i)).toBeInTheDocument();
    });

    it('should show all log levels', async () => {
      render(<LogViewer />);
      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by level', async () => {
      render(<LogViewer />);

      const levelSelect = screen.getByRole('combobox');
      fireEvent.change(levelSelect, { target: { value: 'error' } });

      await waitFor(() => {
        expect(mockSecureInvoke).toHaveBeenCalledWith('get_logs', expect.any(Object));
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.queryByText('Info message')).not.toBeInTheDocument();
      });
    });

    it('should filter by category', async () => {
      render(<LogViewer />);
      const searchInput = screen.getByPlaceholderText(/search/i);

      fireEvent.change(searchInput, { target: { value: 'api' } });

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.queryByText('Info message')).not.toBeInTheDocument();
      });
    });

    it('should combine filters', async () => {
      render(<LogViewer />);

      const levelSelect = screen.getByRole('combobox');
      fireEvent.change(levelSelect, { target: { value: 'error' } });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'api' } });

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.queryByText('Info message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search', () => {
    it('should search logs', async () => {
      render(<LogViewer />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Error' } });

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.queryByText('Info message')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      render(<LogViewer />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'error' } });

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('should clear logs', () => {
      render(<LogViewer />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      expect(mockSecureInvoke).toHaveBeenCalledWith('clear_logs');
    });

    it('should export logs', () => {
      const createObjectURL = vi.fn(() => 'blob:mock');
      const clickSpy = vi.fn();

      Object.defineProperty(URL, 'createObjectURL', {
        writable: true,
        value: createObjectURL,
      });

      Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
        writable: true,
        value: clickSpy,
      });

      render(<LogViewer />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      expect(createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Virtual Scrolling', () => {
    it('should handle large log lists', async () => {
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        timestamp: new Date().toISOString(),
        level: 'info',
        source: 'test',
        message: `Log ${i}`,
      }));

      mockSecureInvoke.mockResolvedValueOnce({
        logs: largeLogs,
        total: largeLogs.length,
        has_more: false,
      });

      render(<LogViewer />);
      // Should render without performance issues
      await waitFor(() => {
        expect(screen.getByText('Log 0')).toBeInTheDocument();
      });
    });
  });
});
