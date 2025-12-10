//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL PLANNER
//! Super Prompt #18 — Planification intelligente et gestion des tâches
//! ═══════════════════════════════════════════════════════════════════════════════

use super::time_model::TemporalContext;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

/// Horizon de planification
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PlanningHorizon {
    /// Aujourd'hui
    Today,
    /// Cette semaine
    ThisWeek,
    /// Ce mois
    ThisMonth,
    /// Ce trimestre
    ThisQuarter,
    /// Cette année
    ThisYear,
    /// Long terme (> 1 an)
    LongTerm,
}

impl PlanningHorizon {
    pub fn duration_ms(&self) -> u64 {
        match self {
            Self::Today => 86_400_000,
            Self::ThisWeek => 604_800_000,
            Self::ThisMonth => 2_592_000_000,
            Self::ThisQuarter => 7_776_000_000,
            Self::ThisYear => 31_536_000_000,
            Self::LongTerm => u64::MAX,
        }
    }
}

/// Priorité de tâche
#[derive(Clone, Copy, Debug, PartialEq, Eq, Ord, PartialOrd, Hash, Serialize, Deserialize)]
pub enum TaskPriority {
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4,
    Critical = 5,
}

impl Default for TaskPriority {
    fn default() -> Self {
        Self::Normal
    }
}

/// Statut de tâche
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Blocked,
    Completed,
    Cancelled,
    Deferred,
}

impl Default for TaskStatus {
    fn default() -> Self {
        Self::Pending
    }
}

/// Tâche
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub priority: TaskPriority,
    pub status: TaskStatus,
    pub horizon: PlanningHorizon,
    pub created_at: u64,
    pub due_at: Option<u64>,
    pub started_at: Option<u64>,
    pub completed_at: Option<u64>,
    pub estimated_duration_ms: Option<u64>,
    pub actual_duration_ms: Option<u64>,
    pub dependencies: Vec<String>,
    pub tags: Vec<String>,
    pub recurrence: Option<TaskRecurrence>,
    pub energy_required: f32,
    pub parent_id: Option<String>,
    pub subtasks: Vec<String>,
}

impl Task {
    pub fn new(id: &str, title: &str) -> Self {
        Self {
            id: id.to_string(),
            title: title.to_string(),
            description: String::new(),
            priority: TaskPriority::default(),
            status: TaskStatus::default(),
            horizon: PlanningHorizon::Today,
            created_at: Self::now(),
            due_at: None,
            started_at: None,
            completed_at: None,
            estimated_duration_ms: None,
            actual_duration_ms: None,
            dependencies: Vec::new(),
            tags: Vec::new(),
            recurrence: None,
            energy_required: 0.5,
            parent_id: None,
            subtasks: Vec::new(),
        }
    }

    /// Vérifie si la tâche est due
    pub fn is_due(&self, context: &TemporalContext) -> bool {
        if let Some(due) = self.due_at {
            context.now.timestamp_ms >= due && self.status == TaskStatus::Pending
        } else {
            false
        }
    }

    /// Vérifie si la tâche est en retard
    pub fn is_overdue(&self, context: &TemporalContext) -> bool {
        if let Some(due) = self.due_at {
            context.now.timestamp_ms > due && self.status != TaskStatus::Completed
        } else {
            false
        }
    }

    /// Calcule le score de priorité
    pub fn priority_score(&self, context: &TemporalContext) -> f32 {
        let base_score = self.priority as u8 as f32 * 20.0; // 20-100

        // Bonus si due bientôt
        let urgency_bonus = if let Some(due) = self.due_at {
            let remaining = due.saturating_sub(context.now.timestamp_ms) as f32;
            let horizon_ms = self.horizon.duration_ms() as f32;
            let ratio = remaining / horizon_ms;
            if ratio < 0.1 {
                30.0
            }
            // Très urgent
            else if ratio < 0.25 {
                20.0
            }
            // Urgent
            else if ratio < 0.5 {
                10.0
            }
            // Modéré
            else {
                0.0
            }
        } else {
            0.0
        };

        // Malus si énergie requise > énergie disponible
        let energy_penalty = if self.energy_required > context.cognitive_energy_estimate {
            -10.0
        } else {
            0.0
        };

        base_score + urgency_bonus + energy_penalty
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Récurrence de tâche
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TaskRecurrence {
    pub pattern: RecurrencePattern,
    pub interval: u32,
    pub end_after: Option<u32>,
    pub occurrences: u32,
}

/// Pattern de récurrence
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum RecurrencePattern {
    Daily,
    Weekly,
    Monthly,
    Yearly,
    Custom(u64), // Intervalle en ms
}

/// Plan
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Plan {
    pub id: String,
    pub name: String,
    pub description: String,
    pub horizon: PlanningHorizon,
    pub tasks: Vec<String>,
    pub created_at: u64,
    pub start_at: u64,
    pub end_at: u64,
    pub progress: f32,
    pub status: PlanStatus,
}

/// Statut de plan
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PlanStatus {
    Draft,
    Active,
    Paused,
    Completed,
    Abandoned,
}

/// Configuration du planificateur
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlannerConfig {
    pub max_tasks: usize,
    pub auto_prioritize: bool,
    pub respect_energy_levels: bool,
    pub default_task_duration_ms: u64,
}

impl Default for PlannerConfig {
    fn default() -> Self {
        Self {
            max_tasks: 1000,
            auto_prioritize: true,
            respect_energy_levels: true,
            default_task_duration_ms: 3600000, // 1 heure
        }
    }
}

/// Résultat de mise à jour du planificateur
#[derive(Clone, Debug)]
pub struct UpdateResult {
    pub pending: usize,
    pub due: Vec<Task>,
    pub overdue: Vec<Task>,
    pub completed_today: usize,
}

/// Planificateur temporel
pub struct TemporalPlanner {
    config: PlannerConfig,
    tasks: RwLock<Vec<Task>>,
    plans: RwLock<Vec<Plan>>,
    stats: RwLock<PlannerStats>,
}

impl TemporalPlanner {
    pub fn new(config: PlannerConfig) -> Self {
        Self {
            config,
            tasks: RwLock::new(Vec::new()),
            plans: RwLock::new(Vec::new()),
            stats: RwLock::new(PlannerStats::default()),
        }
    }

    /// Met à jour le planificateur
    pub async fn update(&self, context: &TemporalContext) -> UpdateResult {
        let tasks = self.tasks.read().await;

        let pending: Vec<_> = tasks
            .iter()
            .filter(|t| t.status == TaskStatus::Pending)
            .collect();

        let due: Vec<_> = pending
            .iter()
            .filter(|t| t.is_due(context))
            .cloned()
            .cloned()
            .collect();

        let overdue: Vec<_> = tasks
            .iter()
            .filter(|t| t.is_overdue(context))
            .cloned()
            .collect();

        // Compter les tâches complétées aujourd'hui
        let day_start = context.now.timestamp_ms - (context.now.timestamp_ms % 86400000);
        let completed_today = tasks
            .iter()
            .filter(|t| {
                t.status == TaskStatus::Completed
                    && t.completed_at.map_or(false, |c| c >= day_start)
            })
            .count();

        UpdateResult {
            pending: pending.len(),
            due,
            overdue,
            completed_today,
        }
    }

    /// Ajoute une tâche
    pub async fn add_task(&self, task: Task) {
        let mut tasks = self.tasks.write().await;

        if tasks.len() >= self.config.max_tasks {
            // Supprimer les tâches complétées les plus anciennes
            tasks.retain(|t| t.status != TaskStatus::Completed);
        }

        tasks.push(task);

        let mut stats = self.stats.write().await;
        stats.tasks_created += 1;
    }

    /// Récupère une tâche
    pub async fn get_task(&self, id: &str) -> Option<Task> {
        let tasks = self.tasks.read().await;
        tasks.iter().find(|t| t.id == id).cloned()
    }

    /// Met à jour le statut d'une tâche
    pub async fn update_task_status(&self, id: &str, status: TaskStatus) -> bool {
        let mut tasks = self.tasks.write().await;

        if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
            let old_status = task.status;
            task.status = status;

            if status == TaskStatus::InProgress && task.started_at.is_none() {
                task.started_at = Some(Self::now());
            }

            if status == TaskStatus::Completed {
                task.completed_at = Some(Self::now());
                if let Some(started) = task.started_at {
                    task.actual_duration_ms = Some(Self::now() - started);
                }

                // Mettre à jour les stats
                let mut stats = self.stats.write().await;
                stats.tasks_completed += 1;
            }

            // Gérer la récurrence
            if status == TaskStatus::Completed && old_status != TaskStatus::Completed {
                if let Some(recurrence) = &task.recurrence {
                    if recurrence
                        .end_after
                        .map_or(true, |max| recurrence.occurrences < max)
                    {
                        // Créer la prochaine occurrence
                        let next_task = self.create_recurring_task(task, recurrence);
                        drop(tasks);
                        self.add_task(next_task).await;
                        return true;
                    }
                }
            }

            true
        } else {
            false
        }
    }

    /// Crée une tâche récurrente suivante
    fn create_recurring_task(&self, original: &Task, recurrence: &TaskRecurrence) -> Task {
        let interval_ms = match recurrence.pattern {
            RecurrencePattern::Daily => 86_400_000,
            RecurrencePattern::Weekly => 604_800_000,
            RecurrencePattern::Monthly => 2_592_000_000,
            RecurrencePattern::Yearly => 31_536_000_000,
            RecurrencePattern::Custom(ms) => ms,
        };

        let new_due = original
            .due_at
            .map(|d| d + interval_ms * recurrence.interval as u64);

        Task {
            id: format!("{}_r{}", original.id, recurrence.occurrences + 1),
            title: original.title.clone(),
            description: original.description.clone(),
            priority: original.priority,
            status: TaskStatus::Pending,
            horizon: original.horizon,
            created_at: Self::now(),
            due_at: new_due,
            started_at: None,
            completed_at: None,
            estimated_duration_ms: original.estimated_duration_ms,
            actual_duration_ms: None,
            dependencies: Vec::new(),
            tags: original.tags.clone(),
            recurrence: Some(TaskRecurrence {
                pattern: recurrence.pattern.clone(),
                interval: recurrence.interval,
                end_after: recurrence.end_after,
                occurrences: recurrence.occurrences + 1,
            }),
            energy_required: original.energy_required,
            parent_id: original.parent_id.clone(),
            subtasks: Vec::new(),
        }
    }

    /// Récupère les tâches dues
    pub async fn due_tasks(&self) -> Vec<Task> {
        let tasks = self.tasks.read().await;
        let now = Self::now();

        tasks
            .iter()
            .filter(|t| t.status == TaskStatus::Pending && t.due_at.map_or(false, |d| now >= d))
            .cloned()
            .collect()
    }

    /// Récupère les tâches par horizon
    pub async fn tasks_by_horizon(&self, horizon: PlanningHorizon) -> Vec<Task> {
        let tasks = self.tasks.read().await;
        tasks
            .iter()
            .filter(|t| t.horizon == horizon && t.status != TaskStatus::Completed)
            .cloned()
            .collect()
    }

    /// Récupère les tâches triées par priorité
    pub async fn prioritized_tasks(&self, context: &TemporalContext) -> Vec<Task> {
        let tasks = self.tasks.read().await;
        let mut pending: Vec<_> = tasks
            .iter()
            .filter(|t| t.status == TaskStatus::Pending)
            .cloned()
            .collect();

        pending.sort_by(|a, b| {
            let score_a = a.priority_score(context);
            let score_b = b.priority_score(context);
            score_b
                .partial_cmp(&score_a)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        pending
    }

    /// Crée un plan
    pub async fn create_plan(&self, plan: Plan) -> String {
        let id = plan.id.clone();
        let mut plans = self.plans.write().await;
        plans.push(plan);
        id
    }

    /// Récupère un plan
    pub async fn get_plan(&self, id: &str) -> Option<Plan> {
        let plans = self.plans.read().await;
        plans.iter().find(|p| p.id == id).cloned()
    }

    /// Statistiques
    pub async fn stats(&self) -> PlannerStats {
        let tasks = self.tasks.read().await;
        let plans = self.plans.read().await;
        let stats = self.stats.read().await;

        PlannerStats {
            total_tasks: tasks.len(),
            pending_tasks: tasks
                .iter()
                .filter(|t| t.status == TaskStatus::Pending)
                .count(),
            in_progress_tasks: tasks
                .iter()
                .filter(|t| t.status == TaskStatus::InProgress)
                .count(),
            completed_tasks: tasks
                .iter()
                .filter(|t| t.status == TaskStatus::Completed)
                .count(),
            total_plans: plans.len(),
            active_plans: plans
                .iter()
                .filter(|p| p.status == PlanStatus::Active)
                .count(),
            tasks_created: stats.tasks_created,
            tasks_completed: stats.tasks_completed,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for TemporalPlanner {
    fn default() -> Self {
        Self::new(PlannerConfig::default())
    }
}

/// Statistiques du planificateur
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct PlannerStats {
    pub total_tasks: usize,
    pub pending_tasks: usize,
    pub in_progress_tasks: usize,
    pub completed_tasks: usize,
    pub total_plans: usize,
    pub active_plans: usize,
    pub tasks_created: u64,
    pub tasks_completed: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_creation() {
        let task = Task::new("test_task", "Test Task");
        assert_eq!(task.status, TaskStatus::Pending);
        assert_eq!(task.priority, TaskPriority::Normal);
    }

    #[tokio::test]
    async fn test_planner() {
        let planner = TemporalPlanner::default();
        let task = Task::new("test", "Test Task");
        planner.add_task(task).await;

        let stats = planner.stats().await;
        assert_eq!(stats.total_tasks, 1);
    }

    #[test]
    fn test_planning_horizon_duration() {
        assert_eq!(PlanningHorizon::Today.duration_ms(), 86_400_000);
        assert_eq!(PlanningHorizon::ThisWeek.duration_ms(), 604_800_000);
        assert_eq!(PlanningHorizon::LongTerm.duration_ms(), u64::MAX);
    }

    #[test]
    fn test_task_priority_ordering() {
        assert!(TaskPriority::Critical > TaskPriority::Urgent);
        assert!(TaskPriority::Urgent > TaskPriority::High);
        assert!(TaskPriority::High > TaskPriority::Normal);
        assert!(TaskPriority::Normal > TaskPriority::Low);
    }

    #[test]
    fn test_task_priority_default() {
        let priority = TaskPriority::default();
        assert_eq!(priority, TaskPriority::Normal);
    }

    #[test]
    fn test_task_status_default() {
        let status = TaskStatus::default();
        assert_eq!(status, TaskStatus::Pending);
    }

    #[test]
    fn test_task_status_variants() {
        let statuses = vec![
            TaskStatus::Pending,
            TaskStatus::InProgress,
            TaskStatus::Blocked,
            TaskStatus::Completed,
            TaskStatus::Cancelled,
            TaskStatus::Deferred,
        ];
        assert_eq!(statuses.len(), 6);
    }

    #[tokio::test]
    async fn test_planner_multiple_tasks() {
        let planner = TemporalPlanner::default();

        for i in 0..5 {
            let task = Task::new(&format!("task_{}", i), &format!("Task {}", i));
            planner.add_task(task).await;
        }

        let stats = planner.stats().await;
        assert_eq!(stats.total_tasks, 5);
        assert_eq!(stats.pending_tasks, 5);
    }

    #[test]
    fn test_planner_stats_default() {
        let stats = PlannerStats::default();
        assert_eq!(stats.total_tasks, 0);
        assert_eq!(stats.pending_tasks, 0);
        assert_eq!(stats.completed_tasks, 0);
    }

    #[test]
    fn test_planning_horizon_variants() {
        let horizons = vec![
            PlanningHorizon::Today,
            PlanningHorizon::ThisWeek,
            PlanningHorizon::ThisMonth,
            PlanningHorizon::ThisQuarter,
            PlanningHorizon::ThisYear,
            PlanningHorizon::LongTerm,
        ];
        assert_eq!(horizons.len(), 6);
    }
}
