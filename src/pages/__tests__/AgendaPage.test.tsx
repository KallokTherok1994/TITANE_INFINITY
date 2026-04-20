import { render } from '@testing-library/react';
import { AgendaPage } from '../AgendaPage';

describe('AgendaPage', () => {
  it('renders without crashing and exposes data-testid', () => {
    const { getByTestId } = render(<AgendaPage />);
    expect(getByTestId('page-agenda')).toBeInTheDocument();
  });
});
