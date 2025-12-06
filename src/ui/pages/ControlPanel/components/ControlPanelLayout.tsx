/**
 * TITANE∞ OS - Control Panel Layout
 * Structure principale avec sidebar de navigation
 */

import React from 'react';
import { ControlPanelSection } from '../types';
import { SystemInfo } from '../../../../types/tauri';
import './ControlPanelLayout.css';

interface ControlPanelLayoutProps {
  activeSection: ControlPanelSection;
  onSectionChange: (section: ControlPanelSection) => void;
  systemInfo: SystemInfo | null;
  children: React.ReactNode;
}

interface NavigationItem {
  id: ControlPanelSection;
  label: string;
  icon: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'system',
    label: 'Système',
    icon: '🖥️',
    description: 'Informations système et diagnostics'
  },
  {
    id: 'appearance',
    label: 'Apparence',
    icon: '🎨',
    description: 'Design System et thèmes'
  },
  {
    id: 'singularity',
    label: 'Singularité',
    icon: '🌓',
    description: 'Contrôle moteur de singularité'
  },
  {
    id: 'ai',
    label: 'IA & APIs',
    icon: '🤖',
    description: 'Configuration Gemini et APIs'
  },
  {
    id: 'memory',
    label: 'Mémoire',
    icon: '💾',
    description: 'Gestion stockage et caches'
  },
  {
    id: 'modules',
    label: 'Modules',
    icon: '🧩',
    description: 'Activation/désactivation engines'
  },
  {
    id: 'network',
    label: 'Réseau',
    icon: '🌐',
    description: 'Connectivité et proxy'
  },
  {
    id: 'updates',
    label: 'Mises à jour',
    icon: '🔄',
    description: 'Auto-update et versions'
  },
  {
    id: 'logs',
    label: 'Logs',
    icon: '📊',
    description: 'Visualisation logs temps réel'
  },
  {
    id: 'security',
    label: 'Sécurité',
    icon: '🔒',
    description: 'Permissions et H-N security'
  }
];

export const ControlPanelLayout: React.FC<ControlPanelLayoutProps> = ({
  activeSection,
  onSectionChange,
  systemInfo,
  children
}) => {
  return (
    <div className="cp-layout">
      {/* Sidebar navigation */}
      <aside className="cp-sidebar">
        <div className="cp-sidebar-header">
          <h1 className="cp-sidebar-title">
            <span className="cp-sidebar-icon">⚙️</span>
            Panneau de Contrôle
          </h1>
          {systemInfo && (
            <div className="cp-sidebar-status">
              <span className={`cp-status-dot ${systemInfo.singularity_active ? 'active' : ''}`} />
              <span className="cp-status-text">
                {systemInfo.singularity_active ? 'Singularité Active' : 'Système Normal'}
              </span>
            </div>
          )}
        </div>

        <nav className="cp-sidebar-nav">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`cp-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
              title={item.description}
            >
              <span className="cp-nav-icon">{item.icon}</span>
              <span className="cp-nav-label">{item.label}</span>
              {activeSection === item.id && (
                <span className="cp-nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="cp-sidebar-footer">
          <div className="cp-version">
            <span className="cp-version-label">Version</span>
            <span className="cp-version-value">
              {systemInfo?.version || 'v19.1.0'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="cp-main">
        {children}
      </main>
    </div>
  );
};
