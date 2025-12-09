//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — RECOVERY MANAGEMENT
//! Super Prompt #20 — Stratégies de récupération énergétique
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::VecDeque;
use super::energy_model::EnergyDimension;

/// Stratégie de récupération
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RecoveryStrategy {
    /// Récupération passive (repos simple)
    Passive,
    /// Récupération active (changement d'activité)
    Active,
    /// Micro-pauses fréquentes
    MicroBreaks,
    /// Pause longue unique
    ExtendedBreak,
    /// Récupération ciblée (une dimension)
    Targeted,
    /// Récupération intégrale (toutes dimensions)
    Complete,
    /// Récupération progressive
    Progressive,
}

/// Plan de récupération
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecoveryPlan {
    pub id: String,
    pub strategy: RecoveryStrategy,
    pub target_dimensions: Vec<EnergyDimension>,
    pub duration_ms: u64,
    pub phases: Vec<RecoveryPhase>,
    pub expected_recovery: f32,
    pub priority: u8,
    pub created_at: u64,
}

impl RecoveryPlan {
    pub fn quick_break() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            strategy: RecoveryStrategy::MicroBreaks,
            target_dimensions: vec![EnergyDimension::Cognitive],
            duration_ms: 300000, // 5 minutes
            phases: vec![
                RecoveryPhase {
                    name: "relax".to_string(),
                    duration_ms: 300000,
                    activity: RecoveryActivity::Rest,
                    intensity: 0.0,
                }
            ],
            expected_recovery: 0.15,
            priority: 1,
            created_at: Self::now(),
        }
    }

    pub fn focused_recovery(dimension: EnergyDimension) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            strategy: RecoveryStrategy::Targeted,
            target_dimensions: vec![dimension],
            duration_ms: 900000, // 15 minutes
            phases: vec![
                RecoveryPhase {
                    name: "disconnect".to_string(),
                    duration_ms: 300000,
                    activity: RecoveryActivity::Rest,
                    intensity: 0.0,
                },
                RecoveryPhase {
                    name: "gentle_activity".to_string(),
                    duration_ms: 600000,
                    activity: RecoveryActivity::LightActivity,
                    intensity: 0.2,
                },
            ],
            expected_recovery: 0.35,
            priority: 2,
            created_at: Self::now(),
        }
    }

    pub fn full_recovery() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            strategy: RecoveryStrategy::Complete,
            target_dimensions: vec![
                EnergyDimension::Cognitive,
                EnergyDimension::Creative,
                EnergyDimension::Social,
                EnergyDimension::Executive,
                EnergyDimension::Memory,
                EnergyDimension::Sensory,
                EnergyDimension::Physical,
            ],
            duration_ms: 3600000, // 1 heure
            phases: vec![
                RecoveryPhase {
                    name: "complete_rest".to_string(),
                    duration_ms: 1800000,
                    activity: RecoveryActivity::Rest,
                    intensity: 0.0,
                },
                RecoveryPhase {
                    name: "light_activity".to_string(),
                    duration_ms: 900000,
                    activity: RecoveryActivity::LightActivity,
                    intensity: 0.2,
                },
                RecoveryPhase {
                    name: "gradual_return".to_string(),
                    duration_ms: 900000,
                    activity: RecoveryActivity::LightCognitive,
                    intensity: 0.4,
                },
            ],
            expected_recovery: 0.8,
            priority: 3,
            created_at: Self::now(),
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Phase de récupération
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecoveryPhase {
    pub name: String,
    pub duration_ms: u64,
    pub activity: RecoveryActivity,
    pub intensity: f32,
}

/// Type d'activité de récupération
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RecoveryActivity {
    /// Repos complet
    Rest,
    /// Activité légère physique
    LightActivity,
    /// Activité cognitive légère
    LightCognitive,
    /// Activité créative
    Creative,
    /// Méditation/relaxation
    Meditation,
    /// Interaction sociale légère
    SocialLight,
    /// Sommeil
    Sleep,
}

/// Session de récupération active
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecoverySession {
    pub id: String,
    pub plan: RecoveryPlan,
    pub started_at: u64,
    pub current_phase: usize,
    pub progress: f32,
    pub recovered: f32,
    pub status: RecoveryStatus,
}

/// Statut de récupération
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RecoveryStatus {
    Scheduled,
    InProgress,
    Paused,
    Completed,
    Cancelled,
}

/// Gestionnaire de récupération
pub struct RecoveryManager {
    active_session: RwLock<Option<RecoverySession>>,
    scheduled: RwLock<VecDeque<RecoveryPlan>>,
    history: RwLock<VecDeque<RecoveryRecord>>,
    max_history: usize,
    stats: RwLock<RecoveryStats>,
}

impl RecoveryManager {
    pub fn new() -> Self {
        Self {
            active_session: RwLock::new(None),
            scheduled: RwLock::new(VecDeque::new()),
            history: RwLock::new(VecDeque::new()),
            max_history: 100,
            stats: RwLock::new(RecoveryStats::default()),
        }
    }

    /// Planifie une récupération
    pub async fn schedule(&self, plan: RecoveryPlan) {
        let mut scheduled = self.scheduled.write().await;

        // Insérer selon la priorité
        let pos = scheduled.iter()
            .position(|p| p.priority < plan.priority)
            .unwrap_or(scheduled.len());

        scheduled.insert(pos, plan);
    }

    /// Démarre une récupération
    pub async fn start(&self, plan: RecoveryPlan) -> Result<String, RecoveryError> {
        let mut active = self.active_session.write().await;

        if active.is_some() {
            return Err(RecoveryError::SessionAlreadyActive);
        }

        let session = RecoverySession {
            id: uuid::Uuid::new_v4().to_string(),
            plan,
            started_at: Self::now(),
            current_phase: 0,
            progress: 0.0,
            recovered: 0.0,
            status: RecoveryStatus::InProgress,
        };

        let id = session.id.clone();
        *active = Some(session);

        let mut stats = self.stats.write().await;
        stats.sessions_started += 1;

        Ok(id)
    }

    /// Démarre la prochaine récupération planifiée
    pub async fn start_next(&self) -> Result<String, RecoveryError> {
        let mut scheduled = self.scheduled.write().await;

        match scheduled.pop_front() {
            Some(plan) => {
                drop(scheduled);
                self.start(plan).await
            }
            None => Err(RecoveryError::NoScheduledRecovery),
        }
    }

    /// Met à jour la session active (appelé périodiquement)
    pub async fn tick(&self, elapsed_ms: u64) -> Option<RecoveryUpdate> {
        let mut active = self.active_session.write().await;

        let session = active.as_mut()?;

        if session.status != RecoveryStatus::InProgress {
            return None;
        }

        // Calculer la progression
        let total_duration: u64 = session.plan.phases.iter().map(|p| p.duration_ms).sum();
        let elapsed_total = Self::now() - session.started_at;

        session.progress = (elapsed_total as f32 / total_duration as f32).min(1.0);

        // Déterminer la phase courante
        let mut cumulative = 0u64;
        for (i, phase) in session.plan.phases.iter().enumerate() {
            cumulative += phase.duration_ms;
            if elapsed_total < cumulative {
                session.current_phase = i;
                break;
            }
        }

        // Calculer la récupération
        session.recovered = session.progress * session.plan.expected_recovery;

        // Vérifier si terminé
        if session.progress >= 1.0 {
            session.status = RecoveryStatus::Completed;

            // Copier les valeurs nécessaires avant drop
            let session_recovered = session.recovered;
            let record = RecoveryRecord {
                session_id: session.id.clone(),
                strategy: session.plan.strategy,
                started_at: session.started_at,
                ended_at: Self::now(),
                recovered: session_recovered,
                completed: true,
            };

            drop(active);

            let mut history = self.history.write().await;
            history.push_back(record);
            while history.len() > self.max_history {
                history.pop_front();
            }

            let mut stats = self.stats.write().await;
            stats.sessions_completed += 1;
            stats.total_recovered += session_recovered as f64;

            return Some(RecoveryUpdate {
                phase_name: "completed".to_string(),
                progress: 1.0,
                recovered: session_recovered,
                status: RecoveryStatus::Completed,
            });
        }

        let current_phase = &session.plan.phases[session.current_phase];

        Some(RecoveryUpdate {
            phase_name: current_phase.name.clone(),
            progress: session.progress,
            recovered: session.recovered,
            status: session.status,
        })
    }

    /// Pause la session active
    pub async fn pause(&self) -> Result<(), RecoveryError> {
        let mut active = self.active_session.write().await;

        match active.as_mut() {
            Some(session) if session.status == RecoveryStatus::InProgress => {
                session.status = RecoveryStatus::Paused;
                Ok(())
            }
            Some(_) => Err(RecoveryError::InvalidSessionState),
            None => Err(RecoveryError::NoActiveSession),
        }
    }

    /// Reprend la session pausée
    pub async fn resume(&self) -> Result<(), RecoveryError> {
        let mut active = self.active_session.write().await;

        match active.as_mut() {
            Some(session) if session.status == RecoveryStatus::Paused => {
                session.status = RecoveryStatus::InProgress;
                Ok(())
            }
            Some(_) => Err(RecoveryError::InvalidSessionState),
            None => Err(RecoveryError::NoActiveSession),
        }
    }

    /// Annule la session active
    pub async fn cancel(&self) -> Result<f32, RecoveryError> {
        let mut active = self.active_session.write().await;

        match active.take() {
            Some(session) => {
                let record = RecoveryRecord {
                    session_id: session.id,
                    strategy: session.plan.strategy,
                    started_at: session.started_at,
                    ended_at: Self::now(),
                    recovered: session.recovered,
                    completed: false,
                };

                let mut history = self.history.write().await;
                history.push_back(record);

                let mut stats = self.stats.write().await;
                stats.sessions_cancelled += 1;

                Ok(session.recovered)
            }
            None => Err(RecoveryError::NoActiveSession),
        }
    }

    /// Obtient la session active
    pub async fn active_session(&self) -> Option<RecoverySession> {
        self.active_session.read().await.clone()
    }

    /// Obtient les plans programmés
    pub async fn scheduled_plans(&self) -> Vec<RecoveryPlan> {
        self.scheduled.read().await.iter().cloned().collect()
    }

    /// Recommande une stratégie de récupération
    pub fn recommend_strategy(&self, fatigue_level: f32, available_time_ms: u64) -> RecoveryStrategy {
        match (fatigue_level, available_time_ms) {
            (f, _) if f > 0.8 => RecoveryStrategy::Complete,
            (f, t) if f > 0.6 && t >= 1800000 => RecoveryStrategy::ExtendedBreak,
            (f, t) if f > 0.6 => RecoveryStrategy::Targeted,
            (f, t) if f > 0.4 && t >= 600000 => RecoveryStrategy::Active,
            (_, t) if t < 300000 => RecoveryStrategy::MicroBreaks,
            _ => RecoveryStrategy::Passive,
        }
    }

    /// Crée un plan basé sur la recommandation
    pub fn create_plan(&self, strategy: RecoveryStrategy, target: Option<EnergyDimension>) -> RecoveryPlan {
        match strategy {
            RecoveryStrategy::MicroBreaks => RecoveryPlan::quick_break(),
            RecoveryStrategy::Targeted => {
                RecoveryPlan::focused_recovery(target.unwrap_or(EnergyDimension::Cognitive))
            }
            RecoveryStrategy::Complete => RecoveryPlan::full_recovery(),
            _ => RecoveryPlan::quick_break(),
        }
    }

    /// Statistiques de récupération
    pub async fn stats(&self) -> RecoveryStats {
        self.stats.read().await.clone()
    }

    /// Historique récent
    pub async fn recent_history(&self, count: usize) -> Vec<RecoveryRecord> {
        let history = self.history.read().await;
        history.iter().rev().take(count).cloned().collect()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for RecoveryManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Mise à jour de récupération
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecoveryUpdate {
    pub phase_name: String,
    pub progress: f32,
    pub recovered: f32,
    pub status: RecoveryStatus,
}

/// Enregistrement de récupération
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecoveryRecord {
    pub session_id: String,
    pub strategy: RecoveryStrategy,
    pub started_at: u64,
    pub ended_at: u64,
    pub recovered: f32,
    pub completed: bool,
}

/// Statistiques de récupération
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct RecoveryStats {
    pub sessions_started: u64,
    pub sessions_completed: u64,
    pub sessions_cancelled: u64,
    pub total_recovered: f64,
}

/// Erreurs de récupération
#[derive(Debug, Clone)]
pub enum RecoveryError {
    SessionAlreadyActive,
    NoActiveSession,
    NoScheduledRecovery,
    InvalidSessionState,
}

impl std::fmt::Display for RecoveryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::SessionAlreadyActive => write!(f, "A recovery session is already active"),
            Self::NoActiveSession => write!(f, "No active recovery session"),
            Self::NoScheduledRecovery => write!(f, "No scheduled recovery plans"),
            Self::InvalidSessionState => write!(f, "Invalid session state for this operation"),
        }
    }
}

impl std::error::Error for RecoveryError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_recovery_manager() {
        let manager = RecoveryManager::new();
        let plan = RecoveryPlan::quick_break();

        let result = manager.start(plan).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_recommend_strategy() {
        let manager = RecoveryManager::new();

        assert_eq!(
            manager.recommend_strategy(0.9, 3600000),
            RecoveryStrategy::Complete
        );
        assert_eq!(
            manager.recommend_strategy(0.3, 120000),
            RecoveryStrategy::MicroBreaks
        );
    }
}
