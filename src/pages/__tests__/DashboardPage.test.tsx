import { render } from '@testing-library/react';
import { DashboardPage } from '../DashboardPage';
import { AnimationProvider } from '@/contexts/AnimationContext';

describe('DashboardPage', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(
      <AnimationProvider>
        <DashboardPage />
      </AnimationProvider>
    );
    expect(getByTestId('page-dashboard')).toBeInTheDocument();
  });
});
