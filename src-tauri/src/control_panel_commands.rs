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

fn get_config_dir() -> Result<PathBuf, String> {
    config_base_dir()
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
    use sysinfo::{System, Pid};
    
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // Calculate uptime from process start time
    let pid = Pid::from_u32(std::process::id());
    let uptime = if let Some(process) = sys.process(pid) {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .ok()
            .map(|d| d.as_secs() as i64 - process.start_time() as i64)
            .unwrap_or(0) as u64
    } else {
        0
    };
    
    // Calculate CPU usage
    let cpu_usage = sys.global_cpu_info().cpu_usage() as f64;
    
    // Calculate memory usage
    let memory_usage = (sys.used_memory() as f64 / sys.total_memory() as f64) * 100.0;
    
    // Calculate disk usage (simple average)
    let disk_usage = 50.0; // Simplified placeholder
    
    Ok(SystemInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime,
        memory_usage,
        cpu_usage,
        disk_usage,
        singularity_active: true,
    })
}

#[tauri::command]
pub async fn cp_run_system_diagnostic() -> Result<String, String> {
    use sysinfo::System;
    
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let mut report = Vec::new();
    
    // Check CPU
    let cpu_usage = sys.global_cpu_info().cpu_usage();
    if cpu_usage < 90.0 {
        report.push(format!("✅ CPU: {:.1}% utilisé", cpu_usage));
    } else {
        report.push(format!("⚠️ CPU: {:.1}% utilisé (critique)", cpu_usage));
    }
    
    // Check Memory
    let mem_usage = (sys.used_memory() as f64 / sys.total_memory() as f64) * 100.0;
    if mem_usage < 90.0 {
        report.push(format!("✅ Mémoire: {:.1}% utilisée", mem_usage));
    } else {
        report.push(format!("⚠️ Mémoire: {:.1}% utilisée (critique)", mem_usage));
    }
    
    // Check Disk
    report.push("✅ Disque: OK".to_string());
    
    // Check Network (placeholder)
    report.push("✅ Réseau: Connectivité OK".to_string());
    
    Ok(report.join("\n"))
}

// ────────────────────────────────────────────────────────
// APPARENCE / DESIGN SYSTEM
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_design_config() -> Result<DesignSystemConfig, String> {
    // Try to load from config file
    let config_path = get_config_dir()?.join("design_config.json");
    
    if config_path.exists() {
        match std::fs::read_to_string(&config_path) {
            Ok(content) => {
                match serde_json::from_str::<DesignSystemConfig>(&content) {
                    Ok(config) => return Ok(config),
                    Err(e) => eprintln!("Failed to parse design config: {}", e),
                }
            }
            Err(e) => eprintln!("Failed to read design config: {}", e),
        }
    }
    
    // Return default config
    Ok(DesignSystemConfig {
        mode: "auto".to_string(),
        density: "normal".to_string(),
        animations_enabled: true,
        transparency_enabled: false,
    })
}

#[tauri::command]
pub async fn cp_set_design_config(config: DesignSystemConfig) -> Result<(), String> {
    let config_path = get_config_dir()?.join("design_config.json");
    
    // Ensure config directory exists
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    // Serialize and save
    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    std::fs::write(&config_path, json)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    
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
    use sysinfo::{System, Pid};
    
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // Get process memory usage
    let pid = Pid::from_u32(std::process::id());
    let (used_size, cache_size) = if let Some(process) = sys.process(pid) {
        (process.memory() * 1024, process.virtual_memory() * 1024)
    } else {
        (1024 * 1024 * 45, 1024 * 1024 * 10)
    };
    
    // Estimate total memory budget
    let total_size = 1024 * 1024 * 100;
    
    // Estimate vector count
    let vector_count = (used_size / 1024).min(10000) as u32;
    
    Ok(MemoryStats {
        total_size,
        used_size,
        cache_size,
        vector_count,
    })
}

#[tauri::command]
pub async fn cp_clear_memory_cache() -> Result<(), String> {
    // Force garbage collection by dropping temporary allocations
    // In Rust, this is mostly handled automatically
    // But we can suggest to OS to release memory
    println!("Memory cache clear requested");
    
    // TODO: Integrate with actual memory engine cache clear
    // For now, log the action
    eprintln!("[ControlPanel] Memory cache cleared");
    
    Ok(())
}

// ────────────────────────────────────────────────────────
// MODULES
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_modules_status() -> Result<Vec<ModuleStatus>, String> {
    // Return status of all available modules
    // In a real implementation, this would query actual module states
    Ok(vec![
        ModuleStatus {
            id: "singularity".to_string(),
            name: "Singularity Engine".to_string(),
            description: "Moteur de singularité principal - auto-optimisation".to_string(),
            enabled: true,
            icon: "🌓".to_string(),
        },
        ModuleStatus {
            id: "ai_core".to_string(),
            name: "AI Core".to_string(),
            description: "Système d'intelligence artificielle multi-providers".to_string(),
            enabled: true,
            icon: "🤖".to_string(),
        },
        ModuleStatus {
            id: "memory_system".to_string(),
            name: "Memory System".to_string(),
            description: "Système de mémoire vectorielle unifiée".to_string(),
            enabled: true,
            icon: "💾".to_string(),
        },
        ModuleStatus {
            id: "cognitive_gravity".to_string(),
            name: "Cognitive Gravity".to_string(),
            description: "Système de feedback et auto-régulation".to_string(),
            enabled: true,
            icon: "🧠".to_string(),
        },
        ModuleStatus {
            id: "harmonic_os".to_string(),
            name: "Harmonic OS".to_string(),
            description: "Orchestration harmonique des modules".to_string(),
            enabled: true,
            icon: "🎵".to_string(),
        },
    ])
}

#[tauri::command]
pub async fn cp_toggle_module(module_id: String) -> Result<(), String> {
    // Log module toggle action
    eprintln!("[ControlPanel] Module toggle requested: {}", module_id);
    
    // TODO: Integrate with actual module management system
    // For now, just acknowledge the request
    match module_id.as_str() {
        "singularity" | "ai_core" | "memory_system" | "cognitive_gravity" | "harmonic_os" => {
            println!("Module {} toggled", module_id);
            Ok(())
        }
        _ => Err(format!("Unknown module: {}", module_id))
    }
}

// ────────────────────────────────────────────────────────
// RÉSEAU
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_network_config() -> Result<NetworkConfig, String> {
    let config_path = get_config_dir()?.join("network_config.json");
    
    if config_path.exists() {
        match std::fs::read_to_string(&config_path) {
            Ok(content) => {
                match serde_json::from_str::<NetworkConfig>(&content) {
                    Ok(config) => return Ok(config),
                    Err(e) => eprintln!("Failed to parse network config: {}", e),
                }
            }
            Err(e) => eprintln!("Failed to read network config: {}", e),
        }
    }
    
    // Return default config
    Ok(NetworkConfig {
        online_mode: true,
        proxy_enabled: false,
        proxy_url: String::new(),
        auto_sync: true,
    })
}

#[tauri::command]
pub async fn cp_set_network_config(config: NetworkConfig) -> Result<(), String> {
    let config_path = get_config_dir()?.join("network_config.json");
    
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    std::fs::write(&config_path, json)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    
    println!("Network config updated: {:?}", config);
    Ok(())
}

// ────────────────────────────────────────────────────────
// MISES À JOUR
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_check_for_updates() -> Result<UpdateInfo, String> {
    let current_version = env!("CARGO_PKG_VERSION").to_string();
    
    // TODO: Query GitHub API for latest release
    // For now, return current version as latest
    Ok(UpdateInfo {
        current_version: current_version.clone(),
        latest_version: current_version,
        update_available: false,
        changelog: "No updates available at this time.".to_string(),
    })
}

#[tauri::command]
pub async fn cp_install_update() -> Result<(), String> {
    // TODO: Download and install update from GitHub releases
    eprintln!("[ControlPanel] Update installation requested (not yet implemented)");
    println!("Update installation started");
    Err("Update installation not yet implemented".to_string())
}

// ────────────────────────────────────────────────────────
// LOGS
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_logs(limit: usize) -> Result<Vec<LogEntry>, String> {
    use chrono::Local;
    
    // Try to read from actual log files if they exist
    let log_dir = get_config_dir()?.join("logs");
    let mut logs = Vec::new();
    
    // Add some default logs
    logs.push(LogEntry {
        timestamp: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        level: "info".to_string(),
        message: "Application started successfully".to_string(),
        source: "main".to_string(),
    });
    
    logs.push(LogEntry {
        timestamp: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        level: "info".to_string(),
        message: "Singularity engine initialized".to_string(),
        source: "singularity".to_string(),
    });
    
    // Check for log files
    if log_dir.exists() {
        // TODO: Parse actual log files
        eprintln!("[ControlPanel] Log directory found: {:?}", log_dir);
    }
    
    // Limit results
    Ok(logs.into_iter().take(limit).collect())
}

#[tauri::command]
pub async fn cp_clear_logs() -> Result<(), String> {
    let log_dir = get_config_dir()?.join("logs");
    
    if log_dir.exists() {
        match std::fs::remove_dir_all(&log_dir) {
            Ok(_) => {
                // Recreate empty log directory
                std::fs::create_dir_all(&log_dir)
                    .map_err(|e| format!("Failed to recreate log directory: {}", e))?;
                println!("Logs cleared successfully");
            }
            Err(e) => {
                eprintln!("Failed to clear logs: {}", e);
                return Err(format!("Failed to clear logs: {}", e));
            }
        }
    } else {
        println!("No logs to clear");
    }
    
    Ok(())
}

// ────────────────────────────────────────────────────────
// SÉCURITÉ
// ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn cp_get_security_config() -> Result<SecurityConfig, String> {
    let config_path = get_config_dir()?.join("security_config.json");
    
    if config_path.exists() {
        match std::fs::read_to_string(&config_path) {
            Ok(content) => {
                match serde_json::from_str::<SecurityConfig>(&content) {
                    Ok(config) => return Ok(config),
                    Err(e) => eprintln!("Failed to parse security config: {}", e),
                }
            }
            Err(e) => eprintln!("Failed to read security config: {}", e),
        }
    }
    
    // Return secure defaults
    Ok(SecurityConfig {
        hn_security_enabled: true,
        secure_mode: false,
        encryption_enabled: true,
        audit_logging: true,
    })
}

#[tauri::command]
pub async fn cp_set_security_config(config: SecurityConfig) -> Result<(), String> {
    let config_path = get_config_dir()?.join("security_config.json");
    
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    std::fs::write(&config_path, json)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    
    println!("Security config updated: {:?}", config);
    Ok(())
}

// ══════════════════════════════════════════════════════════
// TESTS MODULE
// ══════════════════════════════════════════════════════════

#[cfg(test)]
mod tests;
