/**
 * TITANE∞ v26.2.0 — Tabs Component (Titanium Dark)
 * Tab navigation with Titanium Dark design system
 * WCAG 2.2 AA compliant with full keyboard support
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
 * Tabs - Tab navigation system with keyboard support
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'logs', label: 'Logs', icon: <FileText /> },
 *   { id: 'metrics', label: 'Metrics', icon: <BarChart /> },
 *   { id: 'memory', label: 'Memory', icon: <Database /> },
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
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

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

    const nextTab = tabs[nextIndex];
    if (nextIndex !== currentIndex && nextTab && !nextTab.disabled) {
      handleTabClick(nextTab.id, nextTab.disabled ?? false);
      (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
    }
  };

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div
        role="tablist"
        className="flex border-b border-titanium-border-default"
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
              onKeyDown={e => handleKeyDown(e, index)}
              className={`
                relative px-4 py-3 text-sm font-medium
                transition-colors duration-200
                focus-visible:outline-none focus-visible:shadow-focus
                disabled:cursor-not-allowed disabled:opacity-50
                ${isActive 
                  ? 'text-titanium-text-primary border-b-2 border-titanium-accent-cool bg-titanium-bg-interactive' 
                  : tab.disabled 
                    ? 'text-titanium-text-disabled' 
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-interactive'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span className="w-4 h-4" aria-hidden="true">{tab.icon}</span>}
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
