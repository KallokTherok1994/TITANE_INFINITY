// ═══════════════════════════════════════════════════════════════
//   TITANE∞ Remote Gateway — Audit Bridge (Ring 0)
//   Every remote request is logged via the existing AuditLogger
// ═══════════════════════════════════════════════════════════════

use serde_json::json;
use std::path::PathBuf;
use std::sync::Arc;

use crate::security::audit::{AuditEvent, AuditEventType, AuditLogger, AuditSeverity};

#[derive(Clone)]
pub struct RemoteAuditLogger {
    inner: Arc<AuditLogger>,
}

impl RemoteAuditLogger {
    pub fn new(log_file: PathBuf) -> Self {
        Self {
            inner: Arc::new(AuditLogger::new(log_file)),
        }
    }

    /// Log a remote API request (best-effort — never fails the request)
    pub async fn log_request(
        &self,
        user_id: &str,
        ip: Option<String>,
        method: &str,
        path: &str,
        status: u16,
    ) {
        let event = AuditEvent::new(
            AuditEventType::DataAccess,
            user_id.to_string(),
            json!({
                "surface": "remote_gateway",
                "method": method,
                "path": path,
                "status": status,
            }),
            AuditSeverity::Info.into(),
        );
        let event = if let Some(ip_addr) = ip {
            event.with_ip(ip_addr)
        } else {
            event
        };
        let _ = self.inner.log(event).await;
    }

    /// Log an authentication attempt
    pub async fn log_auth(
        &self,
        ip: Option<String>,
        success: bool,
        reason: &str,
    ) {
        let severity = if success {
            AuditSeverity::Info
        } else {
            AuditSeverity::Warning
        };
        let event = AuditEvent::new(
            AuditEventType::LoginAttempt,
            "remote_user".to_string(),
            json!({
                "surface": "remote_gateway",
                "success": success,
                "reason": reason,
            }),
            severity.into(),
        );
        let event = if let Some(ip_addr) = ip {
            event.with_ip(ip_addr)
        } else {
            event
        };
        let _ = self.inner.log(event).await;
    }

    /// Log a rate-limit hit
    pub async fn log_rate_limit(&self, ip: Option<String>) {
        let event = AuditEvent::new(
            AuditEventType::RateLimitExceeded,
            "remote_user".to_string(),
            json!({ "surface": "remote_gateway" }),
            AuditSeverity::Warning.into(),
        );
        let event = if let Some(ip_addr) = ip {
            event.with_ip(ip_addr)
        } else {
            event
        };
        let _ = self.inner.log(event).await;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_audit_log_request_no_panic() {
        let dir = tempdir().unwrap();
        let log = RemoteAuditLogger::new(dir.path().join("remote_audit.log"));
        // Must not panic
        log.log_request("user1", Some("127.0.0.1".into()), "POST", "/api/invoke", 200)
            .await;
    }

    #[tokio::test]
    async fn test_audit_log_auth_no_panic() {
        let dir = tempdir().unwrap();
        let log = RemoteAuditLogger::new(dir.path().join("remote_audit.log"));
        log.log_auth(Some("1.2.3.4".into()), false, "bad_secret").await;
    }

    #[tokio::test]
    async fn test_audit_log_rate_limit_no_panic() {
        let dir = tempdir().unwrap();
        let log = RemoteAuditLogger::new(dir.path().join("remote_audit.log"));
        log.log_rate_limit(Some("1.2.3.4".into())).await;
    }
}
