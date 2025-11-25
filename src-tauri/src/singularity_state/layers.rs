/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SINGULARITY STATE LAYERS
 * Définitions des 5 layers d'état unifié
 * ═══════════════════════════════════════════════════════════════════
 */
use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════════
// LAYER 1: PHYSICAL (Hardware, Santé Système)
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicalLayer {
    /// État Helios (monitoring hardware)
    pub helios: HeliosState,

    /// Santé système
    pub system_health: SystemHealth,

    /// Métriques performance
    pub metrics: PerformanceMetrics,
}

impl Default for PhysicalLayer {
    fn default() -> Self {
        Self {
            helios: HeliosState::default(),
            system_health: SystemHealth::default(),
            metrics: PerformanceMetrics::default(),
        }
    }
}

impl PhysicalLayer {
    pub fn health_score(&self) -> f32 {
        (self.system_health.global_health + self.metrics.performance_score) / 2.0
    }

    pub fn is_critical(&self) -> bool {
        self.system_health.global_health < 0.3 || self.metrics.cpu_usage > 0.95
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeliosState {
    pub active: bool,
    pub cpu_usage: f32,             // 0-1
    pub memory_usage: f32,          // 0-1
    pub disk_usage: f32,            // 0-1
    pub temperature: f32,           // Celsius
    pub battery_level: Option<f32>, // 0-1 (None if desktop)
    pub last_update: u64,           // timestamp
}

impl Default for HeliosState {
    fn default() -> Self {
        Self {
            active: false,
            cpu_usage: 0.0,
            memory_usage: 0.0,
            disk_usage: 0.0,
            temperature: 0.0,
            battery_level: None,
            last_update: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealth {
    pub global_health: f32, // 0-1
    pub services_running: u32,
    pub errors_count: u32,
    pub warnings_count: u32,
    pub uptime: u64, // seconds
}

impl Default for SystemHealth {
    fn default() -> Self {
        Self {
            global_health: 1.0,
            services_running: 0,
            errors_count: 0,
            warnings_count: 0,
            uptime: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub cpu_usage: f32,         // 0-1
    pub memory_usage: f32,      // 0-1
    pub fps: f32,               // frames per second
    pub latency: u64,           // ms
    pub performance_score: f32, // 0-1
}

impl Default for PerformanceMetrics {
    fn default() -> Self {
        Self {
            cpu_usage: 0.0,
            memory_usage: 0.0,
            fps: 60.0,
            latency: 0,
            performance_score: 1.0,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 2: COGNITIVE (Memory, AI, Knowledge)
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveLayer {
    /// État mémoire
    pub memory: MemoryState,

    /// État conversation AI
    pub conversation: ConversationState,

    /// Base de connaissances
    pub knowledge: KnowledgeState,

    /// Cohérence cognitive globale
    pub coherence: f32, // 0-1
}

impl Default for CognitiveLayer {
    fn default() -> Self {
        Self {
            memory: MemoryState::default(),
            conversation: ConversationState::default(),
            knowledge: KnowledgeState::default(),
            coherence: 0.8,
        }
    }
}

impl CognitiveLayer {
    pub fn coherence_score(&self) -> f32 {
        self.coherence
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryState {
    pub total_memories: u32,
    pub active_memories: u32,
    pub memory_usage: f32,           // 0-1
    pub last_retrieval: Option<u64>, // timestamp
    pub compression_ratio: f32,      // 0-1
}

impl Default for MemoryState {
    fn default() -> Self {
        Self {
            total_memories: 0,
            active_memories: 0,
            memory_usage: 0.0,
            last_retrieval: None,
            compression_ratio: 0.9,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationState {
    pub active_session: bool,
    pub message_count: u32,
    pub context_length: u32, // tokens
    pub last_message: Option<String>,
    pub last_timestamp: Option<u64>,
}

impl Default for ConversationState {
    fn default() -> Self {
        Self {
            active_session: false,
            message_count: 0,
            context_length: 0,
            last_message: None,
            last_timestamp: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeState {
    pub total_entries: u32,
    pub indexed_entries: u32,
    pub knowledge_score: f32, // 0-1
    pub last_update: Option<u64>,
}

impl Default for KnowledgeState {
    fn default() -> Self {
        Self {
            total_entries: 0,
            indexed_entries: 0,
            knowledge_score: 0.0,
            last_update: None,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 3: SYMBOLIC (Persona, Archetypes, Visual)
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolicLayer {
    /// État persona
    pub persona: PersonaState,

    /// Archétype actif
    pub archetype: ArchetypeState,

    /// État visuel (design system)
    pub visual: VisualState,

    /// Stabilité symbolique
    pub stability: f32, // 0-1
}

impl Default for SymbolicLayer {
    fn default() -> Self {
        Self {
            persona: PersonaState::default(),
            archetype: ArchetypeState::default(),
            visual: VisualState::default(),
            stability: 0.9,
        }
    }
}

impl SymbolicLayer {
    pub fn stability_score(&self) -> f32 {
        self.stability
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonaState {
    pub name: String,
    pub mood: String,         // "clair", "vibrant", "alerte"
    pub intensity: f32,       // 0-1
    pub evolution_level: f32, // 0-1
    pub last_interaction: Option<u64>,
}

impl Default for PersonaState {
    fn default() -> Self {
        Self {
            name: "TITANE∞".to_string(),
            mood: "neutre".to_string(),
            intensity: 0.7,
            evolution_level: 0.0,
            last_interaction: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchetypeState {
    pub active_archetype: String,   // "helios", "nexus", "harmonia"
    pub strength: f32,              // 0-1
    pub transition: Option<String>, // archétype de transition
}

impl Default for ArchetypeState {
    fn default() -> Self {
        Self {
            active_archetype: "helios".to_string(),
            strength: 1.0,
            transition: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualState {
    pub theme: String,        // "light", "dark", "auto"
    pub accent_color: String, // hex color
    pub glow_intensity: f32,  // 0-1
    pub motion_enabled: bool,
    pub depth_enabled: bool,
}

impl Default for VisualState {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            accent_color: "#6366f1".to_string(), // indigo-500
            glow_intensity: 0.7,
            motion_enabled: true,
            depth_enabled: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 4: ADAPTIVE (Evolution, Learning, Auto-Heal)
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptiveLayer {
    /// État évolution
    pub evolution: EvolutionState,

    /// État auto-heal
    pub auto_heal: AutoHealState,

    /// Capacité d'évolution
    pub evolution_capacity: f32, // 0-1
}

impl Default for AdaptiveLayer {
    fn default() -> Self {
        Self {
            evolution: EvolutionState::default(),
            auto_heal: AutoHealState::default(),
            evolution_capacity: 1.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionState {
    pub generation: u32,
    pub mutation_rate: f32, // 0-1
    pub fitness_score: f32, // 0-1
    pub last_evolution: Option<u64>,
}

impl Default for EvolutionState {
    fn default() -> Self {
        Self {
            generation: 0,
            mutation_rate: 0.01,
            fitness_score: 0.0,
            last_evolution: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoHealState {
    pub active: bool,
    pub healing_capacity: f32, // 0-1
    pub errors_healed: u32,
    pub last_heal: Option<u64>,
}

impl Default for AutoHealState {
    fn default() -> Self {
        Self {
            active: true,
            healing_capacity: 1.0,
            errors_healed: 0,
            last_heal: None,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 5: META (UI, Runtime, Introspection)
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaLayer {
    /// État UI
    pub ui: UIState,

    /// État runtime
    pub runtime: RuntimeState,

    /// Santé runtime
    pub runtime_health: f32, // 0-1
}

impl Default for MetaLayer {
    fn default() -> Self {
        Self {
            ui: UIState::default(),
            runtime: RuntimeState::default(),
            runtime_health: 1.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UIState {
    pub active_page: String,
    pub sidebar_open: bool,
    pub modal_open: bool,
    pub theme: String,
    pub last_interaction: Option<u64>,
}

impl Default for UIState {
    fn default() -> Self {
        Self {
            active_page: "/".to_string(),
            sidebar_open: false,
            modal_open: false,
            theme: "dark".to_string(),
            last_interaction: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeState {
    pub version: String,
    pub build: String,
    pub environment: String, // "dev", "prod"
    pub uptime: u64,         // seconds
    pub restart_count: u32,
}

impl Default for RuntimeState {
    fn default() -> Self {
        Self {
            version: "17.3.0".to_string(),
            build: "dev".to_string(),
            environment: "dev".to_string(),
            uptime: 0,
            restart_count: 0,
        }
    }
}
