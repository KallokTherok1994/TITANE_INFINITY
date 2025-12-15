/**
 * TITANE∞ OS v24.7 - ControlPanel Toggle Component
 * Composant Toggle réutilisable pour les sections ControlPanel
 * Élimine ~200 lignes de duplication dans 4+ sections
 */

import React, { memo, useCallback } from 'react';

export interface ControlPanelToggleProps {
  /** État actuel du toggle */
  checked: boolean;
  /** Callback lors du changement */
  onChange: () => void;
  /** Titre affiché */
  title: string;
  /** Description optionnelle */
  description?: string;
  /** Label aria pour accessibilité (défaut: titre) */
  ariaLabel?: string;
  /** Désactiver le toggle */
  disabled?: boolean;
  /** Icône optionnelle (emoji ou composant) */
  icon?: React.ReactNode;
}

/**
 * Toggle accessible et optimisé pour ControlPanel
 *
 * @example
 * ```tsx
 * <ControlPanelToggle
 *   checked={config.enabled}
 *   onChange={() => toggleField('enabled')}
 *   title="Mode sécurisé"
 *   description="Activer les restrictions avancées"
 * />
 * ```
 */
export const ControlPanelToggle = memo(function ControlPanelToggle({
  checked,
  onChange,
  title,
  description,
  ariaLabel,
  disabled = false,
  icon,
}: ControlPanelToggleProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange();
      }
    },
    [onChange, disabled]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange();
    }
  }, [onChange, disabled]);

  return (
    <div className="cp-switch-row">
      <div className="cp-switch-label">
        <div className="cp-switch-title">
          {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
          {title}
        </div>
        {description && <div className="cp-switch-description">{description}</div>}
      </div>
      <div
        className={`cp-switch ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || `${title} - ${checked ? 'activé' : 'désactivé'}`}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <div className="cp-switch-thumb" />
      </div>
    </div>
  );
});

/**
 * Configuration pour une liste de toggles
 */
export interface ToggleConfig<K extends string = string> {
  key: K;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface ControlPanelToggleListProps<K extends string> {
  /** Configuration actuelle (objet avec clés booléennes) */
  config: { [P in K]: boolean };
  /** Liste des toggles à afficher */
  toggles: readonly ToggleConfig<K>[];
  /** Callback pour toggle un champ */
  onToggle: (key: K) => void;
  /** Désactiver tous les toggles */
  disabled?: boolean;
}

/**
 * Liste de toggles pour sections avec plusieurs options booléennes
 *
 * @example
 * ```tsx
 * const SECURITY_TOGGLES = [
 *   { key: 'enabled', title: 'Activer', description: '...' },
 *   { key: 'audit', title: 'Audit', description: '...' },
 * ] as const;
 *
 * <ControlPanelToggleList
 *   config={config}
 *   toggles={SECURITY_TOGGLES}
 *   onToggle={toggleField}
 * />
 * ```
 */
export function ControlPanelToggleList<K extends string>({
  config,
  toggles,
  onToggle,
  disabled = false,
}: ControlPanelToggleListProps<K>): React.ReactElement {
  return (
    <>
      {toggles.map(({ key, title, description, icon }) => (
        <ControlPanelToggle
          key={key}
          checked={config[key]}
          onChange={() => onToggle(key)}
          title={title}
          description={description}
          icon={icon}
          disabled={disabled}
        />
      ))}
    </>
  );
}

export default ControlPanelToggle;
