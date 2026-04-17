import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppShell } from '../AppShell';

describe('AppShell zoom compensation', () => {
  it('compensates width and height with the canonical zoom css variable', () => {
    const { container } = render(
      <AppShell topNav={<div>TopNav</div>}>
        <div>Content</div>
      </AppShell>
    );

    const shell = container.firstElementChild;
    const main = screen.getByRole('main');

    expect(shell).not.toBeNull();
    const shellStyle = shell?.getAttribute('style') ?? '';

    expect(shellStyle).toContain('width: calc(100% / var(--titane-ui-scale, 1));');
    expect(shellStyle).toContain('max-width: calc(100% / var(--titane-ui-scale, 1));');
    expect(shellStyle).toContain('height: calc(100% / var(--titane-ui-scale, 1));');
    expect(shellStyle).toContain('min-height: calc(100% / var(--titane-ui-scale, 1));');
    expect(main).toHaveStyle({
      paddingTop: 'calc((4rem + env(safe-area-inset-top, 0px)) / var(--titane-ui-scale, 1))',
    });
  });
});