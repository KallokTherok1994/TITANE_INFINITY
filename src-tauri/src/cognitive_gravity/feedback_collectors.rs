// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Collecteurs de feedback depuis tous les moteurs

#![allow(unused_imports)]
#![allow(dead_code)]

use super::attractors::{Attractor, AttractorState};
use super::anti_attractors::{AntiAttractor, AntiAttractorState};
use serde::{Deserialize, Serialize};

/// Feedback depuis le Kernel
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KernelFeedback {
    pub system_health: f32,        // 0.0-1.0 (health → Clarity)
    pub cpu_usage: f32,             // 0.0-1.0 (overload → Overload)
    pub memory_usage: f32,          // 0.0-1.0
    pub uptime_stability: f32,      // 0.0-1.0
}

impl KernelFeedback {
    pub fn apply_to_attractors(&self, attractors: &mut AttractorState) {
        // System health → Clarity
        attractors.set(Attractor::Clarity, self.system_health);
    }
    
    pub fn apply_to_anti_attractors(&self, anti_attractors: &mut AntiAttractorState) {
        // High CPU/Memory → Overload
        let overload_score = ((self.cpu_usage + self.memory_usage) / 2.0).clamp(0.0, 1.0);
        anti_attractors.set(AntiAttractor::Overload, overload_score);
    }
}

impl Default for KernelFeedback {
    fn default() -> Self {
        Self {
            system_health: 0.8,
            cpu_usage: 0.3,
            memory_usage: 0.4,
            uptime_stability: 0.9,
        }
    }
}

/// Feedback depuis OMEGA Pipeline
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaFeedback {
    pub reflection_depth: f32,      // 0.0-1.0 (depth → Coherence)
    pub coherence_score: f32,       // 0.0-1.0
    pub contradiction_count: usize, // contradictions → Confusion
    pub complexity: f32,            // 0.0-1.0
}

impl OmegaFeedback {
    pub fn apply_to_attractors(&self, attractors: &mut AttractorState) {
        // Reflection depth → Coherence
        let coherence = (self.coherence_score + self.reflection_depth / 10.0) / 2.0;
        attractors.set(Attractor::Coherence, coherence.clamp(0.0, 1.0));
    }
    
    pub fn apply_to_anti_attractors(&self, anti_attractors: &mut AntiAttractorState) {
        // Contradictions → Confusion
        let confusion = (self.contradiction_count as f32 / 10.0).min(1.0);
        anti_attractors.set(AntiAttractor::Confusion, confusion);
    }
}

impl Default for OmegaFeedback {
    fn default() -> Self {
        Self {
            reflection_depth: 3.0,
            coherence_score: 0.7,
            contradiction_count: 0,
            complexity: 0.5,
        }
    }
}

/// Feedback depuis Memory Engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryFeedback {
    pub vector_alignment: f32,      // 0.0-1.0 (alignment → Alignment)
    pub search_accuracy: f32,       // 0.0-1.0
    pub noise_level: f32,           // 0.0-1.0 (noise → Noise)
    pub memory_coherence: f32,      // 0.0-1.0
}

impl MemoryFeedback {
    pub fn apply_to_attractors(&self, attractors: &mut AttractorState) {
        // Vector alignment → Alignment
        let alignment = (self.vector_alignment + self.search_accuracy) / 2.0;
        attractors.set(Attractor::Alignment, alignment.clamp(0.0, 1.0));
    }
    
    pub fn apply_to_anti_attractors(&self, anti_attractors: &mut AntiAttractorState) {
        // Noise level → Noise
        anti_attractors.set(AntiAttractor::Noise, self.noise_level);
    }
}

impl Default for MemoryFeedback {
    fn default() -> Self {
        Self {
            vector_alignment: 0.75,
            search_accuracy: 0.8,
            noise_level: 0.2,
            memory_coherence: 0.7,
        }
    }
}

/// Feedback depuis Multi-Agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentsFeedback {
    pub consensus_score: f32,       // 0.0-1.0 (consensus → Focus)
    pub active_agents: usize,
    pub conflict_count: usize,      // conflicts → Dissonance
    pub coordination: f32,          // 0.0-1.0
}

impl AgentsFeedback {
    pub fn apply_to_attractors(&self, attractors: &mut AttractorState) {
        // Consensus → Focus
        let focus = (self.consensus_score + self.coordination) / 2.0;
        attractors.set(Attractor::Focus, focus.clamp(0.0, 1.0));
    }
    
    pub fn apply_to_anti_attractors(&self, anti_attractors: &mut AntiAttractorState) {
        // Conflicts → Dissonance
        let dissonance = (self.conflict_count as f32 / 5.0).min(1.0);
        anti_attractors.set(AntiAttractor::Dissonance, dissonance);
    }
}

impl Default for AgentsFeedback {
    fn default() -> Self {
        Self {
            consensus_score: 0.8,
            active_agents: 3,
            conflict_count: 0,
            coordination: 0.75,
        }
    }
}

/// Feedback depuis Harmonic OS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarmonicFeedback {
    pub global_harmony: f32,        // 0.0-1.0 (harmony → Truth)
    pub resonance_score: f32,       // 0.0-1.0
    pub dissonance_count: usize,    // dissonances → Dissonance
    pub stability: f32,             // 0.0-1.0
}

impl HarmonicFeedback {
    pub fn apply_to_attractors(&self, attractors: &mut AttractorState) {
        // Global harmony → Truth
        let truth = (self.global_harmony + self.resonance_score) / 2.0;
        attractors.set(Attractor::Truth, truth.clamp(0.0, 1.0));
        
        // High stability → Simplicity
        attractors.set(Attractor::Simplicity, self.stability);
    }
    
    pub fn apply_to_anti_attractors(&self, anti_attractors: &mut AntiAttractorState) {
        // Dissonances → Dissonance
        let dissonance = (self.dissonance_count as f32 / 5.0).min(1.0);
        anti_attractors.set(AntiAttractor::Dissonance, dissonance);
    }
}

impl Default for HarmonicFeedback {
    fn default() -> Self {
        Self {
            global_harmony: 0.7,
            resonance_score: 0.75,
            dissonance_count: 0,
            stability: 0.8,
        }
    }
}

/// Feedback depuis Performance Engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceFeedback {
    pub load_balance: f32,          // 0.0-1.0
    pub queue_sizes: f32,           // 0.0-1.0 (high → Overload)
    pub thread_utilization: f32,    // 0.0-1.0
    pub task_completion_rate: f32,  // 0.0-1.0
}

impl PerformanceFeedback {
    pub fn apply_to_anti_attractors(&self, anti_attractors: &mut AntiAttractorState) {
        // High queue sizes → Overload
        let overload = self.queue_sizes;
        anti_attractors.set(AntiAttractor::Overload, overload);
    }
}

impl Default for PerformanceFeedback {
    fn default() -> Self {
        Self {
            load_balance: 0.7,
            queue_sizes: 0.3,
            thread_utilization: 0.6,
            task_completion_rate: 0.85,
        }
    }
}

/// Feedback complet depuis tous les moteurs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompleteFeedback {
    pub kernel: KernelFeedback,
    pub omega: OmegaFeedback,
    pub memory: MemoryFeedback,
    pub agents: AgentsFeedback,
    pub harmonic: HarmonicFeedback,
    pub performance: PerformanceFeedback,
    pub timestamp: i64,
}

impl CompleteFeedback {
    pub fn new() -> Self {
        Self {
            kernel: KernelFeedback::default(),
            omega: OmegaFeedback::default(),
            memory: MemoryFeedback::default(),
            agents: AgentsFeedback::default(),
            harmonic: HarmonicFeedback::default(),
            performance: PerformanceFeedback::default(),
            timestamp: chrono::Utc::now().timestamp_millis(),
        }
    }
    
    /// Applique tous les feedbacks aux attracteurs
    pub fn apply_to_attractors(&self, attractors: &mut AttractorState) {
        self.kernel.apply_to_attractors(attractors);
        self.omega.apply_to_attractors(attractors);
        self.memory.apply_to_attractors(attractors);
        self.agents.apply_to_attractors(attractors);
        self.harmonic.apply_to_attractors(attractors);
    }
    
    /// Applique tous les feedbacks aux anti-attracteurs
    pub fn apply_to_anti_attractors(&self, anti_attractors: &mut AntiAttractorState) {
        self.kernel.apply_to_anti_attractors(anti_attractors);
        self.omega.apply_to_anti_attractors(anti_attractors);
        self.memory.apply_to_anti_attractors(anti_attractors);
        self.agents.apply_to_anti_attractors(anti_attractors);
        self.harmonic.apply_to_anti_attractors(anti_attractors);
        self.performance.apply_to_anti_attractors(anti_attractors);
    }
}

impl Default for CompleteFeedback {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_complete_feedback() {
        let feedback = CompleteFeedback::new();
        let mut attractors = AttractorState::default();
        let mut anti_attractors = AntiAttractorState::default();
        
        feedback.apply_to_attractors(&mut attractors);
        feedback.apply_to_anti_attractors(&mut anti_attractors);
        
        assert!(attractors.clarity >= 0.0 && attractors.clarity <= 1.0);
        assert!(anti_attractors.overload >= 0.0 && anti_attractors.overload <= 1.0);
    }
}
