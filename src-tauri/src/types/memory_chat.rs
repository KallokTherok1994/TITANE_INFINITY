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
