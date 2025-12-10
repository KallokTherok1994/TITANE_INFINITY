// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — COMPAT: ExpFusion stub
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpFusionEngine;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GlobalExpState {
    pub total_exp: u64,
    pub level: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExpSource {
    Code,
    Learning,
    Creation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpEvent {
    pub source: ExpSource,
    pub amount: u64,
}

pub mod timeline {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize, Default)]
    pub struct TimelineEntry {
        pub timestamp: u64,
        pub event: String,
    }

    #[derive(Debug, Clone, Serialize, Deserialize, Default)]
    pub struct TimelineStats {
        pub total_events: u64,
    }
}

pub mod categories {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize, Default)]
    pub struct CategoryState {
        pub name: String,
        pub weight: f32,
    }
}

pub mod projects {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize, Default)]
    pub struct ProjectState {
        pub name: String,
        pub progress: f32,
    }

    #[derive(Debug, Clone, Serialize, Deserialize, Default)]
    pub struct ProjectStats {
        pub total_projects: u32,
    }
}

pub mod talents {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize, Default)]
    pub struct TalentTreeState {
        pub talents: Vec<String>,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::timeline::{TimelineEntry, TimelineStats};
    use super::categories::CategoryState;
    use super::projects::{ProjectState, ProjectStats};
    use super::talents::TalentTreeState;

    // ─────────────────────────────────────────────────────────────
    // ExpSource Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_exp_source_variants() {
        let sources = vec![ExpSource::Code, ExpSource::Learning, ExpSource::Creation];
        assert_eq!(sources.len(), 3);
    }

    #[test]
    fn test_exp_source_clone() {
        let source = ExpSource::Code;
        let cloned = source.clone();
        assert!(matches!(cloned, ExpSource::Code));
    }

    #[test]
    fn test_exp_source_debug() {
        let source = ExpSource::Learning;
        let debug_str = format!("{:?}", source);
        assert!(debug_str.contains("Learning"));
    }

    #[test]
    fn test_exp_source_serialization() {
        let source = ExpSource::Creation;
        let json = serde_json::to_string(&source).unwrap();
        let restored: ExpSource = serde_json::from_str(&json).unwrap();
        assert!(matches!(restored, ExpSource::Creation));
    }

    // ─────────────────────────────────────────────────────────────
    // GlobalExpState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_global_exp_state_default() {
        let state = GlobalExpState::default();
        assert_eq!(state.total_exp, 0);
        assert_eq!(state.level, 0);
    }

    #[test]
    fn test_global_exp_state_creation() {
        let state = GlobalExpState {
            total_exp: 10000,
            level: 15,
        };
        assert_eq!(state.total_exp, 10000);
        assert_eq!(state.level, 15);
    }

    #[test]
    fn test_global_exp_state_clone() {
        let state = GlobalExpState {
            total_exp: 500,
            level: 5,
        };
        let cloned = state.clone();
        assert_eq!(cloned.total_exp, 500);
    }

    #[test]
    fn test_global_exp_state_serialization() {
        let state = GlobalExpState {
            total_exp: 25000,
            level: 25,
        };
        let json = serde_json::to_string(&state).unwrap();
        let restored: GlobalExpState = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.total_exp, 25000);
        assert_eq!(restored.level, 25);
    }

    // ─────────────────────────────────────────────────────────────
    // ExpEvent Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_exp_event_creation() {
        let event = ExpEvent {
            source: ExpSource::Code,
            amount: 100,
        };
        assert_eq!(event.amount, 100);
        assert!(matches!(event.source, ExpSource::Code));
    }

    #[test]
    fn test_exp_event_clone() {
        let event = ExpEvent {
            source: ExpSource::Learning,
            amount: 50,
        };
        let cloned = event.clone();
        assert_eq!(cloned.amount, 50);
    }

    #[test]
    fn test_exp_event_serialization() {
        let event = ExpEvent {
            source: ExpSource::Creation,
            amount: 200,
        };
        let json = serde_json::to_string(&event).unwrap();
        let restored: ExpEvent = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.amount, 200);
    }

    // ─────────────────────────────────────────────────────────────
    // ExpFusionEngine Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_exp_fusion_engine_debug() {
        let engine = ExpFusionEngine;
        let debug_str = format!("{:?}", engine);
        assert!(debug_str.contains("ExpFusionEngine"));
    }

    #[test]
    fn test_exp_fusion_engine_clone() {
        let engine = ExpFusionEngine;
        let cloned = engine.clone();
        let _ = cloned;
    }

    #[test]
    fn test_exp_fusion_engine_serialization() {
        let engine = ExpFusionEngine;
        let json = serde_json::to_string(&engine).unwrap();
        let _restored: ExpFusionEngine = serde_json::from_str(&json).unwrap();
    }

    // ─────────────────────────────────────────────────────────────
    // TimelineEntry Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_timeline_entry_default() {
        let entry = TimelineEntry::default();
        assert_eq!(entry.timestamp, 0);
        assert!(entry.event.is_empty());
    }

    #[test]
    fn test_timeline_entry_creation() {
        let entry = TimelineEntry {
            timestamp: 1234567890,
            event: "Completed task".to_string(),
        };
        assert_eq!(entry.timestamp, 1234567890);
        assert_eq!(entry.event, "Completed task");
    }

    #[test]
    fn test_timeline_entry_serialization() {
        let entry = TimelineEntry {
            timestamp: 999,
            event: "test event".to_string(),
        };
        let json = serde_json::to_string(&entry).unwrap();
        let restored: TimelineEntry = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.timestamp, 999);
    }

    // ─────────────────────────────────────────────────────────────
    // TimelineStats Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_timeline_stats_default() {
        let stats = TimelineStats::default();
        assert_eq!(stats.total_events, 0);
    }

    #[test]
    fn test_timeline_stats_creation() {
        let stats = TimelineStats { total_events: 100 };
        assert_eq!(stats.total_events, 100);
    }

    // ─────────────────────────────────────────────────────────────
    // CategoryState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_category_state_default() {
        let state = CategoryState::default();
        assert!(state.name.is_empty());
        assert_eq!(state.weight, 0.0);
    }

    #[test]
    fn test_category_state_creation() {
        let state = CategoryState {
            name: "Programming".to_string(),
            weight: 0.8,
        };
        assert_eq!(state.name, "Programming");
        assert_eq!(state.weight, 0.8);
    }

    #[test]
    fn test_category_state_serialization() {
        let state = CategoryState {
            name: "Test".to_string(),
            weight: 0.5,
        };
        let json = serde_json::to_string(&state).unwrap();
        let restored: CategoryState = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.name, "Test");
    }

    // ─────────────────────────────────────────────────────────────
    // ProjectState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_project_state_default() {
        let state = ProjectState::default();
        assert!(state.name.is_empty());
        assert_eq!(state.progress, 0.0);
    }

    #[test]
    fn test_project_state_creation() {
        let state = ProjectState {
            name: "TITANE".to_string(),
            progress: 0.75,
        };
        assert_eq!(state.name, "TITANE");
        assert_eq!(state.progress, 0.75);
    }

    #[test]
    fn test_project_state_serialization() {
        let state = ProjectState {
            name: "Project X".to_string(),
            progress: 0.5,
        };
        let json = serde_json::to_string(&state).unwrap();
        let restored: ProjectState = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.progress, 0.5);
    }

    // ─────────────────────────────────────────────────────────────
    // ProjectStats Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_project_stats_default() {
        let stats = ProjectStats::default();
        assert_eq!(stats.total_projects, 0);
    }

    #[test]
    fn test_project_stats_creation() {
        let stats = ProjectStats { total_projects: 10 };
        assert_eq!(stats.total_projects, 10);
    }

    // ─────────────────────────────────────────────────────────────
    // TalentTreeState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_talent_tree_state_default() {
        let state = TalentTreeState::default();
        assert!(state.talents.is_empty());
    }

    #[test]
    fn test_talent_tree_state_creation() {
        let state = TalentTreeState {
            talents: vec!["Rust".to_string(), "TypeScript".to_string(), "AI".to_string()],
        };
        assert_eq!(state.talents.len(), 3);
        assert!(state.talents.contains(&"Rust".to_string()));
    }

    #[test]
    fn test_talent_tree_state_serialization() {
        let state = TalentTreeState {
            talents: vec!["test".to_string()],
        };
        let json = serde_json::to_string(&state).unwrap();
        let restored: TalentTreeState = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.talents.len(), 1);
    }
}
