// TITANE_INFINITY v∞.19.5.2 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

#![allow(dead_code)]
/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIG UPDATE MODULE - Configuration Write Operations
 *   Phase 2: Configuration Management UI (Day 3-4)
 * ═══════════════════════════════════════════════════════════════
 */
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;
use tokio::sync::RwLock;


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProviderPreference {
    Auto,
    Gemini,
    Ollama,
    Local,
}

/**
 * RuntimeConfigUpdate
 *
 * Structure pour mettre à jour la RuntimeConfig
 * Tous les champs sont optionnels pour permettre des updates partiels
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeConfigUpdate {
    pub ollama_url: Option<String>,
    pub ollama_model: Option<String>,
}

/**
 * ChatEngineConfigUpdate
 *
 * Structure pour mettre à jour la ChatEngineConfig
 * Tous les champs sont optionnels pour permettre des updates partiels
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatEngineConfigUpdate {
    pub timeout_ms: Option<u64>,
    pub chunk_size: Option<usize>,
    pub max_tokens: Option<usize>,
    pub temperature: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcErrorPayload {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcEnvelope<T> {
    pub ok: bool,
    pub content: Option<T>,
    pub error: Option<IpcErrorPayload>,
}

impl<T> IpcEnvelope<T> {
    fn ok(content: T) -> Self {
        Self {
            ok: true,
            content: Some(content),
            error: None,
        }
    }

    fn err(code: &str, message: impl Into<String>) -> Self {
        Self {
            ok: false,
            content: None,
            error: Some(IpcErrorPayload {
                code: code.to_string(),
                message: message.into(),
            }),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatEngineConfigDto {
    pub response_timeout_ms: u64,
    pub stream_chunk_size: u64,
    pub memory_context_tokens: u64,
    pub memory_retention_tokens: u64,
    pub memory_flush_interval_ms: u64,
    pub auto_tts_enabled: bool,
    pub stream_channel_buffer: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatRequestDefaults {
    pub temperature: f32,
    pub max_output_tokens: u64,
    pub provider: ProviderPreference,
    pub enable_streaming: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatConfigBundle {
    pub engine: ChatEngineConfigDto,
    pub request_defaults: ChatRequestDefaults,
}

fn stable_profile_bundle() -> ChatConfigBundle {
    ChatConfigBundle {
        engine: ChatEngineConfigDto {
            response_timeout_ms: 60_000,
            stream_chunk_size: 640,
            memory_context_tokens: 2_048,
            memory_retention_tokens: 6_000,
            memory_flush_interval_ms: 750,
            auto_tts_enabled: true,
            stream_channel_buffer: 32,
        },
        request_defaults: ChatRequestDefaults {
            temperature: 0.7,
            max_output_tokens: 484,
            provider: ProviderPreference::Auto,
            enable_streaming: true,
        },
    }
}

fn profile_bundle(profile_name: &str) -> Option<ChatConfigBundle> {
    match profile_name {
        "StableProduction" => Some(stable_profile_bundle()),
        "DeepMemoryCoaching" => Some(ChatConfigBundle {
            engine: ChatEngineConfigDto {
                response_timeout_ms: 90_000,
                stream_chunk_size: 640,
                memory_context_tokens: 4_096,
                memory_retention_tokens: 12_000,
                memory_flush_interval_ms: 1_000,
                auto_tts_enabled: true,
                stream_channel_buffer: 32,
            },
            request_defaults: ChatRequestDefaults {
                temperature: 0.6,
                max_output_tokens: 8096,
                provider: ProviderPreference::Auto,
                enable_streaming: true,
            },
        }),
        "UltraReactiveLowIO" => Some(ChatConfigBundle {
            engine: ChatEngineConfigDto {
                response_timeout_ms: 45_000,
                stream_chunk_size: 480,
                memory_context_tokens: 1_024,
                memory_retention_tokens: 2_500,
                memory_flush_interval_ms: 1_500,
                auto_tts_enabled: false,
                stream_channel_buffer: 16,
            },
            request_defaults: ChatRequestDefaults {
                temperature: 0.5,
                max_output_tokens: 1024,
                provider: ProviderPreference::Auto,
                enable_streaming: true,
            },
        }),
        _ => None,
    }
}

fn chat_config_path() -> PathBuf {
    let base = dirs::data_local_dir().unwrap_or_else(std::env::temp_dir);
    base.join("titane-infinity")
        .join("config")
        .join("chat_engine_settings_v2.json")
}

fn load_chat_bundle_from_disk() -> Option<ChatConfigBundle> {
    let path = chat_config_path();
    if !path.exists() {
        return None;
    }

    let raw = fs::read_to_string(path).ok()?;
    serde_json::from_str::<ChatConfigBundle>(&raw).ok()
}

fn save_chat_bundle_to_disk(bundle: &ChatConfigBundle) -> Result<(), String> {
    let path = chat_config_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Impossible de créer le dossier config chat: {e}"))?;
    }

    let raw = serde_json::to_string_pretty(bundle)
        .map_err(|e| format!("Impossible de sérialiser la config chat: {e}"))?;
    fs::write(path, raw).map_err(|e| format!("Impossible d'écrire la config chat: {e}"))
}

static CHAT_CONFIG_BUNDLE: OnceLock<RwLock<ChatConfigBundle>> = OnceLock::new();

fn chat_bundle_store() -> &'static RwLock<ChatConfigBundle> {
    CHAT_CONFIG_BUNDLE.get_or_init(|| {
        let initial = load_chat_bundle_from_disk().unwrap_or_else(stable_profile_bundle);
        RwLock::new(initial)
    })
}

pub async fn current_chat_bundle() -> ChatConfigBundle {
    chat_bundle_store().read().await.clone()
}

fn validate_engine_dto(dto: &ChatEngineConfigDto) -> Result<(), String> {
    validate_timeout_ms(dto.response_timeout_ms)?;
    validate_chunk_size(dto.stream_chunk_size as usize)?;

    if dto.memory_context_tokens == 0 {
        return Err("memory_context_tokens doit être > 0".to_string());
    }

    if dto.memory_retention_tokens < dto.memory_context_tokens {
        return Err("memory_retention_tokens doit être >= memory_context_tokens".to_string());
    }

    if dto.memory_flush_interval_ms < 50 || dto.memory_flush_interval_ms > 60_000 {
        return Err("memory_flush_interval_ms doit être entre 50 et 60000".to_string());
    }

    if dto.stream_channel_buffer == 0 || dto.stream_channel_buffer > 4096 {
        return Err("stream_channel_buffer doit être entre 1 et 4096".to_string());
    }

    Ok(())
}

fn validate_request_defaults(defaults: &ChatRequestDefaults) -> Result<(), String> {
    validate_temperature(defaults.temperature)?;

    if defaults.max_output_tokens == 0 || defaults.max_output_tokens > 8096 {
        return Err("max_output_tokens doit être entre 1 et 8096".to_string());
    }

    Ok(())
}

/**
 * Validation functions
 */
/// Valide une URL Ollama
pub fn validate_ollama_url(url: &str) -> Result<(), String> {
    let url = url.trim();

    if url.is_empty() {
        return Err("URL Ollama ne peut pas être vide".to_string());
    }

    // Vérifier que ça commence par http:// ou https://
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err("URL Ollama doit commencer par http:// ou https://".to_string());
    }

    // Vérifier que l'URL est valide
    url::Url::parse(url).map_err(|e| format!("URL Ollama invalide: {}", e))?;

    Ok(())
}

/// Valide un nom de modèle Ollama
pub fn validate_ollama_model(model: &str) -> Result<(), String> {
    let model = model.trim();

    if model.is_empty() {
        return Err("Nom de modèle ne peut pas être vide".to_string());
    }

    // Vérifier format basique (alphanumeric + . : - _)
    if !model
        .chars()
        .all(|c| c.is_alphanumeric() || c == '.' || c == ':' || c == '-' || c == '_')
    {
        return Err(
            "Nom de modèle invalide (caractères autorisés: alphanumeric, ., :, -, _)".to_string(),
        );
    }

    Ok(())
}

/// Valide un timeout en millisecondes
pub fn validate_timeout_ms(timeout_ms: u64) -> Result<(), String> {
    if timeout_ms == 0 {
        return Err("Timeout ne peut pas être 0".to_string());
    }

    if timeout_ms < 1000 {
        return Err("Timeout doit être au moins 1000ms (1 seconde)".to_string());
    }

    if timeout_ms > 3_600_000 {
        // RELAXÉ: 5min → 1h
        return Err("Timeout ne peut pas dépasser 3600000ms (1 heure)".to_string());
    }

    Ok(())
}

/// Valide une taille de chunk
pub fn validate_chunk_size(chunk_size: usize) -> Result<(), String> {
    if chunk_size == 0 {
        return Err("Chunk size ne peut pas être 0".to_string());
    }

    if chunk_size < 100 {
        return Err("Chunk size doit être au moins 100 caractères".to_string());
    }

    if chunk_size > 10_000 {
        return Err("Chunk size ne peut pas dépasser 10000 caractères".to_string());
    }

    Ok(())
}

/// Valide un nombre maximum de tokens
pub fn validate_max_tokens(max_tokens: usize) -> Result<(), String> {
    if max_tokens == 0 {
        return Err("Max tokens ne peut pas être 0".to_string());
    }

    if max_tokens < 100 {
        return Err("Max tokens doit être au moins 100".to_string());
    }

    if max_tokens > 100_000 {
        return Err("Max tokens ne peut pas dépasser 100000".to_string());
    }

    Ok(())
}

/// Valide une température
pub fn validate_temperature(temperature: f32) -> Result<(), String> {
    if temperature < 0.0 {
        return Err("Temperature ne peut pas être négative".to_string());
    }

    if temperature > 2.0 {
        return Err("Temperature ne peut pas dépasser 2.0".to_string());
    }

    Ok(())
}

/**
 * Tauri Commands
 */
use std::env;

/// Update Runtime Configuration
///
/// Commande Tauri: update_runtime_config
///
/// Met à jour la configuration runtime du système (Ollama URL/Model).
/// Les changements sont validés puis persistés dans les variables d'environnement.
///
/// # Arguments
/// * `update` - Structure contenant les champs à mettre à jour (optionnels)
///
/// # Returns
/// * Ok(()) : Configuration mise à jour avec succès
/// * Err(String) : Message d'erreur de validation
#[tauri::command]
pub async fn update_runtime_config(update: RuntimeConfigUpdate) -> Result<(), String> {
    log::info!("🎯 [CONFIG] Updating runtime configuration...");

    // Valider les champs fournis
    if let Some(ref url) = update.ollama_url {
        validate_ollama_url(url)?;
        log::info!("✅ [CONFIG] Ollama URL validated: {}", url);
    }

    if let Some(ref model) = update.ollama_model {
        validate_ollama_model(model)?;
        log::info!("✅ [CONFIG] Ollama model validated: {}", model);
    }

    // Appliquer les changements aux variables d'environnement
    if let Some(url) = update.ollama_url {
        env::set_var("OLLAMA_BASE_URL", url.trim());
        log::info!("✅ [CONFIG] Updated OLLAMA_BASE_URL");
    }

    if let Some(model) = update.ollama_model {
        env::set_var("OLLAMA_DEFAULT_MODEL", model.trim());
        log::info!("✅ [CONFIG] Updated OLLAMA_DEFAULT_MODEL");
    }

    log::info!("✅ [CONFIG] Runtime configuration updated successfully");

    Ok(())
}

/// Update Chat Engine Configuration
///
/// Commande Tauri: update_chat_engine_config
///
/// Met à jour la configuration du moteur de chat IA.
/// Les changements sont validés mais pour l'instant ne sont pas persistés
/// (nécessiterait un state management pour ChatEngineConfig).
///
/// # Arguments
/// * `update` - Structure contenant les champs à mettre à jour (optionnels)
///
/// # Returns
/// * Ok(()) : Configuration validée avec succès
/// * Err(String) : Message d'erreur de validation
#[tauri::command]
pub async fn update_chat_engine_config(update: ChatEngineConfigUpdate) -> Result<(), String> {
    log::info!("🎯 [CONFIG] Updating chat engine configuration...");

    // Valider les champs fournis
    if let Some(timeout_ms) = update.timeout_ms {
        validate_timeout_ms(timeout_ms)?;
        log::info!("✅ [CONFIG] Timeout validated: {}ms", timeout_ms);
    }

    if let Some(chunk_size) = update.chunk_size {
        validate_chunk_size(chunk_size)?;
        log::info!("✅ [CONFIG] Chunk size validated: {}", chunk_size);
    }

    if let Some(max_tokens) = update.max_tokens {
        validate_max_tokens(max_tokens)?;
        log::info!("✅ [CONFIG] Max tokens validated: {}", max_tokens);
    }

    if let Some(temperature) = update.temperature {
        validate_temperature(temperature)?;
        log::info!("✅ [CONFIG] Temperature validated: {}", temperature);
    }

    let mut bundle = chat_bundle_store().write().await;

    if let Some(timeout_ms) = update.timeout_ms {
        bundle.engine.response_timeout_ms = timeout_ms;
    }

    if let Some(chunk_size) = update.chunk_size {
        bundle.engine.stream_chunk_size = chunk_size as u64;
    }

    if let Some(max_tokens) = update.max_tokens {
        bundle.request_defaults.max_output_tokens = max_tokens as u64;
    }

    if let Some(temperature) = update.temperature {
        bundle.request_defaults.temperature = temperature;
    }

    validate_engine_dto(&bundle.engine)?;
    validate_request_defaults(&bundle.request_defaults)?;
    save_chat_bundle_to_disk(&bundle)?;

    log::info!("✅ [CONFIG] Chat engine configuration persisted successfully");

    Ok(())
}

#[tauri::command]
pub async fn get_chat_engine_config() -> IpcEnvelope<ChatEngineConfigDto> {
    let bundle = chat_bundle_store().read().await;
    IpcEnvelope::ok(bundle.engine.clone())
}

#[tauri::command]
pub async fn set_chat_engine_config(
    config: ChatEngineConfigDto,
) -> IpcEnvelope<ChatEngineConfigDto> {
    if let Err(err) = validate_engine_dto(&config) {
        return IpcEnvelope::err("VALIDATION_ERROR", err);
    }

    let mut bundle = chat_bundle_store().write().await;
    bundle.engine = config.clone();

    if let Err(err) = save_chat_bundle_to_disk(&bundle) {
        return IpcEnvelope::err("PERSISTENCE_ERROR", err);
    }

    IpcEnvelope::ok(config)
}

#[tauri::command]
pub async fn get_chat_request_defaults() -> IpcEnvelope<ChatRequestDefaults> {
    let bundle = chat_bundle_store().read().await;
    IpcEnvelope::ok(bundle.request_defaults.clone())
}

#[tauri::command]
pub async fn set_chat_request_defaults(
    defaults: ChatRequestDefaults,
) -> IpcEnvelope<ChatRequestDefaults> {
    if let Err(err) = validate_request_defaults(&defaults) {
        return IpcEnvelope::err("VALIDATION_ERROR", err);
    }

    let mut bundle = chat_bundle_store().write().await;
    bundle.request_defaults = defaults.clone();

    if let Err(err) = save_chat_bundle_to_disk(&bundle) {
        return IpcEnvelope::err("PERSISTENCE_ERROR", err);
    }

    IpcEnvelope::ok(defaults)
}

#[tauri::command]
pub async fn set_chat_profile(name: String) -> IpcEnvelope<ChatConfigBundle> {
    let Some(bundle) = profile_bundle(name.trim()) else {
        return IpcEnvelope::err(
            "INVALID_PROFILE",
            "Profil inconnu. Valeurs valides: StableProduction, DeepMemoryCoaching, UltraReactiveLowIO",
        );
    };

    if let Err(err) = validate_engine_dto(&bundle.engine) {
        return IpcEnvelope::err("VALIDATION_ERROR", err);
    }
    if let Err(err) = validate_request_defaults(&bundle.request_defaults) {
        return IpcEnvelope::err("VALIDATION_ERROR", err);
    }

    {
        let mut state = chat_bundle_store().write().await;
        *state = bundle.clone();
    }

    if let Err(err) = save_chat_bundle_to_disk(&bundle) {
        return IpcEnvelope::err("PERSISTENCE_ERROR", err);
    }

    IpcEnvelope::ok(bundle)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_ollama_url() {
        assert!(validate_ollama_url("http://localhost:11434").is_ok());
        assert!(validate_ollama_url("https://api.ollama.com").is_ok());
        assert!(validate_ollama_url("").is_err());
        assert!(validate_ollama_url("localhost:11434").is_err());
        assert!(validate_ollama_url("not a url").is_err());
    }

    #[test]
    fn test_validate_ollama_model() {
        assert!(validate_ollama_model("gemma2:2b").is_ok());
        assert!(validate_ollama_model("qwen2.5:latest").is_ok());
        assert!(validate_ollama_model("mistral-7b-instruct").is_ok());
        assert!(validate_ollama_model("").is_err());
        assert!(validate_ollama_model("invalid@model").is_err());
    }

    #[test]
    fn test_validate_timeout_ms() {
        assert!(validate_timeout_ms(1000).is_ok());
        assert!(validate_timeout_ms(45000).is_ok());
        assert!(validate_timeout_ms(400_000).is_ok()); // OK: < 3600000ms (1h)
        assert!(validate_timeout_ms(3_600_000).is_ok()); // OK: exactement 1h
        assert!(validate_timeout_ms(0).is_err());
        assert!(validate_timeout_ms(500).is_err());
        assert!(validate_timeout_ms(3_600_001).is_err()); // Invalide: > 1h
    }

    #[test]
    fn test_validate_chunk_size() {
        assert!(validate_chunk_size(480).is_ok());
        assert!(validate_chunk_size(1000).is_ok());
        assert!(validate_chunk_size(0).is_err());
        assert!(validate_chunk_size(50).is_err());
        assert!(validate_chunk_size(20_000).is_err());
    }

    #[test]
    fn test_validate_max_tokens() {
        assert!(validate_max_tokens(2048).is_ok());
        assert!(validate_max_tokens(8000).is_ok());
        assert!(validate_max_tokens(0).is_err());
        assert!(validate_max_tokens(50).is_err());
        assert!(validate_max_tokens(200_000).is_err());
    }

    #[test]
    fn test_validate_temperature() {
        assert!(validate_temperature(0.0).is_ok());
        assert!(validate_temperature(0.7).is_ok());
        assert!(validate_temperature(1.0).is_ok());
        assert!(validate_temperature(2.0).is_ok());
        assert!(validate_temperature(-0.1).is_err());
        assert!(validate_temperature(2.5).is_err());
    }
}
