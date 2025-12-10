//! TITANE∞ v∞ — System Center: Cluster
//!
//! Wrapper pour les commandes Node-Cluster existantes
//! Réutilise la logique de src/cluster/mesh_layer.rs
//!
//! © 2025 TITANE Team. All rights reserved.

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// Macro for safe mutex locking with auto-recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[Cluster] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

// ══════════════════════════════════════════════════════════════════
// TYPES (re-export depuis cluster existant si possible)
// ══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeRole {
    Root,
    Worker,
    Storage,
    Monitor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeInfo {
    pub id: String,
    pub addr: String,
    pub role: NodeRole,
    pub health: u8,
    pub load: u8,
    pub last_seen: u64,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterStats {
    pub node_id: String,
    pub role: String,
    pub peer_count: usize,
    pub total_health: f32,
    pub avg_load: f32,
    pub uptime_seconds: u64,
    pub is_initialized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterStatus {
    pub initialized: bool,
    pub node_id: Option<String>,
    pub peers: Vec<NodeInfo>,
    pub stats: Option<ClusterStats>,
}

// ══════════════════════════════════════════════════════════════════
// INTERNAL STATE
// ══════════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
use std::sync::{Arc, Mutex};

#[derive(Default)]
struct ClusterState {
    initialized: bool,
    node_id: Option<String>,
    port: Option<u16>,
    start_time: Option<u64>,
}

static CLUSTER_STATE: Lazy<Arc<Mutex<ClusterState>>> =
    Lazy::new(|| Arc::new(Mutex::new(ClusterState::default())));

// ══════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ══════════════════════════════════════════════════════════════════

/// Get current cluster status
#[tauri::command]
pub async fn sc_get_cluster_status() -> Result<ClusterStatus, String> {
    let state = lock_or_recover!(CLUSTER_STATE);

    Ok(ClusterStatus {
        initialized: state.initialized,
        node_id: state.node_id.clone(),
        peers: Vec::new(), // TODO: Get from actual mesh layer
        stats: if state.initialized {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or(std::time::Duration::from_secs(0))
                .as_secs();

            Some(ClusterStats {
                node_id: state.node_id.clone().unwrap_or_default(),
                role: "Root".to_string(),
                peer_count: 0,
                total_health: 100.0,
                avg_load: 0.0,
                uptime_seconds: state.start_time.map(|s| now - s).unwrap_or(0),
                is_initialized: true,
            })
        } else {
            None
        },
    })
}

/// Initialize cluster node
#[tauri::command]
pub async fn sc_initialize_cluster(node_id: String, port: u16) -> Result<String, String> {
    let mut state = lock_or_recover!(CLUSTER_STATE);

    if state.initialized {
        return Err("Cluster already initialized".to_string());
    }

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(std::time::Duration::from_secs(0))
        .as_secs();

    state.initialized = true;
    state.node_id = Some(node_id.clone());
    state.port = Some(port);
    state.start_time = Some(now);

    println!(
        "[SystemCenter::Cluster] Initialized node {} on port {}",
        node_id, port
    );

    // TODO: Actually initialize mesh_layer
    // crate::cluster::mesh_initialize(node_id.clone(), port).await?;

    Ok(format!(
        "Cluster node {} initialized on port {}",
        node_id, port
    ))
}

/// Get cluster statistics
#[tauri::command]
pub async fn sc_get_cluster_stats() -> Result<ClusterStats, String> {
    let state = lock_or_recover!(CLUSTER_STATE);

    if !state.initialized {
        return Err("Cluster not initialized".to_string());
    }

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(std::time::Duration::from_secs(0))
        .as_secs();

    Ok(ClusterStats {
        node_id: state.node_id.clone().unwrap_or_default(),
        role: "Root".to_string(),
        peer_count: 0,
        total_health: 100.0,
        avg_load: 0.0,
        uptime_seconds: state.start_time.map(|s| now - s).unwrap_or(0),
        is_initialized: true,
    })
}

/// Shutdown cluster
#[tauri::command]
pub async fn sc_shutdown_cluster() -> Result<(), String> {
    let mut state = lock_or_recover!(CLUSTER_STATE);

    state.initialized = false;
    state.node_id = None;
    state.port = None;
    state.start_time = None;

    println!("[SystemCenter::Cluster] Shutdown complete");

    Ok(())
}

/// Get list of peers
#[tauri::command]
pub async fn sc_get_cluster_peers() -> Result<Vec<NodeInfo>, String> {
    let state = lock_or_recover!(CLUSTER_STATE);

    if !state.initialized {
        return Ok(Vec::new());
    }

    // TODO: Get actual peers from mesh layer
    Ok(Vec::new())
}
