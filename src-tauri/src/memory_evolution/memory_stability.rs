// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY STABILITY ENGINE v∞
//   Anti-corruption, validation, rollback
//   Vérification intégrité structurelle
// ═══════════════════════════════════════════════════════════════

use super::{MemoryEvolutionError, MemoryItem, MemoryLevel};
use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Résultat de vérification de stabilité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StabilityCheckResult {
    pub is_stable: bool,
    pub stability_score: f32,
    pub issues: Vec<StabilityIssue>,
    pub repairs_applied: Vec<RepairAction>,
    pub backup_created: bool,
    pub backup_path: Option<String>,
    pub check_timestamp: String,
}

/// Problème de stabilité détecté
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StabilityIssue {
    pub id: String,
    pub issue_type: StabilityIssueType,
    pub severity: IssueSeverity,
    pub description: String,
    pub affected_items: Vec<String>,
    pub auto_fixable: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StabilityIssueType {
    /// JSON invalide
    InvalidJson,
    /// Référence orpheline
    OrphanReference,
    /// Duplication d'ID
    DuplicateId,
    /// Incohérence de niveau
    LevelInconsistency,
    /// Données corrompues
    DataCorruption,
    /// Structure invalide
    InvalidStructure,
    /// Référence circulaire
    CircularReference,
    /// Cluster incohérent
    ClusterInconsistency,
    /// Timestamp invalide
    InvalidTimestamp,
    /// Métadonnées manquantes
    MissingMetadata,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IssueSeverity {
    Critical,
    High,
    Medium,
    Low,
}

/// Action de réparation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepairAction {
    pub id: String,
    pub action_type: RepairActionType,
    pub target_items: Vec<String>,
    pub description: String,
    pub success: bool,
    pub timestamp: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RepairActionType {
    RemoveCorrupted,
    FixReference,
    DeduplicateId,
    CorrectLevel,
    RecalculateStructure,
    RestoreFromBackup,
    FixTimestamp,
    AddMissingMetadata,
}

/// Memory Stability Engine
pub struct MemoryStabilityEngine {
    config: StabilityConfig,
    backup_path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StabilityConfig {
    /// Activer auto-repair
    pub auto_repair: bool,
    /// Créer backup avant réparation
    pub backup_before_repair: bool,
    /// Nombre max de backups à conserver
    pub max_backups: usize,
    /// Seuil de stabilité minimum (0-1)
    pub min_stability_threshold: f32,
    /// Vérifier les références
    pub check_references: bool,
    /// Vérifier les timestamps
    pub check_timestamps: bool,
}

impl Default for StabilityConfig {
    fn default() -> Self {
        Self {
            auto_repair: true,
            backup_before_repair: true,
            max_backups: 5,
            min_stability_threshold: 0.8,
            check_references: true,
            check_timestamps: true,
        }
    }
}

impl MemoryStabilityEngine {
    pub fn new(config: StabilityConfig, backup_path: PathBuf) -> Self {
        Self {
            config,
            backup_path,
        }
    }

    /// Vérifie la stabilité de la mémoire
    pub fn check_stability(
        &self,
        items: &[MemoryItem],
    ) -> Result<StabilityCheckResult, MemoryEvolutionError> {
        info!(
            "[MemoryStability] Checking stability of {} items",
            items.len()
        );

        let mut issues = Vec::new();

        // Vérifications
        issues.extend(self.check_duplicate_ids(items)?);
        issues.extend(self.check_level_consistency(items)?);
        issues.extend(self.check_timestamps(items)?);
        issues.extend(self.check_cluster_consistency(items)?);
        issues.extend(self.check_data_integrity(items)?);

        // Calculer le score de stabilité
        let stability_score = self.calculate_stability_score(&issues, items.len());
        let is_stable = stability_score >= self.config.min_stability_threshold
            && !issues.iter().any(|i| i.severity == IssueSeverity::Critical);

        info!(
            "[MemoryStability] Check complete: score={:.2}, issues={}, stable={}",
            stability_score,
            issues.len(),
            is_stable
        );

        Ok(StabilityCheckResult {
            is_stable,
            stability_score,
            issues,
            repairs_applied: vec![],
            backup_created: false,
            backup_path: None,
            check_timestamp: chrono::Utc::now().to_rfc3339(),
        })
    }

    /// Vérifie et répare la mémoire
    pub fn check_and_repair(
        &self,
        items: &mut Vec<MemoryItem>,
    ) -> Result<StabilityCheckResult, MemoryEvolutionError> {
        let mut result = self.check_stability(items)?;

        if !result.is_stable && self.config.auto_repair {
            // Créer un backup si configuré
            if self.config.backup_before_repair {
                match self.create_backup(items) {
                    Ok(path) => {
                        result.backup_created = true;
                        result.backup_path = Some(path.to_string_lossy().to_string());
                    }
                    Err(e) => {
                        warn!("[MemoryStability] Failed to create backup: {}", e);
                    }
                }
            }

            // Appliquer les réparations
            result.repairs_applied = self.apply_repairs(items, &result.issues)?;

            // Revérifier
            let recheck = self.check_stability(items)?;
            result.stability_score = recheck.stability_score;
            result.is_stable = recheck.is_stable;
            result.issues = recheck.issues;
        }

        Ok(result)
    }

    /// Vérifie les IDs dupliqués
    fn check_duplicate_ids(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<StabilityIssue>, MemoryEvolutionError> {
        let mut issues = Vec::new();
        let mut seen: HashMap<String, Vec<usize>> = HashMap::new();

        for (idx, item) in items.iter().enumerate() {
            seen.entry(item.id.clone()).or_default().push(idx);
        }

        for (id, indices) in seen {
            if indices.len() > 1 {
                issues.push(StabilityIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    issue_type: StabilityIssueType::DuplicateId,
                    severity: IssueSeverity::High,
                    description: format!("ID '{}' dupliqué {} fois", id, indices.len()),
                    affected_items: vec![id],
                    auto_fixable: true,
                });
            }
        }

        Ok(issues)
    }

    /// Vérifie la cohérence des niveaux
    fn check_level_consistency(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<StabilityIssue>, MemoryEvolutionError> {
        let mut issues = Vec::new();

        for item in items {
            // LT doit avoir un résumé
            if (item.level == MemoryLevel::LT || item.level == MemoryLevel::ELT)
                && item.summary.is_none()
            {
                issues.push(StabilityIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    issue_type: StabilityIssueType::LevelInconsistency,
                    severity: IssueSeverity::Medium,
                    description: format!("Item LT/ELT sans résumé: {}", item.id),
                    affected_items: vec![item.id.clone()],
                    auto_fixable: false,
                });
            }

            // Core doit avoir haute importance
            if item.level == MemoryLevel::Core && item.importance < 0.7 {
                issues.push(StabilityIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    issue_type: StabilityIssueType::LevelInconsistency,
                    severity: IssueSeverity::Low,
                    description: format!("Item Core avec faible importance: {}", item.id),
                    affected_items: vec![item.id.clone()],
                    auto_fixable: true,
                });
            }
        }

        Ok(issues)
    }

    /// Vérifie les timestamps
    fn check_timestamps(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<StabilityIssue>, MemoryEvolutionError> {
        if !self.config.check_timestamps {
            return Ok(vec![]);
        }

        let mut issues = Vec::new();
        let _now = chrono::Utc::now();

        for item in items {
            // Vérifier format
            if chrono::DateTime::parse_from_rfc3339(&item.created_at).is_err() {
                issues.push(StabilityIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    issue_type: StabilityIssueType::InvalidTimestamp,
                    severity: IssueSeverity::Medium,
                    description: format!("Timestamp invalide pour: {}", item.id),
                    affected_items: vec![item.id.clone()],
                    auto_fixable: true,
                });
            }

            // Vérifier cohérence created < updated
            if let (Ok(created), Ok(updated)) = (
                chrono::DateTime::parse_from_rfc3339(&item.created_at),
                chrono::DateTime::parse_from_rfc3339(&item.updated_at),
            ) {
                if created > updated {
                    issues.push(StabilityIssue {
                        id: uuid::Uuid::new_v4().to_string(),
                        issue_type: StabilityIssueType::InvalidTimestamp,
                        severity: IssueSeverity::Low,
                        description: format!("created_at > updated_at pour: {}", item.id),
                        affected_items: vec![item.id.clone()],
                        auto_fixable: true,
                    });
                }
            }
        }

        Ok(issues)
    }

    /// Vérifie la cohérence des clusters
    fn check_cluster_consistency(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<StabilityIssue>, MemoryEvolutionError> {
        let mut issues = Vec::new();
        let mut cluster_members: HashMap<String, Vec<String>> = HashMap::new();

        for item in items {
            if let Some(cluster_id) = &item.cluster_id {
                cluster_members
                    .entry(cluster_id.clone())
                    .or_default()
                    .push(item.id.clone());
            }
        }

        // Clusters vides ou singleton
        for (cluster_id, members) in &cluster_members {
            if members.len() == 1 {
                issues.push(StabilityIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    issue_type: StabilityIssueType::ClusterInconsistency,
                    severity: IssueSeverity::Low,
                    description: format!("Cluster singleton: {}", cluster_id),
                    affected_items: members.clone(),
                    auto_fixable: true,
                });
            }
        }

        Ok(issues)
    }

    /// Vérifie l'intégrité des données
    fn check_data_integrity(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<StabilityIssue>, MemoryEvolutionError> {
        let mut issues = Vec::new();

        for item in items {
            // Contenu vide
            if item.content.is_empty() {
                issues.push(StabilityIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    issue_type: StabilityIssueType::DataCorruption,
                    severity: IssueSeverity::High,
                    description: format!("Contenu vide pour: {}", item.id),
                    affected_items: vec![item.id.clone()],
                    auto_fixable: false,
                });
            }

            // Confiance hors limites
            if item.confidence < 0.0 || item.confidence > 1.0 {
                issues.push(StabilityIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    issue_type: StabilityIssueType::DataCorruption,
                    severity: IssueSeverity::Medium,
                    description: format!(
                        "Confiance invalide ({}) pour: {}",
                        item.confidence, item.id
                    ),
                    affected_items: vec![item.id.clone()],
                    auto_fixable: true,
                });
            }

            // Importance hors limites
            if item.importance < 0.0 || item.importance > 1.0 {
                issues.push(StabilityIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    issue_type: StabilityIssueType::DataCorruption,
                    severity: IssueSeverity::Medium,
                    description: format!(
                        "Importance invalide ({}) pour: {}",
                        item.importance, item.id
                    ),
                    affected_items: vec![item.id.clone()],
                    auto_fixable: true,
                });
            }
        }

        Ok(issues)
    }

    /// Calcule le score de stabilité
    fn calculate_stability_score(&self, issues: &[StabilityIssue], total_items: usize) -> f32 {
        if total_items == 0 {
            return 1.0;
        }

        let mut penalty = 0.0f32;

        for issue in issues {
            let severity_penalty = match issue.severity {
                IssueSeverity::Critical => 0.3,
                IssueSeverity::High => 0.15,
                IssueSeverity::Medium => 0.05,
                IssueSeverity::Low => 0.01,
            };
            penalty += severity_penalty * (issue.affected_items.len() as f32 / total_items as f32);
        }

        (1.0 - penalty).max(0.0).min(1.0)
    }

    /// Applique les réparations
    fn apply_repairs(
        &self,
        items: &mut Vec<MemoryItem>,
        issues: &[StabilityIssue],
    ) -> Result<Vec<RepairAction>, MemoryEvolutionError> {
        let mut repairs = Vec::new();

        for issue in issues {
            if !issue.auto_fixable {
                continue;
            }

            let repair = match issue.issue_type {
                StabilityIssueType::DuplicateId => {
                    self.repair_duplicate_ids(items, &issue.affected_items)?
                }
                StabilityIssueType::InvalidTimestamp => {
                    self.repair_timestamps(items, &issue.affected_items)?
                }
                StabilityIssueType::DataCorruption => {
                    self.repair_data_corruption(items, &issue.affected_items)?
                }
                StabilityIssueType::ClusterInconsistency => {
                    self.repair_cluster_inconsistency(items, &issue.affected_items)?
                }
                StabilityIssueType::LevelInconsistency => {
                    self.repair_level_inconsistency(items, &issue.affected_items)?
                }
                _ => None,
            };

            if let Some(r) = repair {
                repairs.push(r);
            }
        }

        Ok(repairs)
    }

    fn repair_duplicate_ids(
        &self,
        items: &mut Vec<MemoryItem>,
        affected: &[String],
    ) -> Result<Option<RepairAction>, MemoryEvolutionError> {
        for id in affected {
            let mut found_first = false;
            for item in items.iter_mut() {
                if item.id == *id {
                    if found_first {
                        // Générer un nouvel ID
                        item.id = uuid::Uuid::new_v4().to_string();
                    }
                    found_first = true;
                }
            }
        }

        Ok(Some(RepairAction {
            id: uuid::Uuid::new_v4().to_string(),
            action_type: RepairActionType::DeduplicateId,
            target_items: affected.to_vec(),
            description: "Régénéré IDs pour dédupliquer".to_string(),
            success: true,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }))
    }

    fn repair_timestamps(
        &self,
        items: &mut Vec<MemoryItem>,
        affected: &[String],
    ) -> Result<Option<RepairAction>, MemoryEvolutionError> {
        let now = chrono::Utc::now().to_rfc3339();

        for item in items.iter_mut() {
            if affected.contains(&item.id) {
                if chrono::DateTime::parse_from_rfc3339(&item.created_at).is_err() {
                    item.created_at = now.clone();
                }
                if chrono::DateTime::parse_from_rfc3339(&item.updated_at).is_err() {
                    item.updated_at = now.clone();
                }
                // Corriger created > updated
                if let (Ok(created), Ok(updated)) = (
                    chrono::DateTime::parse_from_rfc3339(&item.created_at),
                    chrono::DateTime::parse_from_rfc3339(&item.updated_at),
                ) {
                    if created > updated {
                        item.updated_at = item.created_at.clone();
                    }
                }
            }
        }

        Ok(Some(RepairAction {
            id: uuid::Uuid::new_v4().to_string(),
            action_type: RepairActionType::FixTimestamp,
            target_items: affected.to_vec(),
            description: "Corrigé timestamps invalides".to_string(),
            success: true,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }))
    }

    fn repair_data_corruption(
        &self,
        items: &mut Vec<MemoryItem>,
        affected: &[String],
    ) -> Result<Option<RepairAction>, MemoryEvolutionError> {
        for item in items.iter_mut() {
            if affected.contains(&item.id) {
                // Clamp confiance et importance
                item.confidence = item.confidence.max(0.0).min(1.0);
                item.importance = item.importance.max(0.0).min(1.0);
            }
        }

        Ok(Some(RepairAction {
            id: uuid::Uuid::new_v4().to_string(),
            action_type: RepairActionType::CorrectLevel,
            target_items: affected.to_vec(),
            description: "Corrigé valeurs hors limites".to_string(),
            success: true,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }))
    }

    fn repair_cluster_inconsistency(
        &self,
        items: &mut Vec<MemoryItem>,
        affected: &[String],
    ) -> Result<Option<RepairAction>, MemoryEvolutionError> {
        // Retirer les items des clusters singletons
        for item in items.iter_mut() {
            if affected.contains(&item.id) {
                item.cluster_id = None;
            }
        }

        Ok(Some(RepairAction {
            id: uuid::Uuid::new_v4().to_string(),
            action_type: RepairActionType::FixReference,
            target_items: affected.to_vec(),
            description: "Retiré des clusters invalides".to_string(),
            success: true,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }))
    }

    fn repair_level_inconsistency(
        &self,
        items: &mut Vec<MemoryItem>,
        affected: &[String],
    ) -> Result<Option<RepairAction>, MemoryEvolutionError> {
        for item in items.iter_mut() {
            if affected.contains(&item.id) {
                // Core doit avoir haute importance
                if item.level == MemoryLevel::Core && item.importance < 0.7 {
                    item.importance = 0.8;
                }
            }
        }

        Ok(Some(RepairAction {
            id: uuid::Uuid::new_v4().to_string(),
            action_type: RepairActionType::CorrectLevel,
            target_items: affected.to_vec(),
            description: "Ajusté importance pour niveau".to_string(),
            success: true,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }))
    }

    /// Crée un backup de la mémoire
    pub fn create_backup(&self, items: &[MemoryItem]) -> Result<PathBuf, MemoryEvolutionError> {
        std::fs::create_dir_all(&self.backup_path)?;

        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
        let backup_file = self
            .backup_path
            .join(format!("memory_backup_{}.json", timestamp));

        let content = serde_json::to_string_pretty(items)?;
        std::fs::write(&backup_file, content)?;

        info!("[MemoryStability] Created backup: {:?}", backup_file);

        // Nettoyer les vieux backups
        self.cleanup_old_backups()?;

        Ok(backup_file)
    }

    /// Restaure depuis un backup
    pub fn restore_from_backup(
        &self,
        backup_path: &PathBuf,
    ) -> Result<Vec<MemoryItem>, MemoryEvolutionError> {
        let content = std::fs::read_to_string(backup_path)?;
        let items: Vec<MemoryItem> = serde_json::from_str(&content)?;

        info!(
            "[MemoryStability] Restored {} items from backup",
            items.len()
        );
        Ok(items)
    }

    /// Nettoie les vieux backups
    fn cleanup_old_backups(&self) -> Result<(), MemoryEvolutionError> {
        let mut backups: Vec<_> = std::fs::read_dir(&self.backup_path)?
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map_or(false, |ext| ext == "json"))
            .collect();

        backups.sort_by_key(|e| e.metadata().and_then(|m| m.modified()).ok());

        while backups.len() > self.config.max_backups {
            if let Some(oldest) = backups.first() {
                std::fs::remove_file(oldest.path())?;
                backups.remove(0);
            }
        }

        Ok(())
    }

    /// Liste les backups disponibles
    pub fn list_backups(&self) -> Result<Vec<PathBuf>, MemoryEvolutionError> {
        let mut backups: Vec<_> = std::fs::read_dir(&self.backup_path)?
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map_or(false, |ext| ext == "json"))
            .map(|e| e.path())
            .collect();

        backups.sort();
        backups.reverse();

        Ok(backups)
    }
}

impl Default for MemoryStabilityEngine {
    fn default() -> Self {
        let backup_path = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("titane-infinity")
            .join("memory_backups");

        Self::new(StabilityConfig::default(), backup_path)
    }
}
