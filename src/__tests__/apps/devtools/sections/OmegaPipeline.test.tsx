/**
 * Tests pour DevTools OmegaPipeline Section
 * Coverage: Pipeline OMEGA, Étapes, État
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OmegaPipeline } from '@/apps/devtools/sections';

// Mock store
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    currentPipeline: [
      { id: 'perception', status: 'complete', duration: 50 },
      { id: 'analysis', status: 'running', duration: 120 },
      { id: 'synthesis', status: 'pending', duration: 0 },
    ],
    pipelineHistory: [
      [
        { id: 'perception', status: 'complete', duration: 45 },
        { id: 'analysis', status: 'complete', duration: 110 },
        { id: 'synthesis', status: 'complete', duration: 55 },
      ],
      [
        { id: 'perception', status: 'complete', duration: 50 },
        { id: 'analysis', status: 'complete', duration: 95 },
        { id: 'synthesis', status: 'complete', duration: 50 },
      ],
    ],
  }),
}));

vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title, actions }: any) => (
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
      expect(screen.getByText('Omega Pipeline')).toBeInTheDocument();
    });

    it('should display current execution section', () => {
      render(<OmegaPipeline />);
      
      expect(screen.getByText('Current Execution')).toBeInTheDocument();
    });

    it('should display total duration', () => {
      render(<OmegaPipeline />);
      
      // Vérifier que le total existe (peut être 0ms si pas de pipeline)
      expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<OmegaPipeline />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
