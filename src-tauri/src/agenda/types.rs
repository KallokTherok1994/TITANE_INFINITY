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
            .unwrap()
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
            .unwrap()
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
