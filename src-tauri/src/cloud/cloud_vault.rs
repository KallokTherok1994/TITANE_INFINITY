// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — CLOUD VAULT ENGINE
//   Structure de données chiffrées pour synchronisation
//   Versioning, intégrité, filtrage par manifest
// ═══════════════════════════════════════════════════════════════

use chrono::{DateTime, Utc};
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use super::cloud_crypto::{compress_lz4, decompress_lz4, CloudCryptoEngine, EncryptedData};
use super::{CloudSyncConfig, CloudSyncError, SyncStatus};

/// ═══════════════════════════════════════════════════════════════
/// CLOUD VAULT - Structure principale
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudVault {
    /// Version du vault
    pub version: String,
    /// Timestamp de la dernière synchronisation
    pub last_sync: Option<DateTime<Utc>>,
    /// Timestamp de création
    pub created_at: DateTime<Utc>,
    /// ID de l'appareil qui a créé le vault
    pub created_by_device: String,
    /// Numéro de révision (incrémental)
    pub revision: u64,
    /// Données synchronisées
    pub data: VaultData,
    /// Historique des modifications
    pub changelog: Vec<ChangelogEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct VaultData {
    /// Thème UI
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ui_theme: Option<serde_json::Value>,
    /// Layout UI
    #[serde(skip_serializing_if = "Option::is_none")]
    pub layout: Option<serde_json::Value>,
    /// Progression utilisateur
    #[serde(skip_serializing_if = "Option::is_none")]
    pub progression: Option<serde_json::Value>,
    /// Index de connaissances
    #[serde(skip_serializing_if = "Option::is_none")]
    pub knowledge_index: Option<serde_json::Value>,
    /// Mémoire long-terme
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memory_lt: Option<serde_json::Value>,
    /// Patterns d'apprentissage
    #[serde(skip_serializing_if = "Option::is_none")]
    pub patterns: Option<serde_json::Value>,
    /// Évolution du système
    #[serde(skip_serializing_if = "Option::is_none")]
    pub evolution: Option<serde_json::Value>,
    /// Documents internes
    #[serde(skip_serializing_if = "Option::is_none")]
    pub docs: Option<serde_json::Value>,
    /// Historique d'entraînement
    #[serde(skip_serializing_if = "Option::is_none")]
    pub training_history: Option<serde_json::Value>,
    /// Presets IA
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ia_presets: Option<serde_json::Value>,
    /// Historique Developer Mode
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dev_mode_history: Option<serde_json::Value>,
    /// Données additionnelles autorisées
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChangelogEntry {
    /// Timestamp de la modification
    pub timestamp: DateTime<Utc>,
    /// ID de l'appareil source
    pub device_id: String,
    /// Type de modification
    pub action: ChangeAction,
    /// Clés modifiées
    pub affected_keys: Vec<String>,
    /// Description optionnelle
    pub description: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChangeAction {
    /// Création initiale
    Created,
    /// Mise à jour
    Updated,
    /// Synchronisation entrante
    SyncedIn,
    /// Synchronisation sortante
    SyncedOut,
    /// Résolution de conflit
    ConflictResolved,
    /// Restauration
    Restored,
}

/// ═══════════════════════════════════════════════════════════════
/// CLOUD MANIFEST - Filtrage des données
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudManifest {
    /// Version du manifest
    pub version: String,
    /// Données autorisées à synchroniser
    pub allowed: Vec<String>,
    /// Données bloquées (jamais synchronisées)
    pub blocked: Vec<String>,
    /// Règles de transformation
    pub transformations: HashMap<String, TransformRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransformRule {
    /// Filtre les champs sensibles
    pub filter_sensitive: bool,
    /// Limite la taille en bytes
    pub max_size_bytes: Option<usize>,
    /// Expiration en jours
    pub expire_after_days: Option<u32>,
}

impl Default for CloudManifest {
    fn default() -> Self {
        Self {
            version: "v∞".to_string(),
            allowed: vec![
                "ui_theme".to_string(),
                "layout".to_string(),
                "progression".to_string(),
                "knowledge_index".to_string(),
                "memory_lt".to_string(),
                "patterns".to_string(),
                "evolution".to_string(),
                "docs".to_string(),
                "training_history".to_string(),
                "ia_presets".to_string(),
                "dev_mode_history".to_string(),
            ],
            blocked: vec![
                "secrets".to_string(),
                "keys".to_string(),
                "api_keys".to_string(),
                "memory_ct".to_string(),
                "memory_mt".to_string(),
                "logs".to_string(),
                "raw_cache".to_string(),
                "system_config".to_string(),
                "credentials".to_string(),
                "tokens".to_string(),
                "private_keys".to_string(),
            ],
            transformations: HashMap::new(),
        }
    }
}

/// ═══════════════════════════════════════════════════════════════
/// VAULT META - Métadonnées non chiffrées
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultMeta {
    /// Version du format
    pub format_version: u8,
    /// Taille du vault chiffré en bytes
    pub vault_size_bytes: u64,
    /// Hash du vault chiffré
    pub vault_hash: String,
    /// Dernière modification
    pub last_modified: DateTime<Utc>,
    /// Révision du vault
    pub revision: u64,
    /// ID de l'appareil qui a modifié en dernier
    pub last_modified_by: String,
    /// Signature de l'appareil
    pub signature: Option<String>,
    /// Compression utilisée
    pub compression: String,
}

/// ═══════════════════════════════════════════════════════════════
/// DEVICE IDENTITY
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceIdentity {
    /// ID unique de l'appareil
    pub device_id: String,
    /// Nom de l'appareil
    pub device_name: String,
    /// Système d'exploitation
    pub os: String,
    /// Version du système
    pub os_version: String,
    /// Fingerprint de la clé publique
    pub fingerprint: String,
    /// Clé publique (base64)
    pub public_key: String,
    /// Première connexion
    pub first_seen: DateTime<Utc>,
    /// Dernière activité
    pub last_seen: DateTime<Utc>,
    /// Statut de confiance
    pub trusted: bool,
}

/// ═══════════════════════════════════════════════════════════════
/// SYNC HISTORY
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncHistory {
    /// Entrées d'historique
    pub entries: Vec<SyncHistoryEntry>,
    /// Nombre maximum d'entrées
    pub max_entries: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncHistoryEntry {
    /// Timestamp
    pub timestamp: DateTime<Utc>,
    /// Direction (push/pull)
    pub direction: SyncDirection,
    /// Statut
    pub status: SyncStatus,
    /// ID de l'appareil distant
    pub remote_device_id: Option<String>,
    /// Révision synchronisée
    pub revision: u64,
    /// Taille des données en bytes
    pub data_size_bytes: u64,
    /// Durée en millisecondes
    pub duration_ms: u64,
    /// Message d'erreur si échec
    pub error_message: Option<String>,
    /// Conflits résolus
    pub conflicts_resolved: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SyncDirection {
    /// Export vers le backend
    Push,
    /// Import depuis le backend
    Pull,
    /// Synchronisation bidirectionnelle
    Bidirectional,
}

impl Default for SyncHistory {
    fn default() -> Self {
        Self {
            entries: Vec::new(),
            max_entries: 1000,
        }
    }
}

/// ═══════════════════════════════════════════════════════════════
/// VAULT ENGINE - Gestion du vault
/// ═══════════════════════════════════════════════════════════════

pub struct CloudVaultEngine {
    /// Chemin vers le dossier de données
    data_path: PathBuf,
    /// Moteur de chiffrement
    crypto: CloudCryptoEngine,
    /// Manifest de filtrage
    manifest: CloudManifest,
    /// Identité de l'appareil
    device_identity: DeviceIdentity,
    /// Vault actuel (déchiffré)
    vault: Option<CloudVault>,
    /// Configuration
    config: CloudSyncConfig,
}

impl CloudVaultEngine {
    /// Initialise le moteur de vault
    pub fn new(
        data_path: PathBuf,
        passphrase: &str,
        device_name: &str,
    ) -> Result<Self, CloudSyncError> {
        // Créer le dossier si nécessaire
        fs::create_dir_all(&data_path)?;

        // Initialiser le crypto engine
        let mut crypto = CloudCryptoEngine::new(passphrase)?;

        // Charger ou générer les clés d'appareil
        let keys_path = data_path.join("device_keys.json");
        let keypair = crypto.load_or_generate_device_keys(&keys_path)?;

        // Charger ou créer l'identité
        let identity_path = data_path.join("device_identity.json");
        let device_identity = Self::load_or_create_identity(
            &identity_path,
            device_name,
            &keypair.fingerprint,
            &keypair.public_key,
        )?;

        // Charger le manifest
        let manifest_path = data_path.join("cloud_manifest.json");
        let manifest = Self::load_or_create_manifest(&manifest_path)?;

        // Charger la configuration
        let config_path = data_path.join("cloud_config.json");
        let config = Self::load_or_create_config(&config_path)?;

        info!(
            "[CloudVault] Engine initialized for device: {}",
            device_identity.device_id
        );

        Ok(Self {
            data_path,
            crypto,
            manifest,
            device_identity,
            vault: None,
            config,
        })
    }

    /// Charge l'identité de l'appareil ou en crée une nouvelle
    fn load_or_create_identity(
        path: &Path,
        device_name: &str,
        fingerprint: &str,
        public_key: &str,
    ) -> Result<DeviceIdentity, CloudSyncError> {
        if path.exists() {
            let content = fs::read_to_string(path)?;
            let identity: DeviceIdentity = serde_json::from_str(&content)?;
            Ok(identity)
        } else {
            let os_info = std::env::consts::OS;
            let device_id = format!(
                "TITANE-{}-{}",
                device_name.replace(' ', "-"),
                &fingerprint[..8]
            );

            let identity = DeviceIdentity {
                device_id,
                device_name: device_name.to_string(),
                os: os_info.to_string(),
                os_version: std::env::consts::ARCH.to_string(),
                fingerprint: fingerprint.to_string(),
                public_key: public_key.to_string(),
                first_seen: Utc::now(),
                last_seen: Utc::now(),
                trusted: true,
            };

            fs::write(path, serde_json::to_string_pretty(&identity)?)?;
            Ok(identity)
        }
    }

    /// Charge le manifest ou crée le défaut
    fn load_or_create_manifest(path: &Path) -> Result<CloudManifest, CloudSyncError> {
        if path.exists() {
            let content = fs::read_to_string(path)?;
            let manifest: CloudManifest = serde_json::from_str(&content)?;
            Ok(manifest)
        } else {
            let manifest = CloudManifest::default();
            fs::write(path, serde_json::to_string_pretty(&manifest)?)?;
            Ok(manifest)
        }
    }

    /// Charge la configuration ou crée le défaut
    fn load_or_create_config(path: &Path) -> Result<CloudSyncConfig, CloudSyncError> {
        if path.exists() {
            let content = fs::read_to_string(path)?;
            let config: CloudSyncConfig = serde_json::from_str(&content)?;
            Ok(config)
        } else {
            let config = CloudSyncConfig::default();
            fs::write(path, serde_json::to_string_pretty(&config)?)?;
            Ok(config)
        }
    }

    /// Charge le vault depuis le fichier chiffré
    pub fn load_vault(&mut self) -> Result<Option<CloudVault>, CloudSyncError> {
        let vault_path = self.data_path.join("vault.enc");
        let meta_path = self.data_path.join("vault_meta.json");

        if !vault_path.exists() {
            info!("[CloudVault] No vault file found, creating new vault");
            return Ok(None);
        }

        // Charger les métadonnées
        let meta_content = fs::read_to_string(&meta_path)?;
        let meta: VaultMeta = serde_json::from_str(&meta_content)?;

        // Charger le vault chiffré
        let encrypted_content = fs::read_to_string(&vault_path)?;
        let encrypted: EncryptedData = serde_json::from_str(&encrypted_content)?;

        // Vérifier le hash
        let actual_hash = CloudCryptoEngine::hash_content(encrypted_content.as_bytes());
        if actual_hash != meta.vault_hash {
            error!("[CloudVault] Vault hash mismatch - possible corruption");
            return Err(CloudSyncError::VaultCorrupted(
                "Hash verification failed".to_string(),
            ));
        }

        // Déchiffrer
        let decrypted = self.crypto.decrypt(&encrypted, true)?;

        // Décompresser si nécessaire
        let decompressed = if meta.compression == "gzip" {
            decompress_lz4(&decrypted)?
        } else {
            decrypted
        };

        // Désérialiser
        let vault: CloudVault = serde_json::from_slice(&decompressed)?;

        info!(
            "[CloudVault] Vault loaded successfully (revision {})",
            vault.revision
        );
        self.vault = Some(vault.clone());

        Ok(Some(vault))
    }

    /// Sauvegarde le vault dans le fichier chiffré
    pub fn save_vault(&mut self, vault: &CloudVault) -> Result<(), CloudSyncError> {
        // Sérialiser
        let serialized = serde_json::to_vec(vault)?;

        // Compresser
        let compressed = if self.config.compression_enabled {
            compress_lz4(&serialized)?
        } else {
            serialized
        };

        // Chiffrer et signer
        let encrypted = self.crypto.encrypt(&compressed, true)?;
        let encrypted_json = serde_json::to_string_pretty(&encrypted)?;

        // Calculer le hash
        let vault_hash = CloudCryptoEngine::hash_content(encrypted_json.as_bytes());

        // Créer les métadonnées
        let meta = VaultMeta {
            format_version: 1,
            vault_size_bytes: encrypted_json.len() as u64,
            vault_hash,
            last_modified: Utc::now(),
            revision: vault.revision,
            last_modified_by: self.device_identity.device_id.clone(),
            signature: encrypted.signature.clone(),
            compression: if self.config.compression_enabled {
                "gzip".to_string()
            } else {
                "none".to_string()
            },
        };

        // Sauvegarder
        let vault_path = self.data_path.join("vault.enc");
        let meta_path = self.data_path.join("vault_meta.json");

        fs::write(&vault_path, &encrypted_json)?;
        fs::write(&meta_path, serde_json::to_string_pretty(&meta)?)?;

        self.vault = Some(vault.clone());

        info!(
            "[CloudVault] Vault saved successfully (revision {})",
            vault.revision
        );

        Ok(())
    }

    /// Crée un nouveau vault vide
    pub fn create_vault(&mut self) -> Result<CloudVault, CloudSyncError> {
        let vault = CloudVault {
            version: "v∞".to_string(),
            last_sync: None,
            created_at: Utc::now(),
            created_by_device: self.device_identity.device_id.clone(),
            revision: 1,
            data: VaultData::default(),
            changelog: vec![ChangelogEntry {
                timestamp: Utc::now(),
                device_id: self.device_identity.device_id.clone(),
                action: ChangeAction::Created,
                affected_keys: vec![],
                description: Some("Initial vault creation".to_string()),
            }],
        };

        self.save_vault(&vault)?;
        info!("[CloudVault] New vault created");

        Ok(vault)
    }

    /// Met à jour une donnée dans le vault
    pub fn update_data(
        &mut self,
        key: &str,
        value: serde_json::Value,
    ) -> Result<(), CloudSyncError> {
        // Vérifier si la clé est autorisée
        if !self.is_key_allowed(key) {
            return Err(CloudSyncError::DataBlocked(format!(
                "Key '{}' is blocked by manifest",
                key
            )));
        }

        let mut vault = self.vault.clone().unwrap_or_else(|| CloudVault {
            version: "v∞".to_string(),
            last_sync: None,
            created_at: Utc::now(),
            created_by_device: self.device_identity.device_id.clone(),
            revision: 0,
            data: VaultData::default(),
            changelog: vec![],
        });

        // Mettre à jour la donnée
        match key {
            "ui_theme" => vault.data.ui_theme = Some(value),
            "layout" => vault.data.layout = Some(value),
            "progression" => vault.data.progression = Some(value),
            "knowledge_index" => vault.data.knowledge_index = Some(value),
            "memory_lt" => vault.data.memory_lt = Some(value),
            "patterns" => vault.data.patterns = Some(value),
            "evolution" => vault.data.evolution = Some(value),
            "docs" => vault.data.docs = Some(value),
            "training_history" => vault.data.training_history = Some(value),
            "ia_presets" => vault.data.ia_presets = Some(value),
            "dev_mode_history" => vault.data.dev_mode_history = Some(value),
            _ => {
                vault.data.extra.insert(key.to_string(), value);
            }
        }

        // Incrémenter la révision
        vault.revision += 1;

        // Ajouter au changelog
        vault.changelog.push(ChangelogEntry {
            timestamp: Utc::now(),
            device_id: self.device_identity.device_id.clone(),
            action: ChangeAction::Updated,
            affected_keys: vec![key.to_string()],
            description: None,
        });

        // Limiter le changelog à 1000 entrées
        if vault.changelog.len() > 1000 {
            vault.changelog = vault.changelog.split_off(vault.changelog.len() - 1000);
        }

        self.save_vault(&vault)?;
        Ok(())
    }

    /// Vérifie si une clé est autorisée par le manifest
    pub fn is_key_allowed(&self, key: &str) -> bool {
        // Si explicitement bloquée, refuser
        if self.manifest.blocked.contains(&key.to_string()) {
            return false;
        }

        // Si la liste allowed est vide, tout est autorisé (sauf blocked)
        if self.manifest.allowed.is_empty() {
            return true;
        }

        // Sinon, doit être dans allowed
        self.manifest.allowed.contains(&key.to_string())
    }

    /// Retourne l'identité de l'appareil
    pub fn get_device_identity(&self) -> &DeviceIdentity {
        &self.device_identity
    }

    /// Retourne le vault actuel
    pub fn get_vault(&self) -> Option<&CloudVault> {
        self.vault.as_ref()
    }

    /// Retourne la configuration
    pub fn get_config(&self) -> &CloudSyncConfig {
        &self.config
    }

    /// Met à jour la configuration
    pub fn update_config(&mut self, config: CloudSyncConfig) -> Result<(), CloudSyncError> {
        let config_path = self.data_path.join("cloud_config.json");
        fs::write(&config_path, serde_json::to_string_pretty(&config)?)?;
        self.config = config;
        Ok(())
    }

    /// Retourne le manifest
    pub fn get_manifest(&self) -> &CloudManifest {
        &self.manifest
    }

    /// Exporte les données filtrées pour synchronisation
    pub fn export_for_sync(&self) -> Result<VaultData, CloudSyncError> {
        let vault = self.vault.as_ref().ok_or_else(|| {
            CloudSyncError::IoError("No vault loaded".to_string())
        })?;

        // Filtrer les données selon le manifest
        let mut filtered = VaultData::default();

        if self.is_key_allowed("ui_theme") {
            filtered.ui_theme = vault.data.ui_theme.clone();
        }
        if self.is_key_allowed("layout") {
            filtered.layout = vault.data.layout.clone();
        }
        if self.is_key_allowed("progression") {
            filtered.progression = vault.data.progression.clone();
        }
        if self.is_key_allowed("knowledge_index") {
            filtered.knowledge_index = vault.data.knowledge_index.clone();
        }
        if self.is_key_allowed("memory_lt") {
            filtered.memory_lt = vault.data.memory_lt.clone();
        }
        if self.is_key_allowed("patterns") {
            filtered.patterns = vault.data.patterns.clone();
        }
        if self.is_key_allowed("evolution") {
            filtered.evolution = vault.data.evolution.clone();
        }
        if self.is_key_allowed("docs") {
            filtered.docs = vault.data.docs.clone();
        }
        if self.is_key_allowed("training_history") {
            filtered.training_history = vault.data.training_history.clone();
        }
        if self.is_key_allowed("ia_presets") {
            filtered.ia_presets = vault.data.ia_presets.clone();
        }
        if self.is_key_allowed("dev_mode_history") {
            filtered.dev_mode_history = vault.data.dev_mode_history.clone();
        }

        // Filtrer les données extra
        for (key, value) in &vault.data.extra {
            if self.is_key_allowed(key) {
                filtered.extra.insert(key.clone(), value.clone());
            }
        }

        Ok(filtered)
    }

    /// Vérifie l'intégrité du vault
    pub fn verify_integrity(&self) -> Result<bool, CloudSyncError> {
        let vault_path = self.data_path.join("vault.enc");
        let meta_path = self.data_path.join("vault_meta.json");

        if !vault_path.exists() || !meta_path.exists() {
            return Ok(true); // Pas de vault = intégrité OK
        }

        let meta_content = fs::read_to_string(&meta_path)?;
        let meta: VaultMeta = serde_json::from_str(&meta_content)?;

        let vault_content = fs::read_to_string(&vault_path)?;
        let actual_hash = CloudCryptoEngine::hash_content(vault_content.as_bytes());

        Ok(actual_hash == meta.vault_hash)
    }
}
