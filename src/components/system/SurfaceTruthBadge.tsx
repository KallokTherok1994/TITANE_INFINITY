/**
 * SurfaceTruthBadge — displays the runtime truth class of a UI surface.
 * Shows: LIVE / PARTIAL / FALLBACK / DEGRADED / SIMULATED / DISPLAY_ONLY / UNKNOWN
 * Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46
 */
import React from 'react';

export type BadgeVariant =
  | 'LIVE'
  | 'PARTIAL'
  | 'FALLBACK'
  | 'DEGRADED'
  | 'SIMULATED'
  | 'DISPLAY_ONLY'
  | 'LEGACY'
  | 'NOT_WIRED'
  | 'ERROR'
  | 'UNKNOWN';

interface SurfaceTruthBadgeProps {
  /** The truth classification to display */
  variant: BadgeVariant;
  /** Optional override label */
  label?: string;
  /** Show full verbose label instead of short code */
  verbose?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const BADGE_META: Record<
  BadgeVariant,
  { label: string; verbose: string; colorClass: string; icon: string }
> = {
  LIVE: {
    label: 'LIVE',
    verbose: 'Live — backend connected',
    colorClass: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50',
    icon: '●',
  },
  PARTIAL: {
    label: 'PARTIAL',
    verbose: 'Partial — some backend, some static',
    colorClass: 'bg-amber-900/60 text-amber-300 border border-amber-700/50',
    icon: '◑',
  },
  FALLBACK: {
    label: 'FALLBACK',
    verbose: 'Fallback — backend unavailable, using cached/local data',
    colorClass: 'bg-orange-900/60 text-orange-300 border border-orange-700/50',
    icon: '⬦',
  },
  DEGRADED: {
    label: 'DEGRADED',
    verbose: 'Degraded — backend error, limited functionality',
    colorClass: 'bg-red-900/60 text-red-300 border border-red-700/50',
    icon: '▽',
  },
  SIMULATED: {
    label: 'SIMULATED',
    verbose: 'Simulated — UI only, no live backend wiring',
    colorClass: 'bg-violet-900/60 text-violet-300 border border-violet-700/50',
    icon: '◇',
  },
  DISPLAY_ONLY: {
    label: 'DISPLAY',
    verbose: 'Display only — static content, no backend',
    colorClass: 'bg-slate-800/60 text-slate-400 border border-slate-600/50',
    icon: '□',
  },
  LEGACY: {
    label: 'LEGACY',
    verbose: 'Legacy — deprecated surface, alias redirect only',
    colorClass: 'bg-zinc-800/60 text-zinc-400 border border-zinc-600/50',
    icon: '↩',
  },
  NOT_WIRED: {
    label: 'NOT WIRED',
    verbose: 'Not wired — no IPC commands connected',
    colorClass: 'bg-red-950/60 text-red-400 border border-red-800/50',
    icon: '✕',
  },
  ERROR: {
    label: 'ERROR',
    verbose: 'Error — surface health check failed',
    colorClass: 'bg-red-900/80 text-red-200 border border-red-600/80',
    icon: '!',
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    verbose: 'Unknown truth status — not yet classified',
    colorClass: 'bg-gray-800/60 text-gray-400 border border-gray-600/50',
    icon: '?',
  },
};

/**
 * v34.0.3 Living Pulse: variants non-LIVE pulsent visiblement (animate-pulse)
 * pour que toute dérive runtime soit immédiatement perceptible par l'utilisateur.
 * LIVE = calme (vert stable). DISPLAY_ONLY/LEGACY = calmes (intentionnels statiques).
 * Tout autre état (PARTIAL/DEGRADED/ERROR/FALLBACK/SIMULATED/NOT_WIRED/UNKNOWN) = pulse.
 */
const CALM_VARIANTS: ReadonlySet<BadgeVariant> = new Set<BadgeVariant>([
  'LIVE',
  'DISPLAY_ONLY',
  'LEGACY',
]);

export function SurfaceTruthBadge({
  variant,
  label,
  verbose = false,
  className = '',
}: SurfaceTruthBadgeProps) {
  const meta = BADGE_META[variant] ?? BADGE_META.UNKNOWN;
  const displayLabel = label ?? (verbose ? meta.verbose : meta.label);
  const isPulsing = !CALM_VARIANTS.has(variant);

  return (
    <span
      data-testid={`surface-truth-badge-${variant.toLowerCase()}`}
      data-pulsing={isPulsing ? 'true' : 'false'}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-mono font-semibold tracking-wide select-none shadow-sm ${
        isPulsing ? 'animate-pulse' : ''
      } ${meta.colorClass} ${className}`}
      title={meta.verbose}
      aria-label={`Surface truth status: ${meta.verbose}`}
      aria-live={isPulsing ? 'polite' : 'off'}
    >
      <span aria-hidden="true" className="opacity-90">
        {meta.icon}
      </span>
      {displayLabel}
    </span>
  );
}
