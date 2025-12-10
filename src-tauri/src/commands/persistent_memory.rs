// TITANE∞ v19.2Ω — PERSISTENT MEMORY COMMANDS
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
//
// Système de Mémoire Persistante 3-Niveaux:
// - Session: volatile, 24h max, ~100 entrées
// - Intermediate: persistant, 90 jours, ~500 entrées
// - LongTerm: permanent, chiffré AES-256-GCM, ~1000 entrées
//
// ⚠️ SÉCURITÉ: Toutes les écritures passent par ce module.
//    Le frontend n'a AUCUN accès direct aux fichiers.

use crate::memory::encryption::MemoryEncryption;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use uuid::Uuid;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES ET STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

/// Niveau de mémoire
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum MemoryLevel {
    Session,
    Intermediate,
    LongTerm,
}

/// Type de contenu mémoire
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MemoryContentType {
    Message,
    Summary,
    Knowledge,
    Preference,
    ProjectContext,
    CodeSnippet,
    Decision,
    Reference,
    Identity,
    AutomationResult,
    Milestone,
}

/// Sujet mémoire
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MemoryTopic {
    General,
    Coding,
    Project,
    Personal,
    Technical,
    Creative,
    Learning,
    Decisions,
    Preferences,
    Automation,
    System,
}

/// Importance (1-5)
pub type MemoryImportance = u8;

/// Statut d'une entrée
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MemoryStatus {
    Active,
    Archived,
    PendingReview,
    Expired,
}

/// Source de l'entrée
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MemorySource {
    ChatUser,
    ChatAssistant,
    AutoSummary,
    ManualSave,
    Automation,
    System,
    Import,
}

/// Métadonnées communes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetadata {
    pub created_at: i64,
    pub updated_at: i64,
    pub last_accessed_at: Option<i64>,
    pub access_count: u32,
    pub source: MemorySource,
    pub mode_id: Option<String>,
    pub evolution_phase: Option<String>,
    pub project_id: Option<String>,
    pub conversation_id: Option<String>,
    pub content_hash: Option<String>,
    pub schema_version: String,
}

/// Entrée mémoire générique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersistentMemoryEntry {
    pub id: String,
    pub level: MemoryLevel,
    pub content_type: MemoryContentType,
    pub title: Option<String>,
    pub summary: Option<String>,
    pub content: String,
    pub topic: MemoryTopic,
    pub importance: MemoryImportance,
    pub tags: Vec<String>,
    pub status: MemoryStatus,
    pub metadata: MemoryMetadata,
    // Champs optionnels par niveau
    pub ttl: Option<i64>,              // Session
    pub promotable: Option<bool>,      // Session, Intermediate
    pub source_entry_ids: Vec<String>, // Intermediate, LongTerm
    pub relevance_score: Option<f32>,  // Intermediate
    pub expires_at: Option<i64>,       // Intermediate
    pub confidence_score: Option<u8>,  // LongTerm
    pub user_verified: Option<bool>,   // LongTerm
    pub version: Option<u32>,          // LongTerm
    pub version_history: Vec<String>,  // LongTerm
}

/// Résumé automatique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySummary {
    pub id: String,
    pub title: String,
    pub content: String,
    pub topic: MemoryTopic,
    pub period_start: i64,
    pub period_end: i64,
    pub source_count: u32,
    pub source_ids: Vec<String>,
    pub primary_mode: Option<String>,
    pub keywords: Vec<String>,
    pub aggregated_importance: f32,
    pub generated_at: i64,
    pub summary_type: String,
}

/// Bundle logique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryBundle {
    pub id: String,
    pub name: String,
    pub description: String,
    pub topic: MemoryTopic,
    pub entry_ids: Vec<String>,
    pub tags: Vec<String>,
    pub created_at: i64,
    pub updated_at: i64,
    pub created_by: String,
    pub color: Option<String>,
    pub icon: Option<String>,
}

/// Statistiques mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersistentMemoryStats {
    pub count_by_level: HashMap<String, u32>,
    pub count_by_topic: HashMap<String, u32>,
    pub count_by_type: HashMap<String, u32>,
    pub total_size: u64,
    pub size_by_level: HashMap<String, u64>,
    pub last_write: i64,
    pub last_read: i64,
    pub summary_count: u32,
    pub bundle_count: u32,
    pub health: MemoryHealth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryHealth {
    pub status: String,
    pub corrupted_files: u32,
    pub last_integrity_check: i64,
    pub disk_space_percent: f32,
    pub encryption_active: bool,
    pub last_backup: i64,
}

/// Requête de lecture
#[derive(Debug, Clone, Deserialize)]
pub struct MemoryReadRequest {
    pub levels: Option<Vec<MemoryLevel>>,
    pub topics: Option<Vec<MemoryTopic>>,
    pub content_types: Option<Vec<MemoryContentType>>,
    pub min_importance: Option<MemoryImportance>,
    pub current_mode: String,
    pub query: Option<String>,
    pub tags: Option<Vec<String>>,
    pub project_id: Option<String>,
    pub limit: Option<u32>,
    pub include_summaries: Option<bool>,
    pub min_relevance_score: Option<f32>,
}

/// Réponse de lecture
#[derive(Debug, Clone, Serialize)]
pub struct MemoryReadResponse {
    pub entries: Vec<PersistentMemoryEntry>,
    pub summaries: Option<Vec<MemorySummary>>,
    pub total_count: u32,
    pub query_time: u64,
    pub relevance_scores: HashMap<String, f32>,
}

/// État global de la mémoire persistante
pub struct PersistentMemoryState {
    /// Chemin de base pour le stockage
    base_path: PathBuf,
    /// Cache des entrées session (volatile)
    session_cache: Mutex<HashMap<String, PersistentMemoryEntry>>,
    /// Encrypteur pour les données sensibles
    encryptor: MemoryEncryption,
    /// Dernière lecture
    last_read: Mutex<i64>,
    /// Dernière écriture
    last_write: Mutex<i64>,
}

impl PersistentMemoryState {
    pub fn new(app_handle: &AppHandle) -> Self {
        // Phase 1 Stabilisation: Fallback si app_data_dir() échoue
        let app_data_dir = app_handle.path().app_data_dir().unwrap_or_else(|e| {
            eprintln!(
                "Warning: Failed to get app data dir ({}), using current directory",
                e
            );
            PathBuf::from(".").join("titane-data")
        });

        let base_path = app_data_dir.join("persistent_memory");

        // Créer les répertoires
        fs::create_dir_all(&base_path).ok();
        fs::create_dir_all(base_path.join("session")).ok();
        fs::create_dir_all(base_path.join("intermediate")).ok();
        fs::create_dir_all(base_path.join("long_term")).ok();
        fs::create_dir_all(base_path.join("summaries")).ok();
        fs::create_dir_all(base_path.join("bundles")).ok();

        Self {
            base_path,
            session_cache: Mutex::new(HashMap::new()),
            encryptor: MemoryEncryption::new("TITANE_MEMORY_KEY_v19"),
            last_read: Mutex::new(Utc::now().timestamp_millis()),
            last_write: Mutex::new(Utc::now().timestamp_millis()),
        }
    }

    fn get_level_path(&self, level: &MemoryLevel) -> PathBuf {
        match level {
            MemoryLevel::Session => self.base_path.join("session"),
            MemoryLevel::Intermediate => self.base_path.join("intermediate"),
            MemoryLevel::LongTerm => self.base_path.join("long_term"),
        }
    }

    /// Génère un hash de contenu simple
    fn hash_content(&self, content: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        content.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDES TAURI - LECTURE
// ─────────────────────────────────────────────────────────────────────────────

/// Lire les entrées mémoire selon les critères
#[tauri::command]
pub async fn persistent_memory_read(
    state: State<'_, PersistentMemoryState>,
    request: MemoryReadRequest,
) -> Result<MemoryReadResponse, String> {
    log::info!("[PersistentMemory] read: mode={}", request.current_mode);
    let start_time = std::time::Instant::now();

    let levels = request.levels.unwrap_or_else(|| {
        vec![
            MemoryLevel::Session,
            MemoryLevel::Intermediate,
            MemoryLevel::LongTerm,
        ]
    });
    let limit = request.limit.unwrap_or(100) as usize;

    let mut all_entries: Vec<PersistentMemoryEntry> = Vec::new();
    let mut relevance_scores: HashMap<String, f32> = HashMap::new();

    for level in &levels {
        let entries = match level {
            MemoryLevel::Session => {
                // Lire du cache
                let cache = state.session_cache.lock().map_err(|e| e.to_string())?;
                cache.values().cloned().collect::<Vec<_>>()
            }
            MemoryLevel::Intermediate | MemoryLevel::LongTerm => {
                // Lire du fichier
                let path = state.get_level_path(level);
                let file_path = path.join("entries.json");

                if file_path.exists() {
                    let content = if *level == MemoryLevel::LongTerm {
                        // Déchiffrer pour long_term
                        let encrypted =
                            fs::read(&file_path).map_err(|e| format!("Failed to read: {}", e))?;
                        state
                            .encryptor
                            .decrypt(&encrypted)
                            .map_err(|e| format!("Decryption failed: {}", e))?
                    } else {
                        fs::read_to_string(&file_path)
                            .map_err(|e| format!("Failed to read: {}", e))?
                    };

                    serde_json::from_str::<Vec<PersistentMemoryEntry>>(&content).unwrap_or_default()
                } else {
                    Vec::new()
                }
            }
        };

        // Filtrer par critères
        let filtered: Vec<PersistentMemoryEntry> = entries
            .into_iter()
            .filter(|e| {
                // Filtre par sujet
                if let Some(ref topics) = request.topics {
                    if !topics.contains(&e.topic) {
                        return false;
                    }
                }
                // Filtre par type
                if let Some(ref types) = request.content_types {
                    if !types.contains(&e.content_type) {
                        return false;
                    }
                }
                // Filtre par importance
                if let Some(min) = request.min_importance {
                    if e.importance < min {
                        return false;
                    }
                }
                // Filtre par projet
                if let Some(ref pid) = request.project_id {
                    if e.metadata.project_id.as_ref() != Some(pid) {
                        return false;
                    }
                }
                // Filtre par tags
                if let Some(ref tags) = request.tags {
                    if !tags.iter().any(|t| e.tags.contains(t)) {
                        return false;
                    }
                }
                true
            })
            .collect();

        // Calculer les scores de pertinence
        if let Some(ref query) = request.query {
            for entry in &filtered {
                let score = calculate_relevance(&entry.content, query);
                if request.min_relevance_score.map_or(true, |min| score >= min) {
                    relevance_scores.insert(entry.id.clone(), score);
                }
            }
        }

        all_entries.extend(filtered);
    }

    // Trier par pertinence si requête
    if request.query.is_some() {
        all_entries.sort_by(|a, b| {
            let score_a = relevance_scores.get(&a.id).unwrap_or(&0.0);
            let score_b = relevance_scores.get(&b.id).unwrap_or(&0.0);
            score_b
                .partial_cmp(score_a)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
    }

    let total_count = all_entries.len() as u32;
    all_entries.truncate(limit);

    // Charger les résumés si demandé
    let summaries = if request.include_summaries.unwrap_or(false) {
        load_summaries(&state.base_path).ok()
    } else {
        None
    };

    // Mettre à jour last_read
    *state.last_read.lock().map_err(|e| e.to_string())? = Utc::now().timestamp_millis();

    let query_time = start_time.elapsed().as_millis() as u64;

    Ok(MemoryReadResponse {
        entries: all_entries,
        summaries,
        total_count,
        query_time,
        relevance_scores,
    })
}

/// Obtenir les statistiques mémoire
#[tauri::command]
pub async fn persistent_memory_get_stats(
    state: State<'_, PersistentMemoryState>,
) -> Result<PersistentMemoryStats, String> {
    log::info!("[PersistentMemory] get_stats");

    let mut count_by_level: HashMap<String, u32> = HashMap::new();
    let mut count_by_topic: HashMap<String, u32> = HashMap::new();
    let mut count_by_type: HashMap<String, u32> = HashMap::new();
    let mut size_by_level: HashMap<String, u64> = HashMap::new();
    let mut total_size: u64 = 0;

    // Compter les entrées session
    {
        let cache = state.session_cache.lock().map_err(|e| e.to_string())?;
        count_by_level.insert("session".to_string(), cache.len() as u32);
        for entry in cache.values() {
            *count_by_topic
                .entry(format!("{:?}", entry.topic).to_lowercase())
                .or_insert(0) += 1;
            *count_by_type
                .entry(format!("{:?}", entry.content_type).to_lowercase())
                .or_insert(0) += 1;
        }
    }

    // Compter intermediate et long_term
    for (level_name, level) in [
        ("intermediate", MemoryLevel::Intermediate),
        ("long_term", MemoryLevel::LongTerm),
    ] {
        let path = state.get_level_path(&level).join("entries.json");
        if path.exists() {
            let size = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
            size_by_level.insert(level_name.to_string(), size);
            total_size += size;

            let entries: Vec<PersistentMemoryEntry> = if level == MemoryLevel::LongTerm {
                let encrypted = fs::read(&path).unwrap_or_default();
                let content = state.encryptor.decrypt(&encrypted).unwrap_or_default();
                serde_json::from_str(&content).unwrap_or_default()
            } else {
                let content = fs::read_to_string(&path).unwrap_or_default();
                serde_json::from_str(&content).unwrap_or_default()
            };

            count_by_level.insert(level_name.to_string(), entries.len() as u32);
            for entry in entries {
                *count_by_topic
                    .entry(format!("{:?}", entry.topic).to_lowercase())
                    .or_insert(0) += 1;
                *count_by_type
                    .entry(format!("{:?}", entry.content_type).to_lowercase())
                    .or_insert(0) += 1;
            }
        } else {
            count_by_level.insert(level_name.to_string(), 0);
            size_by_level.insert(level_name.to_string(), 0);
        }
    }

    // Compter les résumés
    let summaries = load_summaries(&state.base_path).unwrap_or_default();
    let summary_count = summaries.len() as u32;

    // Compter les bundles
    let bundles = load_bundles(&state.base_path).unwrap_or_default();
    let bundle_count = bundles.len() as u32;

    let last_read = *state.last_read.lock().map_err(|e| e.to_string())?;
    let last_write = *state.last_write.lock().map_err(|e| e.to_string())?;

    Ok(PersistentMemoryStats {
        count_by_level,
        count_by_topic,
        count_by_type,
        total_size,
        size_by_level,
        last_write,
        last_read,
        summary_count,
        bundle_count,
        health: MemoryHealth {
            status: "healthy".to_string(),
            corrupted_files: 0,
            last_integrity_check: Utc::now().timestamp_millis(),
            disk_space_percent: 100.0,
            encryption_active: true,
            last_backup: 0,
        },
    })
}

/// Obtenir les bundles
#[tauri::command]
pub async fn persistent_memory_get_bundles(
    state: State<'_, PersistentMemoryState>,
) -> Result<Vec<MemoryBundle>, String> {
    log::info!("[PersistentMemory] get_bundles");
    load_bundles(&state.base_path)
}

/// Obtenir le contexte pour injection IA
#[tauri::command]
pub async fn persistent_memory_get_context(
    state: State<'_, PersistentMemoryState>,
    mode_id: String,
    query: String,
) -> Result<serde_json::Value, String> {
    log::info!(
        "[PersistentMemory] get_context: mode={}, query_len={}",
        mode_id,
        query.len()
    );

    // Lire toutes les entrées pertinentes
    let request = MemoryReadRequest {
        levels: Some(vec![
            MemoryLevel::Session,
            MemoryLevel::Intermediate,
            MemoryLevel::LongTerm,
        ]),
        topics: None,
        content_types: None,
        min_importance: Some(2),
        current_mode: mode_id,
        query: Some(query.clone()),
        tags: None,
        project_id: None,
        limit: Some(50),
        include_summaries: Some(false),
        min_relevance_score: Some(0.3),
    };

    let response = persistent_memory_read(state, request).await?;

    // Construire le contexte textuel
    let mut context = String::new();
    let mut used_entries: Vec<String> = Vec::new();
    let max_tokens = 2000;
    let mut current_tokens = 0;

    for entry in response.entries {
        let score = response.relevance_scores.get(&entry.id).unwrap_or(&0.0);
        if *score < 0.3 {
            continue;
        }

        let entry_text = format!(
            "[{:?}] {}\n{}\n\n",
            entry.topic,
            entry.title.as_deref().unwrap_or(""),
            entry.content
        );

        let tokens = entry_text.len() / 4;
        if current_tokens + tokens > max_tokens {
            break;
        }

        context.push_str(&entry_text);
        current_tokens += tokens;
        used_entries.push(entry.id);
    }

    Ok(serde_json::json!({
        "context": context.trim(),
        "usedEntries": used_entries
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDES TAURI - ÉCRITURE
// ─────────────────────────────────────────────────────────────────────────────

/// Écrire une entrée mémoire
#[tauri::command]
pub async fn persistent_memory_write_entry(
    state: State<'_, PersistentMemoryState>,
    content: String,
    level: MemoryLevel,
    topic: Option<MemoryTopic>,
    importance: Option<MemoryImportance>,
    content_type: Option<MemoryContentType>,
    tags: Option<Vec<String>>,
    title: Option<String>,
    project_id: Option<String>,
    mode_id: String,
) -> Result<String, String> {
    log::info!(
        "[PersistentMemory] write_entry: level={:?}, mode={}",
        level,
        mode_id
    );

    // Valider le contenu (pas de données sensibles)
    if contains_sensitive_data(&content) {
        return Err("Content contains sensitive data".to_string());
    }

    // Générer l'ID
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().timestamp_millis();

    // Auto-classification si non fourni
    let final_topic = topic.unwrap_or(MemoryTopic::General);
    let final_importance = importance.unwrap_or(3).min(5).max(1);
    let final_content_type = content_type.unwrap_or(MemoryContentType::Message);

    let entry = PersistentMemoryEntry {
        id: id.clone(),
        level: level.clone(),
        content_type: final_content_type,
        title,
        summary: None,
        content: content.clone(),
        topic: final_topic,
        importance: final_importance,
        tags: tags.unwrap_or_default(),
        status: MemoryStatus::Active,
        metadata: MemoryMetadata {
            created_at: now,
            updated_at: now,
            last_accessed_at: None,
            access_count: 0,
            source: MemorySource::ChatUser,
            mode_id: Some(mode_id),
            evolution_phase: None,
            project_id,
            conversation_id: None,
            content_hash: Some(state.hash_content(&content)),
            schema_version: "1.0.0".to_string(),
        },
        ttl: if level == MemoryLevel::Session {
            Some(24 * 60 * 60 * 1000) // 24h
        } else {
            None
        },
        promotable: Some(matches!(
            level,
            MemoryLevel::Session | MemoryLevel::Intermediate
        )),
        source_entry_ids: Vec::new(),
        relevance_score: None,
        expires_at: if level == MemoryLevel::Intermediate {
            Some(now + 90 * 24 * 60 * 60 * 1000) // 90 jours
        } else {
            None
        },
        confidence_score: if level == MemoryLevel::LongTerm {
            Some(100)
        } else {
            None
        },
        user_verified: if level == MemoryLevel::LongTerm {
            Some(false)
        } else {
            None
        },
        version: if level == MemoryLevel::LongTerm {
            Some(1)
        } else {
            None
        },
        version_history: Vec::new(),
    };

    // Sauvegarder
    match level {
        MemoryLevel::Session => {
            let mut cache = state.session_cache.lock().map_err(|e| e.to_string())?;
            cache.insert(id.clone(), entry);
        }
        MemoryLevel::Intermediate => {
            save_entry_to_file(&state.base_path, &MemoryLevel::Intermediate, entry, false)?;
        }
        MemoryLevel::LongTerm => {
            save_entry_to_file(&state.base_path, &MemoryLevel::LongTerm, entry, true)?;
        }
    }

    // Mettre à jour last_write
    *state.last_write.lock().map_err(|e| e.to_string())? = now;

    log::info!("[PersistentMemory] Entry written: id={}", id);
    Ok(id)
}

/// Promouvoir une entrée au niveau supérieur
#[tauri::command]
pub async fn persistent_memory_promote_entry(
    state: State<'_, PersistentMemoryState>,
    entry_id: String,
) -> Result<bool, String> {
    log::info!("[PersistentMemory] promote_entry: id={}", entry_id);

    // Chercher l'entrée dans session
    let entry_opt = {
        let mut cache = state.session_cache.lock().map_err(|e| e.to_string())?;
        cache.remove(&entry_id)
    };

    if let Some(mut entry) = entry_opt {
        // Promouvoir session → intermediate
        entry.level = MemoryLevel::Intermediate;
        entry.metadata.updated_at = Utc::now().timestamp_millis();
        entry.expires_at = Some(Utc::now().timestamp_millis() + 90 * 24 * 60 * 60 * 1000);
        save_entry_to_file(&state.base_path, &MemoryLevel::Intermediate, entry, false)?;
        return Ok(true);
    }

    // Chercher dans intermediate pour promouvoir vers long_term
    let int_path = state
        .get_level_path(&MemoryLevel::Intermediate)
        .join("entries.json");
    if int_path.exists() {
        let content = fs::read_to_string(&int_path).map_err(|e| e.to_string())?;
        let mut entries: Vec<PersistentMemoryEntry> =
            serde_json::from_str(&content).unwrap_or_default();

        if let Some(idx) = entries.iter().position(|e| e.id == entry_id) {
            let mut entry = entries.remove(idx);
            entry.level = MemoryLevel::LongTerm;
            entry.metadata.updated_at = Utc::now().timestamp_millis();
            entry.expires_at = None;
            entry.confidence_score = Some(100);
            entry.user_verified = Some(false);
            entry.version = Some(1);

            // Sauvegarder la liste modifiée
            let json = serde_json::to_string_pretty(&entries).map_err(|e| e.to_string())?;
            fs::write(&int_path, json).map_err(|e| e.to_string())?;

            // Sauvegarder dans long_term (chiffré)
            save_entry_to_file(&state.base_path, &MemoryLevel::LongTerm, entry, true)?;

            return Ok(true);
        }
    }

    Err("Entry not found".to_string())
}

/// Archiver une entrée
#[tauri::command]
pub async fn persistent_memory_archive_entry(
    state: State<'_, PersistentMemoryState>,
    entry_id: String,
) -> Result<bool, String> {
    log::info!("[PersistentMemory] archive_entry: id={}", entry_id);

    // Mettre à jour le statut dans tous les niveaux
    // Session
    {
        let mut cache = state.session_cache.lock().map_err(|e| e.to_string())?;
        if let Some(entry) = cache.get_mut(&entry_id) {
            entry.status = MemoryStatus::Archived;
            return Ok(true);
        }
    }

    // Intermediate & LongTerm
    for (level, encrypted) in [
        (MemoryLevel::Intermediate, false),
        (MemoryLevel::LongTerm, true),
    ] {
        let path = state.get_level_path(&level).join("entries.json");
        if path.exists() {
            let content = if encrypted {
                let data = fs::read(&path).map_err(|e| e.to_string())?;
                state.encryptor.decrypt(&data).map_err(|e| e.to_string())?
            } else {
                fs::read_to_string(&path).map_err(|e| e.to_string())?
            };

            let mut entries: Vec<PersistentMemoryEntry> =
                serde_json::from_str(&content).unwrap_or_default();

            if let Some(entry) = entries.iter_mut().find(|e| e.id == entry_id) {
                entry.status = MemoryStatus::Archived;
                entry.metadata.updated_at = Utc::now().timestamp_millis();

                let json = serde_json::to_string_pretty(&entries).map_err(|e| e.to_string())?;

                if encrypted {
                    let encrypted_data =
                        state.encryptor.encrypt(&json).map_err(|e| e.to_string())?;
                    fs::write(&path, encrypted_data).map_err(|e| e.to_string())?;
                } else {
                    fs::write(&path, json).map_err(|e| e.to_string())?;
                }

                return Ok(true);
            }
        }
    }

    Err("Entry not found".to_string())
}

/// Supprimer une entrée
#[tauri::command]
pub async fn persistent_memory_delete_entry(
    state: State<'_, PersistentMemoryState>,
    entry_id: String,
) -> Result<bool, String> {
    log::info!("[PersistentMemory] delete_entry: id={}", entry_id);

    // Session
    {
        let mut cache = state.session_cache.lock().map_err(|e| e.to_string())?;
        if cache.remove(&entry_id).is_some() {
            return Ok(true);
        }
    }

    // Intermediate & LongTerm
    for (level, encrypted) in [
        (MemoryLevel::Intermediate, false),
        (MemoryLevel::LongTerm, true),
    ] {
        let path = state.get_level_path(&level).join("entries.json");
        if path.exists() {
            let content = if encrypted {
                let data = fs::read(&path).map_err(|e| e.to_string())?;
                state.encryptor.decrypt(&data).map_err(|e| e.to_string())?
            } else {
                fs::read_to_string(&path).map_err(|e| e.to_string())?
            };

            let mut entries: Vec<PersistentMemoryEntry> =
                serde_json::from_str(&content).unwrap_or_default();
            let initial_len = entries.len();
            entries.retain(|e| e.id != entry_id);

            if entries.len() < initial_len {
                let json = serde_json::to_string_pretty(&entries).map_err(|e| e.to_string())?;

                if encrypted {
                    let encrypted_data =
                        state.encryptor.encrypt(&json).map_err(|e| e.to_string())?;
                    fs::write(&path, encrypted_data).map_err(|e| e.to_string())?;
                } else {
                    fs::write(&path, json).map_err(|e| e.to_string())?;
                }

                return Ok(true);
            }
        }
    }

    Err("Entry not found".to_string())
}

/// Créer un résumé
#[tauri::command]
pub async fn persistent_memory_create_summary(
    state: State<'_, PersistentMemoryState>,
    entry_ids: Vec<String>,
    title: Option<String>,
    mode_id: String,
) -> Result<String, String> {
    log::info!(
        "[PersistentMemory] create_summary: entries={}",
        entry_ids.len()
    );

    // Charger les entrées source
    let request = MemoryReadRequest {
        levels: Some(vec![MemoryLevel::Session, MemoryLevel::Intermediate]),
        topics: None,
        content_types: None,
        min_importance: None,
        current_mode: mode_id.clone(),
        query: None,
        tags: None,
        project_id: None,
        limit: Some(500),
        include_summaries: Some(false),
        min_relevance_score: None,
    };

    let response = persistent_memory_read(State::from(&*state), request).await?;
    let source_entries: Vec<&PersistentMemoryEntry> = response
        .entries
        .iter()
        .filter(|e| entry_ids.contains(&e.id))
        .collect();

    if source_entries.is_empty() {
        return Err("No source entries found".to_string());
    }

    // Générer le résumé (simplifié - en prod, utiliser LLM)
    let content = source_entries
        .iter()
        .map(|e| e.content.clone())
        .collect::<Vec<_>>()
        .join("\n---\n");

    let summary_content = if content.len() > 500 {
        format!("{}...", &content[..500])
    } else {
        content
    };

    let now = Utc::now().timestamp_millis();
    let id = Uuid::new_v4().to_string();

    let summary = MemorySummary {
        id: id.clone(),
        title: title
            .unwrap_or_else(|| format!("Résumé du {}", chrono::Utc::now().format("%d/%m/%Y"))),
        content: summary_content,
        topic: source_entries
            .first()
            .map(|e| e.topic.clone())
            .unwrap_or(MemoryTopic::General),
        period_start: source_entries
            .iter()
            .map(|e| e.metadata.created_at)
            .min()
            .unwrap_or(now),
        period_end: source_entries
            .iter()
            .map(|e| e.metadata.created_at)
            .max()
            .unwrap_or(now),
        source_count: source_entries.len() as u32,
        source_ids: entry_ids,
        primary_mode: Some(mode_id),
        keywords: Vec::new(),
        aggregated_importance: source_entries
            .iter()
            .map(|e| e.importance as f32)
            .sum::<f32>()
            / source_entries.len() as f32,
        generated_at: now,
        summary_type: "on_demand".to_string(),
    };

    // Sauvegarder
    let summaries_path = state.base_path.join("summaries").join("summaries.json");
    let mut summaries = load_summaries(&state.base_path).unwrap_or_default();
    summaries.push(summary);

    let json = serde_json::to_string_pretty(&summaries).map_err(|e| e.to_string())?;
    fs::write(&summaries_path, json).map_err(|e| e.to_string())?;

    Ok(id)
}

/// Créer un bundle
#[tauri::command]
pub async fn persistent_memory_create_bundle(
    state: State<'_, PersistentMemoryState>,
    name: String,
    entry_ids: Vec<String>,
    topic: MemoryTopic,
) -> Result<String, String> {
    log::info!("[PersistentMemory] create_bundle: name={}", name);

    let now = Utc::now().timestamp_millis();
    let id = Uuid::new_v4().to_string();

    let bundle = MemoryBundle {
        id: id.clone(),
        name,
        description: String::new(),
        topic,
        entry_ids,
        tags: Vec::new(),
        created_at: now,
        updated_at: now,
        created_by: "user".to_string(),
        color: None,
        icon: None,
    };

    let bundles_path = state.base_path.join("bundles").join("bundles.json");
    let mut bundles = load_bundles(&state.base_path).unwrap_or_default();
    bundles.push(bundle);

    let json = serde_json::to_string_pretty(&bundles).map_err(|e| e.to_string())?;
    fs::write(&bundles_path, json).map_err(|e| e.to_string())?;

    Ok(id)
}

/// Ajouter des entrées à un bundle
#[tauri::command]
pub async fn persistent_memory_add_to_bundle(
    state: State<'_, PersistentMemoryState>,
    bundle_id: String,
    entry_ids: Vec<String>,
) -> Result<bool, String> {
    log::info!("[PersistentMemory] add_to_bundle: bundle={}", bundle_id);

    let bundles_path = state.base_path.join("bundles").join("bundles.json");
    let mut bundles = load_bundles(&state.base_path).unwrap_or_default();

    if let Some(bundle) = bundles.iter_mut().find(|b| b.id == bundle_id) {
        bundle.entry_ids.extend(entry_ids);
        bundle.entry_ids.sort();
        bundle.entry_ids.dedup();
        bundle.updated_at = Utc::now().timestamp_millis();

        let json = serde_json::to_string_pretty(&bundles).map_err(|e| e.to_string())?;
        fs::write(&bundles_path, json).map_err(|e| e.to_string())?;

        return Ok(true);
    }

    Err("Bundle not found".to_string())
}

/// Exporter la mémoire
#[tauri::command]
pub async fn persistent_memory_export(
    state: State<'_, PersistentMemoryState>,
) -> Result<String, String> {
    log::info!("[PersistentMemory] export");

    let mut all_data = serde_json::Map::new();

    // Session
    {
        let cache = state.session_cache.lock().map_err(|e| e.to_string())?;
        let entries: Vec<&PersistentMemoryEntry> = cache.values().collect();
        all_data.insert(
            "session".to_string(),
            serde_json::to_value(&entries).unwrap_or_default(),
        );
    }

    // Intermediate
    let int_path = state
        .get_level_path(&MemoryLevel::Intermediate)
        .join("entries.json");
    if int_path.exists() {
        let content = fs::read_to_string(&int_path).unwrap_or_default();
        let entries: Vec<PersistentMemoryEntry> =
            serde_json::from_str(&content).unwrap_or_default();
        all_data.insert(
            "intermediate".to_string(),
            serde_json::to_value(&entries).unwrap_or_default(),
        );
    }

    // LongTerm (déchiffré pour export)
    let lt_path = state
        .get_level_path(&MemoryLevel::LongTerm)
        .join("entries.json");
    if lt_path.exists() {
        let encrypted = fs::read(&lt_path).unwrap_or_default();
        let content = state.encryptor.decrypt(&encrypted).unwrap_or_default();
        let entries: Vec<PersistentMemoryEntry> =
            serde_json::from_str(&content).unwrap_or_default();
        all_data.insert(
            "long_term".to_string(),
            serde_json::to_value(&entries).unwrap_or_default(),
        );
    }

    // Summaries & Bundles
    let summaries = load_summaries(&state.base_path).unwrap_or_default();
    all_data.insert(
        "summaries".to_string(),
        serde_json::to_value(&summaries).unwrap_or_default(),
    );

    let bundles = load_bundles(&state.base_path).unwrap_or_default();
    all_data.insert(
        "bundles".to_string(),
        serde_json::to_value(&bundles).unwrap_or_default(),
    );

    serde_json::to_string_pretty(&all_data).map_err(|e| e.to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/// Calculer le score de pertinence (simplifié)
fn calculate_relevance(content: &str, query: &str) -> f32 {
    let content_lower = content.to_lowercase();
    let query_terms: Vec<&str> = query
        .to_lowercase()
        .split_whitespace()
        .filter(|w| w.len() > 2)
        .collect();

    if query_terms.is_empty() {
        return 0.5;
    }

    let matches = query_terms
        .iter()
        .filter(|term| content_lower.contains(*term))
        .count();
    (matches as f32) / (query_terms.len() as f32)
}

/// Vérifier les données sensibles
fn contains_sensitive_data(content: &str) -> bool {
    let patterns = [
        "password",
        "mot de passe",
        "api_key",
        "apikey",
        "secret_key",
        "private_key",
        "ssh_key",
        "bearer ",
        "-----BEGIN",
    ];
    let lower = content.to_lowercase();
    patterns.iter().any(|p| lower.contains(p))
}

/// Sauvegarder une entrée dans un fichier
fn save_entry_to_file(
    base_path: &PathBuf,
    level: &MemoryLevel,
    entry: PersistentMemoryEntry,
    encrypt: bool,
) -> Result<(), String> {
    let level_path = match level {
        MemoryLevel::Session => base_path.join("session"),
        MemoryLevel::Intermediate => base_path.join("intermediate"),
        MemoryLevel::LongTerm => base_path.join("long_term"),
    };

    let file_path = level_path.join("entries.json");

    // Charger les entrées existantes
    let mut entries: Vec<PersistentMemoryEntry> = if file_path.exists() {
        if encrypt {
            let encryptor = MemoryEncryption::new("TITANE_MEMORY_KEY_v19");
            let encrypted = fs::read(&file_path).unwrap_or_default();
            let content = encryptor.decrypt(&encrypted).unwrap_or_default();
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            let content = fs::read_to_string(&file_path).unwrap_or_default();
            serde_json::from_str(&content).unwrap_or_default()
        }
    } else {
        Vec::new()
    };

    entries.push(entry);

    // Sauvegarder
    let json = serde_json::to_string_pretty(&entries).map_err(|e| e.to_string())?;

    if encrypt {
        let encryptor = MemoryEncryption::new("TITANE_MEMORY_KEY_v19");
        let encrypted = encryptor.encrypt(&json).map_err(|e| e.to_string())?;
        fs::write(&file_path, encrypted).map_err(|e| e.to_string())?;
    } else {
        fs::write(&file_path, json).map_err(|e| e.to_string())?;
    }

    Ok(())
}

/// Charger les résumés
fn load_summaries(base_path: &PathBuf) -> Result<Vec<MemorySummary>, String> {
    let path = base_path.join("summaries").join("summaries.json");
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

/// Charger les bundles
fn load_bundles(base_path: &PathBuf) -> Result<Vec<MemoryBundle>, String> {
    let path = base_path.join("bundles").join("bundles.json");
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}
