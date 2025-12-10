// ═══════════════════════════════════════════════════════════════════
// TITANE∞ v∞ — AGENDA STORAGE
// Stockage persistant des événements (fichier JSON local)
// ═══════════════════════════════════════════════════════════════════

use super::types::{AgendaEvent, AgendaStorage};
use chrono::Datelike;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::RwLock;

/// Nom du fichier de stockage
const STORAGE_FILENAME: &str = "agenda_events.json";

/// Gestionnaire de stockage pour l'agenda
pub struct AgendaStorageManager {
    /// Chemin vers le fichier de stockage
    storage_path: PathBuf,
    /// Cache en mémoire des événements
    cache: Arc<RwLock<AgendaStorage>>,
}

impl AgendaStorageManager {
    /// Crée un nouveau gestionnaire de stockage
    pub fn new(app_data_dir: PathBuf) -> Self {
        let storage_path = app_data_dir.join(STORAGE_FILENAME);
        Self {
            storage_path,
            cache: Arc::new(RwLock::new(AgendaStorage::default())),
        }
    }

    /// Initialise le stockage (charge les données existantes)
    pub async fn init(&self) -> Result<(), String> {
        log::info!("[AgendaStorage] 📁 Initialisation du stockage...");

        // Créer le répertoire parent si nécessaire
        if let Some(parent) = self.storage_path.parent() {
            fs::create_dir_all(parent)
                .await
                .map_err(|e| format!("Erreur création répertoire: {}", e))?;
        }

        // Charger les données existantes ou créer un nouveau fichier
        if self.storage_path.exists() {
            self.load().await?;
            let cache = self.cache.read().await;
            log::info!(
                "[AgendaStorage] ✅ {} événements chargés",
                cache.events.len()
            );
        } else {
            self.save().await?;
            log::info!("[AgendaStorage] ✅ Nouveau fichier créé");
        }

        Ok(())
    }

    /// Charge les événements depuis le fichier
    pub async fn load(&self) -> Result<(), String> {
        let content = fs::read_to_string(&self.storage_path)
            .await
            .map_err(|e| format!("Erreur lecture fichier: {}", e))?;

        let storage: AgendaStorage =
            serde_json::from_str(&content).map_err(|e| format!("Erreur parsing JSON: {}", e))?;

        let mut cache = self.cache.write().await;
        *cache = storage;

        Ok(())
    }

    /// Sauvegarde les événements dans le fichier
    pub async fn save(&self) -> Result<(), String> {
        let cache = self.cache.read().await;
        let content = serde_json::to_string_pretty(&*cache)
            .map_err(|e| format!("Erreur sérialisation JSON: {}", e))?;

        fs::write(&self.storage_path, content)
            .await
            .map_err(|e| format!("Erreur écriture fichier: {}", e))?;

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    // CRUD OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /// Obtient tous les événements
    pub async fn get_all_events(&self) -> Vec<AgendaEvent> {
        let cache = self.cache.read().await;
        cache.events.clone()
    }

    /// Obtient un événement par ID
    pub async fn get_event(&self, event_id: &str) -> Option<AgendaEvent> {
        let cache = self.cache.read().await;
        cache.events.iter().find(|e| e.id == event_id).cloned()
    }

    /// Ajoute un nouvel événement
    pub async fn add_event(&self, event: AgendaEvent) -> Result<AgendaEvent, String> {
        let mut cache = self.cache.write().await;

        // Vérifier que l'ID n'existe pas déjà
        if cache.events.iter().any(|e| e.id == event.id) {
            return Err(format!("Événement avec ID {} existe déjà", event.id));
        }

        cache.events.push(event.clone());
        cache.last_update = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        drop(cache);
        self.save().await?;

        log::info!("[AgendaStorage] ➕ Événement ajouté: {}", event.title);
        Ok(event)
    }

    /// Met à jour un événement existant
    pub async fn update_event(
        &self,
        event_id: &str,
        mut updater: impl FnMut(&mut AgendaEvent),
    ) -> Result<AgendaEvent, String> {
        let mut cache = self.cache.write().await;

        let event = cache
            .events
            .iter_mut()
            .find(|e| e.id == event_id)
            .ok_or_else(|| format!("Événement {} non trouvé", event_id))?;

        updater(event);
        event.touch();

        let updated = event.clone();

        cache.last_update = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        drop(cache);
        self.save().await?;

        log::info!("[AgendaStorage] ✏️ Événement modifié: {}", updated.title);
        Ok(updated)
    }

    /// Supprime un événement
    pub async fn delete_event(&self, event_id: &str) -> Result<bool, String> {
        let mut cache = self.cache.write().await;

        let initial_len = cache.events.len();
        cache.events.retain(|e| e.id != event_id);

        if cache.events.len() == initial_len {
            return Ok(false); // Événement non trouvé
        }

        cache.last_update = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        drop(cache);
        self.save().await?;

        log::info!("[AgendaStorage] 🗑️ Événement supprimé: {}", event_id);
        Ok(true)
    }

    /// Obtient les événements dans une plage de dates
    pub async fn get_events_in_range(&self, start: &str, end: &str) -> Vec<AgendaEvent> {
        let cache = self.cache.read().await;
        cache
            .events
            .iter()
            .filter(|e| {
                // Comparaison simple de chaînes ISO (fonctionne car format ISO est triable)
                e.start_date_time.as_str() <= end && e.end_date_time.as_str() >= start
            })
            .cloned()
            .collect()
    }

    /// Obtient les statistiques
    pub async fn get_stats(&self) -> AgendaStats {
        let cache = self.cache.read().await;
        let now = chrono::Utc::now();
        let today_start = now.format("%Y-%m-%dT00:00:00").to_string();
        let today_end = now.format("%Y-%m-%dT23:59:59").to_string();

        let week_start = (now
            - chrono::Duration::days(now.weekday().num_days_from_monday() as i64))
        .format("%Y-%m-%dT00:00:00")
        .to_string();
        let week_end = now.format("%Y-%m-%dT23:59:59").to_string();

        let events_today = cache
            .events
            .iter()
            .filter(|e| e.start_date_time >= today_start && e.start_date_time <= today_end)
            .count();

        let events_this_week = cache
            .events
            .iter()
            .filter(|e| e.start_date_time >= week_start && e.start_date_time <= week_end)
            .count();

        AgendaStats {
            total_events: cache.events.len(),
            events_today,
            events_this_week,
            last_update: cache.last_update,
        }
    }
}

/// Statistiques de l'agenda
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AgendaStats {
    pub total_events: usize,
    pub events_today: usize,
    pub events_this_week: usize,
    pub last_update: u64,
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════

use once_cell::sync::OnceCell;

/// Instance globale du gestionnaire de stockage
static STORAGE_MANAGER: OnceCell<AgendaStorageManager> = OnceCell::new();

/// Initialise le gestionnaire de stockage global
pub async fn init_agenda_storage(app_data_dir: PathBuf) -> Result<(), String> {
    let manager = AgendaStorageManager::new(app_data_dir);
    manager.init().await?;

    STORAGE_MANAGER
        .set(manager)
        .map_err(|_| "Storage déjà initialisé".to_string())?;

    Ok(())
}

/// Obtient une référence au gestionnaire de stockage
pub fn get_storage() -> Result<&'static AgendaStorageManager, String> {
    STORAGE_MANAGER
        .get()
        .ok_or_else(|| "Storage non initialisé".to_string())
}
