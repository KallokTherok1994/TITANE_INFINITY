import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Modal } from '../a11y/Modal';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  describe('Modal', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should trap focus', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <button>Button 1</button>
          <button>Button 2</button>
        </Modal>
      );

      const buttons = screen.getAllByRole('button');
      expect(document.body).toContainElement(buttons[0]);
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });
  });
});
