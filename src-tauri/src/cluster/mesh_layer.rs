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
            "0.0.0.0:9999"
                .parse()
                .expect("Hardcoded address should always parse")
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

// ══════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ══════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ──────────────────────────────────────────────────────────────────
    // Tests NodeRole
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_node_role_root() {
        let role = NodeRole::Root;
        assert!(matches!(role, NodeRole::Root));
    }

    #[test]
    fn test_node_role_worker() {
        let role = NodeRole::Worker;
        assert!(matches!(role, NodeRole::Worker));
    }

    #[test]
    fn test_node_role_storage() {
        let role = NodeRole::Storage;
        assert!(matches!(role, NodeRole::Storage));
    }

    #[test]
    fn test_node_role_monitor() {
        let role = NodeRole::Monitor;
        assert!(matches!(role, NodeRole::Monitor));
    }

    #[test]
    fn test_node_role_debug() {
        let role = NodeRole::Worker;
        let debug = format!("{:?}", role);
        assert!(debug.contains("Worker"));
    }

    #[test]
    fn test_node_role_clone() {
        let role = NodeRole::Storage;
        let cloned = role.clone();
        assert!(matches!(cloned, NodeRole::Storage));
    }

    #[test]
    fn test_node_role_eq() {
        let role1 = NodeRole::Root;
        let role2 = NodeRole::Root;
        let role3 = NodeRole::Worker;
        assert_eq!(role1, role2);
        assert_ne!(role1, role3);
    }

    #[test]
    fn test_node_role_serialize() {
        let role = NodeRole::Monitor;
        let json = serde_json::to_string(&role).unwrap();
        assert!(json.contains("Monitor"));
    }

    #[test]
    fn test_node_role_deserialize() {
        let json = r#""Worker""#;
        let role: NodeRole = serde_json::from_str(json).unwrap();
        assert!(matches!(role, NodeRole::Worker));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests NodeInfo
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_node_info_creation() {
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        let node = NodeInfo {
            id: "node-1".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 100,
            load: 50,
            last_seen: 1234567890,
            capabilities: vec!["compute".to_string()],
        };
        assert_eq!(node.id, "node-1");
        assert_eq!(node.health, 100);
    }

    #[test]
    fn test_node_info_healthy() {
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        let node = NodeInfo {
            id: "healthy".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 95,
            load: 20,
            last_seen: 0,
            capabilities: vec![],
        };
        assert!(node.health > 50);
    }

    #[test]
    fn test_node_info_unhealthy() {
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        let node = NodeInfo {
            id: "unhealthy".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 30,
            load: 90,
            last_seen: 0,
            capabilities: vec![],
        };
        assert!(node.health <= 50);
    }

    #[test]
    fn test_node_info_debug() {
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        let node = NodeInfo {
            id: "debug-node".to_string(),
            addr,
            role: NodeRole::Root,
            health: 100,
            load: 0,
            last_seen: 0,
            capabilities: vec![],
        };
        let debug = format!("{:?}", node);
        assert!(debug.contains("NodeInfo"));
    }

    #[test]
    fn test_node_info_clone() {
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        let node = NodeInfo {
            id: "clone-test".to_string(),
            addr,
            role: NodeRole::Storage,
            health: 80,
            load: 40,
            last_seen: 999,
            capabilities: vec!["storage".to_string()],
        };
        let cloned = node.clone();
        assert_eq!(cloned.id, "clone-test");
        assert_eq!(cloned.health, 80);
    }

    #[test]
    fn test_node_info_serialize() {
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        let node = NodeInfo {
            id: "ser-node".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 75,
            load: 60,
            last_seen: 12345,
            capabilities: vec!["cap1".to_string()],
        };
        let json = serde_json::to_string(&node).unwrap();
        assert!(json.contains("ser-node"));
        assert!(json.contains("health"));
    }

    #[test]
    fn test_node_info_deserialize() {
        let json = r#"{"id":"deser-node","addr":"192.168.1.1:9000","role":"Root","health":90,"load":10,"last_seen":0,"capabilities":[]}"#;
        let node: NodeInfo = serde_json::from_str(json).unwrap();
        assert_eq!(node.id, "deser-node");
        assert_eq!(node.health, 90);
    }

    #[test]
    fn test_node_info_roundtrip() {
        let addr: SocketAddr = "10.0.0.1:5000".parse().unwrap();
        let original = NodeInfo {
            id: "roundtrip".to_string(),
            addr,
            role: NodeRole::Monitor,
            health: 85,
            load: 35,
            last_seen: 999999,
            capabilities: vec!["mon".to_string(), "log".to_string()],
        };
        let json = serde_json::to_string(&original).unwrap();
        let restored: NodeInfo = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.id, "roundtrip");
        assert_eq!(restored.capabilities.len(), 2);
    }

    #[test]
    fn test_node_info_with_many_capabilities() {
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        let node = NodeInfo {
            id: "multi-cap".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 100,
            load: 25,
            last_seen: 0,
            capabilities: vec![
                "compute".to_string(),
                "storage".to_string(),
                "network".to_string(),
            ],
        };
        assert_eq!(node.capabilities.len(), 3);
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests MeshMessage
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_mesh_message_discover() {
        let msg = MeshMessage::Discover {
            node_id: "discover-node".to_string(),
        };
        if let MeshMessage::Discover { node_id } = msg {
            assert_eq!(node_id, "discover-node");
        }
    }

    #[test]
    fn test_mesh_message_discover_reply() {
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        let node_info = NodeInfo {
            id: "reply-node".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 100,
            load: 0,
            last_seen: 0,
            capabilities: vec![],
        };
        let msg = MeshMessage::DiscoverReply { node_info };
        assert!(matches!(msg, MeshMessage::DiscoverReply { .. }));
    }

    #[test]
    fn test_mesh_message_heartbeat() {
        let msg = MeshMessage::Heartbeat {
            node_id: "hb-node".to_string(),
            health: 95,
            load: 30,
        };
        if let MeshMessage::Heartbeat {
            node_id,
            health,
            load,
        } = msg
        {
            assert_eq!(node_id, "hb-node");
            assert_eq!(health, 95);
            assert_eq!(load, 30);
        }
    }

    #[test]
    fn test_mesh_message_state_sync() {
        let msg = MeshMessage::StateSync {
            data: vec![1, 2, 3, 4, 5],
        };
        if let MeshMessage::StateSync { data } = msg {
            assert_eq!(data.len(), 5);
        }
    }

    #[test]
    fn test_mesh_message_request() {
        let msg = MeshMessage::Request {
            id: "req-1".to_string(),
            command: "execute".to_string(),
            payload: vec![10, 20, 30],
        };
        if let MeshMessage::Request {
            id,
            command,
            payload,
        } = msg
        {
            assert_eq!(id, "req-1");
            assert_eq!(command, "execute");
            assert_eq!(payload.len(), 3);
        }
    }

    #[test]
    fn test_mesh_message_response_success() {
        let msg = MeshMessage::Response {
            id: "resp-1".to_string(),
            success: true,
            data: vec![100],
        };
        if let MeshMessage::Response { id, success, data } = msg {
            assert_eq!(id, "resp-1");
            assert!(success);
            assert_eq!(data.len(), 1);
        }
    }

    #[test]
    fn test_mesh_message_response_failure() {
        let msg = MeshMessage::Response {
            id: "resp-fail".to_string(),
            success: false,
            data: vec![],
        };
        if let MeshMessage::Response { success, .. } = msg {
            assert!(!success);
        }
    }

    #[test]
    fn test_mesh_message_debug() {
        let msg = MeshMessage::Discover {
            node_id: "dbg".to_string(),
        };
        let debug = format!("{:?}", msg);
        assert!(debug.contains("Discover"));
    }

    #[test]
    fn test_mesh_message_clone() {
        let msg = MeshMessage::Heartbeat {
            node_id: "clone-hb".to_string(),
            health: 80,
            load: 40,
        };
        let cloned = msg.clone();
        if let MeshMessage::Heartbeat { node_id, .. } = cloned {
            assert_eq!(node_id, "clone-hb");
        }
    }

    #[test]
    fn test_mesh_message_serialize_discover() {
        let msg = MeshMessage::Discover {
            node_id: "ser-disc".to_string(),
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("Discover"));
        assert!(json.contains("ser-disc"));
    }

    #[test]
    fn test_mesh_message_serialize_heartbeat() {
        let msg = MeshMessage::Heartbeat {
            node_id: "ser-hb".to_string(),
            health: 99,
            load: 1,
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("Heartbeat"));
    }

    #[test]
    fn test_mesh_message_deserialize_discover() {
        let json = r#"{"Discover":{"node_id":"deser-node"}}"#;
        let msg: MeshMessage = serde_json::from_str(json).unwrap();
        if let MeshMessage::Discover { node_id } = msg {
            assert_eq!(node_id, "deser-node");
        }
    }

    #[test]
    fn test_mesh_message_deserialize_heartbeat() {
        let json = r#"{"Heartbeat":{"node_id":"hb-deser","health":75,"load":25}}"#;
        let msg: MeshMessage = serde_json::from_str(json).unwrap();
        if let MeshMessage::Heartbeat {
            node_id,
            health,
            load,
        } = msg
        {
            assert_eq!(node_id, "hb-deser");
            assert_eq!(health, 75);
            assert_eq!(load, 25);
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests MeshStats
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_mesh_stats_creation() {
        let stats = MeshStats {
            node_id: "stat-node".to_string(),
            total_peers: 10,
            active_peers: 8,
            avg_health: 90,
        };
        assert_eq!(stats.node_id, "stat-node");
        assert_eq!(stats.total_peers, 10);
        assert_eq!(stats.active_peers, 8);
    }

    #[test]
    fn test_mesh_stats_empty() {
        let stats = MeshStats {
            node_id: "empty".to_string(),
            total_peers: 0,
            active_peers: 0,
            avg_health: 0,
        };
        assert_eq!(stats.total_peers, 0);
    }

    #[test]
    fn test_mesh_stats_debug() {
        let stats = MeshStats {
            node_id: "dbg".to_string(),
            total_peers: 5,
            active_peers: 3,
            avg_health: 75,
        };
        let debug = format!("{:?}", stats);
        assert!(debug.contains("MeshStats"));
    }

    #[test]
    fn test_mesh_stats_serialize() {
        let stats = MeshStats {
            node_id: "ser-stats".to_string(),
            total_peers: 15,
            active_peers: 12,
            avg_health: 85,
        };
        let json = serde_json::to_string(&stats).unwrap();
        assert!(json.contains("total_peers"));
        assert!(json.contains("avg_health"));
    }

    #[test]
    fn test_mesh_stats_deserialize() {
        let json =
            r#"{"node_id":"deser-stats","total_peers":20,"active_peers":18,"avg_health":92}"#;
        let stats: MeshStats = serde_json::from_str(json).unwrap();
        assert_eq!(stats.node_id, "deser-stats");
        assert_eq!(stats.total_peers, 20);
        assert_eq!(stats.avg_health, 92);
    }

    #[test]
    fn test_mesh_stats_roundtrip() {
        let original = MeshStats {
            node_id: "roundtrip-stats".to_string(),
            total_peers: 7,
            active_peers: 5,
            avg_health: 80,
        };
        let json = serde_json::to_string(&original).unwrap();
        let restored: MeshStats = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.node_id, "roundtrip-stats");
        assert_eq!(restored.total_peers, 7);
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests MeshLayer
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_mesh_layer_new() {
        let mesh = MeshLayer::new("test-node".to_string(), NodeRole::Worker, 9999);
        assert_eq!(mesh.node_id, "test-node");
    }

    #[test]
    fn test_mesh_layer_new_root() {
        let mesh = MeshLayer::new("root-node".to_string(), NodeRole::Root, 8888);
        let stats = mesh.get_stats();
        assert_eq!(stats.node_id, "root-node");
    }

    #[test]
    fn test_mesh_layer_new_different_ports() {
        let mesh1 = MeshLayer::new("node1".to_string(), NodeRole::Worker, 5000);
        let mesh2 = MeshLayer::new("node2".to_string(), NodeRole::Storage, 5001);
        assert_eq!(mesh1.node_id, "node1");
        assert_eq!(mesh2.node_id, "node2");
    }

    #[test]
    fn test_mesh_layer_get_peers_empty() {
        let mesh = MeshLayer::new("empty-node".to_string(), NodeRole::Worker, 9999);
        let peers = mesh.get_peers();
        assert!(peers.is_empty());
    }

    #[test]
    fn test_mesh_layer_add_peer() {
        let mesh = MeshLayer::new("host".to_string(), NodeRole::Root, 9999);
        let addr: SocketAddr = "192.168.1.100:9999".parse().unwrap();
        let peer = NodeInfo {
            id: "peer-1".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 100,
            load: 0,
            last_seen: 0,
            capabilities: vec![],
        };
        mesh.add_peer(peer);
        let peers = mesh.get_peers();
        assert_eq!(peers.len(), 1);
    }

    #[test]
    fn test_mesh_layer_add_multiple_peers() {
        let mesh = MeshLayer::new("host".to_string(), NodeRole::Root, 9999);
        for i in 0..5 {
            let addr: SocketAddr = format!("192.168.1.{}:9999", 100 + i).parse().unwrap();
            let peer = NodeInfo {
                id: format!("peer-{}", i),
                addr,
                role: NodeRole::Worker,
                health: 100,
                load: 0,
                last_seen: 0,
                capabilities: vec![],
            };
            mesh.add_peer(peer);
        }
        let peers = mesh.get_peers();
        assert_eq!(peers.len(), 5);
    }

    #[test]
    fn test_mesh_layer_get_stats_empty() {
        let mesh = MeshLayer::new("stats-node".to_string(), NodeRole::Monitor, 9999);
        let stats = mesh.get_stats();
        assert_eq!(stats.total_peers, 0);
        assert_eq!(stats.active_peers, 0);
        assert_eq!(stats.avg_health, 0);
    }

    #[test]
    fn test_mesh_layer_get_stats_with_peers() {
        let mesh = MeshLayer::new("host".to_string(), NodeRole::Root, 9999);

        // Add healthy peer
        let addr1: SocketAddr = "192.168.1.100:9999".parse().unwrap();
        mesh.add_peer(NodeInfo {
            id: "healthy-peer".to_string(),
            addr: addr1,
            role: NodeRole::Worker,
            health: 90,
            load: 20,
            last_seen: 0,
            capabilities: vec![],
        });

        // Add unhealthy peer
        let addr2: SocketAddr = "192.168.1.101:9999".parse().unwrap();
        mesh.add_peer(NodeInfo {
            id: "unhealthy-peer".to_string(),
            addr: addr2,
            role: NodeRole::Worker,
            health: 30,
            load: 80,
            last_seen: 0,
            capabilities: vec![],
        });

        let stats = mesh.get_stats();
        assert_eq!(stats.total_peers, 2);
        assert_eq!(stats.active_peers, 1); // Only one with health > 50
    }

    #[test]
    fn test_mesh_layer_replace_peer() {
        let mesh = MeshLayer::new("host".to_string(), NodeRole::Root, 9999);
        let addr: SocketAddr = "192.168.1.100:9999".parse().unwrap();

        // Add peer
        mesh.add_peer(NodeInfo {
            id: "peer-1".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 50,
            load: 50,
            last_seen: 0,
            capabilities: vec![],
        });

        // Replace same peer with updated info
        mesh.add_peer(NodeInfo {
            id: "peer-1".to_string(),
            addr,
            role: NodeRole::Worker,
            health: 100,
            load: 10,
            last_seen: 1,
            capabilities: vec!["upgraded".to_string()],
        });

        let peers = mesh.get_peers();
        assert_eq!(peers.len(), 1);
        assert_eq!(peers[0].health, 100);
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests async
    // ──────────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_mesh_layer_send_to_peer_no_socket() {
        let mesh = MeshLayer::new("test".to_string(), NodeRole::Worker, 9999);
        let msg = MeshMessage::Discover {
            node_id: "test".to_string(),
        };
        let result = mesh.send_to_peer("unknown", msg).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_mesh_layer_broadcast_no_socket() {
        let mesh = MeshLayer::new("test".to_string(), NodeRole::Worker, 9999);
        let msg = MeshMessage::Heartbeat {
            node_id: "test".to_string(),
            health: 100,
            load: 0,
        };
        let result = mesh.broadcast(msg).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_mesh_layer_shutdown() {
        let mesh = MeshLayer::new("shutdown-test".to_string(), NodeRole::Worker, 9999);
        mesh.shutdown().await;
        // Should complete without panic
    }
}
