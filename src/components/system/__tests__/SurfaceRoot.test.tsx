import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SurfaceRoot } from '@/components/system/SurfaceRoot';

describe('SurfaceRoot', () => {
  it('renders children and exposes canonical data attributes', () => {
    vi.stubGlobal('__APP_VERSION__', '35.1.7');
    vi.stubGlobal('__BUILD_TIMESTAMP__', '2026-05-16T00:00:00.000Z');

    render(
      <SurfaceRoot id="test-surface" ring="core">
        <div data-testid="inner-child">inner child</div>
      </SurfaceRoot>
    );

    const root = screen.getByTestId('surface-root');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-surface-truth', 'test-surface');
    expect(root).toHaveAttribute('data-surface-ring', 'core');
    expect(root).toHaveAttribute('data-app-version', '35.1.7');
    expect(root).toHaveAttribute('data-build-timestamp', '2026-05-16T00:00:00.000Z');
    expect(screen.getByTestId('inner-child')).toBeInTheDocument();
  });
});
