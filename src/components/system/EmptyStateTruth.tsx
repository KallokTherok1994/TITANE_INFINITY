/**
 * TITANE∞ — EmptyStateTruth
 * Canonical empty/degraded/blocked state component.
 * Communicates WHY data is absent — never silently empty.
 */

import React from 'react';

export type EmptyStateReason =
  | 'no_data_yet'
  | 'loading'
  | 'backend_unavailable'
  | 'provider_missing'
  | 'permission_required'
  | 'curated_data'
  | 'feature_not_implemented'
  | 'external_service_required'
  | 'degraded';

interface EmptyStateTruthProps {
  reason: EmptyStateReason;
  title?: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const REASON_DEFAULTS: Record<EmptyStateReason, { icon: string; title: string; description: string }> = {
  no_data_yet: {
    icon: '📭',
    title: 'Aucune donnée pour l\'instant',
    description: 'Aucune donnée n\'est encore disponible pour cette section.',
  },
  loading: {
    icon: '⏳',
    title: 'Chargement en cours…',
    description: 'Les données sont en cours de récupération.',
  },
  backend_unavailable: {
    icon: '🔌',
    title: 'Service temporairement indisponible',
    description: 'Le service backend n\'est pas accessible. Vérifiez la connexion.',
  },
  provider_missing: {
    icon: '🔑',
    title: 'Fournisseur IA non configuré',
    description: 'Aucun fournisseur IA n\'est configuré ou disponible pour cette fonction.',
  },
  permission_required: {
    icon: '🔐',
    title: 'Autorisation requise',
    description: 'Des permissions supplémentaires sont nécessaires pour accéder à cette section.',
  },
  curated_data: {
    icon: '📋',
    title: 'Données exemples',
    description: 'Ces données sont des exemples curatés. Connectez vos sources réelles pour voir vos données personnelles.',
  },
  feature_not_implemented: {
    icon: '🚧',
    title: 'Fonctionnalité en développement',
    description: 'Cette fonctionnalité n\'est pas encore disponible dans la version actuelle.',
  },
  external_service_required: {
    icon: '🌐',
    title: 'Service externe requis',
    description: 'Cette section nécessite un service externe qui n\'est pas connecté.',
  },
  degraded: {
    icon: '⚠️',
    title: 'Mode dégradé',
    description: 'Cette section fonctionne en mode dégradé. Certaines données peuvent être manquantes.',
  },
};

export const EmptyStateTruth: React.FC<EmptyStateTruthProps> = ({
  reason,
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  const defaults = REASON_DEFAULTS[reason];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-lg border border-titanium-border-default bg-titanium-bg-elevated text-center ${className}`}
      data-testid="empty-state-truth"
      data-empty-reason={reason}
    >
      <div className="text-3xl" aria-hidden="true">
        {icon ?? defaults.icon}
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium text-titanium-text-primary">
          {title ?? defaults.title}
        </div>
        <div className="text-xs text-titanium-text-secondary max-w-xs">
          {description ?? defaults.description}
        </div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-1.5 text-xs font-medium rounded bg-titanium-bg-interactive text-titanium-accent-cool hover:opacity-80 transition-opacity"
          data-testid="empty-state-action"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Inline curated-data disclosure banner.
 * Use above hardcoded/example sections to communicate their status.
 */
export const CuratedDataBanner: React.FC<{ source?: string; className?: string }> = ({
  source,
  className = '',
}) => (
  <div
    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-amber-900/30 border border-amber-700/40 text-amber-300 ${className}`}
    data-testid="curated-data-banner"
    role="note"
    aria-label="Données exemples curatées"
  >
    <span aria-hidden="true">📋</span>
    <span>
      <strong>Données exemples</strong>
      {source ? ` — ${source}` : ' — Basé sur des habitudes types'}
      {'. '}
      <span className="opacity-75">Connectez vos sources réelles pour personnaliser.</span>
    </span>
  </div>
);
