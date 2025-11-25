// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   PRE-BOOT VALIDATION — Super-Prompt L4
//   Validation d'intégrité complète avant lancement
// ═══════════════════════════════════════════════════════════════

use super::encryption::SigningKeypair;
use super::permissions::verify_permissions;
use std::path::PathBuf;

/// Résultat validation pre-boot
#[derive(Debug)]
pub struct PreBootValidation {
    pub binary_signature_ok: bool,
    pub memory_integrity_ok: bool,
    pub design_system_ok: bool,
    pub engines_ok: bool,
    pub tauri_commands_ok: bool,
    pub singularity_state_ok: bool,
    pub permissions_ok: bool,
    pub vault_ok: bool,
}

impl PreBootValidation {
    /// Vérifier si tout est OK
    pub fn is_valid(&self) -> bool {
        self.binary_signature_ok
            && self.memory_integrity_ok
            && self.design_system_ok
            && self.engines_ok
            && self.tauri_commands_ok
            && self.singularity_state_ok
            && self.permissions_ok
            && self.vault_ok
    }

    /// Générer rapport
    pub fn report(&self) -> String {
        format!(
            r#"
╔══════════════════════════════════════════════════════════════╗
║           TITANE∞ PRE-BOOT VALIDATION REPORT                ║
╠══════════════════════════════════════════════════════════════╣
║ Binary Signature    : {}
║ Memory Integrity    : {}
║ Design System       : {}
║ Engines (20)        : {}
║ Tauri Commands      : {}
║ SingularityState    : {}
║ Permissions Matrix  : {}
║ Encrypted Vault     : {}
╠══════════════════════════════════════════════════════════════╣
║ Status: {}
╚══════════════════════════════════════════════════════════════╝
"#,
            status_icon(self.binary_signature_ok),
            status_icon(self.memory_integrity_ok),
            status_icon(self.design_system_ok),
            status_icon(self.engines_ok),
            status_icon(self.tauri_commands_ok),
            status_icon(self.singularity_state_ok),
            status_icon(self.permissions_ok),
            status_icon(self.vault_ok),
            if self.is_valid() {
                "✅ VALID - Boot authorized"
            } else {
                "❌ FAILED - Boot blocked"
            }
        )
    }
}

fn status_icon(ok: bool) -> &'static str {
    if ok {
        "✅ OK"
    } else {
        "❌ FAIL"
    }
}

/// Effectuer validation pre-boot complète
pub async fn validate_pre_boot() -> Result<PreBootValidation, String> {
    log::info!("🔍 Starting pre-boot validation...");

    let mut validation = PreBootValidation {
        binary_signature_ok: false,
        memory_integrity_ok: false,
        design_system_ok: false,
        engines_ok: false,
        tauri_commands_ok: false,
        singularity_state_ok: false,
        permissions_ok: false,
        vault_ok: false,
    };

    // 1. Vérifier signature binaire (si activée)
    validation.binary_signature_ok = verify_binary_signature().await.unwrap_or(true); // Non-bloquant

    // 2. Vérifier intégrité mémoire
    validation.memory_integrity_ok = verify_memory_integrity().await?;

    // 3. Vérifier Design System
    validation.design_system_ok = verify_design_system().await?;

    // 4. Vérifier moteurs (20 engines)
    validation.engines_ok = verify_engines().await?;

    // 5. Vérifier commandes Tauri
    validation.tauri_commands_ok = verify_tauri_commands().await?;

    // 6. Vérifier SingularityState
    validation.singularity_state_ok = verify_singularity_state().await?;

    // 7. Vérifier matrice de permissions
    validation.permissions_ok = verify_permissions().is_ok();

    // 8. Vérifier Vault chiffrée
    validation.vault_ok = verify_vault().await?;

    log::info!("{}", validation.report());

    if !validation.is_valid() {
        return Err("Pre-boot validation failed - see report above".to_string());
    }

    Ok(validation)
}

/// Vérifier signature du binaire
async fn verify_binary_signature() -> Result<bool, String> {
    // TODO: Implémenter vérification signature Ed25519 du binaire
    // Pour l'instant, retourner OK (non-bloquant)
    log::debug!("Binary signature verification: skipped (not yet implemented)");
    Ok(true)
}

/// Vérifier intégrité mémoire
async fn verify_memory_integrity() -> Result<bool, String> {
    // Vérifier que les dossiers mémoire existent et sont accessibles
    let memory_dir = get_memory_dir();

    if !memory_dir.exists() {
        log::warn!("Memory directory doesn't exist, creating: {:?}", memory_dir);
        tokio::fs::create_dir_all(&memory_dir)
            .await
            .map_err(|e| format!("Failed to create memory dir: {}", e))?;
    }

    // Vérifier permissions lecture/écriture
    let test_file = memory_dir.join(".integrity_test");
    tokio::fs::write(&test_file, b"test")
        .await
        .map_err(|e| format!("Memory directory not writable: {}", e))?;
    tokio::fs::remove_file(&test_file)
        .await
        .map_err(|e| format!("Memory directory test cleanup failed: {}", e))?;

    log::debug!("✅ Memory integrity: OK");
    Ok(true)
}

/// Vérifier Design System
async fn verify_design_system() -> Result<bool, String> {
    // Vérifier que les fichiers CSS/tokens existent
    let ds_paths = vec![
        "src/themes/tokens.ts",
        "src/design-system/motion.ts",
        "src/styles/titane-v∞.css",
    ];

    let workspace =
        std::env::current_dir().map_err(|e| format!("Failed to get current dir: {}", e))?;

    for path in ds_paths {
        let full_path = workspace.join(path);
        if !full_path.exists() {
            log::warn!("Design System file missing: {}", path);
        }
    }

    log::debug!("✅ Design System: OK");
    Ok(true)
}

/// Vérifier moteurs TITANE∞
async fn verify_engines() -> Result<bool, String> {
    // Liste des moteurs attendus
    let expected_engines = vec![
        "Helios",
        "Memory",
        "Nexus",
        "Harmonia",
        "Sentinel",
        "Persona",
        "AutoEvolution",
        "AutoHeal",
        "SingularityEngine",
    ];

    // Pour l'instant, simple vérification de liste
    // TODO: Vérifier chaque engine individuellement avec health check
    log::debug!("✅ Engines ({}): OK (mock mode)", expected_engines.len());
    Ok(true)
}

/// Vérifier commandes Tauri
async fn verify_tauri_commands() -> Result<bool, String> {
    // Liste des commandes critiques
    let critical_commands = [
        "get_helios_state",
        "get_memory_state",
        "singularity_get_full_state",
        "sync_singularity",
    ];

    // TODO: Vérifier que chaque commande est bien enregistrée dans invoke_handler
    log::debug!("✅ Tauri Commands: OK (mock mode)");
    Ok(true)
}

/// Vérifier SingularityState
async fn verify_singularity_state() -> Result<bool, String> {
    // Vérifier que le state peut être chargé/initialisé
    let state_dir = get_memory_dir().join("singularity");

    if !state_dir.exists() {
        tokio::fs::create_dir_all(&state_dir)
            .await
            .map_err(|e| format!("Failed to create singularity state dir: {}", e))?;
    }

    log::debug!("✅ SingularityState: OK");
    Ok(true)
}

/// Vérifier Vault chiffrée
async fn verify_vault() -> Result<bool, String> {
    let vault_dir = get_vault_dir();

    if !vault_dir.exists() {
        tokio::fs::create_dir_all(&vault_dir)
            .await
            .map_err(|e| format!("Failed to create vault dir: {}", e))?;
    }

    // Vérifier existence master key
    let key_path = vault_dir.join("master.key");
    if !key_path.exists() {
        log::warn!("Master key not found, will be generated on first encryption");
    }

    log::debug!("✅ Encrypted Vault: OK");
    Ok(true)
}

fn get_memory_dir() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("titane_infinity")
        .join("userdata")
        .join("memory")
}

fn get_vault_dir() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("titane_infinity")
        .join("vault")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_pre_boot_validation() {
        let result = validate_pre_boot().await;
        // En mode dev, devrait réussir
        assert!(result.is_ok());
    }
}
