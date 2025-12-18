/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.4.2 — MENU NAVIGATION (DESIGN FINAL)
 *   Module TITANE - LE CŒUR DU SYSTÈME (fusion Chat IA + Vision + EVO)
 *   7 sections: TITANE, TIME, STATS, ADMIN, DEV, FUSION, OPTIMIZE
 *   Icons: Lucide React (Atom, Timer, TrendingUp, Settings, Wrench, Sparkles, Zap)
 *   Logo: Arc Reactor Émeraude v25.4.2
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
  Edit3,
  Atom,
  Timer,
  TrendingUp,
  Settings,
  Wrench,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MenuEditor } from '../features/menu-editor/MenuEditor';
import { TitaneLogo } from '../components/branding/TitaneLogo';
import './styles/Menu.css';

// ✨ v25.4.2 - Icon mapping for Lucide icons (professional, themeable)
const MENU_ICONS: Record<string, React.ReactNode> = {
  titane: <Atom size={20} className="menu-lucide-icon" />,
  time: <Timer size={20} className="menu-lucide-icon" />,
  stats: <TrendingUp size={20} className="menu-lucide-icon" />,
  admin: <Settings size={20} className="menu-lucide-icon" />,
  dev: <Wrench size={20} className="menu-lucide-icon" />,
  fusion: <Sparkles size={20} className="menu-lucide-icon" />,
  optimization: <Zap size={20} className="menu-lucide-icon" />,
};

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
    icon: '⚛️',
    label: 'TITANE',
    description:
      'Le Cœur du Système - Conversation, Vision, Overview, Identité, Mémoire, Évolution, Progression, Transformation',
    route: '/titane',
  },
  // ✨ v25.1 TIME - FUSION TEMPORELLE ULTIME (Temporal Flow + Agenda + Time Navigator)
  {
    id: 'time',
    icon: '⏱️',
    label: 'TIME',
    description: 'Centre Temporel - Agenda, Navigation, Snapshots, Intelligence, Flow',
    route: '/time',
  },
  // ✨ v25.2.0 STATS - Métriques système consolidées
  {
    id: 'stats',
    icon: '📈',
    label: 'STATS',
    description: 'Métriques moteurs : Nexus, Helios, Harmonia, État Cognitif',
    route: '/stats',
  },
  // ✨ v25.2 ADMIN - FUSION (Système + Config + Audio + Design + Gouvernance)
  {
    id: 'admin',
    icon: '⚙️',
    label: 'ADMIN',
    description: 'Centre Admin Unifié - Système, Config, Audio, Design, Gouvernance',
    route: '/admin',
  },
  // ⚡ v25.4.0 DEV - FUSION COMPLÈTE (Dev Mode + ONE CORE + QA & Tests + Orchestration)
  {
    id: 'dev',
    icon: '🛠️',
    label: 'DEV',
    description:
      'Centre DEV Unifié - Dev Tools, Command Center, QA & Tests, Orchestration, Sécurité, Métriques',
    route: '/dev',
  },
  // ✨ v25.3.2 FUSION - Perfect Backend/Frontend Integration Dashboard
  {
    id: 'fusion',
    icon: '✨',
    label: 'FUSION',
    description: 'Dashboard Fusion Backend/Frontend - Singularity, Memory, Health Sync',
    route: '/fusion',
  },
  // ⚡ v25.6.0 OPTIMIZE - Ultimate Performance Dashboard (GPU/WASM/Cache/IndexedDB)
  {
    id: 'optimization',
    icon: '⚡',
    label: 'OPTIMIZE',
    description: 'Optimisation Ultime - GPU, WASM, Service Worker, IndexedDB, Cache',
    route: '/optimization',
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
    // v25.4.2: Migration one-time only (not every mount) - FUSION + OPTIMIZE ajoutés
    const MENU_VERSION = 'v25.4.2-fusion-optimize';
    const storedVersion = localStorage.getItem('titane_menu_version');

    // Only clear localStorage on version upgrade (not every mount)
    if (storedVersion !== MENU_VERSION) {
      localStorage.removeItem('titane_menu_config');
      localStorage.removeItem('titane_menu_sections');
      localStorage.removeItem('menu_config');
      localStorage.removeItem('navigation_config');
      localStorage.removeItem('menuSections');
      localStorage.removeItem('sidebar_config');
      localStorage.setItem('titane_menu_version', MENU_VERSION);

      console.log('🔧 Menu v25.4.1 - Migration one-time completed');
      console.log(
        '📋 Sections actives:',
        MENU_SECTIONS.length,
        '→',
        MENU_SECTIONS.map(s => s.label).join(', ')
      );
    }

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
      <nav
        className="menu-container"
        role="navigation"
        aria-label="Menu principal de navigation TITANE∞"
      >
        {/* Header avec toggle - Logo Arc Reactor Émeraude v25.4.2 */}
        <div className="menu-header">
          {!isCollapsed ? (
            <div className="menu-brand">
              <TitaneLogo
                size={36}
                variant="emerald"
                glow={true}
                glowIntensity={2}
                className="menu-brand-logo"
              />
              <div className="menu-brand-info">
                <span className="menu-brand-text">TITANE∞</span>
                <span className="menu-brand-version">v25.4.2</span>
              </div>
            </div>
          ) : (
            <TitaneLogo
              size={32}
              variant="emerald"
              glow={true}
              glowIntensity={2}
              className="menu-brand-logo-collapsed"
            />
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isCollapsed && (
              <button
                className="menu-toggle"
                onClick={() => setIsEditing(true)}
                aria-label="Éditer le menu - Ouvrir l'éditeur de configuration du menu latéral"
                title="Éditer le menu"
                aria-describedby="menu-edit-description"
                style={{ background: '#3b82f6' }}
              >
                <Edit3 size={16} aria-hidden="true" />
                <span id="menu-edit-description" className="sr-only">
                  Permet de personnaliser l&apos;ordre et la visibilité des éléments du
                  menu
                </span>
              </button>
            )}
            <button
              className="menu-toggle"
              onClick={onToggle}
              aria-label={
                isCollapsed ? 'Étendre le menu latéral' : 'Réduire le menu latéral'
              }
              aria-expanded={!isCollapsed}
              aria-controls="menu-sections"
            >
              <span aria-hidden="true">{isCollapsed ? '→' : '←'}</span>
              <span className="sr-only">
                {isCollapsed ? 'Afficher les labels' : 'Masquer les labels'}
              </span>
            </button>
          </div>
        </div>

        {/* Sections de navigation */}
        <div
          className="menu-sections"
          id="menu-sections"
          role="menubar"
          aria-label="Sections de navigation principales"
        >
          {menuSections
            .filter(s => ('visible' in s ? s.visible !== false : true))
            .map((section, index) => (
              <button
                key={section.id}
                className={`menu-item ${currentRoute === section.route ? 'active' : ''}`}
                onClick={() => handleSectionClick(section)}
                role="menuitem"
                aria-label={`${section.label} - ${section.description}`}
                aria-current={currentRoute === section.route ? 'page' : undefined}
                aria-posinset={index + 1}
                aria-setsize={
                  menuSections.filter(s => ('visible' in s ? s.visible !== false : true))
                    .length
                }
                title={
                  isCollapsed ? `${section.label}: ${section.description}` : undefined
                }
                tabIndex={0}
              >
                <span className="menu-item-icon" aria-hidden="true">
                  {MENU_ICONS[section.id] || section.icon}
                </span>
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
