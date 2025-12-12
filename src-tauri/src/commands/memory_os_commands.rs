// ═══════════════════════════════════════════════════════════════════
// MEMORY OS COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
use crate::error::TitaneError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryNode {
    pub id: String,
    pub layer: String,
    pub data: HashMap<String, serde_json::Value>,
    pub created_at: u64,
    pub access_count: u32,
}

lazy_static! {
    static ref MEMORY_NODES: Mutex<Vec<MemoryNode>> = Mutex::new(Vec::new());
}

#[tauri::command]
pub async fn memory_clear() -> Result<(), TitaneError> {
    log::info!("[MEMORY_OS] memory_clear called");
    
    let mut nodes = MEMORY_NODES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock MEMORY_NODES: {}", e)))?;
    
    let count = nodes.len();
    nodes.clear();
    
    log::info!("[MEMORY_OS] ✅ Cleared {} memory nodes", count);
    Ok(())
}

#[tauri::command]
pub async fn memory_promote(node_id: String) -> Result<(), TitaneError> {
    log::info!("[MEMORY_OS] memory_promote: {}", node_id);
    
    let mut nodes = MEMORY_NODES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock MEMORY_NODES: {}", e)))?;
    
    if let Some(node) = nodes.iter_mut().find(|n| n.id == node_id) {
        node.layer = match node.layer.as_str() {
            "STM" => "MTM".to_string(),
            "MTM" => "LTM".to_string(),
            "LTM" => "LTM".to_string(),
            _ => node.layer.clone(),
        };
        
        log::info!("[MEMORY_OS] ✅ Promoted node '{}' to {}", node_id, node.layer);
        Ok(())
    } else {
        Err(TitaneError::InternalError(format!("Memory node not found: {}", node_id)))
    }
}

#[tauri::command]
pub async fn memory_demote(node_id: String) -> Result<(), TitaneError> {
    log::info!("[MEMORY_OS] memory_demote: {}", node_id);
    
    let mut nodes = MEMORY_NODES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock MEMORY_NODES: {}", e)))?;
    
    if let Some(node) = nodes.iter_mut().find(|n| n.id == node_id) {
        node.layer = match node.layer.as_str() {
            "LTM" => "MTM".to_string(),
            "MTM" => "STM".to_string(),
            "STM" => "STM".to_string(),
            _ => node.layer.clone(),
        };
        
        log::info!("[MEMORY_OS] ✅ Demoted node '{}' to {}", node_id, node.layer);
        Ok(())
    } else {
        Err(TitaneError::InternalError(format!("Memory node not found: {}", node_id)))
    }
}

#[tauri::command]
pub async fn memory_delete(node_id: String) -> Result<(), TitaneError> {
    log::info!("[MEMORY_OS] memory_delete: {}", node_id);
    
    let mut nodes = MEMORY_NODES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock MEMORY_NODES: {}", e)))?;
    
    nodes.retain(|n| n.id != node_id);
    
    log::info!("[MEMORY_OS] ✅ Deleted memory node '{}'", node_id);
    Ok(())
}

#[tauri::command]
pub async fn memory_prune() -> Result<u32, TitaneError> {
    log::info!("[MEMORY_OS] memory_prune called");
    
    let mut nodes = MEMORY_NODES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock MEMORY_NODES: {}", e)))?;
    
    let initial_count = nodes.len();
    
    if nodes.len() > 1000 {
        nodes.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        nodes.truncate(1000);
    }
    
    let pruned = (initial_count - nodes.len()) as u32;
    
    log::info!("[MEMORY_OS] ✅ Pruned {} memory nodes", pruned);
    Ok(pruned)
}
