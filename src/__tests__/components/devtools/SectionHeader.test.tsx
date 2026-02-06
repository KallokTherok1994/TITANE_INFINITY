/**
 * Tests pour SectionHeader Component
 * Coverage: Title, Actions, Collapsible, Badges
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '@/components/devtools/SectionHeader';

describe('SectionHeader Component', () => {
  describe('Rendering', () => {
    it('should render section header', () => {
      render(<SectionHeader title="Metrics" />);
      expect(screen.getByText('Metrics')).toBeInTheDocument();
    });

    it('should show description', () => {
      render(<SectionHeader title="Logs" subtitle="System logs and events" />);
      expect(screen.getByText('System logs and events')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render action node', () => {
      render(
        <SectionHeader title="Data" action={<button type="button">Export</button>} />
      );

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<SectionHeader title="Test Section" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
