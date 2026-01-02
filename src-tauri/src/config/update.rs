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

    if timeout_ms > 3_600_000 { // RELAXÉ: 5min → 1h
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

    // Implementation: Persist chat engine config to state management
    // - State: Store in global ChatEngineConfig singleton wrapped in Arc<RwLock>
    //   * Update: CHAT_CONFIG.write().await.set_model(model);
    //   * Update: CHAT_CONFIG.write().await.set_temperature(temperature);
    // - Persistence: Save to ~/.titane/config/chat_engine.json for recovery on restart
    //   * Serialize: serde_json::to_string_pretty(&config)?
    //   * Write: tokio::fs::write(config_path, json).await?
    // - Notification: Emit Tauri event "config:updated" to notify frontend
    // - Validation: Already done above, safe to persist validated values
    // For now, validation only

    log::info!("✅ [CONFIG] Chat engine configuration validated successfully");
    log::warn!("⚠️  [CONFIG] Chat engine config changes not persisted (state management needed)");

    Ok(())
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
        assert!(validate_ollama_model("llama3.1").is_ok());
        assert!(validate_ollama_model("qwen2.5:latest").is_ok());
        assert!(validate_ollama_model("mistral-7b-instruct").is_ok());
        assert!(validate_ollama_model("").is_err());
        assert!(validate_ollama_model("invalid@model").is_err());
    }

    #[test]
    fn test_validate_timeout_ms() {
        assert!(validate_timeout_ms(1000).is_ok());
        assert!(validate_timeout_ms(45000).is_ok());
        assert!(validate_timeout_ms(0).is_err());
        assert!(validate_timeout_ms(500).is_err());
        assert!(validate_timeout_ms(400_000).is_err());
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
