//! ═══════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.C - Memory Persistence Module
//! Classification automatique + stockage fichiers + VaultEngine (Super-Prompt J3)
//! ═══════════════════════════════════════════════════════════════════

use crate::security::encryption::MasterKey;
use crate::security::vault_engine::{VaultEngine, VaultError};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Fichier sauvegardé dans la mémoire
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StoredFile {
    pub path: String,
    pub category: String,
    pub content: String,
    pub timestamp: i64,
    pub lines: usize,
    pub words: usize,
    pub size: usize,
}

/// Base de données mémoire (fichier JSON)
const MEMORY_DB_PATH: &str = "memory_db.json";

// VaultEngine singleton pour chiffrement transparent
lazy_static! {
    static ref VAULT: Arc<RwLock<Option<VaultEngine>>> = Arc::new(RwLock::new(None));
}

/// Initialiser VaultEngine (appelé au démarrage)
pub async fn init_vault_engine(master_key: &MasterKey) -> Result<(), VaultError> {
    let vault = VaultEngine::new(master_key).await?;
    let mut lock = VAULT.write().await;
    *lock = Some(vault);
    log::info!("✅ [VAULT] Memory Vault Engine initialized");
    Ok(())
}

/// Sauvegarder un fichier dans la base de données
pub fn store_file(path: &str, content: &str, category: &str) -> Result<(), String> {
    let file = StoredFile {
        path: path.into(),
        category: category.into(),
        content: content.into(),
        timestamp: chrono::Utc::now().timestamp(),
        lines: content.lines().count(),
        words: content.split_whitespace().count(),
        size: content.len(),
    };

    // Charger DB existante
    let mut db: Vec<StoredFile> = if Path::new(MEMORY_DB_PATH).exists() {
        match fs::read_to_string(MEMORY_DB_PATH) {
            Ok(data) => serde_json::from_str(&data).unwrap_or_else(|_| vec![]),
            Err(_) => vec![],
        }
    } else {
        vec![]
    };

    // Ajouter nouveau fichier
    db.push(file);

    // Sauvegarder
    let json = serde_json::to_string_pretty(&db).map_err(|e| e.to_string())?;
    fs::write(MEMORY_DB_PATH, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Classifier un texte selon son contenu
pub fn classify_text(text: &str) -> String {
    let lower = text.to_lowercase();

    // Classification par mot-clé
    if lower.contains("rust") || lower.contains("cargo") || lower.contains("fn ") {
        "code-rust".into()
    } else if lower.contains("react") || lower.contains("tsx") || lower.contains("jsx") {
        "code-react".into()
    } else if lower.contains("typescript") || lower.contains("interface ") {
        "code-typescript".into()
    } else if lower.contains("tauri") || lower.contains("invoke") {
        "architecture-tauri".into()
    } else if lower.contains("singularity") || lower.contains("helios") {
        "architecture-system".into()
    } else if text.len() < 200 {
        "notes-courtes".into()
    } else if text.lines().count() < 10 {
        "snippet".into()
    } else {
        "documents".into()
    }
}

/// Récupérer tous les fichiers sauvegardés
pub fn get_all_files() -> Result<Vec<StoredFile>, String> {
    if !Path::new(MEMORY_DB_PATH).exists() {
        return Ok(vec![]);
    }

    let data = fs::read_to_string(MEMORY_DB_PATH).map_err(|e| e.to_string())?;
    let db: Vec<StoredFile> = serde_json::from_str(&data).map_err(|e| e.to_string())?;

    Ok(db)
}

/// Récupérer les fichiers par catégorie
pub fn get_files_by_category(category: &str) -> Result<Vec<StoredFile>, String> {
    let all = get_all_files()?;
    Ok(all.into_iter().filter(|f| f.category == category).collect())
}

/// Effacer toute la mémoire
pub fn clear_memory() -> Result<(), String> {
    if Path::new(MEMORY_DB_PATH).exists() {
        fs::remove_file(MEMORY_DB_PATH).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Sauvegarder données chiffrées via VaultEngine
pub async fn save_encrypted<T: Serialize>(file_id: &str, data: &T) -> Result<(), String> {
    let vault_lock = VAULT.read().await;
    let vault = vault_lock.as_ref().ok_or("VaultEngine not initialized")?;

    vault
        .save(file_id, data)
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

/// Charger données déchiffrées via VaultEngine
pub async fn load_encrypted<T: for<'de> Deserialize<'de>>(file_id: &str) -> Result<T, String> {
    let vault_lock = VAULT.read().await;
    let vault = vault_lock.as_ref().ok_or("VaultEngine not initialized")?;

    vault.load(file_id).await.map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_classify_text() {
        assert_eq!(
            classify_text("fn main() { println!(\"Rust\"); }"),
            "code-rust"
        );
        assert_eq!(
            classify_text("const App = () => <div>React</div>"),
            "code-react"
        );
        assert_eq!(
            classify_text("interface User { name: string; }"),
            "code-typescript"
        );
        assert_eq!(classify_text("Hello"), "notes-courtes");
    }

    #[test]
    fn test_store_and_retrieve() {
        let _ = clear_memory();

        let content = "Test file content";
        store_file("/test/path.txt", content, "test").unwrap();

        let files = get_all_files().unwrap();
        assert_eq!(files.len(), 1);
        assert_eq!(files[0].path, "/test/path.txt");
        assert_eq!(files[0].category, "test");

        let _ = clear_memory();
    }
}
