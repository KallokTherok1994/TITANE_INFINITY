//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — COGNITION ENGINE
//! Moteur de cognition et traitement mental
//! ═══════════════════════════════════════════════════════════════════════════

use super::HyperIntelligenceError;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};

/// État cognitif
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CognitiveState {
    Idle,
    Processing,
    Reflecting,
    Learning,
    Integrating,
}

/// Mémoire de travail
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkingMemory {
    pub items: VecDeque<MemoryItem>,
    pub capacity: usize,
    pub focus_index: usize,
}

impl Default for WorkingMemory {
    fn default() -> Self {
        Self {
            items: VecDeque::with_capacity(7),
            capacity: 7, // Miller's Law: 7±2
            focus_index: 0,
        }
    }
}

impl WorkingMemory {
    pub fn add(&mut self, item: MemoryItem) {
        if self.items.len() >= self.capacity {
            self.items.pop_front();
        }
        self.items.push_back(item);
    }

    pub fn focused_item(&self) -> Option<&MemoryItem> {
        self.items.get(self.focus_index)
    }

    pub fn clear(&mut self) {
        self.items.clear();
        self.focus_index = 0;
    }
}

/// Item en mémoire de travail
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryItem {
    pub id: String,
    pub content: String,
    pub salience: f64,
    pub decay_rate: f64,
    pub added_at: u64,
}

impl MemoryItem {
    pub fn new(content: &str, salience: f64) -> Self {
        Self {
            id: format!("mem-{}", uuid::Uuid::new_v4()),
            content: content.to_string(),
            salience,
            decay_rate: 0.1,
            added_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
        }
    }
}

/// Pattern cognitif reconnu
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitivePattern {
    pub id: String,
    pub name: String,
    pub pattern_type: PatternType,
    pub frequency: u32,
    pub confidence: f64,
    pub examples: Vec<String>,
}

/// Types de patterns
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PatternType {
    Sequence,
    Hierarchy,
    Association,
    Contrast,
    Similarity,
    CauseEffect,
}

/// Schéma mental
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schema {
    pub id: String,
    pub name: String,
    pub attributes: HashMap<String, serde_json::Value>,
    pub relationships: Vec<SchemaRelation>,
    pub activation_level: f64,
}

/// Relation entre schémas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaRelation {
    pub target_id: String,
    pub relation_type: String,
    pub strength: f64,
}

/// Configuration cognitive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitionConfig {
    pub attention_threshold: f64,
    pub pattern_recognition_sensitivity: f64,
    pub schema_activation_decay: f64,
    pub max_parallel_processes: usize,
}

impl Default for CognitionConfig {
    fn default() -> Self {
        Self {
            attention_threshold: 0.3,
            pattern_recognition_sensitivity: 0.5,
            schema_activation_decay: 0.05,
            max_parallel_processes: 4,
        }
    }
}

/// Moteur de cognition
pub struct CognitionEngine {
    state: CognitiveState,
    working_memory: WorkingMemory,
    schemas: HashMap<String, Schema>,
    patterns: Vec<CognitivePattern>,
    coherence_score: f64,
    attention_focus: Option<String>,
    config: CognitionConfig,
    active: bool,
}

impl CognitionEngine {
    pub fn new() -> Self {
        Self {
            state: CognitiveState::Idle,
            working_memory: WorkingMemory::default(),
            schemas: HashMap::new(),
            patterns: Vec::new(),
            coherence_score: 0.5,
            attention_focus: None,
            config: CognitionConfig::default(),
            active: false,
        }
    }

    pub async fn initialize(&mut self) -> Result<(), HyperIntelligenceError> {
        log::info!("[CognitionEngine] Initializing cognitive processes...");

        // Initialize base schemas
        self.create_base_schemas();

        self.state = CognitiveState::Idle;
        self.active = true;

        log::info!("[CognitionEngine] ✅ Cognitive matrix online");
        Ok(())
    }

    fn create_base_schemas(&mut self) {
        // Object schema
        let object_schema = Schema {
            id: "schema-object".to_string(),
            name: "Object".to_string(),
            attributes: HashMap::from([
                ("has_properties".to_string(), serde_json::json!(true)),
                ("can_exist".to_string(), serde_json::json!(true)),
            ]),
            relationships: Vec::new(),
            activation_level: 0.5,
        };
        self.schemas.insert(object_schema.id.clone(), object_schema);

        // Action schema
        let action_schema = Schema {
            id: "schema-action".to_string(),
            name: "Action".to_string(),
            attributes: HashMap::from([
                ("has_agent".to_string(), serde_json::json!(true)),
                ("has_effect".to_string(), serde_json::json!(true)),
            ]),
            relationships: Vec::new(),
            activation_level: 0.5,
        };
        self.schemas.insert(action_schema.id.clone(), action_schema);

        // Relation schema
        let relation_schema = Schema {
            id: "schema-relation".to_string(),
            name: "Relation".to_string(),
            attributes: HashMap::from([
                ("connects_entities".to_string(), serde_json::json!(true)),
                ("has_direction".to_string(), serde_json::json!(false)),
            ]),
            relationships: Vec::new(),
            activation_level: 0.5,
        };
        self.schemas
            .insert(relation_schema.id.clone(), relation_schema);
    }

    pub fn coherence_score(&self) -> f64 {
        self.coherence_score
    }

    pub fn evaluate_coherence(&self, input: &str) -> f64 {
        let words: Vec<&str> = input.split_whitespace().collect();

        if words.is_empty() {
            return 0.0;
        }

        // Check for logical connectors
        let connectors = ["and", "but", "because", "therefore", "however", "thus"];
        let connector_count = words
            .iter()
            .filter(|w| connectors.contains(&w.to_lowercase().as_str()))
            .count();

        // Check for structure
        let has_subject_verb = words.len() >= 2;

        // Calculate coherence
        let connector_score = (connector_count as f64 / words.len() as f64).min(0.3);
        let structure_score = if has_subject_verb { 0.4 } else { 0.2 };
        let length_score = (words.len() as f64 / 20.0).min(0.3);

        (connector_score + structure_score + length_score).min(1.0)
    }

    pub fn process(&mut self, input: &str) -> ProcessingResult {
        self.state = CognitiveState::Processing;

        // Add to working memory
        let item = MemoryItem::new(input, 0.8);
        self.working_memory.add(item);

        // Recognize patterns
        let recognized_patterns = self.recognize_patterns(input);

        // Activate relevant schemas
        let activated_schemas = self.activate_schemas(input);

        // Update coherence
        self.coherence_score = self.evaluate_coherence(input);

        self.state = CognitiveState::Idle;

        ProcessingResult {
            processed: true,
            patterns_found: recognized_patterns.len(),
            schemas_activated: activated_schemas.len(),
            coherence: self.coherence_score,
            working_memory_size: self.working_memory.items.len(),
        }
    }

    fn recognize_patterns(&mut self, input: &str) -> Vec<CognitivePattern> {
        let mut found = Vec::new();

        // Check for sequence patterns (numbered items, steps)
        if input.contains("1.") || input.contains("first") || input.contains("then") {
            let pattern = CognitivePattern {
                id: format!("pattern-{}", uuid::Uuid::new_v4()),
                name: "Sequence".to_string(),
                pattern_type: PatternType::Sequence,
                frequency: 1,
                confidence: 0.7,
                examples: vec![input.to_string()],
            };
            found.push(pattern);
        }

        // Check for cause-effect patterns
        if input.contains("because") || input.contains("therefore") || input.contains("causes") {
            let pattern = CognitivePattern {
                id: format!("pattern-{}", uuid::Uuid::new_v4()),
                name: "Cause-Effect".to_string(),
                pattern_type: PatternType::CauseEffect,
                frequency: 1,
                confidence: 0.8,
                examples: vec![input.to_string()],
            };
            found.push(pattern);
        }

        // Check for comparison/contrast
        if input.contains("but") || input.contains("however") || input.contains("unlike") {
            let pattern = CognitivePattern {
                id: format!("pattern-{}", uuid::Uuid::new_v4()),
                name: "Contrast".to_string(),
                pattern_type: PatternType::Contrast,
                frequency: 1,
                confidence: 0.75,
                examples: vec![input.to_string()],
            };
            found.push(pattern);
        }

        for pattern in &found {
            self.patterns.push(pattern.clone());
        }

        found
    }

    fn activate_schemas(&mut self, input: &str) -> Vec<String> {
        let mut activated = Vec::new();
        let input_lower = input.to_lowercase();

        // Check for action words
        let action_words = ["do", "make", "create", "perform", "execute", "run", "start"];
        if action_words.iter().any(|w| input_lower.contains(w)) {
            if let Some(schema) = self.schemas.get_mut("schema-action") {
                schema.activation_level = (schema.activation_level + 0.2).min(1.0);
                activated.push(schema.id.clone());
            }
        }

        // Check for object words
        let object_words = ["thing", "object", "item", "entity", "element"];
        if object_words.iter().any(|w| input_lower.contains(w)) {
            if let Some(schema) = self.schemas.get_mut("schema-object") {
                schema.activation_level = (schema.activation_level + 0.2).min(1.0);
                activated.push(schema.id.clone());
            }
        }

        // Decay other schemas
        for (id, schema) in self.schemas.iter_mut() {
            if !activated.contains(id) {
                schema.activation_level =
                    (schema.activation_level - self.config.schema_activation_decay).max(0.1);
            }
        }

        activated
    }

    pub fn focus_attention(&mut self, target: &str) {
        self.attention_focus = Some(target.to_string());
        self.state = CognitiveState::Processing;
    }

    pub fn reflect(&mut self) -> ReflectionResult {
        self.state = CognitiveState::Reflecting;

        let memory_summary: Vec<String> = self
            .working_memory
            .items
            .iter()
            .map(|i| i.content.clone())
            .collect();

        let pattern_summary: Vec<String> = self.patterns.iter().map(|p| p.name.clone()).collect();

        let active_schemas: Vec<String> = self
            .schemas
            .values()
            .filter(|s| s.activation_level > 0.5)
            .map(|s| s.name.clone())
            .collect();

        self.state = CognitiveState::Idle;

        ReflectionResult {
            working_memory: memory_summary,
            recognized_patterns: pattern_summary,
            active_schemas,
            coherence_score: self.coherence_score,
            current_focus: self.attention_focus.clone(),
        }
    }

    pub fn get_state(&self) -> CognitiveState {
        self.state
    }
}

impl Default for CognitionEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Résultat de traitement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingResult {
    pub processed: bool,
    pub patterns_found: usize,
    pub schemas_activated: usize,
    pub coherence: f64,
    pub working_memory_size: usize,
}

/// Résultat de réflexion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReflectionResult {
    pub working_memory: Vec<String>,
    pub recognized_patterns: Vec<String>,
    pub active_schemas: Vec<String>,
    pub coherence_score: f64,
    pub current_focus: Option<String>,
}
