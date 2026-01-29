/**
 * Tests pour DevTools Logs Section
 * Coverage: Affichage logs, Filtrage, Niveaux
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logs } from '@/apps/devtools/sections';

// Mock du store DevTools
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    logs: [
      {
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        source: 'helios',
        message: 'Test log 1',
      },
      {
        id: '2',
        timestamp: Date.now(),
        level: 'error',
        source: 'nexus',
        message: 'Test error',
      },
    ],
    autoScrollLogs: true,
    setAutoScrollLogs: vi.fn(),
    clearLogs: vi.fn(),
  }),
}));

// Mock des composants enfants
vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title }: any) => <div data-testid="section-header">{title}</div>,
  LogLine: ({ log }: any) => <div data-testid={`log-${log.id}`}>{log.message}</div>,
  LogFilters: ({ onReset }: any) => (
    <div data-testid="log-filters">
      <button onClick={onReset}>Filter Errors</button>
    </div>
  ),
}));

describe('DevTools Logs Section', () => {
  describe('Rendering', () => {
    it('should render logs section with header', () => {
      render(<Logs />);

      expect(screen.getByTestId('section-header')).toBeInTheDocument();
      expect(screen.getByText('System Logs')).toBeInTheDocument();
    });

    it('should render log viewer container', () => {
      render(<Logs />);

      expect(screen.getByTestId('log-viewer')).toBeInTheDocument();
    });

    it('should render log filters', () => {
      render(<Logs />);

      expect(screen.getByTestId('log-filters')).toBeInTheDocument();
    });
  });

  describe('Log Display', () => {
    it('should display log lines', () => {
      render(<Logs />);

      expect(screen.getByTestId('log-1')).toBeInTheDocument();
      expect(screen.getByTestId('log-2')).toBeInTheDocument();
    });

    it('should show log messages', () => {
      render(<Logs />);

      expect(screen.getByText('Test log 1')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render filter controls', () => {
      render(<Logs />);

      const filters = screen.getByTestId('log-filters');
      expect(filters).toBeInTheDocument();
    });

    it('should have filter button', () => {
      render(<Logs />);

      const filterButton = screen.getByText('Filter Errors');
      expect(filterButton).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Logs />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
