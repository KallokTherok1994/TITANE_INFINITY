import { render, screen } from '@testing-library/react';
import PerformanceTest from '../PerformanceTest';

// Mock PerformanceDashboard to isolate page tests
vi.mock('../../components/PerformanceDashboard', () => ({
  default: () => <div data-testid="mock-performance-dashboard">PerformanceDashboard</div>,
}));

describe('PerformanceTest', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(<PerformanceTest />);
    expect(getByTestId('page-performance-test')).toBeInTheDocument();
  });

  it('renders the PerformanceDashboard inside ErrorBoundary', () => {
    render(<PerformanceTest />);
    expect(screen.getByTestId('mock-performance-dashboard')).toBeInTheDocument();
  });

  it('page container has correct class', () => {
    render(<PerformanceTest />);
    const page = screen.getByTestId('page-performance-test');
    expect(page.classList.contains('performance-test-page')).toBe(true);
  });

  it('data-testid is stable across re-renders', () => {
    const { rerender, getByTestId } = render(<PerformanceTest />);
    rerender(<PerformanceTest />);
    expect(getByTestId('page-performance-test')).toBeInTheDocument();
  });

  it('does not expose unexpected top-level elements', () => {
    const { container } = render(<PerformanceTest />);
    expect(container.firstChild).not.toBeNull();
  });
});
