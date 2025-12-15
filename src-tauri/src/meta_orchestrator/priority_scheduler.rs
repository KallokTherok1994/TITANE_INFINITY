//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — PRIORITY SCHEDULER
//! Ordonnanceur de tâches avec priorités dynamiques
//! ═══════════════════════════════════════════════════════════════════════════

use super::{MetaOrchestratorError, PriorityTask, TaskPriority, TaskStatus};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Ordonnanceur de priorités
pub struct PriorityScheduler {
    queue: Arc<RwLock<Vec<PriorityTask>>>,
    running_tasks: Arc<RwLock<Vec<PriorityTask>>>,
    completed_tasks: Arc<RwLock<Vec<PriorityTask>>>,
    config: SchedulerConfig,
    stats: Arc<RwLock<SchedulerStats>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerConfig {
    pub max_concurrent_tasks: usize,
    pub max_queue_size: usize,
    pub task_timeout_ms: u64,
    pub priority_boost_interval_ms: u64,
    pub starvation_threshold_ms: u64,
}

impl Default for SchedulerConfig {
    fn default() -> Self {
        Self {
            max_concurrent_tasks: 10,
            max_queue_size: 1000,
            task_timeout_ms: 60000,
            priority_boost_interval_ms: 5000,
            starvation_threshold_ms: 30000,
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SchedulerStats {
    pub total_enqueued: u64,
    pub total_completed: u64,
    pub total_failed: u64,
    pub total_cancelled: u64,
    pub avg_wait_time_ms: f64,
    pub avg_execution_time_ms: f64,
    pub current_queue_depth: usize,
    pub current_running: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerReport {
    pub tasks_processed: usize,
    pub tasks_started: usize,
    pub tasks_completed: usize,
    pub tasks_failed: usize,
    pub queue_depth: usize,
    pub running_count: usize,
}

impl PriorityScheduler {
    pub fn new() -> Self {
        Self {
            queue: Arc::new(RwLock::new(Vec::new())),
            running_tasks: Arc::new(RwLock::new(Vec::new())),
            completed_tasks: Arc::new(RwLock::new(Vec::new())),
            config: SchedulerConfig::default(),
            stats: Arc::new(RwLock::new(SchedulerStats::default())),
        }
    }

    pub async fn initialize(&self) -> Result<(), MetaOrchestratorError> {
        log::info!("[PriorityScheduler] Initializing scheduler...");
        Ok(())
    }

    /// Ajoute une tâche à la queue
    pub async fn enqueue(&self, task: PriorityTask) -> Result<(), MetaOrchestratorError> {
        let mut queue = self.queue.write().await;

        if queue.len() >= self.config.max_queue_size {
            return Err(MetaOrchestratorError::SchedulerError(
                "Queue is full".to_string(),
            ));
        }

        queue.push(task);

        // Trier par priorité (plus haute d'abord)
        queue.sort_by(|a, b| b.priority.cmp(&a.priority));

        let mut stats = self.stats.write().await;
        stats.total_enqueued += 1;
        stats.current_queue_depth = queue.len();

        Ok(())
    }

    /// Traite la queue de tâches
    pub async fn process_queue(&self) -> Result<SchedulerReport, MetaOrchestratorError> {
        let mut tasks_started = 0;
        let tasks_completed = 0;
        let tasks_failed = 0;

        // Vérifier les tâches en cours
        self.check_running_tasks().await;

        // Démarrer de nouvelles tâches si possible
        let running_count = self.running_tasks.read().await.len();
        let available_slots = self
            .config
            .max_concurrent_tasks
            .saturating_sub(running_count);

        if available_slots > 0 {
            let mut queue = self.queue.write().await;
            let mut running = self.running_tasks.write().await;

            for _ in 0..available_slots {
                if let Some(mut task) = queue.pop() {
                    task.status = TaskStatus::Running;
                    task.started_at = Some(
                        std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_millis() as u64,
                    );
                    running.push(task);
                    tasks_started += 1;
                } else {
                    break;
                }
            }
        }

        // Anti-starvation: boost les tâches en attente depuis longtemps
        self.apply_priority_boost().await;

        let queue = self.queue.read().await;
        let running = self.running_tasks.read().await;

        // Mise à jour des stats
        let mut stats = self.stats.write().await;
        stats.current_queue_depth = queue.len();
        stats.current_running = running.len();

        Ok(SchedulerReport {
            tasks_processed: tasks_started + tasks_completed,
            tasks_started,
            tasks_completed,
            tasks_failed,
            queue_depth: queue.len(),
            running_count: running.len(),
        })
    }

    /// Vérifie l'état des tâches en cours
    async fn check_running_tasks(&self) {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        let mut running = self.running_tasks.write().await;
        let mut completed = self.completed_tasks.write().await;
        let mut stats = self.stats.write().await;

        let mut i = 0;
        while i < running.len() {
            let task = &running[i];

            // Vérifier timeout
            if let Some(started) = task.started_at {
                if now - started > self.config.task_timeout_ms {
                    let mut task = running.remove(i);
                    task.status = TaskStatus::Failed;
                    completed.push(task);
                    stats.total_failed += 1;
                    continue;
                }
            }

            // Simuler la completion (en production, vérifier l'état réel)
            if task.progress_percent >= 100.0 {
                let mut task = running.remove(i);
                task.status = TaskStatus::Completed;
                completed.push(task);
                stats.total_completed += 1;
                continue;
            }

            i += 1;
        }

        // Limiter l'historique des tâches complétées
        while completed.len() > 100 {
            completed.remove(0);
        }
    }

    /// Applique un boost de priorité aux tâches en attente depuis longtemps
    async fn apply_priority_boost(&self) {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        let mut queue = self.queue.write().await;

        for task in queue.iter_mut() {
            let wait_time = now.saturating_sub(task.created_at);

            if wait_time > self.config.starvation_threshold_ms {
                // Boost la priorité
                task.priority = match task.priority {
                    TaskPriority::Background => TaskPriority::Low,
                    TaskPriority::Low => TaskPriority::Normal,
                    TaskPriority::Normal => TaskPriority::High,
                    p => p, // Ne pas booster au-delà de High
                };
            }
        }

        // Re-trier après le boost
        queue.sort_by(|a, b| b.priority.cmp(&a.priority));
    }

    /// Récupère la queue actuelle
    pub async fn get_queue(&self) -> Vec<PriorityTask> {
        self.queue.read().await.clone()
    }

    /// Récupère les tâches en cours
    pub async fn get_running(&self) -> Vec<PriorityTask> {
        self.running_tasks.read().await.clone()
    }

    /// Récupère les statistiques
    pub async fn get_stats(&self) -> SchedulerStats {
        self.stats.read().await.clone()
    }

    /// Annule une tâche
    pub async fn cancel_task(&self, task_id: &str) -> Result<(), MetaOrchestratorError> {
        // Chercher dans la queue
        let mut queue = self.queue.write().await;
        if let Some(pos) = queue.iter().position(|t| t.id == task_id) {
            let mut task = queue.remove(pos);
            task.status = TaskStatus::Cancelled;

            let mut completed = self.completed_tasks.write().await;
            completed.push(task);

            let mut stats = self.stats.write().await;
            stats.total_cancelled += 1;

            return Ok(());
        }

        // Chercher dans les tâches en cours
        let mut running = self.running_tasks.write().await;
        if let Some(pos) = running.iter().position(|t| t.id == task_id) {
            let mut task = running.remove(pos);
            task.status = TaskStatus::Cancelled;

            let mut completed = self.completed_tasks.write().await;
            completed.push(task);

            let mut stats = self.stats.write().await;
            stats.total_cancelled += 1;

            return Ok(());
        }

        Err(MetaOrchestratorError::TaskNotFound(task_id.to_string()))
    }

    /// Récupère le statut d'une tâche
    pub async fn get_task_status(&self, task_id: &str) -> Option<TaskStatus> {
        // Chercher dans la queue
        let queue = self.queue.read().await;
        if let Some(task) = queue.iter().find(|t| t.id == task_id) {
            return Some(task.status);
        }

        // Chercher dans les tâches en cours
        let running = self.running_tasks.read().await;
        if let Some(task) = running.iter().find(|t| t.id == task_id) {
            return Some(task.status);
        }

        // Chercher dans les tâches complétées
        let completed = self.completed_tasks.read().await;
        if let Some(task) = completed.iter().find(|t| t.id == task_id) {
            return Some(task.status);
        }

        None
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn create_test_task(id: &str, priority: TaskPriority) -> PriorityTask {
        PriorityTask {
            id: id.to_string(),
            name: format!("Test task {}", id),
            priority,
            engine: "test_engine".to_string(),
            status: TaskStatus::Queued,
            created_at: chrono::Utc::now().timestamp_millis() as u64,
            started_at: None,
            deadline_ms: None,
            progress_percent: 0.0,
            metadata: HashMap::new(),
        }
    }

    #[tokio::test]
    async fn test_scheduler_creation() {
        let scheduler = PriorityScheduler::new();
        let stats = scheduler.get_stats().await;

        assert_eq!(stats.total_enqueued, 0);
        assert_eq!(stats.current_queue_depth, 0);
        assert_eq!(stats.current_running, 0);
    }

    #[tokio::test]
    async fn test_scheduler_enqueue_single_task() {
        let scheduler = PriorityScheduler::new();
        let task = create_test_task("task_1", TaskPriority::Normal);

        let result = scheduler.enqueue(task).await;
        assert!(result.is_ok());

        let stats = scheduler.get_stats().await;
        assert_eq!(stats.total_enqueued, 1);
        assert_eq!(stats.current_queue_depth, 1);
    }

    #[tokio::test]
    async fn test_scheduler_priority_ordering() {
        let scheduler = PriorityScheduler::new();

        // Ajouter des tâches dans l'ordre inverse de priorité
        scheduler
            .enqueue(create_test_task("low", TaskPriority::Low))
            .await
            .unwrap();
        scheduler
            .enqueue(create_test_task("critical", TaskPriority::Critical))
            .await
            .unwrap();
        scheduler
            .enqueue(create_test_task("normal", TaskPriority::Normal))
            .await
            .unwrap();

        // Vérifier que la queue est triée par priorité
        let queue = scheduler.get_queue().await;
        assert_eq!(queue.len(), 3);
        // Critical devrait être en premier (plus haute priorité)
        assert_eq!(queue[0].id, "critical");
        assert_eq!(queue[1].id, "normal");
        assert_eq!(queue[2].id, "low");
    }

    #[tokio::test]
    async fn test_scheduler_get_queue() {
        let scheduler = PriorityScheduler::new();

        scheduler
            .enqueue(create_test_task("task_1", TaskPriority::Normal))
            .await
            .unwrap();
        scheduler
            .enqueue(create_test_task("task_2", TaskPriority::High))
            .await
            .unwrap();

        let queue = scheduler.get_queue().await;
        assert_eq!(queue.len(), 2);
        // High priority devrait être en premier
        assert_eq!(queue[0].id, "task_2");
    }

    #[tokio::test]
    async fn test_scheduler_task_status() {
        let scheduler = PriorityScheduler::new();
        let task = create_test_task("status_test", TaskPriority::Normal);

        scheduler.enqueue(task).await.unwrap();

        let status = scheduler.get_task_status("status_test").await;
        assert!(status.is_some());
        assert_eq!(status.unwrap(), TaskStatus::Queued);

        // Tâche inexistante
        let unknown = scheduler.get_task_status("unknown").await;
        assert!(unknown.is_none());
    }

    #[tokio::test]
    async fn test_scheduler_cancel_task() {
        let scheduler = PriorityScheduler::new();
        scheduler
            .enqueue(create_test_task("to_cancel", TaskPriority::Normal))
            .await
            .unwrap();

        let result = scheduler.cancel_task("to_cancel").await;
        assert!(result.is_ok());

        let stats = scheduler.get_stats().await;
        assert_eq!(stats.total_cancelled, 1);
    }

    #[tokio::test]
    async fn test_scheduler_initialize() {
        let scheduler = PriorityScheduler::new();
        let result = scheduler.initialize().await;
        assert!(result.is_ok());
    }
}
