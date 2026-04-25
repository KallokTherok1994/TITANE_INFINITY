// src-tauri/src/commands/display_system_commands.rs
// Commandes Tauri pour le contrôle des paramètres d'affichage (expérimental)
// (c) TITANE_INFINITY 2026

use tauri::command;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DisplayEnvironment {
    pub resolution: Option<String>, // e.g. "1920x1080"
    pub brightness: Option<u8>,     // 0-100
    pub quality: Option<String>,    // e.g. "high", "medium", "low"
    pub monitor_count: Option<u8>,
    pub active_monitor: Option<u8>,
    pub color_depth: Option<u8>,    // bits
    pub refresh_rate: Option<u16>,  // Hz
}

#[command]
pub async fn display_get_environment() -> Result<DisplayEnvironment, String> {
    // TODO: Intégrer la détection réelle via API système (Linux/X11/Wayland)
    Ok(DisplayEnvironment {
        resolution: Some("1920x1080".to_string()),
        brightness: Some(80),
        quality: Some("high".to_string()),
        monitor_count: Some(1),
        active_monitor: Some(0),
        color_depth: Some(24),
        refresh_rate: Some(60),
    })
}

#[command]
pub async fn display_list_monitors() -> Result<Vec<String>, String> {
    // TODO: Lister les moniteurs connectés (stub)
    Ok(vec!["Monitor 0: HDMI-1 (1920x1080)".to_string()])
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DisplaySettingsUpdate {
    pub resolution: Option<String>,
    pub brightness: Option<u8>,
    pub quality: Option<String>,
    pub active_monitor: Option<u8>,
}

#[command]
pub async fn display_set_environment(update: DisplaySettingsUpdate) -> Result<bool, String> {
    // TODO: Appliquer les changements via API système (stub)
    // Pour l’instant, toujours succès
    Ok(true)
}
