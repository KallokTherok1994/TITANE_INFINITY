import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import App from '@/App';

expect.extend(toHaveNoViolations);

// Mock components for testing
const Form = () => (
  <form>
    <button type="submit">Submit</button>
  </form>
);

const Modal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div role="dialog">
      <button>First Button</button>
      <button onClick={onClose}>Close</button>
      <button>Last Button</button>
    </div>
  );
};

describe('♿ Advanced Accessibility Tests', () => {
  describe('Keyboard Navigation Flow', () => {
    it('should navigate through entire app with keyboard', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Tab through all interactive elements
      const focusableElements = screen
        .getAllByRole('button')
        .concat(screen.getAllByRole('link'))
        .concat(screen.getAllByRole('textbox'));

      for (let i = 0; i < focusableElements.length; i++) {
        await user.tab();
        expect(document.activeElement).toBeInTheDocument();
      }
    });

    it('should reverse navigate with Shift+Tab', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Go to last element
      const buttons = screen.getAllByRole('button');
      buttons[buttons.length - 1].focus();

      // Tab backward
      await user.tab({ shift: true });
      expect(document.activeElement).not.toBe(buttons[buttons.length - 1]);
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should have live regions for dynamic content', () => {
      render(<App />);

      const liveRegions = document.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThan(0);

      liveRegions.forEach(region => {
        expect(region).toHaveAttribute(
          'aria-live',
          expect.stringMatching(/polite|assertive/)
        );
      });
    });

    it('should announce form errors', async () => {
      const user = userEvent.setup();
      render(<Form />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('should meet WCAG AA contrast ratios', async () => {
      const { container } = render(<App />);
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Management', () => {
    it('should trap focus in modals', async () => {
      const user = userEvent.setup();
      render(<Modal isOpen={true} onClose={() => {}} />);

      const firstButton = screen.getAllByRole('button')[0];
      const lastButton =
        screen.getAllByRole('button')[screen.getAllByRole('button').length - 1];

      firstButton.focus();

      // Tab to last element
      for (let i = 0; i < 10; i++) {
        await user.tab();
      }

      // Should cycle back to first
      expect(document.activeElement).toBe(firstButton);
    });

    it('should restore focus after modal closes', async () => {
      const user = userEvent.setup();
      const triggerButton = screen.getByRole('button', { name: /open modal/i });

      triggerButton.focus();
      await user.click(triggerButton);

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Focus should return to trigger
      expect(document.activeElement).toBe(triggerButton);
    });
  });

  describe('ARIA Landmarks', () => {
    it('should have all required landmarks', () => {
      render(<App />);

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('should have proper heading hierarchy', () => {
      render(<App />);

      const headings = screen.getAllByRole('heading');
      let prevLevel = 0;

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1));
        expect(level).toBeLessThanOrEqual(prevLevel + 1);
        prevLevel = level;
      });
    });
  });
});
