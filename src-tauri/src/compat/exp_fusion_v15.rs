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
