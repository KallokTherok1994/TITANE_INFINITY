/**
 * Tests pour DevTools OmegaPipeline Section — Journal d'Exécution OMEGA v30
 * Coverage: Pipeline OMEGA, Étapes, État cognitif, Journal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OmegaPipeline } from '@/apps/devtools/sections';

// Mock store
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    currentPipeline: [
      { id: 'perception', name: 'Perception', status: 'complete', duration: 50 },
      { id: 'analysis', name: 'Analyse', status: 'running', duration: 120 },
      { id: 'synthesis', name: 'Synthèse', status: 'pending', duration: 0 },
    ],
    pipelineHistory: [
      [
        { id: 'perception', name: 'Perception', status: 'complete', duration: 45 },
        { id: 'analysis', name: 'Analyse', status: 'complete', duration: 110 },
        { id: 'synthesis', name: 'Synthèse', status: 'complete', duration: 55 },
      ],
    ],
    cognitiveState: {
      currentMode: 'OMEGA',
      currentProvider: 'ollama',
      effortLevel: 'high',
      singularityCoherence: 89,
      processingLoad: 0,
      activeEnginesCount: 5,
      status: 'idle',
    },
    reasoningTrace: null,
    journalEntries: [],
    clearJournal: vi.fn(),
  }),
}));

vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
    <div data-testid="section-header">
      <span>{title}</span>
      {actions && <div data-testid="header-actions">{actions}</div>}
    </div>
  ),
}));

describe('DevTools OmegaPipeline Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pipeline section with header', () => {
      render(<OmegaPipeline />);

      expect(screen.getByTestId('section-header')).toBeInTheDocument();
      expect(screen.getByText("Journal d'Exécution OMEGA")).toBeInTheDocument();
    });

    it('should display current execution section', () => {
      render(<OmegaPipeline />);

      expect(screen.getByText('Exécution en Cours')).toBeInTheDocument();
    });

    it('should display total duration', () => {
      render(<OmegaPipeline />);

      // duration + history count in actions bar
      expect(screen.getByText(/ms · \d+ exec/)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<OmegaPipeline />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
