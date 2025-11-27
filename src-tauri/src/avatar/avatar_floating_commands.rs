// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — AVATAR FLOATING WINDOW COMMANDS
//   Tauri Backend Commands for Floating Window Management
// ═══════════════════════════════════════════════════════════════════════════════

use tauri::{AppHandle, Manager};
use crate::avatar::avatar_display_state::*;

// ═══════════════════════════════════════════════════════════════════════════════
// DISPLAY STATE COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Récupère l'état d'affichage actuel
#[tauri::command]
pub async fn avatar_get_display_state() -> Result<AvatarDisplayState, String> {
    get_display_state()
}

/// Définit l'état d'affichage complet (override)
#[tauri::command]
pub async fn avatar_set_display_state(state: AvatarDisplayState) -> Result<AvatarDisplayState, String> {
    set_display_state(state)
}

/// Met à jour l'état d'affichage (partiel)
#[tauri::command]
pub async fn avatar_update_display_state(update: AvatarDisplayStateUpdate) -> Result<AvatarDisplayState, String> {
    update_display_state(update)
}

/// Reset l'état d'affichage aux valeurs par défaut
#[tauri::command]
pub async fn avatar_reset_display_state() -> Result<AvatarDisplayState, String> {
    reset_display_state()
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODE COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Active le mode fenêtre flottante
#[tauri::command]
pub async fn avatar_mode_floating(app: AppHandle) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        mode: Some(AvatarDisplayMode::Floating),
        visible: Some(true),
        ..Default::default()
    };

    let state = update_display_state(update)?;

    // Affiche la fenêtre flottante
    if let Some(window) = app.get_webview_window("avatar-floating") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().ok();
    }

    Ok(state)
}

/// Active le mode intégré (dans fenêtre principale)
#[tauri::command]
pub async fn avatar_mode_embed(app: AppHandle) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        mode: Some(AvatarDisplayMode::Embed),
        visible: Some(true),
        ..Default::default()
    };

    let state = update_display_state(update)?;

    // Cache la fenêtre flottante
    if let Some(window) = app.get_webview_window("avatar-floating") {
        window.hide().map_err(|e| e.to_string())?;
    }

    Ok(state)
}

/// Cache l'avatar complètement
#[tauri::command]
pub async fn avatar_mode_hidden(app: AppHandle) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        mode: Some(AvatarDisplayMode::Hidden),
        visible: Some(false),
        ..Default::default()
    };

    let state = update_display_state(update)?;

    // Cache la fenêtre flottante
    if let Some(window) = app.get_webview_window("avatar-floating") {
        window.hide().map_err(|e| e.to_string())?;
    }

    Ok(state)
}

// ═══════════════════════════════════════════════════════════════════════════════
// WINDOW PROPERTY COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Change la position de la fenêtre flottante
#[tauri::command]
pub async fn avatar_set_position(app: AppHandle, x: i32, y: i32) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        position: Some((x, y)),
        anchor: Some(AnchorPosition::Free),
        ..Default::default()
    };

    let state = update_display_state(update)?;

    if let Some(window) = app.get_webview_window("avatar-floating") {
        use tauri::PhysicalPosition;
        window.set_position(PhysicalPosition { x, y })
            .map_err(|e| e.to_string())?;
    }

    Ok(state)
}

/// Change la taille de la fenêtre flottante
#[tauri::command]
pub async fn avatar_set_size(app: AppHandle, width: u32, height: u32) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        width: Some(width),
        height: Some(height),
        ..Default::default()
    };

    let state = update_display_state(update)?;

    if let Some(window) = app.get_webview_window("avatar-floating") {
        use tauri::PhysicalSize;
        window.set_size(PhysicalSize { width, height })
            .map_err(|e| e.to_string())?;
    }

    Ok(state)
}

/// Change l'échelle de l'avatar (0.1 à 2.0)
#[tauri::command]
pub async fn avatar_set_scale(scale: f32) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        scale: Some(scale),
        ..Default::default()
    };

    update_display_state(update)
}

/// Change l'opacité de la fenêtre (0.0 à 1.0)
#[tauri::command]
pub async fn avatar_set_opacity(opacity: f32) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        opacity: Some(opacity),
        ..Default::default()
    };

    update_display_state(update)
}

/// Active/désactive le mode "Always On Top"
#[tauri::command]
pub async fn avatar_set_always_on_top(app: AppHandle, always_on_top: bool) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        always_on_top: Some(always_on_top),
        ..Default::default()
    };

    let state = update_display_state(update)?;

    if let Some(window) = app.get_webview_window("avatar-floating") {
        window.set_always_on_top(always_on_top)
            .map_err(|e| e.to_string())?;
    }

    Ok(state)
}

/// Active/désactive le verrouillage (empêche drag & resize)
#[tauri::command]
pub async fn avatar_set_locked(locked: bool) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        locked: Some(locked),
        ..Default::default()
    };

    update_display_state(update)
}

/// Active/désactive le mode miroir horizontal
#[tauri::command]
pub async fn avatar_set_mirror_mode(mirror_mode: bool) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        mirror_mode: Some(mirror_mode),
        ..Default::default()
    };

    update_display_state(update)
}

/// Active/désactive le click-through (passthrough)
#[tauri::command]
pub async fn avatar_set_click_through(app: AppHandle, click_through: bool) -> Result<AvatarDisplayState, String> {
    let update = AvatarDisplayStateUpdate {
        click_through: Some(click_through),
        ..Default::default()
    };

    let state = update_display_state(update)?;

    if let Some(window) = app.get_webview_window("avatar-floating") {
        window.set_ignore_cursor_events(click_through)
            .map_err(|e| e.to_string())?;
    }

    Ok(state)
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANCHOR COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Ancre la fenêtre à une position prédéfinie
#[tauri::command]
pub async fn avatar_set_anchor(
    app: AppHandle,
    anchor: AnchorPosition,
) -> Result<AvatarDisplayState, String> {
    // Récupère les infos de l'écran
    let (screen_width, screen_height) = if let Some(window) = app.get_webview_window("avatar-floating") {
        if let Ok(monitor) = window.current_monitor() {
            if let Some(monitor) = monitor {
                let size = monitor.size();
                (size.width, size.height)
            } else {
                (1920, 1080) // Fallback
            }
        } else {
            (1920, 1080) // Fallback
        }
    } else {
        (1920, 1080) // Fallback
    };

    let state = get_display_state()?;
    let position = calculate_anchored_position(
        &anchor,
        screen_width,
        screen_height,
        state.width,
        state.height,
        20, // Margin 20px
    );

    let update = AvatarDisplayStateUpdate {
        position: Some(position),
        anchor: Some(anchor),
        ..Default::default()
    };

    let new_state = update_display_state(update)?;

    if let Some(window) = app.get_webview_window("avatar-floating") {
        use tauri::PhysicalPosition;
        window.set_position(PhysicalPosition { x: position.0, y: position.1 })
            .map_err(|e| e.to_string())?;
    }

    Ok(new_state)
}

/// Ancre la fenêtre via une chaîne de caractères (parsing NLP)
#[tauri::command]
pub async fn avatar_set_anchor_by_name(
    app: AppHandle,
    anchor_name: String,
) -> Result<AvatarDisplayState, String> {
    let anchor = parse_anchor_position(&anchor_name)
        .ok_or_else(|| format!("Unknown anchor position: {}", anchor_name))?;

    avatar_set_anchor(app, anchor).await
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-SCREEN COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Liste tous les écrans disponibles
#[tauri::command]
pub async fn avatar_list_screens(app: AppHandle) -> Result<Vec<ScreenInfo>, String> {
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(monitors) = window.available_monitors() {
            let screens: Vec<ScreenInfo> = monitors
                .into_iter()
                .enumerate()
                .map(|(index, monitor)| {
                    let size = monitor.size();
                    let position = monitor.position();
                    ScreenInfo {
                        index,
                        name: monitor.name().map(String::from).unwrap_or_else(|| format!("Screen {}", index)),
                        width: size.width,
                        height: size.height,
                        x: position.x,
                        y: position.y,
                        scale_factor: monitor.scale_factor(),
                    }
                })
                .collect();

            return Ok(screens);
        }
    }

    Err("Failed to retrieve screen information".to_string())
}

/// Déplace la fenêtre flottante vers un écran spécifique
#[tauri::command]
pub async fn avatar_move_to_screen(
    app: AppHandle,
    screen_index: usize,
) -> Result<AvatarDisplayState, String> {
    let screens = avatar_list_screens(app.clone()).await?;

    if screen_index >= screens.len() {
        return Err(format!("Screen index {} out of bounds (max: {})", screen_index, screens.len() - 1));
    }

    let screen = &screens[screen_index];
    let state = get_display_state()?;

    // Calcule position ancrée sur le nouvel écran
    let position = calculate_anchored_position(
        &state.anchor,
        screen.width,
        screen.height,
        state.width,
        state.height,
        20,
    );

    // Ajoute l'offset de l'écran
    let final_position = (
        screen.x + position.0,
        screen.y + position.1,
    );

    let update = AvatarDisplayStateUpdate {
        screen_index: Some(screen_index),
        position: Some(final_position),
        ..Default::default()
    };

    let new_state = update_display_state(update)?;

    if let Some(window) = app.get_webview_window("avatar-floating") {
        use tauri::PhysicalPosition;
        window.set_position(PhysicalPosition { x: final_position.0, y: final_position.1 })
            .map_err(|e| e.to_string())?;
    }

    Ok(new_state)
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ScreenInfo {
    pub index: usize,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub scale_factor: f64,
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_display_state() {
        let result = avatar_get_display_state().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_set_scale() {
        let result = avatar_set_scale(0.5).await;
        assert!(result.is_ok());

        let state = result.unwrap();
        assert_eq!(state.scale, 0.5);
    }

    #[tokio::test]
    async fn test_set_opacity() {
        let result = avatar_set_opacity(0.8).await;
        assert!(result.is_ok());

        let state = result.unwrap();
        assert_eq!(state.opacity, 0.8);
    }
}
