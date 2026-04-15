import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useTopNavigation } from '../useTopNavigation';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/titane']}>{children}</MemoryRouter>
);

describe('useTopNavigation', () => {
  it('keeps the dedicated TWINS menu entry routed to /twins', () => {
    const { result } = renderHook(() => useTopNavigation(), { wrapper });

    expect(result.current.topNavSections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'twins',
          route: '/twins',
        }),
      ])
    );

    expect(result.current.topNavItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'twins',
          route: '/twins',
        }),
      ])
    );
  });
});
