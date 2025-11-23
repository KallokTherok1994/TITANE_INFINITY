use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration d'un core dans un profil
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreConfig {
    pub name: String,
    pub enabled: bool,
    pub config: serde_json::Value,
    pub priority: u8, // 0-255, pour ordonnancement
}

/// Profil système avec ensemble de cores
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemProfile {
    pub name: String,
    pub description: String,
    pub enabled_cores: Vec<CoreConfig>,
}

impl SystemProfile {
    pub fn get_enabled_cores(&self) -> Vec<&CoreConfig> {
        self.enabled_cores
            .iter()
            .filter(|c| c.enabled)
            .collect()
    }

    pub fn get_core_config(&self, core_name: &str) -> Option<&CoreConfig> {
        self.enabled_cores
            .iter()
            .find(|c| c.name == core_name)
    }
}

/// Profil minimal: cores essentiels uniquement
pub fn minimal_profile() -> SystemProfile {
    SystemProfile {
        name: "minimal".into(),
        description: "Cores essentiels: monitoring + coherence".into(),
        enabled_cores: vec![
            CoreConfig {
                name: "helios".into(),
                enabled: true,
                config: serde_json::json!({
                    "poll_interval_ms": 2000,
                    "enable_disk_monitoring": false,
                }),
                priority: 255,
            },
            CoreConfig {
                name: "nexus".into(),
                enabled: true,
                config: serde_json::json!({
                    "validation_interval_ms": 5000,
                }),
                priority: 200,
            },
        ],
    }
}

/// Profil standard: production normale
pub fn standard_profile() -> SystemProfile {
    SystemProfile {
        name: "standard".into(),
        description: "Configuration production standard".into(),
        enabled_cores: vec![
            CoreConfig {
                name: "helios".into(),
                enabled: true,
                config: serde_json::json!({
                    "poll_interval_ms": 1000,
                }),
                priority: 255,
            },
            CoreConfig {
                name: "nexus".into(),
                enabled: true,
                config: serde_json::json!({}),
                priority: 200,
            },
            CoreConfig {
                name: "harmonia".into(),
                enabled: true,
                config: serde_json::json!({}),
                priority: 180,
            },
            CoreConfig {
                name: "sentinel".into(),
                enabled: true,
                config: serde_json::json!({
                    "scan_interval_ms": 10000,
                }),
                priority: 170,
            },
            CoreConfig {
                name: "memory".into(),
                enabled: true,
                config: serde_json::json!({
                    "max_entries": 10000,
                }),
                priority: 160,
            },
            CoreConfig {
                name: "selfheal".into(),
                enabled: true,
                config: serde_json::json!({
                    "auto_repair": true,
                }),
                priority: 150,
            },
            CoreConfig {
                name: "emotion".into(),
                enabled: true,
                config: serde_json::json!({
                    "detection_interval_ms": 500,
                }),
                priority: 100,
            },
            CoreConfig {
                name: "interruptibility".into(),
                enabled: true,
                config: serde_json::json!({
                    "analysis_depth": "medium",
                }),
                priority: 90,
            },
        ],
    }
}

/// Profil extended: toutes fonctionnalités
pub fn extended_profile() -> SystemProfile {
    let mut profile = standard_profile();
    profile.name = "extended".into();
    profile.description = "Toutes fonctionnalités + modules avancés".into();

    profile.enabled_cores.extend(vec![
        CoreConfig {
            name: "cognitive_engine".into(),
            enabled: true,
            config: serde_json::json!({
                "enable_three_centers": true,
                "mental_tracking": true,
                "heart_alignment": true,
                "body_monitoring": true,
            }),
            priority: 80,
        },
        CoreConfig {
            name: "compression".into(),
            enabled: true,
            config: serde_json::json!({
                "compression_ratio": 0.7,
            }),
            priority: 70,
        },
        CoreConfig {
            name: "noise_adaptive".into(),
            enabled: true,
            config: serde_json::json!({
                "auto_calibration": true,
            }),
            priority: 60,
        },
        CoreConfig {
            name: "evolutive_twin".into(),
            enabled: true,
            config: serde_json::json!({
                "p85_enabled": true,
                "sync_interval_ms": 2000,
            }),
            priority: 50,
        },
    ]);

    profile
}

/// Profil lab: features expérimentales
pub fn lab_profile() -> SystemProfile {
    let mut profile = extended_profile();
    profile.name = "lab".into();
    profile.description = "Expérimental: IA v8, quantum, dream analyzer".into();

    profile.enabled_cores.extend(vec![
        CoreConfig {
            name: "ia_v8".into(),
            enabled: true,
            config: serde_json::json!({
                "model": "experimental",
                "reasoning_mode": "advanced",
            }),
            priority: 40,
        },
        CoreConfig {
            name: "quantum_optimization".into(),
            enabled: true,
            config: serde_json::json!({
                "quantum_backend": "simulator",
            }),
            priority: 30,
        },
        CoreConfig {
            name: "dream_analyzer".into(),
            enabled: true,
            config: serde_json::json!({
                "analysis_depth": "deep",
            }),
            priority: 20,
        },
    ]);

    profile
}

/// Gestionnaire de profils système
pub struct ProfileManager {
    profiles: HashMap<String, SystemProfile>,
    active_profile_name: String,
}

impl ProfileManager {
    pub fn new() -> Self {
        let mut profiles = HashMap::new();

        profiles.insert("minimal".into(), minimal_profile());
        profiles.insert("standard".into(), standard_profile());
        profiles.insert("extended".into(), extended_profile());
        profiles.insert("lab".into(), lab_profile());

        Self {
            profiles,
            active_profile_name: "standard".into(),
        }
    }

    /// Récupère un profil par nom
    pub fn get_profile(&self, name: &str) -> Option<&SystemProfile> {
        self.profiles.get(name)
    }

    /// Récupère le profil actif
    pub fn get_active_profile(&self) -> &SystemProfile {
        self.profiles
            .get(&self.active_profile_name)
            .expect("Active profile must exist")
    }

    /// Change le profil actif
    pub fn set_active_profile(&mut self, name: String) -> Result<(), String> {
        if !self.profiles.contains_key(&name) {
            return Err(format!("Profile '{}' not found", name));
        }

        self.active_profile_name = name;
        Ok(())
    }

    /// Liste tous les profils disponibles
    pub fn list_profiles(&self) -> Vec<String> {
        self.profiles.keys().cloned().collect()
    }

    /// Ajoute un profil custom
    pub fn add_custom_profile(&mut self, profile: SystemProfile) {
        self.profiles.insert(profile.name.clone(), profile);
    }

    /// Nom du profil actif
    pub fn active_profile_name(&self) -> &str {
        &self.active_profile_name
    }
}

impl Default for ProfileManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_minimal_profile() {
        let profile = minimal_profile();
        assert_eq!(profile.name, "minimal");
        assert_eq!(profile.enabled_cores.len(), 2);

        let enabled = profile.get_enabled_cores();
        assert_eq!(enabled.len(), 2);
    }

    #[test]
    fn test_standard_profile() {
        let profile = standard_profile();
        assert_eq!(profile.name, "standard");
        assert!(profile.enabled_cores.len() >= 8);
    }

    #[test]
    fn test_extended_profile() {
        let profile = extended_profile();
        assert_eq!(profile.name, "extended");
        assert!(profile.enabled_cores.len() > standard_profile().enabled_cores.len());
    }

    #[test]
    fn test_lab_profile() {
        let profile = lab_profile();
        assert_eq!(profile.name, "lab");
        assert!(profile.enabled_cores.len() > extended_profile().enabled_cores.len());

        // Vérifier présence core expérimental
        assert!(profile.get_core_config("ia_v8").is_some());
    }

    #[test]
    fn test_profile_manager() {
        let mut manager = ProfileManager::new();

        assert_eq!(manager.list_profiles().len(), 4);
        assert_eq!(manager.active_profile_name(), "standard");

        manager.set_active_profile("minimal".into()).unwrap();
        assert_eq!(manager.active_profile_name(), "minimal");

        let result = manager.set_active_profile("nonexistent".into());
        assert!(result.is_err());
    }

    #[test]
    fn test_get_core_config() {
        let profile = standard_profile();
        let helios_config = profile.get_core_config("helios");

        assert!(helios_config.is_some());
        assert_eq!(helios_config.unwrap().name, "helios");
    }
}
