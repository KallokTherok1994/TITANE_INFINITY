/**
 * RuntimeSourceIndicator — compact inline indicator showing where data originates.
 * Use inside cards/panels to clarify: Tauri IPC / Static / Simulated / Cached.
 * Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46
 */
import React from 'react';

export type RuntimeSource =
  | 'TAURI_IPC'
  | 'STATIC'
  | 'SIMULATED'
  | 'CACHED'
  | 'FALLBACK'
  | 'HYBRID'
  | 'UNKNOWN';

interface RuntimeSourceIndicatorProps {
  source: RuntimeSource;
  label?: string;
  className?: string;
}

const SOURCE_META: Record<
  RuntimeSource,
  { label: string; colorClass: string; title: string }
> = {
  TAURI_IPC: {
    label: 'IPC',
    colorClass: 'text-emerald-400',
    title: 'Données temps réel — Tauri IPC',
  },
  STATIC: {
    label: 'STATIC',
    colorClass: 'text-slate-400',
    title: 'Données statiques — pas de backend',
  },
  SIMULATED: {
    label: 'SIM',
    colorClass: 'text-violet-400',
    title: 'Données simulées — aucun wiring backend réel',
  },
  CACHED: {
    label: 'CACHE',
    colorClass: 'text-amber-400',
    title: 'Données en cache — backend temporairement indisponible',
  },
  FALLBACK: {
    label: 'FALLBACK',
    colorClass: 'text-orange-400',
    title: 'Données de secours — backend indisponible',
  },
  HYBRID: {
    label: 'HYBRID',
    colorClass: 'text-sky-400',
    title: 'Données hybrides — mix IPC et statique',
  },
  UNKNOWN: {
    label: '?',
    colorClass: 'text-gray-500',
    title: 'Source de données inconnue',
  },
};

export function RuntimeSourceIndicator({
  source,
  label,
  className = '',
}: RuntimeSourceIndicatorProps) {
  const meta = SOURCE_META[source] ?? SOURCE_META.UNKNOWN;
  return (
    <span
      data-testid={`runtime-source-indicator-${source.toLowerCase()}`}
      className={`inline-flex items-center text-[10px] font-mono font-semibold tracking-widest opacity-60 ${meta.colorClass} ${className}`}
      title={meta.title}
      aria-label={meta.title}
    >
      {label ?? meta.label}
    </span>
  );
}
