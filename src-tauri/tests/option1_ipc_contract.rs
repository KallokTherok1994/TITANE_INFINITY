#![cfg(all(not(feature = "mock"), feature = "full"))]

use titane_infinity::services::db::db_types::{DbError, IpcResponse};

#[test]
fn option1_ipc_contract_success_shape() {
    let response = IpcResponse::success(serde_json::json!({ "k": 1 }));
    assert!(response.ok);
    assert!(response.content.is_some());
    assert!(response.error.is_none());
}

#[test]
fn option1_ipc_contract_error_shape() {
    let response: IpcResponse<serde_json::Value> =
        IpcResponse::failure(DbError::new("DB_BUSY", "busy"));
    assert!(!response.ok);
    assert!(response.content.is_none());
    assert_eq!(response.error.as_ref().map(|e| e.code.as_str()), Some("DB_BUSY"));
}
