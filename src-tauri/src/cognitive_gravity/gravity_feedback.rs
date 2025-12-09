// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Feedback loop gravitationnel

#![allow(unused_imports)]
#![allow(dead_code)]

use super::gravity_field::GravityField;
use super::attractors::AttractorState;
use super::anti_attractors::AntiAttractorState;
use super::feedback_collectors::CompleteFeedback;
use super::real_feedback_collector::RealFeedbackCollector;
use crate::utils::AppResult as TitaneResult;

#[derive(Clone)]
pub struct GravityFeedbackLoop {
    last_feedback: Option<CompleteFeedback>,
}

impl GravityFeedbackLoop {
    pub fn new() -> Self {
        Self {
            last_feedback: None,
        }
    }
    
    /// Collecte le feedback depuis tous les moteurs
    pub async fn collect_feedback(&mut self) -> TitaneResult<CompleteFeedback> {
        // ✅ Phase 4+: Collect real feedback from actual engines
        let kernel = RealFeedbackCollector::collect_kernel_feedback().await?;
        let omega = RealFeedbackCollector::collect_omega_feedback().await?;
        let memory = RealFeedbackCollector::collect_memory_feedback().await?;
        let agents = RealFeedbackCollector::collect_agents_feedback().await?;
        let harmonic = RealFeedbackCollector::collect_harmonic_feedback().await?;
        let performance = RealFeedbackCollector::collect_performance_feedback().await?;
        
        let feedback = CompleteFeedback {
            kernel,
            omega,
            memory,
            agents,
            harmonic,
            performance,
            timestamp: chrono::Utc::now().timestamp(),
        };
        
        self.last_feedback = Some(feedback.clone());
        Ok(feedback)
    }
    
    /// Met à jour les attracteurs depuis le feedback collecté
    pub fn update_attractors_from_feedback(
        &self,
        attractors: &mut AttractorState,
        feedback: &CompleteFeedback,
    ) {
        feedback.apply_to_attractors(attractors);
    }
    
    /// Met à jour les anti-attracteurs depuis le feedback collecté
    pub fn update_anti_attractors_from_feedback(
        &self,
        anti_attractors: &mut AntiAttractorState,
        feedback: &CompleteFeedback,
    ) {
        feedback.apply_to_anti_attractors(anti_attractors);
    }
    
    /// Cycle complet de feedback
    pub async fn feedback_cycle(
        &mut self,
        attractors: &mut AttractorState,
        anti_attractors: &mut AntiAttractorState,
    ) -> TitaneResult<()> {
        // 1. Collect feedback from all engines
        let feedback = self.collect_feedback().await?;
        
        // 2. Update attractors
        self.update_attractors_from_feedback(attractors, &feedback);
        
        // 3. Update anti-attractors
        self.update_anti_attractors_from_feedback(anti_attractors, &feedback);
        
        Ok(())
    }
    
    pub fn get_last_feedback(&self) -> Option<&CompleteFeedback> {
        self.last_feedback.as_ref()
    }
}

impl Default for GravityFeedbackLoop {
    fn default() -> Self {
        Self::new()
    }
}
