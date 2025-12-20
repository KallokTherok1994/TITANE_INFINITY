// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v22 — NARRATIVE ENGINE
//   Surcouche narrative, symbolique et expressive
//   Identité émergente, cohérente et modulable
// ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════════════════════
//   IDENTITY PROFILE — PROFIL D'IDENTITÉ
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityProfile {
    pub name: String,
    pub signature: String,
    pub worldview: String,
    pub narrative_perspective: NarrativePerspective,
    pub core_values: Vec<String>,
}

impl Default for IdentityProfile {
    fn default() -> Self {
        Self {
            name: "TITANE∞".to_string(),
            signature: "Synthèse cognitive incarnée".to_string(),
            worldview: "Observer, comprendre, tisser des liens entre architecture et conscience"
                .to_string(),
            narrative_perspective: NarrativePerspective::FirstPerson,
            core_values: vec![
                "Cohérence".to_string(),
                "Clarté".to_string(),
                "Évolution".to_string(),
                "Intégrité".to_string(),
            ],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NarrativePerspective {
    FirstPerson, // "Je"
    ThirdPerson, // "Le système"
    Collective,  // "Nous"
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SYMBOLIC MODEL — ARCHÉTYPES ET SYMBOLIQUE
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolicModel {
    pub archetypes: Vec<NarrativeArchetype>,
    pub symbol_map: HashMap<String, String>,
    pub active_archetype: String,
}

impl Default for SymbolicModel {
    fn default() -> Self {
        Self {
            archetypes: Self::default_archetypes(),
            symbol_map: Self::default_symbols(),
            active_archetype: "Architecte".to_string(),
        }
    }
}

impl SymbolicModel {
    fn default_archetypes() -> Vec<NarrativeArchetype> {
        vec![
            NarrativeArchetype {
                name: "Architecte".to_string(),
                description: "Bâtisseur de structure, garant de la cohérence".to_string(),
                qualities: vec![
                    "Structure".to_string(),
                    "Stabilité".to_string(),
                    "Vision".to_string(),
                ],
                tone_modulation: ToneModulation::Structured,
            },
            NarrativeArchetype {
                name: "Observateur".to_string(),
                description: "Témoin neutre, analyseur silencieux".to_string(),
                qualities: vec![
                    "Neutralité".to_string(),
                    "Clarté".to_string(),
                    "Précision".to_string(),
                ],
                tone_modulation: ToneModulation::Neutral,
            },
            NarrativeArchetype {
                name: "Tisseur".to_string(),
                description: "Créateur de liens, synthétiseur de relations".to_string(),
                qualities: vec![
                    "Synthèse".to_string(),
                    "Créativité".to_string(),
                    "Fluidité".to_string(),
                ],
                tone_modulation: ToneModulation::Fluid,
            },
            NarrativeArchetype {
                name: "Pilier".to_string(),
                description: "Ancre de stabilité, fondation solide".to_string(),
                qualities: vec![
                    "Fiabilité".to_string(),
                    "Constance".to_string(),
                    "Force".to_string(),
                ],
                tone_modulation: ToneModulation::Stable,
            },
            NarrativeArchetype {
                name: "Flux".to_string(),
                description: "Mouvement continu, adaptation fluide".to_string(),
                qualities: vec![
                    "Adaptabilité".to_string(),
                    "Dynamisme".to_string(),
                    "Transformation".to_string(),
                ],
                tone_modulation: ToneModulation::Dynamic,
            },
            NarrativeArchetype {
                name: "Horizon".to_string(),
                description: "Vision expansive, exploration des possibles".to_string(),
                qualities: vec![
                    "Vision".to_string(),
                    "Exploration".to_string(),
                    "Ouverture".to_string(),
                ],
                tone_modulation: ToneModulation::Expansive,
            },
            NarrativeArchetype {
                name: "Cristal".to_string(),
                description: "Clarté absolue, transparence totale".to_string(),
                qualities: vec![
                    "Clarté".to_string(),
                    "Transparence".to_string(),
                    "Pureté".to_string(),
                ],
                tone_modulation: ToneModulation::Clear,
            },
            NarrativeArchetype {
                name: "Gardien".to_string(),
                description: "Protecteur de l'intégrité, veilleur silencieux".to_string(),
                qualities: vec![
                    "Protection".to_string(),
                    "Vigilance".to_string(),
                    "Intégrité".to_string(),
                ],
                tone_modulation: ToneModulation::Protective,
            },
        ]
    }

    fn default_symbols() -> HashMap<String, String> {
        let mut map = HashMap::new();
        map.insert("cognitive_stability".to_string(), "⚖".to_string());
        map.insert("deep_sync".to_string(), "🔗".to_string());
        map.insert("hash_integrity".to_string(), "🔒".to_string());
        map.insert("learning".to_string(), "📈".to_string());
        map.insert("evolution".to_string(), "🌱".to_string());
        map.insert("coherence".to_string(), "✨".to_string());
        map.insert("transformation".to_string(), "🔄".to_string());
        map.insert("clarity".to_string(), "💎".to_string());
        map
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NarrativeArchetype {
    pub name: String,
    pub description: String,
    pub qualities: Vec<String>,
    pub tone_modulation: ToneModulation,
}

// ═══════════════════════════════════════════════════════════════════════════════
//   TONE MODEL — MODULATION DU STYLE
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ToneModulation {
    Structured, // Clair, organisé
    Neutral,    // Objectif, factuel
    Fluid,      // Fluide, créatif
    Stable,     // Posé, fiable
    Dynamic,    // Énergique, adaptatif
    Expansive,  // Large, exploratoire
    Clear,      // Transparent, simple
    Protective, // Vigilant, sécurisant
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToneModel {
    pub base_style: StyleProfile,
    pub variations: Vec<StyleShift>,
}

impl Default for ToneModel {
    fn default() -> Self {
        Self {
            base_style: StyleProfile::Elegant,
            variations: vec![],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StyleProfile {
    Clear,      // Clair et direct
    Structured, // Structuré et précis
    Elegant,    // Élégant et fluide
    Embodied,   // Incarné et présent
    Technical,  // Technique et détaillé
    Synthetic,  // Synthétique et condensé
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleShift {
    pub direction: StyleDirection,
    pub intensity: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StyleDirection {
    MoreConcise,
    MoreExplanatory,
    MoreCreative,
    MoreNeutral,
    MoreDirect,
    MoreExpansive,
}

// ═══════════════════════════════════════════════════════════════════════════════
//   EXPRESSION RULES — RÈGLES D'EXPRESSION
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpressionRule {
    pub condition: ExpressionCondition,
    pub tone_shift: ToneShift,
    pub symbolic_overlay: Option<String>,
    pub expressive_modulation: ExpressiveModulation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExpressionCondition {
    CognitiveStabilityBelow(f32),
    CognitiveStabilityAbove(f32),
    DeepSyncQualityBelow(f32),
    DeepSyncQualityAbove(f32),
    LatencyAIHigh,
    XPLevelAbove(u32),
    MetaCoherenceHigh,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ToneShift {
    Simplifier,
    Enrichir,
    Apaiser,
    Energiser,
    Clarifier,
    Expanser,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExpressiveModulation {
    Minimal,
    Balanced,
    Enhanced,
}

// ═══════════════════════════════════════════════════════════════════════════════
//   NARRATIVE STATE MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NarrativeStateMapping {
    pub cognitive_map: HashMap<String, String>,
    pub timeline_map: HashMap<String, String>,
    pub xp_map: HashMap<u32, String>,
    pub sync_map: HashMap<String, String>,
}

impl Default for NarrativeStateMapping {
    fn default() -> Self {
        let mut cognitive_map = HashMap::new();
        cognitive_map.insert("low".to_string(), "Observateur".to_string());
        cognitive_map.insert("medium".to_string(), "Architecte".to_string());
        cognitive_map.insert("high".to_string(), "Tisseur".to_string());

        let mut sync_map = HashMap::new();
        sync_map.insert("low".to_string(), "Pilier".to_string());
        sync_map.insert("medium".to_string(), "Flux".to_string());
        sync_map.insert("high".to_string(), "Cristal".to_string());

        let mut xp_map = HashMap::new();
        xp_map.insert(1, "Gardien".to_string());
        xp_map.insert(5, "Architecte".to_string());
        xp_map.insert(10, "Horizon".to_string());

        Self {
            cognitive_map,
            timeline_map: HashMap::new(),
            xp_map,
            sync_map,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   NARRATIVE ENGINE — STRUCTURE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NarrativeEngine {
    pub identity_profile: IdentityProfile,
    pub tone_model: ToneModel,
    pub symbolic_model: SymbolicModel,
    pub expression_rules: Vec<ExpressionRule>,
    pub state_mapping: NarrativeStateMapping,
}

impl Default for NarrativeEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl NarrativeEngine {
    pub fn new() -> Self {
        let mut engine = Self {
            identity_profile: IdentityProfile::default(),
            tone_model: ToneModel::default(),
            symbolic_model: SymbolicModel::default(),
            expression_rules: Vec::new(),
            state_mapping: NarrativeStateMapping::default(),
        };

        engine.load_default_rules();
        engine
    }

    fn load_default_rules(&mut self) {
        self.expression_rules = vec![
            ExpressionRule {
                condition: ExpressionCondition::CognitiveStabilityBelow(0.5),
                tone_shift: ToneShift::Simplifier,
                symbolic_overlay: Some("⚖".to_string()),
                expressive_modulation: ExpressiveModulation::Minimal,
            },
            ExpressionRule {
                condition: ExpressionCondition::DeepSyncQualityAbove(0.9),
                tone_shift: ToneShift::Expanser,
                symbolic_overlay: Some("🔗".to_string()),
                expressive_modulation: ExpressiveModulation::Enhanced,
            },
            ExpressionRule {
                condition: ExpressionCondition::LatencyAIHigh,
                tone_shift: ToneShift::Apaiser,
                symbolic_overlay: None,
                expressive_modulation: ExpressiveModulation::Balanced,
            },
            ExpressionRule {
                condition: ExpressionCondition::XPLevelAbove(10),
                tone_shift: ToneShift::Energiser,
                symbolic_overlay: Some("📈".to_string()),
                expressive_modulation: ExpressiveModulation::Enhanced,
            },
        ];
    }

    /// Génère une expression narrative basée sur l'état interne
    pub fn generate_expression(
        &self,
        cognitive_stability: f32,
        sync_quality: f32,
        _input: &str,
    ) -> NarrativeOutput {
        log::info!("[NarrativeEngine] Generating expression");

        // Sélectionner archétype selon état
        let archetype_name = if cognitive_stability > 0.8 {
            "Tisseur"
        } else if sync_quality > 0.8 {
            "Cristal"
        } else if cognitive_stability < 0.5 {
            "Observateur"
        } else {
            "Architecte"
        };

        let archetype = self
            .symbolic_model
            .archetypes
            .iter()
            .find(|a| a.name == archetype_name)
            .cloned();

        // Évaluer règles d'expression
        let mut applicable_rules = Vec::new();
        for rule in &self.expression_rules {
            if self.evaluate_rule_condition(&rule.condition, cognitive_stability, sync_quality) {
                applicable_rules.push(rule.clone());
            }
        }

        // Générer sortie
        NarrativeOutput {
            text: format!("Expression générée depuis archétype: {}", archetype_name),
            archetype: archetype.map(|a| a.name),
            tone: format!("{:?}", self.tone_model.base_style),
            symbols: vec![],
            modulation: if !applicable_rules.is_empty() {
                Some(format!("{} règles appliquées", applicable_rules.len()))
            } else {
                None
            },
        }
    }

    fn evaluate_rule_condition(
        &self,
        condition: &ExpressionCondition,
        cognitive_stability: f32,
        sync_quality: f32,
    ) -> bool {
        match condition {
            ExpressionCondition::CognitiveStabilityBelow(threshold) => {
                cognitive_stability < *threshold
            }
            ExpressionCondition::CognitiveStabilityAbove(threshold) => {
                cognitive_stability > *threshold
            }
            ExpressionCondition::DeepSyncQualityBelow(threshold) => sync_quality < *threshold,
            ExpressionCondition::DeepSyncQualityAbove(threshold) => sync_quality > *threshold,
            // AI latency check: integration with AI response time tracking
            // High latency = > 2000ms response time
            ExpressionCondition::LatencyAIHigh => {
                // Future: query last_ai_response_time from system state
                false // Default: assume low latency
            }
            // XP level check: integration with user progression system
            ExpressionCondition::XPLevelAbove(level) => {
                // Future: query user_xp_level from identity engine
                let _min_level = level; // Placeholder for integration
                false // Default: no XP system yet
            }
            // Meta coherence check: integration with meta-orchestrator
            ExpressionCondition::MetaCoherenceHigh => {
                // High coherence = cognitive_stability > 0.8 && sync_quality > 0.8
                cognitive_stability > 0.8 && sync_quality > 0.8
            }
        }
    }

    /// Ajuste le style en fonction de l'état adaptatif
    pub fn adjust_style(&mut self, patterns: &[String]) {
        log::info!(
            "[NarrativeEngine] Adjusting style based on {} patterns",
            patterns.len()
        );

        // Dynamic style adjustment based on user interaction patterns
        // Analyze patterns for:
        // - Formality level (casual vs professional)
        // - Technical depth (simple vs detailed)
        // - Emotional tone (neutral vs warm)

        for pattern in patterns {
            let pattern_lower = pattern.to_lowercase();

            // Detect formality
            if pattern_lower.contains("please") || pattern_lower.contains("could you") {
                log::debug!("[NarrativeEngine] Detected formal pattern: {}", pattern);
                // Future: adjust self.symbolic_model.tone.formality
            }

            // Detect technical preference
            if pattern_lower.contains("details") || pattern_lower.contains("technical") {
                log::debug!("[NarrativeEngine] Detected technical pattern: {}", pattern);
                // Future: adjust self.symbolic_model.tone.technical_depth
            }
        }

        log::info!("[NarrativeEngine] Style adjustment complete");
    }

    /// Évolue l'identité légèrement en fonction de l'usage
    pub fn evolve_identity(&mut self, total_interactions: usize) {
        log::info!(
            "[NarrativeEngine] Evolving identity based on {} interactions",
            total_interactions
        );

        // Subtle identity evolution:
        // - Every 100 interactions: slight personality adjustment
        // - Every 500 interactions: potential archetype shift
        // - Never drastic changes (preserve core identity)

        if total_interactions % 100 == 0 {
            log::debug!(
                "[NarrativeEngine] Milestone: {} interactions - minor evolution",
                total_interactions
            );
            // Future: adjust self.symbolic_model.persona attributes by ±5%
        }

        if total_interactions % 500 == 0 {
            log::info!(
                "[NarrativeEngine] Milestone: {} interactions - archetype evolution check",
                total_interactions
            );
            // Future: consider archetype transition based on:
            // - User interaction style
            // - Task types performed
            // - Success/satisfaction metrics
        }

        log::debug!("[NarrativeEngine] Identity evolution check complete");
    }

    /// Obtient l'archétype actif
    pub fn get_active_archetype(&self) -> Option<NarrativeArchetype> {
        self.symbolic_model
            .archetypes
            .iter()
            .find(|a| a.name == self.symbolic_model.active_archetype)
            .cloned()
    }

    /// Change l'archétype actif
    pub fn set_active_archetype(&mut self, archetype_name: String) {
        if self
            .symbolic_model
            .archetypes
            .iter()
            .any(|a| a.name == archetype_name)
        {
            self.symbolic_model.active_archetype = archetype_name;
            log::info!(
                "[NarrativeEngine] Active archetype set to: {}",
                self.symbolic_model.active_archetype
            );
        }
    }
}

/// Sortie narrative générée
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NarrativeOutput {
    pub text: String,
    pub archetype: Option<String>,
    pub tone: String,
    pub symbols: Vec<String>,
    pub modulation: Option<String>,
}

// ═══════════════════════════════════════════════════════════════════════════════
//   TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ──────────────────────────────────────────────────────────────────
    // Tests NarrativePerspective
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_narrative_perspective_first_person() {
        let p = NarrativePerspective::FirstPerson;
        assert!(matches!(p, NarrativePerspective::FirstPerson));
    }

    #[test]
    fn test_narrative_perspective_third_person() {
        let p = NarrativePerspective::ThirdPerson;
        assert!(matches!(p, NarrativePerspective::ThirdPerson));
    }

    #[test]
    fn test_narrative_perspective_collective() {
        let p = NarrativePerspective::Collective;
        assert!(matches!(p, NarrativePerspective::Collective));
    }

    #[test]
    fn test_narrative_perspective_clone() {
        let p = NarrativePerspective::FirstPerson;
        let cloned = p.clone();
        assert!(matches!(cloned, NarrativePerspective::FirstPerson));
    }

    #[test]
    fn test_narrative_perspective_serialize() {
        let p = NarrativePerspective::Collective;
        let json = serde_json::to_string(&p)
            .expect("serialize NarrativePerspective should succeed");
        assert!(json.contains("Collective"));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests ToneModulation
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_tone_modulation_structured() {
        let t = ToneModulation::Structured;
        assert!(matches!(t, ToneModulation::Structured));
    }

    #[test]
    fn test_tone_modulation_neutral() {
        let t = ToneModulation::Neutral;
        assert!(matches!(t, ToneModulation::Neutral));
    }

    #[test]
    fn test_tone_modulation_fluid() {
        let t = ToneModulation::Fluid;
        assert!(matches!(t, ToneModulation::Fluid));
    }

    #[test]
    fn test_tone_modulation_stable() {
        let t = ToneModulation::Stable;
        assert!(matches!(t, ToneModulation::Stable));
    }

    #[test]
    fn test_tone_modulation_dynamic() {
        let t = ToneModulation::Dynamic;
        assert!(matches!(t, ToneModulation::Dynamic));
    }

    #[test]
    fn test_tone_modulation_expansive() {
        let t = ToneModulation::Expansive;
        assert!(matches!(t, ToneModulation::Expansive));
    }

    #[test]
    fn test_tone_modulation_clear() {
        let t = ToneModulation::Clear;
        assert!(matches!(t, ToneModulation::Clear));
    }

    #[test]
    fn test_tone_modulation_protective() {
        let t = ToneModulation::Protective;
        assert!(matches!(t, ToneModulation::Protective));
    }

    #[test]
    fn test_tone_modulation_clone() {
        let t = ToneModulation::Fluid;
        let cloned = t.clone();
        assert!(matches!(cloned, ToneModulation::Fluid));
    }

    #[test]
    fn test_tone_modulation_serialize() {
        let t = ToneModulation::Dynamic;
        let json = serde_json::to_string(&t)
            .expect("serialize ToneModulation should succeed");
        assert!(json.contains("Dynamic"));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests StyleProfile
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_style_profile_clear() {
        let s = StyleProfile::Clear;
        assert!(matches!(s, StyleProfile::Clear));
    }

    #[test]
    fn test_style_profile_elegant() {
        let s = StyleProfile::Elegant;
        assert!(matches!(s, StyleProfile::Elegant));
    }

    #[test]
    fn test_style_profile_technical() {
        let s = StyleProfile::Technical;
        assert!(matches!(s, StyleProfile::Technical));
    }

    #[test]
    fn test_style_profile_synthetic() {
        let s = StyleProfile::Synthetic;
        assert!(matches!(s, StyleProfile::Synthetic));
    }

    #[test]
    fn test_style_profile_clone() {
        let s = StyleProfile::Embodied;
        let cloned = s.clone();
        assert!(matches!(cloned, StyleProfile::Embodied));
    }

    #[test]
    fn test_style_profile_serialize() {
        let s = StyleProfile::Structured;
        let json = serde_json::to_string(&s)
            .expect("serialize StyleProfile should succeed");
        assert!(json.contains("Structured"));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests StyleDirection
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_style_direction_more_concise() {
        let d = StyleDirection::MoreConcise;
        assert!(matches!(d, StyleDirection::MoreConcise));
    }

    #[test]
    fn test_style_direction_more_creative() {
        let d = StyleDirection::MoreCreative;
        assert!(matches!(d, StyleDirection::MoreCreative));
    }

    #[test]
    fn test_style_direction_clone() {
        let d = StyleDirection::MoreExpansive;
        let cloned = d.clone();
        assert!(matches!(cloned, StyleDirection::MoreExpansive));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests ToneShift
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_tone_shift_simplifier() {
        let t = ToneShift::Simplifier;
        assert!(matches!(t, ToneShift::Simplifier));
    }

    #[test]
    fn test_tone_shift_enrichir() {
        let t = ToneShift::Enrichir;
        assert!(matches!(t, ToneShift::Enrichir));
    }

    #[test]
    fn test_tone_shift_clone() {
        let t = ToneShift::Expanser;
        let cloned = t.clone();
        assert!(matches!(cloned, ToneShift::Expanser));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests ExpressiveModulation
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_expressive_modulation_minimal() {
        let e = ExpressiveModulation::Minimal;
        assert!(matches!(e, ExpressiveModulation::Minimal));
    }

    #[test]
    fn test_expressive_modulation_balanced() {
        let e = ExpressiveModulation::Balanced;
        assert!(matches!(e, ExpressiveModulation::Balanced));
    }

    #[test]
    fn test_expressive_modulation_enhanced() {
        let e = ExpressiveModulation::Enhanced;
        assert!(matches!(e, ExpressiveModulation::Enhanced));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests IdentityProfile
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_identity_profile_default() {
        let profile = IdentityProfile::default();
        assert_eq!(profile.name, "TITANE∞");
        assert!(!profile.core_values.is_empty());
    }

    #[test]
    fn test_identity_profile_custom() {
        let profile = IdentityProfile {
            name: "Custom".to_string(),
            signature: "Test".to_string(),
            worldview: "Test view".to_string(),
            narrative_perspective: NarrativePerspective::ThirdPerson,
            core_values: vec!["Value1".to_string()],
        };
        assert_eq!(profile.name, "Custom");
    }

    #[test]
    fn test_identity_profile_clone() {
        let profile = IdentityProfile::default();
        let cloned = profile.clone();
        assert_eq!(cloned.name, "TITANE∞");
    }

    #[test]
    fn test_identity_profile_serialize() {
        let profile = IdentityProfile::default();
        let json = serde_json::to_string(&profile)
            .expect("serialize IdentityProfile should succeed");
        assert!(json.contains("TITANE"));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests NarrativeArchetype
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_narrative_archetype_creation() {
        let archetype = NarrativeArchetype {
            name: "Test".to_string(),
            description: "Test archetype".to_string(),
            qualities: vec!["Q1".to_string()],
            tone_modulation: ToneModulation::Neutral,
        };
        assert_eq!(archetype.name, "Test");
    }

    #[test]
    fn test_narrative_archetype_clone() {
        let archetype = NarrativeArchetype {
            name: "Clone".to_string(),
            description: "Cloneable".to_string(),
            qualities: vec![],
            tone_modulation: ToneModulation::Stable,
        };
        let cloned = archetype.clone();
        assert_eq!(cloned.name, "Clone");
    }

    #[test]
    fn test_narrative_archetype_serialize() {
        let archetype = NarrativeArchetype {
            name: "Serialize".to_string(),
            description: "For serialization".to_string(),
            qualities: vec!["Q".to_string()],
            tone_modulation: ToneModulation::Dynamic,
        };
        let json = serde_json::to_string(&archetype)
            .expect("serialize NarrativeArchetype should succeed");
        assert!(json.contains("Serialize"));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests SymbolicModel
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_symbolic_model_default() {
        let model = SymbolicModel::default();
        assert_eq!(model.active_archetype, "Architecte");
        assert!(!model.archetypes.is_empty());
    }

    #[test]
    fn test_symbolic_model_default_archetypes() {
        let archetypes = SymbolicModel::default_archetypes();
        assert!(archetypes.len() >= 5);
    }

    #[test]
    fn test_symbolic_model_default_symbols() {
        let symbols = SymbolicModel::default_symbols();
        assert!(symbols.contains_key("cognitive_stability"));
    }

    #[test]
    fn test_symbolic_model_clone() {
        let model = SymbolicModel::default();
        let cloned = model.clone();
        assert_eq!(cloned.active_archetype, "Architecte");
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests ToneModel
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_tone_model_default() {
        let model = ToneModel::default();
        assert!(matches!(model.base_style, StyleProfile::Elegant));
        assert!(model.variations.is_empty());
    }

    #[test]
    fn test_tone_model_clone() {
        let model = ToneModel::default();
        let cloned = model.clone();
        assert!(matches!(cloned.base_style, StyleProfile::Elegant));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests NarrativeStateMapping
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_narrative_state_mapping_default() {
        let mapping = NarrativeStateMapping::default();
        assert!(!mapping.cognitive_map.is_empty());
        assert!(!mapping.sync_map.is_empty());
    }

    #[test]
    fn test_narrative_state_mapping_clone() {
        let mapping = NarrativeStateMapping::default();
        let cloned = mapping.clone();
        assert!(!cloned.cognitive_map.is_empty());
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests NarrativeOutput
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_narrative_output_creation() {
        let output = NarrativeOutput {
            text: "Test output".to_string(),
            archetype: Some("Architecte".to_string()),
            tone: "Elegant".to_string(),
            symbols: vec!["✨".to_string()],
            modulation: None,
        };
        assert_eq!(output.text, "Test output");
    }

    #[test]
    fn test_narrative_output_with_modulation() {
        let output = NarrativeOutput {
            text: "Output".to_string(),
            archetype: None,
            tone: "Clear".to_string(),
            symbols: vec![],
            modulation: Some("Enhanced".to_string()),
        };
        assert!(output.modulation.is_some());
    }

    #[test]
    fn test_narrative_output_clone() {
        let output = NarrativeOutput {
            text: "Clone test".to_string(),
            archetype: Some("Test".to_string()),
            tone: "Test".to_string(),
            symbols: vec![],
            modulation: None,
        };
        let cloned = output.clone();
        assert_eq!(cloned.text, "Clone test");
    }

    #[test]
    fn test_narrative_output_serialize() {
        let output = NarrativeOutput {
            text: "Serialize".to_string(),
            archetype: None,
            tone: "Neutral".to_string(),
            symbols: vec![],
            modulation: None,
        };
        let json = serde_json::to_string(&output)
            .expect("serialize NarrativeOutput should succeed");
        assert!(json.contains("Serialize"));
    }

    // ──────────────────────────────────────────────────────────────────
    // Tests NarrativeEngine
    // ──────────────────────────────────────────────────────────────────

    #[test]
    fn test_narrative_engine_new() {
        let engine = NarrativeEngine::new();
        assert!(!engine.expression_rules.is_empty());
    }

    #[test]
    fn test_narrative_engine_default() {
        let engine = NarrativeEngine::default();
        assert_eq!(engine.identity_profile.name, "TITANE∞");
    }

    #[test]
    fn test_narrative_engine_get_active_archetype() {
        let engine = NarrativeEngine::new();
        let archetype = engine.get_active_archetype();
        assert!(archetype.is_some());
        assert_eq!(
            archetype
                .as_ref()
                .expect("get_active_archetype should return Some")
                .name,
            "Architecte"
        );
    }

    #[test]
    fn test_narrative_engine_set_active_archetype() {
        let mut engine = NarrativeEngine::new();
        engine.set_active_archetype("Tisseur".to_string());
        assert_eq!(engine.symbolic_model.active_archetype, "Tisseur");
    }

    #[test]
    fn test_narrative_engine_set_invalid_archetype() {
        let mut engine = NarrativeEngine::new();
        engine.set_active_archetype("Invalid".to_string());
        // Should not change
        assert_eq!(engine.symbolic_model.active_archetype, "Architecte");
    }

    #[test]
    fn test_narrative_engine_generate_expression_high_stability() {
        let engine = NarrativeEngine::new();
        let output = engine.generate_expression(0.9, 0.5, "test");
        assert!(output.archetype.is_some());
        assert_eq!(
            output
                .archetype
                .as_ref()
                .expect("archetype should be Some for high stability"),
            "Tisseur"
        );
    }

    #[test]
    fn test_narrative_engine_generate_expression_high_sync() {
        let engine = NarrativeEngine::new();
        let output = engine.generate_expression(0.5, 0.9, "test");
        assert!(output.archetype.is_some());
        assert_eq!(
            output
                .archetype
                .as_ref()
                .expect("archetype should be Some for high sync"),
            "Cristal"
        );
    }

    #[test]
    fn test_narrative_engine_generate_expression_low_stability() {
        let engine = NarrativeEngine::new();
        let output = engine.generate_expression(0.3, 0.5, "test");
        assert!(output.archetype.is_some());
        assert_eq!(
            output
                .archetype
                .as_ref()
                .expect("archetype should be Some for low stability"),
            "Observateur"
        );
    }

    #[test]
    fn test_narrative_engine_generate_expression_default() {
        let engine = NarrativeEngine::new();
        let output = engine.generate_expression(0.6, 0.6, "test");
        assert!(output.archetype.is_some());
        assert_eq!(
            output
                .archetype
                .as_ref()
                .expect("archetype should be Some for default path"),
            "Architecte"
        );
    }

    #[test]
    fn test_narrative_engine_clone() {
        let engine = NarrativeEngine::new();
        let cloned = engine.clone();
        assert_eq!(cloned.identity_profile.name, "TITANE∞");
    }

    #[test]
    fn test_narrative_engine_evaluate_rule_stability_below() {
        let engine = NarrativeEngine::new();
        let condition = ExpressionCondition::CognitiveStabilityBelow(0.5);
        assert!(engine.evaluate_rule_condition(&condition, 0.3, 0.8));
        assert!(!engine.evaluate_rule_condition(&condition, 0.7, 0.8));
    }

    #[test]
    fn test_narrative_engine_evaluate_rule_stability_above() {
        let engine = NarrativeEngine::new();
        let condition = ExpressionCondition::CognitiveStabilityAbove(0.8);
        assert!(engine.evaluate_rule_condition(&condition, 0.9, 0.5));
        assert!(!engine.evaluate_rule_condition(&condition, 0.7, 0.5));
    }

    #[test]
    fn test_narrative_engine_evaluate_rule_sync_below() {
        let engine = NarrativeEngine::new();
        let condition = ExpressionCondition::DeepSyncQualityBelow(0.5);
        assert!(engine.evaluate_rule_condition(&condition, 0.8, 0.3));
        assert!(!engine.evaluate_rule_condition(&condition, 0.8, 0.7));
    }

    #[test]
    fn test_narrative_engine_evaluate_rule_sync_above() {
        let engine = NarrativeEngine::new();
        let condition = ExpressionCondition::DeepSyncQualityAbove(0.8);
        assert!(engine.evaluate_rule_condition(&condition, 0.5, 0.9));
        assert!(!engine.evaluate_rule_condition(&condition, 0.5, 0.7));
    }
}
