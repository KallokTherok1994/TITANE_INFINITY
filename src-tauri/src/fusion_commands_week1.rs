// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ FUSION COMMANDS — Week 1 Implementation
//   Commands: fusion_activate_modules, fusion_adjust_styles
// ═══════════════════════════════════════════════════════════════════════════
//
// Week 1 Deliverables:
// 1. fusion_activate_modules - Activate/deactivate Fusion subsystems
// 2. fusion_adjust_styles - Manage UI style configurations
//
// © 2026 Kevin Thibault / TITANE Team. Tous droits réservés.

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use chrono::Utc;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/// Module activation state for Fusion subsystems
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FusionModuleConfig {
    pub memory_sync: bool,
    pub logs_sync: bool,
    pub dataset_sync: bool,
    pub singularity_sync: bool,
    pub performance_guards: bool,
    pub auto_healing: bool,
    pub crash_protection: bool,
    pub telemetry: bool,
}

impl Default for FusionModuleConfig {
    fn default() -> Self {
        Self {
            memory_sync: true,
            logs_sync: true,
            dataset_sync: true,
            singularity_sync: true,
            performance_guards: true,
            auto_healing: true,
            crash_protection: true,
            telemetry: true,
        }
    }
}

/// Response for module activation command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleActivationResponse {
    pub success: bool,
    pub message: String,
    pub previous_state: FusionModuleConfig,
    pub new_state: FusionModuleConfig,
    pub activated_modules: Vec<String>,
    pub deactivated_modules: Vec<String>,
    pub timestamp: i64,
}

/// UI Style configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UIStyleConfig {
    pub theme: String, // "light", "dark", "auto"
    pub accent_color: String, // hex color
    pub primary_color: String,
    pub secondary_color: String,
    pub border_radius: u32, // pixels
    pub animation_duration: u32, // milliseconds
    pub font_family: String,
    pub font_size: u32, // pixels
    pub contrast_level: String, // "normal", "high", "maximum"
    pub enable_animations: bool,
    pub enable_transitions: bool,
    pub custom_css: Option<String>,
}

impl Default for UIStyleConfig {
    fn default() -> Self {
        Self {
            theme: "auto".to_string(),
            accent_color: "#06b6d4".to_string(), // cyan
            primary_color: "#1e3a8a".to_string(), // blue
            secondary_color: "#475569".to_string(), // slate
            border_radius: 8,
            animation_duration: 300,
            font_family: "system-ui, -apple-system, sans-serif".to_string(),
            font_size: 14,
            contrast_level: "normal".to_string(),
            enable_animations: true,
            enable_transitions: true,
            custom_css: None,
        }
    }
}

/// Response for style adjustment command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleAdjustmentResponse {
    pub success: bool,
    pub message: String,
    pub previous_style: UIStyleConfig,
    pub new_style: UIStyleConfig,
    pub applied_changes: Vec<String>,
    pub requires_reload: bool,
    pub timestamp: i64,
}

/// Global Fusion state (shared across threads)
pub struct FusionWeek1State {
    pub modules: Arc<Mutex<FusionModuleConfig>>,
    pub styles: Arc<Mutex<UIStyleConfig>>,
}

impl Default for FusionWeek1State {
    fn default() -> Self {
        Self {
            modules: Arc::new(Mutex::new(FusionModuleConfig::default())),
            styles: Arc::new(Mutex::new(UIStyleConfig::default())),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 1: fusion_activate_modules
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Deserialize)]
pub struct ActivateModulesRequest {
    pub memory_sync: Option<bool>,
    pub logs_sync: Option<bool>,
    pub dataset_sync: Option<bool>,
    pub singularity_sync: Option<bool>,
    pub performance_guards: Option<bool>,
    pub auto_healing: Option<bool>,
    pub crash_protection: Option<bool>,
    pub telemetry: Option<bool>,
}

/// Activate or deactivate Fusion subsystems
///
/// # Arguments
/// * `request` - Configuration changes to apply
/// * `state` - Shared Fusion state
///
/// # Returns
/// * `ModuleActivationResponse` - Result of the activation
#[tauri::command]
pub fn fusion_activate_modules(
    request: ActivateModulesRequest,
    state: tauri::State<'_, FusionWeek1State>,
) -> Result<ModuleActivationResponse, String> {
    fusion_activate_modules_internal(request, &state)
}

/// Internal implementation for testing
fn fusion_activate_modules_internal(
    request: ActivateModulesRequest,
    state: &FusionWeek1State,
) -> Result<ModuleActivationResponse, String> {
    let mut modules = state.modules.lock()
        .map_err(|e| format!("Failed to acquire module lock: {}", e))?;

    let previous_state = modules.clone();

    // Apply changes
    let mut activated = Vec::new();
    let mut deactivated = Vec::new();

    if let Some(val) = request.memory_sync {
        if val != modules.memory_sync {
            modules.memory_sync = val;
            if val {
                activated.push("memory_sync".to_string());
            } else {
                deactivated.push("memory_sync".to_string());
            }
        }
    }

    if let Some(val) = request.logs_sync {
        if val != modules.logs_sync {
            modules.logs_sync = val;
            if val {
                activated.push("logs_sync".to_string());
            } else {
                deactivated.push("logs_sync".to_string());
            }
        }
    }

    if let Some(val) = request.dataset_sync {
        if val != modules.dataset_sync {
            modules.dataset_sync = val;
            if val {
                activated.push("dataset_sync".to_string());
            } else {
                deactivated.push("dataset_sync".to_string());
            }
        }
    }

    if let Some(val) = request.singularity_sync {
        if val != modules.singularity_sync {
            modules.singularity_sync = val;
            if val {
                activated.push("singularity_sync".to_string());
            } else {
                deactivated.push("singularity_sync".to_string());
            }
        }
    }

    if let Some(val) = request.performance_guards {
        if val != modules.performance_guards {
            modules.performance_guards = val;
            if val {
                activated.push("performance_guards".to_string());
            } else {
                deactivated.push("performance_guards".to_string());
            }
        }
    }

    if let Some(val) = request.auto_healing {
        if val != modules.auto_healing {
            modules.auto_healing = val;
            if val {
                activated.push("auto_healing".to_string());
            } else {
                deactivated.push("auto_healing".to_string());
            }
        }
    }

    if let Some(val) = request.crash_protection {
        if val != modules.crash_protection {
            modules.crash_protection = val;
            if val {
                activated.push("crash_protection".to_string());
            } else {
                deactivated.push("crash_protection".to_string());
            }
        }
    }

    if let Some(val) = request.telemetry {
        if val != modules.telemetry {
            modules.telemetry = val;
            if val {
                activated.push("telemetry".to_string());
            } else {
                deactivated.push("telemetry".to_string());
            }
        }
    }

    let new_state = modules.clone();
    let total_changes = activated.len() + deactivated.len();

    let message = if total_changes > 0 {
        format!(
            "Successfully updated {} module(s): {} activated, {} deactivated",
            total_changes,
            activated.len(),
            deactivated.len()
        )
    } else {
        "No changes requested".to_string()
    };

    Ok(ModuleActivationResponse {
        success: true,
        message,
        previous_state,
        new_state,
        activated_modules: activated,
        deactivated_modules: deactivated,
        timestamp: Utc::now().timestamp(),
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 2: fusion_adjust_styles
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Deserialize)]
pub struct AdjustStylesRequest {
    pub theme: Option<String>,
    pub accent_color: Option<String>,
    pub primary_color: Option<String>,
    pub secondary_color: Option<String>,
    pub border_radius: Option<u32>,
    pub animation_duration: Option<u32>,
    pub font_family: Option<String>,
    pub font_size: Option<u32>,
    pub contrast_level: Option<String>,
    pub enable_animations: Option<bool>,
    pub enable_transitions: Option<bool>,
    pub custom_css: Option<String>,
}

/// Validate hex color format
fn is_valid_hex_color(color: &str) -> bool {
    if !color.starts_with('#') {
        return false;
    }
    let hex_part = &color[1..];
    hex_part.len() == 6 && hex_part.chars().all(|c| c.is_ascii_hexdigit())
}

/// Adjust UI style configuration
///
/// # Arguments
/// * `request` - Style configuration changes to apply
/// * `state` - Shared Fusion state
///
/// # Returns
/// * `StyleAdjustmentResponse` - Result of the style adjustment
#[tauri::command]
pub fn fusion_adjust_styles(
    request: AdjustStylesRequest,
    state: tauri::State<'_, FusionWeek1State>,
) -> Result<StyleAdjustmentResponse, String> {
    fusion_adjust_styles_internal(request, &state)
}

/// Internal implementation for testing
fn fusion_adjust_styles_internal(
    request: AdjustStylesRequest,
    state: &FusionWeek1State,
) -> Result<StyleAdjustmentResponse, String> {
    let mut styles = state.styles.lock()
        .map_err(|e| format!("Failed to acquire styles lock: {}", e))?;

    let previous_style = styles.clone();
    let mut applied_changes = Vec::new();
    let mut requires_reload = false;

    // Validate and apply theme
    if let Some(theme) = request.theme {
        if ["light", "dark", "auto"].contains(&theme.as_str()) {
            if theme != styles.theme {
                styles.theme = theme;
                applied_changes.push("theme".to_string());
                requires_reload = true;
            }
        } else {
            return Err(format!("Invalid theme: '{}'. Must be 'light', 'dark', or 'auto'", theme));
        }
    }

    // Validate and apply accent color
    if let Some(color) = request.accent_color {
        if is_valid_hex_color(&color) {
            if color != styles.accent_color {
                styles.accent_color = color;
                applied_changes.push("accent_color".to_string());
            }
        } else {
            return Err(format!("Invalid accent color: '{}'. Must be hex format (#RRGGBB)", color));
        }
    }

    // Validate and apply primary color
    if let Some(color) = request.primary_color {
        if is_valid_hex_color(&color) {
            if color != styles.primary_color {
                styles.primary_color = color;
                applied_changes.push("primary_color".to_string());
                requires_reload = true;
            }
        } else {
            return Err(format!("Invalid primary color: '{}'. Must be hex format (#RRGGBB)", color));
        }
    }

    // Validate and apply secondary color
    if let Some(color) = request.secondary_color {
        if is_valid_hex_color(&color) {
            if color != styles.secondary_color {
                styles.secondary_color = color;
                applied_changes.push("secondary_color".to_string());
                requires_reload = true;
            }
        } else {
            return Err(format!("Invalid secondary color: '{}'. Must be hex format (#RRGGBB)", color));
        }
    }

    // Apply border radius
    if let Some(radius) = request.border_radius {
        if radius <= 100 {
            if radius != styles.border_radius {
                styles.border_radius = radius;
                applied_changes.push("border_radius".to_string());
            }
        } else {
            return Err("Border radius must be between 0 and 100 pixels".to_string());
        }
    }

    // Apply animation duration
    if let Some(duration) = request.animation_duration {
        if duration <= 2000 && duration >= 50 {
            if duration != styles.animation_duration {
                styles.animation_duration = duration;
                applied_changes.push("animation_duration".to_string());
            }
        } else {
            return Err("Animation duration must be between 50 and 2000 milliseconds".to_string());
        }
    }

    // Apply font family
    if let Some(font) = request.font_family {
        if !font.is_empty() && font.len() <= 200 {
            if font != styles.font_family {
                styles.font_family = font;
                applied_changes.push("font_family".to_string());
                requires_reload = true;
            }
        } else {
            return Err("Font family must be non-empty and less than 200 characters".to_string());
        }
    }

    // Apply font size
    if let Some(size) = request.font_size {
        if size >= 8 && size <= 32 {
            if size != styles.font_size {
                styles.font_size = size;
                applied_changes.push("font_size".to_string());
            }
        } else {
            return Err("Font size must be between 8 and 32 pixels".to_string());
        }
    }

    // Validate and apply contrast level
    if let Some(contrast) = request.contrast_level {
        if ["normal", "high", "maximum"].contains(&contrast.as_str()) {
            if contrast != styles.contrast_level {
                styles.contrast_level = contrast;
                applied_changes.push("contrast_level".to_string());
            }
        } else {
            return Err(format!("Invalid contrast level: '{}'. Must be 'normal', 'high', or 'maximum'", contrast));
        }
    }

    // Apply animation toggle
    if let Some(enabled) = request.enable_animations {
        if enabled != styles.enable_animations {
            styles.enable_animations = enabled;
            applied_changes.push("enable_animations".to_string());
        }
    }

    // Apply transitions toggle
    if let Some(enabled) = request.enable_transitions {
        if enabled != styles.enable_transitions {
            styles.enable_transitions = enabled;
            applied_changes.push("enable_transitions".to_string());
        }
    }

    // Apply custom CSS
    if let Some(css) = request.custom_css {
        if css.len() <= 5000 {
            if Some(css.clone()) != styles.custom_css {
                styles.custom_css = Some(css);
                applied_changes.push("custom_css".to_string());
                requires_reload = true;
            }
        } else {
            return Err("Custom CSS must be less than 5000 characters".to_string());
        }
    }

    let new_style = styles.clone();

    let message = if !applied_changes.is_empty() {
        format!("Successfully applied {} style change(s)", applied_changes.len())
    } else {
        "No style changes requested".to_string()
    };

    Ok(StyleAdjustmentResponse {
        success: true,
        message,
        previous_style,
        new_style,
        applied_changes,
        requires_reload,
        timestamp: Utc::now().timestamp(),
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fusion_activate_modules_basic() {
        let state = FusionWeek1State::default();

        let request = ActivateModulesRequest {
            memory_sync: Some(false),
            logs_sync: None,
            dataset_sync: None,
            singularity_sync: None,
            performance_guards: None,
            auto_healing: None,
            crash_protection: None,
            telemetry: None,
        };

        let response = fusion_activate_modules_internal(request, &state).unwrap();

        assert!(response.success);
        assert_eq!(response.deactivated_modules.len(), 1);
        assert!(response.deactivated_modules.contains(&"memory_sync".to_string()));
        assert!(!response.new_state.memory_sync);
    }

    #[test]
    fn test_fusion_adjust_styles_valid_colors() {
        let state = FusionWeek1State::default();

        let request = AdjustStylesRequest {
            theme: Some("dark".to_string()),
            accent_color: Some("#ff0000".to_string()),
            primary_color: None,
            secondary_color: None,
            border_radius: None,
            animation_duration: None,
            font_family: None,
            font_size: None,
            contrast_level: None,
            enable_animations: None,
            enable_transitions: None,
            custom_css: None,
        };

        let response = fusion_adjust_styles_internal(request, &state).unwrap();

        assert!(response.success);
        assert_eq!(response.new_style.theme, "dark");
        assert_eq!(response.new_style.accent_color, "#ff0000");
        assert!(response.requires_reload);
    }

    #[test]
    fn test_fusion_adjust_styles_invalid_color() {
        let state = FusionWeek1State::default();

        let request = AdjustStylesRequest {
            theme: None,
            accent_color: Some("invalid".to_string()),
            primary_color: None,
            secondary_color: None,
            border_radius: None,
            animation_duration: None,
            font_family: None,
            font_size: None,
            contrast_level: None,
            enable_animations: None,
            enable_transitions: None,
            custom_css: None,
        };

        let result = fusion_adjust_styles_internal(request, &state);
        assert!(result.is_err());
    }

    #[test]
    fn test_hex_color_validation() {
        assert!(is_valid_hex_color("#06b6d4"));
        assert!(is_valid_hex_color("#FFFFFF"));
        assert!(is_valid_hex_color("#000000"));
        assert!(!is_valid_hex_color("06b6d4")); // missing #
        assert!(!is_valid_hex_color("#06b6d")); // too short
        assert!(!is_valid_hex_color("#06b6d444")); // too long
    }
}
