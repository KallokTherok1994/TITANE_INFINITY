// TITANE∞ - Theme Manager - Rust Backend
// Gestion des tokens UI dynamiques
//
// @license AGPL-3.0 - TITANE AI Project

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

// ============================================================================
// STRUCTURES DE DONNÉES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColorTokens {
    pub primary: String,
    pub secondary: String,
    pub accent: String,
    pub background: String,
    pub surface: String,
    #[serde(rename = "surfaceElevated")]
    pub surface_elevated: String,
    pub text: String,
    #[serde(rename = "textMuted")]
    pub text_muted: String,
    pub border: String,
    #[serde(rename = "borderFocus")]
    pub border_focus: String,
    pub success: String,
    pub warning: String,
    pub error: String,
    pub info: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypographyTokens {
    #[serde(rename = "fontFamily")]
    pub font_family: String,
    #[serde(rename = "fontFamilyMono")]
    pub font_family_mono: String,
    #[serde(rename = "fontSize")]
    pub font_size: String,
    #[serde(rename = "fontScale")]
    pub font_scale: f64,
    #[serde(rename = "lineHeight")]
    pub line_height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpacingTokens {
    pub density: String,
    #[serde(rename = "baseUnit")]
    pub base_unit: u32,
    pub xs: u32,
    pub sm: u32,
    pub md: u32,
    pub lg: u32,
    pub xl: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BorderTokens {
    pub radius: String,
    #[serde(rename = "radiusValue")]
    pub radius_value: u32,
    #[serde(rename = "radiusSm")]
    pub radius_sm: u32,
    #[serde(rename = "radiusMd")]
    pub radius_md: u32,
    #[serde(rename = "radiusLg")]
    pub radius_lg: u32,
    pub width: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationTokens {
    pub enabled: bool,
    pub speed: String,
    #[serde(rename = "durationMs")]
    pub duration_ms: u32,
    #[serde(rename = "durationFast")]
    pub duration_fast: u32,
    #[serde(rename = "durationNormal")]
    pub duration_normal: u32,
    #[serde(rename = "durationSlow")]
    pub duration_slow: u32,
    pub easing: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContrastTokens {
    pub level: String,
    pub multiplier: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShadowTokens {
    pub enabled: bool,
    pub sm: String,
    pub md: String,
    pub lg: String,
    pub focus: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UIThemeTokens {
    pub version: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "lastModified")]
    pub last_modified: String,
    pub colors: ColorTokens,
    pub typography: TypographyTokens,
    pub spacing: SpacingTokens,
    pub borders: BorderTokens,
    pub animations: AnimationTokens,
    pub contrast: ContrastTokens,
    pub shadows: ShadowTokens,
}

// ============================================================================
// ÉTAT GLOBAL
// ============================================================================

pub struct ThemeManagerState {
    pub tokens: Mutex<Option<UIThemeTokens>>,
}

impl Default for ThemeManagerState {
    fn default() -> Self {
        Self {
            tokens: Mutex::new(None),
        }
    }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/// Obtient le chemin du fichier de thème
fn get_theme_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Erreur chemin ressources: {}", e))?;

    // En développement, utiliser le chemin relatif
    let dev_path = PathBuf::from("src-tauri/data/ui_theme.json");
    if dev_path.exists() {
        return Ok(dev_path);
    }

    // En production, utiliser le dossier de ressources
    let prod_path = resource_path.join("data").join("ui_theme.json");
    if prod_path.exists() {
        return Ok(prod_path);
    }

    // Fallback sur le dossier app data
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Erreur chemin app data: {}", e))?;

    let data_dir = app_data.join("data");
    fs::create_dir_all(&data_dir).map_err(|e| format!("Erreur création dossier: {}", e))?;

    Ok(data_dir.join("ui_theme.json"))
}

/// Charge les tokens par défaut
fn get_default_tokens() -> UIThemeTokens {
    UIThemeTokens {
        version: "16.0.0".to_string(),
        name: "TITANE Monochrome v16".to_string(),
        description: "Design System Monochrome Metal - Palette neutre sophistiquée".to_string(),
        last_modified: chrono::Utc::now().to_rfc3339(),
        colors: ColorTokens {
            primary: "#727b81".to_string(),
            secondary: "#c4c4c4".to_string(),
            accent: "#93b399".to_string(),
            background: "#0f0f0f".to_string(),
            surface: "#161616".to_string(),
            surface_elevated: "#1e1e1e".to_string(),
            text: "#e8e8e8".to_string(),
            text_muted: "#9ca3af".to_string(),
            border: "#3a3a3a".to_string(),
            border_focus: "#5a5a5a".to_string(),
            success: "#93b399".to_string(),
            warning: "#a89f91".to_string(),
            error: "#8f7a7a".to_string(),
            info: "#8899aa".to_string(),
        },
        typography: TypographyTokens {
            font_family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                .to_string(),
            font_family_mono: "'JetBrains Mono', 'Fira Code', monospace".to_string(),
            font_size: "medium".to_string(),
            font_scale: 1.0,
            line_height: 1.5,
        },
        spacing: SpacingTokens {
            density: "standard".to_string(),
            base_unit: 6,
            xs: 3,
            sm: 6,
            md: 12,
            lg: 18,
            xl: 24,
        },
        borders: BorderTokens {
            radius: "medium".to_string(),
            radius_value: 8,
            radius_sm: 4,
            radius_md: 8,
            radius_lg: 12,
            width: 1,
        },
        animations: AnimationTokens {
            enabled: true,
            speed: "normal".to_string(),
            duration_ms: 200,
            duration_fast: 100,
            duration_normal: 200,
            duration_slow: 400,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)".to_string(),
        },
        contrast: ContrastTokens {
            level: "normal".to_string(),
            multiplier: 1.0,
        },
        shadows: ShadowTokens {
            enabled: true,
            sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)".to_string(),
            md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)".to_string(),
            lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)".to_string(),
            focus: "0 0 0 2px rgba(147, 179, 153, 0.3)".to_string(),
        },
    }
}

// ============================================================================
// COMMANDES TAURI
// ============================================================================

/// Charge les tokens UI depuis le fichier JSON
#[tauri::command]
pub async fn load_ui_theme(app: AppHandle) -> Result<UIThemeTokens, String> {
    let file_path = get_theme_file_path(&app)?;

    if !file_path.exists() {
        // Créer le fichier avec les valeurs par défaut
        let default_tokens = get_default_tokens();
        let json = serde_json::to_string_pretty(&default_tokens)
            .map_err(|e| format!("Erreur sérialisation: {}", e))?;
        fs::write(&file_path, json).map_err(|e| format!("Erreur écriture fichier: {}", e))?;
        return Ok(default_tokens);
    }

    let content =
        fs::read_to_string(&file_path).map_err(|e| format!("Erreur lecture fichier: {}", e))?;

    let tokens: UIThemeTokens =
        serde_json::from_str(&content).map_err(|e| format!("Erreur parsing JSON: {}", e))?;

    Ok(tokens)
}

/// Sauvegarde les tokens UI dans le fichier JSON
#[tauri::command]
pub async fn save_ui_theme(app: AppHandle, tokens: UIThemeTokens) -> Result<(), String> {
    let file_path = get_theme_file_path(&app)?;

    // Mettre à jour la date de modification
    let mut tokens = tokens;
    tokens.last_modified = chrono::Utc::now().to_rfc3339();

    let json = serde_json::to_string_pretty(&tokens)
        .map_err(|e| format!("Erreur sérialisation: {}", e))?;

    fs::write(&file_path, json).map_err(|e| format!("Erreur écriture fichier: {}", e))?;

    Ok(())
}

/// Réinitialise les tokens aux valeurs par défaut
#[tauri::command]
pub async fn reset_ui_theme(app: AppHandle) -> Result<UIThemeTokens, String> {
    let file_path = get_theme_file_path(&app)?;
    let default_tokens = get_default_tokens();

    let json = serde_json::to_string_pretty(&default_tokens)
        .map_err(|e| format!("Erreur sérialisation: {}", e))?;

    fs::write(&file_path, json).map_err(|e| format!("Erreur écriture fichier: {}", e))?;

    Ok(default_tokens)
}

/// Met à jour un token spécifique (utilisé par les commandes IA)
#[tauri::command]
pub async fn update_ui_token(
    app: AppHandle,
    category: String,
    key: String,
    value: serde_json::Value,
) -> Result<UIThemeTokens, String> {
    let mut tokens = load_ui_theme(app.clone()).await?;

    match category.as_str() {
        "colors" => {
            let colors = &mut tokens.colors;
            match key.as_str() {
                "primary" => colors.primary = value.as_str().unwrap_or(&colors.primary).to_string(),
                "secondary" => {
                    colors.secondary = value.as_str().unwrap_or(&colors.secondary).to_string()
                }
                "accent" => colors.accent = value.as_str().unwrap_or(&colors.accent).to_string(),
                "background" => {
                    colors.background = value.as_str().unwrap_or(&colors.background).to_string()
                }
                "surface" => colors.surface = value.as_str().unwrap_or(&colors.surface).to_string(),
                "surfaceElevated" => {
                    colors.surface_elevated = value
                        .as_str()
                        .unwrap_or(&colors.surface_elevated)
                        .to_string()
                }
                "text" => colors.text = value.as_str().unwrap_or(&colors.text).to_string(),
                "textMuted" => {
                    colors.text_muted = value.as_str().unwrap_or(&colors.text_muted).to_string()
                }
                "border" => colors.border = value.as_str().unwrap_or(&colors.border).to_string(),
                "borderFocus" => {
                    colors.border_focus = value.as_str().unwrap_or(&colors.border_focus).to_string()
                }
                "success" => colors.success = value.as_str().unwrap_or(&colors.success).to_string(),
                "warning" => colors.warning = value.as_str().unwrap_or(&colors.warning).to_string(),
                "error" => colors.error = value.as_str().unwrap_or(&colors.error).to_string(),
                "info" => colors.info = value.as_str().unwrap_or(&colors.info).to_string(),
                _ => return Err(format!("Clé couleur inconnue: {}", key)),
            }
        }
        "typography" => {
            let typo = &mut tokens.typography;
            match key.as_str() {
                "fontFamily" => {
                    typo.font_family = value.as_str().unwrap_or(&typo.font_family).to_string()
                }
                "fontFamilyMono" => {
                    typo.font_family_mono =
                        value.as_str().unwrap_or(&typo.font_family_mono).to_string()
                }
                "fontSize" => {
                    typo.font_size = value.as_str().unwrap_or(&typo.font_size).to_string()
                }
                "fontScale" => typo.font_scale = value.as_f64().unwrap_or(typo.font_scale),
                "lineHeight" => typo.line_height = value.as_f64().unwrap_or(typo.line_height),
                _ => return Err(format!("Clé typographie inconnue: {}", key)),
            }
        }
        "spacing" => {
            let spacing = &mut tokens.spacing;
            match key.as_str() {
                "density" => {
                    spacing.density = value.as_str().unwrap_or(&spacing.density).to_string()
                }
                "baseUnit" => {
                    spacing.base_unit = value.as_u64().unwrap_or(spacing.base_unit as u64) as u32
                }
                "xs" => spacing.xs = value.as_u64().unwrap_or(spacing.xs as u64) as u32,
                "sm" => spacing.sm = value.as_u64().unwrap_or(spacing.sm as u64) as u32,
                "md" => spacing.md = value.as_u64().unwrap_or(spacing.md as u64) as u32,
                "lg" => spacing.lg = value.as_u64().unwrap_or(spacing.lg as u64) as u32,
                "xl" => spacing.xl = value.as_u64().unwrap_or(spacing.xl as u64) as u32,
                _ => return Err(format!("Clé spacing inconnue: {}", key)),
            }
        }
        "borders" => {
            let borders = &mut tokens.borders;
            match key.as_str() {
                "radius" => borders.radius = value.as_str().unwrap_or(&borders.radius).to_string(),
                "radiusValue" => {
                    borders.radius_value =
                        value.as_u64().unwrap_or(borders.radius_value as u64) as u32
                }
                "radiusSm" => {
                    borders.radius_sm = value.as_u64().unwrap_or(borders.radius_sm as u64) as u32
                }
                "radiusMd" => {
                    borders.radius_md = value.as_u64().unwrap_or(borders.radius_md as u64) as u32
                }
                "radiusLg" => {
                    borders.radius_lg = value.as_u64().unwrap_or(borders.radius_lg as u64) as u32
                }
                "width" => borders.width = value.as_u64().unwrap_or(borders.width as u64) as u32,
                _ => return Err(format!("Clé borders inconnue: {}", key)),
            }
        }
        "animations" => {
            let anim = &mut tokens.animations;
            match key.as_str() {
                "enabled" => anim.enabled = value.as_bool().unwrap_or(anim.enabled),
                "speed" => anim.speed = value.as_str().unwrap_or(&anim.speed).to_string(),
                "durationMs" => {
                    anim.duration_ms = value.as_u64().unwrap_or(anim.duration_ms as u64) as u32
                }
                "durationFast" => {
                    anim.duration_fast = value.as_u64().unwrap_or(anim.duration_fast as u64) as u32
                }
                "durationNormal" => {
                    anim.duration_normal =
                        value.as_u64().unwrap_or(anim.duration_normal as u64) as u32
                }
                "durationSlow" => {
                    anim.duration_slow = value.as_u64().unwrap_or(anim.duration_slow as u64) as u32
                }
                "easing" => anim.easing = value.as_str().unwrap_or(&anim.easing).to_string(),
                _ => return Err(format!("Clé animations inconnue: {}", key)),
            }
        }
        "contrast" => {
            let contrast = &mut tokens.contrast;
            match key.as_str() {
                "level" => contrast.level = value.as_str().unwrap_or(&contrast.level).to_string(),
                "multiplier" => contrast.multiplier = value.as_f64().unwrap_or(contrast.multiplier),
                _ => return Err(format!("Clé contrast inconnue: {}", key)),
            }
        }
        "shadows" => {
            let shadows = &mut tokens.shadows;
            match key.as_str() {
                "enabled" => shadows.enabled = value.as_bool().unwrap_or(shadows.enabled),
                "sm" => shadows.sm = value.as_str().unwrap_or(&shadows.sm).to_string(),
                "md" => shadows.md = value.as_str().unwrap_or(&shadows.md).to_string(),
                "lg" => shadows.lg = value.as_str().unwrap_or(&shadows.lg).to_string(),
                "focus" => shadows.focus = value.as_str().unwrap_or(&shadows.focus).to_string(),
                _ => return Err(format!("Clé shadows inconnue: {}", key)),
            }
        }
        _ => return Err(format!("Catégorie inconnue: {}", category)),
    }

    save_ui_theme(app, tokens.clone()).await?;
    Ok(tokens)
}

/// Exporte les tokens au format CSS variables
#[tauri::command]
pub async fn export_ui_theme_css(app: AppHandle) -> Result<String, String> {
    let tokens = load_ui_theme(app).await?;

    let css = format!(
        r#":root {{
  /* TITANE∞ Design System Monochrome v16 - Generated */

  /* Colors */
  --color-primary: {};
  --color-secondary: {};
  --color-accent: {};
  --color-background: {};
  --color-surface: {};
  --color-surface-elevated: {};
  --color-text: {};
  --color-text-muted: {};
  --color-border: {};
  --color-border-focus: {};
  --color-success: {};
  --color-warning: {};
  --color-error: {};
  --color-info: {};

  /* Typography */
  --font-family: {};
  --font-family-mono: {};
  --font-scale: {};
  --line-height: {};

  /* Spacing */
  --spacing-xs: {}px;
  --spacing-sm: {}px;
  --spacing-md: {}px;
  --spacing-lg: {}px;
  --spacing-xl: {}px;

  /* Borders */
  --radius-sm: {}px;
  --radius-md: {}px;
  --radius-lg: {}px;
  --border-width: {}px;

  /* Animations */
  --duration-fast: {}ms;
  --duration-normal: {}ms;
  --duration-slow: {}ms;
  --easing: {};

  /* Shadows */
  --shadow-sm: {};
  --shadow-md: {};
  --shadow-lg: {};
  --shadow-focus: {};
}}"#,
        tokens.colors.primary,
        tokens.colors.secondary,
        tokens.colors.accent,
        tokens.colors.background,
        tokens.colors.surface,
        tokens.colors.surface_elevated,
        tokens.colors.text,
        tokens.colors.text_muted,
        tokens.colors.border,
        tokens.colors.border_focus,
        tokens.colors.success,
        tokens.colors.warning,
        tokens.colors.error,
        tokens.colors.info,
        tokens.typography.font_family,
        tokens.typography.font_family_mono,
        tokens.typography.font_scale,
        tokens.typography.line_height,
        tokens.spacing.xs,
        tokens.spacing.sm,
        tokens.spacing.md,
        tokens.spacing.lg,
        tokens.spacing.xl,
        tokens.borders.radius_sm,
        tokens.borders.radius_md,
        tokens.borders.radius_lg,
        tokens.borders.width,
        tokens.animations.duration_fast,
        tokens.animations.duration_normal,
        tokens.animations.duration_slow,
        tokens.animations.easing,
        tokens.shadows.sm,
        tokens.shadows.md,
        tokens.shadows.lg,
        tokens.shadows.focus,
    );

    Ok(css)
}
