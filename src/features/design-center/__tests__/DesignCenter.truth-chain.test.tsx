import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DesignCenterPage } from '@/features/design-center/DesignCenterPage';
import { tauriClient } from '@/lib/tauriClient';
import {
  DEFAULT_UI_THEME_TOKENS,
  type UIThemeTokens,
} from '@/features/design-center/types/designCenter.types';
import { contrastRatio } from '@/features/design-center/utils/contrast';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    loadUiTheme: vi.fn(),
    saveUiTheme: vi.fn(),
    resetUiTheme: vi.fn(),
  },
}));

function makeTokens(overrides?: Partial<UIThemeTokens>): UIThemeTokens {
  const base: UIThemeTokens = JSON.parse(JSON.stringify(DEFAULT_UI_THEME_TOKENS));
  return {
    ...base,
    ...overrides,
    colors: {
      ...base.colors,
      ...overrides?.colors,
    },
    typography: {
      ...base.typography,
      ...overrides?.typography,
    },
    spacing: {
      ...base.spacing,
      ...overrides?.spacing,
    },
    borders: {
      ...base.borders,
      ...overrides?.borders,
    },
    animations: {
      ...base.animations,
      ...overrides?.animations,
    },
    contrast: {
      ...base.contrast,
      ...overrides?.contrast,
    },
    shadows: {
      ...base.shadows,
      ...overrides?.shadows,
    },
  };
}

describe('Design Center truth chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tauriClient.loadUiTheme).mockResolvedValue(makeTokens());
    vi.mocked(tauriClient.saveUiTheme).mockResolvedValue(undefined);
    vi.mocked(tauriClient.resetUiTheme).mockResolvedValue(makeTokens());
    document.documentElement.removeAttribute('class');
    document.documentElement.removeAttribute('style');
  });

  it('shows truthful runtime status and transitions to dirty state on token edit', async () => {
    render(<DesignCenterPage />);

    await screen.findByTestId('design-status-runtime-active');

    const accentInput = await screen.findByTestId('design-color-accent');
    fireEvent.change(accentInput, { target: { value: '#112233' } });

    await screen.findByTestId('design-status-dirty');

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue('--color-accent').trim()
      ).toBe('#112233');
    });

    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }));

    await waitFor(() => {
      expect(tauriClient.saveUiTheme).toHaveBeenCalled();
    });

    expect(screen.getByTestId('design-status-runtime-active')).toBeInTheDocument();
  });

  it('never shows runtime-active badge when runtime load failed', async () => {
    vi.mocked(tauriClient.loadUiTheme).mockRejectedValueOnce(new Error('load failed'));

    render(<DesignCenterPage />);

    const fallbackBadge = await screen.findByTestId('design-status-fallback');
    expect(fallbackBadge).toBeInTheDocument();
    expect(screen.queryByTestId('design-status-runtime-active')).not.toBeInTheDocument();
  });

  it('certifies tab chain with ARIA linkage and keyboard navigation', async () => {
    render(<DesignCenterPage />);

    const tablist = await screen.findByRole('tablist', { name: /design center tabs/i });
    expect(tablist).toBeInTheDocument();

    const designTab = screen.getByRole('tab', { name: /design system/i });
    const appearanceTab = screen.getByRole('tab', { name: /apparence/i });

    expect(designTab).toHaveAttribute('aria-selected', 'true');
    expect(appearanceTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(appearanceTab);
    expect(appearanceTab).toHaveAttribute('aria-selected', 'true');

    const appearancePanel = screen.getByTestId('design-panel-appearance');
    expect(appearancePanel).toHaveAttribute('role', 'tabpanel');
    expect(appearancePanel).toHaveAttribute('aria-labelledby', 'dc-tab-appearance');

    appearanceTab.focus();
    fireEvent.keyDown(appearanceTab, { key: 'ArrowLeft' });

    expect(designTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('design-panel-design-system')).toHaveAttribute(
      'aria-labelledby',
      'dc-tab-design-system'
    );
  });

  it('applies tokens to legacy/global aliases for visible shell impact', async () => {
    const runtimeTokens = makeTokens({
      colors: {
        ...DEFAULT_UI_THEME_TOKENS.colors,
        background: '#101820',
        surface: '#202830',
        surfaceElevated: '#303840',
        text: '#f0f2f4',
        textMuted: '#b0b7bd',
        accent: '#44aa88',
        border: '#4a4f55',
        borderFocus: '#7a8088',
      },
    });

    vi.mocked(tauriClient.loadUiTheme).mockResolvedValueOnce(runtimeTokens);

    render(<DesignCenterPage />);

    await screen.findByTestId('design-status-runtime-active');

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue('--color-bg-primary').trim()
      ).toBe('#101820');
      expect(document.documentElement.style.getPropertyValue('--background').trim()).toBe(
        '#101820'
      );
      expect(
        document.documentElement.style.getPropertyValue('--color-bg-secondary').trim()
      ).toBe('#202830');
      expect(document.documentElement.style.getPropertyValue('--surface').trim()).toBe(
        '#202830'
      );
      expect(document.documentElement.style.getPropertyValue('--text-primary').trim()).toBe(
        '#f0f2f4'
      );
      expect(
        document.documentElement.style.getPropertyValue('--admin-bg-start').trim()
      ).toBe('#101820');
      expect(
        document.documentElement.style.getPropertyValue('--badge-accent-color').trim()
      ).toBe('#44aa88');
    });
  });

  it('auto-corrects unreadable white-on-white combinations to maintain contrast', async () => {
    const unreadableTokens = makeTokens({
      colors: {
        ...DEFAULT_UI_THEME_TOKENS.colors,
        background: '#ffffff',
        surface: '#ffffff',
        surfaceElevated: '#ffffff',
        text: '#ffffff',
        textMuted: '#ffffff',
      },
    });

    vi.mocked(tauriClient.loadUiTheme).mockResolvedValueOnce(unreadableTokens);

    render(<DesignCenterPage />);

    await screen.findByTestId('design-status-runtime-active');

    await waitFor(() => {
      const runtimeText = document.documentElement.style
        .getPropertyValue('--text-primary')
        .trim();
      const runtimeBg = document.documentElement.style.getPropertyValue('--background').trim();

      expect(runtimeText.toLowerCase()).not.toBe('#ffffff');
      expect(contrastRatio(runtimeText, runtimeBg)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('restores persisted tokens after reload sequence', async () => {
    const initialTokens = makeTokens();
    const persistedTokens = makeTokens({
      colors: {
        ...DEFAULT_UI_THEME_TOKENS.colors,
        primary: '#334455',
      },
    });

    vi.mocked(tauriClient.loadUiTheme)
      .mockResolvedValueOnce(initialTokens)
      .mockResolvedValueOnce(persistedTokens);

    const firstRender = render(<DesignCenterPage />);
    await firstRender.findByTestId('design-status-runtime-active');

    fireEvent.change(firstRender.getByTestId('design-color-primary'), {
      target: { value: '#334455' },
    });
    fireEvent.click(firstRender.getByRole('button', { name: /sauvegarder/i }));

    await waitFor(() => {
      expect(tauriClient.saveUiTheme).toHaveBeenCalled();
    });

    firstRender.unmount();

    render(<DesignCenterPage />);
    await screen.findByTestId('design-status-runtime-active');

    const reloadedPrimaryInput = screen.getByTestId(
      'design-color-primary'
    ) as HTMLInputElement;
    expect(reloadedPrimaryInput.value.toLowerCase()).toBe('#334455');
    expect(tauriClient.loadUiTheme).toHaveBeenCalledTimes(2);
  });
});
