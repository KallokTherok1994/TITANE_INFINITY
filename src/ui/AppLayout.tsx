/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v16.1 — APP LAYOUT OPTIMISÉ
 *   Layout responsive avec mobile overlay et accessibilité
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { Menu } from './Menu';
import { GlobalExpBar } from '../components/experience/GlobalExpBar';
import './styles/AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (path: string) => void;
  onOpenExpPanel: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentRoute, onNavigate, onOpenExpPanel }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est en mode mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <a href="#main-content" className="skip-to-main" aria-label="Aller au contenu principal">
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
            onKeyDown={(e) => e.key === 'Enter' && closeMobileMenu()}
            aria-label="Fermer le menu"
          />
        )}

        {/* Sidebar Navigation */}
        <aside 
          className={`app-sidebar ${
            isMobile 
              ? (isMobileMenuOpen ? 'mobile-open' : 'mobile-closed')
              : (isSidebarCollapsed ? 'collapsed' : '')
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
