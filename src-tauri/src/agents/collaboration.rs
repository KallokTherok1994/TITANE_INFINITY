#![allow(unused_imports)]
#![allow(dead_code)]
// Agent Collaboration Protocols
use crate::agents::{Agent, AgentId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollaborationPattern {
    /// Pipeline: Agent A → Agent B → Agent C
    Pipeline { agents: Vec<AgentId> },
    /// Parallel: All agents work simultaneously
    Parallel { agents: Vec<AgentId> },
    /// Committee: Multiple agents vote on result
    Committee { agents: Vec<AgentId>, quorum: usize },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollaborationProtocol {
    pub pattern: CollaborationPattern,
    pub timeout_seconds: u64,
}

impl CollaborationProtocol {
    pub fn pipeline(agents: Vec<AgentId>) -> Self {
        Self {
            pattern: CollaborationPattern::Pipeline { agents },
            timeout_seconds: 300,
        }
    }

    pub fn parallel(agents: Vec<AgentId>) -> Self {
        Self {
            pattern: CollaborationPattern::Parallel { agents },
            timeout_seconds: 60,
        }
    }

    pub fn committee(agents: Vec<AgentId>, quorum: usize) -> Self {
        Self {
            pattern: CollaborationPattern::Committee { agents, quorum },
            timeout_seconds: 120,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollaborationResult {
    pub success: bool,
    pub participating_agents: Vec<AgentId>,
    pub duration_ms: u128,
    pub output: Option<String>,
}
