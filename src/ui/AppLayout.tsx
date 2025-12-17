/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.7.4 — APP LAYOUT OPTIMISÉ
 *   Layout responsive avec useResponsive hook
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { Menu } from './Menu';
import { GlobalExpBar } from '../components/experience/GlobalExpBar';
// ✨ v25.7.4 - Responsive Hook
import { useIsMobile } from '@/hooks/useResponsive';
import './styles/AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (path: string) => void;
  onOpenExpPanel: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentRoute,
  onNavigate,
  onOpenExpPanel,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✨ v25.7.4 - Utilise le hook responsive centralisé
  const isMobile = useIsMobile();

  // Fermer le menu mobile lors de la navigation
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [currentRoute, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Skip to main content - Accessibilité */}
      <a
        href="#main-content"
        className="skip-to-main"
        aria-label="Aller au contenu principal"
      >
        Aller au contenu principal
      </a>

      {/* Global EXP Bar - toujours visible en haut */}
      <GlobalExpBar onOpenPanel={onOpenExpPanel} />

      {/* Conteneur principal */}
      <div className="app-container">
        {/* Mobile backdrop overlay */}
        {isMobile && isMobileMenuOpen && (
          <div
            className="app-sidebar-backdrop"
            onClick={closeMobileMenu}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && closeMobileMenu()}
            aria-label="Fermer le menu"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`app-sidebar ${
            isMobile
              ? isMobileMenuOpen
                ? 'mobile-open'
                : 'mobile-closed'
              : isSidebarCollapsed
                ? 'collapsed'
                : ''
          }`}
          aria-label="Navigation principale"
        >
          <Menu
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
            currentRoute={currentRoute}
            onNavigate={onNavigate}
          />
        </aside>

        {/* Zone de contenu principale */}
        <main
          id="main-content"
          className="app-main"
          role="main"
          aria-label="Contenu principal"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
