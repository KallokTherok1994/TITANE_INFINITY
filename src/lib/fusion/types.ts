/**
 * TITANE∞ Fusion Backend - TypeScript Type Definitions
 * Week 1: Module activation & UI style management
 *
 * Type-safe interfaces for Rust-Frontend communication via Tauri
 * © 2026 Kevin Thibault / TITANE Team
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 1: fusion_activate_modules
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Request to activate/deactivate Fusion subsystems
 * All fields are optional - only specified fields will be modified
 */
export interface ActivateModulesRequest {
  /** Toggle memory synchronization subsystem */
  memory_sync?: boolean;
  /** Toggle logs synchronization subsystem */
  logs_sync?: boolean;
  /** Toggle dataset synchronization subsystem */
  dataset_sync?: boolean;
  /** Toggle singularity synchronization subsystem */
  singularity_sync?: boolean;
  /** Toggle performance guards subsystem */
  performance_guards?: boolean;
  /** Toggle auto-healing subsystem */
  auto_healing?: boolean;
  /** Toggle crash protection subsystem */
  crash_protection?: boolean;
  /** Toggle telemetry subsystem */
  telemetry?: boolean;
}

/**
 * State of a Fusion module
 * Represents the current configuration of all 8 subsystems
 */
export interface FusionModuleConfig {
  memory_sync: boolean;
  logs_sync: boolean;
  dataset_sync: boolean;
  singularity_sync: boolean;
  performance_guards: boolean;
  auto_healing: boolean;
  crash_protection: boolean;
  telemetry: boolean;
}

/**
 * Response from fusion_activate_modules command
 */
export interface ModuleActivationResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Human-readable status message */
  message: string;
  /** Module state before changes */
  previous_state: FusionModuleConfig;
  /** Module state after changes */
  new_state: FusionModuleConfig;
  /** List of modules that were activated */
  activated_modules: string[];
  /** List of modules that were deactivated */
  deactivated_modules: string[];
  /** ISO 8601 timestamp of the operation */
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 2: fusion_adjust_styles
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Request to adjust UI style configuration
 * All fields are optional - only specified fields will be modified
 */
export interface AdjustStylesRequest {
  /** UI theme: "light" | "dark" | "auto" */
  theme?: string;
  /** Accent color as hex (#RRGGBB) */
  accent_color?: string;
  /** Primary color as hex (#RRGGBB) */
  primary_color?: string;
  /** Secondary color as hex (#RRGGBB) */
  secondary_color?: string;
  /** Border radius in pixels (0-100) */
  border_radius?: number;
  /** Animation duration in milliseconds */
  animation_duration?: number;
  /** Primary font family */
  font_family?: string;
  /** Secondary font family */
  font_size?: number;
  /** Contrast level: "normal" | "high" | "max" */
  contrast_level?: string;
  /** Enable UI animations */
  enable_animations?: boolean;
  /** Enable CSS transitions */
  enable_transitions?: boolean;
  /** Custom CSS rules (optional) */
  custom_css?: string;
}

/**
 * Complete UI style configuration
 * Represents all 12 configurable UI parameters
 */
export interface UIStyleConfig {
  theme: string;
  accent_color: string;
  primary_color: string;
  secondary_color: string;
  border_radius: number;
  animation_duration: number;
  font_family: string;
  font_size: number;
  contrast_level: string;
  enable_animations: boolean;
  enable_transitions: boolean;
  custom_css: string;
}

/**
 * Response from fusion_adjust_styles command
 */
export interface StyleAdjustmentResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Human-readable status message */
  message: string;
  /** UI configuration before changes */
  previous_style: UIStyleConfig;
  /** UI configuration after changes */
  new_style: UIStyleConfig;
  /** List of parameters that were changed */
  applied_changes: string[];
  /** Whether page reload is required */
  requires_reload: boolean;
  /** ISO 8601 timestamp of the operation */
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Common response wrapper for errors
 */
export interface FusionError {
  success: false;
  message: string;
  code?: string;
}

/**
 * Type guard to check if response is successful
 */
export function isModuleActivationSuccess(
  response: ModuleActivationResponse | FusionError
): response is ModuleActivationResponse {
  return response.success !== false && 'new_state' in response;
}

/**
 * Type guard to check if response is successful
 */
export function isStyleAdjustmentSuccess(
  response: StyleAdjustmentResponse | FusionError
): response is StyleAdjustmentResponse {
  return response.success !== false && 'new_style' in response;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** All available Fusion subsystems */
export const FUSION_SUBSYSTEMS = [
  'memory_sync',
  'logs_sync',
  'dataset_sync',
  'singularity_sync',
  'performance_guards',
  'auto_healing',
  'crash_protection',
  'telemetry',
] as const;

/** All configurable UI style parameters */
export const UI_STYLE_PARAMETERS = [
  'theme',
  'accent_color',
  'primary_color',
  'secondary_color',
  'border_radius',
  'animation_duration',
  'font_family',
  'font_size',
  'contrast_level',
  'enable_animations',
  'enable_transitions',
  'custom_css',
] as const;

/** Default UI style configuration */
export const DEFAULT_UI_STYLE: UIStyleConfig = {
  theme: 'dark',
  accent_color: '#06b6d4',
  primary_color: '#0f172a',
  secondary_color: '#1e293b',
  border_radius: 8,
  animation_duration: 300,
  font_family: 'Inter, system-ui, sans-serif',
  font_size: 14,
  contrast_level: 'normal',
  enable_animations: true,
  enable_transitions: true,
  custom_css: '',
};

/** Default module configuration (all subsystems enabled) */
export const DEFAULT_MODULE_CONFIG: FusionModuleConfig = {
  memory_sync: true,
  logs_sync: true,
  dataset_sync: true,
  singularity_sync: true,
  performance_guards: true,
  auto_healing: true,
  crash_protection: true,
  telemetry: true,
};
