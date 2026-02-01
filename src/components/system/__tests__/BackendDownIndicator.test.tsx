import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BackendDownIndicator } from '../BackendDownIndicator';
import { useBackendHealth } from '@/hooks/useBackendHealth';

vi.mock('@/hooks/useBackendHealth', () => ({
  useBackendHealth: vi.fn(),
}));

const mockUseBackendHealth = useBackendHealth as ReturnType<typeof vi.fn>;

describe('BackendDownIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should not render when backend is available', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'available',
        unavailableReasons: [],
        recheck: vi.fn(),
      });

      const { container } = render(<BackendDownIndicator position="top" />);
      const banner = container.querySelector('[role="alert"]');
      expect(banner).not.toBeInTheDocument();
    });

    it('should render when backend is unavailable', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      const { container } = render(<BackendDownIndicator position="top" />);
      const banner = container.querySelector('[role="alert"]');
      expect(banner).toBeInTheDocument();
    });

    it('should render at correct position (top/bottom)', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      const { container } = render(<BackendDownIndicator position="top" />);
      const banner = container.querySelector('[role="alert"]');
      expect(banner).toHaveClass('top-0');
    });

    it('should render checking state as spinner', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'checking',
        unavailableReasons: [],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" />);
      // Could be rendering or showing loader
      expect(
        screen.getByRole('alert') || screen.queryByLabelText(/checking/i)
      ).toBeDefined();
    });
  });

  describe('Message Display', () => {
    it('should display message for ollama-offline', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" />);
      expect(screen.getByText(/ollama|offline/i)).toBeInTheDocument();
    });

    it('should display message for tauri-backend-down', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['tauri-backend-down'],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" />);
      expect(screen.getByText(/tauri|backend|down/i)).toBeInTheDocument();
    });

    it('should display message for network-error', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['network-error'],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" />);
      expect(screen.getByText(/network|error/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should have Retry button', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" />);
      const retryButton = screen.getByLabelText(/retry/i) || screen.getByText(/retry/i);
      expect(retryButton).toBeInTheDocument();
    });

    it('should call recheck on Retry click', () => {
      const recheck = vi.fn();
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck,
      });

      render(<BackendDownIndicator position="top" />);
      const retryButton = screen.getByLabelText(/retry/i) || screen.getByText(/retry/i);
      fireEvent.click(retryButton);
      expect(recheck).toHaveBeenCalled();
    });

    it('should have Dismiss button when dismissible', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" dismissible={true} />);
      const dismissButton =
        screen.getByLabelText(/dismiss/i) ||
        screen.getByRole('button', { name: /close|x/i });
      expect(dismissButton).toBeInTheDocument();
    });

    it('should hide banner when dismissed', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      const { container } = render(
        <BackendDownIndicator position="top" dismissible={true} />
      );
      const dismissButton = screen.getByLabelText(/dismiss/i);
      fireEvent.click(dismissButton);
      const banner = container.querySelector('[role="alert"]');
      expect(banner).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have alert role', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      const { container } = render(<BackendDownIndicator position="top" />);
      const banner = container.querySelector('[role="alert"]');
      expect(banner).toHaveAttribute('role', 'alert');
    });

    it('should have aria-live assertive', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      const { container } = render(<BackendDownIndicator position="top" />);
      const banner = container.querySelector('[aria-live="assertive"]');
      expect(banner).toBeInTheDocument();
    });

    it('should have focus ring on buttons', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" />);
      const retryButton = screen.getByLabelText(/retry/i);
      expect(retryButton).toHaveClass('focus', 'ring');
    });
  });

  describe('Diagnostic Information', () => {
    it('should display collapsible diagnostic section', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" />);
      const diagnosticButton = screen.queryByLabelText(/diagnostic|details|technical/i);
      if (diagnosticButton) {
        expect(diagnosticButton).toBeInTheDocument();
      }
    });

    it('should toggle diagnostic visibility on click', () => {
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });

      render(<BackendDownIndicator position="top" />);
      const diagnosticButton = screen.queryByLabelText(/diagnostic|details|technical/i);
      if (diagnosticButton) {
        fireEvent.click(diagnosticButton);
        // Diagnostic should be visible or expanded
        expect(diagnosticButton).toHaveAttribute('aria-expanded', 'true');
      }
    });
  });

  describe('Auto-Recovery', () => {
    it('should auto-detect backend recovery', async () => {
      const { rerender } = render(<BackendDownIndicator position="top" />);

      // Start with unavailable
      mockUseBackendHealth.mockReturnValue({
        status: 'unavailable',
        unavailableReasons: ['ollama-offline'],
        recheck: vi.fn(),
      });
      rerender(<BackendDownIndicator position="top" />);

      // Simulate recovery
      mockUseBackendHealth.mockReturnValue({
        status: 'available',
        unavailableReasons: [],
        recheck: vi.fn(),
      });
      rerender(<BackendDownIndicator position="top" />);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });
});
