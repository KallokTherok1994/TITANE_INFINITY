/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React, { useState, useCallback, useMemo } from 'react';
import type {
  AutomationId,
  AutomationConfig,
  AutomationCategory,
  AutomationResult,
} from '../../services/automation/automations.config';
import {
  AUTOMATION_REGISTRY,
  canExecuteAutomation,
  calculateAutomationXP,
  CATEGORY_DISPLAY_ORDER,
  CATEGORY_LABELS,
  SECURITY_LEVEL_LABELS,
} from '../../services/automation/automations.config';
import type {
  ChatModeId,
  PermissionLevel,
  ToolPermissions,
} from '../../services/ai/chatModes.config';
import './AutomationPanel.css';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AutomationPanelProps {
  /** Mode de chat actuel */
  currentMode: ChatModeId;
  /** Niveau de permission actuel */
  permissionLevel: PermissionLevel;
  /** Outils disponibles */
  availableTools: Partial<ToolPermissions>;
  /** Callback lors de l'exécution d'une automation */
  onExecute?: (
    automationId: AutomationId,
    params: Record<string, unknown>
  ) => Promise<AutomationResult>;
  /** Fermer le panel */
  onClose?: () => void;
  /** Classe CSS additionnelle */
  className?: string;
  /** Compact mode (moins de détails) */
  compact?: boolean;
}

interface AutomationItemProps {
  automation: AutomationConfig;
  isAvailable: boolean;
  unavailableReason?: string;
  onExecute: (id: AutomationId) => void;
  isRunning: boolean;
  compact?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT: AutomationItem
// ─────────────────────────────────────────────────────────────────────────────

const AutomationItem: React.FC<AutomationItemProps> = ({
  automation,
  isAvailable,
  unavailableReason,
  onExecute,
  isRunning,
  compact = false,
}) => {
  const securityInfo = SECURITY_LEVEL_LABELS[automation.securityLevel];

  const handleClick = useCallback(() => {
    if (isAvailable && !isRunning) {
      onExecute(automation.id);
    }
  }, [automation.id, isAvailable, isRunning, onExecute]);

  return (
    <div
      className={`automation-item ${isAvailable ? 'available' : 'unavailable'} ${isRunning ? 'running' : ''} ${compact ? 'compact' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      title={unavailableReason || automation.description}
    >
      <div className="automation-item__icon">
        {isRunning ? (
          <span className="automation-spinner">⏳</span>
        ) : (
          <span>{automation.icon}</span>
        )}
      </div>

      <div className="automation-item__content">
        <div className="automation-item__header">
          <span className="automation-item__name">{automation.name}</span>
          <span
            className="automation-item__security"
            style={{ color: securityInfo.color }}
            title={`Sécurité: ${securityInfo.label}`}
          >
            {automation.securityLevel === 'safe'
              ? '🟢'
              : automation.securityLevel === 'moderate'
                ? '🟡'
                : automation.securityLevel === 'elevated'
                  ? '🟠'
                  : '🔴'}
          </span>
        </div>

        {!compact && (
          <div className="automation-item__description">{automation.description}</div>
        )}

        <div className="automation-item__meta">
          <span className="automation-item__xp" title="XP accordé">
            +{automation.baseXpReward} XP
          </span>
          {automation.requiresConfirmation && (
            <span className="automation-item__confirm" title="Nécessite confirmation">
              ⚠️
            </span>
          )}
        </div>
      </div>

      {!isAvailable && <div className="automation-item__lock">🔒</div>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT: AutomationPanel
// ─────────────────────────────────────────────────────────────────────────────

export const AutomationPanel: React.FC<AutomationPanelProps> = ({
  currentMode,
  permissionLevel,
  availableTools,
  onExecute,
  onClose,
  className = '',
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AutomationCategory | 'all'>(
    'all'
  );
  const [runningAutomations, setRunningAutomations] = useState<Set<AutomationId>>(
    new Set()
  );
  const [lastResult, setLastResult] = useState<AutomationResult | null>(null);

  // Filtrer les automations
  const filteredAutomations = useMemo(() => {
    let automations = Object.values(AUTOMATION_REGISTRY);

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      automations = automations.filter(a => a.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      automations = automations.filter(
        a =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    return automations;
  }, [selectedCategory, searchQuery]);

  // Grouper par catégorie pour affichage
  const groupedAutomations = useMemo(() => {
    const groups: Partial<Record<AutomationCategory, AutomationConfig[]>> = {};

    for (const automation of filteredAutomations) {
      if (!groups[automation.category]) {
        groups[automation.category] = [];
      }
      const categoryGroup = groups[automation.category];
      if (categoryGroup) {
        categoryGroup.push(automation);
      }
    }

    // Trier les automations dans chaque groupe
    for (const category of Object.keys(groups) as AutomationCategory[]) {
      const categoryGroup = groups[category];
      if (categoryGroup) {
        categoryGroup.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    return groups;
  }, [filteredAutomations]);

  // Vérifier disponibilité
  const checkAvailability = useCallback(
    (automationId: AutomationId): { available: boolean; reason?: string } => {
      const result = canExecuteAutomation(
        automationId,
        currentMode,
        permissionLevel,
        availableTools
      );
      return {
        available: result.allowed,
        reason: result.reason,
      };
    },
    [currentMode, permissionLevel, availableTools]
  );

  // Exécuter une automation
  const handleExecute = useCallback(
    async (automationId: AutomationId) => {
      const automation = AUTOMATION_REGISTRY[automationId];

      // Vérifier si confirmation nécessaire
      if (automation.requiresConfirmation) {
        const confirmed = window.confirm(
          `Exécuter "${automation.name}" ?\n\n${automation.description}\n\nCette action peut modifier des fichiers.`
        );
        if (!confirmed) return;
      }

      setRunningAutomations(prev => new Set(prev).add(automationId));

      try {
        if (onExecute) {
          const result = await onExecute(automationId, {});
          setLastResult(result);
        } else {
          // Simulation si pas de handler
          await new Promise(resolve => setTimeout(resolve, 1500));
          const xp = calculateAutomationXP(automationId, currentMode, true);
          setLastResult({
            automationId,
            status: 'success',
            startedAt: Date.now() - 1500,
            completedAt: Date.now(),
            duration: 1500,
            logs: [
              {
                timestamp: Date.now(),
                level: 'info',
                message: `${automation.name} exécutée avec succès`,
              },
            ],
            xpAwarded: xp,
          });
        }
      } catch (error) {
        setLastResult({
          automationId,
          status: 'failed',
          startedAt: Date.now(),
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          logs: [],
          xpAwarded: 0,
        });
      } finally {
        setRunningAutomations(prev => {
          const next = new Set(prev);
          next.delete(automationId);
          return next;
        });
      }
    },
    [currentMode, onExecute]
  );

  // Compter les automations disponibles
  const availableCount = useMemo(() => {
    return Object.values(AUTOMATION_REGISTRY).filter(a => {
      const { available } = checkAvailability(a.id);
      return available;
    }).length;
  }, [checkAvailability]);

  return (
    <div className={`automation-panel ${compact ? 'compact' : ''} ${className}`}>
      {/* Header */}
      <div className="automation-panel__header">
        <div className="automation-panel__title">
          <span className="automation-panel__icon">🔧</span>
          <span>Automations</span>
          <span className="automation-panel__count">
            {availableCount}/{Object.keys(AUTOMATION_REGISTRY).length}
          </span>
        </div>
        {onClose && (
          <button
            className="automation-panel__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="automation-panel__filters">
        <input
          type="text"
          className="automation-panel__search"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div className="automation-panel__categories">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Toutes
          </button>
          {CATEGORY_DISPLAY_ORDER.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              title={CATEGORY_LABELS[cat].label}
            >
              {CATEGORY_LABELS[cat].icon}
            </button>
          ))}
        </div>
      </div>

      {/* Last Result Banner */}
      {lastResult && (
        <div className={`automation-panel__result ${lastResult.status}`}>
          {lastResult.status === 'success' ? '✅' : '❌'}
          <span>
            {lastResult.status === 'success'
              ? `+${lastResult.xpAwarded} XP`
              : lastResult.error}
          </span>
          <button onClick={() => setLastResult(null)}>✕</button>
        </div>
      )}

      {/* Automation List */}
      <div className="automation-panel__list">
        {selectedCategory === 'all' ? (
          // Groupé par catégorie
          CATEGORY_DISPLAY_ORDER.map(category => {
            const automations = groupedAutomations[category];
            if (!automations?.length) return null;

            return (
              <div key={category} className="automation-panel__group">
                <div className="automation-panel__group-header">
                  <span>{CATEGORY_LABELS[category].icon}</span>
                  <span>{CATEGORY_LABELS[category].label}</span>
                  <span className="automation-panel__group-count">
                    {automations.length}
                  </span>
                </div>
                <div className="automation-panel__group-items">
                  {automations.map(automation => {
                    const { available, reason } = checkAvailability(automation.id);
                    return (
                      <AutomationItem
                        key={automation.id}
                        automation={automation}
                        isAvailable={available}
                        unavailableReason={reason}
                        onExecute={handleExecute}
                        isRunning={runningAutomations.has(automation.id)}
                        compact={compact}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // Liste plate pour une catégorie
          <div className="automation-panel__flat-list">
            {filteredAutomations.map(automation => {
              const { available, reason } = checkAvailability(automation.id);
              return (
                <AutomationItem
                  key={automation.id}
                  automation={automation}
                  isAvailable={available}
                  unavailableReason={reason}
                  onExecute={handleExecute}
                  isRunning={runningAutomations.has(automation.id)}
                  compact={compact}
                />
              );
            })}
          </div>
        )}

        {filteredAutomations.length === 0 && (
          <div className="automation-panel__empty">
            <span>🔍</span>
            <span>Aucune automation trouvée</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="automation-panel__footer">
        <span className="automation-panel__mode">
          Mode: <strong>{currentMode}</strong>
        </span>
        <span className="automation-panel__permission">
          Permission: <strong>Lv.{permissionLevel}</strong>
        </span>
      </div>
    </div>
  );
};

export default AutomationPanel;
