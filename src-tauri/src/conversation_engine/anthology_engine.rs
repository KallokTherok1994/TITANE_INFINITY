// TITANE∞ ONE v∞ — Anthologie Interne (Internal Anthology)
// Super Prompt #8 Implementation
// Copyright © 2025 Kevin Thibault - Tous droits réservés

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Les 7 couches de l'Anthologie
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AnthologyLayer {
    LiteraryFragments,   // Couche 1: Fragments littéraires
    LexicalFields,       // Couche 2: Champs lexicaux dominants
    StylisticSignatures, // Couche 3: Signatures stylistiques
    MetaphorsImages,     // Couche 4: Métaphores & images
    FoundingThemes,      // Couche 5: Thèmes fondateurs
    ModelsMethodologies, // Couche 6: Modèles & méthodologies
    LiteraryDNA,         // Couche 7: ADN littéraire synthétique
}

/// Tag thématique/émotionnel/structurel
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthologyTag {
    pub name: String,
    pub category: TagCategory,
    pub frequency: usize, // nombre d'occurrences
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum TagCategory {
    Thematic,   // thématique
    Emotional,  // émotionnel
    Structural, // structurel
}

/// Extrait littéraire dans l'anthologie
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiteraryExcerpt {
    pub id: String,
    pub text: String,
    pub source: String, // livre, post, etc.
    pub layers: Vec<AnthologyLayer>,
    pub tags: Vec<String>,
    pub stylistic_score: f32, // 0-1: pertinence stylistique
    pub added_date: String,
}

/// Analyse stylistique d'un texte
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StylisticAnalysis {
    pub vocabulary: Vec<String>, // mots clés
    pub rhythm: RhythmProfile,
    pub construction: Vec<String>, // types de constructions
    pub images: Vec<String>,       // images/métaphores détectées
    pub tone: Vec<String>,         // tons détectés
}

/// Profil de rythme
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RhythmProfile {
    pub avg_sentence_length: f32,
    pub sentence_length_variance: f32,
    pub has_visual_breaks: bool,    // présence de respirations visuelles
    pub parallelism_detected: bool, // structures parallèles
}

/// ADN littéraire Kevin Thibault (évolutif)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiteraryDNA {
    pub version: String,
    pub last_updated: String,

    // Patterns compressés
    pub core_patterns: Vec<String>,
    pub implicit_rules: Vec<String>,
    pub tone_signatures: Vec<String>,
    pub structural_nuances: Vec<String>,

    // Statistiques
    pub total_texts_analyzed: usize,
    pub dominant_metaphors: Vec<String>,
    pub recurring_themes: Vec<String>,
}

impl Default for LiteraryDNA {
    fn default() -> Self {
        Self {
            version: "1.0.0".to_string(),
            last_updated: chrono::Utc::now().to_rfc3339(),
            core_patterns: vec![
                "définition par négation".to_string(),
                "triptyque structurant".to_string(),
                "parallélisme poétique".to_string(),
            ],
            implicit_rules: vec![
                "clarté avant complexité".to_string(),
                "concret-conceptuel fusionné".to_string(),
                "respiration visuelle".to_string(),
            ],
            tone_signatures: vec![
                "méditatif".to_string(),
                "structurant".to_string(),
                "incarné".to_string(),
            ],
            structural_nuances: vec![
                "phrases courtes + longues alternées".to_string(),
                "paragraphes respiratoires".to_string(),
            ],
            total_texts_analyzed: 0,
            dominant_metaphors: vec![
                "espace vivant".to_string(),
                "rythme corporel".to_string(),
                "architecture organique".to_string(),
            ],
            recurring_themes: vec![
                "clarté".to_string(),
                "cohérence".to_string(),
                "structure".to_string(),
                "rythme".to_string(),
            ],
        }
    }
}

/// Requête d'intégration de texte à l'anthologie
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthologyIntegrationRequest {
    pub text: String,
    pub source: String,
    pub author_provided_tags: Option<Vec<String>>,
}

/// Réponse d'intégration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthologyIntegrationResponse {
    pub stylistic_summary: String,      // 3-6 lignes
    pub selected_excerpts: Vec<String>, // 2-5 extraits
    pub tags: Vec<String>,              // 5-10 tags
    pub layer_assignments: Vec<AnthologyLayer>,
    pub dna_evolution_summary: String, // synthèse évolution
}

/// Moteur d'Anthologie Interne
pub struct AnthologyEngine {
    // Collections par couche
    literary_fragments: Vec<LiteraryExcerpt>,
    lexical_fields: HashMap<String, usize>, // mot → fréquence
    stylistic_signatures: Vec<String>,
    metaphors_images: Vec<String>,
    founding_themes: HashSet<String>,
    models_methodologies: Vec<String>,

    // ADN
    literary_dna: LiteraryDNA,

    // Tags globaux
    all_tags: HashMap<String, AnthologyTag>,
}

impl AnthologyEngine {
    pub fn new() -> Self {
        Self {
            literary_fragments: Vec::new(),
            lexical_fields: HashMap::new(),
            stylistic_signatures: Vec::new(),
            metaphors_images: Vec::new(),
            founding_themes: Self::initialize_founding_themes(),
            models_methodologies: Self::initialize_models(),
            literary_dna: LiteraryDNA::default(),
            all_tags: HashMap::new(),
        }
    }

    fn initialize_founding_themes() -> HashSet<String> {
        let mut themes = HashSet::new();
        themes.insert("clarté".to_string());
        themes.insert("transition".to_string());
        themes.insert("structure vivante".to_string());
        themes.insert("rythme de vie".to_string());
        themes.insert("cohérence intérieure".to_string());
        themes.insert("lenteur consciente".to_string());
        themes.insert("transformation".to_string());
        themes.insert("autonomie".to_string());
        themes
    }

    fn initialize_models() -> Vec<String> {
        vec![
            "Divergence → Connexion → Structuration".to_string(),
            "Architecture du Humain-Code™".to_string(),
            "Systèmes vivants".to_string(),
            "Couches conceptuelles".to_string(),
        ]
    }

    /// Intégrer un nouveau texte dans l'anthologie
    pub fn integrate_text(
        &mut self,
        request: AnthologyIntegrationRequest,
    ) -> AnthologyIntegrationResponse {
        // 1. Extraction brute
        let mut excerpts = self.extract_remarkable_excerpts(&request.text);
        if excerpts.is_empty() {
            let trimmed = request.text.trim();
            if !trimmed.is_empty() {
                excerpts.push(trimmed.to_string());
            }
        }

        // 2. Analyse stylistique
        let analysis = self.analyze_style(&request.text);

        // 3. Tagging
        let tags = self.generate_tags(&request.text, &analysis, request.author_provided_tags);

        // 4. Classement en couches
        let layers = self.classify_to_layers(&request.text, &analysis);

        // 5. Synthèse et mise à jour ADN
        let summary = self.create_stylistic_summary(&request.text, &analysis);
        let dna_evolution = self.update_literary_dna(&request.text, &analysis);

        // Sauvegarder les extraits
        for excerpt in excerpts.iter() {
            self.literary_fragments.push(LiteraryExcerpt {
                id: uuid::Uuid::new_v4().to_string(),
                text: excerpt.clone(),
                source: request.source.clone(),
                layers: layers.clone(),
                tags: tags.clone(),
                stylistic_score: self.calculate_stylistic_score(excerpt),
                added_date: chrono::Utc::now().to_rfc3339(),
            });
        }

        // Mettre à jour champs lexicaux
        self.update_lexical_fields(&request.text);

        // Mettre à jour tags globaux
        for tag in &tags {
            self.all_tags
                .entry(tag.clone())
                .and_modify(|t| t.frequency += 1)
                .or_insert(AnthologyTag {
                    name: tag.clone(),
                    category: TagCategory::Thematic,
                    frequency: 1,
                });
        }

        AnthologyIntegrationResponse {
            stylistic_summary: summary,
            selected_excerpts: excerpts.into_iter().take(5).collect(),
            tags,
            layer_assignments: layers,
            dna_evolution_summary: dna_evolution,
        }
    }

    /// Extraire les passages remarquables
    fn extract_remarkable_excerpts(&self, text: &str) -> Vec<String> {
        let sentences: Vec<&str> = text
            .split('.')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        let mut excerpts = Vec::new();

        for sentence in sentences {
            // Critères de sélection:
            // - longueur pertinente (8-30 mots)
            // - contient métaphore ou image
            // - densité stylistique élevée

            let word_count = sentence.split_whitespace().count();
            if (8..=30).contains(&word_count) && self.has_literary_value(sentence) {
                excerpts.push(sentence.to_string() + ".");
            }
        }

        excerpts
    }

    /// Vérifier valeur littéraire d'une phrase
    fn has_literary_value(&self, sentence: &str) -> bool {
        let literary_markers = [
            "comme",
            "tel",
            "semblable",
            "respire",
            "rythme",
            "espace",
            "vivant",
            "clarté",
            "cohérence",
            "structure",
            "où",
            "là où",
            "ce qui",
        ];

        literary_markers
            .iter()
            .any(|marker| sentence.contains(marker))
    }

    /// Analyser le style d'un texte
    fn analyze_style(&self, text: &str) -> StylisticAnalysis {
        let sentences: Vec<&str> = text
            .split('.')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        // Calcul rythme
        let sentence_lengths: Vec<usize> = sentences
            .iter()
            .map(|s| s.split_whitespace().count())
            .collect();

        let avg_length = if !sentence_lengths.is_empty() {
            sentence_lengths.iter().sum::<usize>() as f32 / sentence_lengths.len() as f32
        } else {
            0.0
        };

        let variance = if sentence_lengths.len() > 1 {
            let mean = avg_length;
            let sum_sq_diff: f32 = sentence_lengths
                .iter()
                .map(|&len| (len as f32 - mean).powi(2))
                .sum();
            (sum_sq_diff / sentence_lengths.len() as f32).sqrt()
        } else {
            0.0
        };

        let rhythm = RhythmProfile {
            avg_sentence_length: avg_length,
            sentence_length_variance: variance,
            has_visual_breaks: text.contains("\n\n"),
            parallelism_detected: self.detect_parallelism(text),
        };

        // Extraction vocabulaire clé
        let vocabulary = self.extract_key_vocabulary(text);

        // Détection constructions
        let construction = self.detect_constructions(text);

        // Détection images/métaphores
        let images = self.detect_imagery(text);

        // Détection ton
        let tone = self.detect_tone(text);

        StylisticAnalysis {
            vocabulary,
            rhythm,
            construction,
            images,
            tone,
        }
    }

    fn detect_parallelism(&self, text: &str) -> bool {
        // Détecter structures parallèles (heuristique simple)
        text.matches("où").count() >= 2 || text.matches(". ").count() >= 3 && text.len() < 200
    }

    fn extract_key_vocabulary(&self, text: &str) -> Vec<String> {
        let words: Vec<String> = text
            .split_whitespace()
            .map(|w| {
                w.to_lowercase()
                    .trim_matches(|c: char| !c.is_alphabetic())
                    .to_string()
            })
            .filter(|w| w.len() > 4) // mots significatifs
            .collect();

        // Garder mots uniques
        let unique: HashSet<String> = words.into_iter().collect();
        unique.into_iter().take(15).collect()
    }

    fn detect_constructions(&self, text: &str) -> Vec<String> {
        let mut constructions = Vec::new();

        if text.starts_with("TITANE n'est pas") || text.contains("n'est pas") {
            constructions.push("définition par négation".to_string());
        }

        if text.matches("où").count() >= 2 {
            constructions.push("parallélisme".to_string());
        }

        if text.contains("\n\n") {
            constructions.push("respiration visuelle".to_string());
        }

        constructions
    }

    fn detect_imagery(&self, text: &str) -> Vec<String> {
        let mut images = Vec::new();

        let imagery_patterns = [
            ("respire", "respiration corporelle"),
            ("rythme", "rythme temporel"),
            ("espace", "espace physique"),
            ("vivant", "organisme vivant"),
            ("lumière", "lumière/clarté"),
            ("architecture", "architecture structurelle"),
        ];

        for (keyword, image_type) in imagery_patterns.iter() {
            if text.contains(keyword) {
                images.push(image_type.to_string());
            }
        }

        images
    }

    fn detect_tone(&self, text: &str) -> Vec<String> {
        let mut tones = Vec::new();

        // Heuristiques de détection de ton
        if text.contains("clarté") || text.contains("structure") {
            tones.push("structurant".to_string());
        }

        if text.contains("où") && text.contains("peut") {
            tones.push("méditatif".to_string());
        }

        if text.contains("corps") || text.contains("vivant") {
            tones.push("incarné".to_string());
        }

        tones
    }

    /// Générer tags pour un texte
    fn generate_tags(
        &self,
        text: &str,
        analysis: &StylisticAnalysis,
        provided: Option<Vec<String>>,
    ) -> Vec<String> {
        let mut tags = HashSet::new();

        // Tags fournis
        if let Some(provided_tags) = provided {
            for tag in provided_tags {
                tags.insert(tag);
            }
        }

        // Tags automatiques depuis analyse
        for construction in &analysis.construction {
            tags.insert(construction.clone());
        }

        for image in &analysis.images {
            tags.insert(image.clone());
        }

        for tone in &analysis.tone {
            tags.insert(tone.clone());
        }

        // Tags depuis thèmes fondateurs
        for theme in &self.founding_themes {
            if text.contains(theme.as_str()) {
                tags.insert(theme.clone());
            }
        }

        tags.into_iter().take(10).collect()
    }

    /// Classifier un texte dans les couches
    fn classify_to_layers(&self, text: &str, analysis: &StylisticAnalysis) -> Vec<AnthologyLayer> {
        let mut layers = Vec::new();

        // Couche 1: Fragments littéraires (si valeur stylistique élevée)
        if self.has_literary_value(text) {
            layers.push(AnthologyLayer::LiteraryFragments);
        }

        // Couche 2: Champs lexicaux (si vocabulaire riche)
        if analysis.vocabulary.len() >= 10 {
            layers.push(AnthologyLayer::LexicalFields);
        }

        // Couche 3: Signatures stylistiques (si constructions détectées)
        if !analysis.construction.is_empty() {
            layers.push(AnthologyLayer::StylisticSignatures);
        }

        // Couche 4: Métaphores & images
        if !analysis.images.is_empty() {
            layers.push(AnthologyLayer::MetaphorsImages);
        }

        // Couche 5: Thèmes fondateurs
        for theme in &self.founding_themes {
            if text.contains(theme.as_str()) {
                layers.push(AnthologyLayer::FoundingThemes);
                break;
            }
        }

        // Couche 6: Modèles & méthodologies
        for model in &self.models_methodologies {
            if text.contains(model.as_str()) {
                layers.push(AnthologyLayer::ModelsMethodologies);
                break;
            }
        }

        // Couche 7: ADN littéraire (si tout converge)
        if layers.len() >= 3 {
            layers.push(AnthologyLayer::LiteraryDNA);
        }

        layers
    }

    /// Créer résumé stylistique
    fn create_stylistic_summary(&self, text: &str, analysis: &StylisticAnalysis) -> String {
        let sentence_count = text.split('.').filter(|s| !s.trim().is_empty()).count();
        let word_count = text.split_whitespace().count();

        let mut summary = format!(
            "Texte de {} mots en {} phrases. ",
            word_count, sentence_count
        );

        if !analysis.construction.is_empty() {
            summary.push_str(&format!(
                "Constructions: {}. ",
                analysis.construction.join(", ")
            ));
        }

        if !analysis.images.is_empty() {
            summary.push_str(&format!("Images: {}. ", analysis.images.join(", ")));
        }

        if !analysis.tone.is_empty() {
            summary.push_str(&format!("Ton: {}.", analysis.tone.join(", ")));
        }

        summary
    }

    /// Mettre à jour ADN littéraire
    fn update_literary_dna(&mut self, text: &str, analysis: &StylisticAnalysis) -> String {
        self.literary_dna.total_texts_analyzed += 1;

        // Ajouter nouveaux patterns s'ils sont récurrents
        for construction in &analysis.construction {
            if !self.literary_dna.core_patterns.contains(construction) {
                self.literary_dna.core_patterns.push(construction.clone());
            }
        }

        // Ajouter nouvelles métaphores
        for image in &analysis.images {
            if !self.literary_dna.dominant_metaphors.contains(image) {
                self.literary_dna.dominant_metaphors.push(image.clone());
            }
        }

        self.literary_dna.last_updated = chrono::Utc::now().to_rfc3339();
        self.literary_dna.version = self.increment_version(&self.literary_dna.version);

        format!(
            "ADN mis à jour vers {}. {} textes analysés. Nouveaux patterns intégrés.",
            self.literary_dna.version, self.literary_dna.total_texts_analyzed
        )
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

    /// Mettre à jour champs lexicaux
    fn update_lexical_fields(&mut self, text: &str) {
        let words: Vec<String> = text
            .split_whitespace()
            .map(|w| {
                w.to_lowercase()
                    .trim_matches(|c: char| !c.is_alphabetic())
                    .to_string()
            })
            .filter(|w| w.len() > 4)
            .collect();

        for word in words {
            *self.lexical_fields.entry(word).or_insert(0) += 1;
        }
    }

    fn calculate_stylistic_score(&self, text: &str) -> f32 {
        let mut score = 0.5; // base

        // Bonus pour valeur littéraire
        if self.has_literary_value(text) {
            score += 0.2;
        }

        // Bonus pour métaphores
        let imagery_count = ["respire", "rythme", "espace", "vivant"]
            .iter()
            .filter(|k| text.contains(*k))
            .count();
        score += imagery_count as f32 * 0.1;

        score.min(1.0)
    }

    /// Obtenir l'ADN littéraire actuel
    pub fn get_literary_dna(&self) -> &LiteraryDNA {
        &self.literary_dna
    }

    /// Rechercher des extraits par tag
    pub fn search_by_tag(&self, tag: &str) -> Vec<&LiteraryExcerpt> {
        self.literary_fragments
            .iter()
            .filter(|excerpt| excerpt.tags.contains(&tag.to_string()))
            .collect()
    }

    /// Rechercher des extraits par couche
    pub fn search_by_layer(&self, layer: AnthologyLayer) -> Vec<&LiteraryExcerpt> {
        self.literary_fragments
            .iter()
            .filter(|excerpt| excerpt.layers.contains(&layer))
            .collect()
    }

    /// Obtenir le top N des champs lexicaux
    pub fn get_top_lexical_fields(&self, n: usize) -> Vec<(String, usize)> {
        let mut fields: Vec<_> = self
            .lexical_fields
            .iter()
            .map(|(k, v)| (k.clone(), *v))
            .collect();
        fields.sort_by(|a, b| b.1.cmp(&a.1));
        fields.into_iter().take(n).collect()
    }

    /// Obtenir statistiques globales
    pub fn get_statistics(&self) -> AnthologyStatistics {
        AnthologyStatistics {
            total_excerpts: self.literary_fragments.len(),
            total_unique_tags: self.all_tags.len(),
            total_lexical_entries: self.lexical_fields.len(),
            texts_analyzed: self.literary_dna.total_texts_analyzed,
            dna_version: self.literary_dna.version.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthologyStatistics {
    pub total_excerpts: usize,
    pub total_unique_tags: usize,
    pub total_lexical_entries: usize,
    pub texts_analyzed: usize,
    pub dna_version: String,
}

impl Default for AnthologyEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_text_integration() {
        let mut engine = AnthologyEngine::new();
        let request = AnthologyIntegrationRequest {
            text: "TITANE n'est pas un outil. C'est un espace où la pensée peut respirer."
                .to_string(),
            source: "Test".to_string(),
            author_provided_tags: None,
        };

        let response = engine.integrate_text(request);

        assert!(!response.stylistic_summary.is_empty());
        assert!(!response.tags.is_empty());
        assert!(!response.layer_assignments.is_empty());
    }

    #[test]
    fn test_stylistic_analysis() {
        let engine = AnthologyEngine::new();
        let text = "La clarté structure la pensée. Le rythme organise l'espace. La cohérence unit le vivant.";
        let analysis = engine.analyze_style(text);

        assert!(analysis.rhythm.avg_sentence_length > 0.0);
        assert!(!analysis.vocabulary.is_empty());
    }

    #[test]
    fn test_excerpt_extraction() {
        let engine = AnthologyEngine::new();
        let text =
            "TITANE devient le lieu où les idées trouvent leur structure. Simple dans sa forme.";
        let excerpts = engine.extract_remarkable_excerpts(text);

        assert!(!excerpts.is_empty());
    }

    #[test]
    fn test_layer_classification() {
        let engine = AnthologyEngine::new();
        let text = "L'espace respire, le rythme s'installe, la cohérence émerge.";
        let analysis = engine.analyze_style(text);
        let layers = engine.classify_to_layers(text, &analysis);

        assert!(layers.contains(&AnthologyLayer::MetaphorsImages));
    }

    #[test]
    fn test_dna_evolution() {
        let mut engine = AnthologyEngine::new();
        let initial_version = engine.literary_dna.version.clone();

        let request = AnthologyIntegrationRequest {
            text: "Structure vivante qui respire selon son propre rythme.".to_string(),
            source: "Test".to_string(),
            author_provided_tags: None,
        };

        engine.integrate_text(request);

        assert_ne!(engine.literary_dna.version, initial_version);
        assert_eq!(engine.literary_dna.total_texts_analyzed, 1);
    }

    #[test]
    fn test_search_by_tag() {
        let mut engine = AnthologyEngine::new();

        engine.integrate_text(AnthologyIntegrationRequest {
            text: "La clarté révèle la structure.".to_string(),
            source: "Test".to_string(),
            author_provided_tags: Some(vec!["clarté".to_string()]),
        });

        let results = engine.search_by_tag("clarté");
        assert!(!results.is_empty());
    }
}
