// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 — TYPES: MEMORY CHAT
//   Types pour intégration Chat IA ↔ Memory Core
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Résumé de projet pour contexte chat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSummary {
    pub id: String,
    pub name: String,
    pub status: ProjectStatus,
    pub priority: i32,
    pub last_activity: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProjectStatus {
    Active,
    Paused,
    Completed,
}

/// Résumé de décision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionSummary {
    pub id: String,
    pub title: String,
    pub context: String,
    pub outcome: String,
    pub timestamp: String,
    pub impact: ImpactLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ImpactLevel {
    High,
    Medium,
    Low,
}

/// Entrée de connaissance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeEntry {
    pub id: String,
    pub topic: String,
    pub content: String,
    pub source: String,
    pub relevance: f32,
    pub timestamp: String,
}

/// Info rituel
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RitualInfo {
    pub id: String,
    pub name: String,
    pub frequency: String,
    pub last_execution: String,
    pub next_scheduled: Option<String>,
    pub impact: String,
}

/// Entrée timeline
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEntry {
    pub timestamp: String,
    pub entry_type: TimelineEntryType,
    pub content: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TimelineEntryType {
    Chat,
    Decision,
    Project,
    Ritual,
    Emotion,
}

/// Interaction chat à sauvegarder
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatInteraction {
    pub user_message: String,
    pub ai_response: String,
    pub mode: String,
    pub emotion_state: Option<EmotionState>,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionState {
    pub valence: f32,
    pub intensity: f32,
    pub energy: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // ProjectStatus Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_project_status_variants() {
        let statuses = [ProjectStatus::Active,
            ProjectStatus::Paused,
            ProjectStatus::Completed];
        assert_eq!(statuses.len(), 3);
    }

    #[test]
    fn test_project_status_clone() {
        let status = ProjectStatus::Active;
        let cloned = status.clone();
        assert!(matches!(cloned, ProjectStatus::Active));
    }

    #[test]
    fn test_project_status_debug() {
        let status = ProjectStatus::Paused;
        let debug_str = format!("{:?}", status);
        assert!(debug_str.contains("Paused"));
    }

    #[test]
    fn test_project_status_serialization_lowercase() {
        let status = ProjectStatus::Active;
        let json = serde_json::to_string(&status)
            .expect("ProjectStatus should serialize to JSON");
        assert_eq!(json, "\"active\"");

        let status = ProjectStatus::Completed;
        let json = serde_json::to_string(&status)
            .expect("ProjectStatus should serialize to JSON");
        assert_eq!(json, "\"completed\"");
    }

    #[test]
    fn test_project_status_deserialization() {
        let restored: ProjectStatus = serde_json::from_str("\"paused\"")
            .expect("ProjectStatus should deserialize from JSON");
        assert!(matches!(restored, ProjectStatus::Paused));
    }

    // ─────────────────────────────────────────────────────────────
    // ProjectSummary Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_project_summary_creation() {
        let summary = ProjectSummary {
            id: "proj-001".to_string(),
            name: "Test Project".to_string(),
            status: ProjectStatus::Active,
            priority: 5,
            last_activity: "2024-01-15".to_string(),
            tags: vec!["rust".to_string(), "test".to_string()],
        };
        assert_eq!(summary.id, "proj-001");
        assert_eq!(summary.priority, 5);
        assert_eq!(summary.tags.len(), 2);
    }

    #[test]
    fn test_project_summary_clone() {
        let summary = ProjectSummary {
            id: "id".to_string(),
            name: "name".to_string(),
            status: ProjectStatus::Paused,
            priority: 3,
            last_activity: "date".to_string(),
            tags: vec!["tag".to_string()],
        };
        let cloned = summary.clone();
        assert_eq!(cloned.priority, 3);
        assert!(matches!(cloned.status, ProjectStatus::Paused));
    }

    #[test]
    fn test_project_summary_debug() {
        let summary = ProjectSummary {
            id: "x".to_string(),
            name: "".to_string(),
            status: ProjectStatus::Completed,
            priority: 0,
            last_activity: "".to_string(),
            tags: vec![],
        };
        let debug_str = format!("{:?}", summary);
        assert!(debug_str.contains("ProjectSummary"));
    }

    #[test]
    fn test_project_summary_serialization() {
        let summary = ProjectSummary {
            id: "test-proj".to_string(),
            name: "Project Name".to_string(),
            status: ProjectStatus::Active,
            priority: 10,
            last_activity: "2024-01-20".to_string(),
            tags: vec!["important".to_string()],
        };
        let json = serde_json::to_string(&summary)
            .expect("ProjectSummary should serialize to JSON");
        let restored: ProjectSummary = serde_json::from_str(&json)
            .expect("ProjectSummary should deserialize from JSON");
        assert_eq!(restored.id, "test-proj");
        assert_eq!(restored.priority, 10);
    }

    // ─────────────────────────────────────────────────────────────
    // ImpactLevel Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_impact_level_variants() {
        let levels = [ImpactLevel::High, ImpactLevel::Medium, ImpactLevel::Low];
        assert_eq!(levels.len(), 3);
    }

    #[test]
    fn test_impact_level_clone() {
        let level = ImpactLevel::High;
        let cloned = level.clone();
        assert!(matches!(cloned, ImpactLevel::High));
    }

    #[test]
    fn test_impact_level_debug() {
        let level = ImpactLevel::Medium;
        let debug_str = format!("{:?}", level);
        assert!(debug_str.contains("Medium"));
    }

    #[test]
    fn test_impact_level_serialization_lowercase() {
        let level = ImpactLevel::High;
        let json = serde_json::to_string(&level)
            .expect("ImpactLevel should serialize to JSON");
        assert_eq!(json, "\"high\"");

        let level = ImpactLevel::Low;
        let json = serde_json::to_string(&level)
            .expect("ImpactLevel should serialize to JSON");
        assert_eq!(json, "\"low\"");
    }

    // ─────────────────────────────────────────────────────────────
    // DecisionSummary Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_decision_summary_creation() {
        let decision = DecisionSummary {
            id: "dec-001".to_string(),
            title: "Important Decision".to_string(),
            context: "Given the circumstances".to_string(),
            outcome: "Approved".to_string(),
            timestamp: "2024-01-15T10:00:00Z".to_string(),
            impact: ImpactLevel::High,
        };
        assert_eq!(decision.id, "dec-001");
        assert_eq!(decision.title, "Important Decision");
    }

    #[test]
    fn test_decision_summary_clone() {
        let decision = DecisionSummary {
            id: "id".to_string(),
            title: "title".to_string(),
            context: "ctx".to_string(),
            outcome: "out".to_string(),
            timestamp: "ts".to_string(),
            impact: ImpactLevel::Medium,
        };
        let cloned = decision.clone();
        assert_eq!(cloned.id, "id");
        assert!(matches!(cloned.impact, ImpactLevel::Medium));
    }

    #[test]
    fn test_decision_summary_debug() {
        let decision = DecisionSummary {
            id: "x".to_string(),
            title: "".to_string(),
            context: "".to_string(),
            outcome: "".to_string(),
            timestamp: "".to_string(),
            impact: ImpactLevel::Low,
        };
        let debug_str = format!("{:?}", decision);
        assert!(debug_str.contains("DecisionSummary"));
    }

    #[test]
    fn test_decision_summary_serialization() {
        let decision = DecisionSummary {
            id: "dec-test".to_string(),
            title: "Test Decision".to_string(),
            context: "Context here".to_string(),
            outcome: "Success".to_string(),
            timestamp: "2024-01-01".to_string(),
            impact: ImpactLevel::High,
        };
        let json = serde_json::to_string(&decision)
            .expect("DecisionSummary should serialize to JSON");
        let restored: DecisionSummary = serde_json::from_str(&json)
            .expect("DecisionSummary should deserialize from JSON");
        assert_eq!(restored.id, "dec-test");
        assert_eq!(restored.outcome, "Success");
    }

    // ─────────────────────────────────────────────────────────────
    // KnowledgeEntry Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_knowledge_entry_creation() {
        let entry = KnowledgeEntry {
            id: "know-001".to_string(),
            topic: "Rust Programming".to_string(),
            content: "Rust is a systems language".to_string(),
            source: "documentation".to_string(),
            relevance: 0.95,
            timestamp: "2024-01-15".to_string(),
        };
        assert_eq!(entry.id, "know-001");
        assert_eq!(entry.relevance, 0.95);
    }

    #[test]
    fn test_knowledge_entry_clone() {
        let entry = KnowledgeEntry {
            id: "id".to_string(),
            topic: "topic".to_string(),
            content: "content".to_string(),
            source: "source".to_string(),
            relevance: 0.5,
            timestamp: "ts".to_string(),
        };
        let cloned = entry.clone();
        assert_eq!(cloned.relevance, 0.5);
    }

    #[test]
    fn test_knowledge_entry_debug() {
        let entry = KnowledgeEntry {
            id: "x".to_string(),
            topic: "".to_string(),
            content: "".to_string(),
            source: "".to_string(),
            relevance: 0.0,
            timestamp: "".to_string(),
        };
        let debug_str = format!("{:?}", entry);
        assert!(debug_str.contains("KnowledgeEntry"));
    }

    #[test]
    fn test_knowledge_entry_serialization() {
        let entry = KnowledgeEntry {
            id: "k-test".to_string(),
            topic: "Testing".to_string(),
            content: "Test content".to_string(),
            source: "unit test".to_string(),
            relevance: 0.8,
            timestamp: "2024-01-20".to_string(),
        };
        let json = serde_json::to_string(&entry)
            .expect("KnowledgeEntry should serialize to JSON");
        let restored: KnowledgeEntry = serde_json::from_str(&json)
            .expect("KnowledgeEntry should deserialize from JSON");
        assert_eq!(restored.id, "k-test");
        assert_eq!(restored.relevance, 0.8);
    }

    // ─────────────────────────────────────────────────────────────
    // RitualInfo Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_ritual_info_creation() {
        let ritual = RitualInfo {
            id: "rit-001".to_string(),
            name: "Morning Review".to_string(),
            frequency: "daily".to_string(),
            last_execution: "2024-01-15T08:00:00Z".to_string(),
            next_scheduled: Some("2024-01-16T08:00:00Z".to_string()),
            impact: "Improves focus".to_string(),
        };
        assert_eq!(ritual.id, "rit-001");
        assert!(ritual.next_scheduled.is_some());
    }

    #[test]
    fn test_ritual_info_no_schedule() {
        let ritual = RitualInfo {
            id: "rit-002".to_string(),
            name: "Ad-hoc ritual".to_string(),
            frequency: "manual".to_string(),
            last_execution: "2024-01-10".to_string(),
            next_scheduled: None,
            impact: "Variable".to_string(),
        };
        assert!(ritual.next_scheduled.is_none());
    }

    #[test]
    fn test_ritual_info_clone() {
        let ritual = RitualInfo {
            id: "id".to_string(),
            name: "name".to_string(),
            frequency: "weekly".to_string(),
            last_execution: "date".to_string(),
            next_scheduled: Some("next".to_string()),
            impact: "impact".to_string(),
        };
        let cloned = ritual.clone();
        assert_eq!(cloned.frequency, "weekly");
    }

    #[test]
    fn test_ritual_info_debug() {
        let ritual = RitualInfo {
            id: "x".to_string(),
            name: "".to_string(),
            frequency: "".to_string(),
            last_execution: "".to_string(),
            next_scheduled: None,
            impact: "".to_string(),
        };
        let debug_str = format!("{:?}", ritual);
        assert!(debug_str.contains("RitualInfo"));
    }

    #[test]
    fn test_ritual_info_serialization() {
        let ritual = RitualInfo {
            id: "r-test".to_string(),
            name: "Test Ritual".to_string(),
            frequency: "monthly".to_string(),
            last_execution: "2024-01-01".to_string(),
            next_scheduled: Some("2024-02-01".to_string()),
            impact: "High".to_string(),
        };
        let json = serde_json::to_string(&ritual)
            .expect("RitualInfo should serialize to JSON");
        let restored: RitualInfo = serde_json::from_str(&json)
            .expect("RitualInfo should deserialize from JSON");
        assert_eq!(restored.id, "r-test");
        assert_eq!(restored.frequency, "monthly");
    }

    // ─────────────────────────────────────────────────────────────
    // TimelineEntryType Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_timeline_entry_type_variants() {
        let types = [TimelineEntryType::Chat,
            TimelineEntryType::Decision,
            TimelineEntryType::Project,
            TimelineEntryType::Ritual,
            TimelineEntryType::Emotion];
        assert_eq!(types.len(), 5);
    }

    #[test]
    fn test_timeline_entry_type_clone() {
        let entry_type = TimelineEntryType::Decision;
        let cloned = entry_type.clone();
        assert!(matches!(cloned, TimelineEntryType::Decision));
    }

    #[test]
    fn test_timeline_entry_type_debug() {
        let entry_type = TimelineEntryType::Emotion;
        let debug_str = format!("{:?}", entry_type);
        assert!(debug_str.contains("Emotion"));
    }

    #[test]
    fn test_timeline_entry_type_serialization_lowercase() {
        let entry_type = TimelineEntryType::Chat;
        let json = serde_json::to_string(&entry_type)
            .expect("TimelineEntryType should serialize to JSON");
        assert_eq!(json, "\"chat\"");

        let entry_type = TimelineEntryType::Project;
        let json = serde_json::to_string(&entry_type)
            .expect("TimelineEntryType should serialize to JSON");
        assert_eq!(json, "\"project\"");
    }

    // ─────────────────────────────────────────────────────────────
    // TimelineEntry Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_timeline_entry_creation() {
        let entry = TimelineEntry {
            timestamp: "2024-01-15T10:00:00Z".to_string(),
            entry_type: TimelineEntryType::Chat,
            content: "User conversation".to_string(),
            metadata: None,
        };
        assert_eq!(entry.content, "User conversation");
        assert!(entry.metadata.is_none());
    }

    #[test]
    fn test_timeline_entry_with_metadata() {
        let entry = TimelineEntry {
            timestamp: "2024-01-15T10:00:00Z".to_string(),
            entry_type: TimelineEntryType::Decision,
            content: "Made a decision".to_string(),
            metadata: Some(serde_json::json!({"key": "value", "count": 42})),
        };
        assert!(entry.metadata.is_some());
        let meta = entry.metadata.expect("metadata should exist");
        assert_eq!(meta["key"], "value");
        assert_eq!(meta["count"], 42);
    }

    #[test]
    fn test_timeline_entry_clone() {
        let entry = TimelineEntry {
            timestamp: "ts".to_string(),
            entry_type: TimelineEntryType::Ritual,
            content: "content".to_string(),
            metadata: Some(serde_json::json!({"test": true})),
        };
        let cloned = entry.clone();
        assert!(matches!(cloned.entry_type, TimelineEntryType::Ritual));
        assert!(cloned.metadata.is_some());
    }

    #[test]
    fn test_timeline_entry_debug() {
        let entry = TimelineEntry {
            timestamp: "".to_string(),
            entry_type: TimelineEntryType::Project,
            content: "".to_string(),
            metadata: None,
        };
        let debug_str = format!("{:?}", entry);
        assert!(debug_str.contains("TimelineEntry"));
    }

    #[test]
    fn test_timeline_entry_serialization() {
        let entry = TimelineEntry {
            timestamp: "2024-01-20".to_string(),
            entry_type: TimelineEntryType::Emotion,
            content: "Feeling good".to_string(),
            metadata: Some(serde_json::json!({"mood": "happy"})),
        };
        let json = serde_json::to_string(&entry)
            .expect("TimelineEntry should serialize to JSON");
        let restored: TimelineEntry = serde_json::from_str(&json)
            .expect("TimelineEntry should deserialize from JSON");
        assert_eq!(restored.content, "Feeling good");
    }

    // ─────────────────────────────────────────────────────────────
    // EmotionState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_emotion_state_creation() {
        let emotion = EmotionState {
            valence: 0.8,
            intensity: 0.6,
            energy: 0.7,
        };
        assert_eq!(emotion.valence, 0.8);
        assert_eq!(emotion.intensity, 0.6);
        assert_eq!(emotion.energy, 0.7);
    }

    #[test]
    fn test_emotion_state_negative_valence() {
        let emotion = EmotionState {
            valence: -0.5,
            intensity: 0.9,
            energy: 0.3,
        };
        assert!(emotion.valence < 0.0);
    }

    #[test]
    fn test_emotion_state_clone() {
        let emotion = EmotionState {
            valence: 0.5,
            intensity: 0.5,
            energy: 0.5,
        };
        let cloned = emotion.clone();
        assert_eq!(cloned.valence, 0.5);
    }

    #[test]
    fn test_emotion_state_debug() {
        let emotion = EmotionState {
            valence: 0.0,
            intensity: 0.0,
            energy: 0.0,
        };
        let debug_str = format!("{:?}", emotion);
        assert!(debug_str.contains("EmotionState"));
    }

    #[test]
    fn test_emotion_state_serialization() {
        let emotion = EmotionState {
            valence: 0.75,
            intensity: 0.85,
            energy: 0.65,
        };
        let json = serde_json::to_string(&emotion)
            .expect("EmotionState should serialize to JSON");
        let restored: EmotionState = serde_json::from_str(&json)
            .expect("EmotionState should deserialize from JSON");
        assert_eq!(restored.valence, 0.75);
        assert_eq!(restored.energy, 0.65);
    }

    // ─────────────────────────────────────────────────────────────
    // ChatInteraction Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_chat_interaction_creation() {
        let interaction = ChatInteraction {
            user_message: "Hello".to_string(),
            ai_response: "Hi there!".to_string(),
            mode: "normal".to_string(),
            emotion_state: None,
            timestamp: "2024-01-15T10:00:00Z".to_string(),
        };
        assert_eq!(interaction.user_message, "Hello");
        assert!(interaction.emotion_state.is_none());
    }

    #[test]
    fn test_chat_interaction_with_emotion() {
        let interaction = ChatInteraction {
            user_message: "How are you?".to_string(),
            ai_response: "I'm doing well!".to_string(),
            mode: "friendly".to_string(),
            emotion_state: Some(EmotionState {
                valence: 0.9,
                intensity: 0.7,
                energy: 0.8,
            }),
            timestamp: "2024-01-15T10:05:00Z".to_string(),
        };
        assert!(interaction.emotion_state.is_some());
        let emotion = interaction
            .emotion_state
            .expect("emotion_state should exist");
        assert_eq!(emotion.valence, 0.9);
    }

    #[test]
    fn test_chat_interaction_clone() {
        let interaction = ChatInteraction {
            user_message: "msg".to_string(),
            ai_response: "resp".to_string(),
            mode: "mode".to_string(),
            emotion_state: Some(EmotionState {
                valence: 0.5,
                intensity: 0.5,
                energy: 0.5,
            }),
            timestamp: "ts".to_string(),
        };
        let cloned = interaction.clone();
        assert_eq!(cloned.mode, "mode");
        assert!(cloned.emotion_state.is_some());
    }

    #[test]
    fn test_chat_interaction_debug() {
        let interaction = ChatInteraction {
            user_message: "".to_string(),
            ai_response: "".to_string(),
            mode: "".to_string(),
            emotion_state: None,
            timestamp: "".to_string(),
        };
        let debug_str = format!("{:?}", interaction);
        assert!(debug_str.contains("ChatInteraction"));
    }

    #[test]
    fn test_chat_interaction_serialization() {
        let interaction = ChatInteraction {
            user_message: "Test message".to_string(),
            ai_response: "Test response".to_string(),
            mode: "test".to_string(),
            emotion_state: Some(EmotionState {
                valence: 0.6,
                intensity: 0.4,
                energy: 0.5,
            }),
            timestamp: "2024-01-20".to_string(),
        };
        let json = serde_json::to_string(&interaction)
            .expect("ChatInteraction should serialize to JSON");
        let restored: ChatInteraction = serde_json::from_str(&json)
            .expect("ChatInteraction should deserialize from JSON");
        assert_eq!(restored.user_message, "Test message");
        assert!(restored.emotion_state.is_some());
    }

    #[test]
    fn test_chat_interaction_serialization_no_emotion() {
        let interaction = ChatInteraction {
            user_message: "Test".to_string(),
            ai_response: "Response".to_string(),
            mode: "normal".to_string(),
            emotion_state: None,
            timestamp: "2024-01-20".to_string(),
        };
        let json = serde_json::to_string(&interaction)
            .expect("ChatInteraction should serialize to JSON");
        let restored: ChatInteraction = serde_json::from_str(&json)
            .expect("ChatInteraction should deserialize from JSON");
        assert!(restored.emotion_state.is_none());
    }
}
