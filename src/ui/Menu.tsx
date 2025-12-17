/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.4.0 — MENU NAVIGATION
 *   Module TITANE - LE CŒUR DU SYSTÈME (fusion Chat IA + Vision + EVO)
 *   FUSION DEV: Dev Mode + ONE CORE + QA & Tests + Orchestration (4→1)
 *   Menu simplifié: 8→5 items (-37.5%)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { MenuEditor } from '../features/menu-editor/MenuEditor';
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
  visible?: boolean;
}

const MENU_SECTIONS: MenuSection[] = [
  // ⚡ v25.3.0 TITANE - LE CŒUR DU SYSTÈME (Fusion Chat IA + Vision + EVO)
  {
    id: 'titane',
    icon: '⚡',
    label: 'TITANE',
    description:
      'Le Cœur du Système - Conversation, Vision, Overview, Identité, Mémoire, Évolution, Progression, Transformation',
    route: '/titane',
  },
  // ✨ v25.1 TIME - FUSION TEMPORELLE ULTIME (Temporal Flow + Agenda + Time Navigator)
  {
    id: 'time',
    icon: '🕐',
    label: 'TIME',
    description: 'Centre Temporel - Agenda, Navigation, Snapshots, Intelligence, Flow',
    route: '/time',
  },
  {
    id: 'stats',
    icon: '📊',
    label: 'STATS',
    description: 'Métriques moteurs : Nexus, Helios, Harmonia, État Cognitif',
    route: '/stats',
  },
  // ✨ v25.2 ADMIN - FUSION (Système + Config + Audio + Design + Gouvernance)
  {
    id: 'admin',
    icon: '👑',
    label: 'ADMIN',
    description: 'Centre Admin Unifié - Système, Config, Audio, Design, Gouvernance',
    route: '/admin',
  },
  // ⚡ v25.4.0 DEV - FUSION COMPLÈTE (Dev Mode + ONE CORE + QA & Tests + Orchestration)
  {
    id: 'dev',
    icon: '🔧',
    label: 'DEV',
    description:
      'Centre DEV Unifié - Dev Tools, Command Center, QA & Tests, Orchestration, Sécurité, Métriques',
    route: '/dev',
  },
];

export const Menu: React.FC<MenuProps> = ({
  isCollapsed,
  onToggle,
  currentRoute,
  onNavigate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [menuSections, setMenuSections] = useState(() => {
    // v25.4.0: DEV FUSION - Menu 8→5 items
    const MENU_VERSION = 'v25.4.0-dev-fusion';

    // FORCER le nettoyage total pour transition vers DEV unified
    localStorage.removeItem('titane_menu_config');
    localStorage.removeItem('titane_menu_sections');
    localStorage.removeItem('menu_config');
    localStorage.removeItem('navigation_config');
    localStorage.removeItem('menuSections');
    localStorage.removeItem('sidebar_config');
    localStorage.setItem('titane_menu_version', MENU_VERSION);

    console.log('🔧 Menu v25.4.0 - DEV FUSION activée (8→5 items, -37.5%)');
    console.log(
      '📋 Sections actives:',
      MENU_SECTIONS.length,
      '→',
      MENU_SECTIONS.map(s => s.label).join(', ')
    );

    return MENU_SECTIONS;
  });

  const handleSectionClick = (section: MenuSection) => {
    onNavigate(section.route);
  };

  const handleSaveMenu = (newSections: MenuSection[]) => {
    // v25.2.1: DÉSACTIVER la sauvegarde localStorage pour éviter persistance anciennes sections
    // L'utilisateur peut réorganiser visuellement mais pas sauvegarder définitivement
    setMenuSections(newSections);
    console.log(
      'ℹ️ Menu réorganisé temporairement:',
      newSections.length,
      'sections (non sauvegardé)'
    );
    console.warn(
      '⚠️ Les modifications du menu ne sont plus persistées pour éviter les anciennes configurations'
    );
  };

  return (
    <>
      <nav className="menu-container">
        {/* Header avec toggle */}
        <div className="menu-header">
          {!isCollapsed && (
            <div className="menu-brand">
              <span className="menu-brand-icon">⚡</span>
              <span className="menu-brand-text">TITANE∞</span>
              <span className="menu-brand-version">v19.5.2</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isCollapsed && (
              <button
                className="menu-toggle"
                onClick={() => setIsEditing(true)}
                aria-label="Éditer le menu"
                title="Éditer le menu"
                style={{ background: '#3b82f6' }}
              >
                <Edit3 size={16} />
              </button>
            )}
            <button
              className="menu-toggle"
              onClick={onToggle}
              aria-label={isCollapsed ? 'Étendre le menu' : 'Réduire le menu'}
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Sections de navigation */}
        <div className="menu-sections">
          {menuSections
            .filter(s => ('visible' in s ? s.visible !== false : true))
            .map(section => (
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

      {/* Menu Editor Modal */}
      {isEditing && (
        <MenuEditor
          sections={menuSections}
          onSave={handleSaveMenu}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};
