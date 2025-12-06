/**
 * TITANE∞ v∞ Phase 5 - Node-Cluster (Super-Prompt P)
 * Mesh Layer - Réseau distribué peer-to-peer
 */
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;

/// Macro for safe mutex locking
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[MeshLayer] Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

use std::sync::{Arc, Mutex};
use tokio::net::UdpSocket;
use tokio::time::{interval, Duration};

// ══════════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeInfo {
    pub id: String,
    pub addr: SocketAddr,
    pub role: NodeRole,
    pub health: u8,     // 0-100
    pub load: u8,       // 0-100
    pub last_seen: u64, // timestamp
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum NodeRole {
    Root,    // Main authority
    Worker,  // Computation node
    Storage, // Data storage
    Monitor, // Observation
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MeshMessage {
    Discover {
        node_id: String,
    },
    DiscoverReply {
        node_info: NodeInfo,
    },
    Heartbeat {
        node_id: String,
        health: u8,
        load: u8,
    },
    StateSync {
        data: Vec<u8>,
    },
    Request {
        id: String,
        command: String,
        payload: Vec<u8>,
    },
    Response {
        id: String,
        success: bool,
        data: Vec<u8>,
    },
}

// ══════════════════════════════════════════════════════════════════
// MESH LAYER
// ══════════════════════════════════════════════════════════════════

pub struct MeshLayer {
    node_id: String,
    #[allow(dead_code)]
    role: NodeRole,
    listen_addr: SocketAddr,
    peers: Arc<Mutex<HashMap<String, NodeInfo>>>,
    socket: Option<Arc<UdpSocket>>,
}

impl MeshLayer {
    pub fn new(node_id: String, role: NodeRole, port: u16) -> Self {
        let listen_addr = format!("0.0.0.0:{}", port).parse().unwrap_or_else(|e| {
            log::error!("[MeshLayer] Parse error: {}, using default 0.0.0.0:9999", e);
            "0.0.0.0:9999".parse().expect("Hardcoded address should always parse")
        });

        Self {
            node_id,
            role,
            listen_addr,
            peers: Arc::new(Mutex::new(HashMap::new())),
            socket: None,
        }
    }

    /// Initialize mesh networking
    pub async fn initialize(&mut self) -> Result<(), String> {
        // Bind UDP socket
        let socket = UdpSocket::bind(self.listen_addr)
            .await
            .map_err(|e| format!("Failed to bind socket: {}", e))?;

        self.socket = Some(Arc::new(socket));

        println!("[MeshLayer] Initialized on {}", self.listen_addr);

        // Start background tasks
        self.start_discovery().await;
        self.start_heartbeat().await;

        Ok(())
    }

    /// Peer discovery via mDNS/broadcast
    async fn start_discovery(&self) {
        let socket = match self.socket.as_ref() {
            Some(s) => s.clone(),
            None => {
                log::error!("[MeshLayer] Socket not initialized for discovery");
                return;
            }
        };
        let node_id = self.node_id.clone();
        let peers = self.peers.clone();

        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(10));

            loop {
                interval.tick().await;

                // Broadcast discovery message
                let msg = MeshMessage::Discover {
                    node_id: node_id.clone(),
                };
                let serialized = match serde_json::to_vec(&msg) {
                    Ok(s) => s,
                    Err(e) => {
                        log::error!("[MeshLayer] Serialization error: {}", e);
                        continue;
                    }
                };

                // Broadcast to local network (255.255.255.255)
                let broadcast_addr: SocketAddr = match "255.255.255.255:9999".parse() {
                    Ok(addr) => addr,
                    Err(e) => {
                        log::error!("[MeshLayer] Parse error: {}", e);
                        continue;
                    }
                };
                let _ = socket.send_to(&serialized, broadcast_addr).await;

                // Clean up stale peers (>30s without heartbeat)
                let now = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .map(|d| d.as_secs())
                    .unwrap_or(0);

                lock_or_recover!(peers).retain(|_, node| now - node.last_seen < 30);
            }
        });
    }

    /// Heartbeat to keep peers alive
    async fn start_heartbeat(&self) {
        let socket = match self.socket.as_ref() {
            Some(s) => s.clone(),
            None => {
                log::error!("[MeshLayer] Socket not initialized for heartbeat");
                return;
            }
        };
        let node_id = self.node_id.clone();
        let peers = self.peers.clone();

        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(5));

            loop {
                interval.tick().await;

                // Send heartbeat to all known peers
                let peer_addrs: Vec<SocketAddr> =
                    lock_or_recover!(peers).values().map(|n| n.addr).collect();

                for addr in peer_addrs {
                    let msg = MeshMessage::Heartbeat {
                        node_id: node_id.clone(),
                        health: 100,
                        load: 50,
                    };
                    let serialized = match serde_json::to_vec(&msg) {
                        Ok(s) => s,
                        Err(e) => {
                            log::error!("[MeshLayer] Serialization error: {}", e);
                            continue;
                        }
                    };
                    let _ = socket.send_to(&serialized, addr).await;
                }
            }
        });
    }

    /// Add peer to cluster
    pub fn add_peer(&self, node_info: NodeInfo) {
        let mut peers = lock_or_recover!(self.peers);
        peers.insert(node_info.id.clone(), node_info);
    }

    /// Get all peers
    pub fn get_peers(&self) -> Vec<NodeInfo> {
        lock_or_recover!(self.peers).values().cloned().collect()
    }

    /// Send message to specific peer
    pub async fn send_to_peer(&self, peer_id: &str, msg: MeshMessage) -> Result<(), String> {
        let socket = self.socket.as_ref().ok_or("Socket not initialized")?;

        // Clone peer address before await (drop MutexGuard)
        let peer_addr = {
            let peers = lock_or_recover!(self.peers);
            let peer = peers.get(peer_id).ok_or("Peer not found")?;
            peer.addr
        };

        let serialized =
            serde_json::to_vec(&msg).map_err(|e| format!("Serialization failed: {}", e))?;

        socket
            .send_to(&serialized, peer_addr)
            .await
            .map_err(|e| format!("Send failed: {}", e))?;

        Ok(())
    }

    /// Broadcast message to all peers
    pub async fn broadcast(&self, msg: MeshMessage) -> Result<(), String> {
        let socket = self.socket.as_ref().ok_or("Socket not initialized")?;

        // Clone all peer addresses before await (drop MutexGuard)
        let peer_addrs: Vec<_> = {
            let peers = lock_or_recover!(self.peers);
            peers.values().map(|p| p.addr).collect()
        };

        let serialized =
            serde_json::to_vec(&msg).map_err(|e| format!("Serialization failed: {}", e))?;

        for peer_addr in peer_addrs {
            let _ = socket.send_to(&serialized, peer_addr).await;
        }

        Ok(())
    }

    /// Get mesh statistics
    pub fn get_stats(&self) -> MeshStats {
        let peers = lock_or_recover!(self.peers);

        MeshStats {
            node_id: self.node_id.clone(),
            total_peers: peers.len(),
            active_peers: peers.values().filter(|n| n.health > 50).count(),
            avg_health: if peers.is_empty() {
                0
            } else {
                peers.values().map(|n| n.health as usize).sum::<usize>() / peers.len()
            } as u8,
        }
    }

    /// Shutdown mesh layer
    pub async fn shutdown(&self) {
        println!("[MeshLayer] Shutting down...");
        // Socket will be dropped automatically
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MeshStats {
    pub node_id: String,
    pub total_peers: usize,
    pub active_peers: usize,
    pub avg_health: u8,
}

// ══════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn mesh_initialize(node_id: String, port: u16) -> Result<String, String> {
    let mut mesh = MeshLayer::new(node_id.clone(), NodeRole::Worker, port);
    mesh.initialize().await?;
    Ok(format!("Mesh initialized for node {}", node_id))
}

#[tauri::command]
pub async fn mesh_get_stats() -> Result<MeshStats, String> {
    // In real impl, would access global mesh instance
    Ok(MeshStats {
        node_id: "node-1".to_string(),
        total_peers: 3,
        active_peers: 2,
        avg_health: 85,
    })
}
