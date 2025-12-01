//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE — RECOVERY ENGINE
//! Récupération automatique après crash/corruption
//! ═══════════════════════════════════════════════════════════════════════════════

use super::event_log::EventLog;
use super::snapshot::SnapshotManager;
use super::types::PersistenceError;

/// Moteur de récupération
pub struct RecoveryEngine {
    /// Nombre de récupérations effectuées
    recoveries_count: u32,
    /// Dernière récupération
    last_recovery: Option<u64>,
    /// Erreurs de récupération
    recovery_errors: Vec<String>,
}

impl RecoveryEngine {
    pub fn new() -> Self {
        Self {
            recoveries_count: 0,
            last_recovery: None,
            recovery_errors: Vec::new(),
        }
    }

    /// Effectuer la récupération au démarrage
    pub async fn recover(
        &mut self,
        event_log: &mut EventLog,
        _snapshot_manager: &mut SnapshotManager,
    ) -> Result<RecoveryReport, PersistenceError> {
        log::info!("[RecoveryEngine] 🔄 Démarrage de la récupération...");

        let start = std::time::Instant::now();
        let mut report = RecoveryReport::default();

        // 1. Vérifier l'état des fichiers de persistence
        let db_path = Self::get_persistence_path();
        let events_path = db_path.with_extension("events.json");
        let snapshots_path = db_path.with_extension("snapshots.json");

        // 2. Récupérer les événements
        if events_path.exists() {
            match tokio::fs::read_to_string(&events_path).await {
                Ok(content) => {
                    match serde_json::from_str::<Vec<super::types::TitanEvent>>(&content) {
                        Ok(events) => {
                            report.events_recovered = events.len() as u64;
                            event_log.load_events(events);
                            log::info!("[RecoveryEngine] ✅ {} événements récupérés", report.events_recovered);
                        }
                        Err(e) => {
                            log::warn!("[RecoveryEngine] ⚠️ Erreur parsing events: {}", e);
                            report.errors.push(format!("Parsing events: {}", e));
                            // Tenter de sauvegarder le fichier corrompu
                            Self::backup_corrupted_file(&events_path).await;
                        }
                    }
                }
                Err(e) => {
                    log::warn!("[RecoveryEngine] ⚠️ Erreur lecture events: {}", e);
                    report.errors.push(format!("Lecture events: {}", e));
                }
            }
        } else {
            log::info!("[RecoveryEngine] 📝 Aucun fichier d'événements - premier lancement");
            report.is_first_boot = true;
        }

        // 3. Récupérer les snapshots
        if snapshots_path.exists() {
            match tokio::fs::read_to_string(&snapshots_path).await {
                Ok(content) => {
                    match serde_json::from_str::<Vec<SnapshotMeta>>(&content) {
                        Ok(snapshots) => {
                            report.snapshots_found = snapshots.len() as u64;
                            log::info!("[RecoveryEngine] ✅ {} snapshots trouvés", report.snapshots_found);
                        }
                        Err(e) => {
                            log::warn!("[RecoveryEngine] ⚠️ Erreur parsing snapshots: {}", e);
                            report.errors.push(format!("Parsing snapshots: {}", e));
                            Self::backup_corrupted_file(&snapshots_path).await;
                        }
                    }
                }
                Err(e) => {
                    log::warn!("[RecoveryEngine] ⚠️ Erreur lecture snapshots: {}", e);
                    report.errors.push(format!("Lecture snapshots: {}", e));
                }
            }
        }

        // 4. Mettre à jour les statistiques
        report.duration_ms = start.elapsed().as_millis() as u64;
        report.success = report.errors.is_empty();

        self.recoveries_count += 1;
        self.last_recovery = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.recovery_errors = report.errors.clone();

        if report.success {
            log::info!("[RecoveryEngine] ✅ Récupération terminée en {}ms", report.duration_ms);
        } else {
            log::warn!("[RecoveryEngine] ⚠️ Récupération avec erreurs: {:?}", report.errors);
        }

        Ok(report)
    }

    /// Obtenir le chemin de persistence
    fn get_persistence_path() -> std::path::PathBuf {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
        path.push("TITANE_INFINITY");
        path.push("persistence");
        path.push("titan_events.db");
        path
    }

    /// Sauvegarder un fichier corrompu
    async fn backup_corrupted_file(path: &std::path::Path) {
        let backup_path = path.with_extension(format!(
            "{}.corrupted.{}",
            path.extension().unwrap_or_default().to_str().unwrap_or(""),
            chrono::Utc::now().timestamp()
        ));

        if let Err(e) = tokio::fs::copy(path, &backup_path).await {
            log::error!("[RecoveryEngine] ❌ Échec backup fichier corrompu: {}", e);
        } else {
            log::info!("[RecoveryEngine] 📦 Fichier corrompu sauvegardé: {:?}", backup_path);
        }
    }

    /// Obtenir le nombre de récupérations
    pub fn recoveries_count(&self) -> u32 {
        self.recoveries_count
    }

    /// Obtenir les erreurs de la dernière récupération
    pub fn last_errors(&self) -> &[String] {
        &self.recovery_errors
    }
}

impl Default for RecoveryEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Métadonnées de snapshot pour désérialisation
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct SnapshotMeta {
    id: String,
    schema_version: u32,
    timestamp: u64,
    #[serde(default)]
    state_blob_base64: String,
    checksum: String,
}

/// Rapport de récupération
#[derive(Debug, Clone, Default)]
pub struct RecoveryReport {
    pub success: bool,
    pub is_first_boot: bool,
    pub events_recovered: u64,
    pub snapshots_found: u64,
    pub duration_ms: u64,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_recovery_engine_new() {
        let engine = RecoveryEngine::new();
        assert_eq!(engine.recoveries_count(), 0);
        assert!(engine.last_errors().is_empty());
    }
}
