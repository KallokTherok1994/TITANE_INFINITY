//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT SANDBOX
//! Super Prompt #19 — Sandboxing et sécurité des agents
//! ═══════════════════════════════════════════════════════════════════════════════

use super::agent::{Agent, AgentId};
use super::roles::Permission;
use super::{AgentSystemError, AgentTask};
use serde::{Deserialize, Serialize};

/// Configuration du sandbox
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SandboxConfig {
    pub enabled: bool,
    pub max_memory_mb: u64,
    pub max_cpu_percent: u32,
    pub max_network_calls: u32,
    pub allowed_domains: Vec<String>,
    pub blocked_operations: Vec<String>,
    pub require_approval_for: Vec<Permission>,
}

impl Default for SandboxConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_memory_mb: 512,
            max_cpu_percent: 50,
            max_network_calls: 100,
            allowed_domains: vec!["*.anthropic.com".to_string(), "*.openai.com".to_string()],
            blocked_operations: vec!["file_delete".to_string(), "system_shutdown".to_string()],
            require_approval_for: vec![Permission::DeleteData, Permission::SystemShutdown],
        }
    }
}

/// Violation de sandbox
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SandboxViolation {
    pub timestamp: u64,
    pub agent_id: AgentId,
    pub violation_type: ViolationType,
    pub description: String,
    pub severity: ViolationSeverity,
    pub blocked: bool,
}

/// Type de violation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ViolationType {
    MemoryLimitExceeded,
    CPULimitExceeded,
    NetworkLimitExceeded,
    UnauthorizedDomain,
    BlockedOperation,
    PermissionDenied,
    RateLimitExceeded,
    InvalidInput,
    MaliciousPattern,
}

/// Sévérité de violation
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ViolationSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Sandbox pour agents
pub struct Sandbox {
    config: SandboxConfig,
    violations: tokio::sync::RwLock<Vec<SandboxViolation>>,
    usage_stats: tokio::sync::RwLock<std::collections::HashMap<AgentId, UsageStats>>,
}

impl Sandbox {
    pub fn new(config: SandboxConfig) -> Self {
        Self {
            config,
            violations: tokio::sync::RwLock::new(Vec::new()),
            usage_stats: tokio::sync::RwLock::new(std::collections::HashMap::new()),
        }
    }

    /// Valide un agent
    pub fn validate_agent(&self, agent: &Agent) -> Result<(), AgentSystemError> {
        if !self.config.enabled {
            return Ok(());
        }

        // Vérifier que l'agent n'a pas trop de capacités dangereuses
        let dangerous_capabilities = [
            super::capabilities::Capability::AccessControl,
            super::capabilities::Capability::Encryption,
        ];

        let dangerous_count = dangerous_capabilities
            .iter()
            .filter(|c| agent.capabilities.has(c))
            .count();

        if dangerous_count > 2 {
            return Err(AgentSystemError::SandboxViolation(
                "Agent has too many dangerous capabilities".to_string(),
            ));
        }

        Ok(())
    }

    /// Vérifie les permissions pour une tâche
    pub fn check_task_permissions(
        &self,
        task: &AgentTask,
        _agent_id: &AgentId,
    ) -> Result<(), AgentSystemError> {
        if !self.config.enabled {
            return Ok(());
        }

        // Vérifier les opérations bloquées
        for blocked in &self.config.blocked_operations {
            if task.description.to_lowercase().contains(blocked) {
                return Err(AgentSystemError::SandboxViolation(format!(
                    "Operation '{}' is blocked",
                    blocked
                )));
            }
        }

        // Vérifier les patterns malveillants
        if self.detect_malicious_pattern(&task.description) {
            return Err(AgentSystemError::SandboxViolation(
                "Malicious pattern detected in task".to_string(),
            ));
        }

        Ok(())
    }

    /// Vérifie l'accès à un domaine
    pub fn check_domain_access(&self, domain: &str) -> Result<(), AgentSystemError> {
        if !self.config.enabled {
            return Ok(());
        }

        let allowed = self.config.allowed_domains.iter().any(|pattern| {
            if pattern.starts_with("*.") {
                let suffix = &pattern[1..];
                domain.ends_with(suffix)
            } else {
                domain == pattern
            }
        });

        if !allowed && !self.config.allowed_domains.is_empty() {
            return Err(AgentSystemError::SandboxViolation(format!(
                "Domain '{}' is not allowed",
                domain
            )));
        }

        Ok(())
    }

    /// Vérifie les limites de ressources
    pub async fn check_resource_limits(&self, agent_id: &AgentId) -> Result<(), AgentSystemError> {
        if !self.config.enabled {
            return Ok(());
        }

        let stats = self.usage_stats.read().await;

        if let Some(usage) = stats.get(agent_id) {
            if usage.memory_mb > self.config.max_memory_mb {
                return Err(AgentSystemError::SandboxViolation(format!(
                    "Memory limit exceeded: {} MB > {} MB",
                    usage.memory_mb, self.config.max_memory_mb
                )));
            }

            if usage.cpu_percent > self.config.max_cpu_percent {
                return Err(AgentSystemError::SandboxViolation(format!(
                    "CPU limit exceeded: {}% > {}%",
                    usage.cpu_percent, self.config.max_cpu_percent
                )));
            }

            if usage.network_calls > self.config.max_network_calls {
                return Err(AgentSystemError::SandboxViolation(format!(
                    "Network calls limit exceeded: {} > {}",
                    usage.network_calls, self.config.max_network_calls
                )));
            }
        }

        Ok(())
    }

    /// Enregistre l'utilisation des ressources
    pub async fn record_usage(&self, agent_id: &AgentId, usage: UsageStats) {
        let mut stats = self.usage_stats.write().await;
        stats.insert(agent_id.clone(), usage);
    }

    /// Enregistre une violation
    pub async fn record_violation(&self, violation: SandboxViolation) {
        let mut violations = self.violations.write().await;
        violations.push(violation);

        // Limiter la taille
        if violations.len() > 1000 {
            violations.remove(0);
        }
    }

    /// Récupère les violations récentes
    pub async fn recent_violations(&self, count: usize) -> Vec<SandboxViolation> {
        let violations = self.violations.read().await;
        violations.iter().rev().take(count).cloned().collect()
    }

    /// Récupère les violations par agent
    pub async fn violations_by_agent(&self, agent_id: &AgentId) -> Vec<SandboxViolation> {
        let violations = self.violations.read().await;
        violations
            .iter()
            .filter(|v| &v.agent_id == agent_id)
            .cloned()
            .collect()
    }

    /// Détecte des patterns malveillants
    fn detect_malicious_pattern(&self, content: &str) -> bool {
        let malicious_patterns = [
            "rm -rf",
            "format c:",
            "drop table",
            "delete from",
            "<script>",
            "eval(",
            "exec(",
            "system(",
        ];

        let lower = content.to_lowercase();
        malicious_patterns.iter().any(|p| lower.contains(p))
    }

    /// Réinitialise les stats d'utilisation d'un agent
    pub async fn reset_usage(&self, agent_id: &AgentId) {
        let mut stats = self.usage_stats.write().await;
        stats.remove(agent_id);
    }

    /// Obtient le rapport de sécurité
    pub async fn security_report(&self) -> SecurityReport {
        let violations = self.violations.read().await;

        let by_type: std::collections::HashMap<String, usize> =
            violations
                .iter()
                .fold(std::collections::HashMap::new(), |mut acc, v| {
                    let key = format!("{:?}", v.violation_type);
                    *acc.entry(key).or_insert(0) += 1;
                    acc
                });

        let by_severity: std::collections::HashMap<String, usize> =
            violations
                .iter()
                .fold(std::collections::HashMap::new(), |mut acc, v| {
                    let key = format!("{:?}", v.severity);
                    *acc.entry(key).or_insert(0) += 1;
                    acc
                });

        SecurityReport {
            total_violations: violations.len(),
            violations_by_type: by_type,
            violations_by_severity: by_severity,
            critical_violations: violations
                .iter()
                .filter(|v| v.severity == ViolationSeverity::Critical)
                .count(),
            sandbox_enabled: self.config.enabled,
        }
    }
}

impl Default for Sandbox {
    fn default() -> Self {
        Self::new(SandboxConfig::default())
    }
}

/// Stats d'utilisation
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct UsageStats {
    pub memory_mb: u64,
    pub cpu_percent: u32,
    pub network_calls: u32,
    pub disk_reads: u64,
    pub disk_writes: u64,
}

/// Rapport de sécurité
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SecurityReport {
    pub total_violations: usize,
    pub violations_by_type: std::collections::HashMap<String, usize>,
    pub violations_by_severity: std::collections::HashMap<String, usize>,
    pub critical_violations: usize,
    pub sandbox_enabled: bool,
}

#[cfg(test)]
mod tests {
    use super::super::agent::AgentType;
    use super::*;

    #[test]
    fn test_sandbox_validation() {
        let sandbox = Sandbox::default();
        let agent = Agent::new(AgentType::Researcher, "Test Agent");

        let result = sandbox.validate_agent(&agent);
        assert!(result.is_ok());
    }

    #[test]
    fn test_malicious_pattern_detection() {
        let sandbox = Sandbox::default();

        assert!(sandbox.detect_malicious_pattern("rm -rf /"));
        assert!(sandbox.detect_malicious_pattern("DROP TABLE users"));
        assert!(!sandbox.detect_malicious_pattern("Hello world"));
    }
}
