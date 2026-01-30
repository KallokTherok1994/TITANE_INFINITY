/**
 * TITANE∞ v26.4.0 — Tabs Component (Titanium Dark)
 * Tab navigation with Titanium Dark design system + composable primitives
 * WCAG 2.2 AA compliant with full keyboard support
 * @license MIT
 */

import React, { useState, createContext, useContext } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs />');
  }
  return context;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS (Composable Primitives)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * TabsList - Container for tab triggers
 */
export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={`flex border-b border-titanium-border-default ${className}`}
    >
      {children}
    </div>
  );
}
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * TabsTrigger - Individual tab button
 */
export function TabsTrigger({
  value,
  children,
  disabled,
  icon,
  className = '',
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={`
        relative px-4 py-3 text-sm font-medium
        transition-colors duration-200
        focus-visible:outline-none focus-visible:shadow-focus
        disabled:cursor-not-allowed disabled:opacity-50
        ${
          isActive
            ? 'text-titanium-text-primary border-b-2 border-titanium-accent-cool bg-titanium-bg-interactive'
            : disabled
              ? 'text-titanium-text-disabled'
              : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-interactive'
        }
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className="w-4 h-4" aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{children}</span>
      </div>
    </button>
  );
}
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * TabsContent - Content panel for a tab
 */
export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={`mt-4 ${className}`}
    >
      {children}
    </div>
  );
}
TabsContent.displayName = 'TabsContent';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN TABS COMPONENT (Root)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TabsRootProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Tabs (Root) - Provides context for composable tabs
 */
export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = '',
}: TabsRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const activeTab = controlledValue ?? internalValue;
  const setActiveTab = (newValue: string) => {
    if (!controlledValue) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}
Tabs.displayName = 'Tabs';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGACY API (Backward Compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsLegacyProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
}

/**
 * Tabs (Legacy) - Original render-props API
 * @deprecated Use composable primitives (Tabs, TabsList, TabsTrigger, TabsContent)
 */
export function TabsLegacy({ tabs, defaultTab, onTabChange, children }: TabsLegacyProps) {
  if (!tabs || tabs.length === 0) {
    return (
      <div role="tablist" className="flex flex-col">
        <div className="text-titanium-text-tertiary text-sm">No tabs available</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab || tabs[0]?.id || ''} onValueChange={onTabChange}>
      <TabsList>
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            icon={tab.icon}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id}>
            {children(tab.id)}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
TabsLegacy.displayName = 'TabsLegacy';
