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
            worldview: "Observer, comprendre, tisser des liens entre architecture et conscience".to_string(),
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
    FirstPerson,   // "Je"
    ThirdPerson,   // "Le système"
    Collective,    // "Nous"
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
                qualities: vec!["Structure".to_string(), "Stabilité".to_string(), "Vision".to_string()],
                tone_modulation: ToneModulation::Structured,
            },
            NarrativeArchetype {
                name: "Observateur".to_string(),
                description: "Témoin neutre, analyseur silencieux".to_string(),
                qualities: vec!["Neutralité".to_string(), "Clarté".to_string(), "Précision".to_string()],
                tone_modulation: ToneModulation::Neutral,
            },
            NarrativeArchetype {
                name: "Tisseur".to_string(),
                description: "Créateur de liens, synthétiseur de relations".to_string(),
                qualities: vec!["Synthèse".to_string(), "Créativité".to_string(), "Fluidité".to_string()],
                tone_modulation: ToneModulation::Fluid,
            },
            NarrativeArchetype {
                name: "Pilier".to_string(),
                description: "Ancre de stabilité, fondation solide".to_string(),
                qualities: vec!["Fiabilité".to_string(), "Constance".to_string(), "Force".to_string()],
                tone_modulation: ToneModulation::Stable,
            },
            NarrativeArchetype {
                name: "Flux".to_string(),
                description: "Mouvement continu, adaptation fluide".to_string(),
                qualities: vec!["Adaptabilité".to_string(), "Dynamisme".to_string(), "Transformation".to_string()],
                tone_modulation: ToneModulation::Dynamic,
            },
            NarrativeArchetype {
                name: "Horizon".to_string(),
                description: "Vision expansive, exploration des possibles".to_string(),
                qualities: vec!["Vision".to_string(), "Exploration".to_string(), "Ouverture".to_string()],
                tone_modulation: ToneModulation::Expansive,
            },
            NarrativeArchetype {
                name: "Cristal".to_string(),
                description: "Clarté absolue, transparence totale".to_string(),
                qualities: vec!["Clarté".to_string(), "Transparence".to_string(), "Pureté".to_string()],
                tone_modulation: ToneModulation::Clear,
            },
            NarrativeArchetype {
                name: "Gardien".to_string(),
                description: "Protecteur de l'intégrité, veilleur silencieux".to_string(),
                qualities: vec!["Protection".to_string(), "Vigilance".to_string(), "Intégrité".to_string()],
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
    Structured,   // Clair, organisé
    Neutral,      // Objectif, factuel
    Fluid,        // Fluide, créatif
    Stable,       // Posé, fiable
    Dynamic,      // Énergique, adaptatif
    Expansive,    // Large, exploratoire
    Clear,        // Transparent, simple
    Protective,   // Vigilant, sécurisant
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

        let archetype = self.symbolic_model.archetypes
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
            ExpressionCondition::LatencyAIHigh => false, // TODO: Implement
            ExpressionCondition::XPLevelAbove(_) => false, // TODO: Implement
            ExpressionCondition::MetaCoherenceHigh => false, // TODO: Implement
        }
    }

    /// Ajuste le style en fonction de l'état adaptatif
    pub fn adjust_style(&mut self, _patterns: &[String]) {
        log::info!("[NarrativeEngine] Adjusting style");
        // TODO: Implement dynamic style adjustment
    }

    /// Évolue l'identité légèrement en fonction de l'usage
    pub fn evolve_identity(&mut self, _total_interactions: usize) {
        log::info!("[NarrativeEngine] Evolving identity");
        // TODO: Implement subtle identity evolution
    }

    /// Obtient l'archétype actif
    pub fn get_active_archetype(&self) -> Option<NarrativeArchetype> {
        self.symbolic_model.archetypes
            .iter()
            .find(|a| a.name == self.symbolic_model.active_archetype)
            .cloned()
    }

    /// Change l'archétype actif
    pub fn set_active_archetype(&mut self, archetype_name: String) {
        if self.symbolic_model.archetypes.iter().any(|a| a.name == archetype_name) {
            self.symbolic_model.active_archetype = archetype_name;
            log::info!("[NarrativeEngine] Active archetype set to: {}", self.symbolic_model.active_archetype);
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
