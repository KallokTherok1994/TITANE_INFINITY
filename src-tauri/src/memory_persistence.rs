//! ═══════════════════════════════════════════════════════════════════
//! TITANE∞ v24.6 - Memory Persistence Module (SECURE)
//! Classification automatique + stockage chiffré + déduplication SHA256
//! ═══════════════════════════════════════════════════════════════════

use crate::security::encryption::MasterKey;
use crate::security::vault_engine::{VaultEngine, VaultError};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashSet;
use std::fs;
use std::path::Path;
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

/// Fichier DB chiffré dans le vault
const MEMORY_DB_VAULT_ID: &str = "memory_files_db";

/// Fichier DB legacy (migration)
const MEMORY_DB_LEGACY_PATH: &str = "memory_db.json";

/// Limite de taille globale de la DB (100 MB)
const MAX_DB_SIZE_BYTES: usize = 100 * 1024 * 1024;

/// Limite de taille par fichier (10 MB - unifié frontend/backend)
const MAX_FILE_SIZE_BYTES: usize = 10 * 1024 * 1024;

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

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
    /// Hash SHA256 du contenu pour déduplication
    #[serde(default)]
    pub content_hash: String,
}

/// Base de données mémoire complète
#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct MemoryDatabase {
    pub files: Vec<StoredFile>,
    /// Set des hashes pour déduplication rapide
    #[serde(default)]
    pub content_hashes: HashSet<String>,
    /// Taille totale en bytes
    #[serde(default)]
    pub total_size_bytes: usize,
    /// Version du format
    #[serde(default)]
    pub version: String,
}

/// Résultat d'une opération de stockage
#[derive(Debug, Clone)]
pub enum StoreResult {
    Success,
    Deduplicated(String),
    SizeLimitExceeded { current: usize, max: usize },
    FileTooLarge { size: usize, max: usize },
    VaultNotInitialized,
    Error(String),
}

// VaultEngine singleton pour chiffrement transparent
lazy_static! {
    static ref VAULT: Arc<RwLock<Option<VaultEngine>>> = Arc::new(RwLock::new(None));
    static ref DB_CACHE: Arc<RwLock<Option<MemoryDatabase>>> = Arc::new(RwLock::new(None));
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

/// Initialiser VaultEngine (appelé au démarrage)
pub async fn init_vault_engine(master_key: &MasterKey) -> Result<(), VaultError> {
    let vault = VaultEngine::new(master_key).await?;
    let mut lock = VAULT.write().await;
    *lock = Some(vault);

    // Migrer données legacy si existantes
    migrate_legacy_data().await;

    log::info!("✅ [VAULT] Memory Vault Engine initialized (ENCRYPTED)");
    Ok(())
}

/// Migration des données legacy non-chiffrées
async fn migrate_legacy_data() {
    if !Path::new(MEMORY_DB_LEGACY_PATH).exists() {
        return;
    }

    log::info!("🔄 [VAULT] Migrating legacy unencrypted data...");

    let legacy_files: Vec<StoredFile> = match fs::read_to_string(MEMORY_DB_LEGACY_PATH) {
        Ok(data) => serde_json::from_str(&data).unwrap_or_default(),
        Err(_) => return,
    };

    if legacy_files.is_empty() {
        let _ = fs::remove_file(MEMORY_DB_LEGACY_PATH);
        return;
    }

    let mut db = MemoryDatabase {
        files: Vec::new(),
        content_hashes: HashSet::new(),
        total_size_bytes: 0,
        version: "24.6".to_string(),
    };

    for file in legacy_files {
        let hash = compute_content_hash(&file.content);
        if !db.content_hashes.contains(&hash) {
            db.content_hashes.insert(hash.clone());
            db.total_size_bytes += file.size;
            db.files.push(StoredFile {
                content_hash: hash,
                ..file
            });
        }
    }

    if let Err(e) = save_db_encrypted(&db).await {
        log::error!("❌ [VAULT] Migration failed: {}", e);
        return;
    }

    if let Err(e) = fs::remove_file(MEMORY_DB_LEGACY_PATH) {
        log::warn!("⚠️ [VAULT] Could not remove legacy file: {}", e);
    } else {
        log::info!(
            "✅ [VAULT] Legacy data migrated and encrypted ({} files)",
            db.files.len()
        );
    }
}

// ═══════════════════════════════════════════════════════════════
// HASHING
// ═══════════════════════════════════════════════════════════════

/// Calcule le hash SHA256 du contenu
fn compute_content_hash(content: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(content.as_bytes());
    format!("{:x}", hasher.finalize())
}

// ═══════════════════════════════════════════════════════════════
// DATABASE OPERATIONS (ENCRYPTED)
// ═══════════════════════════════════════════════════════════════

/// Charger la DB depuis le vault (avec cache)
async fn load_db() -> Result<MemoryDatabase, String> {
    {
        let cache = DB_CACHE.read().await;
        if let Some(db) = cache.as_ref() {
            return Ok(db.clone());
        }
    }

    let vault_lock = VAULT.read().await;
    let vault = match vault_lock.as_ref() {
        Some(v) => v,
        None => {
            return load_legacy_readonly();
        }
    };

    match vault.load::<MemoryDatabase>(MEMORY_DB_VAULT_ID).await {
        Ok(db) => {
            let mut cache = DB_CACHE.write().await;
            *cache = Some(db.clone());
            Ok(db)
        }
        Err(_) => Ok(MemoryDatabase {
            version: "24.6".to_string(),
            ..Default::default()
        }),
    }
}

/// Charger données legacy en lecture seule
fn load_legacy_readonly() -> Result<MemoryDatabase, String> {
    if !Path::new(MEMORY_DB_LEGACY_PATH).exists() {
        return Ok(MemoryDatabase::default());
    }

    let data = fs::read_to_string(MEMORY_DB_LEGACY_PATH).map_err(|e| e.to_string())?;
    let files: Vec<StoredFile> = serde_json::from_str(&data).unwrap_or_default();

    let total_size: usize = files.iter().map(|f| f.size).sum();
    let hashes: HashSet<String> = files.iter().map(|f| f.content_hash.clone()).collect();

    Ok(MemoryDatabase {
        files,
        content_hashes: hashes,
        total_size_bytes: total_size,
        version: "legacy".to_string(),
    })
}

/// Sauvegarder la DB chiffrée dans le vault
async fn save_db_encrypted(db: &MemoryDatabase) -> Result<(), String> {
    let vault_lock = VAULT.read().await;
    let vault = vault_lock.as_ref().ok_or("VaultEngine not initialized")?;

    vault
        .save(MEMORY_DB_VAULT_ID, db)
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())?;

    let mut cache = DB_CACHE.write().await;
    *cache = Some(db.clone());

    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API - STORE FILE
// ═══════════════════════════════════════════════════════════════

/// Sauvegarder un fichier (CHIFFRÉ + DÉDUPLIQUÉ)
pub async fn store_file_async(path: &str, content: &str, category: &str) -> StoreResult {
    let content_size = content.len();

    if content_size > MAX_FILE_SIZE_BYTES {
        log::warn!(
            "⚠️ [MEMORY] File too large: {} bytes (max: {})",
            content_size,
            MAX_FILE_SIZE_BYTES
        );
        return StoreResult::FileTooLarge {
            size: content_size,
            max: MAX_FILE_SIZE_BYTES,
        };
    }

    let content_hash = compute_content_hash(content);

    let mut db = match load_db().await {
        Ok(db) => db,
        Err(e) => return StoreResult::Error(e),
    };

    if db.content_hashes.contains(&content_hash) {
        log::info!(
            "📋 [MEMORY] File deduplicated: {} -> {}",
            path,
            &content_hash[..16]
        );
        return StoreResult::Deduplicated(content_hash);
    }

    if db.total_size_bytes + content_size > MAX_DB_SIZE_BYTES {
        log::warn!(
            "⚠️ [MEMORY] DB size limit exceeded: {} + {} > {}",
            db.total_size_bytes,
            content_size,
            MAX_DB_SIZE_BYTES
        );
        return StoreResult::SizeLimitExceeded {
            current: db.total_size_bytes,
            max: MAX_DB_SIZE_BYTES,
        };
    }

    let file = StoredFile {
        path: path.into(),
        category: category.into(),
        content: content.into(),
        timestamp: chrono::Utc::now().timestamp(),
        lines: content.lines().count(),
        words: content.split_whitespace().count(),
        size: content_size,
        content_hash: content_hash.clone(),
    };

    db.content_hashes.insert(content_hash);
    db.total_size_bytes += content_size;
    db.files.push(file);

    match save_db_encrypted(&db).await {
        Ok(()) => {
            log::info!(
                "✅ [MEMORY] File stored encrypted: {} ({} bytes)",
                path,
                content_size
            );
            StoreResult::Success
        }
        Err(e) => StoreResult::Error(e),
    }
}

/// Wrapper synchrone pour compatibilité
pub fn store_file(path: &str, content: &str, category: &str) -> Result<(), String> {
    let result = tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(store_file_async(path, content, category))
    });

    match result {
        StoreResult::Success => Ok(()),
        StoreResult::Deduplicated(hash) => {
            log::info!("File deduplicated (hash: {})", &hash[..16]);
            Ok(())
        }
        StoreResult::SizeLimitExceeded { current, max } => Err(format!(
            "Database size limit exceeded: {} / {} bytes",
            current, max
        )),
        StoreResult::FileTooLarge { size, max } => {
            Err(format!("File too large: {} bytes (max: {} bytes)", size, max))
        }
        StoreResult::VaultNotInitialized => {
            Err("VaultEngine not initialized".to_string())
        }
        StoreResult::Error(e) => Err(e),
    }
}

// ═══════════════════════════════════════════════════════════════
// CLASSIFICATION INTELLIGENTE
// ═══════════════════════════════════════════════════════════════

struct ClassificationRule {
    category: &'static str,
    patterns: &'static [&'static str],
    extensions: &'static [&'static str],
    priority: u8,
}

const CLASSIFICATION_RULES: &[ClassificationRule] = &[
    ClassificationRule {
        category: "code-rust",
        patterns: &["fn ", "impl ", "pub struct", "use crate::", "#[derive"],
        extensions: &[".rs"],
        priority: 10,
    },
    ClassificationRule {
        category: "code-react",
        patterns: &["import React", "useState", "useEffect", "useCallback", "React.FC"],
        extensions: &[".tsx", ".jsx"],
        priority: 9,
    },
    ClassificationRule {
        category: "code-typescript",
        patterns: &["interface ", "type ", ": string", ": number", "export type"],
        extensions: &[".ts"],
        priority: 8,
    },
    ClassificationRule {
        category: "code-javascript",
        patterns: &["const ", "let ", "function ", "async ", "module.exports"],
        extensions: &[".js", ".mjs"],
        priority: 7,
    },
    ClassificationRule {
        category: "architecture-tauri",
        patterns: &["tauri", "#[tauri::command]", "invoke("],
        extensions: &[],
        priority: 8,
    },
    ClassificationRule {
        category: "config",
        patterns: &["\"name\":", "\"version\":", "[package]", "[dependencies]"],
        extensions: &[".json", ".yaml", ".yml", ".toml"],
        priority: 6,
    },
    ClassificationRule {
        category: "documentation",
        patterns: &["# ", "## ", "### ", "```"],
        extensions: &[".md", ".mdx"],
        priority: 5,
    },
    ClassificationRule {
        category: "logs",
        patterns: &["[INFO]", "[ERROR]", "[WARN]", "[DEBUG]"],
        extensions: &[".log"],
        priority: 4,
    },
    ClassificationRule {
        category: "code-python",
        patterns: &["def ", "class ", "import ", "from ", "__init__"],
        extensions: &[".py"],
        priority: 8,
    },
];

/// Classifier un texte selon son contenu (v24.6)
pub fn classify_text(text: &str) -> String {
    classify_text_with_path(text, None)
}

/// Classifier avec chemin pour meilleure précision
pub fn classify_text_with_path(text: &str, path: Option<&str>) -> String {
    let lower = text.to_lowercase();
    let text_len = text.len();
    let line_count = text.lines().count();

    let mut best_category = "documents";
    let mut best_score: u32 = 0;

    for rule in CLASSIFICATION_RULES {
        let mut score: u32 = 0;

        if let Some(p) = path {
            let p_lower = p.to_lowercase();
            for ext in rule.extensions {
                if p_lower.ends_with(ext) {
                    score += 50;
                    break;
                }
            }
        }

        for pattern in rule.patterns {
            if lower.contains(&pattern.to_lowercase()) {
                score += 10;
            }
        }

        score += rule.priority as u32;

        if score > best_score {
            best_score = score;
            best_category = rule.category;
        }
    }

    if best_score < 15 {
        if text_len < 200 {
            return "notes-courtes".into();
        } else if line_count < 10 {
            return "snippet".into();
        }
        return "documents".into();
    }

    best_category.into()
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API - READ FILES
// ═══════════════════════════════════════════════════════════════

/// Récupérer tous les fichiers (async)
pub async fn get_all_files_async() -> Result<Vec<StoredFile>, String> {
    let db = load_db().await?;
    Ok(db.files)
}

/// Récupérer tous les fichiers (sync)
pub fn get_all_files() -> Result<Vec<StoredFile>, String> {
    tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(get_all_files_async())
    })
}

/// Récupérer les fichiers par catégorie
pub fn get_files_by_category(category: &str) -> Result<Vec<StoredFile>, String> {
    let all = get_all_files()?;
    Ok(all.into_iter().filter(|f| f.category == category).collect())
}

/// Récupérer les statistiques de la DB
pub async fn get_db_stats() -> Result<(usize, usize, usize), String> {
    let db = load_db().await?;
    Ok((db.files.len(), db.total_size_bytes, MAX_DB_SIZE_BYTES))
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API - CLEAR MEMORY
// ═══════════════════════════════════════════════════════════════

/// Effacer toute la mémoire (async)
pub async fn clear_memory_async() -> Result<(), String> {
    let empty_db = MemoryDatabase {
        version: "24.6".to_string(),
        ..Default::default()
    };
    save_db_encrypted(&empty_db).await?;

    if Path::new(MEMORY_DB_LEGACY_PATH).exists() {
        let _ = fs::remove_file(MEMORY_DB_LEGACY_PATH);
    }

    log::info!("🗑️ [MEMORY] All memory cleared");
    Ok(())
}

/// Effacer toute la mémoire (sync)
pub fn clear_memory() -> Result<(), String> {
    tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(clear_memory_async())
    })
}

// ═══════════════════════════════════════════════════════════════
// VAULT ENCRYPTION API
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// EXPORTS - Limites pour frontend
// ═══════════════════════════════════════════════════════════════

/// Retourner les limites de taille
pub fn get_size_limits() -> (usize, usize) {
    (MAX_FILE_SIZE_BYTES, MAX_DB_SIZE_BYTES)
}

/// Vérifier si un fichier dépasse la limite
pub fn check_file_size(size: usize) -> Result<(), String> {
    if size > MAX_FILE_SIZE_BYTES {
        Err(format!(
            "File too large: {} bytes (max: {} MB)",
            size,
            MAX_FILE_SIZE_BYTES / (1024 * 1024)
        ))
    } else {
        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_classify_text() {
        assert_eq!(
            classify_text("fn main() { println!(\"Rust\"); }"),
            "code-rust"
        );
        // React détecté via useState/useEffect patterns (plus spécifiques que "import")
        assert_eq!(
            classify_text("const [count, setCount] = useState(0); useEffect(() => {}, [])"),
            "code-react"
        );
        assert_eq!(
            classify_text("interface User { name: string; }"),
            "code-typescript"
        );
        assert_eq!(classify_text("Hello"), "notes-courtes");
    }

    #[test]
    fn test_classify_text_with_path() {
        assert_eq!(
            classify_text_with_path("some content", Some("test.rs")),
            "code-rust"
        );
        assert_eq!(
            classify_text_with_path("some content", Some("app.tsx")),
            "code-react"
        );
    }

    #[test]
    fn test_compute_hash() {
        let hash1 = compute_content_hash("test content");
        let hash2 = compute_content_hash("test content");
        let hash3 = compute_content_hash("different content");

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
        assert_eq!(hash1.len(), 64);
    }

    #[test]
    fn test_size_limits() {
        let (file_max, db_max) = get_size_limits();
        assert_eq!(file_max, 10 * 1024 * 1024);
        assert_eq!(db_max, 100 * 1024 * 1024);
    }

    #[test]
    fn test_check_file_size() {
        assert!(check_file_size(1024).is_ok());
        assert!(check_file_size(MAX_FILE_SIZE_BYTES).is_ok());
        assert!(check_file_size(MAX_FILE_SIZE_BYTES + 1).is_err());
    }
}
