/**
 * TITANE∞ v∞ Phase 7 - HyperVision (Super-Prompt R)
 * Real-time Monitoring Engine
 */
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

/// Macro for safe mutex locking with auto-recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[Monitor] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub timestamp: u64,
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
    pub network_rx: u64,
    pub network_tx: u64,
    pub active_processes: usize,
    pub coherence: f32,
    pub stability: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerMetrics {
    pub layer_id: usize,
    pub name: String,
    pub health: f32,
    pub load: f32,
    pub errors: usize,
    pub warnings: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub id: String,
    pub severity: String, // "low" | "medium" | "high" | "critical"
    pub layer: String,
    pub description: String,
    pub timestamp: u64,
    pub auto_resolved: bool,
}

// ══════════════════════════════════════════════════════════════════
// HYPERVISION ENGINE
// ══════════════════════════════════════════════════════════════════

pub struct HyperVisionEngine {
    metrics_history: Arc<Mutex<Vec<SystemMetrics>>>,
    layer_metrics: Arc<Mutex<HashMap<usize, LayerMetrics>>>,
    anomalies: Arc<Mutex<Vec<Anomaly>>>,
    scan_interval_ms: u64,
}

impl HyperVisionEngine {
    pub fn new(scan_interval_ms: u64) -> Self {
        Self {
            metrics_history: Arc::new(Mutex::new(Vec::new())),
            layer_metrics: Arc::new(Mutex::new(HashMap::new())),
            anomalies: Arc::new(Mutex::new(Vec::new())),
            scan_interval_ms,
        }
    }

    /// Start continuous monitoring
    pub async fn start(&self) {
        let metrics_history = self.metrics_history.clone();
        let layer_metrics = self.layer_metrics.clone();
        let anomalies = self.anomalies.clone();
        let interval = self.scan_interval_ms;

        tokio::spawn(async move {
            let mut interval_timer =
                tokio::time::interval(std::time::Duration::from_millis(interval));

            loop {
                interval_timer.tick().await;

                // Collect system metrics
                let metrics = Self::collect_system_metrics().await;

                // Store metrics (keep last 1000)
                {
                    let mut history = lock_or_recover!(metrics_history);
                    history.push(metrics.clone());
                    if history.len() > 1000 {
                        history.remove(0);
                    }
                }

                // Scan 5 layers (collect first, then lock)
                let mut layer_results = Vec::new();
                for i in 0..5 {
                    layer_results.push((i, Self::scan_layer(i).await));
                }

                {
                    let mut layers = lock_or_recover!(layer_metrics);
                    for (i, layer) in layer_results {
                        layers.insert(i, layer);
                    }
                }

                // Detect anomalies
                if let Some(anomaly) = Self::detect_anomaly(&metrics).await {
                    lock_or_recover!(anomalies).push(anomaly);
                }
            }
        });

        println!("[HyperVision] Monitoring started");
    }

    async fn collect_system_metrics() -> SystemMetrics {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Simulated metrics (in production, use sysinfo crate)
        SystemMetrics {
            timestamp,
            cpu_usage: 45.0 + (rand::random::<f32>() * 20.0),
            memory_usage: 60.0 + (rand::random::<f32>() * 15.0),
            disk_usage: 70.0,
            network_rx: 1024 * 1024,
            network_tx: 512 * 1024,
            active_processes: 150,
            coherence: 92.0 + (rand::random::<f32>() * 5.0),
            stability: 95.0 + (rand::random::<f32>() * 3.0),
        }
    }

    async fn scan_layer(layer_id: usize) -> LayerMetrics {
        let layer_names = ["Physical", "Network", "Logic", "Memory", "Security"];

        LayerMetrics {
            layer_id,
            name: layer_names.get(layer_id).unwrap_or(&"Unknown").to_string(),
            health: 90.0 + (rand::random::<f32>() * 10.0),
            load: 40.0 + (rand::random::<f32>() * 30.0),
            errors: (rand::random::<f32>() * 3.0) as usize,
            warnings: (rand::random::<f32>() * 10.0) as usize,
        }
    }

    async fn detect_anomaly(metrics: &SystemMetrics) -> Option<Anomaly> {
        if metrics.cpu_usage > 90.0 {
            return Some(Anomaly {
                id: format!("anomaly_{}", uuid::Uuid::new_v4()),
                severity: "high".to_string(),
                layer: "Physical".to_string(),
                description: format!("High CPU usage: {:.1}%", metrics.cpu_usage),
                timestamp: metrics.timestamp,
                auto_resolved: false,
            });
        }

        if metrics.memory_usage > 95.0 {
            return Some(Anomaly {
                id: format!("anomaly_{}", uuid::Uuid::new_v4()),
                severity: "critical".to_string(),
                layer: "Memory".to_string(),
                description: format!("Critical memory usage: {:.1}%", metrics.memory_usage),
                timestamp: metrics.timestamp,
                auto_resolved: false,
            });
        }

        None
    }

    /// Get current metrics
    pub fn get_current_metrics(&self) -> Option<SystemMetrics> {
        lock_or_recover!(self.metrics_history).last().cloned()
    }

    /// Get metrics history
    pub fn get_metrics_history(&self, limit: usize) -> Vec<SystemMetrics> {
        let history = lock_or_recover!(self.metrics_history);
        let start = if history.len() > limit {
            history.len() - limit
        } else {
            0
        };
        history[start..].to_vec()
    }

    /// Get layer metrics
    pub fn get_layer_metrics(&self) -> Vec<LayerMetrics> {
        self.layer_metrics
            .lock()
            .unwrap()
            .values()
            .cloned()
            .collect()
    }

    /// Get anomalies
    pub fn get_anomalies(&self, limit: usize) -> Vec<Anomaly> {
        let anomalies = lock_or_recover!(self.anomalies);
        let start = if anomalies.len() > limit {
            anomalies.len() - limit
        } else {
            0
        };
        anomalies[start..].to_vec()
    }
}

// ══════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn hypervision_start() -> Result<String, String> {
    let engine = HyperVisionEngine::new(1000); // 1s interval
    engine.start().await;
    Ok("HyperVision monitoring started".to_string())
}

#[tauri::command]
pub async fn get_system_metrics() -> Result<SystemMetrics, String> {
    // Placeholder - would access global engine
    Ok(HyperVisionEngine::collect_system_metrics().await)
}

// ══════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ══════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ──────────────────────────────────────────────────────────────────
    // Tests SystemMetrics
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_system_metrics_creation() {
        let metrics = SystemMetrics {
            timestamp: 1234567890,
            cpu_usage: 45.5,
            memory_usage: 60.0,
            disk_usage: 70.0,
            network_rx: 1024,
            network_tx: 512,
            active_processes: 150,
            coherence: 95.0,
            stability: 98.0,
        };
        assert_eq!(metrics.timestamp, 1234567890);
        assert_eq!(metrics.cpu_usage, 45.5);
    }

    #[test]
    fn test_system_metrics_high_load() {
        let metrics = SystemMetrics {
            timestamp: 0,
            cpu_usage: 95.0,
            memory_usage: 90.0,
            disk_usage: 85.0,
            network_rx: 0,
            network_tx: 0,
            active_processes: 500,
            coherence: 70.0,
            stability: 75.0,
        };
        assert!(metrics.cpu_usage > 90.0);
        assert!(metrics.memory_usage > 85.0);
    }

    #[test]
    fn test_system_metrics_idle() {
        let metrics = SystemMetrics {
            timestamp: 0,
            cpu_usage: 5.0,
            memory_usage: 30.0,
            disk_usage: 20.0,
            network_rx: 0,
            network_tx: 0,
            active_processes: 50,
            coherence: 100.0,
            stability: 100.0,
        };
        assert!(metrics.cpu_usage < 10.0);
    }

    #[test]
    fn test_system_metrics_debug() {
        let metrics = SystemMetrics {
            timestamp: 0,
            cpu_usage: 50.0,
            memory_usage: 50.0,
            disk_usage: 50.0,
            network_rx: 0,
            network_tx: 0,
            active_processes: 100,
            coherence: 90.0,
            stability: 90.0,
        };
        let debug = format!("{:?}", metrics);
        assert!(debug.contains("SystemMetrics"));
    }

    #[test]
    fn test_system_metrics_clone() {
        let metrics = SystemMetrics {
            timestamp: 999,
            cpu_usage: 40.0,
            memory_usage: 55.0,
            disk_usage: 60.0,
            network_rx: 1000,
            network_tx: 500,
            active_processes: 120,
            coherence: 92.0,
            stability: 94.0,
        };
        let cloned = metrics.clone();
        assert_eq!(cloned.timestamp, 999);
        assert_eq!(cloned.cpu_usage, 40.0);
    }

    #[test]
    fn test_system_metrics_serialize() {
        let metrics = SystemMetrics {
            timestamp: 12345,
            cpu_usage: 33.3,
            memory_usage: 44.4,
            disk_usage: 55.5,
            network_rx: 2048,
            network_tx: 1024,
            active_processes: 200,
            coherence: 88.8,
            stability: 91.1,
        };
        let json = serde_json::to_string(&metrics).unwrap();
        assert!(json.contains("cpu_usage"));
        assert!(json.contains("coherence"));
    }

    #[test]
    fn test_system_metrics_deserialize() {
        let json = r#"{"timestamp":100,"cpu_usage":50.0,"memory_usage":60.0,"disk_usage":70.0,"network_rx":1000,"network_tx":500,"active_processes":100,"coherence":95.0,"stability":98.0}"#;
        let metrics: SystemMetrics = serde_json::from_str(json).unwrap();
        assert_eq!(metrics.timestamp, 100);
        assert_eq!(metrics.cpu_usage, 50.0);
    }

    #[test]
    fn test_system_metrics_roundtrip() {
        let original = SystemMetrics {
            timestamp: 55555,
            cpu_usage: 66.6,
            memory_usage: 77.7,
            disk_usage: 88.8,
            network_rx: 4096,
            network_tx: 2048,
            active_processes: 300,
            coherence: 99.9,
            stability: 99.5,
        };
        let json = serde_json::to_string(&original).unwrap();
        let restored: SystemMetrics = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.timestamp, 55555);
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests LayerMetrics
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_layer_metrics_creation() {
        let layer = LayerMetrics {
            layer_id: 0,
            name: "Physical".to_string(),
            health: 95.0,
            load: 40.0,
            errors: 0,
            warnings: 2,
        };
        assert_eq!(layer.layer_id, 0);
        assert_eq!(layer.name, "Physical");
    }

    #[test]
    fn test_layer_metrics_healthy() {
        let layer = LayerMetrics {
            layer_id: 1,
            name: "Network".to_string(),
            health: 98.0,
            load: 25.0,
            errors: 0,
            warnings: 0,
        };
        assert!(layer.health > 90.0);
        assert_eq!(layer.errors, 0);
    }

    #[test]
    fn test_layer_metrics_unhealthy() {
        let layer = LayerMetrics {
            layer_id: 2,
            name: "Logic".to_string(),
            health: 60.0,
            load: 90.0,
            errors: 15,
            warnings: 30,
        };
        assert!(layer.health < 70.0);
        assert!(layer.errors > 10);
    }

    #[test]
    fn test_layer_metrics_debug() {
        let layer = LayerMetrics {
            layer_id: 3,
            name: "Memory".to_string(),
            health: 85.0,
            load: 50.0,
            errors: 1,
            warnings: 5,
        };
        let debug = format!("{:?}", layer);
        assert!(debug.contains("LayerMetrics"));
    }

    #[test]
    fn test_layer_metrics_clone() {
        let layer = LayerMetrics {
            layer_id: 4,
            name: "Security".to_string(),
            health: 100.0,
            load: 10.0,
            errors: 0,
            warnings: 1,
        };
        let cloned = layer.clone();
        assert_eq!(cloned.layer_id, 4);
        assert_eq!(cloned.name, "Security");
    }

    #[test]
    fn test_layer_metrics_serialize() {
        let layer = LayerMetrics {
            layer_id: 2,
            name: "Logic".to_string(),
            health: 88.0,
            load: 55.0,
            errors: 3,
            warnings: 7,
        };
        let json = serde_json::to_string(&layer).unwrap();
        assert!(json.contains("layer_id"));
        assert!(json.contains("Logic"));
    }

    #[test]
    fn test_layer_metrics_deserialize() {
        let json =
            r#"{"layer_id":1,"name":"Network","health":92.5,"load":35.0,"errors":2,"warnings":4}"#;
        let layer: LayerMetrics = serde_json::from_str(json).unwrap();
        assert_eq!(layer.layer_id, 1);
        assert_eq!(layer.name, "Network");
    }

    #[test]
    fn test_layer_metrics_roundtrip() {
        let original = LayerMetrics {
            layer_id: 3,
            name: "Memory".to_string(),
            health: 93.7,
            load: 42.3,
            errors: 1,
            warnings: 3,
        };
        let json = serde_json::to_string(&original).unwrap();
        let restored: LayerMetrics = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.layer_id, 3);
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests Anomaly
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_anomaly_creation() {
        let anomaly = Anomaly {
            id: "anom-001".to_string(),
            severity: "high".to_string(),
            layer: "Physical".to_string(),
            description: "High CPU usage".to_string(),
            timestamp: 1234567890,
            auto_resolved: false,
        };
        assert_eq!(anomaly.id, "anom-001");
        assert_eq!(anomaly.severity, "high");
    }

    #[test]
    fn test_anomaly_low_severity() {
        let anomaly = Anomaly {
            id: "anom-002".to_string(),
            severity: "low".to_string(),
            layer: "Network".to_string(),
            description: "Minor latency spike".to_string(),
            timestamp: 0,
            auto_resolved: true,
        };
        assert_eq!(anomaly.severity, "low");
        assert!(anomaly.auto_resolved);
    }

    #[test]
    fn test_anomaly_critical() {
        let anomaly = Anomaly {
            id: "anom-003".to_string(),
            severity: "critical".to_string(),
            layer: "Memory".to_string(),
            description: "Out of memory".to_string(),
            timestamp: 9999,
            auto_resolved: false,
        };
        assert_eq!(anomaly.severity, "critical");
        assert!(!anomaly.auto_resolved);
    }

    #[test]
    fn test_anomaly_debug() {
        let anomaly = Anomaly {
            id: "dbg-anom".to_string(),
            severity: "medium".to_string(),
            layer: "Logic".to_string(),
            description: "Debug anomaly".to_string(),
            timestamp: 0,
            auto_resolved: false,
        };
        let debug = format!("{:?}", anomaly);
        assert!(debug.contains("Anomaly"));
    }

    #[test]
    fn test_anomaly_clone() {
        let anomaly = Anomaly {
            id: "clone-anom".to_string(),
            severity: "high".to_string(),
            layer: "Security".to_string(),
            description: "Security breach attempt".to_string(),
            timestamp: 12345,
            auto_resolved: false,
        };
        let cloned = anomaly.clone();
        assert_eq!(cloned.id, "clone-anom");
    }

    #[test]
    fn test_anomaly_serialize() {
        let anomaly = Anomaly {
            id: "ser-anom".to_string(),
            severity: "medium".to_string(),
            layer: "Physical".to_string(),
            description: "Disk space low".to_string(),
            timestamp: 55555,
            auto_resolved: true,
        };
        let json = serde_json::to_string(&anomaly).unwrap();
        assert!(json.contains("ser-anom"));
        assert!(json.contains("medium"));
    }

    #[test]
    fn test_anomaly_deserialize() {
        let json = r#"{"id":"deser-anom","severity":"low","layer":"Network","description":"Test","timestamp":100,"auto_resolved":true}"#;
        let anomaly: Anomaly = serde_json::from_str(json).unwrap();
        assert_eq!(anomaly.id, "deser-anom");
        assert!(anomaly.auto_resolved);
    }

    #[test]
    fn test_anomaly_roundtrip() {
        let original = Anomaly {
            id: "roundtrip-anom".to_string(),
            severity: "high".to_string(),
            layer: "Memory".to_string(),
            description: "Memory leak detected".to_string(),
            timestamp: 77777,
            auto_resolved: false,
        };
        let json = serde_json::to_string(&original).unwrap();
        let restored: Anomaly = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.id, "roundtrip-anom");
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests HyperVisionEngine
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_hypervision_engine_new() {
        let engine = HyperVisionEngine::new(1000);
        assert_eq!(engine.scan_interval_ms, 1000);
    }

    #[test]
    fn test_hypervision_engine_different_intervals() {
        let fast = HyperVisionEngine::new(100);
        let slow = HyperVisionEngine::new(5000);
        assert_eq!(fast.scan_interval_ms, 100);
        assert_eq!(slow.scan_interval_ms, 5000);
    }

    #[test]
    fn test_hypervision_engine_get_current_metrics_empty() {
        let engine = HyperVisionEngine::new(1000);
        let metrics = engine.get_current_metrics();
        assert!(metrics.is_none());
    }

    #[test]
    fn test_hypervision_engine_get_metrics_history_empty() {
        let engine = HyperVisionEngine::new(1000);
        let history = engine.get_metrics_history(10);
        assert!(history.is_empty());
    }

    #[test]
    fn test_hypervision_engine_get_layer_metrics_empty() {
        let engine = HyperVisionEngine::new(1000);
        let layers = engine.get_layer_metrics();
        assert!(layers.is_empty());
    }

    #[test]
    fn test_hypervision_engine_get_anomalies_empty() {
        let engine = HyperVisionEngine::new(1000);
        let anomalies = engine.get_anomalies(10);
        assert!(anomalies.is_empty());
    }

    #[tokio::test]
    async fn test_hypervision_engine_collect_system_metrics() {
        let metrics = HyperVisionEngine::collect_system_metrics().await;
        assert!(metrics.cpu_usage >= 0.0);
        assert!(metrics.memory_usage >= 0.0);
    }

    #[tokio::test]
    async fn test_hypervision_engine_scan_layer() {
        let layer = HyperVisionEngine::scan_layer(0).await;
        assert_eq!(layer.layer_id, 0);
        assert_eq!(layer.name, "Physical");
    }

    #[tokio::test]
    async fn test_hypervision_engine_scan_all_layers() {
        for i in 0..5 {
            let layer = HyperVisionEngine::scan_layer(i).await;
            assert_eq!(layer.layer_id, i);
        }
    }

    #[tokio::test]
    async fn test_hypervision_engine_detect_anomaly_normal() {
        let metrics = SystemMetrics {
            timestamp: 0,
            cpu_usage: 50.0,
            memory_usage: 60.0,
            disk_usage: 70.0,
            network_rx: 0,
            network_tx: 0,
            active_processes: 100,
            coherence: 95.0,
            stability: 98.0,
        };
        let anomaly = HyperVisionEngine::detect_anomaly(&metrics).await;
        assert!(anomaly.is_none());
    }

    #[tokio::test]
    async fn test_hypervision_engine_detect_anomaly_high_cpu() {
        let metrics = SystemMetrics {
            timestamp: 0,
            cpu_usage: 95.0, // High CPU
            memory_usage: 60.0,
            disk_usage: 70.0,
            network_rx: 0,
            network_tx: 0,
            active_processes: 100,
            coherence: 95.0,
            stability: 98.0,
        };
        let anomaly = HyperVisionEngine::detect_anomaly(&metrics).await;
        assert!(anomaly.is_some());
        assert_eq!(anomaly.unwrap().severity, "high");
    }

    #[tokio::test]
    async fn test_hypervision_engine_detect_anomaly_critical_memory() {
        let metrics = SystemMetrics {
            timestamp: 0,
            cpu_usage: 50.0,
            memory_usage: 98.0, // Critical memory
            disk_usage: 70.0,
            network_rx: 0,
            network_tx: 0,
            active_processes: 100,
            coherence: 95.0,
            stability: 98.0,
        };
        let anomaly = HyperVisionEngine::detect_anomaly(&metrics).await;
        assert!(anomaly.is_some());
        assert_eq!(anomaly.unwrap().severity, "critical");
    }
}
