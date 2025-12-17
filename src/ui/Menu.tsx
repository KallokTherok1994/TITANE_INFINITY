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
  // ═══ PRINCIPAL ═══
  {
    id: 'dashboard',
    icon: '📊',
    label: 'Tableau de bord',
    description: "Vue d'ensemble du système",
    route: '/',
  },
  {
    id: 'chat',
    icon: '💬',
    label: 'Chat IA',
    description: 'Module central - Intelligence conversationnelle',
    route: '/chat',
  },
  {
    id: 'agenda',
    icon: '📅',
    label: 'Agenda',
    description: 'Temps, énergie, planning intelligent',
    route: '/agenda',
  },
  {
    id: 'camera',
    icon: '📷',
    label: 'Vision',
    description: 'Analyse visuelle et reconnaissance',
    route: '/camera',
  },
  // ═══ CENTRES UNIFIÉS ═══
  {
    id: 'one-core',
    icon: '🎯',
    label: 'ONE CORE',
    description: 'Centre de commande unifié',
    route: '/one-core',
  },
  {
    id: 'stats',
    icon: '📊',
    label: 'Statistiques',
    description: 'Métriques moteurs : Nexus, Helios, Harmonia, État Cognitif',
    route: '/stats',
  },
  {
    id: 'system',
    icon: '⚙️',
    label: 'Centre Système',
    description: 'Performances, diagnostics, monitoring',
    route: '/system-center',
  },
  {
    id: 'audio',
    icon: '🔊',
    label: 'Audio & Voix',
    description: 'TTS, reconnaissance vocale, synthèse',
    route: '/audio-center',
  },
  {
    id: 'design',
    icon: '🎨',
    label: 'Design & Apparence',
    description: 'Thèmes, tokens, personnalisation',
    route: '/design-center',
  },
  {
    id: 'governance',
    icon: '🛡️',
    label: 'Gouvernance',
    description: 'Sécurité, auto-heal, watchdog',
    route: '/governance-center',
  },
  {
    id: 'qa',
    icon: '🧪',
    label: 'QA & Monitoring',
    description: 'Tests, qualité, métriques',
    route: '/qa-monitoring',
  },
  {
    id: 'developer',
    icon: '💻',
    label: 'Mode Développeur',
    description: 'Terminal, debug, commandes système',
    route: '/developer-mode',
  },
  // ═══ CENTRES COGNITIFS ═══
  {
    id: 'evolution',
    icon: '🧬',
    label: 'Évolution Cognitive',
    description: 'Apprentissage, adaptation, XP',
    route: '/evolution-center',
  },
  {
    id: 'orchestration',
    icon: '🎛️',
    label: 'Intelligence IA',
    description: 'Orchestration Multi-IA, Meta-cognition',
    route: '/orchestration-center',
  },
  {
    id: 'memory',
    icon: '💾',
    label: 'Mémoire Évolutive',
    description: 'Historique, contexte, souvenirs',
    route: '/memory-evolution',
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
    // v25.2.1: Forcer reload depuis source (ignorer localStorage temporairement)
    // Pour éviter cache avec ancienne config sans "État Cognitif"
    localStorage.removeItem('titane_menu_config'); // Clear old cache
    return MENU_SECTIONS;
  });

  const handleSectionClick = (section: MenuSection) => {
    onNavigate(section.route);
  };

  const handleSaveMenu = (newSections: MenuSection[]) => {
    setMenuSections(newSections);
    // Optionally save to localStorage or backend
    localStorage.setItem('titane_menu_config', JSON.stringify(newSections));
    console.log('✅ Menu sauvegardé:', newSections.length, 'sections');
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
