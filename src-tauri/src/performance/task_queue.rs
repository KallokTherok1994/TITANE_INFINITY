// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Task Queues multi-priorités pour le scheduler cognitif

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Type de tâche cognitive
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskType {
    /// Moteur cognitif (OMEGA, Style, Coherence...)
    Engine,
    /// Agent System
    Agent,
    /// Memory OS (vector search, clustering)
    Memory,
    /// Multimodal (Vision, Audio3D)
    Multimodal,
    /// Appel API externe
    Api,
    /// AGI Core (meta-learning)
    AgiCore,
    /// Tâche système (recovery, cleanup)
    Background,
    /// Kernel internal
    Kernel,
}

/// Priorité de tâche
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum TaskPriority {
    /// Critique temps réel (< 100ms)
    Realtime,
    /// Haute priorité (< 1s)
    High,
    /// Priorité normale (< 5s)
    Normal,
    /// Arrière-plan (best effort)
    Background,
}

impl TaskPriority {
    /// Timeout en millisecondes selon priorité
    pub fn timeout_ms(&self) -> u64 {
        match self {
            TaskPriority::Realtime => 100,
            TaskPriority::High => 1000,
            TaskPriority::Normal => 5000,
            TaskPriority::Background => 30000,
        }
    }
}

/// Tâche cognitive à exécuter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveTask {
    pub id: String,
    pub task_type: TaskType,
    pub priority: TaskPriority,
    pub submitted_at: i64,
    pub engine_name: Option<String>,
    pub payload: serde_json::Value,
}

impl CognitiveTask {
    /// Crée une nouvelle tâche
    pub fn new(task_type: TaskType, priority: TaskPriority, payload: serde_json::Value) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            task_type,
            priority,
            submitted_at: chrono::Utc::now().timestamp_millis(),
            engine_name: None,
            payload,
        }
    }

    /// Crée une tâche moteur
    pub fn engine(engine_name: &str, priority: TaskPriority, payload: serde_json::Value) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            task_type: TaskType::Engine,
            priority,
            submitted_at: chrono::Utc::now().timestamp_millis(),
            engine_name: Some(engine_name.to_string()),
            payload,
        }
    }

    /// Âge de la tâche en millisecondes
    pub fn age_ms(&self) -> i64 {
        chrono::Utc::now().timestamp_millis() - self.submitted_at
    }

    /// Vérifie si la tâche a dépassé son timeout
    pub fn is_timed_out(&self) -> bool {
        self.age_ms() > self.priority.timeout_ms() as i64
    }
}

/// Queues de tâches multiples
pub struct TaskQueues {
    realtime: Arc<RwLock<VecDeque<CognitiveTask>>>,
    high_priority: Arc<RwLock<VecDeque<CognitiveTask>>>,
    normal: Arc<RwLock<VecDeque<CognitiveTask>>>,
    background: Arc<RwLock<VecDeque<CognitiveTask>>>,
}

impl TaskQueues {
    pub fn new() -> Self {
        Self {
            realtime: Arc::new(RwLock::new(VecDeque::new())),
            high_priority: Arc::new(RwLock::new(VecDeque::new())),
            normal: Arc::new(RwLock::new(VecDeque::new())),
            background: Arc::new(RwLock::new(VecDeque::new())),
        }
    }

    /// Enfile une tâche dans la queue appropriée
    pub async fn enqueue(&self, task: CognitiveTask) {
        match task.priority {
            TaskPriority::Realtime => {
                self.realtime.write().await.push_back(task);
            }
            TaskPriority::High => {
                self.high_priority.write().await.push_back(task);
            }
            TaskPriority::Normal => {
                self.normal.write().await.push_back(task);
            }
            TaskPriority::Background => {
                self.background.write().await.push_back(task);
            }
        }
    }

    /// Défile la prochaine tâche (par ordre de priorité)
    pub async fn dequeue(&self) -> Option<CognitiveTask> {
        // Priorité: Realtime > High > Normal > Background

        if let Some(task) = self.realtime.write().await.pop_front() {
            return Some(task);
        }

        if let Some(task) = self.high_priority.write().await.pop_front() {
            return Some(task);
        }

        if let Some(task) = self.normal.write().await.pop_front() {
            return Some(task);
        }

        self.background.write().await.pop_front()
    }

    /// Nombre total de tâches en attente
    pub async fn total_pending(&self) -> usize {
        let rt = self.realtime.read().await.len();
        let hp = self.high_priority.read().await.len();
        let n = self.normal.read().await.len();
        let bg = self.background.read().await.len();
        rt + hp + n + bg
    }

    /// Tailles des queues individuelles
    pub async fn queue_sizes(&self) -> (usize, usize, usize, usize) {
        let rt = self.realtime.read().await.len();
        let hp = self.high_priority.read().await.len();
        let n = self.normal.read().await.len();
        let bg = self.background.read().await.len();
        (rt, hp, n, bg)
    }

    /// Vide toutes les queues (pour tests / shutdown)
    pub async fn clear_all(&self) {
        self.realtime.write().await.clear();
        self.high_priority.write().await.clear();
        self.normal.write().await.clear();
        self.background.write().await.clear();
    }
}

impl Default for TaskQueues {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_task_creation() {
        let task = CognitiveTask::new(TaskType::Engine, TaskPriority::High, serde_json::json!({}));
        assert!(!task.id.is_empty());
        assert_eq!(task.task_type, TaskType::Engine);
        assert_eq!(task.priority, TaskPriority::High);
    }

    #[tokio::test]
    async fn test_engine_task() {
        let task =
            CognitiveTask::engine("style_engine", TaskPriority::Normal, serde_json::json!({}));
        assert_eq!(task.task_type, TaskType::Engine);
        assert_eq!(task.engine_name, Some("style_engine".to_string()));
    }

    #[tokio::test]
    async fn test_task_queues_enqueue_dequeue() {
        let queues = TaskQueues::new();

        // Enqueue différentes priorités
        let task_rt = CognitiveTask::new(
            TaskType::Kernel,
            TaskPriority::Realtime,
            serde_json::json!({}),
        );
        let task_high =
            CognitiveTask::new(TaskType::Engine, TaskPriority::High, serde_json::json!({}));
        let task_bg = CognitiveTask::new(
            TaskType::Background,
            TaskPriority::Background,
            serde_json::json!({}),
        );

        queues.enqueue(task_bg.clone()).await;
        queues.enqueue(task_high.clone()).await;
        queues.enqueue(task_rt.clone()).await;

        // Dequeue doit respecter priorités (Realtime first)
        let next = queues.dequeue().await;
        assert!(next.is_some());
        assert_eq!(
            next.expect("realtime task should dequeue first").id,
            task_rt.id
        );

        // High ensuite
        let next = queues.dequeue().await;
        assert!(next.is_some());
        assert_eq!(
            next.expect("high priority task should dequeue second").id,
            task_high.id
        );

        // Background dernière
        let next = queues.dequeue().await;
        assert!(next.is_some());
        assert_eq!(
            next.expect("background task should dequeue last").id,
            task_bg.id
        );
    }

    #[tokio::test]
    async fn test_queue_sizes() {
        let queues = TaskQueues::new();

        queues
            .enqueue(CognitiveTask::new(
                TaskType::Engine,
                TaskPriority::Realtime,
                serde_json::json!({}),
            ))
            .await;
        queues
            .enqueue(CognitiveTask::new(
                TaskType::Engine,
                TaskPriority::High,
                serde_json::json!({}),
            ))
            .await;
        queues
            .enqueue(CognitiveTask::new(
                TaskType::Engine,
                TaskPriority::Normal,
                serde_json::json!({}),
            ))
            .await;

        let sizes = queues.queue_sizes().await;
        assert_eq!(sizes.0, 1); // realtime
        assert_eq!(sizes.1, 1); // high
        assert_eq!(sizes.2, 1); // normal
        assert_eq!(sizes.3, 0); // background

        let total = queues.total_pending().await;
        assert_eq!(total, 3);
    }

    #[test]
    fn test_task_timeout() {
        let mut task = CognitiveTask::new(
            TaskType::Engine,
            TaskPriority::Realtime,
            serde_json::json!({}),
        );
        task.submitted_at = chrono::Utc::now().timestamp_millis() - 200;

        assert!(task.is_timed_out()); // Realtime timeout = 100ms
    }
}
