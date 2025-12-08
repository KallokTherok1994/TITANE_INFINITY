// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS - STYLE CONTROLLER
//   Super Prompt #13: Adaptive conversation style management
//   Controls tone, structure, density, tempo of responses
// ═══════════════════════════════════════════════════════════════

use super::brain_state::{AffectiveState, ConversationMode, StyleProfile};

/// Style Controller - Manages adaptive conversation styling
#[derive(Debug, Clone)]
pub struct StyleController {
    /// Current active style
    current_style: StyleProfile,
    /// Style history for consistency tracking
    style_history: Vec<StyleProfile>,
    /// Maximum history size
    max_history: usize,
    /// Stability factor (how much to resist change)
    stability_factor: f32,
}

impl Default for StyleController {
    fn default() -> Self {
        Self {
            current_style: StyleProfile::default(),
            style_history: Vec::new(),
            max_history: 10,
            stability_factor: 0.7,
        }
    }
}

impl StyleController {
    /// Create new style controller
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with custom stability
    pub fn with_stability(stability: f32) -> Self {
        Self {
            stability_factor: stability.clamp(0.0, 1.0),
            ..Self::default()
        }
    }

    /// Adapt style based on mode and affect
    pub fn adapt(&mut self, mode: ConversationMode, affect: &AffectiveState) -> StyleProfile {
        // Get base style from mode
        let mut new_style = StyleProfile::from_mode(mode);

        // Adjust based on affect
        self.apply_affect_adjustments(&mut new_style, affect);

        // Apply stability smoothing with history
        self.apply_stability_smoothing(&mut new_style);

        // Store in history
        self.store_style(&new_style);

        // Update current
        self.current_style = new_style.clone();

        new_style
    }

    /// Apply affect-based adjustments to style
    fn apply_affect_adjustments(&self, style: &mut StyleProfile, affect: &AffectiveState) {
        // Valence affects tone warmth
        if affect.valence > 0.3 {
            // More positive → warmer tone
            if style.tone == "neutre" || style.tone == "équilibré" {
                style.tone = "bienveillant".to_string();
            }
        } else if affect.valence < -0.3 {
            // More negative → more serious/supportive
            style.tone = "attentif".to_string();
        }

        // Arousal affects tempo
        style.tempo = (style.tempo + affect.arousal * 0.2).clamp(0.0, 1.0);

        // Low confidence → more cautious phrasing
        if affect.confidence < 0.5 {
            style.density *= 0.8;
        }
    }

    /// Apply stability smoothing based on history
    fn apply_stability_smoothing(&self, style: &mut StyleProfile) {
        if self.style_history.is_empty() {
            return;
        }

        // Calculate average from history
        let history_avg = self.calculate_history_average();

        // Blend with stability factor
        let blend = self.stability_factor;

        style.density = style.density * (1.0 - blend) + history_avg.density * blend;
        style.tempo = style.tempo * (1.0 - blend) + history_avg.tempo * blend;
        style.formality = style.formality * (1.0 - blend) + history_avg.formality * blend;
    }

    /// Calculate average style from history
    fn calculate_history_average(&self) -> StyleProfile {
        if self.style_history.is_empty() {
            return StyleProfile::default();
        }

        let count = self.style_history.len() as f32;

        let avg_density: f32 = self.style_history.iter().map(|s| s.density).sum::<f32>() / count;
        let avg_tempo: f32 = self.style_history.iter().map(|s| s.tempo).sum::<f32>() / count;
        let avg_formality: f32 =
            self.style_history.iter().map(|s| s.formality).sum::<f32>() / count;

        // Most common tone
        let tone = self
            .style_history
            .last()
            .map(|s| s.tone.clone())
            .unwrap_or_else(|| "équilibré".to_string());

        StyleProfile {
            tone,
            structure: "adaptatif".to_string(),
            density: avg_density,
            tempo: avg_tempo,
            formality: avg_formality,
            use_examples: true,
            use_emojis: false,
        }
    }

    /// Store style in history
    fn store_style(&mut self, style: &StyleProfile) {
        self.style_history.push(style.clone());
        if self.style_history.len() > self.max_history {
            self.style_history.remove(0);
        }
    }

    /// Get current style
    pub fn current(&self) -> &StyleProfile {
        &self.current_style
    }

    /// Get style stability score (how consistent recent styles are)
    pub fn stability_score(&self) -> f32 {
        if self.style_history.len() < 2 {
            return 1.0;
        }

        // Calculate variance in key metrics
        let densities: Vec<f32> = self.style_history.iter().map(|s| s.density).collect();
        let tempos: Vec<f32> = self.style_history.iter().map(|s| s.tempo).collect();

        let density_var = calculate_variance(&densities);
        let tempo_var = calculate_variance(&tempos);

        // Lower variance = higher stability
        let avg_variance = (density_var + tempo_var) / 2.0;
        (1.0 - avg_variance.min(1.0)).max(0.0)
    }

    /// Reset style to default
    pub fn reset(&mut self) {
        self.current_style = StyleProfile::default();
        self.style_history.clear();
    }

    /// Force a specific style (overrides adaptation)
    pub fn force_style(&mut self, style: StyleProfile) {
        self.current_style = style.clone();
        self.store_style(&style);
    }

    /// Get style directive string for prompt construction
    pub fn get_directive(&self) -> String {
        let style = &self.current_style;
        format!(
            "Style: {} | Structure: {} | Densité: {:.0}% | Tempo: {:.0}% | Formalité: {:.0}%",
            style.tone,
            style.structure,
            style.density * 100.0,
            style.tempo * 100.0,
            style.formality * 100.0
        )
    }
}

/// Calculate variance of a slice
fn calculate_variance(values: &[f32]) -> f32 {
    if values.len() < 2 {
        return 0.0;
    }

    let mean = values.iter().sum::<f32>() / values.len() as f32;
    let squared_diff_sum: f32 = values.iter().map(|v| (v - mean).powi(2)).sum();
    squared_diff_sum / values.len() as f32
}

// ═══════════════════════════════════════════════════════════════
//   STYLE PRESETS
// ═══════════════════════════════════════════════════════════════

impl StyleController {
    /// Get coaching preset
    pub fn preset_coaching() -> StyleProfile {
        StyleProfile {
            tone: "chaleureux".to_string(),
            structure: "progressif".to_string(),
            density: 0.4,
            tempo: 0.4,
            formality: 0.3,
            use_examples: true,
            use_emojis: false,
        }
    }

    /// Get technical preset
    pub fn preset_technical() -> StyleProfile {
        StyleProfile {
            tone: "précis".to_string(),
            structure: "structuré".to_string(),
            density: 0.85,
            tempo: 0.5,
            formality: 0.8,
            use_examples: true,
            use_emojis: false,
        }
    }

    /// Get creative preset
    pub fn preset_creative() -> StyleProfile {
        StyleProfile {
            tone: "inspirant".to_string(),
            structure: "libre".to_string(),
            density: 0.5,
            tempo: 0.6,
            formality: 0.2,
            use_examples: true,
            use_emojis: false,
        }
    }

    /// Get minimal preset (concise answers)
    pub fn preset_minimal() -> StyleProfile {
        StyleProfile {
            tone: "direct".to_string(),
            structure: "concis".to_string(),
            density: 0.9,
            tempo: 0.8,
            formality: 0.6,
            use_examples: false,
            use_emojis: false,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_style_controller_creation() {
        let controller = StyleController::new();
        assert_eq!(controller.current().tone, "équilibré");
    }

    #[test]
    fn test_style_adaptation() {
        let mut controller = StyleController::new();
        let affect = AffectiveState::default();

        let style = controller.adapt(ConversationMode::Coach, &affect);
        assert_eq!(style.tone, "chaleureux");
    }

    #[test]
    fn test_affect_adjustments() {
        let mut controller = StyleController::new();

        // Positive affect
        let positive_affect = AffectiveState::new(0.5, 0.6);
        let style = controller.adapt(ConversationMode::Neutral, &positive_affect);
        assert!(style.tempo > 0.5); // Higher arousal → faster tempo

        // Negative affect
        let negative_affect = AffectiveState::new(-0.5, 0.3);
        let style2 = controller.adapt(ConversationMode::Neutral, &negative_affect);
        assert_eq!(style2.tone, "attentif");
    }

    #[test]
    fn test_stability_smoothing() {
        let mut controller = StyleController::with_stability(0.5);

        // Build up history
        for _ in 0..5 {
            controller.adapt(ConversationMode::Expert, &AffectiveState::default());
        }

        // Now change mode - should be smoothed
        let new_style = controller.adapt(ConversationMode::Creative, &AffectiveState::default());

        // Should be blended, not pure creative
        assert!(new_style.density > StyleProfile::from_mode(ConversationMode::Creative).density);
    }

    #[test]
    fn test_stability_score() {
        let mut controller = StyleController::new();

        // Same style repeatedly = high stability
        for _ in 0..5 {
            controller.adapt(ConversationMode::Expert, &AffectiveState::default());
        }

        let score = controller.stability_score();
        assert!(score > 0.9);
    }

    #[test]
    fn test_presets() {
        let coaching = StyleController::preset_coaching();
        assert_eq!(coaching.tone, "chaleureux");

        let technical = StyleController::preset_technical();
        assert!(technical.density > 0.8);

        let minimal = StyleController::preset_minimal();
        assert!(minimal.tempo > 0.7);
    }

    #[test]
    fn test_directive() {
        let controller = StyleController::new();
        let directive = controller.get_directive();

        assert!(directive.contains("Style:"));
        assert!(directive.contains("Densité:"));
    }
}
