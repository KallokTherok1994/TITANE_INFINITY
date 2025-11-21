// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - MemoryCore Types                                             ║
// ║ Types de données pour le système de mémoire chiffrée                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use serde::{Deserialize, Serialize};
/// Entrée de mémoire individuelle
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    /// Identifiant unique de l'entrée
    pub id: String,

    /// Timestamp UNIX en millisecondes
    pub timestamp: u64,
    /// Contenu de l'entrée (JSON stringifié ou texte brut)
    pub content: String,
}
impl MemoryEntry {
    /// Crée une nouvelle entrée de mémoire
    pub fn new(id: String, content: String) -> Self {
        Self {
            id,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
            content,
        }
    }
}

/// Bloc de mémoire chiffré
#[allow(dead_code)]
pub struct EncryptedMemoryBlock {
    /// Nonce/IV utilisé pour le chiffrement
    pub nonce: Vec<u8>,
    /// Données chiffrées ciphertext + tag
    pub data: Vec<u8>,
}

impl EncryptedMemoryBlock {
    /// Crée un nouveau bloc chiffré
    #[allow(dead_code)]
    pub fn new(nonce: Vec<u8>, data: Vec<u8>) -> Self {
        Self { nonce, data }
    }
}

/// Collection d'entrées de mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryCollection {
    /// Liste des entrées
    pub entries: Vec<MemoryEntry>,
    /// Version du format de données
    pub version: u32,
    /// Timestamp de création de la collection
    pub created_at: u64,
}

impl MemoryCollection {
    /// Crée une nouvelle collection vide
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
            version: 1,
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
        }
    }

    /// Ajoute une entrée à la collection
    pub fn add(&mut self, entry: MemoryEntry) {
        self.entries.push(entry);
    }

    /// Retourne le nombre d'entrées
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Vérifie si la collection est vide
    #[allow(dead_code)]
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

impl Default for MemoryCollection {
    fn default() -> Self {
        Self::new()
    }
}
