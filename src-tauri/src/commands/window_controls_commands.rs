// TITANE_INFINITY v26.2.0 — Window Controls Commands
// Zoom & Fullscreen functionality
// NOTE: Zoom handled client-side via CSS, server tracks state

use tauri::{command, Emitter, Window};
use std::sync::Mutex;

// Global zoom state per window
lazy_static::lazy_static! {
    static ref ZOOM_LEVELS: Mutex<std::collections::HashMap<String, f64>> = Mutex::new(std::collections::HashMap::new());
}

/// Get current zoom level (returns scale factor)
#[command]
pub async fn window_get_zoom(window: Window) -> Result<f64, String> {
    let label = window.label().to_string();
    let levels = ZOOM_LEVELS.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(*levels.get(&label).unwrap_or(&1.0))
}

/// Set zoom level (emits event to frontend for CSS application)
#[command]
pub async fn window_set_zoom(window: Window, level: f64) -> Result<(), String> {
    let clamped_level = level.clamp(0.5, 5.0); // Clamp between 50% and 500%
    
    // Store zoom level
    let label = window.label().to_string();
    {
        let mut levels = ZOOM_LEVELS.lock().map_err(|e| format!("Lock error: {}", e))?;
        levels.insert(label, clamped_level);
    }
    
    // Emit event to frontend to apply CSS zoom
    window
        .emit("zoom-change", clamped_level)
        .map_err(|e| format!("Failed to emit zoom event: {}", e))?;
    
    Ok(())
}

/// Increment zoom level by step
#[command]
pub async fn window_zoom_in(window: Window) -> Result<f64, String> {
    let current = window_get_zoom(window.clone()).await?;
    let new_level = (current + 0.1).min(5.0);
    window_set_zoom(window, new_level).await?;
    Ok(new_level)
}

/// Decrement zoom level by step
#[command]
pub async fn window_zoom_out(window: Window) -> Result<f64, String> {
    let current = window_get_zoom(window.clone()).await?;
    let new_level = (current - 0.1).max(0.5);
    window_set_zoom(window, new_level).await?;
    Ok(new_level)
}

/// Reset zoom to 100%
#[command]
pub async fn window_zoom_reset(window: Window) -> Result<(), String> {
    window_set_zoom(window, 1.0).await
}

/// Toggle fullscreen mode
#[command]
pub async fn window_toggle_fullscreen(window: Window) -> Result<bool, String> {
    let is_fullscreen = window
        .is_fullscreen()
        .map_err(|e| format!("Failed to check fullscreen state: {}", e))?;
    
    window
        .set_fullscreen(!is_fullscreen)
        .map_err(|e| format!("Failed to toggle fullscreen: {}", e))?;
    
    Ok(!is_fullscreen)
}

/// Set fullscreen mode explicitly
#[command]
pub async fn window_set_fullscreen(window: Window, fullscreen: bool) -> Result<(), String> {
    window
        .set_fullscreen(fullscreen)
        .map_err(|e| format!("Failed to set fullscreen: {}", e))
}

/// Check if window is in fullscreen mode
#[command]
pub async fn window_is_fullscreen(window: Window) -> Result<bool, String> {
    window
        .is_fullscreen()
        .map_err(|e| format!("Failed to check fullscreen state: {}", e))
}
