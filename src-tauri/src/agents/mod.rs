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
pub mod capabilities;
pub mod collaboration;
pub mod config;
pub mod contract;
pub mod diagnostics;
pub mod messaging;
pub mod registry;
pub mod roles;
pub mod sandbox;
pub mod supervisor;

// Re-exports
pub use agent::{Agent, AgentError, AgentId, AgentState};
pub use capabilities::{Capability, CapabilitySet};
pub use collaboration::{CollaborationPattern, CollaborationProtocol, CollaborationResult};
pub use contract::{AgentContract, ContractViolation};
pub use messaging::{AgentMessage, MessageBus, MessageChannel};
pub use registry::{AgentRegistry, RegistryStats};
pub use roles::{AgentRole, RoleDescriptor};
pub use sandbox::{AgentSandbox, SandboxConfig, SandboxViolation};
pub use supervisor::{AgentHealth, AgentSupervisor, SupervisorStats};
// Made public for Phase 1 compilation
pub use agent::AgentMetrics; // Export from agent.rs instead
pub use config::AgentSystemConfig;
pub use diagnostics::{AgentDiagnostics, AgentEvent};

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
    /// Maximum memory per agent (MB) - AUGMENTÉ: 50MB → 500MB
    pub const MAX_AGENT_MEMORY_MB: usize = 500;
}

/// Agent system limits
pub mod limits {
    /// Maximum number of concurrent agents - AUGMENTÉ: 50 → 500
    pub const MAX_AGENTS: usize = 500;
    /// Maximum message queue size per agent - AUGMENTÉ: 1000 → 10000
    pub const MAX_MESSAGE_QUEUE: usize = 10000;
    /// Maximum collaboration depth - AUGMENTÉ: 5 → 20
    pub const MAX_COLLABORATION_DEPTH: usize = 20;
    /// Maximum agent execution time (seconds) - AUGMENTÉ: 300s → 3600s (1h)
    pub const MAX_AGENT_EXECUTION_SECONDS: u64 = 3600;
}
