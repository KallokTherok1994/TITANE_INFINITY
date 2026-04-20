import { render } from '@testing-library/react';
import { DashboardPage } from '../DashboardPage';

describe('DashboardPage', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(<DashboardPage />);
    expect(getByTestId('page-dashboard')).toBeInTheDocument();
  });
});
