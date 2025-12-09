// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Intégration bidirectionnelle Cognitive Gravity ↔ Performance Engine

#![allow(unused_imports)]
#![allow(dead_code)]

use crate::cognitive_gravity::{CognitiveGravityEngine, GravityField, AntiAttractor};
use crate::performance::PerformanceEngine;
use crate::utils::AppResult as TitaneResult;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Intégrateur Gravity ↔ Performance
pub struct GravityPerformanceIntegration {
    gravity_engine: Arc<CognitiveGravityEngine>,
    performance_engine: Arc<PerformanceEngine>,
    enabled: Arc<RwLock<bool>>,
}

impl GravityPerformanceIntegration {
    /// Crée une nouvelle intégration
    pub fn new(
        gravity_engine: Arc<CognitiveGravityEngine>,
        performance_engine: Arc<PerformanceEngine>,
    ) -> Self {
        Self {
            gravity_engine,
            performance_engine,
            enabled: Arc::new(RwLock::new(true)),
        }
    }
    
    /// Active/désactive l'intégration
    pub async fn set_enabled(&self, enabled: bool) {
        let mut flag = self.enabled.write().await;
        *flag = enabled;
    }
    
    /// Synchronisation Gravity → Performance (influence sur parallélisme)
    pub async fn sync_gravity_to_performance(&self) -> TitaneResult<()> {
        if !*self.enabled.read().await {
            return Ok(());
        }
        
        let anti_attractors = self.gravity_engine.get_anti_attractors().await;
        let field = self.gravity_engine.get_field().await;
        
        // 🔴 HIGH OVERLOAD → Log warning
        if anti_attractors.overload > 0.8 {
            log::warn!("🔴 High Overload detected ({:.2}) → Performance pressure", anti_attractors.overload);
        }
        // 🟢 LOW OVERLOAD + HIGH STABILITY → Log optimal state
        else if anti_attractors.overload < 0.3 && field.cognitive_mass > 0.7 {
            log::info!("🟢 Low Overload ({:.2}) + High Stability → Optimal performance", anti_attractors.overload);
        }
        // 🟡 MODERATE → Keep current parallelism
        else {
            log::debug!("🟡 Moderate load ({:.2}) → Normal performance", anti_attractors.overload);
        }
        
        // 📊 HIGH ENTROPY → Log warning
        if field.entropy > 0.7 {
            log::warn!("📊 High Entropy ({:.2}) → System complexity high", field.entropy);
        }
        
        Ok(())
    }
    
    /// Synchronisation Performance → Gravity (influence sur anti-attracteurs)
    pub async fn sync_performance_to_gravity(&self) -> TitaneResult<()> {
        if !*self.enabled.read().await {
            return Ok(());
        }
        
        let perf_diag = self.performance_engine.diagnostics().await;
        
        // Update Overload anti-attractor based on performance diagnostics
        let overload_score = Self::calculate_overload_score(&perf_diag);
        self.gravity_engine.set_anti_attractor(AntiAttractor::Overload, overload_score).await;
        
        log::debug!("Performance → Gravity: Overload = {:.2}", overload_score);
        
        Ok(())
    }
    
    /// Cycle de synchronisation bidirectionnel
    pub async fn sync_cycle(&self) -> TitaneResult<()> {
        // Phase 1: Performance → Gravity (update anti-attractors)
        self.sync_performance_to_gravity().await?;
        
        // Phase 2: Gravity → Performance (adjust parallelism)
        self.sync_gravity_to_performance().await?;
        
        Ok(())
    }
    
    /// Calcule le score d'overload depuis les diagnostics de performance
    fn calculate_overload_score(diag: &crate::performance::PerformanceDiagnostics) -> f32 {
        // Weighted average based on diagnostics
        // High submission rate + low completion = overload
        let submission_rate = (diag.metrics.tasks_submitted as f32).min(100.0) / 100.0;
        let completion_rate = if diag.metrics.tasks_submitted > 0 {
            (diag.metrics.tasks_completed as f32) / (diag.metrics.tasks_submitted as f32)
        } else {
            1.0
        };
        
        // Overload = high submissions + low completion rate
        let overload = (submission_rate * 0.6) + ((1.0 - completion_rate) * 0.4);
        overload.clamp(0.0, 1.0)
    }
    
    /// Démarre le cycle de synchronisation automatique
    pub async fn start_auto_sync(&self, interval_ms: u64) -> TitaneResult<()> {
        let integration = Arc::new(self.clone());
        
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(interval_ms));
            
            loop {
                interval.tick().await;
                
                if let Err(e) = integration.sync_cycle().await {
                    log::warn!("⚠️ Gravity-Performance sync error: {}", e);
                }
            }
        });
        
        log::info!("✅ Gravity-Performance auto-sync started ({}ms interval)", interval_ms);
        Ok(())
    }
}

impl Clone for GravityPerformanceIntegration {
    fn clone(&self) -> Self {
        Self {
            gravity_engine: self.gravity_engine.clone(),
            performance_engine: self.performance_engine.clone(),
            enabled: self.enabled.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cognitive_gravity::GravityConfig;
    use crate::performance::PerformanceConfig;
    
    #[tokio::test]
    async fn test_gravity_performance_integration() {
        use crate::performance::PerformanceConfig;
        
        let gravity = Arc::new(CognitiveGravityEngine::new(GravityConfig::default()));
        let performance = Arc::new(PerformanceEngine::new(PerformanceConfig::default()).unwrap());
        
        let integration = GravityPerformanceIntegration::new(gravity.clone(), performance.clone());
        
        // Initialize engines
        gravity.initialize().await.unwrap();
        performance.initialize().await.unwrap();
        
        // Run sync cycle
        integration.sync_cycle().await.unwrap();
        
        // Cleanup
        gravity.shutdown().await.unwrap();
        performance.shutdown().await.unwrap();
    }
    
    #[test]
    fn test_calculate_overload_score() {
        use crate::performance::{PerformanceDiagnostics, PerformanceMetrics};
        
        let mut diag = PerformanceDiagnostics::new();
        diag.metrics.tasks_submitted = 100;
        diag.metrics.tasks_completed = 80;
        
        let overload = GravityPerformanceIntegration::calculate_overload_score(&diag);
        
        assert!(overload >= 0.0 && overload <= 1.0);
        // Expected: (100/100 * 0.6) + ((1 - 0.8) * 0.4) = 0.6 + 0.08 = 0.68
        assert!((overload - 0.68).abs() < 0.01);
    }
}
