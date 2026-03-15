/**
 * TITANE∞ v24.3.0 — Centre Design & Apparence
 * Page unifiée Design System + Paramètres
 * v22Ω AI Performance Optimizations Compatible
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useCallback, useState } from 'react';
import { UIThemeProvider, useUITheme } from './providers/UIThemeProvider';
import { DesignSystemTab } from './tabs/DesignSystemTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import { DESIGN_CENTER_TABS, type DesignCenterTab } from './types/designCenter.types';

// ============================================================================
// TAB CONTENT WRAPPER
// ============================================================================

interface TabContentProps {
  activeTab: string;
}

function TabContent({ activeTab }: TabContentProps) {
  switch (activeTab) {
    case 'design-system':
      return <DesignSystemTab />;
    case 'appearance':
      return <AppearanceTab />;
    default:
      return <DesignSystemTab />;
  }
}

// ============================================================================
// PAGE HEADER
// ============================================================================

function DesignCenterHeader() {
  const { tokens, isLoading, error, isDirty, tokenSource } = useUITheme();

  return (
    <header className="dc-header">
      <div className="dc-header-content">
        <div className="dc-header-title">
          <h1>🎨 Centre Design & Apparence</h1>
          <div className="dc-header-meta">
            <span className="dc-version">v{tokens?.version || '...'}</span>
            <span className="dc-name">{tokens?.name || 'Chargement...'}</span>
            {isDirty && <span className="dc-dirty-badge">• Non sauvegardé</span>}
          </div>
        </div>
        <div className="dc-header-status">
          {isLoading && (
            <span className="dc-status-loading" data-testid="design-status-loading">
              ⏳ Chargement...
            </span>
          )}
          {error && (
            <span className="dc-status-error" data-testid="design-status-error">
              ⚠️ {error}
            </span>
          )}
          {!isLoading && !error && tokenSource === 'fallback-local' && (
            <span className="dc-status-warning" data-testid="design-status-fallback">
              ⚠ Fallback local
            </span>
          )}
          {!isLoading && !error && tokenSource === 'runtime' && isDirty && (
            <span className="dc-status-warning" data-testid="design-status-dirty">
              ⚠ Appliqué (non sauvegardé)
            </span>
          )}
          {!isLoading && !error && tokenSource === 'runtime' && !isDirty && (
            <span className="dc-status-ok" data-testid="design-status-runtime-active">
              ✓ Actif (runtime)
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// TAB NAVIGATION
// ============================================================================

interface TabNavigationProps {
  tabs: DesignCenterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, tabIndex: number) => {
      if (tabs.length === 0) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = (tabIndex + 1) % tabs.length;
        onTabChange(tabs[nextIndex]?.id ?? tabs[0]!.id);
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const previousIndex = (tabIndex - 1 + tabs.length) % tabs.length;
        onTabChange(tabs[previousIndex]?.id ?? tabs[0]!.id);
      }

      if (event.key === 'Home') {
        event.preventDefault();
        onTabChange(tabs[0]!.id);
      }

      if (event.key === 'End') {
        event.preventDefault();
        onTabChange(tabs[tabs.length - 1]!.id);
      }
    },
    [onTabChange, tabs]
  );

  return (
    <nav className="dc-tabs-nav" role="tablist" aria-label="Design Center tabs">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          id={`dc-tab-${tab.id}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`dc-panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          data-testid={`design-tab-${tab.id}`}
          className={`dc-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={event => handleKeyDown(event, index)}
          title={tab.description}
        >
          <span className="dc-tab-icon">{tab.icon}</span>
          <span className="dc-tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ============================================================================
// MAIN PAGE CONTENT
// ============================================================================

function DesignCenterContent() {
  const [activeTab, setActiveTab] = useState(DESIGN_CENTER_TABS[0]?.id ?? 'design-system');
  const activeTabIndex = DESIGN_CENTER_TABS.findIndex(tab => tab.id === activeTab);

  return (
    <div className="dc-page" data-testid="page-design-center">
      <DesignCenterHeader />

      <TabNavigation
        tabs={DESIGN_CENTER_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="dc-main">
        <section
          id={`dc-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`dc-tab-${activeTab}`}
          data-testid={`design-panel-${activeTab}`}
          tabIndex={activeTabIndex >= 0 ? 0 : -1}
        >
          <TabContent activeTab={activeTab} />
        </section>
      </main>

      {/* Styles de la page */}
      <style>{`
        .dc-page {
          min-height: 100vh;
          background: var(--color-background, #0f0f0f);
          color: var(--color-text, #e8e8e8);
          font-family: var(--font-family, 'Inter', sans-serif);
        }

        /* Header */
        .dc-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--color-border, #3a3a3a);
          background: var(--color-surface, #161616);
        }

        .dc-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dc-header-title h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dc-header-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-muted, #9ca3af);
        }

        .dc-version {
          padding: 0.125rem 0.5rem;
          background: var(--color-surface-elevated, #1e1e1e);
          border-radius: var(--radius-sm, 4px);
          font-family: var(--font-family-mono);
          font-size: 0.75rem;
        }

        .dc-dirty-badge {
          color: var(--color-warning, #a89f91);
        }

        .dc-header-status {
          font-size: 0.875rem;
        }

        .dc-status-loading { color: var(--color-info, #8899aa); }
        .dc-status-error { color: var(--color-error, #8f7a7a); }
        .dc-status-ok { color: var(--color-success, #93b399); }
        .dc-status-warning { color: var(--color-warning, #a89f91); }

        /* Tab Navigation */
        .dc-tabs-nav {
          display: flex;
          gap: 0;
          padding: 0 2rem;
          background: var(--color-surface, #161616);
          border-bottom: 1px solid var(--color-border, #3a3a3a);
        }

        .dc-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          color: var(--color-text-muted, #9ca3af);
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }

        .dc-tab-btn:hover {
          color: var(--color-text, #e8e8e8);
          background: var(--color-surface-elevated, #1e1e1e);
        }

        .dc-tab-btn:focus-visible {
          outline: 2px solid var(--color-border-focus, #5a5a5a);
          outline-offset: 2px;
        }

        .dc-tab-btn.active {
          color: var(--color-accent, #93b399);
          border-bottom-color: var(--color-accent, #93b399);
        }

        .dc-tab-icon {
          font-size: 1.25rem;
        }

        /* Main Content */
        .dc-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Tab Content Shared Styles */
        .dc-tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .dc-tab-info h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--color-text, #e8e8e8);
        }

        .dc-tab-subtitle {
          margin: 0.25rem 0 0;
          color: var(--color-text-muted, #9ca3af);
          font-size: 0.875rem;
        }

        .dc-tab-actions {
          display: flex;
          gap: 0.5rem;
        }

        .dc-btn-action {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid var(--color-border, #3a3a3a);
          background: var(--color-surface, #161616);
          color: var(--color-text, #e8e8e8);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .dc-btn-action:hover {
          background: var(--color-surface-elevated, #1e1e1e);
        }

        .dc-btn-save {
          background: var(--color-accent, #93b399);
          color: var(--color-background, #0f0f0f);
          border-color: var(--color-accent, #93b399);
        }

        .dc-btn-save:hover {
          filter: brightness(1.1);
        }

        .dc-btn-undo {
          border-color: var(--color-warning, #a89f91);
        }

        .dc-btn-reset {
          border-color: var(--color-error, #8f7a7a);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dc-header {
            padding: 1rem;
          }

          .dc-header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .dc-tabs-nav {
            padding: 0 1rem;
            overflow-x: auto;
          }

          .dc-tab-btn {
            padding: 0.75rem 1rem;
          }

          .dc-tab-label {
            display: none;
          }

          .dc-main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT WITH PROVIDER
// ============================================================================

export function DesignCenterPage() {
  return (
    <UIThemeProvider>
      <DesignCenterContent />
    </UIThemeProvider>
  );
}

export default DesignCenterPage;
