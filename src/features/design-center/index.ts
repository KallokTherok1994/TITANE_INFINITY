/**
 * TITANE∞ - Centre Design & Apparence - Index
 * Exports du module
 *
 * @license AGPL-3.0 - TITANE AI Project
 */

// Page principale
export { DesignCenterPage, default } from './DesignCenterPage';

// Provider et Hook
export { UIThemeProvider, useUITheme } from './providers/UIThemeProvider';

// Hooks spécialisés
export { useUIThemeCommands } from './hooks/useUIThemeCommands';

// Services
export { uiThemeIAService } from './services/uiThemeIAService';

// Tabs
export { DesignSystemTab } from './tabs/DesignSystemTab';
export { AppearanceTab } from './tabs/AppearanceTab';

// Types
export * from './types/designCenter?.types';
