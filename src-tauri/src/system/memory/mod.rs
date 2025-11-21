// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - MemoryCore Module Principal                                  ║
// ║ Système de mémoire chiffrée AES-256-GCM souverain et local                  ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

mod crypto;
mod storage;
pub mod types;
// Tests temporairement désactivés (syntaxe à corriger)
// #[cfg(test)]
// mod tests;
use crate::shared::types::{HealthStatus, ModuleHealth, TitaneResult};
use crate::shared::utils::current_timestamp;
use serde::{Deserialize, Serialize};
use types::{MemoryCollection, MemoryEntry};
const MODULE_NAME: &str = "Memory";
/// Chemin par défaut du fichier de mémoire chiffrée
const MEMORY_FILE_PATH: &str = "./data/memory/encrypted_memory.bin";
/// Passphrase par défaut (à remplacer par une gestion plus sécurisée en production)
const DEFAULT_PASSPHRASE: &str = "TITANE_INFINITY_SOVEREIGN_MEMORY_V8";
/// État du système de mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryState {
    /// Indique si le système est initialisé
    pub initialized: bool,

    /// Nombre d'entrées en mémoire
    pub entries_count: usize,
    /// Checksum SHA-256 de la dernière sauvegarde
    pub checksum: String,
    /// Timestamp de la dernière mise à jour (ms)
    pub last_update: u64,
}
impl MemoryState {
    /// Crée un nouvel état de mémoire
    fn new() -> Self {
        Self {
            initialized: false,
            entries_count: 0,
            checksum: String::new(),
            last_update: 0,
        }
    }
}

/// Memory module state - Encrypted persistent storage
#[derive(Debug, Clone)]
pub struct MemoryModule {
    #[allow(dead_code)]
    pub memory_initialized: bool,
    pub state: MemoryState,
    start_time: u64,
}

impl MemoryModule {
    /// Initialize Memory module
    pub fn init() -> TitaneResult<Self> {
        log::info!("💾 [{}] Initializing encrypted storage system", MODULE_NAME);

        let mut state = MemoryState::new();
        // Vérifier si un fichier de mémoire existe déjà
        if storage::exists(MEMORY_FILE_PATH) {
            // Charger et déchiffrer les données existantes
            match load_entries_internal() {
                Ok(collection) => {
                    state.entries_count = collection.len();
                    state.checksum = calculate_collection_checksum(&collection)
                        .unwrap_or_else(|_| String::new());
                    log::info!(
                        "💾 [{}] Loaded {} encrypted entries",
                        MODULE_NAME,
                        state.entries_count
                    );
                }
                Err(e) => {
                    log::warn!("💾 [{}] Could not load existing memory: {}", MODULE_NAME, e);
                }
            }
        }

        state.initialized = true;
        state.last_update = current_timestamp();

        Ok(Self {
            memory_initialized: true,
            state,
            start_time: current_timestamp(),
        })
    }

    /// Tick - Perform maintenance
    pub fn tick(&mut self) -> TitaneResult<()> {
        self.state.last_update = current_timestamp();

        // Mettre à jour le compte d'entrées
        if let Ok(collection) = load_entries_internal() {
            self.state.entries_count = collection.len();

            if let Ok(checksum) = calculate_collection_checksum(&collection) {
                self.state.checksum = checksum;
            }
        }

        Ok(())
    }

    /// Get module health
    pub fn health(&self) -> ModuleHealth {
        let current = current_timestamp();
        let uptime = current.saturating_sub(self.start_time);
        let status = if !self.state.initialized {
            HealthStatus::Offline
        } else if self.state.entries_count > 0 {
            HealthStatus::Healthy
        } else {
            HealthStatus::Degraded
        };

        ModuleHealth {
            name: MODULE_NAME.to_string(),
            status,
            uptime,
            last_tick: self.state.last_update,
            message: format!(
                "Encrypted entries: {} | Checksum: {:.8}...",
                self.state.entries_count,
                if self.state.checksum.len() > 8 {
                    &self.state.checksum[..8]
                } else {
                    &self.state.checksum
                }
            ),
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// FONCTIONS INTERNES DE GESTION DE LA MÉMOIRE CHIFFRÉE

/// Sauvegarde une entrée de mémoire (usage interne)
fn save_entry_internal(entry: MemoryEntry) -> Result<(), String> {
    // Charger la collection existante ou créer une nouvelle
    let mut collection = load_entries_internal().unwrap_or_default();
    // Ajouter la nouvelle entrée
    collection.add(entry);
    // Sérialiser la collection
    let json_data = serde_json::to_vec(&collection)
        .map_err(|e| format!("Erreur de sérialisation JSON: {}", e))?;
    // Dériver la clé de chiffrement
    let key = crypto::derive_key_from_passphrase(DEFAULT_PASSPHRASE);
    // Chiffrer les données
    let encrypted_data = crypto::encrypt(&key, &json_data)?;
    // Sauvegarder sur disque
    storage::save_bytes(MEMORY_FILE_PATH, &encrypted_data)?;
    Ok(())
}

/// Charge toutes les entrées de mémoire (usage interne)
fn load_entries_internal() -> Result<MemoryCollection, String> {
    // Charger les données chiffrées
    let encrypted_data = storage::load_bytes(MEMORY_FILE_PATH)?;
    // Dériver la clé de déchiffrement
    let key = crypto::derive_key_from_passphrase(DEFAULT_PASSPHRASE);
    // Déchiffrer les données
    let json_data = crypto::decrypt(&key, &encrypted_data)?;
    // Désérialiser la collection
    let collection: MemoryCollection = serde_json::from_slice(&json_data)
        .map_err(|e| format!("Erreur de désérialisation JSON: {}", e))?;
    Ok(collection)
}

/// Supprime toutes les entrées de mémoire (usage interne)
fn clear_memory_internal() -> Result<(), String> {
    storage::clear_storage(MEMORY_FILE_PATH)
}

/// Calcule le checksum d'une collection
fn calculate_collection_checksum(collection: &MemoryCollection) -> Result<String, String> {
    let json_data = serde_json::to_vec(collection)
        .map_err(|e| format!("Erreur de sérialisation pour checksum: {}", e))?;
    Ok(crypto::calculate_checksum(&json_data))
}

/// Obtient le timestamp actuel en millisecondes
fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

// ═════════════════════════════════════════════════════════════════════════════
// MÉTHODES PUBLIQUES POUR LES TAURI COMMANDS (appellées depuis main.rs)
// ═════════════════════════════════════════════════════════════════════════════

/// Sauvegarde une entrée de mémoire (public API pour Tauri command)
pub fn save_entry(entry: String) -> Result<(), String> {
    log::info!("💾 [{}] Saving encrypted entry", MODULE_NAME);
    // Générer un ID unique
    let id = format!("mem_{}", get_timestamp());
    // Créer l'entrée
    let memory_entry = MemoryEntry::new(id, entry);
    // Sauvegarder
    save_entry_internal(memory_entry)?;
    log::info!("💾 [{}] Entry saved successfully", MODULE_NAME);
    Ok(())
}

/// Charge toutes les entrées de mémoire (public API pour Tauri command)
pub fn load_entries() -> Result<String, String> {
    log::info!("💾 [{}] Loading encrypted entries", MODULE_NAME);
    // Charger la collection
    let collection = load_entries_internal()?;
    // Sérialiser en JSON
    let json_string =
        serde_json::to_string(&collection).map_err(|e| format!("Serialization error: {}", e))?;
    log::info!("💾 [{}] Loaded {} entries", MODULE_NAME, collection.len());
    Ok(json_string)
}

/// Supprime toutes les entrées de mémoire (public API pour Tauri command)
pub fn clear_memory() -> Result<(), String> {
    log::info!("💾 [{}] Clearing encrypted memory", MODULE_NAME);
    clear_memory_internal()?;
    log::info!("💾 [{}] Memory cleared successfully", MODULE_NAME);
    Ok(())
}

/// Obtient l'état actuel du système de mémoire (public API pour Tauri command)
pub fn get_memory_state() -> Result<String, String> {
    log::info!("💾 [{}] Getting memory state", MODULE_NAME);

    // Construire l'état actuel
    let collection = match load_entries_internal() {
        Ok(c) => c,
        Err(e) => return Err(format!("Failed to load entries: {}", e)),
    };

    let checksum = calculate_collection_checksum(&collection)?;

    let state = MemoryState {
        initialized: true,
        entries_count: collection.len(),
        checksum,
        last_update: get_timestamp(),
    };

    let json_string =
        serde_json::to_string(&state).map_err(|e| format!("Serialization error: {}", e))?;

    Ok(json_string)
}
