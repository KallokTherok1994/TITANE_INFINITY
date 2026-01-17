/**
 * TITANE∞ v25 — System Types
 * Types transversaux pour configuration système
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION SYSTÈME
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration système globale
 */
export interface SystemConfig {
  version: string;
  environment: 'development' | 'production' | 'test';
  autoSave: boolean;
  autoSaveInterval: number; // secondes
  autoHeal: boolean;
  telemetry: boolean;
  features: FeatureFlags;
  paths: SystemPaths;
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  multiIA: boolean;
  quantumLayer: boolean;
  voiceCommands: boolean;
  realityRenderer: boolean;
  autoOptimization: boolean;
  [key: string]: boolean;
}

/**
 * Chemins système
 */
export interface SystemPaths {
  data: string;
  logs: string;
  cache: string;
  backup: string;
  exports: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Résultat diagnostic système
 */
export interface DiagnosticResult {
  id: string;
  category: DiagnosticCategory;
  status: DiagnosticStatus;
  message: string;
  value?: number;
  threshold?: number;
  timestamp: Date;
  recommendation?: string;
}

export type DiagnosticCategory =
  | 'cpu'
  | 'memory'
  | 'disk'
  | 'network'
  | 'engines'
  | 'database'
  | 'filesystem';

export type DiagnosticStatus = 'optimal' | 'warning' | 'critical' | 'error' | 'unknown';

/**
 * Métriques système
 */
export interface SystemMetrics {
  cpu: {
    usage: number; // %
    temperature?: number; // °C
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    percentage: number; // %
  };
  disk: {
    used: number; // bytes
    total: number; // bytes
    percentage: number; // %
  };
  uptime: number; // secondes
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO & VOIX
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Device audio
 */
export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  isDefault: boolean;
  sampleRate: number;
  channels: number;
  status: 'active' | 'inactive' | 'error';
}

/**
 * Configuration audio
 */
export interface AudioConfig {
  inputDevice?: string;
  outputDevice?: string;
  volume: number; // 0-100
  muted: boolean;
  sttEngine: string;
  ttsEngine: string;
  voiceCommands: boolean;
  noiseReduction: boolean;
}

/**
 * Mode vocal
 */
export interface VoiceMode {
  id: string;
  name: string;
  description: string;
  active: boolean;
  triggers: string?.[];
  actions: VoiceAction?.[];
}

export interface VoiceAction {
  command: string;
  action: string;
  parameters?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN & APPARENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration design
 */
export interface DesignConfig {
  theme: ThemeName;
  customTheme?: CustomTheme;
  typography: TypographySettings;
  density: UIDensity;
  animations: boolean;
  accessibility: AccessibilitySettings;
}

export type ThemeName = 'monochrome' | 'dark' | 'light' | 'custom';

export interface CustomTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
}

export interface TypographySettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  monospaceFontFamily: string;
}

export type UIDensity = 'compact' | 'normal' | 'spacious';

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// GOUVERNANCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Règle de gouvernance
 */
export interface GovernanceRule {
  id: string;
  name: string;
  description: string;
  category: GovernanceCategory;
  enabled: boolean;
  parameters?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error';
}

export type GovernanceCategory =
  | 'identity'
  | 'data'
  | 'ia'
  | 'cost'
  | 'privacy'
  | 'security';

/**
 * Politique
 */
export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: GovernanceRule?.[];
  enforced: boolean;
  owner: string;
  lastUpdated: Date;
}

/**
 * Garde-fou (any: any)
 */
export interface GuardRail {
  id: string;
  type: 'cost_limit' | 'data_limit' | 'rate_limit' | 'permission_check';
  threshold: number;
  action: 'warn' | 'block' | 'throttle';
  message: string;
  enabled: boolean;
}

/**
 * Log sensible
 */
export interface SensitiveLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  reason?: string;
  ipAddress?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Entrée de log
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  stack?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
