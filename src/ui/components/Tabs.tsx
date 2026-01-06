/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Tabs Component with Performance Optimizations
import { ReactNode, useState, useCallback, useMemo, useId, memo } from 'react';
import { clsx } from 'clsx';
import './Tabs.css';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

/**
 * Tabs component for tabbed navigation.
 * Memoized for optimal re-render performance.
 */
export const Tabs = memo(function Tabs({
  tabs,
  defaultTab,
  onChange,
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabsId = useId();

  const handleTabClick = useCallback(
    (tabId: string, disabled?: boolean) => {
      if (disabled) return;
      setActiveTab(tabId);
      onChange?.(tabId);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      const enabledTabs = tabs.filter(tab => !tab.disabled);
      const currentEnabledIndex = enabledTabs.findIndex(
        tab => tab.id === tabs[currentIndex]?.id
      );

      let nextIndex = currentEnabledIndex;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex =
            currentEnabledIndex > 0
              ? currentEnabledIndex - 1
              : enabledTabs.length - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextIndex =
            currentEnabledIndex < enabledTabs.length - 1
              ? currentEnabledIndex + 1
              : 0;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = enabledTabs.length - 1;
          break;
        default:
          return;
      }

      const nextTab = enabledTabs[nextIndex];
      if (nextTab) {
        setActiveTab(nextTab.id);
        onChange?.(nextTab.id);
        // Focus the next tab button
        const tabButton = document.getElementById(`${tabsId}-tab-${nextTab.id}`);
        tabButton?.focus();
      }
    },
    [tabs, onChange, tabsId]
  );

  const activeContent = useMemo(
    () => tabs.find(tab => tab.id === activeTab)?.content,
    [tabs, activeTab]
  );

  const classes = useMemo(() => clsx('tabs', className), [className]);

  return (
    <div className={classes}>
      <div className="tabs__list" role="tablist" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`${tabsId}-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tabsId}-panel-${tab.id}`}
            aria-disabled={tab.disabled}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={clsx(
              'tabs__tab',
              activeTab === tab.id && 'tabs__tab--active',
              tab.disabled && 'tabs__tab--disabled'
            )}
            onClick={() => handleTabClick(tab.id, tab.disabled)}
            onKeyDown={e => handleKeyDown(e, index)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`${tabsId}-panel-${activeTab}`}
        className="tabs__panel"
        role="tabpanel"
        aria-labelledby={`${tabsId}-tab-${activeTab}`}
        tabIndex={0}
      >
        {activeContent}
      </div>
    </div>
  );
});
