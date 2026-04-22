import { render } from '@testing-library/react';
import CameraPage from '../CameraPage';

describe('CameraPage', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(<CameraPage />);
    expect(getByTestId('page-camera')).toBeInTheDocument();
  });
});
