//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — NARRATIVE ENGINE
//! Super Prompt #9 — Gestion du fil narratif et continuité conversationnelle
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use tokio::sync::RwLock;
use super::intent::UserIntent;
use super::MemoryContext;

/// Élément du fil narratif
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NarrativeElement {
    pub content_summary: String,
    pub intent_type: String,
    pub timestamp: u64,
    pub importance: f32,
    pub topics: Vec<String>,
    pub entities: Vec<String>,
}

/// Thread narratif (fil de conversation)
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct NarrativeThread {
    pub id: String,
    pub title: Option<String>,
    pub elements: VecDeque<NarrativeElement>,
    pub main_topic: Option<String>,
    pub active: bool,
    pub created_at: u64,
    pub last_updated: u64,
}

impl NarrativeThread {
    pub fn new(id: &str) -> Self {
        let now = Self::now();
        Self {
            id: id.to_string(),
            title: None,
            elements: VecDeque::with_capacity(50),
            main_topic: None,
            active: true,
            created_at: now,
            last_updated: now,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }

    pub fn add_element(&mut self, element: NarrativeElement) {
        self.elements.push_back(element);
        self.last_updated = Self::now();

        // Garder seulement les 50 derniers éléments
        while self.elements.len() > 50 {
            self.elements.pop_front();
        }
    }
}

/// État narratif global
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct NarrativeState {
    /// Thread actif
    pub current_thread: Option<NarrativeThread>,
    /// Historique des threads
    pub thread_history: Vec<String>,
    /// Résumé de la conversation
    pub conversation_summary: String,
    /// Points clés à rappeler
    pub key_points: Vec<String>,
    /// Contexte narratif actuel
    pub current_context: String,
    /// Profondeur de la conversation
    pub depth: u32,
    /// Cohérence narrative (0.0-1.0)
    pub coherence_score: f32,
}

/// Position dans le discours
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiscoursePosition {
    Opening,
    Development,
    Clarification,
    Synthesis,
    Closing,
}

/// Structure de réponse suggérée
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResponseStructure {
    pub position: DiscoursePosition,
    pub should_reference_past: bool,
    pub suggested_opening: Option<String>,
    pub key_elements_to_include: Vec<String>,
    pub suggested_closing: Option<String>,
}

/// Moteur narratif
pub struct NarrativeEngine {
    state: RwLock<NarrativeState>,
    max_threads: usize,
    element_importance_threshold: f32,
}

impl NarrativeEngine {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(NarrativeState::default()),
            max_threads: 10,
            element_importance_threshold: 0.3,
        }
    }

    /// Met à jour l'état narratif avec une nouvelle entrée
    pub async fn update(
        &self,
        input: &str,
        intent: &UserIntent,
        memory_ctx: &MemoryContext,
    ) -> NarrativeState {
        let mut state = self.state.write().await;

        // Créer un nouveau thread si nécessaire
        if state.current_thread.is_none() {
            let thread_id = format!("thread_{}", Self::now());
            state.current_thread = Some(NarrativeThread::new(&thread_id));
        }

        // Extraire les éléments narratifs
        let element = self.create_element(input, intent);

        // Ajouter au thread courant
        if let Some(ref mut thread) = state.current_thread {
            thread.add_element(element.clone());

            // Mettre à jour le topic principal si significatif
            if element.importance > 0.5 && !element.topics.is_empty() {
                thread.main_topic = element.topics.first().cloned();
            }
        }

        // Mettre à jour les points clés
        if element.importance > self.element_importance_threshold {
            state.key_points.push(element.content_summary.clone());
            // Garder seulement les 10 derniers points clés
            while state.key_points.len() > 10 {
                state.key_points.remove(0);
            }
        }

        // Mettre à jour le résumé
        state.conversation_summary = self.generate_summary(&state, memory_ctx);

        // Mettre à jour la profondeur
        state.depth += 1;

        // Calculer la cohérence
        state.coherence_score = self.calculate_coherence(&state);

        // Mettre à jour le contexte
        state.current_context = self.generate_context(&state, intent);

        state.clone()
    }

    /// Crée un élément narratif à partir de l'entrée
    fn create_element(&self, input: &str, intent: &UserIntent) -> NarrativeElement {
        let summary = if input.len() > 100 {
            format!("{}...", &input[..100])
        } else {
            input.to_string()
        };

        let importance = self.calculate_importance(input, intent);

        NarrativeElement {
            content_summary: summary,
            intent_type: format!("{:?}", intent.intent_type),
            timestamp: Self::now(),
            importance,
            topics: intent.keywords.clone(),
            entities: self.extract_entities(input),
        }
    }

    /// Calcule l'importance d'un élément
    fn calculate_importance(&self, input: &str, intent: &UserIntent) -> f32 {
        let mut score = 0.3; // Base

        // Longueur
        if input.len() > 200 {
            score += 0.2;
        }

        // Confiance de l'intention
        score += intent.confidence.primary * 0.3;

        // Mots-clés
        if !intent.keywords.is_empty() {
            score += 0.1;
        }

        // Complexité
        match intent.complexity {
            super::intent::ComplexityLevel::Expert => score += 0.2,
            super::intent::ComplexityLevel::Complex => score += 0.15,
            super::intent::ComplexityLevel::Moderate => score += 0.1,
            _ => {}
        }

        score.min(1.0)
    }

    /// Extrait les entités nommées (simplifiée)
    fn extract_entities(&self, input: &str) -> Vec<String> {
        // Version simplifiée: extraire les mots capitalisés
        input.split_whitespace()
            .filter(|w| w.chars().next().map(|c| c.is_uppercase()).unwrap_or(false))
            .filter(|w| w.len() > 2)
            .take(5)
            .map(|w| w.to_string())
            .collect()
    }

    /// Génère un résumé de la conversation
    fn generate_summary(&self, state: &NarrativeState, memory_ctx: &MemoryContext) -> String {
        let mut summary_parts = Vec::new();

        // Ajouter le topic principal
        if let Some(ref thread) = state.current_thread {
            if let Some(ref topic) = thread.main_topic {
                summary_parts.push(format!("Discussion sur: {}", topic));
            }
        }

        // Ajouter les points clés récents
        if !state.key_points.is_empty() {
            let recent_points: Vec<_> = state.key_points.iter()
                .rev()
                .take(3)
                .collect();
            summary_parts.push(format!("Points abordés: {}", recent_points.len()));
        }

        // Ajouter le contexte mémoire si disponible
        if !memory_ctx.conversation_history_summary.is_empty() {
            summary_parts.push(memory_ctx.conversation_history_summary.clone());
        }

        summary_parts.join(". ")
    }

    /// Calcule le score de cohérence narrative
    fn calculate_coherence(&self, state: &NarrativeState) -> f32 {
        let mut score = 1.0;

        if let Some(ref thread) = state.current_thread {
            // Vérifier la continuité des topics
            let elements: Vec<_> = thread.elements.iter().collect();
            if elements.len() >= 2 {
                let mut topic_changes = 0;
                for window in elements.windows(2) {
                    let prev_topics: std::collections::HashSet<_> =
                        window[0].topics.iter().collect();
                    let curr_topics: std::collections::HashSet<_> =
                        window[1].topics.iter().collect();

                    if prev_topics.is_disjoint(&curr_topics) && !curr_topics.is_empty() {
                        topic_changes += 1;
                    }
                }

                // Pénaliser les changements de topic fréquents
                let change_rate = topic_changes as f32 / elements.len() as f32;
                score -= change_rate * 0.3;
            }
        }

        score.max(0.0)
    }

    /// Génère le contexte narratif actuel
    fn generate_context(&self, state: &NarrativeState, intent: &UserIntent) -> String {
        let mut context_parts = Vec::new();

        context_parts.push(format!("Profondeur: {}", state.depth));

        if let Some(ref thread) = state.current_thread {
            if let Some(ref topic) = thread.main_topic {
                context_parts.push(format!("Topic: {}", topic));
            }
        }

        context_parts.push(format!("Intention: {:?}", intent.intent_type));
        context_parts.push(format!("Cohérence: {:.0}%", state.coherence_score * 100.0));

        context_parts.join(" | ")
    }

    /// Suggère la structure de réponse
    pub async fn suggest_structure(&self, intent: &UserIntent) -> ResponseStructure {
        let state = self.state.read().await;

        let position = if state.depth <= 1 {
            DiscoursePosition::Opening
        } else if state.depth > 10 {
            DiscoursePosition::Synthesis
        } else {
            DiscoursePosition::Development
        };

        let should_reference_past = state.depth > 2 && !state.key_points.is_empty();

        let key_elements = state.key_points.iter()
            .rev()
            .take(3)
            .cloned()
            .collect();

        ResponseStructure {
            position,
            should_reference_past,
            suggested_opening: self.suggest_opening(&position, &state),
            key_elements_to_include: key_elements,
            suggested_closing: self.suggest_closing(&position, intent),
        }
    }

    fn suggest_opening(&self, position: &DiscoursePosition, state: &NarrativeState) -> Option<String> {
        match position {
            DiscoursePosition::Opening => Some("Introduction du sujet".to_string()),
            DiscoursePosition::Development => {
                if !state.key_points.is_empty() {
                    Some("Suite de la discussion".to_string())
                } else {
                    None
                }
            }
            DiscoursePosition::Synthesis => Some("Pour résumer".to_string()),
            _ => None,
        }
    }

    fn suggest_closing(&self, position: &DiscoursePosition, intent: &UserIntent) -> Option<String> {
        match position {
            DiscoursePosition::Opening => Some("Que souhaitez-vous explorer?".to_string()),
            DiscoursePosition::Development => None,
            DiscoursePosition::Synthesis => Some("Conclusion".to_string()),
            DiscoursePosition::Closing => Some("Fin de discussion".to_string()),
            _ => None,
        }
    }

    /// Réinitialise le moteur narratif
    pub async fn reset(&self) {
        let mut state = self.state.write().await;
        *state = NarrativeState::default();
    }

    /// Récupère l'état actuel
    pub async fn get_state(&self) -> NarrativeState {
        self.state.read().await.clone()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for NarrativeEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::conversation_os::intent::{IntentType, IntentConfidence, UrgencyLevel, ComplexityLevel};

    #[tokio::test]
    async fn test_narrative_engine_creation() {
        let engine = NarrativeEngine::new();
        let state = engine.get_state().await;
        assert!(state.current_thread.is_none());
    }

    #[tokio::test]
    async fn test_narrative_update() {
        let engine = NarrativeEngine::new();
        let intent = UserIntent {
            intent_type: IntentType::Question,
            confidence: IntentConfidence { primary: 0.8, secondary: None },
            keywords: vec!["test".to_string()],
            urgency: UrgencyLevel::Normal,
            complexity: ComplexityLevel::Simple,
            requires_memory: false,
            requires_reflection: false,
            timestamp: 0,
        };
        let memory = MemoryContext::default();

        let state = engine.update("Test input", &intent, &memory).await;
        assert!(state.current_thread.is_some());
        assert_eq!(state.depth, 1);
    }
}
