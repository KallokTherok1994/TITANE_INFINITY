/**
 * TITANE_INFINITY v34.2.0 — QueryPilotsLiveStatus
 *
 * Additive runtime widget that demonstrates the 5 TanStack Query pilot hooks
 * (system, engines, providers, conversation, devtools) on real Tauri IPC.
 * Mounted in MonitoringDashboard as a transparent live strip. No replacement of
 * existing Zustand-driven surfaces — strict additive adoption.
 *
 * Surface ID: `query-pilots-live-status`
 * Pilot tiles: data-testid `query-pilot-<id>` where id ∈
 *   system-health | engines-status | providers-status | conversation-health | devtools-memory-health
 *
 * Each tile renders one of three states:
 *   - loading   → spinner placeholder
 *   - error     → red badge with short error message
 *   - success   → green dot + last fetch timestamp
 */
import React from 'react';
import {
  useSystemHealthQuery,
  useEnginesStatusQuery,
  useProvidersStatusQuery,
  useConversationHealthQuery,
  useDevtoolsMemoryHealthQuery,
} from '../../hooks/queries';

type PilotState = 'loading' | 'success' | 'error' | 'idle';

interface PilotTileProps {
  id: string;
  label: string;
  state: PilotState;
  updatedAt?: number;
  errorMessage?: string;
}

function deriveState(args: { isLoading: boolean; isError: boolean; isSuccess: boolean }): PilotState {
  if (args.isError) return 'error';
  if (args.isSuccess) return 'success';
  if (args.isLoading) return 'loading';
  return 'idle';
}

function PilotTile({ id, label, state, updatedAt, errorMessage }: PilotTileProps) {
  const dotClass =
    state === 'success'
      ? 'bg-emerald-400'
      : state === 'error'
        ? 'bg-rose-500'
        : state === 'loading'
          ? 'bg-amber-300 animate-pulse'
          : 'bg-slate-500';

  const stateLabel =
    state === 'success'
      ? 'live'
      : state === 'error'
        ? `error: ${errorMessage ?? 'unknown'}`
        : state === 'loading'
          ? 'fetching…'
          : 'idle';

  const updatedText =
    state === 'success' && typeof updatedAt === 'number' && updatedAt > 0
      ? new Date(updatedAt).toLocaleTimeString()
      : '—';

  return (
    <div
      data-testid={`query-pilot-${id}`}
      data-state={state}
      className="flex items-center justify-between rounded-md border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-xs text-slate-200"
    >
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">{stateLabel}</span>
        <span className="text-slate-500" data-testid={`query-pilot-${id}-updated`}>
          {updatedText}
        </span>
      </div>
    </div>
  );
}

export function QueryPilotsLiveStatus(): React.ReactElement {
  const system = useSystemHealthQuery();
  const engines = useEnginesStatusQuery();
  const providers = useProvidersStatusQuery();
  const conversation = useConversationHealthQuery();
  const devtools = useDevtoolsMemoryHealthQuery();

  const pilots: PilotTileProps[] = [
    {
      id: 'system-health',
      label: 'System health',
      state: deriveState(system),
      updatedAt: system.dataUpdatedAt,
      errorMessage: system.error?.message,
    },
    {
      id: 'engines-status',
      label: 'Engines status',
      state: deriveState(engines),
      updatedAt: engines.dataUpdatedAt,
      errorMessage: engines.error?.message,
    },
    {
      id: 'providers-status',
      label: 'Providers status',
      state: deriveState(providers),
      updatedAt: providers.dataUpdatedAt,
      errorMessage: providers.error?.message,
    },
    {
      id: 'conversation-health',
      label: 'Conversation health',
      state: deriveState(conversation),
      updatedAt: conversation.dataUpdatedAt,
      errorMessage: conversation.error?.message,
    },
    {
      id: 'devtools-memory-health',
      label: 'Devtools memory',
      state: deriveState(devtools),
      updatedAt: devtools.dataUpdatedAt,
      errorMessage: devtools.error?.message,
    },
  ];

  return (
    <section
      data-testid="query-pilots-live-status"
      aria-label="TanStack Query pilots live status"
      className="rounded-lg border border-slate-800 bg-slate-900/30 p-4"
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          TanStack Query pilots <span className="text-slate-500 font-normal">(v34.2.0)</span>
        </h2>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          additive — read-only
        </span>
      </header>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {pilots.map((p) => (
          <PilotTile key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}

export default QueryPilotsLiveStatus;
