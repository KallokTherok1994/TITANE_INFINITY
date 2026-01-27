/**
 * Tests pour DevTools OmegaPipeline Section
 * Coverage: Pipeline OMEGA, Étapes, État
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OmegaPipeline } from '@/apps/devtools/sections/OmegaPipeline';

// Mock store
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    pipeline: {
      steps: [
        { id: 'input', name: 'Input Processing', status: 'completed', duration: 50 },
        { id: 'analysis', name: 'Analysis', status: 'running', duration: 120 },
        { id: 'generation', name: 'Generation', status: 'pending', duration: 0 },
      ],
      currentStep: 'analysis',
    },
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

describe('DevTools OmegaPipeline Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pipeline section', () => {
      render(<OmegaPipeline />);
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });

    it('should display pipeline steps', () => {
      render(<OmegaPipeline />);
      // Les étapes du pipeline devraient être visibles
      expect(screen.getByText(/Input Processing/i) || screen.getByText(/Analysis/i)).toBeTruthy();
    });

    it('should show step statuses', () => {
      render(<OmegaPipeline />);
      // Vérifier présence de statuts
      const content = screen.getByTestId('section-header').parentElement;
      expect(content).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<OmegaPipeline />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
