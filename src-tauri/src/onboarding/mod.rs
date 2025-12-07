/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   ONBOARDING MODULE - Gestion onboarding utilisateur
 *   First-run detection + sauvegarde préférences
 * ═══════════════════════════════════════════════════════════════
 */

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::State;
use std::sync::Mutex;

/**
 * Préférences d'onboarding
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnboardingPreferences {
    pub theme: String,
    pub language: String,
    pub enable_analytics: bool,
    pub completed_at: Option<String>,
}

/**
 * État de l'onboarding
 */
#[derive(Debug)]
pub struct OnboardingState {
    pub completed: bool,
    pub preferences: Option<OnboardingPreferences>,
}

impl Default for OnboardingState {
    fn default() -> Self {
        Self {
            completed: false,
            preferences: None,
        }
    }
}

/**
 * Obtient le chemin du fichier de configuration onboarding
 */
fn get_onboarding_config_path() -> Result<PathBuf, String> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Could not find config directory".to_string())?;

    let titane_dir = config_dir.join("TITANE");

    // Créer le dossier s'il n'existe pas
    if !titane_dir.exists() {
        fs::create_dir_all(&titane_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    Ok(titane_dir.join("onboarding.json"))
}

/**
 * Charge les préférences d'onboarding depuis le disque
 */
fn load_onboarding_preferences() -> Result<Option<OnboardingPreferences>, String> {
    let config_path = get_onboarding_config_path()?;

    if !config_path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read onboarding config: {}", e))?;

    let preferences: OnboardingPreferences = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse onboarding config: {}", e))?;

    Ok(Some(preferences))
}

/**
 * Sauvegarde les préférences d'onboarding sur le disque
 */
fn save_onboarding_preferences(preferences: &OnboardingPreferences) -> Result<(), String> {
    let config_path = get_onboarding_config_path()?;

    let content = serde_json::to_string_pretty(preferences)
        .map_err(|e| format!("Failed to serialize onboarding preferences: {}", e))?;

    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write onboarding config: {}", e))?;

    Ok(())
}

/**
 * Tauri Command : Vérifie si l'onboarding est complété
 */
#[tauri::command]
pub async fn is_onboarding_complete(
    state: State<'_, Mutex<OnboardingState>>
) -> Result<bool, String> {
    // Essayer de charger depuis l'état
    {
        let onboarding_state = state.lock()
            .map_err(|e| format!("Failed to lock onboarding state: {}", e))?;

        if onboarding_state.completed {
            return Ok(true);
        }
    }

    // Si pas dans l'état, charger depuis le disque
    match load_onboarding_preferences()? {
        Some(preferences) => {
            // Mettre à jour l'état
            let mut onboarding_state = state.lock()
                .map_err(|e| format!("Failed to lock onboarding state: {}", e))?;

            onboarding_state.completed = true;
            onboarding_state.preferences = Some(preferences);

            Ok(true)
        }
        None => Ok(false),
    }
}

/**
 * Tauri Command : Complète l'onboarding et sauvegarde les préférences
 */
#[tauri::command]
pub async fn complete_onboarding(
    preferences: OnboardingPreferences,
    state: State<'_, Mutex<OnboardingState>>
) -> Result<(), String> {
    // Sauvegarder sur le disque
    save_onboarding_preferences(&preferences)?;

    // Mettre à jour l'état
    let mut onboarding_state = state.lock()
        .map_err(|e| format!("Failed to lock onboarding state: {}", e))?;

    onboarding_state.completed = true;
    onboarding_state.preferences = Some(preferences.clone());

    // Log pour monitoring
    log::info!(
        "Onboarding completed - Theme: {}, Language: {}, Analytics: {}",
        preferences.theme,
        preferences.language,
        preferences.enable_analytics
    );

    Ok(())
}

/**
 * Tauri Command : Obtient les préférences d'onboarding
 */
#[tauri::command]
pub async fn get_onboarding_preferences(
    state: State<'_, Mutex<OnboardingState>>
) -> Result<Option<OnboardingPreferences>, String> {
    // Essayer depuis l'état
    {
        let onboarding_state = state.lock()
            .map_err(|e| format!("Failed to lock onboarding state: {}", e))?;

        if let Some(ref preferences) = onboarding_state.preferences {
            return Ok(Some(preferences.clone()));
        }
    }

    // Sinon, charger depuis le disque
    load_onboarding_preferences()
}

/**
 * Tauri Command : Réinitialise l'onboarding (pour tests / debug)
 */
#[tauri::command]
pub async fn reset_onboarding(
    state: State<'_, Mutex<OnboardingState>>
) -> Result<(), String> {
    // Supprimer le fichier de config
    let config_path = get_onboarding_config_path()?;

    if config_path.exists() {
        fs::remove_file(&config_path)
            .map_err(|e| format!("Failed to remove onboarding config: {}", e))?;
    }

    // Réinitialiser l'état
    let mut onboarding_state = state.lock()
        .map_err(|e| format!("Failed to lock onboarding state: {}", e))?;

    onboarding_state.completed = false;
    onboarding_state.preferences = None;

    log::info!("Onboarding reset successfully");

    Ok(())
}
