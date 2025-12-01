//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE — EVENT LOG
//! Journal d'événements append-only avec idempotence
//! ═══════════════════════════════════════════════════════════════════════════════

use super::types::TitanEvent;
use std::collections::HashSet;

/// Taille maximale du log en mémoire
const MAX_MEMORY_LOG_SIZE: usize = 10_000;

/// Journal d'événements
pub struct EventLog {
    /// Événements en mémoire (LRU-like)
    events: Vec<TitanEvent>,
    /// Index des IDs pour idempotence rapide
    event_ids: HashSet<String>,
    /// Compteur total
    total_events: u64,
}

impl EventLog {
    pub fn new() -> Self {
        Self {
            events: Vec::with_capacity(1000),
            event_ids: HashSet::new(),
            total_events: 0,
        }
    }

    /// Ajouter un événement au log
    pub fn append(&mut self, event: TitanEvent) {
        // Éviter les doublons
        if self.event_ids.contains(&event.id) {
            return;
        }

        // Rotation si trop d'événements
        if self.events.len() >= MAX_MEMORY_LOG_SIZE {
            // Supprimer les 10% les plus anciens
            let to_remove = MAX_MEMORY_LOG_SIZE / 10;
            for e in self.events.drain(0..to_remove) {
                self.event_ids.remove(&e.id);
            }
        }

        self.event_ids.insert(event.id.clone());
        self.events.push(event);
        self.total_events += 1;
    }

    /// Vérifier si un événement existe (idempotence)
    pub fn has_event(&self, event_id: &str) -> bool {
        self.event_ids.contains(event_id)
    }

    /// Obtenir les événements depuis un timestamp
    pub fn events_since(&self, timestamp: u64) -> Vec<&TitanEvent> {
        self.events
            .iter()
            .filter(|e| e.timestamp > timestamp)
            .collect()
    }

    /// Obtenir les N derniers événements
    pub fn last_events(&self, count: usize) -> Vec<&TitanEvent> {
        let start = self.events.len().saturating_sub(count);
        self.events[start..].iter().collect()
    }

    /// Obtenir le nombre total d'événements
    pub fn total_count(&self) -> u64 {
        self.total_events
    }

    /// Obtenir le nombre d'événements en mémoire
    pub fn memory_count(&self) -> usize {
        self.events.len()
    }

    /// Vider le log en mémoire
    pub fn clear(&mut self) {
        self.events.clear();
        self.event_ids.clear();
    }

    /// Charger des événements existants (pour recovery)
    pub fn load_events(&mut self, events: Vec<TitanEvent>) {
        for event in events {
            if !self.event_ids.contains(&event.id) {
                self.event_ids.insert(event.id.clone());
                self.events.push(event);
            }
        }
    }
}

impl Default for EventLog {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_event_log_append() {
        let mut log = EventLog::new();

        let event = TitanEvent::new("xp", "add", json!({ "amount": 100 }));
        let event_id = event.id.clone();

        log.append(event);

        assert_eq!(log.memory_count(), 1);
        assert!(log.has_event(&event_id));
    }

    #[test]
    fn test_event_log_idempotence() {
        let mut log = EventLog::new();

        let event = TitanEvent::new("xp", "add", json!({ "amount": 100 }));
        let event_clone = event.clone();

        log.append(event);
        log.append(event_clone);

        // Ne doit pas dupliquer
        assert_eq!(log.memory_count(), 1);
    }

    #[test]
    fn test_event_log_rotation() {
        let mut log = EventLog::new();

        // Ajouter plus que la limite
        for i in 0..15_000 {
            let event = TitanEvent::new("test", "add", json!({ "i": i }));
            log.append(event);
        }

        // Doit avoir fait rotation
        assert!(log.memory_count() <= MAX_MEMORY_LOG_SIZE);
        assert_eq!(log.total_count(), 15_000);
    }
}
