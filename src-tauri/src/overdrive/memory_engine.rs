// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE MEMORY ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Moteur de mémoire conversationnelle avec embeddings + vector store
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    pub embedding: Vec<f32>,
    pub metadata: MemoryMetadata,
    pub timestamp: u64,
    pub importance: f32,      // 0.0-1.0
    pub access_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetadata {
    pub entry_type: String,   // conversation|fact|skill|experience
    pub tags: Vec<String>,
    pub related_ids: Vec<String>,
    pub source: String,       // chat|voice|project|system
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryQuery {
    pub query: String,
    pub limit: usize,
    pub min_similarity: f32,
    pub filters: Option<Vec<String>>, // tags ou types
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryResult {
    pub entry: MemoryEntry,
    pub similarity: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub total_entries: usize,
    pub total_tokens: u64,
    pub vector_dimensions: usize,
    pub index_size_mb: f32,
    pub conversations_stored: usize,
    pub facts_stored: usize,
}

pub struct MemoryEngineState {
    entries: Arc<Mutex<Vec<MemoryEntry>>>,
    index_built: Arc<Mutex<bool>>,
    embedding_model: Arc<Mutex<String>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> MemoryEngineState {
    MemoryEngineState {
        entries: Arc::new(Mutex::new(Vec::new())),
        index_built: Arc::new(Mutex::new(false)),
        embedding_model: Arc::new(Mutex::new("nomic-embed-text".to_string())),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCKAGE MÉMOIRE
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn memory_store(
    content: String,
    metadata: MemoryMetadata,
    state: State<'_, MemoryEngineState>,
) -> Result<String, String> {
    let entry_id = uuid::Uuid::new_v4().to_string();

    println!("[MEMORY] Stockage: {} - Type: {}", content, metadata.entry_type);

    // Générer embedding
    let embedding = generate_embedding(&content, &state).await?;

    // Calculer importance
    let importance = calculate_importance(&content, &metadata);

    let entry = MemoryEntry {
        id: entry_id.clone(),
        content,
        embedding,
        metadata,
        timestamp: get_timestamp(),
        importance,
        access_count: 0,
    };

    let mut entries = state.entries.lock().unwrap();
    entries.push(entry);

    // Marquer index comme à reconstruire
    *state.index_built.lock().unwrap() = false;

    Ok(entry_id)
}

#[tauri::command]
pub async fn memory_store_conversation(
    conversation_id: String,
    messages: Vec<String>,
    state: State<'_, MemoryEngineState>,
) -> Result<usize, String> {
    let mut stored = 0;

    for message in messages {
        let metadata = MemoryMetadata {
            entry_type: "conversation".to_string(),
            tags: vec!["chat".to_string()],
            related_ids: vec![conversation_id.clone()],
            source: "chat".to_string(),
        };

        memory_store(message, metadata, state.clone()).await?;
        stored += 1;
    }

    println!("[MEMORY] {} messages stockés pour conversation {}", stored, conversation_id);
    Ok(stored)
}

// ─────────────────────────────────────────────────────────────────────────────
// RECHERCHE SÉMANTIQUE
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn memory_search(
    query: MemoryQuery,
    state: State<'_, MemoryEngineState>,
) -> Result<Vec<MemoryResult>, String> {
    println!("[MEMORY] Recherche: '{}' (limit: {})", query.query, query.limit);

    // Générer embedding de la requête
    let query_embedding = generate_embedding(&query.query, &state).await?;

    // Recherche par similarité cosine
    let entries = state.entries.lock().unwrap();
    let mut results: Vec<MemoryResult> = Vec::new();

    for entry in entries.iter() {
        // Appliquer filtres
        if let Some(filters) = &query.filters {
            if !filters.contains(&entry.metadata.entry_type) {
                continue;
            }
        }

        // Calculer similarité
        let similarity = cosine_similarity(&query_embedding, &entry.embedding);

        if similarity >= query.min_similarity {
            let mut entry_clone = entry.clone();
            entry_clone.access_count += 1;

            results.push(MemoryResult {
                entry: entry_clone,
                similarity,
            });
        }
    }

    // Trier par similarité décroissante
    results.sort_by(|a, b| b.similarity.partial_cmp(&a.similarity).unwrap());

    // Limiter résultats
    results.truncate(query.limit);

    println!("[MEMORY] {} résultats trouvés", results.len());
    Ok(results)
}

#[tauri::command]
pub fn memory_get_related(
    entry_id: String,
    limit: usize,
    state: State<MemoryEngineState>,
) -> Result<Vec<MemoryEntry>, String> {
    let entries = state.entries.lock().unwrap();

    let base_entry = entries
        .iter()
        .find(|e| e.id == entry_id)
        .ok_or("Entry introuvable")?;

    let mut related: Vec<(f32, MemoryEntry)> = Vec::new();

    for entry in entries.iter() {
        if entry.id == entry_id {
            continue;
        }

        let similarity = cosine_similarity(&base_entry.embedding, &entry.embedding);
        related.push((similarity, entry.clone()));
    }

    // Trier par similarité
    related.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());

    // Extraire entries
    let results: Vec<MemoryEntry> = related.into_iter().take(limit).map(|(_, e)| e).collect();

    Ok(results)
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION INDEX
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn memory_rebuild_index(state: State<MemoryEngineState>) -> Result<String, String> {
    println!("[MEMORY] Reconstruction index...");

    // TODO: Implémenter HNSW ou FAISS pour recherche rapide
    // Pour l'instant, recherche linéaire

    *state.index_built.lock().unwrap() = true;

    Ok("Index reconstruit".to_string())
}

#[tauri::command]
pub fn memory_get_stats(state: State<MemoryEngineState>) -> Result<MemoryStats, String> {
    let entries = state.entries.lock().unwrap();

    let total_entries = entries.len();
    let total_tokens: u64 = entries.iter().map(|e| e.content.len() as u64).sum();

    let conversations_stored = entries
        .iter()
        .filter(|e| e.metadata.entry_type == "conversation")
        .count();

    let facts_stored = entries
        .iter()
        .filter(|e| e.metadata.entry_type == "fact")
        .count();

    let vector_dimensions = if entries.is_empty() {
        0
    } else {
        entries[0].embedding.len()
    };

    let index_size_mb = (total_entries * vector_dimensions * 4) as f32 / 1024.0 / 1024.0;

    Ok(MemoryStats {
        total_entries,
        total_tokens,
        vector_dimensions,
        index_size_mb,
        conversations_stored,
        facts_stored,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// NETTOYAGE & OPTIMISATION
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn memory_prune(
    min_importance: f32,
    min_access_count: u32,
    state: State<MemoryEngineState>,
) -> Result<usize, String> {
    let mut entries = state.entries.lock().unwrap();
    let initial_count = entries.len();

    entries.retain(|e| e.importance >= min_importance || e.access_count >= min_access_count);

    let removed = initial_count - entries.len();

    println!("[MEMORY] Nettoyage: {} entrées supprimées", removed);
    Ok(removed)
}

#[tauri::command]
pub fn memory_delete(entry_id: String, state: State<MemoryEngineState>) -> Result<String, String> {
    let mut entries = state.entries.lock().unwrap();
    entries.retain(|e| e.id != entry_id);
    Ok("Entrée supprimée".to_string())
}

// DISABLED: Conflit avec commands::memory_clear
/*
#[tauri::command]
pub fn memory_clear(state: State<MemoryEngineState>) -> Result<String, String> {
    let mut entries = state.entries.lock().unwrap();
    entries.clear();
    *state.index_built.lock().unwrap() = false;
    println!("[MEMORY] Mémoire complètement vidée");
    Ok("Mémoire vidée".to_string())
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDINGS
// ─────────────────────────────────────────────────────────────────────────────

async fn generate_embedding(
    text: &str,
    state: &MemoryEngineState,
) -> Result<Vec<f32>, String> {
    let model = state.embedding_model.lock().unwrap().clone();

    // TODO: Implémenter appel Ollama embeddings
    // POST http://localhost:11434/api/embeddings
    // { model: "nomic-embed-text", prompt: "..." }

    // Simulation : vecteur de 768 dimensions (standard BERT/Nomic)
    let embedding = vec![0.1; 768];

    Ok(embedding)
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() {
        return 0.0;
    }

    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let magnitude_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let magnitude_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if magnitude_a == 0.0 || magnitude_b == 0.0 {
        return 0.0;
    }

    dot_product / (magnitude_a * magnitude_b)
}

fn calculate_importance(content: &str, metadata: &MemoryMetadata) -> f32 {
    let mut importance = 0.5; // Base

    // Type de contenu
    match metadata.entry_type.as_str() {
        "fact" => importance += 0.3,
        "skill" => importance += 0.2,
        "experience" => importance += 0.1,
        _ => {}
    }

    // Longueur du contenu (plus long = plus important)
    if content.len() > 200 {
        importance += 0.1;
    }

    // Tags spéciaux
    if metadata.tags.contains(&"important".to_string()) {
        importance += 0.2;
    }

    // Clamp à [0.0, 1.0]
    importance.min(1.0).max(0.0)
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT/IMPORT
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn memory_export(state: State<MemoryEngineState>) -> Result<Vec<MemoryEntry>, String> {
    let entries = state.entries.lock().unwrap();
    Ok(entries.clone())
}

#[tauri::command]
pub fn memory_import(
    entries: Vec<MemoryEntry>,
    state: State<MemoryEngineState>,
) -> Result<usize, String> {
    let mut current_entries = state.entries.lock().unwrap();
    let count = entries.len();
    current_entries.extend(entries);
    *state.index_built.lock().unwrap() = false;
    Ok(count)
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
