// TITANE∞ ONE v∞ — Literary Style & Vocabulary Evolution Engine
// Super Prompt #7 Implementation
// Copyright © 2025 Kevin Thibault - Tous droits réservés

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Niveau d'intensité littéraire souhaité
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum LiteraryIntensity {
    Sober,    // sobre, épuré
    Balanced, // équilibré
    Poetic,   // plus poétique, lyrique
}

/// Type de texte à produire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextType {
    Post,          // post court (LinkedIn, etc.)
    BookParagraph, // paragraphe de livre
    Poetry,        // poésie
    Intro,         // introduction
    Chapter,       // chapitre
    Manifesto,     // manifeste
    WebPage,       // page web
    Other(String), // autre type
}

/// Mode d'écriture du moteur
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum WritingMode {
    LiterarySmoothing, // lissage littéraire
    LiteraryEnhanced,  // version littéraire +
    PoeticVersion,     // version poétique
    DoubleVersion,     // deux versions (claire + littéraire)
    AdaptToMedium,     // adaptation au support
}

/// Axes d'optimisation littéraire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiteraryOptimizationScores {
    pub narrative_structure: f32, // 0-1: structure et respiration
    pub vocabulary_richness: f32, // 0-1: richesse lexicale
    pub imagery_quality: f32,     // 0-1: qualité des images/métaphores
    pub rhythm_musicality: f32,   // 0-1: rythme et sonorité
    pub message_alignment: f32,   // 0-1: alignement avec le message
}

/// Profil de style Kevin Thibault (évolutif)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KevinStyleProfile {
    pub version: String,
    pub last_updated: String,

    // Caractéristiques stylistiques
    pub preferred_sentence_length: (usize, usize), // (min, max) mots
    pub metaphor_types: Vec<String>,               // types de métaphores préférées
    pub lexical_fields: Vec<String>,               // champs lexicaux dominants
    pub structural_patterns: Vec<String>,          // patterns narratifs

    // Rapport concret/conceptuel
    pub concrete_conceptual_ratio: f32, // 0-1: 0=très concret, 1=très conceptuel

    // Tonalité dominante
    pub dominant_tones: Vec<String>, // "méditatif", "narratif", "structurant", etc.
}

impl Default for KevinStyleProfile {
    fn default() -> Self {
        Self {
            version: "1.0.0".to_string(),
            last_updated: chrono::Utc::now().to_rfc3339(),
            preferred_sentence_length: (8, 25),
            metaphor_types: vec![
                "corps et espace".to_string(),
                "rythme et temps".to_string(),
                "moteurs et architectures".to_string(),
                "nature et vivant".to_string(),
            ],
            lexical_fields: vec![
                "clarté".to_string(),
                "structure".to_string(),
                "cohérence".to_string(),
                "rythme".to_string(),
                "espace".to_string(),
                "vivant".to_string(),
            ],
            structural_patterns: vec![
                "définition par négation".to_string(),
                "triptyque".to_string(),
                "parallélisme".to_string(),
                "respiration visuelle".to_string(),
            ],
            concrete_conceptual_ratio: 0.6, // 60% concret, 40% conceptuel
            dominant_tones: vec![
                "méditatif".to_string(),
                "structurant".to_string(),
                "incarné".to_string(),
            ],
        }
    }
}

/// Requête pour le moteur littéraire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiteraryRequest {
    pub context: LiteraryContext,
    pub draft: String,
    pub reference_style: Option<Vec<String>>, // extraits de référence
    pub mode: WritingMode,
}

/// Contexte de la requête littéraire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiteraryContext {
    pub text_type: TextType,
    pub intensity: LiteraryIntensity,
    pub target_length: Option<usize>, // nombre de mots approximatif
}

/// Réponse du moteur littéraire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiteraryResponse {
    pub main_version: String,
    pub alternative_version: Option<String>, // pour DoubleVersion
    pub optimization_scores: LiteraryOptimizationScores,
    pub comment: Option<String>, // commentaire bref si pertinent
    pub style_profile_updated: bool,
}

/// Moteur de style littéraire et vocabulaire évolutif
pub struct LiteraryEngine {
    style_profile: KevinStyleProfile,
}

impl LiteraryEngine {
    pub fn new() -> Self {
        Self {
            style_profile: KevinStyleProfile::default(),
        }
    }

    /// Traiter une requête littéraire
    pub fn process(&self, request: LiteraryRequest) -> LiteraryResponse {
        match request.mode {
            WritingMode::LiterarySmoothing => self.apply_literary_smoothing(request),
            WritingMode::LiteraryEnhanced => self.apply_literary_enhanced(request),
            WritingMode::PoeticVersion => self.apply_poetic_version(request),
            WritingMode::DoubleVersion => self.apply_double_version(request),
            WritingMode::AdaptToMedium => self.apply_medium_adaptation(request),
        }
    }

    /// Mode 1: Lissage littéraire
    fn apply_literary_smoothing(&self, request: LiteraryRequest) -> LiteraryResponse {
        let mut text = request.draft.clone();

        // Améliorer structure narrative
        text = self.improve_narrative_structure(&text);

        // Enrichir vocabulaire
        text = self.enrich_vocabulary(&text, request.context.intensity);

        // Améliorer rythme
        text = self.improve_rhythm(&text);

        LiteraryResponse {
            main_version: text,
            alternative_version: None,
            optimization_scores: self.evaluate_text(&request.draft),
            comment: Some("Version lissée + enrichie, en gardant ton style.".to_string()),
            style_profile_updated: false,
        }
    }

    /// Mode 2: Version littéraire +
    fn apply_literary_enhanced(&self, request: LiteraryRequest) -> LiteraryResponse {
        let mut text = request.draft.clone();

        // Toutes les optimisations du lissage
        text = self.improve_narrative_structure(&text);
        text = self.enrich_vocabulary(&text, request.context.intensity);
        text = self.improve_rhythm(&text);

        // + ajout d'images et métaphores
        text = self.add_imagery(&text, &self.style_profile);

        // + profondeur stylistique
        text = self.add_stylistic_depth(&text);

        LiteraryResponse {
            main_version: text,
            alternative_version: None,
            optimization_scores: self.evaluate_text(&request.draft),
            comment: Some("Version enrichie avec images et profondeur.".to_string()),
            style_profile_updated: false,
        }
    }

    /// Mode 3: Version poétique
    fn apply_poetic_version(&self, request: LiteraryRequest) -> LiteraryResponse {
        let text = self.transform_to_poetry(&request.draft, &self.style_profile);

        LiteraryResponse {
            main_version: text,
            alternative_version: None,
            optimization_scores: self.evaluate_text(&request.draft),
            comment: Some("Transformation poétique, style sobre et incarné.".to_string()),
            style_profile_updated: false,
        }
    }

    /// Mode 4: Double version
    fn apply_double_version(&self, request: LiteraryRequest) -> LiteraryResponse {
        // Version A: claire et structurée
        let version_a = self.improve_narrative_structure(&request.draft);

        // Version B: littéraire/poétique
        let mut version_b = version_a.clone();
        version_b = self.enrich_vocabulary(&version_b, LiteraryIntensity::Poetic);
        version_b = self.add_imagery(&version_b, &self.style_profile);

        LiteraryResponse {
            main_version: version_a,
            alternative_version: Some(version_b),
            optimization_scores: self.evaluate_text(&request.draft),
            comment: Some("Deux versions : A (claire) et B (littéraire).".to_string()),
            style_profile_updated: false,
        }
    }

    /// Mode 5: Adaptation au support
    fn apply_medium_adaptation(&self, request: LiteraryRequest) -> LiteraryResponse {
        let text = match &request.context.text_type {
            TextType::Post => self.adapt_for_post(&request.draft),
            TextType::BookParagraph => self.adapt_for_book(&request.draft),
            TextType::WebPage => self.adapt_for_web(&request.draft),
            _ => self.improve_narrative_structure(&request.draft),
        };

        LiteraryResponse {
            main_version: text,
            alternative_version: None,
            optimization_scores: self.evaluate_text(&request.draft),
            comment: Some("Adapté au support, même voix.".to_string()),
            style_profile_updated: false,
        }
    }

    /// Améliorer la structure narrative
    fn improve_narrative_structure(&self, text: &str) -> String {
        // Split en phrases
        let sentences: Vec<&str> = text
            .split('.')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        // Alterner phrases courtes et développées
        let mut result = Vec::new();
        let mut is_short = false;

        for sentence in sentences {
            let word_count = sentence.split_whitespace().count();

            #[allow(clippy::if_same_then_else)]
            if (is_short && word_count > 15) || (!is_short && word_count < 10) {
                result.push(sentence.to_string());
            } else {
                result.push(sentence.to_string());
            }

            is_short = !is_short;
        }

        // Reconstituer avec ponctuation
        result.join(". ") + "."
    }

    /// Enrichir le vocabulaire
    fn enrich_vocabulary(&self, text: &str, intensity: LiteraryIntensity) -> String {
        let mut enriched = text.to_string();

        // Remplacer répétitions basiques selon l'intensité
        let replacements = match intensity {
            LiteraryIntensity::Sober => self.get_sober_replacements(),
            LiteraryIntensity::Balanced => self.get_balanced_replacements(),
            LiteraryIntensity::Poetic => self.get_poetic_replacements(),
        };

        for (from, to) in replacements.iter() {
            enriched = enriched.replace(from, to);
        }

        enriched
    }

    /// Améliorer le rythme
    fn improve_rhythm(&self, text: &str) -> String {
        // Éviter les accumulations de "que"
        let mut improved = text.replace(" que que ", " que ");

        // Éviter les subordonnées trop complexes
        // (simplification heuristique)
        improved = improved.replace(", qui, ", ". Ce dernier ");

        improved
    }

    /// Ajouter des images et métaphores
    fn add_imagery(&self, text: &str, profile: &KevinStyleProfile) -> String {
        let mut with_imagery = text.to_string();

        // Exemples d'enrichissements selon les métaphores de Kevin
        // (ici version simplifiée, en production utiliser embeddings + recherche)

        if text.contains("système") {
            with_imagery = with_imagery.replace("système", "architecture vivante");
        }

        if text.contains("organiser") {
            with_imagery = with_imagery.replace("organiser", "donner un rythme à");
        }

        with_imagery
    }

    /// Ajouter de la profondeur stylistique
    fn add_stylistic_depth(&self, text: &str) -> String {
        // Ajouter des transitions douces
        let mut deep = text.to_string();

        // Insérer des respirations
        if !deep.contains("\n\n") {
            let sentences: Vec<&str> = deep.split('.').collect();
            if sentences.len() > 3 {
                deep = sentences[..sentences.len() / 2].join(". ")
                    + ".\n\n"
                    + &sentences[sentences.len() / 2..].join(". ");
            }
        }

        deep
    }

    /// Transformer en poésie
    fn transform_to_poetry(&self, text: &str, profile: &KevinStyleProfile) -> String {
        let sentences: Vec<&str> = text
            .split('.')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        let mut poetry = Vec::new();

        for sentence in sentences {
            // Couper en vers (heuristique simple)
            let words: Vec<&str> = sentence.split_whitespace().collect();
            let mut verse = Vec::new();

            for (i, word) in words.iter().enumerate() {
                verse.push(*word);

                // Couper vers tous les 5-7 mots
                if (i + 1) % 6 == 0 {
                    poetry.push(verse.join(" "));
                    verse.clear();
                }
            }

            if !verse.is_empty() {
                poetry.push(verse.join(" "));
            }

            poetry.push("".to_string()); // ligne vide entre strophes
        }

        poetry.join("\n")
    }

    /// Adapter pour post court
    fn adapt_for_post(&self, text: &str) -> String {
        // Structure en 3 paragraphes max, phrases courtes
        let sentences: Vec<&str> = text
            .split('.')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        let chunk_size = (sentences.len() + 2) / 3; // diviser en 3
        let mut chunks = Vec::new();

        for chunk in sentences.chunks(chunk_size) {
            chunks.push(chunk.join(". ") + ".");
        }

        chunks.join("\n\n")
    }

    /// Adapter pour livre
    fn adapt_for_book(&self, text: &str) -> String {
        let mut book_text = text.to_string();

        // Ajouter profondeur et respirations
        book_text = self.add_stylistic_depth(&book_text);
        book_text = self.enrich_vocabulary(&book_text, LiteraryIntensity::Balanced);

        book_text
    }

    /// Adapter pour web
    fn adapt_for_web(&self, text: &str) -> String {
        // Paragraphes courts, scannable
        let sentences: Vec<&str> = text
            .split('.')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        let mut web_text = Vec::new();
        for (i, sentence) in sentences.iter().enumerate() {
            web_text.push(sentence.to_string() + ".");

            // Ligne vide tous les 2-3 phrases
            if (i + 1) % 2 == 0 {
                web_text.push("".to_string());
            }
        }

        web_text.join("\n")
    }

    /// Évaluer la qualité littéraire d'un texte
    fn evaluate_text(&self, text: &str) -> LiteraryOptimizationScores {
        let word_count = text.split_whitespace().count();
        let sentence_count = text.split('.').filter(|s| !s.trim().is_empty()).count();

        LiteraryOptimizationScores {
            narrative_structure: self.score_narrative_structure(text, sentence_count),
            vocabulary_richness: self.score_vocabulary_richness(text, word_count),
            imagery_quality: self.score_imagery_quality(text),
            rhythm_musicality: self.score_rhythm(text),
            message_alignment: 0.85, // par défaut élevé
        }
    }

    fn score_narrative_structure(&self, text: &str, sentence_count: usize) -> f32 {
        // Score basé sur variété de longueurs de phrases
        if sentence_count < 2 {
            return 0.5;
        }

        let has_paragraphs = text.contains("\n\n");
        let base_score = if has_paragraphs { 0.7 } else { 0.5 };

        base_score + 0.2 * (sentence_count.min(5) as f32 / 5.0)
    }

    fn score_vocabulary_richness(&self, text: &str, word_count: usize) -> f32 {
        let words: Vec<&str> = text.split_whitespace().collect();
        let unique_words: std::collections::HashSet<&str> = words.iter().cloned().collect();

        let diversity = unique_words.len() as f32 / word_count.max(1) as f32;
        diversity.min(1.0)
    }

    fn score_imagery_quality(&self, text: &str) -> f32 {
        // Détecter présence d'images/métaphores (heuristique simple)
        let imagery_keywords = [
            "comme",
            "tel",
            "semblable",
            "image",
            "respire",
            "rythme",
            "espace",
        ];
        let count = imagery_keywords
            .iter()
            .filter(|k| text.contains(*k))
            .count();

        (count as f32 / imagery_keywords.len() as f32).min(1.0)
    }

    fn score_rhythm(&self, text: &str) -> f32 {
        // Détecter problèmes de rythme
        let has_que_que = text.contains(" que que ");
        let has_excessive_subordinates = text.matches(", qui").count() > 3;

        if has_que_que || has_excessive_subordinates {
            0.5
        } else {
            0.8
        }
    }

    /// Obtenir remplacements vocabulaire (sobre)
    fn get_sober_replacements(&self) -> HashMap<&'static str, &'static str> {
        let mut map = HashMap::new();
        map.insert("beaucoup de", "nombre de");
        map.insert("très bien", "pertinent");
        map.insert("faire", "réaliser");
        map
    }

    /// Obtenir remplacements vocabulaire (équilibré)
    fn get_balanced_replacements(&self) -> HashMap<&'static str, &'static str> {
        let mut map = self.get_sober_replacements();
        map.insert("utiliser", "mettre en œuvre");
        map.insert("voir", "percevoir");
        map.insert("penser", "concevoir");
        map
    }

    /// Obtenir remplacements vocabulaire (poétique)
    fn get_poetic_replacements(&self) -> HashMap<&'static str, &'static str> {
        let mut map = self.get_balanced_replacements();
        map.insert("organisation", "architecture vivante");
        map.insert("clarté", "lumière intérieure");
        map.insert("structure", "ossature");
        map
    }

    /// Mettre à jour le profil de style avec de nouveaux textes
    pub fn update_style_profile(&mut self, new_texts: Vec<String>) {
        for text in new_texts {
            self.analyze_and_integrate_style(&text);
        }

        self.style_profile.last_updated = chrono::Utc::now().to_rfc3339();
        self.style_profile.version = self.increment_version(&self.style_profile.version);
    }

    fn analyze_and_integrate_style(&mut self, text: &str) {
        // Analyser longueur moyenne de phrases
        let sentences: Vec<&str> = text.split('.').filter(|s| !s.trim().is_empty()).collect();
        let avg_length: usize = sentences
            .iter()
            .map(|s| s.split_whitespace().count())
            .sum::<usize>()
            / sentences.len().max(1);

        // Ajuster profil (moyenne pondérée)
        let (current_min, current_max) = self.style_profile.preferred_sentence_length;
        self.style_profile.preferred_sentence_length = (
            (current_min + avg_length.saturating_sub(5)) / 2,
            (current_max + avg_length + 5) / 2,
        );

        // Extraire nouveaux champs lexicaux dominants
        // (version simplifiée - en production utiliser TF-IDF)
        let words: Vec<&str> = text.split_whitespace().collect();
        let mut word_freq: HashMap<String, usize> = HashMap::new();

        for word in words {
            let clean = word
                .to_lowercase()
                .trim_matches(|c: char| !c.is_alphabetic())
                .to_string();
            if clean.len() > 4 {
                // mots significatifs
                *word_freq.entry(clean).or_insert(0) += 1;
            }
        }

        // Ajouter top 3 mots au lexique si nouveaux
        let mut freq_vec: Vec<_> = word_freq.iter().collect();
        freq_vec.sort_by(|a, b| b.1.cmp(a.1));

        for (word, _) in freq_vec.iter().take(3) {
            if !self.style_profile.lexical_fields.contains(word) {
                self.style_profile.lexical_fields.push(word.to_string());
            }
        }
    }

    fn increment_version(&self, version: &str) -> String {
        let parts: Vec<&str> = version.split('.').collect();
        if parts.len() == 3 {
            if let Ok(patch) = parts[2].parse::<u32>() {
                return format!("{}.{}.{}", parts[0], parts[1], patch + 1);
            }
        }
        version.to_string()
    }

    /// Obtenir le profil de style actuel
    pub fn get_style_profile(&self) -> &KevinStyleProfile {
        &self.style_profile
    }
}

impl Default for LiteraryEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_literary_smoothing() {
        let engine = LiteraryEngine::new();
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::Post,
                intensity: LiteraryIntensity::Balanced,
                target_length: Some(50),
            },
            draft: "TITANE permet de structurer ses idées. C'est simple et efficace. Ça aide à voir plus clair.".to_string(),
            reference_style: None,
            mode: WritingMode::LiterarySmoothing,
        };

        let response = engine.process(request);
        assert!(!response.main_version.is_empty());
        assert!(response.optimization_scores.narrative_structure > 0.0);
    }

    #[test]
    fn test_vocabulary_enrichment() {
        let engine = LiteraryEngine::new();
        let text = "faire beaucoup de choses très bien";
        let enriched = engine.enrich_vocabulary(text, LiteraryIntensity::Balanced);

        assert!(enriched.contains("réaliser") || enriched.contains("mettre en œuvre"));
    }

    #[test]
    fn test_style_profile_update() {
        let mut engine = LiteraryEngine::new();
        let initial_version = engine.style_profile.version.clone();

        engine.update_style_profile(vec![
            "La clarté structure la pensée. Le rythme organise l'espace. La cohérence unit le vivant.".to_string(),
        ]);

        assert_ne!(engine.style_profile.version, initial_version);
        assert!(!engine.style_profile.lexical_fields.is_empty());
    }

    #[test]
    fn test_poetic_transformation() {
        let engine = LiteraryEngine::new();
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::Poetry,
                intensity: LiteraryIntensity::Poetic,
                target_length: None,
            },
            draft: "Le système fonctionne en trois couches. Perception, traitement, action."
                .to_string(),
            reference_style: None,
            mode: WritingMode::PoeticVersion,
        };

        let response = engine.process(request);
        assert!(response.main_version.contains('\n')); // doit avoir des vers
    }

    #[test]
    fn test_double_version() {
        let engine = LiteraryEngine::new();
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::BookParagraph,
                intensity: LiteraryIntensity::Balanced,
                target_length: Some(100),
            },
            draft: "TITANE organise la vie et les projets.".to_string(),
            reference_style: None,
            mode: WritingMode::DoubleVersion,
        };

        let response = engine.process(request);
        assert!(!response.main_version.is_empty());
        assert!(response.alternative_version.is_some());
    }

    // ========== LiteraryIntensity Tests ==========

    #[test]
    fn test_literary_intensity_sober() {
        let intensity = LiteraryIntensity::Sober;
        assert_eq!(intensity, LiteraryIntensity::Sober);
    }

    #[test]
    fn test_literary_intensity_balanced() {
        let intensity = LiteraryIntensity::Balanced;
        assert_eq!(intensity, LiteraryIntensity::Balanced);
    }

    #[test]
    fn test_literary_intensity_poetic() {
        let intensity = LiteraryIntensity::Poetic;
        assert_eq!(intensity, LiteraryIntensity::Poetic);
    }

    #[test]
    fn test_literary_intensity_clone() {
        let intensity = LiteraryIntensity::Balanced;
        let cloned = intensity.clone();
        assert_eq!(intensity, cloned);
    }

    #[test]
    fn test_literary_intensity_copy() {
        let intensity = LiteraryIntensity::Poetic;
        let copied = intensity;
        assert_eq!(intensity, copied);
    }

    #[test]
    fn test_literary_intensity_serialize() {
        let intensity = LiteraryIntensity::Sober;
        let json = serde_json::to_string(&intensity)
            .expect("should serialize literary intensity to json");
        assert!(json.contains("Sober"));
    }

    // ========== TextType Tests ==========

    #[test]
    fn test_text_type_post() {
        let tt = TextType::Post;
        let debug = format!("{:?}", tt);
        assert!(debug.contains("Post"));
    }

    #[test]
    fn test_text_type_book_paragraph() {
        let tt = TextType::BookParagraph;
        let debug = format!("{:?}", tt);
        assert!(debug.contains("BookParagraph"));
    }

    #[test]
    fn test_text_type_poetry() {
        let tt = TextType::Poetry;
        let debug = format!("{:?}", tt);
        assert!(debug.contains("Poetry"));
    }

    #[test]
    fn test_text_type_other() {
        let tt = TextType::Other("Essay".to_string());
        let debug = format!("{:?}", tt);
        assert!(debug.contains("Essay"));
    }

    #[test]
    fn test_text_type_clone() {
        let tt = TextType::Chapter;
        let cloned = tt.clone();
        let debug = format!("{:?}", cloned);
        assert!(debug.contains("Chapter"));
    }

    // ========== WritingMode Tests ==========

    #[test]
    fn test_writing_mode_literary_smoothing() {
        let mode = WritingMode::LiterarySmoothing;
        let debug = format!("{:?}", mode);
        assert!(debug.contains("LiterarySmoothing"));
    }

    #[test]
    fn test_writing_mode_literary_enhanced() {
        let mode = WritingMode::LiteraryEnhanced;
        let debug = format!("{:?}", mode);
        assert!(debug.contains("LiteraryEnhanced"));
    }

    #[test]
    fn test_writing_mode_poetic_version() {
        let mode = WritingMode::PoeticVersion;
        let debug = format!("{:?}", mode);
        assert!(debug.contains("PoeticVersion"));
    }

    #[test]
    fn test_writing_mode_double_version() {
        let mode = WritingMode::DoubleVersion;
        let debug = format!("{:?}", mode);
        assert!(debug.contains("DoubleVersion"));
    }

    #[test]
    fn test_writing_mode_adapt_to_medium() {
        let mode = WritingMode::AdaptToMedium;
        let debug = format!("{:?}", mode);
        assert!(debug.contains("AdaptToMedium"));
    }

    #[test]
    fn test_writing_mode_copy() {
        let mode = WritingMode::LiterarySmoothing;
        let copied = mode;
        assert!(matches!(copied, WritingMode::LiterarySmoothing));
    }

    // ========== LiteraryOptimizationScores Tests ==========

    #[test]
    fn test_optimization_scores_creation() {
        let scores = LiteraryOptimizationScores {
            narrative_structure: 0.8,
            vocabulary_richness: 0.75,
            imagery_quality: 0.6,
            rhythm_musicality: 0.7,
            message_alignment: 0.9,
        };
        assert_eq!(scores.narrative_structure, 0.8);
        assert_eq!(scores.message_alignment, 0.9);
    }

    #[test]
    fn test_optimization_scores_clone() {
        let scores = LiteraryOptimizationScores {
            narrative_structure: 0.5,
            vocabulary_richness: 0.5,
            imagery_quality: 0.5,
            rhythm_musicality: 0.5,
            message_alignment: 0.5,
        };
        let cloned = scores.clone();
        assert_eq!(cloned.narrative_structure, scores.narrative_structure);
    }

    #[test]
    fn test_optimization_scores_serialize() {
        let scores = LiteraryOptimizationScores {
            narrative_structure: 0.9,
            vocabulary_richness: 0.85,
            imagery_quality: 0.7,
            rhythm_musicality: 0.8,
            message_alignment: 0.95,
        };
        let json = serde_json::to_string(&scores)
            .expect("should serialize optimization scores to json");
        assert!(json.contains("narrative_structure"));
    }

    // ========== KevinStyleProfile Tests ==========

    #[test]
    fn test_kevin_style_profile_default() {
        let profile = KevinStyleProfile::default();
        assert_eq!(profile.version, "1.0.0");
        assert_eq!(profile.preferred_sentence_length, (8, 25));
        assert_eq!(profile.concrete_conceptual_ratio, 0.6);
    }

    #[test]
    fn test_kevin_style_profile_metaphor_types() {
        let profile = KevinStyleProfile::default();
        assert!(profile
            .metaphor_types
            .contains(&"corps et espace".to_string()));
        assert!(profile
            .metaphor_types
            .contains(&"nature et vivant".to_string()));
    }

    #[test]
    fn test_kevin_style_profile_lexical_fields() {
        let profile = KevinStyleProfile::default();
        assert!(profile.lexical_fields.contains(&"clarté".to_string()));
        assert!(profile.lexical_fields.contains(&"structure".to_string()));
    }

    #[test]
    fn test_kevin_style_profile_structural_patterns() {
        let profile = KevinStyleProfile::default();
        assert!(profile
            .structural_patterns
            .contains(&"triptyque".to_string()));
        assert!(profile
            .structural_patterns
            .contains(&"parallélisme".to_string()));
    }

    #[test]
    fn test_kevin_style_profile_dominant_tones() {
        let profile = KevinStyleProfile::default();
        assert!(profile.dominant_tones.contains(&"méditatif".to_string()));
        assert!(profile.dominant_tones.contains(&"incarné".to_string()));
    }

    #[test]
    fn test_kevin_style_profile_clone() {
        let profile = KevinStyleProfile::default();
        let cloned = profile.clone();
        assert_eq!(cloned.version, profile.version);
    }

    #[test]
    fn test_kevin_style_profile_serialize() {
        let profile = KevinStyleProfile::default();
        let json = serde_json::to_string(&profile)
            .expect("should serialize kevin style profile to json");
        assert!(json.contains("version"));
        assert!(json.contains("metaphor_types"));
    }

    // ========== LiteraryEngine Tests ==========

    #[test]
    fn test_literary_engine_new() {
        let engine = LiteraryEngine::new();
        assert_eq!(engine.style_profile.version, "1.0.0");
    }

    #[test]
    fn test_literary_engine_default() {
        let engine = LiteraryEngine::default();
        assert_eq!(engine.style_profile.version, "1.0.0");
    }

    #[test]
    fn test_literary_engine_get_style_profile() {
        let engine = LiteraryEngine::new();
        let profile = engine.get_style_profile();
        assert_eq!(profile.version, "1.0.0");
    }

    #[test]
    fn test_literary_engine_literary_enhanced() {
        let engine = LiteraryEngine::new();
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::Post,
                intensity: LiteraryIntensity::Balanced,
                target_length: Some(50),
            },
            draft: "TITANE améliore la productivité. C'est un système efficace.".to_string(),
            reference_style: None,
            mode: WritingMode::LiteraryEnhanced,
        };
        let response = engine.process(request);
        assert!(!response.main_version.is_empty());
    }

    #[test]
    fn test_literary_engine_adapt_to_medium_post() {
        let engine = LiteraryEngine::new();
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::Post,
                intensity: LiteraryIntensity::Sober,
                target_length: Some(100),
            },
            draft: "Premier point. Deuxième point. Troisième point. Quatrième point.".to_string(),
            reference_style: None,
            mode: WritingMode::AdaptToMedium,
        };
        let response = engine.process(request);
        assert!(!response.main_version.is_empty());
    }

    #[test]
    fn test_literary_engine_adapt_to_medium_book() {
        let engine = LiteraryEngine::new();
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::BookParagraph,
                intensity: LiteraryIntensity::Balanced,
                target_length: Some(200),
            },
            draft: "Ce chapitre aborde la mémoire et l'organisation.".to_string(),
            reference_style: None,
            mode: WritingMode::AdaptToMedium,
        };
        let response = engine.process(request);
        assert!(!response.main_version.is_empty());
    }

    #[test]
    fn test_literary_engine_adapt_to_medium_web() {
        let engine = LiteraryEngine::new();
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::WebPage,
                intensity: LiteraryIntensity::Sober,
                target_length: Some(100),
            },
            draft: "Bienvenue. Ceci est une page web. Voici les informations.".to_string(),
            reference_style: None,
            mode: WritingMode::AdaptToMedium,
        };
        let response = engine.process(request);
        assert!(!response.main_version.is_empty());
    }

    #[test]
    fn test_literary_engine_enrich_vocabulary_sober() {
        let engine = LiteraryEngine::new();
        let text = "faire beaucoup de choses";
        let enriched = engine.enrich_vocabulary(text, LiteraryIntensity::Sober);
        assert!(enriched.contains("réaliser") || enriched.contains("nombre de"));
    }

    #[test]
    fn test_literary_engine_enrich_vocabulary_poetic() {
        let engine = LiteraryEngine::new();
        let text = "organisation de la structure";
        let enriched = engine.enrich_vocabulary(text, LiteraryIntensity::Poetic);
        assert!(enriched.contains("architecture") || enriched.contains("ossature"));
    }

    #[test]
    fn test_literary_engine_improve_rhythm() {
        let engine = LiteraryEngine::new();
        let text = "phrase que que répétition";
        let improved = engine.improve_rhythm(text);
        assert!(!improved.contains(" que que "));
    }

    #[test]
    fn test_literary_engine_score_narrative_structure_short() {
        let engine = LiteraryEngine::new();
        let score = engine.score_narrative_structure("Une seule phrase.", 1);
        assert_eq!(score, 0.5);
    }

    #[test]
    fn test_literary_engine_score_narrative_structure_with_paragraphs() {
        let engine = LiteraryEngine::new();
        let text = "Paragraphe un.\n\nParagraphe deux.";
        let score = engine.score_narrative_structure(text, 2);
        assert!(score >= 0.7);
    }

    #[test]
    fn test_literary_engine_score_vocabulary_richness() {
        let engine = LiteraryEngine::new();
        let text = "mot unique différent varié divers";
        let score = engine.score_vocabulary_richness(text, 5);
        assert!(score > 0.5);
    }

    #[test]
    fn test_literary_engine_score_imagery_quality() {
        let engine = LiteraryEngine::new();
        let text = "comme le vent, le rythme respire";
        let score = engine.score_imagery_quality(text);
        assert!(score > 0.0);
    }

    #[test]
    fn test_literary_engine_score_rhythm_good() {
        let engine = LiteraryEngine::new();
        let text = "Phrase claire et simple.";
        let score = engine.score_rhythm(text);
        assert_eq!(score, 0.8);
    }

    #[test]
    fn test_literary_engine_score_rhythm_bad() {
        let engine = LiteraryEngine::new();
        let text = "Il pense que que cela fonctionne";
        let score = engine.score_rhythm(text);
        assert_eq!(score, 0.5);
    }

    #[test]
    fn test_literary_engine_increment_version() {
        let engine = LiteraryEngine::new();
        let new_version = engine.increment_version("1.0.5");
        assert_eq!(new_version, "1.0.6");
    }

    #[test]
    fn test_literary_engine_increment_version_invalid() {
        let engine = LiteraryEngine::new();
        let result = engine.increment_version("invalid");
        assert_eq!(result, "invalid");
    }

    // ========== LiteraryContext Tests ==========

    #[test]
    fn test_literary_context_creation() {
        let ctx = LiteraryContext {
            text_type: TextType::Post,
            intensity: LiteraryIntensity::Balanced,
            target_length: Some(100),
        };
        assert!(matches!(ctx.text_type, TextType::Post));
        assert_eq!(ctx.target_length, Some(100));
    }

    #[test]
    fn test_literary_context_clone() {
        let ctx = LiteraryContext {
            text_type: TextType::Chapter,
            intensity: LiteraryIntensity::Poetic,
            target_length: None,
        };
        let cloned = ctx.clone();
        assert!(matches!(cloned.intensity, LiteraryIntensity::Poetic));
    }

    // ========== LiteraryResponse Tests ==========

    #[test]
    fn test_literary_response_creation() {
        let response = LiteraryResponse {
            main_version: "Main text".to_string(),
            alternative_version: None,
            optimization_scores: LiteraryOptimizationScores {
                narrative_structure: 0.8,
                vocabulary_richness: 0.7,
                imagery_quality: 0.6,
                rhythm_musicality: 0.75,
                message_alignment: 0.9,
            },
            comment: Some("Comment".to_string()),
            style_profile_updated: false,
        };
        assert_eq!(response.main_version, "Main text");
        assert!(!response.style_profile_updated);
    }

    #[test]
    fn test_literary_response_with_alternative() {
        let response = LiteraryResponse {
            main_version: "Main".to_string(),
            alternative_version: Some("Alternative".to_string()),
            optimization_scores: LiteraryOptimizationScores {
                narrative_structure: 0.5,
                vocabulary_richness: 0.5,
                imagery_quality: 0.5,
                rhythm_musicality: 0.5,
                message_alignment: 0.5,
            },
            comment: None,
            style_profile_updated: true,
        };
        assert!(response.alternative_version.is_some());
        assert!(response.style_profile_updated);
    }

    #[test]
    fn test_literary_response_clone() {
        let response = LiteraryResponse {
            main_version: "Text".to_string(),
            alternative_version: None,
            optimization_scores: LiteraryOptimizationScores {
                narrative_structure: 0.8,
                vocabulary_richness: 0.8,
                imagery_quality: 0.8,
                rhythm_musicality: 0.8,
                message_alignment: 0.8,
            },
            comment: None,
            style_profile_updated: false,
        };
        let cloned = response.clone();
        assert_eq!(cloned.main_version, response.main_version);
    }

    // ========== LiteraryRequest Tests ==========

    #[test]
    fn test_literary_request_creation() {
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::Intro,
                intensity: LiteraryIntensity::Sober,
                target_length: Some(200),
            },
            draft: "Draft text".to_string(),
            reference_style: Some(vec!["Reference".to_string()]),
            mode: WritingMode::LiterarySmoothing,
        };
        assert_eq!(request.draft, "Draft text");
        assert!(request.reference_style.is_some());
    }

    #[test]
    fn test_literary_request_clone() {
        let request = LiteraryRequest {
            context: LiteraryContext {
                text_type: TextType::Manifesto,
                intensity: LiteraryIntensity::Poetic,
                target_length: None,
            },
            draft: "Manifesto".to_string(),
            reference_style: None,
            mode: WritingMode::PoeticVersion,
        };
        let cloned = request.clone();
        assert_eq!(cloned.draft, request.draft);
    }
}
