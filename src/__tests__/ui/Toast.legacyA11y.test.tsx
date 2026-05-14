import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastContainer, createToastId, type ToastProps } from '@/ui/components';

describe('Legacy Toast accessibility', () => {
  it('renders the legacy toast container as a named region', () => {
    const onRemove = vi.fn();
    const toasts: ToastProps[] = [
      {
        id: createToastId(),
        message: 'Notification de test',
      },
    ];

    render(<ToastContainer toasts={toasts} onRemove={onRemove} />);

    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Notification de test');
  });
});