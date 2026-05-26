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
    expect(screen.getAllByText(/QWEN.*(Dev|Coder)|qwen3\.5/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('total-dev-chat-messages')).toHaveAttribute(
      'aria-label',
      'Historique des messages TOTAL_DEV'
    );
    expect(screen.getByTestId('total-dev-chat-messages')).toHaveAttribute(
      'tabindex',
      '0'
    );
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

  it('exposes a read-only git panel and removes write actions', async () => {
    secureInvokeMock
      .mockResolvedValueOnce({
        lock_state: 'UNLOCKED',
        expires_at_unix: 1712271600,
        now_unix: 1712268000,
      })
      .mockResolvedValueOnce({
        ok: true,
        content: 'On branch MAIN\n',
        exit_code: 0,
        op: 'status',
      });

    await act(async () => {
      renderTotalDevPage();
    });

    await act(async () => {
      fireEvent.click(await screen.findByTestId('total-dev-tab-git'));
    });

    expect(await screen.findByTestId('total-dev-git-readonly-note')).toHaveTextContent(
      /read-only gouvernee/i
    );
    expect(screen.queryByRole('button', { name: /git add/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /commit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /push head/i })).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('total-dev-git-status'));
    });

    expect(secureInvokeMock).toHaveBeenNthCalledWith(2, TAURI_COMMANDS.TOTAL_DEV_GIT_OP, {
      op: 'status',
      args: [],
    });
  });

  it('exposes fixed Ollama DEV certification profiles without free shell input', async () => {
    secureInvokeMock
      .mockResolvedValueOnce({
        lock_state: 'UNLOCKED',
        expires_at_unix: 1712271600,
        now_unix: 1712268000,
      })
      .mockResolvedValueOnce({
        ok: true,
        profile_id: 'ollama-global-awareness',
        status: 'PASS',
        command: 'pnpm run verify:ollama:dev:global-awareness',
        exit_code: 0,
        duration_ms: 1200,
        output_tail: 'PASS: OLLAMA_DEV_AWARENESS_MANIFEST\nPASS: GLOBAL_REPO_GATES_PASS',
        artifact_paths: [
          'reports/ollama-dev-awareness/latest.json',
          'reports/ollama-dev-awareness/latest.md',
        ],
      });

    await act(async () => {
      renderTotalDevPage();
    });

    await act(async () => {
      fireEvent.click(await screen.findByTestId('total-dev-tab-certification'));
    });

    expect(await screen.findByTestId('total-dev-certification-panel')).toBeVisible();
    expect(screen.getByTestId('ollama-dev-model-status')).toHaveTextContent(
      /qwen3\.5:9b/
    );
    expect(screen.getByTestId('ollama-product-boundary-status')).toHaveTextContent(
      /gemma2:2b/
    );
    expect(
      screen.queryByPlaceholderText(/pnpm run|cargo check|commande/i)
    ).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(
        screen.getByTestId('total-dev-certification-profile-ollama-global-awareness')
      );
    });

    expect(secureInvokeMock).toHaveBeenNthCalledWith(
      2,
      TAURI_COMMANDS.TOTAL_DEV_RUN_CERTIFICATION_PROFILE,
      { profileId: 'ollama-global-awareness' }
    );
    expect(await screen.findByTestId('total-dev-certification-output')).toHaveTextContent(
      /PASS: OLLAMA_DEV_AWARENESS_MANIFEST/
    );
  });
});
