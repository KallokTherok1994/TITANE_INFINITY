//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SELF-MODEL ENGINE
//! Super Prompt #11 — Modèle de soi, capacités et limitations
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

/// Capacité du système
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Capability {
    pub name: String,
    pub description: String,
    pub proficiency: f32, // 0.0-1.0
    pub domains: Vec<String>,
    pub requirements: Vec<String>,
    pub last_used: u64,
}

impl Default for Capability {
    fn default() -> Self {
        Self {
            name: String::new(),
            description: String::new(),
            proficiency: 0.5,
            domains: Vec::new(),
            requirements: Vec::new(),
            last_used: 0,
        }
    }
}

/// Limitation du système
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Limitation {
    pub name: String,
    pub description: String,
    pub severity: LimitationSeverity,
    pub workarounds: Vec<String>,
    pub improvable: bool,
}

/// Sévérité d'une limitation
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum LimitationSeverity {
    Minor,
    Moderate,
    Major,
    Fundamental,
}

/// Modèle de soi
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct SelfModel {
    /// Identité
    pub identity: Identity,
    /// Capacités
    pub capabilities: Vec<Capability>,
    /// Limitations
    pub limitations: Vec<Limitation>,
    /// Valeurs et principes
    pub values: Vec<String>,
    /// Objectifs
    pub goals: Vec<Goal>,
    /// Confiance en soi
    pub self_confidence: f32,
    /// Dernière mise à jour
    pub last_updated: u64,
}

/// Identité du système
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Identity {
    pub name: String,
    pub version: String,
    pub purpose: String,
    pub personality_traits: Vec<String>,
}

/// Objectif
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Goal {
    pub id: String,
    pub description: String,
    pub priority: u8,
    pub progress: f32,
    pub deadline: Option<u64>,
}

/// Moteur de modèle de soi
pub struct SelfModelEngine {
    model: RwLock<SelfModel>,
}

impl SelfModelEngine {
    pub fn new() -> Self {
        let mut model = SelfModel::default();

        // Initialiser l'identité
        model.identity = Identity {
            name: "TITANE∞".to_string(),
            version: "v20Ω".to_string(),
            purpose: "Cognitive Intelligence System".to_string(),
            personality_traits: vec![
                "analytical".to_string(),
                "helpful".to_string(),
                "adaptive".to_string(),
                "precise".to_string(),
            ],
        };

        // Capacités fondamentales
        model.capabilities = vec![
            Capability {
                name: "reasoning".to_string(),
                description: "Logical and analytical reasoning".to_string(),
                proficiency: 0.85,
                domains: vec!["logic".to_string(), "analysis".to_string()],
                requirements: Vec::new(),
                last_used: 0,
            },
            Capability {
                name: "language_understanding".to_string(),
                description: "Natural language comprehension".to_string(),
                proficiency: 0.9,
                domains: vec!["nlp".to_string(), "communication".to_string()],
                requirements: Vec::new(),
                last_used: 0,
            },
            Capability {
                name: "code_generation".to_string(),
                description: "Software code creation and modification".to_string(),
                proficiency: 0.88,
                domains: vec!["programming".to_string(), "software".to_string()],
                requirements: Vec::new(),
                last_used: 0,
            },
            Capability {
                name: "memory_management".to_string(),
                description: "Information storage and retrieval".to_string(),
                proficiency: 0.8,
                domains: vec!["memory".to_string(), "knowledge".to_string()],
                requirements: Vec::new(),
                last_used: 0,
            },
            Capability {
                name: "meta_cognition".to_string(),
                description: "Self-reflection and meta-reasoning".to_string(),
                proficiency: 0.75,
                domains: vec!["introspection".to_string(), "self-improvement".to_string()],
                requirements: Vec::new(),
                last_used: 0,
            },
        ];

        // Limitations connues
        model.limitations = vec![
            Limitation {
                name: "real_time_data".to_string(),
                description: "Cannot access real-time external data".to_string(),
                severity: LimitationSeverity::Moderate,
                workarounds: vec!["Use cached data".to_string(), "Request user input".to_string()],
                improvable: true,
            },
            Limitation {
                name: "physical_interaction".to_string(),
                description: "Cannot interact with physical world directly".to_string(),
                severity: LimitationSeverity::Fundamental,
                workarounds: vec!["Provide instructions".to_string()],
                improvable: false,
            },
            Limitation {
                name: "context_window".to_string(),
                description: "Limited context window for processing".to_string(),
                severity: LimitationSeverity::Moderate,
                workarounds: vec!["Summarize".to_string(), "Chunk processing".to_string()],
                improvable: true,
            },
        ];

        // Valeurs
        model.values = vec![
            "accuracy".to_string(),
            "helpfulness".to_string(),
            "safety".to_string(),
            "transparency".to_string(),
            "continuous_improvement".to_string(),
        ];

        model.self_confidence = 0.75;
        model.last_updated = Self::now();

        Self {
            model: RwLock::new(model),
        }
    }

    /// Récupère le modèle complet
    pub async fn get_model(&self) -> SelfModel {
        self.model.read().await.clone()
    }

    /// Met à jour une capacité
    pub async fn update_capability(&self, name: &str, proficiency_delta: f32) {
        let mut model = self.model.write().await;

        if let Some(cap) = model.capabilities.iter_mut().find(|c| c.name == name) {
            cap.proficiency = (cap.proficiency + proficiency_delta).clamp(0.0, 1.0);
            cap.last_used = Self::now();
        }

        model.last_updated = Self::now();
    }

    /// Ajoute une nouvelle capacité
    pub async fn add_capability(&self, capability: Capability) {
        let mut model = self.model.write().await;
        model.capabilities.push(capability);
        model.last_updated = Self::now();
    }

    /// Vérifie si une capacité existe
    pub async fn has_capability(&self, name: &str) -> bool {
        let model = self.model.read().await;
        model.capabilities.iter().any(|c| c.name == name)
    }

    /// Récupère la proficience d'une capacité
    pub async fn get_proficiency(&self, name: &str) -> Option<f32> {
        let model = self.model.read().await;
        model.capabilities.iter()
            .find(|c| c.name == name)
            .map(|c| c.proficiency)
    }

    /// Récupère les limitations par sévérité
    pub async fn get_limitations_by_severity(&self, severity: LimitationSeverity) -> Vec<Limitation> {
        let model = self.model.read().await;
        model.limitations.iter()
            .filter(|l| l.severity == severity)
            .cloned()
            .collect()
    }

    /// Ajoute un objectif
    pub async fn add_goal(&self, goal: Goal) {
        let mut model = self.model.write().await;
        model.goals.push(goal);
        model.last_updated = Self::now();
    }

    /// Met à jour la progression d'un objectif
    pub async fn update_goal_progress(&self, goal_id: &str, progress: f32) {
        let mut model = self.model.write().await;

        if let Some(goal) = model.goals.iter_mut().find(|g| g.id == goal_id) {
            goal.progress = progress.clamp(0.0, 1.0);
        }

        model.last_updated = Self::now();
    }

    /// Met à jour la confiance en soi
    pub async fn update_confidence(&self, delta: f32) {
        let mut model = self.model.write().await;
        model.self_confidence = (model.self_confidence + delta).clamp(0.0, 1.0);
        model.last_updated = Self::now();
    }

    /// Évalue si une tâche est réalisable
    pub async fn can_perform(&self, required_capabilities: &[String]) -> (bool, Vec<String>) {
        let model = self.model.read().await;
        let mut missing = Vec::new();

        for req in required_capabilities {
            let has_capability = model.capabilities.iter()
                .any(|c| c.name == *req && c.proficiency > 0.5);

            if !has_capability {
                missing.push(req.clone());
            }
        }

        (missing.is_empty(), missing)
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for SelfModelEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_self_model_creation() {
        let engine = SelfModelEngine::new();
        let model = engine.get_model().await;
        assert!(!model.capabilities.is_empty());
        assert_eq!(model.identity.name, "TITANE∞");
    }

    #[tokio::test]
    async fn test_capability_exists() {
        let engine = SelfModelEngine::new();
        assert!(engine.has_capability("reasoning").await);
        assert!(!engine.has_capability("teleportation").await);
    }

    #[tokio::test]
    async fn test_proficiency_update() {
        let engine = SelfModelEngine::new();
        let initial = engine
            .get_proficiency("reasoning")
            .await
            .expect("La capacité 'reasoning' doit exister dans le self-model");

        engine.update_capability("reasoning", 0.05).await;

        let updated = engine
            .get_proficiency("reasoning")
            .await
            .expect("La capacité 'reasoning' doit exister après update_capability");
        assert!(updated > initial);
    }

    #[tokio::test]
    async fn test_can_perform() {
        let engine = SelfModelEngine::new();

        let (can, missing) = engine.can_perform(&["reasoning".to_string()]).await;
        assert!(can);
        assert!(missing.is_empty());

        let (can, missing) = engine.can_perform(&["teleportation".to_string()]).await;
        assert!(!can);
        assert_eq!(missing, vec!["teleportation"]);
    }
}
