//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — CREATIVITY ENGINE
//! Moteur de créativité et d'imagination
//! ═══════════════════════════════════════════════════════════════════════════

use super::HyperIntelligenceError;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Type de créativité
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CreativityType {
    Combinatorial,  // Combinaison d'idées existantes
    Exploratory,    // Exploration de nouveaux espaces
    Transformational, // Transformation radicale
}

/// Idée générée
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Idea {
    pub id: String,
    pub title: String,
    pub description: String,
    pub creativity_type: CreativityType,
    pub novelty: f64,
    pub value: f64,
    pub feasibility: f64,
    pub inspirations: Vec<String>,
    pub created_at: u64,
}

impl Idea {
    pub fn new(title: &str, description: &str) -> Self {
        Self {
            id: format!("idea-{}", uuid::Uuid::new_v4()),
            title: title.to_string(),
            description: description.to_string(),
            creativity_type: CreativityType::Combinatorial,
            novelty: 0.5,
            value: 0.5,
            feasibility: 0.5,
            inspirations: Vec::new(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
        }
    }

    pub fn creative_score(&self) -> f64 {
        self.novelty * 0.4 + self.value * 0.4 + self.feasibility * 0.2
    }
}

/// Imagination - Scénario imaginé
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Imagination {
    pub id: String,
    pub scenario: String,
    pub vividness: f64,
    pub coherence: f64,
    pub emotional_tone: EmotionalTone,
    pub elements: Vec<String>,
    pub possibilities: Vec<String>,
}

/// Ton émotionnel
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EmotionalTone {
    Joyful,
    Melancholic,
    Exciting,
    Peaceful,
    Tense,
    Mysterious,
    Neutral,
}

/// Configuration créativité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreativityConfig {
    pub novelty_threshold: f64,
    pub exploration_depth: u32,
    pub combination_limit: usize,
    pub allow_absurd: bool,
}

impl Default for CreativityConfig {
    fn default() -> Self {
        Self {
            novelty_threshold: 0.3,
            exploration_depth: 5,
            combination_limit: 10,
            allow_absurd: true,
        }
    }
}

/// Moteur de créativité
pub struct CreativityEngine {
    ideas: Vec<Idea>,
    imaginations: Vec<Imagination>,
    known_concepts: HashSet<String>,
    creativity_index: f64,
    config: CreativityConfig,
    active: bool,
}

impl CreativityEngine {
    pub fn new() -> Self {
        Self {
            ideas: Vec::new(),
            imaginations: Vec::new(),
            known_concepts: HashSet::new(),
            creativity_index: 0.5,
            config: CreativityConfig::default(),
            active: false,
        }
    }

    pub async fn initialize(&mut self) -> Result<(), HyperIntelligenceError> {
        log::info!("[CreativityEngine] Initializing imagination...");

        // Seed with some base concepts
        let base_concepts = [
            "light", "shadow", "time", "space", "energy", "matter",
            "consciousness", "infinity", "harmony", "chaos",
            "creation", "destruction", "transformation", "evolution",
        ];

        for concept in base_concepts {
            self.known_concepts.insert(concept.to_string());
        }

        self.active = true;
        log::info!("[CreativityEngine] ✅ Creative potential unlocked");
        Ok(())
    }

    pub fn creativity_index(&self) -> f64 {
        self.creativity_index
    }

    pub fn evaluate_novelty(&self, input: &str) -> f64 {
        let words: Vec<&str> = input.split_whitespace().collect();
        let total_words = words.len() as f64;

        if total_words == 0.0 {
            return 0.0;
        }

        let unknown_count = words
            .iter()
            .filter(|w| !self.known_concepts.contains(&w.to_lowercase()))
            .count() as f64;

        // More unknown words = higher novelty
        (unknown_count / total_words).min(1.0)
    }

    pub async fn generate_idea(&self, context: &str) -> Result<Idea, HyperIntelligenceError> {
        log::debug!("[CreativityEngine] Generating idea from: {}", context);

        // Extract key elements
        let elements: Vec<&str> = context
            .split_whitespace()
            .filter(|w| w.len() > 3)
            .take(5)
            .collect();

        // Generate creative combination
        let title = if elements.len() >= 2 {
            format!(
                "The {} of {}",
                elements.first().unwrap_or(&"essence"),
                elements.last().unwrap_or(&"possibility")
            )
        } else {
            format!("Novel concept from {}", context)
        };

        let description = format!(
            "An innovative concept derived from '{}', combining elements in unexpected ways.",
            context
        );

        let mut idea = Idea::new(&title, &description);
        idea.novelty = self.evaluate_novelty(context);
        idea.value = 0.7;
        idea.feasibility = 0.6;
        idea.inspirations = elements.iter().map(|s| s.to_string()).collect();

        Ok(idea)
    }

    pub async fn imagine(&self, seed: &str) -> Result<Imagination, HyperIntelligenceError> {
        log::debug!("[CreativityEngine] Imagining from seed: {}", seed);

        // Generate imaginative scenario
        let elements: Vec<String> = seed
            .split_whitespace()
            .take(3)
            .map(|s| s.to_string())
            .collect();

        let scenario = format!(
            "In a realm where {} transcends ordinary limits, {} merges with {} to create something unprecedented.",
            elements.first().unwrap_or(&"imagination".to_string()),
            elements.get(1).unwrap_or(&"possibility".to_string()),
            elements.last().unwrap_or(&"reality".to_string())
        );

        let possibilities = vec![
            format!("What if {} could evolve?", elements.first().unwrap_or(&"this".to_string())),
            format!("Consider {} from a new perspective", seed),
            "Explore the boundaries of the conceivable".to_string(),
        ];

        let imagination = Imagination {
            id: format!("imagination-{}", uuid::Uuid::new_v4()),
            scenario,
            vividness: 0.75,
            coherence: 0.8,
            emotional_tone: EmotionalTone::Mysterious,
            elements,
            possibilities,
        };

        Ok(imagination)
    }

    pub fn brainstorm(&self, topic: &str, count: usize) -> Vec<String> {
        let mut ideas = Vec::new();
        let prefixes = [
            "What if",
            "Consider",
            "Imagine",
            "Explore",
            "Combine",
            "Transform",
            "Invert",
            "Expand",
        ];

        for (i, prefix) in prefixes.iter().cycle().take(count).enumerate() {
            ideas.push(format!("{} {} in a new way? (#{}) ", prefix, topic, i + 1));
        }

        ideas
    }

    pub fn combine_concepts(&self, concepts: &[String]) -> Option<Idea> {
        if concepts.len() < 2 {
            return None;
        }

        let title = format!("{}-{} Synthesis", concepts[0], concepts[1]);
        let description = format!(
            "A novel synthesis emerging from the combination of: {}",
            concepts.join(", ")
        );

        let mut idea = Idea::new(&title, &description);
        idea.creativity_type = CreativityType::Combinatorial;
        idea.novelty = 0.7;
        idea.inspirations = concepts.to_vec();

        // Update creativity index
        Some(idea)
    }

    pub fn get_ideas(&self) -> &[Idea] {
        &self.ideas
    }

    pub fn get_imaginations(&self) -> &[Imagination] {
        &self.imaginations
    }
}

impl Default for CreativityEngine {
    fn default() -> Self {
        Self::new()
    }
}
