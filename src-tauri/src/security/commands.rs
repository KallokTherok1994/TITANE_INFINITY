/**
 * TITANE∞ v19.3 — Security Commands
 * 
 * Commandes Tauri pour rate limiting, audit logging, et sécurité
 */

use crate::security::{
    rate_limit::GLOBAL_RATE_LIMITER,
    AuditEvent, AuditEventType, AuditSeverity, RateLimitStats,
};
use serde_json::json;

/// Obtenir les statistiques de rate limiting
#[tauri::command]
pub async fn get_rate_limit_stats(user_id: Option<String>) -> Result<RateLimitStats, String> {
    let user = user_id.unwrap_or_else(|| "anonymous".to_string());
    Ok(GLOBAL_RATE_LIMITER.get_stats(&user).await)
}

/// Réinitialiser le rate limit pour un utilisateur (admin only)
#[tauri::command]
pub async fn reset_rate_limit(user_id: String) -> Result<(), String> {
    // TODO: Ajouter vérification admin
    GLOBAL_RATE_LIMITER.reset(&user_id).await;
    Ok(())
}

/// Nettoyer les anciennes entrées de rate limiting
#[tauri::command]
pub async fn cleanup_rate_limiter() -> Result<(), String> {
    GLOBAL_RATE_LIMITER.cleanup().await;
    Ok(())
}

/// Tester le rate limiting (pour DevTools)
#[tauri::command]
pub async fn test_rate_limit() -> Result<String, String> {
    let test_user = "test_user";
    let mut results = Vec::new();

    for i in 1..=60 {
        match GLOBAL_RATE_LIMITER.check(test_user).await {
            Ok(_) => results.push(format!("Request {}: ✅ OK", i)),
            Err(e) => {
                results.push(format!("Request {}: ❌ {}", i, e));
                break;
            }
        }
    }

    // Reset pour cleanup
    GLOBAL_RATE_LIMITER.reset(test_user).await;

    Ok(results.join("\n"))
}

/// Enregistrer un événement d'audit personnalisé (pour debug)
#[tauri::command]
pub async fn log_audit_event(
    event_type: String,
    user_id: String,
    details: String,
    severity: String,
) -> Result<(), String> {
    let event_type = match event_type.as_str() {
        "config_change" => AuditEventType::ConfigChange,
        "data_access" => AuditEventType::DataAccess,
        "security_violation" => AuditEventType::SecurityViolation,
        _ => AuditEventType::Custom(event_type),
    };

    let severity = match severity.as_str() {
        "warning" => AuditSeverity::Warning,
        "critical" => AuditSeverity::Critical,
        _ => AuditSeverity::Info,
    };

    let details_json = json!({ "message": details });

    let event = AuditEvent::new(event_type, user_id, details_json, severity.into());

    crate::security::audit::GLOBAL_AUDIT_LOGGER
        .log(event)
        .await
        .map_err(|e| e.to_string())
}
