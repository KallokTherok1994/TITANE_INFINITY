use crate::overdrive::chat_orchestrator::ChatOrchestratorState;
use crate::security::secrets_engine::SecureSecretsEngine;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::State;
/**
 * TITANE∞ OS - Commandes Tauri Control Panel
 * Backend handlers pour toutes les sections du Control Panel
 *
 * © 2025 Humain Total / Kevin Thibault
 */

// ══════════════════════════════════════════════════════════
// STRUCTURES DE DONNÉES
// ══════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub version: String,
    pub uptime: u64,
    pub memory_usage: f64,
    pub cpu_usage: f64,
    pub disk_usage: f64,
    pub singularity_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesignSystemConfig {
    pub mode: String,    // "light", "dark", "auto"
    pub density: String, // "compact", "normal", "comfortable"
    pub animations_enabled: bool,
    pub transparency_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingularityStatus {
    pub active: bool,
    pub power_level: u32,
    pub iterations: u64,
    pub phase: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    pub gemini_api_key: String,
    pub gemini_model: String,
    pub temperature: f32,
    pub max_tokens: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub total_size: u64,
    pub used_size: u64,
    pub cache_size: u64,
    pub vector_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleStatus {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub online_mode: bool,
    pub proxy_enabled: bool,
    pub proxy_url: String,
    pub auto_sync: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub current_version: String,
    pub latest_version: String,
    pub update_available: bool,
    pub changelog: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String, // "info", "warn", "error"
    pub message: String,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub hn_security_enabled: bool,
    pub secure_mode: bool,
    pub encryption_enabled: bool,
    pub audit_logging: bool,
}

// ══════════════════════════════════════════════════════════
// IA CONFIGURATION PERSISTENCE (GEMINI)
// ══════════════════════════════════════════════════════════

const AI_CONFIG_FILE_NAME: &str = "ai_config.json";
const GEMINI_KEY_SENTINEL: &str = "***MASKED***";
const DEFAULT_GEMINI_MODEL: &str = "gemini-pro";
const MIN_TEMPERATURE: f32 = 0.0;
const MAX_TEMPERATURE: f32 = 1.0;
const MIN_TOKENS: u32 = 64;
const MAX_TOKENS: u32 = 8192;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StoredAIConfig {
    gemini_model: String,
    temperature: f32,
    max_tokens: u32,
}

impl StoredAIConfig {
    fn sanitize(self) -> Self {
        Self {
            gemini_model: normalize_model(&self.gemini_model),
            temperature: sanitize_temperature(self.temperature),
            max_tokens: sanitize_max_tokens(self.max_tokens),
        }
    }
}

impl Default for StoredAIConfig {
    fn default() -> Self {
        Self {
            gemini_model: default_gemini_model(),
            temperature: 0.7,
            max_tokens: 2048,
        }
    }
}

fn default_gemini_model() -> String {
    std::env::var("GEMINI_MODEL").unwrap_or_else(|_| DEFAULT_GEMINI_MODEL.to_string())
}

fn normalize_model(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        default_gemini_model()
    } else {
        trimmed.to_string()
    }
}

fn sanitize_temperature(value: f32) -> f32 {
    value.clamp(MIN_TEMPERATURE, MAX_TEMPERATURE)
}

fn sanitize_max_tokens(value: u32) -> u32 {
    value.clamp(MIN_TOKENS, MAX_TOKENS)
}

fn config_base_dir() -> Result<PathBuf, String> {
    if let Ok(custom) = std::env::var("TITANE_CONFIG_DIR") {
        let path = PathBuf::from(custom);
        if !path.exists() {
            fs::create_dir_all(&path)
                .map_err(|e| format!("Failed to create custom config dir: {}", e))?;
        }
        return Ok(path);
    }

    let base = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    let path = base.join("titane_infinity");
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| format!("Failed to create config dir: {}", e))?;
    }
    Ok(path)
}

fn ai_config_path() -> Result<PathBuf, String> {
    Ok(config_base_dir()?.join(AI_CONFIG_FILE_NAME))
}

fn load_ai_config_from_disk() -> Result<StoredAIConfig, String> {
    let path = ai_config_path()?;
    if !path.exists() {
        return Ok(StoredAIConfig::default());
    }

    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read AI config: {}", e))?;

    match serde_json::from_str::<StoredAIConfig>(&content) {
        Ok(config) => Ok(config.sanitize()),
        Err(err) => {
            log::warn!(
                "[ControlPanel] Invalid AI config detected, resetting to defaults: {}",
                err
            );
            Ok(StoredAIConfig::default())
        }
    }
}

fn save_ai_config_to_disk(config: &StoredAIConfig) -> Result<(), String> {
    let path = ai_config_path()?;
    let sanitized = config.clone().sanitize();
    let payload = serde_json::to_vec_pretty(&sanitized)
        .map_err(|e| format!("Failed to serialize AI config: {}", e))?;

    fs::write(&path, payload).map_err(|e| format!("Failed to write AI config: {}", e))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = fs::metadata(&path) {
            let mut perms = metadata.permissions();
            perms.set_mode(0o600);
            if let Err(err) = fs::set_permissions(&path, perms) {
                log::warn!(
                    "[ControlPanel] Failed to set permissions on AI config: {}",
                    err
                );
            }
        }
    }

    Ok(())
}

pub(crate) fn build_ai_config_response(secrets: &SecureSecretsEngine) -> Result<AIConfig, String> {
    let stored = load_ai_config_from_disk()?;

    let masked_key = match secrets.has_secret("gemini_api_key") {
        Ok(true) => GEMINI_KEY_SENTINEL.to_string(),
        Ok(false) => String::new(),
        Err(err) => return Err(format!("Failed to inspect secrets engine: {}", err)),
    };

    Ok(AIConfig {
        gemini_api_key: masked_key,
        gemini_model: stored.gemini_model,
        temperature: stored.temperature,
        max_tokens: stored.max_tokens,
    })
}

pub(crate) async fn apply_ai_config(
    config: AIConfig,
    secrets: &SecureSecretsEngine,
    orchestrator: &ChatOrchestratorState,
) -> Result<(), String> {
    let AIConfig {
        gemini_api_key,
        gemini_model,
        temperature,
        max_tokens,
    } = config;

    let key_input = gemini_api_key.trim().to_string();
    let sanitized = StoredAIConfig {
        gemini_model: normalize_model(&gemini_model),
        temperature: sanitize_temperature(temperature),
        max_tokens: sanitize_max_tokens(max_tokens),
    }
    .sanitize();

    if key_input == GEMINI_KEY_SENTINEL {
        log::debug!("[ControlPanel] Gemini API key unchanged via control panel");
    } else if key_input.is_empty() {
        secrets
            .clear_secret("gemini_api_key")
            .map_err(|e| format!("Failed to clear Gemini secret: {}", e))?;
        {
            let mut guard = orchestrator.gemini_api_key.write().await;
            *guard = None;
        }
        orchestrator
            .set_provider_availability("gemini", false)
            .await;
        log::info!("[ControlPanel] Gemini API key cleared");
    } else {
        secrets
            .set_secret("gemini_api_key", key_input.clone())
            .map_err(|e| format!("Failed to store Gemini secret: {}", e))?;
        {
            let mut guard = orchestrator.gemini_api_key.write().await;
            *guard = Some(key_input.clone());
        }
        orchestrator.set_provider_availability("gemini", true).await;
        log::info!("[ControlPanel] Gemini API key updated");
    }

    save_ai_config_to_disk(&sanitized)?;
    log::info!(
        "[ControlPanel] Gemini config saved (model={}, temperature={:.2}, max_tokens={})",
        sanitized.gemini_model,
        sanitized.temperature,
        sanitized.max_tokens
    );

    Ok(())
}

// ══════════════════════════════════════════════════════════
// COMMANDES TAURI
// ══════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────
// SYSTÈME
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_system_info() -> Result<SystemInfo, String> {
    // TODO: Implémenter la récupération réelle des métriques système
    Ok(SystemInfo {
        version: "v19.1.0".to_string(),
        uptime: 3600,
        memory_usage: 45.2,
        cpu_usage: 23.5,
        disk_usage: 62.8,
        singularity_active: true,
    })
}

#[tauri::command]
pub async fn cp_run_system_diagnostic() -> Result<String, String> {
    // TODO: Implémenter le diagnostic système complet
    Ok("✅ Système: OK\n✅ Mémoire: OK\n✅ Disque: OK\n✅ Réseau: OK".to_string())
}

// ────────────────────────────────────────────────────────
// APPARENCE / DESIGN SYSTEM
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_design_config() -> Result<DesignSystemConfig, String> {
    // TODO: Charger depuis fichier config
    Ok(DesignSystemConfig {
        mode: "auto".to_string(),
        density: "normal".to_string(),
        animations_enabled: true,
        transparency_enabled: false,
    })
}

#[tauri::command]
pub async fn cp_set_design_config(config: DesignSystemConfig) -> Result<(), String> {
    // TODO: Sauvegarder dans fichier config
    println!("Design config updated: {:?}", config);
    Ok(())
}

// ────────────────────────────────────────────────────────
// SINGULARITÉ
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_singularity_status() -> Result<SingularityStatus, String> {
    // TODO: Récupérer le statut réel du moteur
    Ok(SingularityStatus {
        active: true,
        power_level: 75,
        iterations: 42,
        phase: "Optimization".to_string(),
    })
}

#[tauri::command]
pub async fn cp_toggle_singularity() -> Result<(), String> {
    // TODO: Activer/désactiver le moteur de singularité
    println!("Singularity toggled");
    Ok(())
}

// ────────────────────────────────────────────────────────
// IA & APIs
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_ai_config(secrets: State<'_, SecureSecretsEngine>) -> Result<AIConfig, String> {
    build_ai_config_response(&secrets)
}

#[tauri::command]
pub async fn cp_set_ai_config(
    config: AIConfig,
    secrets: State<'_, SecureSecretsEngine>,
    orchestrator: State<'_, ChatOrchestratorState>,
) -> Result<(), String> {
    apply_ai_config(config, &secrets, &orchestrator).await
}

// ────────────────────────────────────────────────────────
// MÉMOIRE
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_memory_stats() -> Result<MemoryStats, String> {
    // TODO: Récupérer les stats réelles du système de mémoire
    Ok(MemoryStats {
        total_size: 1024 * 1024 * 100, // 100 MB
        used_size: 1024 * 1024 * 45,   // 45 MB
        cache_size: 1024 * 1024 * 10,  // 10 MB
        vector_count: 1250,
    })
}

#[tauri::command]
pub async fn cp_clear_memory_cache() -> Result<(), String> {
    // TODO: Nettoyer le cache mémoire
    println!("Memory cache cleared");
    Ok(())
}

// ────────────────────────────────────────────────────────
// MODULES
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_modules_status() -> Result<Vec<ModuleStatus>, String> {
    // TODO: Récupérer le statut réel des modules
    Ok(vec![
        ModuleStatus {
            id: "singularity".to_string(),
            name: "Singularity Engine".to_string(),
            description: "Moteur de singularité principal".to_string(),
            enabled: true,
            icon: "🌓".to_string(),
        },
        ModuleStatus {
            id: "ai_core".to_string(),
            name: "AI Core".to_string(),
            description: "Système d'intelligence artificielle".to_string(),
            enabled: true,
            icon: "🤖".to_string(),
        },
        ModuleStatus {
            id: "memory_system".to_string(),
            name: "Memory System".to_string(),
            description: "Système de mémoire vectorielle".to_string(),
            enabled: true,
            icon: "💾".to_string(),
        },
    ])
}

#[tauri::command]
pub async fn cp_toggle_module(module_id: String) -> Result<(), String> {
    // TODO: Activer/désactiver le module
    println!("Module {} toggled", module_id);
    Ok(())
}

// ────────────────────────────────────────────────────────
// RÉSEAU
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_network_config() -> Result<NetworkConfig, String> {
    // TODO: Charger config réseau
    Ok(NetworkConfig {
        online_mode: true,
        proxy_enabled: false,
        proxy_url: String::new(),
        auto_sync: true,
    })
}

#[tauri::command]
pub async fn cp_set_network_config(config: NetworkConfig) -> Result<(), String> {
    // TODO: Sauvegarder config réseau
    println!("Network config updated: {:?}", config);
    Ok(())
}

// ────────────────────────────────────────────────────────
// MISES À JOUR
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_check_for_updates() -> Result<UpdateInfo, String> {
    // TODO: Vérifier les updates via GitHub API
    Ok(UpdateInfo {
        current_version: "v19.1.0".to_string(),
        latest_version: "v19.1.0".to_string(),
        update_available: false,
        changelog: String::new(),
    })
}

#[tauri::command]
pub async fn cp_install_update() -> Result<(), String> {
    // TODO: Télécharger et installer la mise à jour
    println!("Update installation started");
    Ok(())
}

// ────────────────────────────────────────────────────────
// LOGS
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_logs(limit: usize) -> Result<Vec<LogEntry>, String> {
    // TODO: Récupérer les logs depuis le système de logging
    let logs = vec![
        LogEntry {
            timestamp: "2025-11-25 10:30:00".to_string(),
            level: "info".to_string(),
            message: "Application started successfully".to_string(),
            source: "main".to_string(),
        },
        LogEntry {
            timestamp: "2025-11-25 10:30:15".to_string(),
            level: "info".to_string(),
            message: "Singularity engine initialized".to_string(),
            source: "singularity".to_string(),
        },
    ];

    // Limiter au nombre demandé
    Ok(logs.into_iter().take(limit).collect())
}

#[tauri::command]
pub async fn cp_clear_logs() -> Result<(), String> {
    // TODO: Nettoyer les fichiers de logs
    println!("Logs cleared");
    Ok(())
}

// ────────────────────────────────────────────────────────
// SÉCURITÉ
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_security_config() -> Result<SecurityConfig, String> {
    // TODO: Charger config sécurité
    Ok(SecurityConfig {
        hn_security_enabled: true,
        secure_mode: false,
        encryption_enabled: true,
        audit_logging: true,
    })
}

#[tauri::command]
pub async fn cp_set_security_config(config: SecurityConfig) -> Result<(), String> {
    // TODO: Sauvegarder config sécurité
    println!("Security config updated: {:?}", config);
    Ok(())
}

// ══════════════════════════════════════════════════════════
// TESTS MODULE
// ══════════════════════════════════════════════════════════

#[cfg(test)]
mod tests;
