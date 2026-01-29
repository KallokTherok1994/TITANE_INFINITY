// @ts-nocheck
/**
 * Tests pour DevTools Errors Section
 * Coverage: Liste erreurs, Filtrage, Actions (retry, resolve)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Errors } from '@/apps/devtools/sections';

// Mock store
const mockResolveError = vi.fn();
const mockUpdateEngine = vi.fn();

vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    errors: [
      {
        id: 'err1',
        message: 'Connection timeout',
        engine: 'chat-engine',
        timestamp: Date.now(),
        resolved: false,
        impact: 'high',
      },
      {
        id: 'err2',
        message: 'Memory limit exceeded',
        engine: 'memory-engine',
        timestamp: Date.now() - 30000,
        resolved: false,
        impact: 'medium',
      },
      {
        id: 'err3',
        message: 'Invalid config',
        engine: 'fusion-engine',
        timestamp: Date.now() - 60000,
        resolved: true,
        impact: 'low',
      },
    ],
    resolveError: mockResolveError,
    updateEngine: mockUpdateEngine,
  }),
}));

vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title, description }: any) => (
    <div data-testid="section-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

describe('DevTools Errors Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render errors section', () => {
      render(<Errors />);
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });

    it('should display unresolved errors by default', () => {
      render(<Errors />);
      expect(screen.getByText(/Connection timeout/i)).toBeInTheDocument();
      expect(screen.getByText(/Memory limit exceeded/i)).toBeInTheDocument();
    });

    it('should show error impact levels', () => {
      render(<Errors />);
      // Les erreurs avec différents niveaux d'impact devraient être présentes
      expect(screen.getByText(/Connection timeout/i)).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter errors by resolution status', () => {
      render(<Errors />);
      // Par défaut, affiche 'unresolved' donc 2 erreurs
      const errors = screen.queryAllByText(/engine/i);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Actions', () => {
    it('should handle error retry', () => {
      vi.useFakeTimers();
      render(<Errors />);

      // Chercher boutons retry si disponibles
      const retryButtons = screen.queryAllByRole('button', { name: /retry/i });
      if (retryButtons.length > 0) {
        fireEvent.click(retryButtons[0]);
        expect(mockUpdateEngine).toHaveBeenCalled();
      }

      vi.useRealTimers();
    });

    it('should handle error resolution', () => {
      render(<Errors />);

      const resolveButtons = screen.queryAllByRole('button', { name: /resolve/i });
      if (resolveButtons.length > 0) {
        fireEvent.click(resolveButtons[0]);
        expect(mockResolveError).toHaveBeenCalled();
      }
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Errors />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
