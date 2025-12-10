//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL EVENTS
//! Super Prompt #18 — Événements du système temporel
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Type d'événement temporel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum TemporalEventType {
    // Lifecycle events
    EngineInitialized,
    EngineShutdown,
    TickCompleted,

    // Memory events
    TraceRecorded,
    MemoryConsolidated,
    MemoryCleanup,

    // Routine events
    RoutineTriggered,
    RoutineCompleted,
    RoutineSkipped,
    RoutineAdded,
    RoutineRemoved,

    // Planning events
    TaskCreated,
    TaskStarted,
    TaskCompleted,
    TaskCancelled,
    TaskOverdue,
    PlanCreated,
    PlanUpdated,

    // Anticipation events
    PredictionGenerated,
    PredictionVerified,
    OpportunityDetected,
    RiskDetected,

    // Alignment events
    GoalCreated,
    GoalUpdated,
    GoalCompleted,
    MilestoneReached,
    AlignmentChecked,
    AlignmentWarning,

    // Time events
    DayStarted,
    DayEnded,
    WeekStarted,
    WeekEnded,
    SessionStarted,
    SessionEnded,

    // Rhythm events
    PeakEnergyPeriod,
    LowEnergyPeriod,
    BreakRecommended,

    // Error events
    Error,
    Warning,
}

/// Événement temporel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalEvent {
    pub id: String,
    pub event_type: TemporalEventType,
    pub timestamp: u64,
    pub message: String,
    pub data: Option<serde_json::Value>,
    pub source: String,
    pub severity: EventSeverity,
}

impl TemporalEvent {
    pub fn new(event_type: TemporalEventType, message: String) -> Self {
        let severity = Self::default_severity(&event_type);

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            event_type,
            timestamp: Self::now(),
            message,
            data: None,
            source: "temporal_engine".to_string(),
            severity,
        }
    }

    pub fn with_data(mut self, data: serde_json::Value) -> Self {
        self.data = Some(data);
        self
    }

    pub fn with_source(mut self, source: &str) -> Self {
        self.source = source.to_string();
        self
    }

    pub fn with_severity(mut self, severity: EventSeverity) -> Self {
        self.severity = severity;
        self
    }

    fn default_severity(event_type: &TemporalEventType) -> EventSeverity {
        match event_type {
            TemporalEventType::Error => EventSeverity::Error,
            TemporalEventType::Warning | TemporalEventType::AlignmentWarning => {
                EventSeverity::Warning
            }
            TemporalEventType::RiskDetected | TemporalEventType::TaskOverdue => {
                EventSeverity::Warning
            }
            TemporalEventType::PeakEnergyPeriod | TemporalEventType::OpportunityDetected => {
                EventSeverity::Info
            }
            _ => EventSeverity::Debug,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Sévérité de l'événement
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum EventSeverity {
    Debug,
    Info,
    Warning,
    Error,
    Critical,
}

/// Bus d'événements temporels
pub struct TemporalEventBus {
    subscribers: tokio::sync::RwLock<Vec<EventSubscriber>>,
    history: tokio::sync::RwLock<std::collections::VecDeque<TemporalEvent>>,
    max_history: usize,
}

type EventCallback = Box<dyn Fn(&TemporalEvent) + Send + Sync>;

struct EventSubscriber {
    id: String,
    filter: Option<Vec<TemporalEventType>>,
    callback: EventCallback,
}

impl TemporalEventBus {
    pub fn new(max_history: usize) -> Self {
        Self {
            subscribers: tokio::sync::RwLock::new(Vec::new()),
            history: tokio::sync::RwLock::new(std::collections::VecDeque::new()),
            max_history,
        }
    }

    /// Publie un événement
    pub async fn publish(&self, event: TemporalEvent) {
        // Ajouter à l'historique
        {
            let mut history = self.history.write().await;
            history.push_back(event.clone());
            while history.len() > self.max_history {
                history.pop_front();
            }
        }

        // Notifier les subscribers
        let subscribers = self.subscribers.read().await;
        for subscriber in subscribers.iter() {
            // Filtrer par type si nécessaire
            if let Some(filter) = &subscriber.filter {
                let matches = filter.iter().any(|t| {
                    std::mem::discriminant(t) == std::mem::discriminant(&event.event_type)
                });
                if !matches {
                    continue;
                }
            }

            (subscriber.callback)(&event);
        }
    }

    /// S'abonne aux événements
    pub async fn subscribe<F>(&self, id: &str, filter: Option<Vec<TemporalEventType>>, callback: F)
    where
        F: Fn(&TemporalEvent) + Send + Sync + 'static,
    {
        let mut subscribers = self.subscribers.write().await;
        subscribers.push(EventSubscriber {
            id: id.to_string(),
            filter,
            callback: Box::new(callback),
        });
    }

    /// Se désabonne
    pub async fn unsubscribe(&self, id: &str) {
        let mut subscribers = self.subscribers.write().await;
        subscribers.retain(|s| s.id != id);
    }

    /// Récupère l'historique
    pub async fn history(&self) -> Vec<TemporalEvent> {
        self.history.read().await.iter().cloned().collect()
    }

    /// Récupère les événements récents
    pub async fn recent(&self, count: usize) -> Vec<TemporalEvent> {
        let history = self.history.read().await;
        history.iter().rev().take(count).cloned().collect()
    }

    /// Filtre l'historique par type
    pub async fn by_type(&self, event_type: TemporalEventType) -> Vec<TemporalEvent> {
        let history = self.history.read().await;
        history
            .iter()
            .filter(|e| {
                std::mem::discriminant(&e.event_type) == std::mem::discriminant(&event_type)
            })
            .cloned()
            .collect()
    }

    /// Filtre par sévérité
    pub async fn by_severity(&self, min_severity: EventSeverity) -> Vec<TemporalEvent> {
        let history = self.history.read().await;
        history
            .iter()
            .filter(|e| Self::severity_value(&e.severity) >= Self::severity_value(&min_severity))
            .cloned()
            .collect()
    }

    fn severity_value(severity: &EventSeverity) -> u8 {
        match severity {
            EventSeverity::Debug => 0,
            EventSeverity::Info => 1,
            EventSeverity::Warning => 2,
            EventSeverity::Error => 3,
            EventSeverity::Critical => 4,
        }
    }
}

impl Default for TemporalEventBus {
    fn default() -> Self {
        Self::new(500)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_creation() {
        let event = TemporalEvent::new(
            TemporalEventType::EngineInitialized,
            "Engine started".to_string(),
        );
        assert_eq!(event.severity, EventSeverity::Debug);
    }

    #[tokio::test]
    async fn test_event_bus() {
        let bus = TemporalEventBus::default();

        let event = TemporalEvent::new(TemporalEventType::TaskCreated, "Task created".to_string());

        bus.publish(event).await;

        let history = bus.history().await;
        assert_eq!(history.len(), 1);
    }
}
