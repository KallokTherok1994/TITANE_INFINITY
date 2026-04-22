import { render } from '@testing-library/react';
import CloudCenter from '../CloudCenter';

describe('CloudCenter', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(<CloudCenter />);
    expect(getByTestId('page-cloud-center')).toBeInTheDocument();
  });
});
