/**
 * TITANE∞ v∞ - Fusion Core (Phase X)
 * Fusionne IA + Architecture Symbolique + Mémoire
 */
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FusionState {
    pub neuronal_strength: f32,
    pub symbolic_strength: f32,
    pub fusion_level: f32,
    pub coherence: f32,
    pub active_connections: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FusionReport {
    pub timestamp: u64,
    pub state: FusionState,
    pub insights: Vec<String>,
}

pub struct FusionCore {
    neuronal_data: HashMap<String, f32>,
    symbolic_data: HashMap<String, f32>,
    fusion_level: f32,
}

impl Default for FusionCore {
    fn default() -> Self {
        Self::new()
    }
}

impl FusionCore {
    pub fn new() -> Self {
        Self {
            neuronal_data: HashMap::new(),
            symbolic_data: HashMap::new(),
            fusion_level: 0.0,
        }
    }

    pub async fn fuse(&mut self) -> FusionReport {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Calcul de la force neuronale
        let neuronal_strength =
            self.neuronal_data.values().sum::<f32>() / self.neuronal_data.len().max(1) as f32;

        // Calcul de la force symbolique
        let symbolic_strength =
            self.symbolic_data.values().sum::<f32>() / self.symbolic_data.len().max(1) as f32;

        // Fusion progressive
        self.fusion_level = (neuronal_strength + symbolic_strength) / 2.0;

        let coherence = 1.0 - (neuronal_strength - symbolic_strength).abs();
        let active_connections = self.neuronal_data.len() + self.symbolic_data.len();

        let state = FusionState {
            neuronal_strength,
            symbolic_strength,
            fusion_level: self.fusion_level,
            coherence,
            active_connections,
        };

        let insights = vec![
            format!(
                "Fusion neuronale-symbolique: {:.1}%",
                self.fusion_level * 100.0
            ),
            format!("Cohérence: {:.1}%", coherence * 100.0),
            format!("{} connexions actives", active_connections),
        ];

        FusionReport {
            timestamp,
            state,
            insights,
        }
    }

    pub fn add_neuronal_data(&mut self, key: String, value: f32) {
        self.neuronal_data.insert(key, value);
    }

    pub fn add_symbolic_data(&mut self, key: String, value: f32) {
        self.symbolic_data.insert(key, value);
    }
}

#[tauri::command]
pub async fn neuro_fuse() -> Result<FusionReport, String> {
    let mut core = FusionCore::new();

    // Données d'exemple
    core.add_neuronal_data("reasoning".to_string(), 0.85);
    core.add_neuronal_data("learning".to_string(), 0.78);
    core.add_symbolic_data("architecture".to_string(), 0.82);
    core.add_symbolic_data("structure".to_string(), 0.90);

    Ok(core.fuse().await)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fusion_state_structure() {
        let state = FusionState {
            neuronal_strength: 0.8,
            symbolic_strength: 0.9,
            fusion_level: 0.85,
            coherence: 0.9,
            active_connections: 4,
        };

        assert_eq!(state.neuronal_strength, 0.8);
        assert_eq!(state.symbolic_strength, 0.9);
        assert_eq!(state.fusion_level, 0.85);
        assert_eq!(state.coherence, 0.9);
        assert_eq!(state.active_connections, 4);
    }

    #[test]
    fn test_fusion_state_clone() {
        let state = FusionState {
            neuronal_strength: 0.7,
            symbolic_strength: 0.8,
            fusion_level: 0.75,
            coherence: 0.9,
            active_connections: 2,
        };

        let cloned = state.clone();
        assert_eq!(cloned.neuronal_strength, state.neuronal_strength);
        assert_eq!(cloned.fusion_level, state.fusion_level);
    }

    #[test]
    fn test_fusion_report_structure() {
        let report = FusionReport {
            timestamp: 1234567890,
            state: FusionState {
                neuronal_strength: 0.5,
                symbolic_strength: 0.5,
                fusion_level: 0.5,
                coherence: 1.0,
                active_connections: 0,
            },
            insights: vec!["Test insight".to_string()],
        };

        assert_eq!(report.timestamp, 1234567890);
        assert_eq!(report.insights.len(), 1);
    }

    #[test]
    fn test_fusion_report_clone() {
        let report = FusionReport {
            timestamp: 1000,
            state: FusionState {
                neuronal_strength: 0.6,
                symbolic_strength: 0.7,
                fusion_level: 0.65,
                coherence: 0.9,
                active_connections: 3,
            },
            insights: vec!["Insight 1".to_string(), "Insight 2".to_string()],
        };

        let cloned = report.clone();
        assert_eq!(cloned.timestamp, 1000);
        assert_eq!(cloned.insights.len(), 2);
    }

    #[test]
    fn test_fusion_core_new() {
        let core = FusionCore::new();
        assert_eq!(core.fusion_level, 0.0);
        assert!(core.neuronal_data.is_empty());
        assert!(core.symbolic_data.is_empty());
    }

    #[test]
    fn test_fusion_core_default() {
        let core = FusionCore::default();
        assert_eq!(core.fusion_level, 0.0);
    }

    #[test]
    fn test_add_neuronal_data() {
        let mut core = FusionCore::new();
        core.add_neuronal_data("test".to_string(), 0.9);

        assert!(core.neuronal_data.contains_key("test"));
        assert_eq!(*core.neuronal_data.get("test").unwrap(), 0.9);
    }

    #[test]
    fn test_add_symbolic_data() {
        let mut core = FusionCore::new();
        core.add_symbolic_data("logic".to_string(), 0.85);

        assert!(core.symbolic_data.contains_key("logic"));
        assert_eq!(*core.symbolic_data.get("logic").unwrap(), 0.85);
    }

    #[test]
    fn test_add_multiple_data() {
        let mut core = FusionCore::new();
        core.add_neuronal_data("n1".to_string(), 0.5);
        core.add_neuronal_data("n2".to_string(), 0.7);
        core.add_symbolic_data("s1".to_string(), 0.6);
        core.add_symbolic_data("s2".to_string(), 0.8);

        assert_eq!(core.neuronal_data.len(), 2);
        assert_eq!(core.symbolic_data.len(), 2);
    }

    #[tokio::test]
    async fn test_fuse_empty() {
        let mut core = FusionCore::new();
        let report = core.fuse().await;

        // Empty data should result in 0 strength
        assert_eq!(report.state.neuronal_strength, 0.0);
        assert_eq!(report.state.symbolic_strength, 0.0);
        assert_eq!(report.state.fusion_level, 0.0);
        assert_eq!(report.state.active_connections, 0);
    }

    #[tokio::test]
    async fn test_fuse_with_data() {
        let mut core = FusionCore::new();
        core.add_neuronal_data("a".to_string(), 0.8);
        core.add_neuronal_data("b".to_string(), 0.6);
        core.add_symbolic_data("x".to_string(), 0.9);
        core.add_symbolic_data("y".to_string(), 0.7);

        let report = core.fuse().await;

        assert!(report.state.neuronal_strength > 0.0);
        assert!(report.state.symbolic_strength > 0.0);
        assert!(report.state.fusion_level > 0.0);
        assert_eq!(report.state.active_connections, 4);
    }

    #[tokio::test]
    async fn test_fuse_coherence_calculation() {
        let mut core = FusionCore::new();
        // Equal neuronal and symbolic strength should give high coherence
        core.add_neuronal_data("n".to_string(), 0.8);
        core.add_symbolic_data("s".to_string(), 0.8);

        let report = core.fuse().await;

        assert_eq!(report.state.coherence, 1.0);
    }

    #[tokio::test]
    async fn test_fuse_coherence_low() {
        let mut core = FusionCore::new();
        // Different strengths should give lower coherence
        core.add_neuronal_data("n".to_string(), 1.0);
        core.add_symbolic_data("s".to_string(), 0.0);

        let report = core.fuse().await;

        assert!(report.state.coherence < 1.0);
        assert_eq!(report.state.coherence, 0.0);
    }

    #[tokio::test]
    async fn test_fuse_insights_generated() {
        let mut core = FusionCore::new();
        core.add_neuronal_data("test".to_string(), 0.5);
        core.add_symbolic_data("test".to_string(), 0.5);

        let report = core.fuse().await;

        assert!(!report.insights.is_empty());
        assert!(report.insights.len() >= 3);
    }

    #[tokio::test]
    async fn test_fuse_timestamp() {
        let mut core = FusionCore::new();
        let report = core.fuse().await;

        assert!(report.timestamp > 0);
    }

    #[tokio::test]
    async fn test_fuse_updates_fusion_level() {
        let mut core = FusionCore::new();
        assert_eq!(core.fusion_level, 0.0);

        core.add_neuronal_data("n".to_string(), 0.8);
        core.add_symbolic_data("s".to_string(), 0.8);

        let _ = core.fuse().await;

        assert_eq!(core.fusion_level, 0.8);
    }

    #[test]
    fn test_overwrite_data() {
        let mut core = FusionCore::new();
        core.add_neuronal_data("key".to_string(), 0.5);
        core.add_neuronal_data("key".to_string(), 0.9);

        assert_eq!(core.neuronal_data.len(), 1);
        assert_eq!(*core.neuronal_data.get("key").unwrap(), 0.9);
    }

    #[tokio::test]
    async fn test_fusion_level_average() {
        let mut core = FusionCore::new();
        // Average of 0.4 (neuronal) and 0.6 (symbolic) = 0.5
        core.add_neuronal_data("n".to_string(), 0.4);
        core.add_symbolic_data("s".to_string(), 0.6);

        let report = core.fuse().await;

        assert!((report.state.fusion_level - 0.5).abs() < 0.01);
    }

    #[tokio::test]
    async fn test_neuro_fuse_command() {
        let result = neuro_fuse().await;
        assert!(result.is_ok());

        let report = result.unwrap();
        assert!(report.state.active_connections > 0);
        assert!(report.state.fusion_level > 0.0);
    }
}
