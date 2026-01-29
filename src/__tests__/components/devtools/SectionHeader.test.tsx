/**
 * Tests pour SectionHeader Component
 * Coverage: Title, Actions, Collapsible, Badges
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionHeader } from '@/components/devtools/SectionHeader';

describe('SectionHeader Component', () => {
  describe('Rendering', () => {
    it('should render section header', () => {
      render(<SectionHeader title="Metrics" />);
      expect(screen.getByText('Metrics')).toBeInTheDocument();
    });

    it('should show description', () => {
      render(<SectionHeader title="Logs" description="System logs and events" />);
      expect(screen.getByText('System logs and events')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render action buttons', () => {
      const actions = [
        { label: 'Export', onClick: vi.fn() },
        { label: 'Clear', onClick: vi.fn() },
      ];
      render(<SectionHeader title="Data" actions={actions} />);

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should call action onClick', () => {
      const onClick = vi.fn();
      const actions = [{ label: 'Test', onClick }];
      render(<SectionHeader title="Test" actions={actions} />);

      fireEvent.click(screen.getByRole('button', { name: /test/i }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Collapsible', () => {
    it('should toggle collapse', () => {
      const onToggle = vi.fn();
      render(<SectionHeader title="Collapsible" collapsible onToggle={onToggle} />);

      const toggleButton = screen.getByRole('button', { name: /collapse|expand/i });
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('should show collapse icon', () => {
      render(<SectionHeader title="Section" collapsible />);
      expect(screen.getByRole('img', { name: /chevron|arrow/i })).toBeInTheDocument();
    });

    it('should rotate icon when collapsed', () => {
      const { rerender } = render(
        <SectionHeader title="Section" collapsible collapsed={false} />
      );

      const icon = screen.getByRole('img', { name: /chevron|arrow/i });
      const initialRotation = icon.style.transform;

      rerender(<SectionHeader title="Section" collapsible collapsed={true} />);
      expect(icon.style.transform).not.toBe(initialRotation);
    });
  });

  describe('Badges', () => {
    it('should show count badge', () => {
      render(<SectionHeader title="Items" count={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should show status badge', () => {
      render(
        <SectionHeader title="Status" badge={{ label: 'Active', variant: 'success' }} />
      );
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should show title icon', () => {
      render(<SectionHeader title="Settings" icon="settings" />);
      expect(screen.getByRole('img', { name: /settings/i })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      const { container } = render(<SectionHeader title="Primary" variant="primary" />);
      expect(container.firstChild?.className).toMatch(/primary/i);
    });

    it('should render secondary variant', () => {
      const { container } = render(
        <SectionHeader title="Secondary" variant="secondary" />
      );
      expect(container.firstChild?.className).toMatch(/secondary/i);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<SectionHeader title="Test Section" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
