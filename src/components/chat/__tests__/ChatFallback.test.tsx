import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatFallback } from '../ChatFallback';

const mockFallbackProps = {
  reason: 'empty-response' as const,
  traceId: 'trace-123',
  timestamp: new Date('2025-02-01T10:00:00Z').getTime(),
  provider: 'ollama',
  mode: 'chat',
  pipelineState: 'idle',
  onRetry: vi.fn(),
  onChangeProvider: vi.fn(),
  onCopyDiagnostic: vi.fn(),
};

describe('ChatFallback Component', () => {
  describe('Rendering', () => {
    it('should render with empty-response reason', () => {
      render(<ChatFallback {...mockFallbackProps} />);
      expect(screen.getByText(/réponse vide reçue/i)).toBeInTheDocument();
    });

    it('should display all fallback reasons', () => {
      const reasons: Array<
        | 'empty-response'
        | 'timeout'
        | 'aborted'
        | 'backend-down'
        | 'network-error'
        | 'unknown'
      > = [
        'empty-response',
        'timeout',
        'aborted',
        'backend-down',
        'network-error',
        'unknown',
      ];

      reasons.forEach(reason => {
        const { unmount } = render(
          <ChatFallback {...mockFallbackProps} reason={reason} />
        );
        expect(screen.getByRole('alert')).toBeInTheDocument();
        unmount();
      });
    });

    it('should display diagnostic information', () => {
      render(<ChatFallback {...mockFallbackProps} />);
      expect(screen.getByText(/trace id/i)).toBeInTheDocument();
      expect(screen.getByText('trace-123')).toBeInTheDocument();
    });

    it('should render CTA buttons', () => {
      render(<ChatFallback {...mockFallbackProps} />);
      expect(screen.getByLabelText(/réessayer la génération/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/changer de provider/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/copier le diagnostic/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have alert role', () => {
      const { container } = render(<ChatFallback {...mockFallbackProps} />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('should have aria-live assertive', () => {
      const { container } = render(<ChatFallback {...mockFallbackProps} />);
      const alert = container.querySelector('[aria-live="assertive"]');
      expect(alert).toBeInTheDocument();
    });

    it('should have aria-label on all buttons', () => {
      render(<ChatFallback {...mockFallbackProps} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-hidden on icons', () => {
      const { container } = render(<ChatFallback {...mockFallbackProps} />);
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('should call onRetry when Retry button clicked', () => {
      const onRetry = vi.fn();
      render(<ChatFallback {...mockFallbackProps} onRetry={onRetry} />);
      const retryButton = screen.getByLabelText(/réessayer la génération/i);
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });

    it('should call onChangeProvider when Change Provider clicked', () => {
      const onChangeProvider = vi.fn();
      render(<ChatFallback {...mockFallbackProps} onChangeProvider={onChangeProvider} />);
      const changeButton = screen.getByLabelText(/changer de provider/i);
      fireEvent.click(changeButton);
      expect(onChangeProvider).toHaveBeenCalled();
    });

    it('should call onCopyDiagnostic when Copy Diagnostic clicked', () => {
      const onCopyDiagnostic = vi.fn();
      render(<ChatFallback {...mockFallbackProps} onCopyDiagnostic={onCopyDiagnostic} />);
      const copyButton = screen.getByLabelText(/copier le diagnostic/i);
      fireEvent.click(copyButton);
      expect(onCopyDiagnostic).toHaveBeenCalled();
    });
  });

  describe('Diagnostic Display', () => {
    it('should display trace ID', () => {
      render(<ChatFallback {...mockFallbackProps} />);
      expect(screen.getByText('trace-123')).toBeInTheDocument();
    });

    it('should display timestamp', () => {
      render(<ChatFallback {...mockFallbackProps} />);
      const timestamp = screen.getByText(/2025-02-01|timestamp/i);
      expect(timestamp).toBeInTheDocument();
    });

    it('should display provider information', () => {
      render(<ChatFallback {...mockFallbackProps} />);
      const providers = screen.getAllByText(/ollama/i);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should display pipeline state', () => {
      render(<ChatFallback {...mockFallbackProps} />);
      const pipelines = screen.getAllByText(/idle/i);
      expect(pipelines.length).toBeGreaterThan(0);
    });
  });
});
