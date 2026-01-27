/**
 * Tests pour DevTools Logs Section
 * Coverage: Affichage logs, Filtrage, Niveaux
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logs } from '@/apps/devtools/sections/Logs';

// Mock LogViewer component
vi.mock('@/apps/devtools/components/LogViewer', () => ({
  LogViewer: ({ logs }: any) => (
    <div data-testid="log-viewer">
      LogViewer: {logs?.length || 0} logs
    </div>
  ),
}));

// Mock LogFilters component
vi.mock('@/apps/devtools/components/LogFilters', () => ({
  LogFilters: ({ onFilterChange }: any) => (
    <div data-testid="log-filters">
      <button onClick={() => onFilterChange?.({ level: 'error' })}>
        Filter Errors
      </button>
    </div>
  ),
}));

describe('DevTools Logs Section', () => {
  describe('Rendering', () => {
    it('should render logs section', () => {
      render(<Logs />);
      
      expect(screen.getByTestId('log-viewer')).toBeInTheDocument();
    });

    it('should render log filters', () => {
      render(<Logs />);
      
      expect(screen.getByTestId('log-filters')).toBeInTheDocument();
    });
  });

  describe('Log Viewer', () => {
    it('should display LogViewer component', () => {
      render(<Logs />);
      
      const viewer = screen.getByTestId('log-viewer');
      expect(viewer).toBeInTheDocument();
      expect(viewer).toHaveTextContent('LogViewer');
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
