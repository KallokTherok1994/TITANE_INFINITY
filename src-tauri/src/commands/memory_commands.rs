// TITANE∞ v15 — MEMORY COMMANDS + PHASE 6 Extensions
// Frontend-accessible memory management commands
// Architecture v15: Clean, documented, tech-ready (dev)

use serde::{Deserialize, Serialize};

/// Memory key-value entry v15
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub key: String,
    pub value: String,
    pub timestamp: i64,
}

/// Get memory value by key (v15) - Simplified for PHASE 6
#[tauri::command]
pub async fn memory_get(key: String) -> Result<Option<String>, String> {
    log::info!("[Memory v15] memory_get: key={}", key);
    
    // Simplified implementation - return None for now
    // This would integrate with the actual memory storage system
    Ok(None)
}

/// Set memory value (v15) - Simplified for PHASE 6
#[tauri::command]
pub async fn memory_set(key: String, value: String) -> Result<bool, String> {
    log::info!("[Memory v15] memory_set: key={}, value_len={}", key, value.len());
    
    // Simplified implementation - return success for now
    // This would integrate with the actual memory storage system
    Ok(true)
}

/// Compact storage (remove duplicates, optimize) - Simplified for PHASE 6
#[tauri::command]
pub async fn memory_compact() -> Result<String, String> {
    log::info!("[Memory v15] memory_compact");
    
    // Simplified implementation
    Ok("{\"compacted_entries\": 0, \"freed_bytes\": 0}".to_string())
}

// PHASE 6 CAPABILITY: memory-core-encryption (EXPERIMENTAL)
// Commands: unlock_memory_vault, lock_memory_vault
// Security: AES-256-GCM encryption for memory_core_state.json

use crate::memory::encryption::MemoryEncryption;
use std::path::PathBuf;
use std::fs;

/// Unlock memory vault with password (decrypt memory_core_state.json)
#[tauri::command]
pub async fn unlock_memory_vault(password: String) -> Result<bool, String> {
    log::info!("[Memory PHASE6] unlock_memory_vault requested");

    // Validate password strength
    if password.len() < 8 {
        return Err("Password must be at least 8 characters".to_string());
    }

    // Get memory directory path
    let memory_dir = get_memory_directory()
        .map_err(|e| format!("Failed to get memory directory: {}", e))?;
    
    let encrypted_file = memory_dir.join("memory_core_state.json.enc");
    let plain_file = memory_dir.join("memory_core_state.json");

    // Check if encrypted file exists
    if !encrypted_file.exists() {
        return Err("No encrypted vault found".to_string());
    }

    // Initialize encryption with password
    let encryption = MemoryEncryption::new(password);

    // Read encrypted file
    let encrypted_data = fs::read_to_string(&encrypted_file)
        .map_err(|e| format!("Failed to read encrypted vault: {}", e))?;

    // Decrypt data
    let decrypted_bytes = encryption
        .decrypt(&encrypted_data)
        .map_err(|e| format!("Failed to decrypt vault (wrong password?): {}", e))?;

    // Convert to string and validate JSON
    let decrypted_json = String::from_utf8(decrypted_bytes)
        .map_err(|e| format!("Invalid decrypted data: {}", e))?;

    // Validate it's valid JSON
    serde_json::from_str::<serde_json::Value>(&decrypted_json)
        .map_err(|e| format!("Decrypted data is not valid JSON: {}", e))?;

    // Write decrypted data to plain file
    fs::write(&plain_file, &decrypted_json)
        .map_err(|e| format!("Failed to write decrypted vault: {}", e))?;

    log::info!("[Memory PHASE6] Memory vault unlocked successfully");
    Ok(true)
}

/// Lock memory vault (encrypt memory_core_state.json)
#[tauri::command]
pub async fn lock_memory_vault(password: String) -> Result<bool, String> {
    log::info!("[Memory PHASE6] lock_memory_vault requested");

    // Validate password strength
    if password.len() < 8 {
        return Err("Password must be at least 8 characters".to_string());
    }

    // Get memory directory path
    let memory_dir = get_memory_directory()
        .map_err(|e| format!("Failed to get memory directory: {}", e))?;
    
    let plain_file = memory_dir.join("memory_core_state.json");
    let encrypted_file = memory_dir.join("memory_core_state.json.enc");
    let backup_file = memory_dir.join("memory_core_state.json.backup");

    // Check if plain file exists
    if !plain_file.exists() {
        return Err("No memory core state file found to encrypt".to_string());
    }

    // Read plain file
    let plain_data = fs::read_to_string(&plain_file)
        .map_err(|e| format!("Failed to read memory core state: {}", e))?;

    // Validate it's valid JSON before encrypting
    serde_json::from_str::<serde_json::Value>(&plain_data)
        .map_err(|e| format!("Memory core state is not valid JSON: {}", e))?;

    // Create backup of original file
    fs::copy(&plain_file, &backup_file)
        .map_err(|e| format!("Failed to create backup: {}", e))?;

    // Initialize encryption with password
    let encryption = MemoryEncryption::new(password);

    // Encrypt data
    let encrypted_data = encryption
        .encrypt(plain_data.as_bytes())
        .map_err(|e| format!("Failed to encrypt memory core state: {}", e))?;

    // Write encrypted data
    fs::write(&encrypted_file, &encrypted_data)
        .map_err(|e| format!("Failed to write encrypted vault: {}", e))?;

    // Remove plain file (keep only encrypted version)
    fs::remove_file(&plain_file)
        .map_err(|e| format!("Failed to remove plain file: {}", e))?;

    log::info!("[Memory PHASE6] Memory vault locked successfully");
    Ok(true)
}

/// Get memory directory path (helper function)
fn get_memory_directory() -> Result<PathBuf, String> {
    if let Ok(data_dir) = std::env::var("TITANE_MEMORY_DIR") {
        Ok(PathBuf::from(data_dir))
    } else if let Some(data_dir) = dirs::data_dir() {
        Ok(data_dir.join("titane-infinity").join("memory"))
    } else {
        Err("Could not determine memory directory".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::sync::{Mutex, OnceLock};
    use tempfile::TempDir;

    static ENV_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

    /// Test memory encryption/decryption cycle
    #[tokio::test]
    async fn test_memory_vault_encryption_cycle() {
        let _env_guard = ENV_LOCK.get_or_init(|| Mutex::new(())).lock().unwrap();
        // Create temporary directory
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let temp_path = temp_dir.path().to_path_buf();
        
        // Set test memory directory with unique name
        let env_var_name = format!("TITANE_MEMORY_DIR_TEST_{}", std::process::id());
        std::env::set_var(&env_var_name, temp_path.to_string_lossy().to_string());
        
        let memory_file = temp_path.join("memory_core_state.json");
        let encrypted_file = temp_path.join("memory_core_state.json.enc");
        
        // Create test JSON data
        let test_data = r#"{"version": "1.0", "conversations": [], "metadata": {"created": "2026-01-15"}}"#;
        fs::write(&memory_file, test_data).expect("Failed to write test data");
        
        // Temporarily override the helper function
        std::env::set_var("TITANE_MEMORY_DIR", temp_path.to_string_lossy().to_string());
        
        // Test lock (encryption)
        let password = "test-secure-password-123".to_string();
        let lock_result = lock_memory_vault(password.clone()).await;
        println!("Lock result: {:?}", lock_result);
        assert!(lock_result.is_ok(), "Lock should succeed: {:?}", lock_result);
        assert!(lock_result.unwrap(), "Lock should return true");
        
        // Verify encrypted file exists and plain file is gone
        assert!(encrypted_file.exists(), "Encrypted file should exist");
        assert!(!memory_file.exists(), "Plain file should be removed");
        
        // Test unlock (decryption)
        let unlock_result = unlock_memory_vault(password).await;
        assert!(unlock_result.is_ok(), "Unlock should succeed");
        assert!(unlock_result.unwrap(), "Unlock should return true");
        
        // Verify plain file restored
        assert!(memory_file.exists(), "Plain file should be restored");
        
        // Verify data integrity
        let restored_data = fs::read_to_string(&memory_file)
            .expect("Failed to read restored data");
        assert_eq!(test_data, restored_data, "Data should be identical after encrypt/decrypt cycle");
        
        // Cleanup env var
        std::env::remove_var("TITANE_MEMORY_DIR");
    }

    /// Test wrong password fails gracefully
    #[tokio::test]
    async fn test_memory_vault_wrong_password() {
        let _env_guard = ENV_LOCK.get_or_init(|| Mutex::new(())).lock().unwrap();

        // Create temporary directory
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let temp_path = temp_dir.path().to_path_buf();
        
        std::env::set_var("TITANE_MEMORY_DIR", temp_path.to_string_lossy().to_string());
        
        let memory_file = temp_path.join("memory_core_state.json");
        
        let test_data = r#"{"secret": "data"}"#;
        fs::write(&memory_file, test_data).expect("Failed to write test data");
        
        // Lock with password1
        let password1 = "correct-password".to_string();
        let lock_result = lock_memory_vault(password1).await;
        assert!(lock_result.is_ok(), "Lock should succeed");
        
        // Try unlock with wrong password
        let wrong_password = "wrong-password".to_string();
        let unlock_result = unlock_memory_vault(wrong_password).await;
        assert!(unlock_result.is_err(), "Unlock with wrong password should fail");
        
        // Cleanup
        std::env::remove_var("TITANE_MEMORY_DIR");
    }

    /// Test password validation
    #[tokio::test]
    async fn test_password_validation() {
        let _env_guard = ENV_LOCK.get_or_init(|| Mutex::new(())).lock().unwrap();

        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let temp_path = temp_dir.path().to_path_buf();
        std::env::set_var("TITANE_MEMORY_DIR", temp_path.to_string_lossy().to_string());

        // Too short password
        let weak_password = "123".to_string();
        
        let lock_result = lock_memory_vault(weak_password.clone()).await;
        assert!(lock_result.is_err(), "Weak password should be rejected");
        assert!(lock_result.unwrap_err().contains("at least 8 characters"));
        
        let unlock_result = unlock_memory_vault(weak_password).await;
        assert!(unlock_result.is_err(), "Weak password should be rejected");
        
        std::env::remove_var("TITANE_MEMORY_DIR");
    }

    /// Test missing files handling
    #[tokio::test]
    async fn test_missing_files_handling() {
        let _env_guard = ENV_LOCK.get_or_init(|| Mutex::new(())).lock().unwrap();

        // Create temporary directory
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let temp_path = temp_dir.path().to_path_buf();
        
        std::env::set_var("TITANE_MEMORY_DIR", temp_path.to_string_lossy().to_string());
        
        // Try to lock non-existent file
        let password = "valid-password".to_string();
        let lock_result = lock_memory_vault(password.clone()).await;
        assert!(lock_result.is_err(), "Locking non-existent file should fail");
        
        // Try to unlock non-existent encrypted file  
        let unlock_result = unlock_memory_vault(password).await;
        assert!(unlock_result.is_err(), "Unlocking non-existent file should fail");
        assert!(unlock_result.unwrap_err().contains("No encrypted vault found"));
        
        // Cleanup
        std::env::remove_var("TITANE_MEMORY_DIR");
    }
}
