// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — COMPAT: PluginSystem stub
// ═══════════════════════════════════════════════════════════════

use crate::core::legacy::{HarmoniaCore, HeliosCore, MemoryCore, NexusCore, SentinelCore};
use serde::{Deserialize, Serialize};

pub mod core_system {
    use super::*;

    #[derive(Debug, Clone)]
    pub struct CoreCollection {
        pub helios: HeliosCore,
        pub nexus: NexusCore,
        pub memory: MemoryCore,
        pub harmonia: HarmoniaCore,
        pub sentinel: SentinelCore,
    }

    impl CoreCollection {
        pub fn new() -> Self {
            Self {
                helios: HeliosCore::new(),
                nexus: NexusCore::new(),
                memory: MemoryCore::new(),
                harmonia: HarmoniaCore::new(),
                sentinel: SentinelCore::new(),
            }
        }
    }
}

pub mod registry {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct CoreRegistry;

    impl CoreRegistry {
        pub fn new() -> Self {
            Self
        }

        pub fn list_cores(&self) -> Vec<String> {
            vec![
                "nexus".to_string(),
                "memory".to_string(),
                "harmonia".to_string(),
                "sentinel".to_string(),
            ]
        }

        pub fn get_core(&self, _name: &str) -> Option<CoreModule> {
            Some(CoreModule)
        }
    }

    pub struct CoreModule;

    impl CoreModule {
        pub async fn health_check(&self) -> Result<super::core_module::CoreHealth, String> {
            Ok(super::core_module::CoreHealth::Healthy)
        }
    }
}
pub mod core_module {
    use super::*;

    #[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
    pub enum CoreHealth {
        Healthy,
        Degraded,
        Failing,
        Offline,
    }

    impl CoreHealth {
        pub fn message(&self) -> &'static str {
            match self {
                CoreHealth::Healthy => "Healthy",
                CoreHealth::Degraded => "Degraded",
                CoreHealth::Failing => "Failing",
                CoreHealth::Offline => "Offline",
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreRegistry;

impl CoreRegistry {
    pub fn new() -> Self {
        Self
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CoreStatus {
    Active,
    Inactive,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreInfo {
    pub name: String,
    pub status: CoreStatus,
}
