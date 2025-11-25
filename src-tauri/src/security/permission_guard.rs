// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   PERMISSION GUARD — Super-Prompt K
//   Interception et vérification de toutes les commandes
// ═══════════════════════════════════════════════════════════════

use super::permissions::{Role, check_permission, require_permission};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Audit log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionAudit {
    pub timestamp: u64,
    pub role: Role,
    pub action: String,
    pub status: AuditStatus,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditStatus {
    Allowed,
    Denied,
    Alert,
}

/// Permission Guard - Intercepteur global
pub struct PermissionGuard {
    audit_log: Arc<RwLock<Vec<PermissionAudit>>>,
    max_log_size: usize,
}

impl PermissionGuard {
    pub fn new() -> Self {
        Self {
            audit_log: Arc::new(RwLock::new(Vec::new())),
            max_log_size: 10000,
        }
    }

    /// Vérifier permission avec audit
    pub async fn check(&self, action: &str, role: Role, source: &str) -> Result<(), String> {
        let allowed = check_permission(action, role);

        let status = if allowed {
            AuditStatus::Allowed
        } else {
            AuditStatus::Denied
        };

        self.log_audit(role, action.to_string(), status, source.to_string())
            .await;

        if allowed {
            Ok(())
        } else {
            Err(format!(
                "Permission denied: {:?} cannot perform '{}' from {}",
                role, action, source
            ))
        }
    }

    /// Exiger permission (erreur si refusée)
    pub async fn require(&self, action: &str, role: Role, source: &str) -> Result<(), String> {
        self.check(action, role, source).await
    }

    /// Enregistrer audit
    async fn log_audit(&self, role: Role, action: String, status: AuditStatus, source: String) {
        let entry = PermissionAudit {
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_millis() as u64)
                .unwrap_or(0),
            role,
            action,
            status,
            source,
        };

        let mut log = self.audit_log.write().await;
        log.push(entry);

        // Limiter taille du log
        if log.len() > self.max_log_size {
            log.drain(0..1000);
        }
    }

    /// Récupérer historique d'audit
    pub async fn get_audit_log(&self) -> Vec<PermissionAudit> {
        self.audit_log.read().await.clone()
    }

    /// Effacer log (ROOT uniquement)
    pub async fn clear_log(&self, role: Role) -> Result<(), String> {
        require_permission("permission_modify", role)?;
        self.audit_log.write().await.clear();
        Ok(())
    }

    /// Exporter audit vers fichier sécurisé
    pub async fn export_audit(&self, role: Role) -> Result<String, String> {
        require_permission("system_audit", role)?;

        let log = self.audit_log.read().await;
        serde_json::to_string_pretty(&*log)
            .map_err(|e| format!("Failed to export audit: {}", e))
    }

    /// Détecter tentatives d'escalade de privilèges
    pub async fn detect_escalation_attempts(&self) -> Vec<PermissionAudit> {
        let log = self.audit_log.read().await;
        log.iter()
            .filter(|entry| {
                matches!(entry.status, AuditStatus::Denied)
                    && (entry.action.contains("escalate")
                        || entry.action.contains("modify")
                        || entry.action.contains("reset"))
            })
            .cloned()
            .collect()
    }
}

impl Default for PermissionGuard {
    fn default() -> Self {
        Self::new()
    }
}

lazy_static::lazy_static! {
    /// Instance globale du Permission Guard
    pub static ref PERMISSION_GUARD: PermissionGuard = PermissionGuard::new();
}

/// Macro pour vérifier permissions facilement
#[macro_export]
macro_rules! require_perm {
    ($action:expr, $role:expr) => {
        $crate::security::permission_guard::PERMISSION_GUARD
            .require($action, $role, module_path!())
            .await?
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_permission_guard() {
        let guard = PermissionGuard::new();

        // ROOT peut tout faire
        assert!(guard
            .check("system_shutdown", Role::Root, "test")
            .await
            .is_ok());

        // USER ne peut pas shutdown
        assert!(guard
            .check("system_shutdown", Role::User, "test")
            .await
            .is_err());

        // Vérifier audit
        let log = guard.get_audit_log().await;
        assert_eq!(log.len(), 2);
    }

    #[tokio::test]
    async fn test_audit_export() {
        let guard = PermissionGuard::new();
        guard.check("file_read", Role::User, "test").await.ok();
        guard.check("system_shutdown", Role::User, "test").await.ok();

        let json = guard.export_audit(Role::Root).await;
        assert!(json.is_ok());
    }
}
