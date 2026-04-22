import { render } from '@testing-library/react';
import PerformanceTest from '../PerformanceTest';

describe('PerformanceTest', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(<PerformanceTest />);
    expect(getByTestId('page-performance-test')).toBeInTheDocument();
  });
});
