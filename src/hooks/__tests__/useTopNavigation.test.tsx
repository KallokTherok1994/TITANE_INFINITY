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

  it('keeps knowledge, creation and evolution routes synchronized with the TITANE top-level entry', () => {
    const { result } = renderHook(() => useTopNavigation(), { wrapper });

    const titaneEntry = result.current.topNavSections.find(
      section => section.id === 'titane'
    );

    expect(titaneEntry).toEqual(
      expect.objectContaining({
        id: 'titane',
        route: '/titane',
      })
    );
    expect(titaneEntry?.matchRoutes).toEqual(
      expect.arrayContaining(['/knowledge', '/creation', '/evolution'])
    );
  });

  it('keeps engine monitoring routes synchronized with the DEV top-level entry', () => {
    const { result } = renderHook(() => useTopNavigation(), { wrapper });

    const devEntry = result.current.topNavSections.find(section => section.id === 'dev');

    expect(devEntry).toEqual(
      expect.objectContaining({
        id: 'dev',
        route: '/dev',
      })
    );
    expect(devEntry?.matchRoutes).toEqual(
      expect.arrayContaining([
        '/singularity',
        '/sentinel',
        '/watchdog',
        '/selfheal',
        '/adaptive',
      ])
    );
  });
});
