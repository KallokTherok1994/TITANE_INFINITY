/**
 * TITANE∞ v20.0 — Tabs Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
}

/**
 * Tabs - Système d'onglets avec support clavier
 * 
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'logs', label: 'Logs', icon: <FileText /> },
 *   { id: 'metrics', label: 'Métriques', icon: <BarChart /> },
 *   { id: 'memory', label: 'Mémoire', icon: <Database /> },
 * ];
 * 
 * <Tabs tabs={tabs} defaultTab="logs">
 *   {(activeTab) => (
 *     <>
 *       {activeTab === 'logs' && <LogsList />}
 *       {activeTab === 'metrics' && <MetricsGrid />}
 *       {activeTab === 'memory' && <MemoryPanel />}
 *     </>
 *   )}
 * </Tabs>
 * ```
 */
export function Tabs({ tabs, defaultTab, onTabChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const currentIndex = index;
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
      e.preventDefault();
    }

    if (nextIndex !== currentIndex && !tabs[nextIndex].disabled) {
      handleTabClick(tabs[nextIndex].id, tabs[nextIndex].disabled);
      (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
    }
  };

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div
        role="tablist"
        className="flex border-b"
        style={{
          borderColor: 'var(--border, rgba(196,196,196,0.12))',
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                relative px-4 py-2.5 text-sm font-medium
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-inset
                focus:ring-blue-500
                disabled:cursor-not-allowed disabled:opacity-50
                ${isActive ? 'border-b-2' : ''}
              `}
              style={{
                color: isActive
                  ? 'var(--text-primary, #e0e0e0)'
                  : tab.disabled
                    ? 'var(--text-disabled, rgba(255,255,255,0.38))'
                    : 'var(--text-muted, rgba(255,255,255,0.60))',
                borderColor: isActive ? 'var(--border-active, #727b81)' : 'transparent',
                background: isActive ? 'var(--bg-hover, rgba(255,255,255,0.04))' : 'transparent',
              }}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
      >
        {children(activeTab)}
      </div>
    </div>
  );
}
