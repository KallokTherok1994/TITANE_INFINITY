// ═══════════════════════════════════════════════════════════════════
// TITANE∞ v∞ — AGENDA TYPES
// Types Rust pour le système d'agenda
// ═══════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════════

/// Catégorie d'événement
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum EventCategory {
    Work,
    Personal,
    Meeting,
    Focus,
    Break,
    Routine,
    Health,
    Creative,
    Learning,
    Social,
}

impl Default for EventCategory {
    fn default() -> Self {
        EventCategory::Work
    }
}

/// Statut d'un événement
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum EventStatus {
    Scheduled,
    InProgress,
    Completed,
    Cancelled,
    Postponed,
}

impl Default for EventStatus {
    fn default() -> Self {
        EventStatus::Scheduled
    }
}

/// Niveau de priorité
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PriorityLevel {
    Low,
    Medium,
    High,
    Urgent,
    Critical,
}

impl Default for PriorityLevel {
    fn default() -> Self {
        PriorityLevel::Medium
    }
}

/// Type de récurrence
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RecurrenceType {
    Daily,
    Weekly,
    Monthly,
    Yearly,
    Custom,
}

/// Récurrence d'événement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventRecurrence {
    /// Type de récurrence
    #[serde(rename = "type")]
    pub recurrence_type: RecurrenceType,
    /// Intervalle (ex: tous les 2 jours)
    pub interval: u32,
    /// Jours de la semaine (pour récurrence hebdomadaire)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub days_of_week: Option<Vec<u8>>,
    /// Date de fin de récurrence
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end_date: Option<String>,
    /// Nombre d'occurrences
    #[serde(skip_serializing_if = "Option::is_none")]
    pub occurrences: Option<u32>,
}

/// Type de rappel
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ReminderType {
    Notification,
    Sound,
    Email,
}

/// Rappel d'événement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventReminder {
    /// Minutes avant l'événement
    pub minutes_before: u32,
    /// Type de rappel
    #[serde(rename = "type")]
    pub reminder_type: ReminderType,
    /// Activé
    pub enabled: bool,
}

/// Événement de l'agenda
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgendaEvent {
    /// Identifiant unique
    pub id: String,
    /// Titre de l'événement
    pub title: String,
    /// Description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Date/heure de début (ISO string)
    pub start_date_time: String,
    /// Date/heure de fin (ISO string)
    pub end_date_time: String,
    /// Événement sur toute la journée
    #[serde(default)]
    pub all_day: bool,
    /// Catégorie
    #[serde(default)]
    pub category: EventCategory,
    /// Statut
    #[serde(default)]
    pub status: EventStatus,
    /// Niveau de priorité
    #[serde(default)]
    pub priority: PriorityLevel,
    /// Score de priorité calculé (0-100)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub priority_score: Option<u8>,
    /// Niveau d'énergie requis (0.0-1.0)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub energy_required: Option<f32>,
    /// Tags
    #[serde(default)]
    pub tags: Vec<String>,
    /// Récurrence
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recurrence: Option<EventRecurrence>,
    /// Rappels
    #[serde(default)]
    pub reminders: Vec<EventReminder>,
    /// Couleur personnalisée
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    /// Localisation
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
    /// Notes additionnelles
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    /// Lié à un projet TITANE
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project_id: Option<String>,
    /// Timestamp création
    pub created_at: u64,
    /// Timestamp dernière modification
    pub updated_at: u64,
}

impl AgendaEvent {
    /// Crée un nouvel événement avec les valeurs minimales
    pub fn new(id: String, title: String, start: String, end: String) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_else(|_| std::time::Duration::from_secs(0))
            .as_millis() as u64;

        Self {
            id,
            title,
            description: None,
            start_date_time: start,
            end_date_time: end,
            all_day: false,
            category: EventCategory::default(),
            status: EventStatus::default(),
            priority: PriorityLevel::default(),
            priority_score: None,
            energy_required: None,
            tags: Vec::new(),
            recurrence: None,
            reminders: Vec::new(),
            color: None,
            location: None,
            notes: None,
            project_id: None,
            created_at: now,
            updated_at: now,
        }
    }

    /// Met à jour le timestamp de modification
    pub fn touch(&mut self) {
        self.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_else(|_| std::time::Duration::from_secs(0))
            .as_millis() as u64;
    }
}

// ═══════════════════════════════════════════════════════════════════
// STORAGE TYPES
// ═══════════════════════════════════════════════════════════════════

/// Structure de stockage des événements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgendaStorage {
    /// Version du format de stockage
    pub version: String,
    /// Timestamp dernière mise à jour
    pub last_update: u64,
    /// Liste des événements
    pub events: Vec<AgendaEvent>,
}

impl Default for AgendaStorage {
    fn default() -> Self {
        Self {
            version: "1.0.0".to_string(),
            last_update: 0,
            events: Vec::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// INPUT TYPES (pour les commandes Tauri)
// ═══════════════════════════════════════════════════════════════════

/// Input pour créer un événement
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEventInput {
    pub title: String,
    #[serde(default)]
    pub description: Option<String>,
    pub start_date_time: String,
    pub end_date_time: String,
    #[serde(default)]
    pub all_day: Option<bool>,
    #[serde(default)]
    pub category: Option<EventCategory>,
    #[serde(default)]
    pub priority: Option<PriorityLevel>,
    #[serde(default)]
    pub color: Option<String>,
    #[serde(default)]
    pub location: Option<String>,
    #[serde(default)]
    pub recurrence: Option<EventRecurrence>,
    #[serde(default)]
    pub reminders: Option<Vec<EventReminder>>,
    #[serde(default)]
    pub tags: Option<Vec<String>>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub project_id: Option<String>,
}

/// Input pour mettre à jour un événement
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEventInput {
    pub event_id: String,
    #[serde(default)]
    pub title: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub start_date_time: Option<String>,
    #[serde(default)]
    pub end_date_time: Option<String>,
    #[serde(default)]
    pub all_day: Option<bool>,
    #[serde(default)]
    pub category: Option<EventCategory>,
    #[serde(default)]
    pub status: Option<EventStatus>,
    #[serde(default)]
    pub priority: Option<PriorityLevel>,
    #[serde(default)]
    pub color: Option<String>,
    #[serde(default)]
    pub location: Option<String>,
    #[serde(default)]
    pub recurrence: Option<EventRecurrence>,
    #[serde(default)]
    pub reminders: Option<Vec<EventReminder>>,
    #[serde(default)]
    pub tags: Option<Vec<String>>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub project_id: Option<String>,
}

/// Input pour déplacer un événement
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MoveEventInput {
    pub event_id: String,
    pub new_start_date_time: String,
    pub new_end_date_time: String,
}

/// Input pour supprimer un événement
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteEventInput {
    pub event_id: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // EventCategory Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_event_category_default() {
        let category = EventCategory::default();
        assert_eq!(category, EventCategory::Work);
    }

    #[test]
    fn test_event_category_equality() {
        assert_eq!(EventCategory::Work, EventCategory::Work);
        assert_ne!(EventCategory::Work, EventCategory::Personal);
    }

    #[test]
    fn test_event_category_clone() {
        let category = EventCategory::Creative;
        let cloned = category.clone();
        assert_eq!(cloned, EventCategory::Creative);
    }

    #[test]
    fn test_event_category_debug() {
        let category = EventCategory::Learning;
        let debug_str = format!("{:?}", category);
        assert!(debug_str.contains("Learning"));
    }

    #[test]
    fn test_event_category_serialization() {
        let category = EventCategory::Meeting;
        let json =
            serde_json::to_string(&category).expect("EventCategory should serialize to JSON");
        assert_eq!(json, "\"meeting\"");
    }

    #[test]
    fn test_event_category_deserialization() {
        let json = "\"focus\"";
        let category: EventCategory =
            serde_json::from_str(json).expect("EventCategory should deserialize from JSON");
        assert_eq!(category, EventCategory::Focus);
    }

    #[test]
    fn test_event_category_all_variants() {
        let categories = vec![
            EventCategory::Work,
            EventCategory::Personal,
            EventCategory::Meeting,
            EventCategory::Focus,
            EventCategory::Break,
            EventCategory::Routine,
            EventCategory::Health,
            EventCategory::Creative,
            EventCategory::Learning,
            EventCategory::Social,
        ];
        assert_eq!(categories.len(), 10);
    }

    // ─────────────────────────────────────────────────────────────
    // EventStatus Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_event_status_default() {
        let status = EventStatus::default();
        assert_eq!(status, EventStatus::Scheduled);
    }

    #[test]
    fn test_event_status_equality() {
        assert_eq!(EventStatus::Completed, EventStatus::Completed);
        assert_ne!(EventStatus::Scheduled, EventStatus::Cancelled);
    }

    #[test]
    fn test_event_status_serialization() {
        let status = EventStatus::InProgress;
        let json = serde_json::to_string(&status).expect("EventStatus should serialize to JSON");
        assert_eq!(json, "\"in_progress\"");
    }

    #[test]
    fn test_event_status_deserialization() {
        let json = "\"postponed\"";
        let status: EventStatus =
            serde_json::from_str(json).expect("EventStatus should deserialize from JSON");
        assert_eq!(status, EventStatus::Postponed);
    }

    #[test]
    fn test_event_status_all_variants() {
        let statuses = [
            EventStatus::Scheduled,
            EventStatus::InProgress,
            EventStatus::Completed,
            EventStatus::Cancelled,
            EventStatus::Postponed,
        ];
        assert_eq!(statuses.len(), 5);
    }

    // ─────────────────────────────────────────────────────────────
    // PriorityLevel Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_priority_level_default() {
        let priority = PriorityLevel::default();
        assert_eq!(priority, PriorityLevel::Medium);
    }

    #[test]
    fn test_priority_level_equality() {
        assert_eq!(PriorityLevel::High, PriorityLevel::High);
        assert_ne!(PriorityLevel::Low, PriorityLevel::Urgent);
    }

    #[test]
    fn test_priority_level_serialization() {
        let priority = PriorityLevel::Critical;
        let json =
            serde_json::to_string(&priority).expect("PriorityLevel should serialize to JSON");
        assert_eq!(json, "\"critical\"");
    }

    #[test]
    fn test_priority_level_deserialization() {
        let json = "\"urgent\"";
        let priority: PriorityLevel =
            serde_json::from_str(json).expect("PriorityLevel should deserialize from JSON");
        assert_eq!(priority, PriorityLevel::Urgent);
    }

    #[test]
    fn test_priority_level_all_variants() {
        let priorities = [
            PriorityLevel::Low,
            PriorityLevel::Medium,
            PriorityLevel::High,
            PriorityLevel::Urgent,
            PriorityLevel::Critical,
        ];
        assert_eq!(priorities.len(), 5);
    }

    // ─────────────────────────────────────────────────────────────
    // RecurrenceType Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_recurrence_type_equality() {
        assert_eq!(RecurrenceType::Daily, RecurrenceType::Daily);
        assert_ne!(RecurrenceType::Weekly, RecurrenceType::Monthly);
    }

    #[test]
    fn test_recurrence_type_serialization() {
        let recurrence = RecurrenceType::Weekly;
        let json =
            serde_json::to_string(&recurrence).expect("RecurrenceType should serialize to JSON");
        assert_eq!(json, "\"weekly\"");
    }

    #[test]
    fn test_recurrence_type_all_variants() {
        let types = [
            RecurrenceType::Daily,
            RecurrenceType::Weekly,
            RecurrenceType::Monthly,
            RecurrenceType::Yearly,
            RecurrenceType::Custom,
        ];
        assert_eq!(types.len(), 5);
    }

    // ─────────────────────────────────────────────────────────────
    // ReminderType Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_reminder_type_equality() {
        assert_eq!(ReminderType::Notification, ReminderType::Notification);
        assert_ne!(ReminderType::Sound, ReminderType::Email);
    }

    #[test]
    fn test_reminder_type_serialization() {
        let reminder = ReminderType::Email;
        let json = serde_json::to_string(&reminder).expect("ReminderType should serialize to JSON");
        assert_eq!(json, "\"email\"");
    }

    #[test]
    fn test_reminder_type_all_variants() {
        let types = [
            ReminderType::Notification,
            ReminderType::Sound,
            ReminderType::Email,
        ];
        assert_eq!(types.len(), 3);
    }

    // ─────────────────────────────────────────────────────────────
    // EventRecurrence Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_event_recurrence_creation() {
        let recurrence = EventRecurrence {
            recurrence_type: RecurrenceType::Weekly,
            interval: 1,
            days_of_week: Some(vec![1, 3, 5]),
            end_date: None,
            occurrences: Some(10),
        };
        assert_eq!(recurrence.recurrence_type, RecurrenceType::Weekly);
        assert_eq!(recurrence.interval, 1);
    }

    #[test]
    fn test_event_recurrence_clone() {
        let recurrence = EventRecurrence {
            recurrence_type: RecurrenceType::Daily,
            interval: 2,
            days_of_week: None,
            end_date: Some("2025-12-31".to_string()),
            occurrences: None,
        };
        let cloned = recurrence.clone();
        assert_eq!(cloned.interval, 2);
    }

    #[test]
    fn test_event_recurrence_serialization() {
        let recurrence = EventRecurrence {
            recurrence_type: RecurrenceType::Monthly,
            interval: 1,
            days_of_week: None,
            end_date: None,
            occurrences: None,
        };
        let json =
            serde_json::to_string(&recurrence).expect("EventRecurrence should serialize to JSON");
        assert!(json.contains("\"type\":\"monthly\""));
    }

    // ─────────────────────────────────────────────────────────────
    // EventReminder Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_event_reminder_creation() {
        let reminder = EventReminder {
            minutes_before: 15,
            reminder_type: ReminderType::Notification,
            enabled: true,
        };
        assert_eq!(reminder.minutes_before, 15);
        assert!(reminder.enabled);
    }

    #[test]
    fn test_event_reminder_clone() {
        let reminder = EventReminder {
            minutes_before: 30,
            reminder_type: ReminderType::Sound,
            enabled: false,
        };
        let cloned = reminder.clone();
        assert_eq!(cloned.minutes_before, 30);
        assert!(!cloned.enabled);
    }

    #[test]
    fn test_event_reminder_serialization() {
        let reminder = EventReminder {
            minutes_before: 60,
            reminder_type: ReminderType::Email,
            enabled: true,
        };
        let json =
            serde_json::to_string(&reminder).expect("EventReminder should serialize to JSON");
        assert!(json.contains("\"type\":\"email\""));
        assert!(json.contains("\"minutes_before\":60"));
    }

    // ─────────────────────────────────────────────────────────────
    // AgendaEvent Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_agenda_event_new() {
        let event = AgendaEvent::new(
            "event-1".to_string(),
            "Test Event".to_string(),
            "2025-12-10T10:00:00Z".to_string(),
            "2025-12-10T11:00:00Z".to_string(),
        );
        assert_eq!(event.id, "event-1");
        assert_eq!(event.title, "Test Event");
        assert!(!event.all_day);
        assert_eq!(event.category, EventCategory::Work);
        assert_eq!(event.status, EventStatus::Scheduled);
        assert_eq!(event.priority, PriorityLevel::Medium);
        assert!(event.created_at > 0);
    }

    #[test]
    fn test_agenda_event_touch() {
        let mut event = AgendaEvent::new(
            "event-2".to_string(),
            "Touch Test".to_string(),
            "2025-12-10T10:00:00Z".to_string(),
            "2025-12-10T11:00:00Z".to_string(),
        );
        let original_updated_at = event.updated_at;
        std::thread::sleep(std::time::Duration::from_millis(2));
        event.touch();
        assert!(event.updated_at >= original_updated_at);
    }

    #[test]
    fn test_agenda_event_clone() {
        let event = AgendaEvent::new(
            "event-3".to_string(),
            "Clone Test".to_string(),
            "2025-12-10T10:00:00Z".to_string(),
            "2025-12-10T11:00:00Z".to_string(),
        );
        let cloned = event.clone();
        assert_eq!(cloned.id, "event-3");
        assert_eq!(cloned.title, "Clone Test");
    }

    #[test]
    fn test_agenda_event_debug() {
        let event = AgendaEvent::new(
            "event-4".to_string(),
            "Debug Test".to_string(),
            "2025-12-10T10:00:00Z".to_string(),
            "2025-12-10T11:00:00Z".to_string(),
        );
        let debug_str = format!("{:?}", event);
        assert!(debug_str.contains("AgendaEvent"));
    }

    #[test]
    fn test_agenda_event_serialization() {
        let event = AgendaEvent::new(
            "event-5".to_string(),
            "Serialize Test".to_string(),
            "2025-12-10T10:00:00Z".to_string(),
            "2025-12-10T11:00:00Z".to_string(),
        );
        let json = serde_json::to_string(&event).expect("AgendaEvent should serialize to JSON");
        assert!(json.contains("\"id\":\"event-5\""));
        assert!(json.contains("\"title\":\"Serialize Test\""));
    }

    // ─────────────────────────────────────────────────────────────
    // AgendaStorage Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_agenda_storage_default() {
        let storage = AgendaStorage::default();
        assert_eq!(storage.version, "1.0.0");
        assert_eq!(storage.last_update, 0);
        assert!(storage.events.is_empty());
    }

    #[test]
    fn test_agenda_storage_clone() {
        let storage = AgendaStorage::default();
        let cloned = storage.clone();
        assert_eq!(cloned.version, "1.0.0");
    }

    #[test]
    fn test_agenda_storage_serialization() {
        let storage = AgendaStorage::default();
        let json = serde_json::to_string(&storage).expect("AgendaStorage should serialize to JSON");
        let restored: AgendaStorage =
            serde_json::from_str(&json).expect("AgendaStorage should deserialize from JSON");
        assert_eq!(restored.version, "1.0.0");
    }

    // ─────────────────────────────────────────────────────────────
    // CreateEventInput Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_create_event_input_deserialization() {
        let json = r#"{
            "title": "Test Event",
            "startDateTime": "2025-12-10T10:00:00Z",
            "endDateTime": "2025-12-10T11:00:00Z"
        }"#;
        let input: CreateEventInput =
            serde_json::from_str(json).expect("CreateEventInput should deserialize from JSON");
        assert_eq!(input.title, "Test Event");
        assert!(input.description.is_none());
    }

    #[test]
    fn test_create_event_input_with_optionals() {
        let json = r##"{"title": "Full Event","description": "A test event","startDateTime": "2025-12-10T10:00:00Z","endDateTime": "2025-12-10T11:00:00Z","allDay": true,"category": "meeting","priority": "high","color": "#ff0000"}"##;
        let input: CreateEventInput =
            serde_json::from_str(json).expect("CreateEventInput should deserialize from JSON");
        assert_eq!(input.title, "Full Event");
        assert_eq!(input.description, Some("A test event".to_string()));
        assert_eq!(input.all_day, Some(true));
        assert_eq!(input.category, Some(EventCategory::Meeting));
        assert_eq!(input.priority, Some(PriorityLevel::High));
    }

    // ─────────────────────────────────────────────────────────────
    // UpdateEventInput Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_update_event_input_deserialization() {
        let json = r#"{
            "eventId": "event-1",
            "title": "Updated Title"
        }"#;
        let input: UpdateEventInput =
            serde_json::from_str(json).expect("UpdateEventInput should deserialize from JSON");
        assert_eq!(input.event_id, "event-1");
        assert_eq!(input.title, Some("Updated Title".to_string()));
        assert!(input.description.is_none());
    }

    // ─────────────────────────────────────────────────────────────
    // MoveEventInput Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_move_event_input_deserialization() {
        let json = r#"{
            "eventId": "event-1",
            "newStartDateTime": "2025-12-11T10:00:00Z",
            "newEndDateTime": "2025-12-11T11:00:00Z"
        }"#;
        let input: MoveEventInput =
            serde_json::from_str(json).expect("MoveEventInput should deserialize from JSON");
        assert_eq!(input.event_id, "event-1");
        assert_eq!(input.new_start_date_time, "2025-12-11T10:00:00Z");
    }

    // ─────────────────────────────────────────────────────────────
    // DeleteEventInput Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_delete_event_input_deserialization() {
        let json = r#"{"eventId": "event-to-delete"}"#;
        let input: DeleteEventInput =
            serde_json::from_str(json).expect("DeleteEventInput should deserialize from JSON");
        assert_eq!(input.event_id, "event-to-delete");
    }
}
