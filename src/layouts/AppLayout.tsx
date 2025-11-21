/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — APP LAYOUT (Structure Principale)
 *   Layout moderne avec Sidebar + Header + XPBar + Content
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  xpBar?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  sidebar, 
  header, 
  xpBar 
}) => {
  return (
    <div className="layout">
      {/* Sidebar (navigation) */}
      {sidebar && (
        <aside className="layout__sidebar">
          {sidebar}
        </aside>
      )}

      {/* Main Content Area */}
      <div className="layout__main">
        {/* Header fixe */}
        {header && (
          <header className="layout__header">
            {header}
          </header>
        )}

        {/* XP Bar (progression) */}
        {xpBar && (
          <div className="layout__xpbar">
            {xpBar}
          </div>
        )}

        {/* Scrollable Content */}
        <main className="layout__content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
