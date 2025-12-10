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
#[derive(Default)]
pub struct PhysicalLayer {
    /// État Helios (monitoring hardware)
    pub helios: HeliosState,

    /// Santé système
    pub system_health: SystemHealth,

    /// Métriques performance
    pub metrics: PerformanceMetrics,
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
#[derive(Default)]
pub struct ConversationState {
    pub active_session: bool,
    pub message_count: u32,
    pub context_length: u32, // tokens
    pub last_message: Option<String>,
    pub last_timestamp: Option<u64>,
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

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // LAYER 1: PhysicalLayer Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_helios_state_default() {
        let state = HeliosState::default();
        assert!(!state.active);
        assert_eq!(state.cpu_usage, 0.0);
        assert_eq!(state.memory_usage, 0.0);
        assert_eq!(state.disk_usage, 0.0);
        assert_eq!(state.temperature, 0.0);
        assert!(state.battery_level.is_none());
        assert_eq!(state.last_update, 0);
    }

    #[test]
    fn test_helios_state_with_battery() {
        let state = HeliosState {
            active: true,
            cpu_usage: 0.5,
            memory_usage: 0.6,
            disk_usage: 0.7,
            temperature: 45.0,
            battery_level: Some(0.85),
            last_update: 1234567890,
        };
        assert!(state.battery_level.is_some());
        assert_eq!(state.battery_level.unwrap(), 0.85);
    }

    #[test]
    fn test_helios_state_serialization() {
        let state = HeliosState::default();
        let json = serde_json::to_string(&state).unwrap();
        let restored: HeliosState = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.active, state.active);
    }

    #[test]
    fn test_system_health_default() {
        let health = SystemHealth::default();
        assert_eq!(health.global_health, 1.0);
        assert_eq!(health.services_running, 0);
        assert_eq!(health.errors_count, 0);
        assert_eq!(health.warnings_count, 0);
        assert_eq!(health.uptime, 0);
    }

    #[test]
    fn test_system_health_serialization() {
        let health = SystemHealth {
            global_health: 0.95,
            services_running: 10,
            errors_count: 2,
            warnings_count: 5,
            uptime: 86400,
        };
        let json = serde_json::to_string(&health).unwrap();
        let restored: SystemHealth = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.global_health, 0.95);
        assert_eq!(restored.services_running, 10);
    }

    #[test]
    fn test_performance_metrics_default() {
        let metrics = PerformanceMetrics::default();
        assert_eq!(metrics.cpu_usage, 0.0);
        assert_eq!(metrics.memory_usage, 0.0);
        assert_eq!(metrics.fps, 60.0);
        assert_eq!(metrics.latency, 0);
        assert_eq!(metrics.performance_score, 1.0);
    }

    #[test]
    fn test_performance_metrics_serialization() {
        let metrics = PerformanceMetrics {
            cpu_usage: 0.3,
            memory_usage: 0.5,
            fps: 120.0,
            latency: 16,
            performance_score: 0.95,
        };
        let json = serde_json::to_string(&metrics).unwrap();
        let restored: PerformanceMetrics = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.fps, 120.0);
    }

    #[test]
    fn test_physical_layer_default() {
        let layer = PhysicalLayer::default();
        assert_eq!(layer.health_score(), 0.5);
    }

    #[test]
    fn test_physical_layer_health_score() {
        let layer = PhysicalLayer {
            helios: HeliosState::default(),
            system_health: SystemHealth {
                global_health: 0.8,
                ..Default::default()
            },
            metrics: PerformanceMetrics {
                performance_score: 0.6,
                ..Default::default()
            },
        };
        assert_eq!(layer.health_score(), 0.7);
    }

    #[test]
    fn test_physical_layer_is_critical_low_health() {
        let layer = PhysicalLayer {
            helios: HeliosState::default(),
            system_health: SystemHealth {
                global_health: 0.2,
                ..Default::default()
            },
            metrics: PerformanceMetrics::default(),
        };
        assert!(layer.is_critical());
    }

    #[test]
    fn test_physical_layer_is_critical_high_cpu() {
        let layer = PhysicalLayer {
            helios: HeliosState::default(),
            system_health: SystemHealth::default(),
            metrics: PerformanceMetrics {
                cpu_usage: 0.98,
                ..Default::default()
            },
        };
        assert!(layer.is_critical());
    }

    #[test]
    fn test_physical_layer_not_critical() {
        let layer = PhysicalLayer {
            helios: HeliosState::default(),
            system_health: SystemHealth {
                global_health: 0.8,
                ..Default::default()
            },
            metrics: PerformanceMetrics {
                cpu_usage: 0.5,
                ..Default::default()
            },
        };
        assert!(!layer.is_critical());
    }

    // ─────────────────────────────────────────────────────────────
    // LAYER 2: CognitiveLayer Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_state_default() {
        let state = MemoryState::default();
        assert_eq!(state.total_memories, 0);
        assert_eq!(state.active_memories, 0);
        assert_eq!(state.memory_usage, 0.0);
        assert!(state.last_retrieval.is_none());
        assert_eq!(state.compression_ratio, 0.9);
    }

    #[test]
    fn test_memory_state_with_data() {
        let state = MemoryState {
            total_memories: 1000,
            active_memories: 50,
            memory_usage: 0.7,
            last_retrieval: Some(1234567890),
            compression_ratio: 0.85,
        };
        assert!(state.last_retrieval.is_some());
        assert_eq!(state.total_memories, 1000);
    }

    #[test]
    fn test_conversation_state_default() {
        let state = ConversationState::default();
        assert!(!state.active_session);
        assert_eq!(state.message_count, 0);
        assert_eq!(state.context_length, 0);
        assert!(state.last_message.is_none());
        assert!(state.last_timestamp.is_none());
    }

    #[test]
    fn test_conversation_state_active() {
        let state = ConversationState {
            active_session: true,
            message_count: 25,
            context_length: 4096,
            last_message: Some("Hello".to_string()),
            last_timestamp: Some(1234567890),
        };
        assert!(state.active_session);
        assert_eq!(state.last_message.unwrap(), "Hello");
    }

    #[test]
    fn test_knowledge_state_default() {
        let state = KnowledgeState::default();
        assert_eq!(state.total_entries, 0);
        assert_eq!(state.indexed_entries, 0);
        assert_eq!(state.knowledge_score, 0.0);
        assert!(state.last_update.is_none());
    }

    #[test]
    fn test_cognitive_layer_default() {
        let layer = CognitiveLayer::default();
        assert_eq!(layer.coherence, 0.8);
        assert_eq!(layer.coherence_score(), 0.8);
    }

    #[test]
    fn test_cognitive_layer_serialization() {
        let layer = CognitiveLayer::default();
        let json = serde_json::to_string(&layer).unwrap();
        let restored: CognitiveLayer = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.coherence, layer.coherence);
    }

    // ─────────────────────────────────────────────────────────────
    // LAYER 3: SymbolicLayer Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_persona_state_default() {
        let state = PersonaState::default();
        assert_eq!(state.name, "TITANE∞");
        assert_eq!(state.mood, "neutre");
        assert_eq!(state.intensity, 0.7);
        assert_eq!(state.evolution_level, 0.0);
        assert!(state.last_interaction.is_none());
    }

    #[test]
    fn test_persona_state_custom() {
        let state = PersonaState {
            name: "Custom".to_string(),
            mood: "vibrant".to_string(),
            intensity: 0.9,
            evolution_level: 0.5,
            last_interaction: Some(1234567890),
        };
        assert_eq!(state.mood, "vibrant");
        assert_eq!(state.intensity, 0.9);
    }

    #[test]
    fn test_archetype_state_default() {
        let state = ArchetypeState::default();
        assert_eq!(state.active_archetype, "helios");
        assert_eq!(state.strength, 1.0);
        assert!(state.transition.is_none());
    }

    #[test]
    fn test_archetype_state_transition() {
        let state = ArchetypeState {
            active_archetype: "nexus".to_string(),
            strength: 0.8,
            transition: Some("harmonia".to_string()),
        };
        assert!(state.transition.is_some());
        assert_eq!(state.transition.unwrap(), "harmonia");
    }

    #[test]
    fn test_visual_state_default() {
        let state = VisualState::default();
        assert_eq!(state.theme, "dark");
        assert_eq!(state.accent_color, "#6366f1");
        assert_eq!(state.glow_intensity, 0.7);
        assert!(state.motion_enabled);
        assert!(state.depth_enabled);
    }

    #[test]
    fn test_visual_state_light_theme() {
        let state = VisualState {
            theme: "light".to_string(),
            accent_color: "#ffffff".to_string(),
            glow_intensity: 0.3,
            motion_enabled: false,
            depth_enabled: false,
        };
        assert_eq!(state.theme, "light");
        assert!(!state.motion_enabled);
    }

    #[test]
    fn test_symbolic_layer_default() {
        let layer = SymbolicLayer::default();
        assert_eq!(layer.stability, 0.9);
        assert_eq!(layer.stability_score(), 0.9);
    }

    #[test]
    fn test_symbolic_layer_serialization() {
        let layer = SymbolicLayer::default();
        let json = serde_json::to_string(&layer).unwrap();
        let restored: SymbolicLayer = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.stability, layer.stability);
    }

    // ─────────────────────────────────────────────────────────────
    // LAYER 4: AdaptiveLayer Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_evolution_state_default() {
        let state = EvolutionState::default();
        assert_eq!(state.generation, 0);
        assert_eq!(state.mutation_rate, 0.01);
        assert_eq!(state.fitness_score, 0.0);
        assert!(state.last_evolution.is_none());
    }

    #[test]
    fn test_evolution_state_evolved() {
        let state = EvolutionState {
            generation: 100,
            mutation_rate: 0.05,
            fitness_score: 0.95,
            last_evolution: Some(1234567890),
        };
        assert_eq!(state.generation, 100);
        assert_eq!(state.fitness_score, 0.95);
    }

    #[test]
    fn test_auto_heal_state_default() {
        let state = AutoHealState::default();
        assert!(state.active);
        assert_eq!(state.healing_capacity, 1.0);
        assert_eq!(state.errors_healed, 0);
        assert!(state.last_heal.is_none());
    }

    #[test]
    fn test_auto_heal_state_active() {
        let state = AutoHealState {
            active: true,
            healing_capacity: 0.8,
            errors_healed: 50,
            last_heal: Some(1234567890),
        };
        assert_eq!(state.errors_healed, 50);
        assert!(state.last_heal.is_some());
    }

    #[test]
    fn test_adaptive_layer_default() {
        let layer = AdaptiveLayer::default();
        assert_eq!(layer.evolution_capacity, 1.0);
        assert!(layer.auto_heal.active);
    }

    #[test]
    fn test_adaptive_layer_serialization() {
        let layer = AdaptiveLayer::default();
        let json = serde_json::to_string(&layer).unwrap();
        let restored: AdaptiveLayer = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.evolution_capacity, layer.evolution_capacity);
    }

    // ─────────────────────────────────────────────────────────────
    // LAYER 5: MetaLayer Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_ui_state_default() {
        let state = UIState::default();
        assert_eq!(state.active_page, "/");
        assert!(!state.sidebar_open);
        assert!(!state.modal_open);
        assert_eq!(state.theme, "dark");
        assert!(state.last_interaction.is_none());
    }

    #[test]
    fn test_ui_state_active() {
        let state = UIState {
            active_page: "/dashboard".to_string(),
            sidebar_open: true,
            modal_open: true,
            theme: "light".to_string(),
            last_interaction: Some(1234567890),
        };
        assert_eq!(state.active_page, "/dashboard");
        assert!(state.sidebar_open);
        assert!(state.modal_open);
    }

    #[test]
    fn test_runtime_state_default() {
        let state = RuntimeState::default();
        assert_eq!(state.version, "17.3.0");
        assert_eq!(state.build, "dev");
        assert_eq!(state.environment, "dev");
        assert_eq!(state.uptime, 0);
        assert_eq!(state.restart_count, 0);
    }

    #[test]
    fn test_runtime_state_production() {
        let state = RuntimeState {
            version: "18.0.0".to_string(),
            build: "release".to_string(),
            environment: "prod".to_string(),
            uptime: 86400,
            restart_count: 3,
        };
        assert_eq!(state.environment, "prod");
        assert_eq!(state.uptime, 86400);
    }

    #[test]
    fn test_meta_layer_default() {
        let layer = MetaLayer::default();
        assert_eq!(layer.runtime_health, 1.0);
        assert_eq!(layer.ui.theme, "dark");
    }

    #[test]
    fn test_meta_layer_serialization() {
        let layer = MetaLayer::default();
        let json = serde_json::to_string(&layer).unwrap();
        let restored: MetaLayer = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.runtime_health, layer.runtime_health);
    }

    // ─────────────────────────────────────────────────────────────
    // Clone and Debug Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_all_layers_clone() {
        let physical = PhysicalLayer::default();
        let cognitive = CognitiveLayer::default();
        let symbolic = SymbolicLayer::default();
        let adaptive = AdaptiveLayer::default();
        let meta = MetaLayer::default();

        let _ = physical.clone();
        let _ = cognitive.clone();
        let _ = symbolic.clone();
        let _ = adaptive.clone();
        let _ = meta.clone();
    }

    #[test]
    fn test_all_layers_debug() {
        let physical = PhysicalLayer::default();
        let cognitive = CognitiveLayer::default();
        let symbolic = SymbolicLayer::default();
        let adaptive = AdaptiveLayer::default();
        let meta = MetaLayer::default();

        assert!(format!("{:?}", physical).contains("PhysicalLayer"));
        assert!(format!("{:?}", cognitive).contains("CognitiveLayer"));
        assert!(format!("{:?}", symbolic).contains("SymbolicLayer"));
        assert!(format!("{:?}", adaptive).contains("AdaptiveLayer"));
        assert!(format!("{:?}", meta).contains("MetaLayer"));
    }
}
