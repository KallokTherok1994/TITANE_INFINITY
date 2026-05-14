/**
 * TITANE∞ — TimeBridgeStatusCard tests (TIME v3 Phase 7)
 *
 * Vérifie rendu des 5 data-testid + couverture des 4 états canoniques
 * (running, paused, offline, error).
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { TimeBridgeStatusCard } from '@/components/time/TimeBridgeStatusCard';
import type { TimeToTwinObserverStatus } from '@/services/temporal/timeToTwinObserver';

const baseStatus: TimeToTwinObserverStatus = {
  running: true,
  paused: false,
  lastPulseAt: Date.parse('2026-05-13T14:00:00Z'),
  lastError: null,
  totalPushed: 7,
  totalFailed: 0,
  consecutiveFailures: 0,
  currentBackoffMs: 60_000,
  intervalMs: 60_000,
};

describe('TimeBridgeStatusCard', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('rend les 5 data-testid canoniques', () => {
    render(<TimeBridgeStatusCard statusOverride={baseStatus} />);
    expect(screen.getByTestId('time-bridge-status')).toBeInTheDocument();
    expect(screen.getByTestId('time-bridge-running')).toBeInTheDocument();
    expect(screen.getByTestId('time-bridge-last-pulse')).toBeInTheDocument();
    expect(screen.getByTestId('time-bridge-pushed-count')).toBeInTheDocument();
    expect(screen.getByTestId('time-bridge-last-error')).toBeInTheDocument();
  });

  it('affiche "running" + timestamp + compteur + tiret erreur quand actif', () => {
    render(<TimeBridgeStatusCard statusOverride={baseStatus} />);
    expect(screen.getByTestId('time-bridge-running').textContent).toBe('running');
    expect(screen.getByTestId('time-bridge-last-pulse').textContent).toMatch(
      /2026-05-13 14:00:00/
    );
    expect(screen.getByTestId('time-bridge-pushed-count').textContent).toMatch(/^7/);
    expect(screen.getByTestId('time-bridge-last-error').textContent).toBe('—');
  });

  it('affiche "paused" quand status.paused=true', () => {
    render(<TimeBridgeStatusCard statusOverride={{ ...baseStatus, paused: true }} />);
    expect(screen.getByTestId('time-bridge-running').textContent).toBe('paused');
  });

  it('affiche "offline" quand running=false ou status null', () => {
    render(<TimeBridgeStatusCard statusOverride={null} />);
    expect(screen.getByTestId('time-bridge-running').textContent).toBe('offline');
    expect(screen.getByTestId('time-bridge-last-pulse').textContent).toBe('—');
    expect(screen.getByTestId('time-bridge-pushed-count').textContent).toBe('0');
  });

  it('expose lastError + compteur d’erreurs quand échecs cumulés', () => {
    render(
      <TimeBridgeStatusCard
        statusOverride={{
          ...baseStatus,
          totalFailed: 3,
          lastError: 'IPC_DOWN',
          consecutiveFailures: 3,
          currentBackoffMs: 60_000,
        }}
      />
    );
    expect(screen.getByTestId('time-bridge-last-error').textContent).toBe('IPC_DOWN');
    expect(screen.getByTestId('time-bridge-pushed-count').textContent).toMatch(
      /erreurs: 3/
    );
  });
});
