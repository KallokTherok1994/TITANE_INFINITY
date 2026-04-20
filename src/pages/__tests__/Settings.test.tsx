import { render } from '@testing-library/react';
import { Settings } from '../Settings';

describe('Settings page', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(<Settings />);
    expect(getByTestId('page-settings')).toBeInTheDocument();
  });
});
