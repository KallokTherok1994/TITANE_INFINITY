/**
 * TITANE∞ — TimeBridgeStatusCard (TIME v3 Phase 7)
 *
 * Surface UI observable du pont TIME → NumericTwin. Consomme
 * `getRuntimeTimeToTwinObserver().getStatus()` toutes les 5 s et
 * expose 5 `data-testid` stables pour gouvernance E2E / preuve runtime.
 *
 * - time-bridge-status      : conteneur racine
 * - time-bridge-running     : badge état (running | paused | offline)
 * - time-bridge-last-pulse  : timestamp ISO du dernier pulse
 * - time-bridge-pushed-count: compteur totalPushed
 * - time-bridge-last-error  : dernier message d'erreur (ou "—")
 */

import React, { useEffect, useState } from 'react';
import {
  getRuntimeTimeToTwinObserver,
  type TimeToTwinObserverStatus,
} from '@/services/temporal/timeToTwinObserver';

export interface TimeBridgeStatusCardProps {
  /** Période de polling du status (ms). Défaut 5 000. */
  pollMs?: number;
  /** Override status (tests). */
  statusOverride?: TimeToTwinObserverStatus | null;
}

function formatTimestamp(ts: number | null): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return '—';
  }
}

function renderRunningLabel(s: TimeToTwinObserverStatus | null): string {
  if (!s) return 'offline';
  if (!s.running) return 'offline';
  if (s.paused) return 'paused';
  return 'running';
}

function renderRunningTone(label: string): string {
  switch (label) {
    case 'running':
      return 'bg-success-700/40 text-success-100 border-success-600';
    case 'paused':
      return 'bg-amber-700/40 text-amber-200 border-amber-600';
    default:
      return 'bg-titanium-bg-interactive/40 text-titanium-text-secondary border-titanium-border-strong';
  }
}

export const TimeBridgeStatusCard: React.FC<TimeBridgeStatusCardProps> = ({
  pollMs = 5000,
  statusOverride,
}) => {
  const [status, setStatus] = useState<TimeToTwinObserverStatus | null>(() => {
    if (statusOverride !== undefined) return statusOverride;
    try {
      return getRuntimeTimeToTwinObserver().getStatus();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (statusOverride !== undefined) {
      setStatus(statusOverride);
      return undefined;
    }
    const read = () => {
      try {
        setStatus(getRuntimeTimeToTwinObserver().getStatus());
      } catch {
        setStatus(null);
      }
    };
    read();
    const id = setInterval(read, pollMs);
    return () => clearInterval(id);
  }, [pollMs, statusOverride]);

  const label = renderRunningLabel(status);
  const tone = renderRunningTone(label);

  return (
    <div
      data-testid="time-bridge-status"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-md border border-titanium-border-subtle bg-titanium-bg-base/40 p-3 text-xs text-titanium-text-secondary"
    >
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide text-titanium-text-tertiary">
          Pont TIME→Twin
        </span>
        <span
          data-testid="time-bridge-running"
          className={`mt-1 inline-flex w-fit items-center rounded border px-2 py-0.5 text-[11px] font-medium ${tone}`}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide text-titanium-text-tertiary">
          Dernier pulse
        </span>
        <span
          data-testid="time-bridge-last-pulse"
          className="mt-1 text-titanium-text-primary"
        >
          {formatTimestamp(status?.lastPulseAt ?? null)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide text-titanium-text-tertiary">
          Observations poussées
        </span>
        <span
          data-testid="time-bridge-pushed-count"
          className="mt-1 text-titanium-text-primary"
        >
          {status?.totalPushed ?? 0}
          {status && status.totalFailed > 0 ? (
            <span className="ml-1 text-amber-300">(erreurs: {status.totalFailed})</span>
          ) : null}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide text-titanium-text-tertiary">
          Dernière erreur
        </span>
        <span
          data-testid="time-bridge-last-error"
          className={`mt-1 truncate ${status?.lastError ? 'text-amber-200' : 'text-titanium-text-tertiary'}`}
          title={status?.lastError ?? ''}
        >
          {status?.lastError ?? '—'}
        </span>
      </div>
    </div>
  );
};

export default TimeBridgeStatusCard;
