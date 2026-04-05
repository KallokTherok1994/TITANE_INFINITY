import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TAURI_COMMANDS } from '@/core/commands/TAURI_COMMANDS';
import { TotalDevPage } from '@/pages/TotalDevPage';

const secureInvokeMock = vi.fn();

vi.mock('@/lib/security', () => ({
  secureInvoke: (...args: unknown[]) => secureInvokeMock(...args),
}));

function renderTotalDevPage() {
  return render(
    <MemoryRouter initialEntries={['/total-dev']}>
      <Routes>
        <Route path="/total-dev" element={<TotalDevPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TotalDevPage', () => {
  beforeEach(() => {
    secureInvokeMock.mockReset();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('falls back to LOCKED mode when session status returns browser fallback shape', async () => {
    secureInvokeMock.mockResolvedValueOnce({
      status: 'offline',
      available: false,
      error: 'Tauri not available (cached)',
      fallback: true,
      health: 'degraded',
    });

    await act(async () => {
      renderTotalDevPage();
    });

    expect(await screen.findByTestId('lock-badge')).toHaveTextContent('LOCKED');
    expect(screen.getByPlaceholderText(/token unlock/i)).toBeVisible();
    expect(screen.getAllByText(/QWEN-Coder/i).length).toBeGreaterThan(0);
    expect(secureInvokeMock).toHaveBeenNthCalledWith(
      1,
      TAURI_COMMANDS.TOTAL_DEV_SESSION_STATUS,
      {}
    );
  });

  it('shows unlocked tabs after a successful unlock response', async () => {
    secureInvokeMock
      .mockResolvedValueOnce({
        lock_state: 'LOCKED',
        expires_at_unix: null,
        now_unix: 1712268000,
      })
      .mockResolvedValueOnce({
        ok: true,
        expires_at_unix: 1712271600,
        lock_state: 'UNLOCKED',
      });

    await act(async () => {
      renderTotalDevPage();
    });

    const passwordInput = await screen.findByPlaceholderText(/token unlock/i);

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Kanele1994' } });
      fireEvent.click(screen.getByTestId('total-dev-unlock-btn'));
    });

    expect(await screen.findByTestId('total-dev-tab-console')).toBeVisible();
    expect(screen.getByTestId('lock-badge')).toHaveTextContent('UNLOCKED');
    expect(secureInvokeMock).toHaveBeenNthCalledWith(
      2,
      TAURI_COMMANDS.TOTAL_DEV_UNLOCK,
      expect.objectContaining({
        token: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
  });

  it('keeps the page locked and shows an error after a failed unlock response', async () => {
    secureInvokeMock
      .mockResolvedValueOnce({
        lock_state: 'LOCKED',
        expires_at_unix: null,
        now_unix: 1712268000,
      })
      .mockResolvedValueOnce({
        ok: false,
        expires_at_unix: undefined,
        lock_state: 'LOCKED',
        error: 'Token invalide',
      });

    await act(async () => {
      renderTotalDevPage();
    });

    const passwordInput = await screen.findByPlaceholderText(/token unlock/i);

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
      fireEvent.click(screen.getByTestId('total-dev-unlock-btn'));
    });

    expect(await screen.findByText('Token invalide')).toBeVisible();
    expect(screen.getByTestId('lock-badge')).toHaveTextContent('LOCKED');
    expect(screen.queryByTestId('total-dev-tab-console')).not.toBeInTheDocument();
    expect(secureInvokeMock).toHaveBeenNthCalledWith(
      2,
      TAURI_COMMANDS.TOTAL_DEV_UNLOCK,
      expect.objectContaining({
        token: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
  });
});
