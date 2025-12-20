// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Cognitive Gravity Engine vΩ — SUPER PROMPT #24
//!
//! Champ gravitationnel cognitif avec attracteurs/anti-attracteurs

#![allow(unused_imports)]
#![allow(dead_code)]

pub mod anti_attractors;
pub mod attractors;
pub mod config;
pub mod density_model;
pub mod diagnostics;
pub mod dissonance_absorber;
pub mod feedback_collectors;
pub mod gravity_feedback;
pub mod gravity_field;
pub mod gravity_performance_integration;
pub mod gravity_propagation;
pub mod real_feedback_collector;
pub mod stability_engine;

pub use anti_attractors::{AntiAttractor, AntiAttractorState};
pub use attractors::{Attractor, AttractorState};
pub use config::GravityConfig;
pub use density_model::CognitiveDensity;
pub use diagnostics::{GravityDiagnostics, GravityMonitor};
pub use dissonance_absorber::{DissonanceAbsorber, DissonanceRecord};
pub use feedback_collectors::{
    AgentsFeedback, CompleteFeedback, HarmonicFeedback, KernelFeedback, MemoryFeedback,
    OmegaFeedback, PerformanceFeedback,
};
pub use gravity_feedback::GravityFeedbackLoop;
pub use gravity_field::GravityField;
pub use gravity_performance_integration::GravityPerformanceIntegration;
pub use gravity_propagation::{GravityPropagation, GravityPropagationEngine};
pub use real_feedback_collector::RealFeedbackCollector;
pub use stability_engine::StabilityEngine;

use crate::utils::AppResult as TitaneResult;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{interval, Duration};

/// Cognitive Gravity Engine
pub struct CognitiveGravityEngine {
    config: GravityConfig,
    field: Arc<RwLock<GravityField>>,
    attractors: Arc<RwLock<AttractorState>>,
    anti_attractors: Arc<RwLock<AntiAttractorState>>,
    density: Arc<RwLock<CognitiveDensity>>,
    stability_engine: Arc<RwLock<StabilityEngine>>,
    dissonance_absorber: Arc<RwLock<DissonanceAbsorber>>,
    propagation_engine: GravityPropagationEngine,
    feedback_loop: GravityFeedbackLoop,
    monitor: GravityMonitor,
    running: Arc<RwLock<bool>>,
}

impl CognitiveGravityEngine {
    /// Crée une nouvelle instance Cognitive Gravity Engine
    pub fn new(config: GravityConfig) -> Self {
        Self {
            config: config.clone(),
            field: Arc::new(RwLock::new(GravityField::default())),
            attractors: Arc::new(RwLock::new(AttractorState::default())),
            anti_attractors: Arc::new(RwLock::new(AntiAttractorState::default())),
            density: Arc::new(RwLock::new(CognitiveDensity::default())),
            stability_engine: Arc::new(RwLock::new(StabilityEngine::default())),
            dissonance_absorber: Arc::new(RwLock::new(DissonanceAbsorber::default())),
            propagation_engine: GravityPropagationEngine,
            feedback_loop: GravityFeedbackLoop::default(),
            monitor: GravityMonitor,
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Initialise et démarre le moteur gravitationnel
    pub async fn initialize(&self) -> TitaneResult<()> {
        log::info!("🌌 Initialisation Cognitive Gravity Engine vΩ");

        let mut running = self.running.write().await;
        *running = true;

        let field = self.field.clone();
        let attractors = self.attractors.clone();
        let anti_attractors = self.anti_attractors.clone();
        let density = self.density.clone();
        let running_clone = self.running.clone();
        let loop_interval = self.config.loop_interval_ms;
        let attractor_weights = self.config.attractor_weights();
        let anti_attractor_weights = self.config.anti_attractor_weights();
        let mut feedback_loop = self.feedback_loop.clone();

        tokio::spawn(async move {
            let mut tick = interval(Duration::from_millis(loop_interval));
            while *running_clone.read().await {
                tick.tick().await;

                // 🔄 PHASE 1: Feedback Collection - Gather data from all engines
                let mut attractors_guard = attractors.write().await;
                let mut anti_attractors_guard = anti_attractors.write().await;

                if let Err(e) = feedback_loop
                    .feedback_cycle(&mut attractors_guard, &mut anti_attractors_guard)
                    .await
                {
                    log::warn!("⚠️ Feedback cycle error: {}", e);
                }

                // 🌊 PHASE 2: Gravity Field Update - Apply attractor/anti-attractor forces
                let mut field_guard = field.write().await;
                let mut density_guard = density.write().await;

                // Calculate attractor/anti-attractor influences
                let attractor_sum = attractors_guard.compute_total_influence(&attractor_weights);
                let anti_attractor_sum =
                    anti_attractors_guard.compute_total_repulsion(&anti_attractor_weights);

                // Update gravity field
                field_guard.update_from_forces(attractor_sum, anti_attractor_sum);

                // Update density model
                density_guard.calculate_from_components(
                    field_guard.cognitive_mass,
                    field_guard.entropy,
                    5, // Implementation: Get actual active processes count from system
                       // - Source: Use tokio task tracker or custom process registry
                       // - Count: active_tasks.len() from Arc<RwLock<HashSet<TaskId>>>
                       // - Categories: AI inference, memory operations, I/O tasks, background jobs
                       // - Alternative: Use sysinfo crate for system-wide process count
                       // - Update frequency: Refresh count every 1s to avoid stale data
                );

                drop(attractors_guard);
                drop(anti_attractors_guard);
                drop(field_guard);
                drop(density_guard);
            }
        });

        log::info!("✅ Cognitive Gravity Engine démarré avec Feedback Loop");
        Ok(())
    }

    /// Arrête le moteur gravitationnel
    pub async fn shutdown(&self) -> TitaneResult<()> {
        log::info!("🛑 Arrêt Cognitive Gravity Engine");
        let mut running = self.running.write().await;
        *running = false;
        Ok(())
    }

    /// Récupère le champ gravitationnel actuel
    pub async fn get_field(&self) -> GravityField {
        self.field.read().await.clone()
    }

    /// Récupère les attracteurs actuels
    pub async fn get_attractors(&self) -> AttractorState {
        self.attractors.read().await.clone()
    }

    /// Récupère les anti-attracteurs actuels
    pub async fn get_anti_attractors(&self) -> AntiAttractorState {
        self.anti_attractors.read().await.clone()
    }

    /// Met à jour un attracteur
    pub async fn set_attractor(&self, attractor: Attractor, value: f32) {
        let mut attractors = self.attractors.write().await;
        attractors.set(attractor, value);
    }

    /// Met à jour un anti-attracteur
    pub async fn set_anti_attractor(&self, anti_attractor: AntiAttractor, value: f32) {
        let mut anti_attractors = self.anti_attractors.write().await;
        anti_attractors.set(anti_attractor, value);
    }

    /// Propage les forces gravitationnelles
    pub async fn propagate(&self) -> TitaneResult<GravityPropagation> {
        let field = self.field.read().await;
        self.propagation_engine.propagate(&field).await
    }

    /// Absorbe une dissonance
    pub async fn absorb_dissonance(&self, source: String, severity: f32) -> bool {
        let mut absorber = self.dissonance_absorber.write().await;
        absorber.absorb(source, severity)
    }

    /// Diagnostics complets
    pub async fn diagnostics(&self) -> GravityDiagnostics {
        let field = self.field.read().await;
        let attractors = self.attractors.read().await;
        let anti_attractors = self.anti_attractors.read().await;
        let density = self.density.read().await;

        self.monitor
            .analyze(&field, &attractors, &anti_attractors, &density)
    }
}

impl Default for CognitiveGravityEngine {
    fn default() -> Self {
        Self::new(GravityConfig::new_default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cognitive_gravity_lifecycle() {
        let engine = CognitiveGravityEngine::default();
        engine
            .initialize()
            .await
            .expect("CognitiveGravityEngine should initialize in tests");

        let field = engine.get_field().await;
        assert!(field.cognitive_mass >= 0.0 && field.cognitive_mass <= 1.0);

        engine
            .shutdown()
            .await
            .expect("CognitiveGravityEngine should shutdown in tests");
    }

    #[tokio::test]
    async fn test_feedback_loop_integration() {
        let engine = CognitiveGravityEngine::default();
        engine
            .initialize()
            .await
            .expect("CognitiveGravityEngine should initialize in tests");

        // Wait for at least one feedback cycle
        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

        // Verify attractors have been updated by feedback
        let attractors = engine.get_attractors().await;
        assert!(
            attractors.clarity > 0.0,
            "Clarity should be set from KernelFeedback"
        );
        assert!(
            attractors.coherence > 0.0,
            "Coherence should be set from OmegaFeedback"
        );

        // Verify anti-attractors have been updated
        let anti_attractors = engine.get_anti_attractors().await;
        assert!(anti_attractors.overload >= 0.0 && anti_attractors.overload <= 1.0);

        engine
            .shutdown()
            .await
            .expect("CognitiveGravityEngine should shutdown in tests");
    }

    #[tokio::test]
    async fn test_complete_feedback_collection() {
        let mut feedback_loop = GravityFeedbackLoop::default();
        let mut attractors = AttractorState::default();
        let mut anti_attractors = AntiAttractorState::default();

        // Run one feedback cycle
        feedback_loop
            .feedback_cycle(&mut attractors, &mut anti_attractors)
            .await
            .expect("feedback_cycle should succeed in tests");

        // Verify feedback was applied
        let last_feedback = feedback_loop.get_last_feedback();
        assert!(last_feedback.is_some(), "Feedback should be collected");

        let feedback = last_feedback.expect("Feedback should be present after cycle");
        assert!(feedback.kernel.system_health >= 0.0);
        assert!(feedback.omega.reflection_depth >= 0.0);
        assert!(feedback.memory.vector_alignment >= 0.0);
        assert!(feedback.agents.consensus_score >= 0.0);
        assert!(feedback.harmonic.global_harmony >= 0.0);
        assert!(feedback.performance.load_balance >= 0.0);
    }

    #[tokio::test]
    async fn test_attractor_update() {
        let engine = CognitiveGravityEngine::default();
        engine.set_attractor(Attractor::Clarity, 0.8).await;

        let attractors = engine.get_attractors().await;
        assert_eq!(attractors.clarity, 0.8);
    }

    #[tokio::test]
    async fn test_attractor_mapping() {
        use crate::cognitive_gravity::RealFeedbackCollector;

        let mut attractors = AttractorState::default();

        // Collect real feedback
        let kernel = RealFeedbackCollector::collect_kernel_feedback()
            .await
            .expect("collect_kernel_feedback should succeed in tests");
        let omega = RealFeedbackCollector::collect_omega_feedback()
            .await
            .expect("collect_omega_feedback should succeed in tests");
        let memory = RealFeedbackCollector::collect_memory_feedback()
            .await
            .expect("collect_memory_feedback should succeed in tests");
        let agents = RealFeedbackCollector::collect_agents_feedback()
            .await
            .expect("collect_agents_feedback should succeed in tests");
        let harmonic = RealFeedbackCollector::collect_harmonic_feedback()
            .await
            .expect("collect_harmonic_feedback should succeed in tests");

        // Apply feedback to attractors
        kernel.apply_to_attractors(&mut attractors);
        omega.apply_to_attractors(&mut attractors);
        memory.apply_to_attractors(&mut attractors);
        agents.apply_to_attractors(&mut attractors);
        harmonic.apply_to_attractors(&mut attractors);

        // Verify all 6 attractors are mapped correctly
        assert!(
            attractors.clarity > 0.0,
            "Clarity should be set from KernelFeedback.system_health"
        );
        assert!(
            attractors.coherence > 0.0,
            "Coherence should be set from OmegaFeedback.reflection_depth"
        );
        assert!(
            attractors.alignment > 0.0,
            "Alignment should be set from MemoryFeedback.vector_alignment"
        );
        assert!(
            attractors.focus > 0.0,
            "Focus should be set from AgentsFeedback.consensus_score"
        );
        assert!(
            attractors.truth > 0.0,
            "Truth should be set from HarmonicFeedback.global_harmony"
        );
        assert!(
            attractors.simplicity > 0.0,
            "Simplicity should be set from HarmonicFeedback.stability"
        );

        // Verify all values are in valid range
        assert!(attractors.clarity <= 1.0);
        assert!(attractors.coherence <= 1.0);
        assert!(attractors.alignment <= 1.0);
        assert!(attractors.focus <= 1.0);
        assert!(attractors.truth <= 1.0);
        assert!(attractors.simplicity <= 1.0);
    }

    #[tokio::test]
    async fn test_anti_attractor_mapping() {
        use crate::cognitive_gravity::RealFeedbackCollector;

        let mut anti_attractors = AntiAttractorState::default();

        // Collect real feedback
        let kernel = RealFeedbackCollector::collect_kernel_feedback()
            .await
            .expect("collect_kernel_feedback should succeed in tests");
        let omega = RealFeedbackCollector::collect_omega_feedback()
            .await
            .expect("collect_omega_feedback should succeed in tests");
        let memory = RealFeedbackCollector::collect_memory_feedback()
            .await
            .expect("collect_memory_feedback should succeed in tests");
        let agents = RealFeedbackCollector::collect_agents_feedback()
            .await
            .expect("collect_agents_feedback should succeed in tests");
        let harmonic = RealFeedbackCollector::collect_harmonic_feedback()
            .await
            .expect("collect_harmonic_feedback should succeed in tests");
        let performance = RealFeedbackCollector::collect_performance_feedback()
            .await
            .expect("collect_performance_feedback should succeed in tests");

        // Apply feedback to anti-attractors
        kernel.apply_to_anti_attractors(&mut anti_attractors);
        omega.apply_to_anti_attractors(&mut anti_attractors);
        memory.apply_to_anti_attractors(&mut anti_attractors);
        agents.apply_to_anti_attractors(&mut anti_attractors);
        harmonic.apply_to_anti_attractors(&mut anti_attractors);
        performance.apply_to_anti_attractors(&mut anti_attractors);

        // Verify all 5 anti-attractors are in valid range (0.0-1.0)
        assert!(
            anti_attractors.confusion >= 0.0 && anti_attractors.confusion <= 1.0,
            "Confusion should be set from OmegaFeedback.contradictions"
        );
        assert!(
            anti_attractors.noise >= 0.0 && anti_attractors.noise <= 1.0,
            "Noise should be set from MemoryFeedback.noise_level"
        );
        assert!(
            anti_attractors.dissonance >= 0.0 && anti_attractors.dissonance <= 1.0,
            "Dissonance should be set from AgentsFeedback.conflicts + HarmonicFeedback.dissonances"
        );
        assert!(anti_attractors.overload >= 0.0 && anti_attractors.overload <= 1.0,
                "Overload should be set from KernelFeedback.cpu_usage + PerformanceFeedback.queue_sizes");
        assert!(
            anti_attractors.drift >= 0.0 && anti_attractors.drift <= 1.0,
            "Drift should be in valid range"
        );
    }

    #[tokio::test]
    async fn test_gravity_field_response() {
        let engine = CognitiveGravityEngine::default();
        engine
            .initialize()
            .await
            .expect("CognitiveGravityEngine should initialize in tests");

        // Get initial field state
        let initial_field = engine.get_field().await;
        let initial_mass = initial_field.cognitive_mass;
        let initial_entropy = initial_field.entropy;

        // Wait for feedback cycles to update the field
        tokio::time::sleep(tokio::time::Duration::from_millis(250)).await;

        // Get updated field state
        let updated_field = engine.get_field().await;

        // Verify field has valid values after feedback
        assert!(
            updated_field.cognitive_mass >= 0.0 && updated_field.cognitive_mass <= 1.0,
            "Cognitive mass should be in valid range"
        );
        assert!(
            updated_field.coherence_force >= 0.0 && updated_field.coherence_force <= 1.0,
            "Coherence force should be in valid range"
        );
        assert!(
            updated_field.entropy >= 0.0 && updated_field.entropy <= 1.0,
            "Entropy should be in valid range"
        );

        // Verify field components exist
        assert!(updated_field.resonance >= 0.0);
        assert!(updated_field.stability >= 0.0);

        engine
            .shutdown()
            .await
            .expect("CognitiveGravityEngine should shutdown in tests");
    }

    #[tokio::test]
    async fn test_harmonic_gravity_feedback_integration() {
        let engine = CognitiveGravityEngine::default();
        engine
            .initialize()
            .await
            .expect("CognitiveGravityEngine should initialize in tests");

        // Simulate high harmony from HarmonicOS
        let mut attractors = engine.get_attractors().await;
        let initial_truth = attractors.truth;

        // Wait for feedback to flow
        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

        // Get updated attractors
        attractors = engine.get_attractors().await;

        // Verify Truth attractor is set from HarmonicFeedback
        assert!(
            attractors.truth > 0.0,
            "Truth should be influenced by HarmonicFeedback.global_harmony"
        );

        // Verify Simplicity attractor is set from HarmonicFeedback
        assert!(
            attractors.simplicity > 0.0,
            "Simplicity should be influenced by HarmonicFeedback.stability"
        );

        // Get field and verify coherence
        let field = engine.get_field().await;
        assert!(
            field.resonance >= 0.0,
            "Harmonic resonance should be present in field"
        );

        engine
            .shutdown()
            .await
            .expect("CognitiveGravityEngine should shutdown in tests");
    }
}
