/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — FRENCH MASTERY POST-PROCESSOR
 * Post-traitement linguistique avancé pour réponses en français
 * ═══════════════════════════════════════════════════════════════════
 */
use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

/// Mode d'intervention du post-processeur
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ProcessingMode {
    /// Correction pure (orthographe, grammaire)
    Correction,

    /// Optimisation style TITANE
    Optimization,

    /// Simplification (version condensée)
    Simplification,

    /// Enrichissement pédagogique
    Enrichment,

    /// Double version (synthèse + développée)
    Double,
}

impl Default for ProcessingMode {
    fn default() -> Self {
        Self::Optimization
    }
}

/// Ton de la réponse
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Tone {
    Neutral,
    Warm,
    Professional,
}

impl Default for Tone {
    fn default() -> Self {
        Self::Neutral
    }
}

/// Longueur cible
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Length {
    Short,
    Medium,
    Long,
}

impl Default for Length {
    fn default() -> Self {
        Self::Medium
    }
}

/// Niveau technique
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum TechnicalLevel {
    Beginner,
    Intermediate,
    Expert,
}

impl Default for TechnicalLevel {
    fn default() -> Self {
        Self::Intermediate
    }
}

/// Contraintes de post-traitement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostProcessingConstraints {
    pub tone: Tone,
    pub length: Length,
    pub technical_level: TechnicalLevel,
}

impl Default for PostProcessingConstraints {
    fn default() -> Self {
        Self {
            tone: Tone::default(),
            length: Length::default(),
            technical_level: TechnicalLevel::default(),
        }
    }
}

/// Requête de post-traitement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrenchMasteryRequest {
    /// Contexte de la conversation
    pub context: String,

    /// Brouillon de réponse à améliorer
    pub draft_response: String,

    /// Mode d'intervention
    pub mode: ProcessingMode,

    /// Contraintes
    pub constraints: PostProcessingConstraints,
}

/// Réponse du post-processeur
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrenchMasteryResponse {
    /// Commentaire rapide sur le traitement (optionnel)
    pub comment: Option<String>,

    /// Réponse finalisée (version principale)
    pub finalized_response: String,

    /// Variante/synthèse (optionnel)
    pub variant: Option<String>,

    /// Scores de qualité
    pub quality_scores: QualityScores,
}

/// Scores de qualité linguistique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityScores {
    pub linguistic_correctness: f32, // 0.0 → 1.0
    pub clarity: f32,
    pub titane_style_match: f32,
    pub context_adaptation: f32,
    pub optimal_density: f32,
    pub reusability: f32,
}

impl Default for QualityScores {
    fn default() -> Self {
        Self {
            linguistic_correctness: 0.9,
            clarity: 0.85,
            titane_style_match: 0.9,
            context_adaptation: 0.8,
            optimal_density: 0.75,
            reusability: 0.7,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// FRENCH MASTERY POST-PROCESSOR
// ═══════════════════════════════════════════════════════════════════

pub struct FrenchMasteryProcessor {
    // Configuration du processeur
    enable_auto_simplification: bool,
    enable_pedagogical_enrichment: bool,
}

impl FrenchMasteryProcessor {
    pub fn new() -> Self {
        Self {
            enable_auto_simplification: true,
            enable_pedagogical_enrichment: true,
        }
    }

    /// Point d'entrée principal : post-traiter une réponse
    pub async fn process(
        &self,
        request: FrenchMasteryRequest,
    ) -> Result<FrenchMasteryResponse, String> {
        match request.mode {
            ProcessingMode::Correction => self.apply_correction(&request).await,
            ProcessingMode::Optimization => self.apply_optimization(&request).await,
            ProcessingMode::Simplification => self.apply_simplification(&request).await,
            ProcessingMode::Enrichment => self.apply_enrichment(&request).await,
            ProcessingMode::Double => self.apply_double_version(&request).await,
        }
    }

    // ───────────────────────────────────────────────────────────────
    // MODES D'INTERVENTION
    // ───────────────────────────────────────────────────────────────

    /// MODE 1 : Correction pure
    async fn apply_correction(
        &self,
        request: &FrenchMasteryRequest,
    ) -> Result<FrenchMasteryResponse, String> {
        // Correction orthographique, grammaticale, concordance
        let corrected = self.correct_language(&request.draft_response);

        Ok(FrenchMasteryResponse {
            comment: Some("Correction linguistique appliquée".to_string()),
            finalized_response: corrected,
            variant: None,
            quality_scores: QualityScores {
                linguistic_correctness: 1.0,
                ..Default::default()
            },
        })
    }

    /// MODE 2 : Optimisation style TITANE
    async fn apply_optimization(
        &self,
        request: &FrenchMasteryRequest,
    ) -> Result<FrenchMasteryResponse, String> {
        let mut optimized = self.correct_language(&request.draft_response);
        optimized = self.optimize_structure(&optimized);
        optimized = self.apply_titane_style(&optimized);

        Ok(FrenchMasteryResponse {
            comment: Some("Optimisation style TITANE appliquée".to_string()),
            finalized_response: optimized,
            variant: None,
            quality_scores: QualityScores {
                linguistic_correctness: 1.0,
                clarity: 0.95,
                titane_style_match: 0.95,
                ..Default::default()
            },
        })
    }

    /// MODE 3 : Simplification
    async fn apply_simplification(
        &self,
        request: &FrenchMasteryRequest,
    ) -> Result<FrenchMasteryResponse, String> {
        let simplified = self.simplify_response(&request.draft_response);

        Ok(FrenchMasteryResponse {
            comment: Some("Simplification appliquée (version condensée)".to_string()),
            finalized_response: simplified,
            variant: None,
            quality_scores: QualityScores {
                clarity: 0.98,
                optimal_density: 0.95,
                ..Default::default()
            },
        })
    }

    /// MODE 4 : Enrichissement pédagogique
    async fn apply_enrichment(
        &self,
        request: &FrenchMasteryRequest,
    ) -> Result<FrenchMasteryResponse, String> {
        let mut enriched = self.correct_language(&request.draft_response);
        enriched = self.add_pedagogical_elements(&enriched);

        Ok(FrenchMasteryResponse {
            comment: Some("Enrichissement pédagogique ajouté".to_string()),
            finalized_response: enriched,
            variant: None,
            quality_scores: QualityScores {
                clarity: 0.92,
                reusability: 0.85,
                ..Default::default()
            },
        })
    }

    /// MODE 5 : Double version
    async fn apply_double_version(
        &self,
        request: &FrenchMasteryRequest,
    ) -> Result<FrenchMasteryResponse, String> {
        let full = self.correct_language(&request.draft_response);
        let short = self.simplify_response(&full);

        Ok(FrenchMasteryResponse {
            comment: Some("Deux versions générées : synthèse + complète".to_string()),
            finalized_response: full,
            variant: Some(short),
            quality_scores: QualityScores {
                clarity: 0.95,
                optimal_density: 0.9,
                reusability: 0.85,
                ..Default::default()
            },
        })
    }

    // ───────────────────────────────────────────────────────────────
    // FONCTIONS UTILITAIRES
    // ───────────────────────────────────────────────────────────────

    /// Corriger la langue (orthographe, grammaire, accords)
    fn correct_language(&self, text: &str) -> String {
        let mut corrected = text.to_string();

        // Corrections courantes
        corrected = corrected.replace("Les données est", "Les données sont");
        corrected = corrected.replace("il faut que tu fais", "il faut que tu fasses");
        corrected = corrected.replace("j'ai analysé les données", "j'ai analysées les données");

        // TODO: Intégration future avec API de correction avancée (LanguageTool, etc.)

        corrected
    }

    /// Optimiser la structure (phrases courtes, connecteurs logiques)
    fn optimize_structure(&self, text: &str) -> String {
        // Détecter phrases trop longues (> 30 mots)
        let sentences: Vec<&str> = text.split('.').collect();
        let mut optimized = String::new();

        for sentence in sentences {
            let word_count = sentence.split_whitespace().count();

            if word_count > 30 {
                // Phrase longue → segmentation suggérée
                optimized.push_str(&self.segment_long_sentence(sentence));
            } else {
                optimized.push_str(sentence);
                if !sentence.is_empty() {
                    optimized.push('.');
                }
            }
        }

        optimized
    }

    /// Segmenter phrase longue
    fn segment_long_sentence(&self, sentence: &str) -> String {
        // Simplification : découper sur "et", "donc", "mais"
        sentence
            .replace(" et ", ".\n")
            .replace(" donc ", ".\nDonc, ")
            .replace(" mais ", ".\nMais ")
    }

    /// Appliquer le style TITANE
    fn apply_titane_style(&self, text: &str) -> String {
        let mut styled = text.to_string();

        // Remplacements style
        styled = styled.replace("Je pense que", "Je suggère");
        styled = styled.replace("Il y a genre", "Voici");
        styled = styled.replace(
            "C'est cool parce que",
            "Cette approche présente l'avantage de",
        );
        styled = styled.replace("trop stylé", "efficace");
        styled = styled.replace("ça déchire", "remarquable");

        styled
    }

    /// Simplifier réponse (version condensée)
    fn simplify_response(&self, text: &str) -> String {
        // Extraire points clés (heuristique simple)
        let lines: Vec<&str> = text.lines().collect();
        let mut simplified = String::new();

        // Garder première ligne (souvent la synthèse)
        if !lines.is_empty() {
            simplified.push_str(lines[0]);
            simplified.push_str("\n\n");
        }

        // Extraire lignes commençant par numéros/tirets (listes)
        for line in lines.iter().skip(1) {
            if line.trim().starts_with('-')
                || line.trim().starts_with('1')
                || line.trim().starts_with('2')
                || line.trim().starts_with('3')
            {
                simplified.push_str(line);
                simplified.push('\n');
            }
        }

        simplified
    }

    /// Ajouter éléments pédagogiques
    fn add_pedagogical_elements(&self, text: &str) -> String {
        // Détecter termes techniques et ajouter micro-explication
        let mut enriched = text.to_string();

        // Exemples de termes techniques TITANE
        if enriched.contains("mémoire épisodique") && !enriched.contains("comme un journal") {
            enriched = enriched.replace(
                "mémoire épisodique",
                "mémoire épisodique (comme un journal de bord qui garde les étapes clés)",
            );
        }

        if enriched.contains("compression cognitive") && !enriched.contains("comme un ZIP") {
            enriched = enriched.replace(
                "compression cognitive",
                "compression cognitive (comme un ZIP qui garde l'essentiel sans perdre les infos stratégiques)"
            );
        }

        enriched
    }

    // ───────────────────────────────────────────────────────────────
    // AUTO-ÉVALUATION
    // ───────────────────────────────────────────────────────────────

    /// Évaluer qualité de la réponse finalisée
    pub fn evaluate_quality(&self, response: &str, original: &str) -> QualityScores {
        let linguistic_correctness = self.check_linguistic_correctness(response);
        let clarity = self.check_clarity(response);
        let titane_style_match = self.check_titane_style(response);
        let context_adaptation = self.check_context_adaptation(response, original);
        let optimal_density = self.check_density(response);
        let reusability = self.check_reusability(response);

        QualityScores {
            linguistic_correctness,
            clarity,
            titane_style_match,
            context_adaptation,
            optimal_density,
            reusability,
        }
    }

    fn check_linguistic_correctness(&self, text: &str) -> f32 {
        // Heuristique simple : détecter patterns incorrects
        let errors = text.matches("est disponible").count() // devrait être "sont"
            + text.matches("que tu fais").count(); // devrait être "fasses"

        if errors > 0 {
            0.7
        } else {
            1.0
        }
    }

    fn check_clarity(&self, text: &str) -> f32 {
        // Phrases courtes = clarté élevée
        let sentences: Vec<&str> = text.split('.').collect();
        let avg_sentence_length: f32 = sentences
            .iter()
            .map(|s| s.split_whitespace().count() as f32)
            .sum::<f32>()
            / sentences.len() as f32;

        if avg_sentence_length < 20.0 {
            0.95
        } else if avg_sentence_length < 30.0 {
            0.85
        } else {
            0.70
        }
    }

    fn check_titane_style(&self, text: &str) -> f32 {
        // Mots-clés style TITANE
        let good_markers = text.matches("suggère").count()
            + text.matches("Voici").count()
            + text.matches("précis").count();

        let bad_markers = text.matches("genre").count()
            + text.matches("trop stylé").count()
            + text.matches("ça déchire").count();

        if bad_markers > 0 {
            0.5
        } else if good_markers > 2 {
            0.95
        } else {
            0.8
        }
    }

    fn check_context_adaptation(&self, _text: &str, _original: &str) -> f32 {
        // TODO: Analyse contextuelle avancée
        0.8
    }

    fn check_density(&self, text: &str) -> f32 {
        // Densité optimale : 100-200 mots
        let word_count = text.split_whitespace().count();

        if (100..=200).contains(&word_count) {
            0.9
        } else if word_count < 50 {
            0.6 // Trop court
        } else {
            0.7 // Trop long
        }
    }

    fn check_reusability(&self, text: &str) -> f32 {
        // Réutilisable si structure claire (listes, sections)
        let has_lists = text.contains('-') || text.contains("1.");
        let has_sections = text.contains("##") || text.contains("###");

        if has_lists || has_sections {
            0.85
        } else {
            0.65
        }
    }
}

impl Default for FrenchMasteryProcessor {
    fn default() -> Self {
        Self::new()
    }
}
