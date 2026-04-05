import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModuleCard } from '@/components/ModuleCard';

describe('ModuleCard', () => {
  it('supports keyboard activation when interactive', () => {
    const onClick = vi.fn();

    render(<ModuleCard title="CPU Health" value={42} onClick={onClick} />);

    const card = screen.getByRole('button', { name: /cpu health/i });

    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(card).toHaveAttribute('tabindex', '0');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
