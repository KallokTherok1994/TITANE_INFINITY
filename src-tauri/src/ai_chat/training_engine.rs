/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ OPUS #12 — AI TRAINING MODE v∞
 * Mode d'apprentissage interne pour l'IA TITANE
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ KEVIN-ONLY: Ce module est réservé au développeur principal
 *
 * Ce module permet à TITANE d'apprendre de ses interactions:
 * - Capture des patterns de conversation réussis
 * - Mémorisation des corrections utilisateur
 * - Auto-amélioration du style de réponse
 * - Feedback loop pour affiner les réponses
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::Utc;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Mode d'entraînement actif
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TrainingMode {
    /// Mode désactivé (production)
    Disabled,
    /// Mode passif: capture sans modification
    Passive,
    /// Mode actif: capture + suggestions
    Active,
    /// Mode intensif: capture + modifications auto
    Intensive,
}

impl Default for TrainingMode {
    fn default() -> Self {
        TrainingMode::Disabled
    }
}

/// Type de feedback utilisateur
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedbackType {
    /// Réponse approuvée
    Approved,
    /// Réponse modifiée par l'utilisateur
    Corrected,
    /// Réponse rejetée
    Rejected,
    /// Demande de clarification
    Clarification,
    /// Style préféré indiqué
    StylePreference,
}

/// Pattern appris
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearnedPattern {
    /// ID unique
    pub id: String,
    /// Timestamp de création
    pub created_at: u64,
    /// Timestamp de dernière utilisation
    pub last_used: u64,
    /// Catégorie du pattern
    pub category: PatternCategory,
    /// Pattern d'entrée (prompt utilisateur)
    pub input_pattern: String,
    /// Pattern de sortie (réponse idéale)
    pub output_pattern: String,
    /// Score de confiance (0-100)
    pub confidence: u8,
    /// Nombre d'utilisations
    pub usage_count: u32,
    /// Feedback associés
    pub feedback_ids: Vec<String>,
    /// Tags pour recherche
    pub tags: Vec<String>,
}

/// Catégorie de pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PatternCategory {
    /// Style de réponse
    Style,
    /// Ton émotionnel
    Tone,
    /// Niveau de détail
    DetailLevel,
    /// Domaine technique
    TechnicalDomain,
    /// Personnalisation utilisateur
    Personalization,
    /// Gestion d'erreurs
    ErrorHandling,
    /// Clarification
    Clarification,
    /// Humour/créativité
    Creativity,
}

/// Feedback enregistré
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingFeedback {
    /// ID unique
    pub id: String,
    /// Timestamp
    pub timestamp: u64,
    /// ID de la conversation
    pub conversation_id: String,
    /// Message original
    pub original_prompt: String,
    /// Réponse originale de l'IA
    pub original_response: String,
    /// Type de feedback
    pub feedback_type: FeedbackType,
    /// Correction (si applicable)
    pub correction: Option<String>,
    /// Note de l'utilisateur
    pub note: Option<String>,
    /// Traité?
    pub processed: bool,
}

/// Statistiques d'entraînement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingStats {
    /// Total de patterns appris
    pub total_patterns: u32,
    /// Patterns par catégorie
    pub patterns_by_category: HashMap<String, u32>,
    /// Total de feedbacks
    pub total_feedbacks: u32,
    /// Feedbacks par type
    pub feedbacks_by_type: HashMap<String, u32>,
    /// Score moyen de confiance
    pub avg_confidence: f32,
    /// Dernière session d'entraînement
    pub last_training_session: Option<u64>,
    /// Amélioration estimée (%)
    pub estimated_improvement: f32,
}

/// Session d'entraînement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingSession {
    /// ID de la session
    pub id: String,
    /// Timestamp de début
    pub started_at: u64,
    /// Timestamp de fin
    pub ended_at: Option<u64>,
    /// Patterns traités
    pub patterns_processed: u32,
    /// Feedbacks intégrés
    pub feedbacks_integrated: u32,
    /// Améliorations appliquées
    pub improvements: Vec<String>,
    /// Résumé
    pub summary: String,
}

/// État du Training Engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingState {
    /// Mode actuel
    pub mode: TrainingMode,
    /// Patterns appris
    pub patterns: Vec<LearnedPattern>,
    /// Feedbacks en attente
    pub pending_feedbacks: Vec<TrainingFeedback>,
    /// Historique des sessions
    pub sessions: Vec<TrainingSession>,
    /// Statistiques
    pub stats: TrainingStats,
    /// Activé?
    pub enabled: bool,
    /// Code Kevin requis pour activation
    pub kevin_verified: bool,
}

impl Default for TrainingState {
    fn default() -> Self {
        Self {
            mode: TrainingMode::Disabled,
            patterns: Vec::new(),
            pending_feedbacks: Vec::new(),
            sessions: Vec::new(),
            stats: TrainingStats {
                total_patterns: 0,
                patterns_by_category: HashMap::new(),
                total_feedbacks: 0,
                feedbacks_by_type: HashMap::new(),
                avg_confidence: 0.0,
                last_training_session: None,
                estimated_improvement: 0.0,
            },
            enabled: false,
            kevin_verified: false,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur d'entraînement IA
pub struct AITrainingEngine {
    state: TrainingState,
    kevin_code_hash: String,
}

impl AITrainingEngine {
    /// Créer un nouveau moteur
    pub fn new() -> Self {
        Self {
            state: TrainingState::default(),
            // Hash SHA-256 du code Kevin (placeholder - remplacer en production)
            kevin_code_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855".to_string(),
        }
    }

    /// Vérifier le code Kevin
    pub fn verify_kevin_code(&mut self, code: &str) -> bool {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(code.as_bytes());
        let hash = format!("{:x}", hasher.finalize());

        if hash == self.kevin_code_hash {
            self.state.kevin_verified = true;
            log::info!("[AITraining] 🔐 Kevin verified - Training mode unlocked");
            true
        } else {
            log::warn!("[AITraining] ⚠️ Invalid Kevin code attempt");
            false
        }
    }

    /// Activer le mode d'entraînement
    pub fn enable(&mut self, mode: TrainingMode) -> Result<(), String> {
        if !self.state.kevin_verified {
            return Err("Kevin verification required".to_string());
        }

        self.state.mode = mode.clone();
        self.state.enabled = true;
        log::info!("[AITraining] ✅ Training mode enabled: {:?}", mode);
        Ok(())
    }

    /// Désactiver le mode d'entraînement
    pub fn disable(&mut self) {
        self.state.mode = TrainingMode::Disabled;
        self.state.enabled = false;
        log::info!("[AITraining] ⏸️ Training mode disabled");
    }

    /// Enregistrer un feedback
    pub fn record_feedback(
        &mut self,
        conversation_id: &str,
        original_prompt: &str,
        original_response: &str,
        feedback_type: FeedbackType,
        correction: Option<String>,
        note: Option<String>,
    ) -> Result<String, String> {
        if !self.state.enabled {
            return Err("Training mode not enabled".to_string());
        }

        let feedback = TrainingFeedback {
            id: format!("fb_{}", Utc::now().timestamp_millis()),
            timestamp: Utc::now().timestamp_millis() as u64,
            conversation_id: conversation_id.to_string(),
            original_prompt: original_prompt.to_string(),
            original_response: original_response.to_string(),
            feedback_type: feedback_type.clone(),
            correction,
            note,
            processed: false,
        };

        let id = feedback.id.clone();
        self.state.pending_feedbacks.push(feedback);

        // Update stats
        self.state.stats.total_feedbacks += 1;
        let type_str = format!("{:?}", feedback_type);
        *self.state.stats.feedbacks_by_type.entry(type_str).or_insert(0) += 1;

        log::info!("[AITraining] 📝 Feedback recorded: {}", id);
        Ok(id)
    }

    /// Apprendre un pattern
    pub fn learn_pattern(
        &mut self,
        category: PatternCategory,
        input_pattern: &str,
        output_pattern: &str,
        tags: Vec<String>,
    ) -> Result<String, String> {
        if !self.state.enabled {
            return Err("Training mode not enabled".to_string());
        }

        let pattern = LearnedPattern {
            id: format!("pat_{}", Utc::now().timestamp_millis()),
            created_at: Utc::now().timestamp_millis() as u64,
            last_used: Utc::now().timestamp_millis() as u64,
            category: category.clone(),
            input_pattern: input_pattern.to_string(),
            output_pattern: output_pattern.to_string(),
            confidence: 50, // Initial confidence
            usage_count: 0,
            feedback_ids: Vec::new(),
            tags,
        };

        let id = pattern.id.clone();
        self.state.patterns.push(pattern);

        // Update stats
        self.state.stats.total_patterns += 1;
        let cat_str = format!("{:?}", category);
        *self.state.stats.patterns_by_category.entry(cat_str).or_insert(0) += 1;

        log::info!("[AITraining] 🧠 Pattern learned: {}", id);
        Ok(id)
    }

    /// Chercher des patterns correspondants
    pub fn find_matching_patterns(&self, input: &str, limit: usize) -> Vec<&LearnedPattern> {
        let mut matches: Vec<(&LearnedPattern, i32)> = self.state.patterns
            .iter()
            .filter_map(|p| {
                let score = self.calculate_pattern_match(input, &p.input_pattern);
                if score > 30 { // Minimum 30% match
                    Some((p, score))
                } else {
                    None
                }
            })
            .collect();

        // Sort by confidence * match score
        matches.sort_by(|a, b| {
            let score_a = (a.0.confidence as i32) * a.1;
            let score_b = (b.0.confidence as i32) * b.1;
            score_b.cmp(&score_a)
        });

        matches.into_iter().take(limit).map(|(p, _)| p).collect()
    }

    /// Calculer le score de correspondance
    fn calculate_pattern_match(&self, input: &str, pattern: &str) -> i32 {
        let input_lower = input.to_lowercase();
        let pattern_lower = pattern.to_lowercase();
        
        let input_words: Vec<&str> = input_lower.split_whitespace().collect();
        let pattern_words: Vec<&str> = pattern_lower.split_whitespace().collect();

        if pattern_words.is_empty() {
            return 0;
        }

        let matches: usize = input_words.iter()
            .filter(|w| pattern_words.contains(w))
            .count();

        ((matches as f32 / pattern_words.len() as f32) * 100.0) as i32
    }

    /// Marquer un pattern comme utilisé
    pub fn mark_pattern_used(&mut self, pattern_id: &str) {
        if let Some(pattern) = self.state.patterns.iter_mut().find(|p| p.id == pattern_id) {
            pattern.last_used = Utc::now().timestamp_millis() as u64;
            pattern.usage_count += 1;

            // Increase confidence with usage
            if pattern.confidence < 95 {
                pattern.confidence += 1;
            }
        }
    }

    /// Démarrer une session d'entraînement
    pub fn start_training_session(&mut self) -> Result<String, String> {
        if !self.state.kevin_verified {
            return Err("Kevin verification required".to_string());
        }

        let session = TrainingSession {
            id: format!("sess_{}", Utc::now().timestamp_millis()),
            started_at: Utc::now().timestamp_millis() as u64,
            ended_at: None,
            patterns_processed: 0,
            feedbacks_integrated: 0,
            improvements: Vec::new(),
            summary: String::new(),
        };

        let id = session.id.clone();
        self.state.sessions.push(session);

        log::info!("[AITraining] 🚀 Training session started: {}", id);
        Ok(id)
    }

    /// Traiter les feedbacks en attente
    pub fn process_pending_feedbacks(&mut self, session_id: &str) -> Result<u32, String> {
        // Collecter d'abord les patterns à créer
        let mut patterns_to_create: Vec<(PatternCategory, String, String, Vec<String>)> = Vec::new();
        let mut indices_to_mark: Vec<usize> = Vec::new();

        for (idx, feedback) in self.state.pending_feedbacks.iter().enumerate() {
            if feedback.processed {
                continue;
            }

            match &feedback.feedback_type {
                FeedbackType::Corrected => {
                    if let Some(correction) = &feedback.correction {
                        patterns_to_create.push((
                            PatternCategory::Style,
                            feedback.original_prompt.clone(),
                            correction.clone(),
                            vec!["from_correction".to_string()],
                        ));
                    }
                }
                FeedbackType::Approved => {
                    patterns_to_create.push((
                        PatternCategory::Style,
                        feedback.original_prompt.clone(),
                        feedback.original_response.clone(),
                        vec!["approved".to_string()],
                    ));
                }
                _ => {}
            }

            indices_to_mark.push(idx);
        }

        // Créer les patterns
        for (category, input, output, tags) in patterns_to_create {
            let _ = self.learn_pattern(category, &input, &output, tags);
        }

        // Marquer comme traités
        for idx in &indices_to_mark {
            if let Some(feedback) = self.state.pending_feedbacks.get_mut(*idx) {
                feedback.processed = true;
            }
        }

        let processed = indices_to_mark.len() as u32;

        // Update session
        if let Some(session) = self.state.sessions.iter_mut().find(|s| s.id == session_id) {
            session.feedbacks_integrated += processed;
        }

        log::info!("[AITraining] ✅ Processed {} feedbacks", processed);
        Ok(processed)
    }

    /// Terminer une session d'entraînement
    pub fn end_training_session(&mut self, session_id: &str) -> Result<TrainingSession, String> {
        if let Some(session) = self.state.sessions.iter_mut().find(|s| s.id == session_id) {
            session.ended_at = Some(Utc::now().timestamp_millis() as u64);
            session.summary = format!(
                "Session completed: {} patterns processed, {} feedbacks integrated",
                session.patterns_processed,
                session.feedbacks_integrated
            );

            self.state.stats.last_training_session = session.ended_at;

            log::info!("[AITraining] ✅ Training session ended: {}", session_id);
            Ok(session.clone())
        } else {
            Err("Session not found".to_string())
        }
    }

    /// Obtenir l'état actuel
    pub fn get_state(&self) -> &TrainingState {
        &self.state
    }

    /// Obtenir les statistiques
    pub fn get_stats(&self) -> &TrainingStats {
        &self.state.stats
    }

    /// Exporter les patterns
    pub fn export_patterns(&self) -> Vec<LearnedPattern> {
        self.state.patterns.clone()
    }

    /// Importer des patterns
    pub fn import_patterns(&mut self, patterns: Vec<LearnedPattern>) -> Result<u32, String> {
        if !self.state.kevin_verified {
            return Err("Kevin verification required".to_string());
        }

        let count = patterns.len() as u32;
        self.state.patterns.extend(patterns);
        self.state.stats.total_patterns += count;

        log::info!("[AITraining] 📥 Imported {} patterns", count);
        Ok(count)
    }

    /// Nettoyer les patterns obsolètes
    pub fn prune_old_patterns(&mut self, max_age_days: u64) -> u32 {
        let now = Utc::now().timestamp_millis() as u64;
        let max_age_ms = max_age_days * 24 * 60 * 60 * 1000;

        let before = self.state.patterns.len();
        self.state.patterns.retain(|p| {
            let age = now - p.last_used;
            age < max_age_ms || p.confidence > 80
        });

        let pruned = (before - self.state.patterns.len()) as u32;
        self.state.stats.total_patterns = self.state.patterns.len() as u32;

        log::info!("[AITraining] 🧹 Pruned {} old patterns", pruned);
        pruned
    }

    /// Générer un rapport d'entraînement
    pub fn generate_report(&self) -> String {
        let mut report = String::new();

        report.push_str("╔══════════════════════════════════════════════════════════════════╗\n");
        report.push_str("║           🧠 AI TRAINING MODE — RAPPORT                          ║\n");
        report.push_str("╠══════════════════════════════════════════════════════════════════╣\n");

        report.push_str(&format!("║  Mode: {:?}\n", self.state.mode));
        report.push_str(&format!("║  Enabled: {}\n", self.state.enabled));
        report.push_str(&format!("║  Kevin Verified: {}\n", self.state.kevin_verified));
        report.push_str("║\n");
        report.push_str(&format!("║  Total Patterns: {}\n", self.state.stats.total_patterns));
        report.push_str(&format!("║  Total Feedbacks: {}\n", self.state.stats.total_feedbacks));
        report.push_str(&format!("║  Avg Confidence: {:.1}%\n", self.state.stats.avg_confidence));
        report.push_str(&format!("║  Sessions: {}\n", self.state.sessions.len()));
        report.push_str("║\n");

        report.push_str("║  Patterns by Category:\n");
        for (cat, count) in &self.state.stats.patterns_by_category {
            report.push_str(&format!("║    - {}: {}\n", cat, count));
        }

        report.push_str("╚══════════════════════════════════════════════════════════════════╝\n");

        report
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
use std::sync::RwLock;

/// Instance globale du AITrainingEngine
pub static AI_TRAINING_ENGINE: Lazy<RwLock<AITrainingEngine>> = Lazy::new(|| {
    RwLock::new(AITrainingEngine::new())
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_training_engine_init() {
        let engine = AITrainingEngine::new();
        assert!(!engine.state.enabled);
        assert_eq!(engine.state.mode, TrainingMode::Disabled);
    }

    #[test]
    fn test_enable_requires_kevin() {
        let mut engine = AITrainingEngine::new();
        let result = engine.enable(TrainingMode::Active);
        assert!(result.is_err());
    }

    #[test]
    fn test_learn_pattern() {
        let mut engine = AITrainingEngine::new();
        engine.state.kevin_verified = true;
        engine.state.enabled = true;

        let result = engine.learn_pattern(
            PatternCategory::Style,
            "How do I...",
            "Here's how you can...",
            vec!["tutorial".to_string()],
        );

        assert!(result.is_ok());
        assert_eq!(engine.state.patterns.len(), 1);
    }

    #[test]
    fn test_find_matching_patterns() {
        let mut engine = AITrainingEngine::new();
        engine.state.kevin_verified = true;
        engine.state.enabled = true;

        let _ = engine.learn_pattern(
            PatternCategory::Style,
            "create a function",
            "Here's a function...",
            vec![],
        );

        let matches = engine.find_matching_patterns("create function", 5);
        assert!(!matches.is_empty());
    }
}
