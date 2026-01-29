/**
 * TITANE∞ Fusion Backend - Tauri Command Wrappers
 * Week 1: Safe async bindings for Rust commands
 *
 * © 2026 Kevin Thibault / TITANE Team
 */

import { secureInvoke } from '@/lib/security';
import type {
  ActivateModulesRequest,
  ModuleActivationResponse,
  AdjustStylesRequest,
  StyleAdjustmentResponse,
  FusionError,
} from './types';
import { isModuleActivationSuccess, isStyleAdjustmentSuccess } from './types';

/**
 * Error class for Fusion command failures
 */
export class FusionCommandError extends Error {
  constructor(
    public readonly command: string,
    public readonly details: string
  ) {
    super(`Fusion command failed: ${command} - ${details}`);
    this.name = 'FusionCommandError';
  }
}

/**
 * Activate or deactivate Fusion subsystems
 *
 * @param request - Configuration changes to apply
 * @returns Promise resolving to ModuleActivationResponse
 * @throws FusionCommandError if command fails
 *
 * @example
 * ```typescript
 * const response = await activateModules({
 *   memory_sync: false,
 *   crash_protection: true,
 * });
 * ```
 */
export async function activateModules(
  request: ActivateModulesRequest
): Promise<ModuleActivationResponse> {
  try {
    const response = await secureInvoke<ModuleActivationResponse | FusionError>(
      'fusion_activate_modules',
      { request }
    );

    if (!isModuleActivationSuccess(response)) {
      throw new FusionCommandError(
        'fusion_activate_modules',
        response.message || 'Unknown error'
      );
    }

    return response;
  } catch (error) {
    if (error instanceof FusionCommandError) {
      throw error;
    }

    throw new FusionCommandError(
      'fusion_activate_modules',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Adjust UI style configuration
 *
 * @param request - Style changes to apply
 * @returns Promise resolving to StyleAdjustmentResponse
 * @throws FusionCommandError if command fails
 *
 * @example
 * ```typescript
 * const response = await adjustStyles({
 *   theme: 'light',
 *   accent_color: '#ff0000',
 *   border_radius: 12,
 * });
 * ```
 */
export async function adjustStyles(
  request: AdjustStylesRequest
): Promise<StyleAdjustmentResponse> {
  try {
    const response = await secureInvoke<StyleAdjustmentResponse | FusionError>(
      'fusion_adjust_styles',
      { request }
    );

    if (!isStyleAdjustmentSuccess(response)) {
      throw new FusionCommandError(
        'fusion_adjust_styles',
        response.message || 'Unknown error'
      );
    }

    return response;
  } catch (error) {
    if (error instanceof FusionCommandError) {
      throw error;
    }

    throw new FusionCommandError(
      'fusion_adjust_styles',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Batch activate multiple subsystems
 * Convenience wrapper for common use cases
 *
 * @param subsystems - List of subsystems to activate
 * @returns Promise resolving to ModuleActivationResponse
 */
type ModuleSubsystemKey = keyof ActivateModulesRequest;

export async function enableSubsystems(
  subsystems: ModuleSubsystemKey[]
): Promise<ModuleActivationResponse> {
  const request: ActivateModulesRequest = {};

  for (const subsystem of subsystems) {
    request[subsystem] = true;
  }

  return activateModules(request);
}

/**
 * Batch deactivate multiple subsystems
 * Convenience wrapper for common use cases
 *
 * @param subsystems - List of subsystems to deactivate
 * @returns Promise resolving to ModuleActivationResponse
 */
export async function disableSubsystems(
  subsystems: ModuleSubsystemKey[]
): Promise<ModuleActivationResponse> {
  const request: ActivateModulesRequest = {};

  for (const subsystem of subsystems) {
    request[subsystem] = false;
  }

  return activateModules(request);
}

/**
 * Apply a preset UI theme
 * Convenience wrapper for common theme configurations
 *
 * @param themeName - "light" | "dark" | "auto"
 * @returns Promise resolving to StyleAdjustmentResponse
 */
export async function applyTheme(
  themeName: 'light' | 'dark' | 'auto'
): Promise<StyleAdjustmentResponse> {
  return adjustStyles({ theme: themeName });
}

/**
 * Update a single color parameter
 * Convenience wrapper for color adjustments
 *
 * @param colorParam - Color parameter key (accent_color | primary_color | secondary_color)
 * @param hexColor - Color in #RRGGBB format
 * @returns Promise resolving to StyleAdjustmentResponse
 * @throws Error if hexColor format is invalid
 */
export async function updateColor(
  colorParam: 'accent_color' | 'primary_color' | 'secondary_color',
  hexColor: string
): Promise<StyleAdjustmentResponse> {
  // Validate hex color format
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexColor)) {
    throw new Error(`Invalid hex color format: ${hexColor}. Expected #RRGGBB or #RGB`);
  }

  return adjustStyles({
    [colorParam]: hexColor,
  });
}
