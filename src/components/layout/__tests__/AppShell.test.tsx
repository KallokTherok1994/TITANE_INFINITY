import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppShell } from '../AppShell';

describe('AppShell fullscreen shell', () => {
  it('keeps the main shell parent-bound under zoom changes', () => {
    const { container } = render(
      <AppShell topNav={<div>TopNav</div>}>
        <div>Content</div>
      </AppShell>
    );

    const shell = container.firstElementChild;
    const main = screen.getByRole('main');

    expect(shell).not.toBeNull();
    const shellStyle = shell?.getAttribute('style') ?? '';

    expect(shellStyle).toBe('');
    expect(main).toHaveStyle({
      paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))',
    });
  });
});
