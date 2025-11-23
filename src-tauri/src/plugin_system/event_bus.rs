use tokio::sync::RwLock;
use std::sync::Arc;
use std::collections::HashMap;

/// Event bus simple pour communication inter-cores
pub struct EventBus {
    subscribers: Arc<RwLock<HashMap<String, Vec<EventCallback>>>>,
}

type EventCallback = Arc<dyn Fn(CoreEvent) + Send + Sync>;

impl EventBus {
    pub fn new() -> Self {
        Self {
            subscribers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Émet un événement vers tous les subscribers
    pub async fn emit(&self, event: CoreEvent) {
        let subscribers = self.subscribers.read().await;
        let event_type = event.event_type();

        if let Some(callbacks) = subscribers.get(&event_type) {
            for callback in callbacks {
                callback(event.clone());
            }
        }
    }

    /// Subscribe à un type d'événement
    pub async fn subscribe<F>(&self, event_type: String, callback: F)
    where
        F: Fn(CoreEvent) + Send + Sync + 'static,
    {
        let mut subscribers = self.subscribers.write().await;
        subscribers
            .entry(event_type)
            .or_insert_with(Vec::new)
            .push(Arc::new(callback));
    }
}

impl Default for EventBus {
    fn default() -> Self {
        Self::new()
    }
}

/// Événements du système de cores
#[derive(Debug, Clone)]
pub enum CoreEvent {
    Registered { name: String },
    Unregistered { name: String },
    Initialized { name: String },
    Shutdown { name: String },
    Reconfigured { name: String },
    HealthChanged { name: String, status: crate::plugin_system::HealthStatus },
    Error { name: String, error: String },
}

impl CoreEvent {
    pub fn event_type(&self) -> String {
        match self {
            CoreEvent::Registered { .. } => "core.registered".into(),
            CoreEvent::Unregistered { .. } => "core.unregistered".into(),
            CoreEvent::Initialized { .. } => "core.initialized".into(),
            CoreEvent::Shutdown { .. } => "core.shutdown".into(),
            CoreEvent::Reconfigured { .. } => "core.reconfigured".into(),
            CoreEvent::HealthChanged { .. } => "core.health_changed".into(),
            CoreEvent::Error { .. } => "core.error".into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_event_bus_emit() {
        let bus = EventBus::new();
        let received = Arc::new(RwLock::new(Vec::new()));

        let received_clone = received.clone();
        bus.subscribe("core.registered".into(), move |event| {
            let received = received_clone.clone();
            tokio::spawn(async move {
                received.write().await.push(event);
            });
        })
        .await;

        bus.emit(CoreEvent::Registered {
            name: "test".into(),
        })
        .await;

        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

        let events = received.read().await;
        assert_eq!(events.len(), 1);
    }
}
