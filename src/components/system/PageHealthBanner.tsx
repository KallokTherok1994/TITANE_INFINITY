/**
 * PageHealthBanner — top-of-page banner for surfaces that require honest status disclosure.
 * Required on: SIMULATED_UI, DISPLAY_ONLY, ACTIVE_FALLBACK, ACTIVE_DEGRADED surfaces.
 * Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46
 */
import React from 'react';
import { SurfaceTruthBadge, BadgeVariant } from './SurfaceTruthBadge';

export interface PageHealthBannerProps {
  /** Surface route path (for testid scoping) */
  route: string;
  /** Badge variant to show */
  variant: BadgeVariant;
  /** Short explanation shown to users */
  message: string;
  /** Optional: link to doc or more context */
  learnMoreHref?: string;
  /** Whether to show a dismiss button (non-critical banners only) */
  dismissible?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const BANNER_COLORS: Record<BadgeVariant, string> = {
  LIVE: 'bg-emerald-950/40 border-emerald-800/30 text-emerald-300',
  PARTIAL: 'bg-amber-950/40 border-amber-800/30 text-amber-200',
  FALLBACK: 'bg-orange-950/40 border-orange-800/30 text-orange-200',
  DEGRADED: 'bg-red-950/40 border-red-800/30 text-red-200',
  SIMULATED: 'bg-violet-950/50 border-violet-700/40 text-violet-200',
  DISPLAY_ONLY:
    'bg-titanium-bg-base/40 border-titanium-border-default/30 text-titanium-text-secondary',
  LEGACY: 'bg-zinc-900/40 border-zinc-700/30 text-zinc-300',
  NOT_WIRED: 'bg-red-950/50 border-red-800/40 text-red-300',
  ERROR: 'bg-red-900/60 border-red-700/60 text-red-100',
  UNKNOWN:
    'bg-titanium-bg-base/40 border-titanium-border-default/30 text-titanium-text-secondary',
};

export function PageHealthBanner({
  route,
  variant,
  message,
  learnMoreHref,
  dismissible = false,
  className = '',
}: PageHealthBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  const slug = route.replace(/\//g, '-').replace(/^-/, '');
  const colorClass = BANNER_COLORS[variant] ?? BANNER_COLORS.UNKNOWN;

  return (
    <div
      data-testid={`page-health-banner-${slug}`}
      className={`flex items-center gap-3 px-4 py-2 border-b text-sm ${colorClass} ${className}`}
      role="status"
      aria-live="polite"
    >
      <SurfaceTruthBadge variant={variant} />
      <span className="flex-1 opacity-90">{message}</span>
      {learnMoreHref && (
        <a
          href={learnMoreHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline opacity-70 hover:opacity-100 text-xs"
          data-testid={`page-health-banner-learn-more-${slug}`}
        >
          En savoir plus
        </a>
      )}
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 opacity-50 hover:opacity-80 text-xs"
          aria-label="Fermer le bandeau de statut"
          data-testid={`page-health-banner-dismiss-${slug}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}
