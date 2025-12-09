#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.6Ω — AGENT SYSTEM vΩ
//   Super Prompt #19: Multi-Agent Cognitive Architecture
//   Multi-agents internes, rôles, collaboration cognitive
// ═══════════════════════════════════════════════════════════════

//! # TITANE∞ Agent System vΩ
//!
//! Système multi-agents pour TITANE∞ OS, permettant la collaboration
//! de cellules cognitives spécialisées pour augmenter les capacités,
//! la stabilité et l'adaptativité du système.
//!
//! ## Architecture
//!
//! - **Agent**: Unité cognitive de base avec rôle, capacités, contrat
//! - **Registry**: Catalogue des agents actifs
//! - **Supervisor**: Surveillance et gestion de la santé des agents
//! - **Messaging**: Communication inter-agents via channels
//! - **Sandbox**: Isolation et sécurité d'exécution
//! - **Collaboration**: Protocoles de travail collaboratif
//!
//! ## Intégrations
//!
//! - Kernel OS: Agents = tasks du kernel
//! - OMEGA: Délégation de sous-tâches
//! - Memory OS: Curation mémoire
//! - AGI Core: Meta-learning assisté
//! - Multimodal: Traitement signaux
//! - Security Layer: Vérification permissions
//! - Temporal Engine: Modélisation temporelle

pub mod agent;
pub mod roles;
pub mod capabilities;
pub mod contract;
pub mod registry;
pub mod messaging;
pub mod supervisor;
pub mod sandbox;
pub mod collaboration;
pub mod diagnostics;
pub mod config;

// Re-exports
pub use agent::{Agent, AgentId, AgentState, AgentError};
pub use roles::{AgentRole, RoleDescriptor};
pub use capabilities::{Capability, CapabilitySet};
pub use contract::{AgentContract, ContractViolation};
pub use registry::{AgentRegistry, RegistryStats};
pub use messaging::{AgentMessage, MessageChannel, MessageBus};
pub use supervisor::{AgentSupervisor, SupervisorStats, AgentHealth};
pub use sandbox::{AgentSandbox, SandboxConfig, SandboxViolation};
pub use collaboration::{CollaborationProtocol, CollaborationPattern, CollaborationResult};
pub use diagnostics::{AgentDiagnostics, AgentEvent, AgentMetrics};
pub use config::AgentSystemConfig;

// Version info
pub const AGENT_SYSTEM_VERSION: &str = "v20.6Ω";
pub const AGENT_SYSTEM_NAME: &str = "TITANE∞ Agent System vΩ";

/// Performance targets
pub mod targets {
    /// Maximum agent startup time (ms)
    pub const AGENT_STARTUP_MS: u128 = 100;
    /// Maximum message latency (ms)
    pub const MESSAGE_LATENCY_MS: u128 = 10;
    /// Maximum supervisor check interval (ms)
    pub const SUPERVISOR_CHECK_MS: u128 = 1000;
    /// Maximum memory per agent (MB)
    pub const MAX_AGENT_MEMORY_MB: usize = 50;
}

/// Agent system limits
pub mod limits {
    /// Maximum number of concurrent agents
    pub const MAX_AGENTS: usize = 50;
    /// Maximum message queue size per agent
    pub const MAX_MESSAGE_QUEUE: usize = 1000;
    /// Maximum collaboration depth
    pub const MAX_COLLABORATION_DEPTH: usize = 5;
    /// Maximum agent execution time (seconds)
    pub const MAX_AGENT_EXECUTION_SECONDS: u64 = 300;
}
