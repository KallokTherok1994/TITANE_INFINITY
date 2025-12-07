use tauri::State;
use crate::state::AppState;
use crate::security::{InputValidator, AuditEvent, AuditEventType};
use chrono::Utc;
use serde_json::json;

#[tauri::command]
pub async fn send_message(
    message: String,
    state: State<'_, AppState>
) -> Result<String, String> {
    // Rate limiting
    state.rate_limiter
        .check("user_default") // TODO: Implémenter vrai user ID
        .await
        .map_err(|e| e.to_string())?;
    
    // Input validation
    InputValidator::validate_message(&message)
        .map_err(|e| e.to_string())?;
    
    // Audit log
    let _ = state.audit_logger.log(AuditEvent {
        timestamp: Utc::now(),
        event_type: AuditEventType::DataAccess,
        user_id: "user_default".to_string(),
        details: json!({
            "action": "send_message",
            "message_length": message.len(),
        }),
        ip_address: None,
    }).await;
    
    Ok("response".to_string())
}