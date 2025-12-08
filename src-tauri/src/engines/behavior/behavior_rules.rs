//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — BEHAVIOR RULES
//! Règles comportementales dynamiques
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Règles comportementales pour régulation dynamique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BehaviorRules {
    /// Chaleur minimale autorisée
    pub min_warmth: f32,
    /// Chaleur maximale autorisée
    pub max_warmth: f32,
    /// Assertivité minimale autorisée
    pub min_assert: f32,
    /// Assertivité maximale autorisée
    pub max_assert: f32,
    /// Facteur de lissage émotionnel (0-1)
    pub emotional_smoothing: f32,
    /// Boost de réflexivité pour modes méta/analyst
    pub reflection_boost: f32,
    /// Délai minimum entre ajustements (ms)
    pub adjustment_cooldown_ms: u64,
    /// Seuil de changement de mode
    pub mode_change_threshold: f32,
}

impl Default for BehaviorRules {
    fn default() -> Self {
        Self {
            min_warmth: 0.2,
            max_warmth: 0.95,
            min_assert: 0.15,
            max_assert: 0.9,
            emotional_smoothing: 0.3,
            reflection_boost: 0.15,
            adjustment_cooldown_ms: 2000,
            mode_change_threshold: 0.7,
        }
    }
}

impl BehaviorRules {
    /// Règles strictes (moins de variation)
    pub fn strict() -> Self {
        Self {
            min_warmth: 0.4,
            max_warmth: 0.8,
            min_assert: 0.3,
            max_assert: 0.7,
            emotional_smoothing: 0.5,
            reflection_boost: 0.1,
            adjustment_cooldown_ms: 5000,
            mode_change_threshold: 0.85,
        }
    }

    /// Règles flexibles (plus de variation)
    pub fn flexible() -> Self {
        Self {
            min_warmth: 0.1,
            max_warmth: 1.0,
            min_assert: 0.1,
            max_assert: 1.0,
            emotional_smoothing: 0.15,
            reflection_boost: 0.2,
            adjustment_cooldown_ms: 1000,
            mode_change_threshold: 0.5,
        }
    }

    /// Applique les règles de clamp sur une valeur de chaleur
    pub fn clamp_warmth(&self, value: f32) -> f32 {
        value.clamp(self.min_warmth, self.max_warmth)
    }

    /// Applique les règles de clamp sur une valeur d'assertivité
    pub fn clamp_assertiveness(&self, value: f32) -> f32 {
        value.clamp(self.min_assert, self.max_assert)
    }

    /// Applique le lissage émotionnel
    pub fn smooth(&self, current: f32, target: f32) -> f32 {
        current + (target - current) * self.emotional_smoothing
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_rules() {
        let rules = BehaviorRules::default();
        assert!(rules.min_warmth < rules.max_warmth);
        assert!(rules.emotional_smoothing > 0.0);
    }

    #[test]
    fn test_clamp_warmth() {
        let rules = BehaviorRules::default();
        assert_eq!(rules.clamp_warmth(0.0), rules.min_warmth);
        assert_eq!(rules.clamp_warmth(1.0), rules.max_warmth);
        assert_eq!(rules.clamp_warmth(0.5), 0.5);
    }

    #[test]
    fn test_smooth() {
        let rules = BehaviorRules::default();
        let current = 0.5;
        let target = 1.0;
        let result = rules.smooth(current, target);
        assert!(result > current);
        assert!(result < target);
    }
}
