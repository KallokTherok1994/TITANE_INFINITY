/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — MENU NAVIGATION
 *   7 sections: Chat IA, Système, Projets, Paramètres, Admin, Heal, Historique
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import './styles/Menu.css';

interface MenuProps {
  isCollapsed: boolean;
  onToggle: () => void;
  currentRoute: string;
  onNavigate: (path: string) => void;
}

interface MenuSection {
  id: string;
  icon: string;
  label: string;
  description: string;
  route: string;
}

const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'chat',
    icon: '💬',
    label: 'Chat IA',
    description: 'Module central - Intelligence conversationnelle',
    route: '/chat'
  },
  {
    id: 'system',
    icon: '⚙️',
    label: 'Système',
    description: 'Performances, modules, moteurs, diagnostics',
    route: '/helios'
  },
  {
    id: 'projects',
    icon: '📁',
    label: 'Projets',
    description: 'Gestion projets, XP, catégories, progression',
    route: '/nexus'
  },
  {
    id: 'settings',
    icon: '🎛️',
    label: 'Paramètres',
    description: 'Thèmes, configuration, API, préférences',
    route: '/settings'
  },
  {
    id: 'admin',
    icon: '💻',
    label: 'Admin',
    description: 'Terminal interne, commandes système',
    route: '/devtools'
  },
  {
    id: 'heal',
    icon: '🛡️',
    label: 'Heal',
    description: 'Auto-Heal, erreurs, corrections, watchdog',
    route: '/selfheal'
  },
  {
    id: 'history',
    icon: '📜',
    label: 'Historique',
    description: 'Journal complet des actions et modifications',
    route: '/memory'
  },
  {
    id: 'cloud',
    icon: '☁️',
    label: 'Cloud Sync',
    description: 'Synchronisation chiffrée multi-appareils',
    route: '/cloud'
  }
];

export const Menu: React.FC<MenuProps> = ({ isCollapsed, onToggle, currentRoute, onNavigate }) => {
  const handleSectionClick = (section: MenuSection) => {
    onNavigate(section.route);
  };

  return (
    <nav className="menu-container">
      {/* Header avec toggle */}
      <div className="menu-header">
        {!isCollapsed && (
          <div className="menu-brand">
            <span className="menu-brand-icon">⚡</span>
            <span className="menu-brand-text">TITANE∞</span>
            <span className="menu-brand-version">v15.6</span>
          </div>
        )}
        <button
          className="menu-toggle"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Étendre le menu' : 'Réduire le menu'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Sections de navigation */}
      <div className="menu-sections">
        {MENU_SECTIONS.map((section) => (
          <button
            key={section.id}
            className={`menu-item ${currentRoute === section.route ? 'active' : ''}`}
            onClick={() => handleSectionClick(section)}
            title={isCollapsed ? section.label : undefined}
          >
            <span className="menu-item-icon">{section.icon}</span>
            {!isCollapsed && (
              <div className="menu-item-content">
                <span className="menu-item-label">{section.label}</span>
                <span className="menu-item-desc">{section.description}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer status */}
      {!isCollapsed && (
        <div className="menu-footer">
          <div className="menu-status">
            <div className="menu-status-indicator online" />
            <span className="menu-status-text">Système opérationnel</span>
          </div>
        </div>
      )}
    </nav>
  );
};
