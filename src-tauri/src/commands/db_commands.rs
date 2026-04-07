use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};

use crate::services::db::db_service::Option1DbService;
use crate::services::db::db_state::DbState;
use crate::services::db::db_types::{DbError, IpcResponse};
use crate::services::sync::sync_service::Option1SyncService;

#[derive(Clone)]
pub struct Option1DbAppState {
    db: Arc<Option1DbService>,
    sync: Arc<Option1SyncService>,
}

impl Option1DbAppState {
    pub fn try_new(app: &AppHandle) -> Result<Self, DbError> {
        let app_data_dir = app
            .path()
            .app_data_dir()
            .unwrap_or_else(|_| std::env::temp_dir().join("titane"));
        let db_path = app_data_dir.join("option1_libsql_local.db");
        let db_state = DbState::new(db_path)?;
        let db = Arc::new(Option1DbService::new(db_state));
        let sync = Arc::new(Option1SyncService::new(Arc::clone(&db)));

        Ok(Self { db, sync })
    }

    pub fn db(&self) -> Arc<Option1DbService> {
        Arc::clone(&self.db)
    }

    pub fn sync(&self) -> Arc<Option1SyncService> {
        Arc::clone(&self.sync)
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PutEventRequest {
    pub stream: String,
    pub event_type: String,
    pub payload_json: String,
    pub device_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamRequest {
    pub stream: String,
    pub limit: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PutSnapshotRequest {
    pub stream: String,
    pub version: i64,
    pub state_json: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KvSetRequest {
    pub key: String,
    pub value_json: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KvGetRequest {
    pub key: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncNowRequest {
    pub reason: Option<String>,
}

#[tauri::command]
pub fn db_put_event(
    state: State<'_, Option1DbAppState>,
    request: PutEventRequest,
) -> IpcResponse<Value> {
    match state.db().put_event(
        &request.stream,
        &request.event_type,
        &request.payload_json,
        &request.device_id,
    ) {
        Ok(id) => IpcResponse::success(json!({ "id": id })),
        Err(e) => IpcResponse::failure(e),
    }
}

#[tauri::command]
pub fn db_get_stream(
    state: State<'_, Option1DbAppState>,
    request: StreamRequest,
) -> IpcResponse<Value> {
    let limit = request.limit.unwrap_or(100).min(1000);
    match state.db().get_stream(&request.stream, limit) {
        Ok(items) => IpcResponse::success(json!({ "items": items })),
        Err(e) => IpcResponse::failure(e),
    }
}

#[tauri::command]
pub fn db_put_snapshot(
    state: State<'_, Option1DbAppState>,
    request: PutSnapshotRequest,
) -> IpcResponse<Value> {
    match state
        .db()
        .put_snapshot(&request.stream, request.version, &request.state_json)
    {
        Ok(_) => IpcResponse::success(json!({ "saved": true })),
        Err(e) => IpcResponse::failure(e),
    }
}

#[tauri::command]
pub fn db_get_snapshot(
    state: State<'_, Option1DbAppState>,
    request: StreamRequest,
) -> IpcResponse<Value> {
    match state.db().get_snapshot(&request.stream) {
        Ok(snapshot) => IpcResponse::success(json!({ "snapshot": snapshot })),
        Err(e) => IpcResponse::failure(e),
    }
}

#[tauri::command]
pub fn db_kv_set(state: State<'_, Option1DbAppState>, request: KvSetRequest) -> IpcResponse<Value> {
    match state.db().kv_set(&request.key, &request.value_json) {
        Ok(_) => IpcResponse::success(json!({ "saved": true })),
        Err(e) => IpcResponse::failure(e),
    }
}

#[tauri::command]
pub fn db_kv_get(state: State<'_, Option1DbAppState>, request: KvGetRequest) -> IpcResponse<Value> {
    match state.db().kv_get(&request.key) {
        Ok(value) => IpcResponse::success(json!({ "value_json": value })),
        Err(e) => IpcResponse::failure(e),
    }
}

#[tauri::command]
pub fn db_sync_now(
    state: State<'_, Option1DbAppState>,
    request: Option<SyncNowRequest>,
) -> IpcResponse<Value> {
    let reason = request
        .and_then(|r| r.reason)
        .unwrap_or_else(|| "manual".to_string());

    match state.sync().sync_now(&reason) {
        Ok(status) => IpcResponse::success(json!({ "status": status })),
        Err(e) => IpcResponse::failure(e),
    }
}

#[tauri::command]
pub fn db_sync_status(state: State<'_, Option1DbAppState>) -> IpcResponse<Value> {
    IpcResponse::success(json!({ "status": state.sync().status() }))
}
