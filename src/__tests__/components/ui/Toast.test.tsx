/**
 * Tests pour Toast/ToastContainer Components
 * Coverage: Affichage, Types, Actions, Auto-dismiss
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ToastContainer, toast } from '@/components/ui';

describe('Toast/ToastContainer Components', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('ToastContainer Rendering', () => {
    it('should render toast container', () => {
      const { container } = render(<ToastContainer />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Toast Display', () => {
    it('should show toast message', async () => {
      render(<ToastContainer />);

      toast('Test message');

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should show success toast', async () => {
      render(<ToastContainer />);

      toast.success('Success message');

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
    });

    it('should show error toast', async () => {
      render(<ToastContainer />);

      toast.error('Error message');

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });

    it('should show warning toast', async () => {
      render(<ToastContainer />);

      toast.warning('Warning message');

      await waitFor(() => {
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });
  });

  describe('Toast with Title', () => {
    it('should display toast with title and description', async () => {
      render(<ToastContainer />);

      toast('Description', { title: 'Title' });

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after duration', async () => {
      vi.useFakeTimers();
      render(<ToastContainer />);

      toast('Auto-dismiss', { duration: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Auto-dismiss')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('Auto-dismiss')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Multiple Toasts', () => {
    it('should show multiple toasts', async () => {
      render(<ToastContainer />);

      toast('Toast 1');
      toast('Toast 2');

      await waitFor(() => {
        expect(screen.getByText('Toast 1')).toBeInTheDocument();
        expect(screen.getByText('Toast 2')).toBeInTheDocument();
      });
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<ToastContainer />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
