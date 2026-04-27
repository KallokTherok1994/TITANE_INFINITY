// ─────────────────────────────────────────────────────────────────────────────
//   TITANE∞ — Remote API Key Management — Tauri Commands
//   Ring 0 | Phase 1 | Named key CRUD exposed as IPC to frontend
// ─────────────────────────────────────────────────────────────────────────────

use serde::Serialize;
use tauri::State;

use crate::remote_gateway::api_key_store::{ApiKeyMasked, ApiKeyStore, KeyScope};

// ── Managed state wrapper ────────────────────────────────────────────────────

pub struct RemoteKeyStoreState(pub std::sync::Mutex<ApiKeyStore>);

// ── IPC Structs ───────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct RemoteKeyCreateResult {
    pub ok: bool,
    pub key_id: Option<String>,
    /// Plaintext secret — shown ONCE, must be stored by the client
    pub secret_once: Option<String>,
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct RemoteKeyRotateResult {
    pub ok: bool,
    pub old_key_id: Option<String>,
    pub new_key_id: Option<String>,
    pub new_secret_once: Option<String>,
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct RemoteKeyListResult {
    pub ok: bool,
    pub keys: Vec<ApiKeyMasked>,
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct RemoteKeyRevokeResult {
    pub ok: bool,
    pub key_id: Option<String>,
    pub error: Option<String>,
}

// ── Commands ──────────────────────────────────────────────────────────────────

/// Create a new named API key.
/// `scopes` is a list of strings: "admin", "chat", "memory", "system"
/// (empty = all scopes granted)
#[tauri::command]
pub fn remote_key_create(
    store: State<'_, RemoteKeyStoreState>,
    label: String,
    scopes: Option<Vec<String>>,
) -> RemoteKeyCreateResult {
    let resolved_scopes = match scopes {
        None => KeyScope::all(),
        Some(ref s) if s.is_empty() => KeyScope::all(),
        Some(ref s) => KeyScope::from_str_vec(s),
    };

    match store.0.lock() {
        Ok(mut s) => match s.create_key(label, resolved_scopes) {
            Ok((key_id, secret)) => RemoteKeyCreateResult {
                ok: true,
                key_id: Some(key_id),
                secret_once: Some(secret),
                error: None,
            },
            Err(e) => RemoteKeyCreateResult {
                ok: false,
                key_id: None,
                secret_once: None,
                error: Some(e),
            },
        },
        Err(e) => RemoteKeyCreateResult {
            ok: false,
            key_id: None,
            secret_once: None,
            error: Some(format!("lock error: {e}")),
        },
    }
}

/// List all API keys (masked — no secrets returned).
#[tauri::command]
pub fn remote_key_list(store: State<'_, RemoteKeyStoreState>) -> RemoteKeyListResult {
    match store.0.lock() {
        Ok(s) => RemoteKeyListResult {
            ok: true,
            keys: s.list_masked(),
            error: None,
        },
        Err(e) => RemoteKeyListResult {
            ok: false,
            keys: vec![],
            error: Some(format!("lock error: {e}")),
        },
    }
}

/// Revoke (disable) an API key by key_id.
#[tauri::command]
pub fn remote_key_revoke(
    store: State<'_, RemoteKeyStoreState>,
    key_id: String,
) -> RemoteKeyRevokeResult {
    match store.0.lock() {
        Ok(mut s) => match s.revoke(&key_id) {
            Ok(()) => RemoteKeyRevokeResult {
                ok: true,
                key_id: Some(key_id),
                error: None,
            },
            Err(e) => RemoteKeyRevokeResult {
                ok: false,
                key_id: None,
                error: Some(e),
            },
        },
        Err(e) => RemoteKeyRevokeResult {
            ok: false,
            key_id: None,
            error: Some(format!("lock error: {e}")),
        },
    }
}

/// Rotate an API key: revoke old, generate new with same label + scopes.
/// Returns the new key_id and plaintext secret (shown ONCE).
#[tauri::command]
pub fn remote_key_rotate(
    store: State<'_, RemoteKeyStoreState>,
    key_id: String,
) -> RemoteKeyRotateResult {
    match store.0.lock() {
        Ok(mut s) => match s.rotate(&key_id) {
            Ok((new_id, new_secret)) => RemoteKeyRotateResult {
                ok: true,
                old_key_id: Some(key_id),
                new_key_id: Some(new_id),
                new_secret_once: Some(new_secret),
                error: None,
            },
            Err(e) => RemoteKeyRotateResult {
                ok: false,
                old_key_id: Some(key_id),
                new_key_id: None,
                new_secret_once: None,
                error: Some(e),
            },
        },
        Err(e) => RemoteKeyRotateResult {
            ok: false,
            old_key_id: None,
            new_key_id: None,
            new_secret_once: None,
            error: Some(format!("lock error: {e}")),
        },
    }
}
