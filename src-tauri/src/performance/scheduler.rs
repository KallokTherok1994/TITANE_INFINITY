// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Cognitive Scheduler avec multi-queues et priorités dynamiques

#![allow(unused_imports)]
#![allow(dead_code)]

use super::config::PerformanceConfig;
use super::priorities::PriorityModel;
use super::task_queue::{CognitiveTask, TaskQueues};
use crate::utils::AppResult as TitaneResult;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerState {
    pub active_tasks: usize,
    pub pending_tasks: usize,
    pub completed_tasks: usize,
    pub failed_tasks: usize,
}

pub struct CognitiveScheduler {
    queues: Arc<TaskQueues>,
    priority_model: Arc<PriorityModel>,
    state: Arc<RwLock<SchedulerState>>,
    config: PerformanceConfig,
    running: Arc<RwLock<bool>>,
}

impl CognitiveScheduler {
    pub fn new(config: PerformanceConfig) -> TitaneResult<Self> {
        Ok(Self {
            queues: Arc::new(TaskQueues::new()),
            priority_model: Arc::new(PriorityModel::default()),
            state: Arc::new(RwLock::new(SchedulerState {
                active_tasks: 0,
                pending_tasks: 0,
                completed_tasks: 0,
                failed_tasks: 0,
            })),
            config,
            running: Arc::new(RwLock::new(false)),
        })
    }

    pub async fn start(&self) -> TitaneResult<()> {
        *self.running.write().await = true;
        log::info!("[CognitiveScheduler] ✅ Started");

        // TODO: Spawn background task pour scheduler loop
        // tokio::spawn(self.scheduler_loop());

        Ok(())
    }

    pub async fn stop(&self) -> TitaneResult<()> {
        *self.running.write().await = false;
        log::info!("[CognitiveScheduler] Stopped");
        Ok(())
    }

    pub async fn enqueue(&self, task: CognitiveTask) -> TitaneResult<()> {
        self.queues.enqueue(task).await;

        let mut state = self.state.write().await;
        state.pending_tasks += 1;

        Ok(())
    }

    pub async fn dequeue(&self) -> Option<CognitiveTask> {
        let task = self.queues.dequeue().await;

        if task.is_some() {
            let mut state = self.state.write().await;
            state.pending_tasks = state.pending_tasks.saturating_sub(1);
            state.active_tasks += 1;
        }

        task
    }

    pub async fn mark_completed(&self) {
        let mut state = self.state.write().await;
        state.active_tasks = state.active_tasks.saturating_sub(1);
        state.completed_tasks += 1;
    }

    pub async fn mark_failed(&self) {
        let mut state = self.state.write().await;
        state.active_tasks = state.active_tasks.saturating_sub(1);
        state.failed_tasks += 1;
    }

    pub async fn state(&self) -> SchedulerState {
        self.state.read().await.clone()
    }

    pub async fn queue_sizes(&self) -> (usize, usize, usize, usize) {
        self.queues.queue_sizes().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::performance::task_queue::TaskPriority;
    use crate::performance::task_queue::TaskType;

    #[tokio::test]
    async fn test_scheduler_creation() {
        let config = PerformanceConfig::default();
        let scheduler = CognitiveScheduler::new(config);
        assert!(scheduler.is_ok());
    }

    #[tokio::test]
    async fn test_enqueue_dequeue() {
        let config = PerformanceConfig::default();
        let scheduler = CognitiveScheduler::new(config).unwrap();

        let task = CognitiveTask::new(TaskType::Engine, TaskPriority::High, serde_json::json!({}));

        scheduler.enqueue(task.clone()).await.unwrap();

        let state = scheduler.state().await;
        assert_eq!(state.pending_tasks, 1);

        let dequeued = scheduler.dequeue().await;
        assert!(dequeued.is_some());
        assert_eq!(dequeued.unwrap().id, task.id);

        let state = scheduler.state().await;
        assert_eq!(state.pending_tasks, 0);
        assert_eq!(state.active_tasks, 1);
    }

    #[tokio::test]
    async fn test_mark_completed() {
        let config = PerformanceConfig::default();
        let scheduler = CognitiveScheduler::new(config).unwrap();

        let task = CognitiveTask::new(TaskType::Engine, TaskPriority::High, serde_json::json!({}));

        scheduler.enqueue(task).await.unwrap();
        scheduler.dequeue().await.unwrap();
        scheduler.mark_completed().await;

        let state = scheduler.state().await;
        assert_eq!(state.active_tasks, 0);
        assert_eq!(state.completed_tasks, 1);
    }
}
