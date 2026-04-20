import { render } from '@testing-library/react';
import { SingularityMonitor } from '../SingularityMonitor';

describe('SingularityMonitor', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(<SingularityMonitor />);
    expect(getByTestId('page-singularity-monitor')).toBeInTheDocument();
  });
});
