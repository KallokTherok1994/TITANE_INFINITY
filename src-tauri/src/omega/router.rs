// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — OMEGA PIPELINE - ROUTER
//   Super Prompt #15: Intent classification and routing
//   Routes requests to appropriate handlers with <2ms latency
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

use super::{
    OmegaError, OmegaResult, PipelineInput, PipelineStage,
    StageInput, StageOutput, StageProcessor, StageContext,
};

// ═══════════════════════════════════════════════════════════════
//   INTENT CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

/// Intent types for routing
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Intent {
    /// Simple query/question
    Query,
    /// Task to be executed
    Task,
    /// Help request
    Help,
    /// Emotional support
    Emotional,
    /// General conversation
    Conversation,
    /// Command/instruction
    Command,
    /// Creative request
    Creative,
    /// Debug/technical
    Debug,
    /// Explanation request
    Explanation,
    /// Meta query about the system
    Meta,
    /// Unknown intent
    Unknown,
}

impl Intent {
    /// Get all intent variants
    pub fn all() -> Vec<Intent> {
        vec![
            Intent::Query,
            Intent::Task,
            Intent::Help,
            Intent::Emotional,
            Intent::Conversation,
            Intent::Command,
            Intent::Creative,
            Intent::Debug,
            Intent::Explanation,
            Intent::Meta,
            Intent::Unknown,
        ]
    }

    /// Get handler priority for this intent
    pub fn priority(&self) -> u8 {
        match self {
            Intent::Command => 10,
            Intent::Task => 9,
            Intent::Debug => 8,
            Intent::Help => 7,
            Intent::Query => 6,
            Intent::Explanation => 5,
            Intent::Emotional => 4,
            Intent::Creative => 3,
            Intent::Meta => 2,
            Intent::Conversation => 1,
            Intent::Unknown => 0,
        }
    }

    /// Get recommended execution mode
    pub fn execution_mode(&self) -> ExecutionMode {
        match self {
            Intent::Query | Intent::Command => ExecutionMode::Fast,
            Intent::Task | Intent::Debug => ExecutionMode::Thorough,
            Intent::Creative => ExecutionMode::Explorative,
            Intent::Emotional => ExecutionMode::Empathetic,
            _ => ExecutionMode::Balanced,
        }
    }
}

/// Execution mode for pipeline
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ExecutionMode {
    /// Fast response, minimal processing
    Fast,
    /// Balanced processing
    Balanced,
    /// Thorough analysis
    Thorough,
    /// Explorative/creative
    Explorative,
    /// Empathetic/supportive
    Empathetic,
}

// ═══════════════════════════════════════════════════════════════
//   ROUTING RESULT
// ═══════════════════════════════════════════════════════════════

/// Routing decision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingResult {
    /// Detected primary intent
    pub intent: Intent,
    /// Intent confidence (0.0 - 1.0)
    pub confidence: f32,
    /// Secondary intents detected
    pub secondary_intents: Vec<(Intent, f32)>,
    /// Recommended execution mode
    pub execution_mode: ExecutionMode,
    /// Target handlers
    pub handlers: Vec<String>,
    /// Routing latency in microseconds
    pub latency_us: u64,
    /// Cache hit
    pub cache_hit: bool,
}

// ═══════════════════════════════════════════════════════════════
//   INTENT CLASSIFIER
// ═══════════════════════════════════════════════════════════════

/// Intent Classifier with pattern matching and caching
pub struct IntentClassifier {
    /// Pattern rules for classification
    patterns: HashMap<Intent, Vec<PatternRule>>,
    /// Cache for recent classifications
    cache: Arc<RwLock<HashMap<String, CachedClassification>>>,
    /// Cache TTL in seconds
    cache_ttl: u64,
    /// Maximum cache size
    max_cache_size: usize,
}

/// Pattern rule for intent matching
#[derive(Debug, Clone)]
pub struct PatternRule {
    /// Keywords to match
    pub keywords: Vec<String>,
    /// Negative keywords (decrease confidence)
    pub negative_keywords: Vec<String>,
    /// Base confidence when matched
    pub base_confidence: f32,
    /// Boost per keyword match
    pub keyword_boost: f32,
}

/// Cached classification
#[derive(Debug, Clone)]
struct CachedClassification {
    result: RoutingResult,
    timestamp: i64,
}

impl Default for IntentClassifier {
    fn default() -> Self {
        let mut classifier = Self {
            patterns: HashMap::new(),
            cache: Arc::new(RwLock::new(HashMap::new())),
            cache_ttl: 300,
            max_cache_size: 10000,
        };
        classifier.initialize_patterns();
        classifier
    }
}

impl IntentClassifier {
    /// Create new classifier
    pub fn new() -> Self {
        Self::default()
    }

    /// Initialize default patterns
    fn initialize_patterns(&mut self) {
        // Query patterns
        self.patterns.insert(Intent::Query, vec![
            PatternRule {
                keywords: vec![
                    "quoi".into(), "qu'est-ce".into(), "comment".into(), "pourquoi".into(),
                    "qui".into(), "où".into(), "quand".into(), "combien".into(),
                    "what".into(), "how".into(), "why".into(), "who".into(), "where".into(),
                    "?".into(),
                ],
                negative_keywords: vec!["fais".into(), "crée".into(), "génère".into()],
                base_confidence: 0.5,
                keyword_boost: 0.1,
            },
        ]);

        // Task patterns
        self.patterns.insert(Intent::Task, vec![
            PatternRule {
                keywords: vec![
                    "fais".into(), "crée".into(), "génère".into(), "écris".into(),
                    "modifie".into(), "change".into(), "ajoute".into(), "supprime".into(),
                    "create".into(), "generate".into(), "write".into(), "modify".into(),
                    "do".into(), "make".into(), "build".into(),
                ],
                negative_keywords: vec![],
                base_confidence: 0.6,
                keyword_boost: 0.12,
            },
        ]);

        // Help patterns
        self.patterns.insert(Intent::Help, vec![
            PatternRule {
                keywords: vec![
                    "aide".into(), "help".into(), "besoin".into(), "comment faire".into(),
                    "peux-tu m'aider".into(), "explique".into(), "guide".into(),
                ],
                negative_keywords: vec![],
                base_confidence: 0.55,
                keyword_boost: 0.15,
            },
        ]);

        // Emotional patterns
        self.patterns.insert(Intent::Emotional, vec![
            PatternRule {
                keywords: vec![
                    "triste".into(), "content".into(), "heureux".into(), "stressé".into(),
                    "anxieux".into(), "fatigué".into(), "frustré".into(), "merci".into(),
                    "sad".into(), "happy".into(), "stressed".into(), "tired".into(),
                    "love".into(), "hate".into(), "feel".into(), "feeling".into(),
                ],
                negative_keywords: vec!["code".into(), "fonction".into()],
                base_confidence: 0.5,
                keyword_boost: 0.1,
            },
        ]);

        // Command patterns
        self.patterns.insert(Intent::Command, vec![
            PatternRule {
                keywords: vec![
                    "exécute".into(), "lance".into(), "run".into(), "start".into(),
                    "stop".into(), "arrête".into(), "restart".into(), "deploy".into(),
                    "compile".into(), "build".into(), "test".into(),
                ],
                negative_keywords: vec![],
                base_confidence: 0.65,
                keyword_boost: 0.12,
            },
        ]);

        // Creative patterns
        self.patterns.insert(Intent::Creative, vec![
            PatternRule {
                keywords: vec![
                    "imagine".into(), "invente".into(), "histoire".into(), "poème".into(),
                    "chanson".into(), "créatif".into(), "original".into(), "idée".into(),
                    "story".into(), "poem".into(), "song".into(), "creative".into(),
                ],
                negative_keywords: vec!["code".into(), "bug".into()],
                base_confidence: 0.55,
                keyword_boost: 0.12,
            },
        ]);

        // Debug patterns
        self.patterns.insert(Intent::Debug, vec![
            PatternRule {
                keywords: vec![
                    "debug".into(), "erreur".into(), "error".into(), "bug".into(),
                    "problème".into(), "crash".into(), "fix".into(), "résoudre".into(),
                    "traceback".into(), "exception".into(), "stack".into(),
                ],
                negative_keywords: vec![],
                base_confidence: 0.6,
                keyword_boost: 0.1,
            },
        ]);

        // Explanation patterns
        self.patterns.insert(Intent::Explanation, vec![
            PatternRule {
                keywords: vec![
                    "explique".into(), "explain".into(), "décris".into(), "describe".into(),
                    "c'est quoi".into(), "définition".into(), "signifie".into(),
                    "meaning".into(), "definition".into(),
                ],
                negative_keywords: vec![],
                base_confidence: 0.55,
                keyword_boost: 0.1,
            },
        ]);

        // Meta patterns
        self.patterns.insert(Intent::Meta, vec![
            PatternRule {
                keywords: vec![
                    "tu es".into(), "qui es-tu".into(), "es-tu".into(), "peux-tu".into(),
                    "ton nom".into(), "ta version".into(), "tes capacités".into(),
                    "who are you".into(), "what are you".into(), "your name".into(),
                    "about yourself".into(), "capabilities".into(),
                ],
                negative_keywords: vec![],
                base_confidence: 0.6,
                keyword_boost: 0.15,
            },
        ]);

        // Conversation patterns (default/fallback)
        self.patterns.insert(Intent::Conversation, vec![
            PatternRule {
                keywords: vec![
                    "bonjour".into(), "salut".into(), "hello".into(), "hi".into(),
                    "ça va".into(), "hey".into(), "coucou".into(), "bonsoir".into(),
                ],
                negative_keywords: vec![],
                base_confidence: 0.4,
                keyword_boost: 0.1,
            },
        ]);
    }

    /// Classify input and return routing result
    pub async fn classify(&self, input: &PipelineInput) -> OmegaResult<RoutingResult> {
        let start = std::time::Instant::now();

        // Check cache first
        let cache_key = self.compute_cache_key(&input.text);
        if let Some(cached) = self.get_from_cache(&cache_key).await {
            return Ok(RoutingResult {
                cache_hit: true,
                latency_us: start.elapsed().as_micros() as u64,
                ..cached.result
            });
        }

        // Classify
        let text_lower = input.text.to_lowercase();
        let mut scores: Vec<(Intent, f32)> = Vec::new();

        for (intent, rules) in &self.patterns {
            let mut score: f32 = 0.0;

            for rule in rules {
                let mut rule_score = 0.0;
                let mut matches = 0;

                for keyword in &rule.keywords {
                    if text_lower.contains(keyword) {
                        matches += 1;
                        rule_score += rule.keyword_boost;
                    }
                }

                if matches > 0 {
                    rule_score += rule.base_confidence;
                }

                for neg_keyword in &rule.negative_keywords {
                    if text_lower.contains(neg_keyword) {
                        rule_score -= 0.15;
                    }
                }

                score = score.max(rule_score);
            }

            if score > 0.0 {
                scores.push((*intent, score.clamp(0.0, 1.0)));
            }
        }

        // Sort by score descending
        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        // Get primary intent
        let (intent, confidence) = scores.first()
            .cloned()
            .unwrap_or((Intent::Unknown, 0.3));

        // Get secondary intents
        let secondary_intents: Vec<(Intent, f32)> = scores.iter()
            .skip(1)
            .take(3)
            .cloned()
            .collect();

        let result = RoutingResult {
            intent,
            confidence,
            secondary_intents,
            execution_mode: intent.execution_mode(),
            handlers: self.get_handlers(&intent),
            latency_us: start.elapsed().as_micros() as u64,
            cache_hit: false,
        };

        // Cache result
        self.add_to_cache(cache_key, result.clone()).await;

        Ok(result)
    }

    /// Get handlers for intent
    fn get_handlers(&self, intent: &Intent) -> Vec<String> {
        match intent {
            Intent::Query => vec!["knowledge".into(), "search".into()],
            Intent::Task => vec!["executor".into(), "coder".into()],
            Intent::Help => vec!["assistant".into(), "guide".into()],
            Intent::Emotional => vec!["empathy".into(), "support".into()],
            Intent::Command => vec!["executor".into(), "system".into()],
            Intent::Creative => vec!["creative".into(), "writer".into()],
            Intent::Debug => vec!["debugger".into(), "analyzer".into()],
            Intent::Explanation => vec!["explainer".into(), "teacher".into()],
            Intent::Meta => vec!["identity".into(), "about".into()],
            Intent::Conversation => vec!["conversational".into()],
            Intent::Unknown => vec!["fallback".into()],
        }
    }

    /// Compute cache key from text
    fn compute_cache_key(&self, text: &str) -> String {
        // Simple hash-based key
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        text.to_lowercase().trim().hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }

    /// Get from cache
    async fn get_from_cache(&self, key: &str) -> Option<CachedClassification> {
        let cache = self.cache.read().await;
        if let Some(cached) = cache.get(key) {
            let now = chrono::Utc::now().timestamp();
            if now - cached.timestamp < self.cache_ttl as i64 {
                return Some(cached.clone());
            }
        }
        None
    }

    /// Add to cache
    async fn add_to_cache(&self, key: String, result: RoutingResult) {
        let mut cache = self.cache.write().await;

        // Evict old entries if too large
        if cache.len() >= self.max_cache_size {
            let keys_to_remove: Vec<_> = cache.keys().take(self.max_cache_size / 10).cloned().collect();
            for k in keys_to_remove {
                cache.remove(&k);
            }
        }

        cache.insert(key, CachedClassification {
            result,
            timestamp: chrono::Utc::now().timestamp(),
        });
    }

    /// Clear cache
    pub async fn clear_cache(&self) {
        let mut cache = self.cache.write().await;
        cache.clear();
    }

    /// Get cache stats
    pub async fn cache_stats(&self) -> CacheStats {
        let cache = self.cache.read().await;
        CacheStats {
            size: cache.len(),
            max_size: self.max_cache_size,
            ttl_secs: self.cache_ttl,
        }
    }
}

/// Cache statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheStats {
    pub size: usize,
    pub max_size: usize,
    pub ttl_secs: u64,
}

// ═══════════════════════════════════════════════════════════════
//   ROUTER PROCESSOR
// ═══════════════════════════════════════════════════════════════

/// Router stage processor
pub struct Router {
    classifier: IntentClassifier,
}

impl Default for Router {
    fn default() -> Self {
        Self {
            classifier: IntentClassifier::new(),
        }
    }
}

impl Router {
    pub fn new() -> Self {
        Self::default()
    }

    /// Route a pipeline input
    pub async fn route(&self, input: &PipelineInput) -> OmegaResult<RoutingResult> {
        self.classifier.classify(input).await
    }
}

#[async_trait::async_trait]
impl StageProcessor for Router {
    async fn process(&self, input: StageInput) -> OmegaResult<StageOutput> {
        let start = std::time::Instant::now();

        // Extract text from input
        let text = input.data.get("text")
            .and_then(|v| v.as_str())
            .unwrap_or("");

        let pipeline_input = PipelineInput::new(text);
        let result = self.route(&pipeline_input).await?;

        Ok(StageOutput {
            request_id: input.request_id,
            data: serde_json::to_value(&result).unwrap_or_default(),
            latency_ms: start.elapsed().as_millis() as u64,
            success: true,
            error: None,
        })
    }

    fn name(&self) -> &str {
        "Router"
    }

    fn stage(&self) -> PipelineStage {
        PipelineStage::Router
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_classifier_query() {
        let classifier = IntentClassifier::new();
        let input = PipelineInput::new("Qu'est-ce que Rust?");
        let result = classifier.classify(&input).await.unwrap();

        assert_eq!(result.intent, Intent::Query);
        assert!(result.confidence > 0.5);
    }

    #[tokio::test]
    async fn test_classifier_task() {
        let classifier = IntentClassifier::new();
        let input = PipelineInput::new("Crée une fonction pour calculer la somme");
        let result = classifier.classify(&input).await.unwrap();

        assert_eq!(result.intent, Intent::Task);
    }

    #[tokio::test]
    async fn test_classifier_help() {
        let classifier = IntentClassifier::new();
        let input = PipelineInput::new("Peux-tu m'aider avec ce problème?");
        let result = classifier.classify(&input).await.unwrap();

        assert_eq!(result.intent, Intent::Help);
    }

    #[tokio::test]
    async fn test_classifier_caching() {
        let classifier = IntentClassifier::new();
        let input = PipelineInput::new("Hello, comment ça va?");

        let result1 = classifier.classify(&input).await.unwrap();
        assert!(!result1.cache_hit);

        let result2 = classifier.classify(&input).await.unwrap();
        assert!(result2.cache_hit);
    }

    #[tokio::test]
    async fn test_router() {
        let router = Router::new();
        let input = PipelineInput::new("Debug this error");
        let result = router.route(&input).await.unwrap();

        assert_eq!(result.intent, Intent::Debug);
        assert!(result.handlers.contains(&"debugger".to_string()));
    }

    #[test]
    fn test_intent_priority() {
        assert!(Intent::Command.priority() > Intent::Conversation.priority());
        assert!(Intent::Task.priority() > Intent::Creative.priority());
    }

    #[test]
    fn test_execution_mode() {
        assert_eq!(Intent::Query.execution_mode(), ExecutionMode::Fast);
        assert_eq!(Intent::Creative.execution_mode(), ExecutionMode::Explorative);
        assert_eq!(Intent::Emotional.execution_mode(), ExecutionMode::Empathetic);
    }
}
