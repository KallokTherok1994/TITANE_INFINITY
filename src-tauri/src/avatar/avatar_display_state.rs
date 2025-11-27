// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — AVATAR DISPLAY STATE
//   Floating Window State Management
// ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::{Arc, RwLock};
use once_cell::sync::Lazy;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Mode d'affichage avatar
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
#[derive(Default)]
pub enum AvatarDisplayMode {
    Floating,  // Fenêtre flottante indépendante
    #[default]
    Embed,     // Intégré dans fenêtre principale
    Hidden,    // Caché
}


/// Position d'ancrage pour la fenêtre flottante
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
#[derive(Default)]
pub enum AnchorPosition {
    TopLeft,
    TopCenter,
    TopRight,
    CenterLeft,
    Center,
    CenterRight,
    BottomLeft,
    BottomCenter,
    #[default]
    BottomRight,
    Free,  // Position libre (drag)
}


/// État d'affichage complet de l'avatar
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvatarDisplayState {
    // Mode & Position
    pub mode: AvatarDisplayMode,
    pub position: (i32, i32),  // (x, y) en pixels
    pub anchor: AnchorPosition,
    pub screen_index: usize,   // Index de l'écran (0 = principal)

    // Dimensions
    pub width: u32,
    pub height: u32,
    pub scale: f32,            // 0.1 à 2.0

    // Apparence
    pub opacity: f32,          // 0.0 à 1.0
    pub brightness: f32,       // 0.0 à 2.0

    // Comportement
    pub always_on_top: bool,
    pub mirror_mode: bool,     // Effet miroir horizontal
    pub locked: bool,          // Verrouillage drag & resize
    pub click_through: bool,   // Passthrough des clics

    // État
    pub visible: bool,
    pub last_updated: i64,     // Timestamp
}

impl Default for AvatarDisplayState {
    fn default() -> Self {
        Self {
            mode: AvatarDisplayMode::Embed,
            position: (0, 0),
            anchor: AnchorPosition::BottomRight,
            screen_index: 0,
            width: 400,
            height: 600,
            scale: 1.0,
            opacity: 1.0,
            brightness: 1.0,
            always_on_top: false,
            mirror_mode: false,
            locked: false,
            click_through: false,
            visible: true,
            last_updated: chrono::Utc::now().timestamp(),
        }
    }
}

impl AvatarDisplayState {
    /// Crée un nouvel état avec valeurs par défaut
    pub fn new() -> Self {
        Self::default()
    }

    /// Valide les valeurs et applique les contraintes
    pub fn validate(&mut self) {
        // Contraintes scale (0.1 à 2.0)
        self.scale = self.scale.clamp(0.1, 2.0);

        // Contraintes opacity (0.0 à 1.0)
        self.opacity = self.opacity.clamp(0.0, 1.0);

        // Contraintes brightness (0.0 à 2.0)
        self.brightness = self.brightness.clamp(0.0, 2.0);

        // Dimensions minimales
        self.width = self.width.max(200);
        self.height = self.height.max(300);

        // Update timestamp
        self.last_updated = chrono::Utc::now().timestamp();
    }

    /// Applique une mise à jour partielle
    pub fn apply_update(&mut self, update: AvatarDisplayStateUpdate) {
        if let Some(mode) = update.mode {
            self.mode = mode;
        }
        if let Some(position) = update.position {
            self.position = position;
        }
        if let Some(anchor) = update.anchor {
            self.anchor = anchor;
        }
        if let Some(screen_index) = update.screen_index {
            self.screen_index = screen_index;
        }
        if let Some(width) = update.width {
            self.width = width;
        }
        if let Some(height) = update.height {
            self.height = height;
        }
        if let Some(scale) = update.scale {
            self.scale = scale;
        }
        if let Some(opacity) = update.opacity {
            self.opacity = opacity;
        }
        if let Some(brightness) = update.brightness {
            self.brightness = brightness;
        }
        if let Some(always_on_top) = update.always_on_top {
            self.always_on_top = always_on_top;
        }
        if let Some(mirror_mode) = update.mirror_mode {
            self.mirror_mode = mirror_mode;
        }
        if let Some(locked) = update.locked {
            self.locked = locked;
        }
        if let Some(click_through) = update.click_through {
            self.click_through = click_through;
        }
        if let Some(visible) = update.visible {
            self.visible = visible;
        }

        self.validate();
    }

    /// Clone avec timestamp mis à jour
    pub fn clone_with_update(&self) -> Self {
        let mut cloned = self.clone();
        cloned.last_updated = chrono::Utc::now().timestamp();
        cloned
    }
}

/// Mise à jour partielle de l'état d'affichage
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AvatarDisplayStateUpdate {
    pub mode: Option<AvatarDisplayMode>,
    pub position: Option<(i32, i32)>,
    pub anchor: Option<AnchorPosition>,
    pub screen_index: Option<usize>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub scale: Option<f32>,
    pub opacity: Option<f32>,
    pub brightness: Option<f32>,
    pub always_on_top: Option<bool>,
    pub mirror_mode: Option<bool>,
    pub locked: Option<bool>,
    pub click_through: Option<bool>,
    pub visible: Option<bool>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

pub static AVATAR_DISPLAY_STATE: Lazy<Arc<RwLock<AvatarDisplayState>>> =
    Lazy::new(|| Arc::new(RwLock::new(AvatarDisplayState::default())));

/// Récupère l'état d'affichage actuel
pub fn get_display_state() -> Result<AvatarDisplayState, String> {
    AVATAR_DISPLAY_STATE
        .read()
        .map(|state| state.clone())
        .map_err(|e| format!("Failed to read display state: {}", e))
}

/// Définit l'état d'affichage complet (override)
pub fn set_display_state(mut new_state: AvatarDisplayState) -> Result<AvatarDisplayState, String> {
    new_state.validate();

    AVATAR_DISPLAY_STATE
        .write()
        .map(|mut state| {
            *state = new_state.clone();
            state.clone()
        })
        .map_err(|e| format!("Failed to write display state: {}", e))
}

/// Met à jour l'état d'affichage (partiel)
pub fn update_display_state(update: AvatarDisplayStateUpdate) -> Result<AvatarDisplayState, String> {
    AVATAR_DISPLAY_STATE
        .write()
        .map(|mut state| {
            state.apply_update(update);
            state.clone()
        })
        .map_err(|e| format!("Failed to update display state: {}", e))
}

/// Reset à l'état par défaut
pub fn reset_display_state() -> Result<AvatarDisplayState, String> {
    set_display_state(AvatarDisplayState::default())
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/// Calcule la position ancrée pour une résolution donnée
pub fn calculate_anchored_position(
    anchor: &AnchorPosition,
    screen_width: u32,
    screen_height: u32,
    window_width: u32,
    window_height: u32,
    margin: u32,
) -> (i32, i32) {
    match anchor {
        AnchorPosition::TopLeft => (margin as i32, margin as i32),
        AnchorPosition::TopCenter => (
            ((screen_width / 2) - (window_width / 2)) as i32,
            margin as i32,
        ),
        AnchorPosition::TopRight => (
            (screen_width - window_width - margin) as i32,
            margin as i32,
        ),
        AnchorPosition::CenterLeft => (
            margin as i32,
            ((screen_height / 2) - (window_height / 2)) as i32,
        ),
        AnchorPosition::Center => (
            ((screen_width / 2) - (window_width / 2)) as i32,
            ((screen_height / 2) - (window_height / 2)) as i32,
        ),
        AnchorPosition::CenterRight => (
            (screen_width - window_width - margin) as i32,
            ((screen_height / 2) - (window_height / 2)) as i32,
        ),
        AnchorPosition::BottomLeft => (
            margin as i32,
            (screen_height - window_height - margin) as i32,
        ),
        AnchorPosition::BottomCenter => (
            ((screen_width / 2) - (window_width / 2)) as i32,
            (screen_height - window_height - margin) as i32,
        ),
        AnchorPosition::BottomRight => (
            (screen_width - window_width - margin) as i32,
            (screen_height - window_height - margin) as i32,
        ),
        AnchorPosition::Free => (0, 0), // Position libre (drag)
    }
}

/// Parse une chaîne d'ancrage en AnchorPosition
pub fn parse_anchor_position(anchor_str: &str) -> Option<AnchorPosition> {
    match anchor_str.to_lowercase().as_str() {
        "top-left" | "topleft" | "haut-gauche" | "coin haut gauche" => Some(AnchorPosition::TopLeft),
        "top-center" | "topcenter" | "haut-centre" | "haut centre" => Some(AnchorPosition::TopCenter),
        "top-right" | "topright" | "haut-droite" | "coin haut droite" => Some(AnchorPosition::TopRight),
        "center-left" | "centerleft" | "centre-gauche" => Some(AnchorPosition::CenterLeft),
        "center" | "centre" | "milieu" => Some(AnchorPosition::Center),
        "center-right" | "centerright" | "centre-droite" => Some(AnchorPosition::CenterRight),
        "bottom-left" | "bottomleft" | "bas-gauche" | "coin bas gauche" => Some(AnchorPosition::BottomLeft),
        "bottom-center" | "bottomcenter" | "bas-centre" | "bas centre" => Some(AnchorPosition::BottomCenter),
        "bottom-right" | "bottomright" | "bas-droite" | "coin bas droite" => Some(AnchorPosition::BottomRight),
        "free" | "libre" | "custom" => Some(AnchorPosition::Free),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_state() {
        let state = AvatarDisplayState::default();
        assert_eq!(state.mode, AvatarDisplayMode::Embed);
        assert_eq!(state.width, 400);
        assert_eq!(state.height, 600);
        assert_eq!(state.scale, 1.0);
        assert_eq!(state.opacity, 1.0);
    }

    #[test]
    fn test_validate_constraints() {
        let mut state = AvatarDisplayState::default();
        state.scale = 5.0;
        state.opacity = -0.5;
        state.brightness = 3.0;
        state.width = 50;
        state.height = 100;

        state.validate();

        assert_eq!(state.scale, 2.0);  // Clamped to max
        assert_eq!(state.opacity, 0.0); // Clamped to min
        assert_eq!(state.brightness, 2.0); // Clamped to max
        assert_eq!(state.width, 200);  // Min width
        assert_eq!(state.height, 300); // Min height
    }

    #[test]
    fn test_apply_update() {
        let mut state = AvatarDisplayState::default();
        let update = AvatarDisplayStateUpdate {
            scale: Some(0.5),
            opacity: Some(0.8),
            always_on_top: Some(true),
            ..Default::default()
        };

        state.apply_update(update);

        assert_eq!(state.scale, 0.5);
        assert_eq!(state.opacity, 0.8);
        assert!(state.always_on_top);
        assert_eq!(state.mode, AvatarDisplayMode::Embed); // Unchanged
    }

    #[test]
    fn test_calculate_anchored_position() {
        let pos = calculate_anchored_position(
            &AnchorPosition::BottomRight,
            1920,
            1080,
            400,
            600,
            20,
        );

        assert_eq!(pos, (1500, 460)); // (1920-400-20, 1080-600-20)
    }

    #[test]
    fn test_parse_anchor_position() {
        assert_eq!(parse_anchor_position("haut-droite"), Some(AnchorPosition::TopRight));
        assert_eq!(parse_anchor_position("coin bas gauche"), Some(AnchorPosition::BottomLeft));
        assert_eq!(parse_anchor_position("centre"), Some(AnchorPosition::Center));
        assert_eq!(parse_anchor_position("invalid"), None);
    }
}
