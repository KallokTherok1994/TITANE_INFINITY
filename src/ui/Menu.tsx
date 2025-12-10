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
    label: 'Orchestration',
    description: 'Multi-IA, coordination agents',
    route: '/orchestration-center',
  },
  {
    id: 'meta',
    icon: '🌐',
    label: 'Meta Orchestrator',
    description: 'Méta-cognition, supervision globale',
    route: '/meta-center',
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
            <span className="menu-brand-version">v∞.19.3Ω</span>
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
        {MENU_SECTIONS.map(section => (
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
