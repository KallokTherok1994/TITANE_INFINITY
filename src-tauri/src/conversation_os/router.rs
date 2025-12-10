//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — CONVERSATION ROUTER
//! Super Prompt #9 — Routage du pipeline conversationnel
//! ═══════════════════════════════════════════════════════════════════════════════

use super::intent::{ComplexityLevel, IntentType, UserIntent};
use serde::{Deserialize, Serialize};

/// Étape du pipeline conversationnel
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConversationStage {
    /// Détection d'intention
    IntentDetection,
    /// Extraction mémoire
    MemoryExtraction,
    /// Analyse émotionnelle
    EmotionAnalysis,
    /// Mise à jour narrative
    NarrativeUpdate,
    /// Vérification cohérence
    CoherenceCheck,
    /// Application persona
    PersonaApplication,
    /// Vérification sécurité
    SafetyCheck,
    /// Formatage réponse
    ResponseFormatting,
    /// Application style
    StyleApplication,
    /// Adaptation canal
    ChannelAdaptation,
    /// Production sortie
    OutputProduction,
    /// Diagnostics
    Diagnostics,
}

/// Configuration du pipeline
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PipelineConfig {
    /// Étapes actives
    pub active_stages: Vec<ConversationStage>,
    /// Mode rapide (skip certaines étapes)
    pub fast_mode: bool,
    /// Mode debug (toutes les étapes)
    pub debug_mode: bool,
    /// Timeout par étape (ms)
    pub stage_timeout_ms: u64,
}

impl Default for PipelineConfig {
    fn default() -> Self {
        Self {
            active_stages: vec![
                ConversationStage::IntentDetection,
                ConversationStage::MemoryExtraction,
                ConversationStage::NarrativeUpdate,
                ConversationStage::SafetyCheck,
                ConversationStage::ResponseFormatting,
                ConversationStage::StyleApplication,
                ConversationStage::OutputProduction,
            ],
            fast_mode: false,
            debug_mode: false,
            stage_timeout_ms: 1000,
        }
    }
}

/// Résultat de routage
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RoutingResult {
    pub stages: Vec<ConversationStage>,
    pub estimated_time_ms: u64,
    pub priority: RoutingPriority,
    pub reasoning: String,
}

/// Priorité de routage
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RoutingPriority {
    Low,
    Normal,
    High,
    Critical,
}

/// Routeur conversationnel
pub struct ConversationRouter {
    config: PipelineConfig,
}

impl ConversationRouter {
    pub fn new() -> Self {
        Self {
            config: PipelineConfig::default(),
        }
    }

    /// Route le pipeline selon l'intention
    pub fn route(&self, intent: &UserIntent) -> Vec<ConversationStage> {
        if self.config.fast_mode {
            return self.fast_route(intent);
        }

        if self.config.debug_mode {
            return self.full_route();
        }

        self.smart_route(intent)
    }

    /// Routage intelligent basé sur l'intention
    fn smart_route(&self, intent: &UserIntent) -> Vec<ConversationStage> {
        let mut stages = vec![ConversationStage::IntentDetection];

        // Toujours vérifier la sécurité
        stages.push(ConversationStage::SafetyCheck);

        // Extraction mémoire si requise
        if intent.requires_memory {
            stages.push(ConversationStage::MemoryExtraction);
        }

        // Analyse émotionnelle pour certaines intentions
        match intent.intent_type {
            IntentType::Emotion | IntentType::Social => {
                stages.push(ConversationStage::EmotionAnalysis);
            }
            _ => {}
        }

        // Mise à jour narrative pour conversations complexes
        if intent.complexity == ComplexityLevel::Complex
            || intent.complexity == ComplexityLevel::Expert
        {
            stages.push(ConversationStage::NarrativeUpdate);
            stages.push(ConversationStage::CoherenceCheck);
        }

        // Persona et style
        stages.push(ConversationStage::PersonaApplication);
        stages.push(ConversationStage::StyleApplication);

        // Formatage selon complexité
        if intent.complexity != ComplexityLevel::Simple {
            stages.push(ConversationStage::ResponseFormatting);
        }

        // Adaptation canal
        stages.push(ConversationStage::ChannelAdaptation);

        // Production finale
        stages.push(ConversationStage::OutputProduction);

        stages
    }

    /// Routage rapide (minimal)
    fn fast_route(&self, _intent: &UserIntent) -> Vec<ConversationStage> {
        vec![
            ConversationStage::IntentDetection,
            ConversationStage::SafetyCheck,
            ConversationStage::OutputProduction,
        ]
    }

    /// Routage complet (debug)
    fn full_route(&self) -> Vec<ConversationStage> {
        vec![
            ConversationStage::IntentDetection,
            ConversationStage::MemoryExtraction,
            ConversationStage::EmotionAnalysis,
            ConversationStage::NarrativeUpdate,
            ConversationStage::CoherenceCheck,
            ConversationStage::PersonaApplication,
            ConversationStage::SafetyCheck,
            ConversationStage::ResponseFormatting,
            ConversationStage::StyleApplication,
            ConversationStage::ChannelAdaptation,
            ConversationStage::OutputProduction,
            ConversationStage::Diagnostics,
        ]
    }

    /// Analyse le routage pour diagnostic
    pub fn analyze_route(&self, intent: &UserIntent) -> RoutingResult {
        let stages = self.route(intent);
        let estimated_time = stages.len() as u64 * self.config.stage_timeout_ms / 2;

        let priority = match intent.urgency {
            super::intent::UrgencyLevel::Critical => RoutingPriority::Critical,
            super::intent::UrgencyLevel::High => RoutingPriority::High,
            super::intent::UrgencyLevel::Normal => RoutingPriority::Normal,
            super::intent::UrgencyLevel::Low => RoutingPriority::Low,
        };

        let reasoning = self.generate_reasoning(intent, &stages);

        RoutingResult {
            stages,
            estimated_time_ms: estimated_time,
            priority,
            reasoning,
        }
    }

    /// Génère l'explication du routage
    fn generate_reasoning(&self, intent: &UserIntent, stages: &[ConversationStage]) -> String {
        let mut reasons = Vec::new();

        if stages.contains(&ConversationStage::MemoryExtraction) {
            reasons.push("Mémoire requise pour contexte");
        }

        if stages.contains(&ConversationStage::EmotionAnalysis) {
            reasons.push("Analyse émotionnelle pour réponse empathique");
        }

        if stages.contains(&ConversationStage::CoherenceCheck) {
            reasons.push("Vérification cohérence (conversation complexe)");
        }

        if self.config.fast_mode {
            reasons.push("Mode rapide activé");
        }

        format!(
            "Intent: {:?}, Complexity: {:?} | {}",
            intent.intent_type,
            intent.complexity,
            reasons.join("; ")
        )
    }

    /// Active le mode rapide
    pub fn set_fast_mode(&mut self, enabled: bool) {
        self.config.fast_mode = enabled;
    }

    /// Active le mode debug
    pub fn set_debug_mode(&mut self, enabled: bool) {
        self.config.debug_mode = enabled;
    }

    /// Met à jour la configuration
    pub fn set_config(&mut self, config: PipelineConfig) {
        self.config = config;
    }

    /// Récupère la configuration actuelle
    pub fn get_config(&self) -> &PipelineConfig {
        &self.config
    }

    /// Estime le temps d'exécution
    pub fn estimate_time(&self, stages: &[ConversationStage]) -> u64 {
        let base_time = stages.len() as u64 * 50; // 50ms par étape de base

        let complex_stages = stages
            .iter()
            .filter(|s| {
                matches!(
                    s,
                    ConversationStage::MemoryExtraction
                        | ConversationStage::CoherenceCheck
                        | ConversationStage::EmotionAnalysis
                )
            })
            .count();

        base_time + (complex_stages as u64 * 100) // +100ms pour étapes complexes
    }

    /// Vérifie si une étape est active
    pub fn is_stage_active(&self, stage: &ConversationStage) -> bool {
        self.config.active_stages.contains(stage)
    }

    /// Active/désactive une étape
    pub fn toggle_stage(&mut self, stage: ConversationStage, active: bool) {
        if active {
            if !self.config.active_stages.contains(&stage) {
                self.config.active_stages.push(stage);
            }
        } else {
            self.config.active_stages.retain(|s| s != &stage);
        }
    }
}

impl Default for ConversationRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::conversation_os::intent::{IntentConfidence, UrgencyLevel};

    fn create_simple_intent() -> UserIntent {
        UserIntent {
            intent_type: IntentType::Question,
            confidence: IntentConfidence {
                primary: 0.8,
                secondary: None,
            },
            keywords: vec![],
            urgency: UrgencyLevel::Normal,
            complexity: ComplexityLevel::Simple,
            requires_memory: false,
            requires_reflection: false,
            timestamp: 0,
        }
    }

    fn create_complex_intent() -> UserIntent {
        UserIntent {
            intent_type: IntentType::Debugging,
            confidence: IntentConfidence {
                primary: 0.9,
                secondary: None,
            },
            keywords: vec!["error".to_string()],
            urgency: UrgencyLevel::High,
            complexity: ComplexityLevel::Complex,
            requires_memory: true,
            requires_reflection: true,
            timestamp: 0,
        }
    }

    #[test]
    fn test_simple_routing() {
        let router = ConversationRouter::new();
        let intent = create_simple_intent();

        let stages = router.route(&intent);
        assert!(stages.contains(&ConversationStage::IntentDetection));
        assert!(stages.contains(&ConversationStage::SafetyCheck));
        assert!(stages.contains(&ConversationStage::OutputProduction));
    }

    #[test]
    fn test_complex_routing() {
        let router = ConversationRouter::new();
        let intent = create_complex_intent();

        let stages = router.route(&intent);
        assert!(stages.contains(&ConversationStage::MemoryExtraction));
        assert!(stages.contains(&ConversationStage::NarrativeUpdate));
        assert!(stages.contains(&ConversationStage::CoherenceCheck));
    }

    #[test]
    fn test_fast_mode() {
        let mut router = ConversationRouter::new();
        router.set_fast_mode(true);

        let intent = create_complex_intent();
        let stages = router.route(&intent);

        // En mode rapide, moins d'étapes
        assert!(stages.len() <= 5);
    }

    #[test]
    fn test_routing_analysis() {
        let router = ConversationRouter::new();
        let intent = create_complex_intent();

        let result = router.analyze_route(&intent);
        assert_eq!(result.priority, RoutingPriority::High);
        assert!(result.estimated_time_ms > 0);
    }
}
