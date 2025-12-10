//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — REASONING ENGINE
//! Super Prompt #11 — Chaînes de raisonnement et inférence logique
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use super::AGIContext;

/// Chaîne de raisonnement
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ReasoningChain {
    pub id: String,
    pub steps: Vec<ReasoningStep>,
    pub depth: u32,
    pub confidence: f32,
    pub conclusion: Option<String>,
    pub alternatives: Vec<String>,
    pub timestamp: u64,
}

/// Étape de raisonnement
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ReasoningStep {
    pub order: u32,
    pub step_type: ReasoningType,
    pub premise: String,
    pub inference: String,
    pub conclusion: String,
    pub confidence: f32,
    pub supporting_evidence: Vec<String>,
    pub counterarguments: Vec<String>,
}

/// Type de raisonnement
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReasoningType {
    /// Déduction logique
    Deduction,
    /// Induction
    Induction,
    /// Abduction
    Abduction,
    /// Analogie
    Analogy,
    /// Causal
    Causal,
    /// Probabiliste
    Probabilistic,
    /// Hypothétique
    Hypothetical,
}

impl Default for ReasoningType {
    fn default() -> Self {
        Self::Deduction
    }
}

/// Moteur de raisonnement
pub struct ReasoningEngine {
    max_depth: u32,
}

impl ReasoningEngine {
    pub fn new(max_depth: u32) -> Self {
        Self { max_depth }
    }

    /// Effectue un raisonnement sur une entrée
    pub async fn reason(&self, input: &str, context: &AGIContext) -> ReasoningChain {
        let mut chain = ReasoningChain {
            id: uuid::Uuid::new_v4().to_string(),
            steps: Vec::new(),
            depth: 0,
            confidence: 0.5,
            conclusion: None,
            alternatives: Vec::new(),
            timestamp: Self::now(),
        };

        // Étape 1: Analyse de l'entrée
        let analysis_step = self.analyze_input(input, context);
        chain.steps.push(analysis_step);
        chain.depth += 1;

        // Étape 2: Identification des prémisses
        let premise_step = self.identify_premises(input, context);
        chain.steps.push(premise_step);
        chain.depth += 1;

        // Étape 3: Inférences
        let inference_step = self.make_inferences(&chain.steps, context);
        chain.steps.push(inference_step);
        chain.depth += 1;

        // Étape 4: Conclusion
        let conclusion_step = self.draw_conclusion(&chain.steps);
        chain.conclusion = Some(conclusion_step.conclusion.clone());
        chain.steps.push(conclusion_step);
        chain.depth += 1;

        // Calculer la confiance globale
        chain.confidence = self.calculate_chain_confidence(&chain.steps);

        // Générer des alternatives
        chain.alternatives = self.generate_alternatives(&chain);

        chain
    }

    /// Analyse l'entrée
    fn analyze_input(&self, input: &str, _context: &AGIContext) -> ReasoningStep {
        let word_count = input.split_whitespace().count();
        let has_question = input.contains('?');

        ReasoningStep {
            order: 1,
            step_type: ReasoningType::Deduction,
            premise: format!("Input contains {} words", word_count),
            inference: if has_question {
                "Input is a question requiring analysis".to_string()
            } else {
                "Input is a statement requiring processing".to_string()
            },
            conclusion: "Proceed with detailed analysis".to_string(),
            confidence: 0.9,
            supporting_evidence: vec![
                format!("Word count: {}", word_count),
                format!("Is question: {}", has_question),
            ],
            counterarguments: Vec::new(),
        }
    }

    /// Identifie les prémisses
    fn identify_premises(&self, input: &str, context: &AGIContext) -> ReasoningStep {
        let mut premises = Vec::new();

        // Extraire les éléments clés
        if !context.domain.is_empty() {
            premises.push(format!("Domain: {}", context.domain));
        }

        if !context.prior_knowledge.is_empty() {
            premises.push(format!("Prior knowledge: {} items", context.prior_knowledge.len()));
        }

        // Analyser l'input pour des patterns logiques
        if input.contains("because") || input.contains("parce que") {
            premises.push("Causal relationship detected".to_string());
        }

        if input.contains("if") || input.contains("si") {
            premises.push("Conditional statement detected".to_string());
        }

        ReasoningStep {
            order: 2,
            step_type: ReasoningType::Induction,
            premise: "Analyzing input structure and context".to_string(),
            inference: format!("Identified {} key premises", premises.len()),
            conclusion: "Premises established for inference".to_string(),
            confidence: 0.85,
            supporting_evidence: premises,
            counterarguments: Vec::new(),
        }
    }

    /// Fait des inférences
    fn make_inferences(&self, steps: &[ReasoningStep], context: &AGIContext) -> ReasoningStep {
        let mut inferences = Vec::new();

        // Inférences basées sur les étapes précédentes
        for step in steps {
            if step.confidence > 0.7 {
                inferences.push(format!("Strong support from step {}: {}", step.order, step.conclusion));
            }
        }

        // Inférences basées sur le contexte
        if !context.constraints.is_empty() {
            inferences.push(format!("Must satisfy {} constraints", context.constraints.len()));
        }

        let step_type = if inferences.len() > 3 {
            ReasoningType::Probabilistic
        } else {
            ReasoningType::Deduction
        };

        ReasoningStep {
            order: 3,
            step_type,
            premise: "Combining evidence from previous steps".to_string(),
            inference: format!("Generated {} inferences", inferences.len()),
            conclusion: "Inference phase complete".to_string(),
            confidence: 0.8,
            supporting_evidence: inferences,
            counterarguments: vec![
                "Some inferences may be incomplete".to_string(),
            ],
        }
    }

    /// Tire une conclusion
    fn draw_conclusion(&self, steps: &[ReasoningStep]) -> ReasoningStep {
        let avg_confidence: f32 = steps.iter()
            .map(|s| s.confidence)
            .sum::<f32>() / steps.len() as f32;

        let conclusion = if avg_confidence > 0.8 {
            "High confidence conclusion: proceed with recommendation".to_string()
        } else if avg_confidence > 0.5 {
            "Moderate confidence: consider additional verification".to_string()
        } else {
            "Low confidence: gather more information".to_string()
        };

        ReasoningStep {
            order: 4,
            step_type: ReasoningType::Deduction,
            premise: "Synthesizing all reasoning steps".to_string(),
            inference: format!("Average confidence across steps: {:.2}", avg_confidence),
            conclusion,
            confidence: avg_confidence,
            supporting_evidence: steps.iter()
                .map(|s| s.conclusion.clone())
                .collect(),
            counterarguments: Vec::new(),
        }
    }

    /// Calcule la confiance de la chaîne
    fn calculate_chain_confidence(&self, steps: &[ReasoningStep]) -> f32 {
        if steps.is_empty() {
            return 0.0;
        }

        // Moyenne pondérée: les étapes plus récentes ont plus de poids
        let mut total_weight = 0.0f32;
        let mut weighted_sum = 0.0f32;

        for (i, step) in steps.iter().enumerate() {
            let weight = (i + 1) as f32;
            total_weight += weight;
            weighted_sum += step.confidence * weight;
        }

        weighted_sum / total_weight
    }

    /// Génère des alternatives
    fn generate_alternatives(&self, chain: &ReasoningChain) -> Vec<String> {
        let mut alternatives = Vec::new();

        // Basé sur la confiance
        if chain.confidence < 0.8 {
            alternatives.push("Consider alternative interpretation".to_string());
        }

        // Basé sur les contre-arguments
        let counterargument_count: usize = chain.steps.iter()
            .map(|s| s.counterarguments.len())
            .sum();

        if counterargument_count > 0 {
            alternatives.push(format!("{} counterarguments to consider", counterargument_count));
        }

        alternatives
    }

    /// Vérifie une chaîne de raisonnement
    pub fn verify(&self, chain: &ReasoningChain) -> VerificationResult {
        let mut issues = Vec::new();

        // Vérifier la profondeur
        if chain.depth > self.max_depth {
            issues.push("Chain exceeds maximum depth".to_string());
        }

        // Vérifier la continuité
        for window in chain.steps.windows(2) {
            if window[1].order != window[0].order + 1 {
                issues.push("Step ordering inconsistency detected".to_string());
            }
        }

        // Vérifier la cohérence des confiances
        let confidence_drop: f32 = chain.steps.windows(2)
            .map(|w| (w[0].confidence - w[1].confidence).max(0.0))
            .sum();

        if confidence_drop > 0.3 {
            issues.push("Significant confidence degradation in chain".to_string());
        }

        let is_valid = issues.is_empty();
        let coherence = if is_valid { 1.0 } else { 0.5 };

        VerificationResult {
            valid: is_valid,
            issues,
            overall_coherence: coherence,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Résultat de vérification
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct VerificationResult {
    pub valid: bool,
    pub issues: Vec<String>,
    pub overall_coherence: f32,
}

impl Default for ReasoningEngine {
    fn default() -> Self {
        Self::new(10)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_reasoning_engine_creation() {
        let engine = ReasoningEngine::new(10);
        assert_eq!(engine.max_depth, 10);
    }

    #[tokio::test]
    async fn test_basic_reasoning() {
        let engine = ReasoningEngine::new(10);
        let context = AGIContext::default();

        let chain = engine.reason("What is the best approach?", &context).await;

        assert!(!chain.steps.is_empty());
        assert!(chain.depth > 0);
        assert!(chain.conclusion.is_some());
    }

    #[tokio::test]
    async fn test_chain_verification() {
        let engine = ReasoningEngine::new(10);
        let context = AGIContext::default();

        let chain = engine.reason("Test input", &context).await;
        let result = engine.verify(&chain);

        assert!(result.valid);
    }

    #[test]
    fn test_reasoning_chain_default() {
        let chain = ReasoningChain::default();
        assert!(chain.steps.is_empty());
        assert_eq!(chain.depth, 0);
        assert_eq!(chain.confidence, 0.0);
        assert!(chain.conclusion.is_none());
    }

    #[test]
    fn test_reasoning_chain_clone() {
        let chain = ReasoningChain {
            id: "test-123".to_string(),
            steps: vec![],
            depth: 5,
            confidence: 0.85,
            conclusion: Some("Test conclusion".to_string()),
            alternatives: vec!["Alt1".to_string()],
            timestamp: 12345,
        };
        let cloned = chain.clone();
        assert_eq!(cloned.id, "test-123");
        assert_eq!(cloned.depth, 5);
    }

    #[test]
    fn test_reasoning_chain_debug() {
        let chain = ReasoningChain::default();
        let debug_str = format!("{:?}", chain);
        assert!(debug_str.contains("ReasoningChain"));
    }

    #[test]
    fn test_reasoning_type_default() {
        let rt = ReasoningType::default();
        assert_eq!(rt, ReasoningType::Deduction);
    }

    #[test]
    fn test_reasoning_type_variants() {
        let types = vec![
            ReasoningType::Deduction,
            ReasoningType::Induction,
            ReasoningType::Abduction,
            ReasoningType::Analogy,
            ReasoningType::Causal,
            ReasoningType::Probabilistic,
            ReasoningType::Hypothetical,
        ];
        assert_eq!(types.len(), 7);

        for t in types {
            let cloned = t.clone();
            assert_eq!(t, cloned);
        }
    }

    #[test]
    fn test_reasoning_step_clone() {
        let step = ReasoningStep {
            order: 1,
            step_type: ReasoningType::Induction,
            premise: "Test premise".to_string(),
            inference: "Test inference".to_string(),
            conclusion: "Test conclusion".to_string(),
            confidence: 0.9,
            supporting_evidence: vec!["Evidence".to_string()],
            counterarguments: vec![],
        };
        let cloned = step.clone();
        assert_eq!(cloned.order, 1);
        assert_eq!(cloned.confidence, 0.9);
    }

    #[test]
    fn test_reasoning_step_debug() {
        let step = ReasoningStep {
            order: 2,
            step_type: ReasoningType::Abduction,
            premise: "P".to_string(),
            inference: "I".to_string(),
            conclusion: "C".to_string(),
            confidence: 0.75,
            supporting_evidence: vec![],
            counterarguments: vec!["Counter".to_string()],
        };
        let debug_str = format!("{:?}", step);
        assert!(debug_str.contains("ReasoningStep"));
    }

    #[test]
    fn test_verification_result_clone() {
        let result = VerificationResult {
            valid: true,
            issues: vec![],
            overall_coherence: 0.95,
        };
        let cloned = result.clone();
        assert!(cloned.valid);
        assert_eq!(cloned.overall_coherence, 0.95);
    }

    #[test]
    fn test_verification_result_debug() {
        let result = VerificationResult {
            valid: false,
            issues: vec!["Issue 1".to_string()],
            overall_coherence: 0.5,
        };
        let debug_str = format!("{:?}", result);
        assert!(debug_str.contains("VerificationResult"));
    }

    #[test]
    fn test_reasoning_engine_default() {
        let engine = ReasoningEngine::default();
        assert_eq!(engine.max_depth, 10);
    }

    #[test]
    fn test_calculate_chain_confidence_empty() {
        let engine = ReasoningEngine::new(10);
        let steps: Vec<ReasoningStep> = vec![];
        let confidence = engine.calculate_chain_confidence(&steps);
        assert_eq!(confidence, 0.0);
    }

    #[test]
    fn test_calculate_chain_confidence_single() {
        let engine = ReasoningEngine::new(10);
        let steps = vec![ReasoningStep {
            order: 1,
            step_type: ReasoningType::Deduction,
            premise: "".to_string(),
            inference: "".to_string(),
            conclusion: "".to_string(),
            confidence: 0.8,
            supporting_evidence: vec![],
            counterarguments: vec![],
        }];
        let confidence = engine.calculate_chain_confidence(&steps);
        assert_eq!(confidence, 0.8);
    }

    #[tokio::test]
    async fn test_reasoning_with_question() {
        let engine = ReasoningEngine::new(10);
        let context = AGIContext::default();

        let chain = engine.reason("What is this?", &context).await;

        // Should detect question
        assert!(chain.steps[0].supporting_evidence.iter().any(|e| e.contains("Is question: true")));
    }

    #[tokio::test]
    async fn test_reasoning_with_causal() {
        let engine = ReasoningEngine::new(10);
        let context = AGIContext::default();

        let chain = engine.reason("This happened because of that", &context).await;

        // Should detect causal relationship
        assert!(chain.steps[1].supporting_evidence.iter().any(|e| e.contains("Causal")));
    }

    #[tokio::test]
    async fn test_reasoning_with_conditional() {
        let engine = ReasoningEngine::new(10);
        let context = AGIContext::default();

        let chain = engine.reason("If this then that", &context).await;

        // Should detect conditional
        assert!(chain.steps[1].supporting_evidence.iter().any(|e| e.contains("Conditional")));
    }

    #[test]
    fn test_verify_chain_exceeds_depth() {
        let engine = ReasoningEngine::new(3);
        let chain = ReasoningChain {
            id: "test".to_string(),
            steps: vec![],
            depth: 5, // Exceeds max of 3
            confidence: 0.8,
            conclusion: None,
            alternatives: vec![],
            timestamp: 0,
        };

        let result = engine.verify(&chain);
        assert!(!result.valid);
        assert!(result.issues.iter().any(|i| i.contains("exceeds maximum depth")));
    }

    #[test]
    fn test_serialization_reasoning_chain() {
        let chain = ReasoningChain {
            id: "ser-test".to_string(),
            steps: vec![],
            depth: 2,
            confidence: 0.75,
            conclusion: Some("Test".to_string()),
            alternatives: vec!["Alt".to_string()],
            timestamp: 99999,
        };
        let json = serde_json::to_string(&chain).unwrap();
        let restored: ReasoningChain = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.id, "ser-test");
    }

    #[test]
    fn test_serialization_reasoning_type() {
        let rt = ReasoningType::Probabilistic;
        let json = serde_json::to_string(&rt).unwrap();
        let restored: ReasoningType = serde_json::from_str(&json).unwrap();
        assert_eq!(restored, ReasoningType::Probabilistic);
    }
}
