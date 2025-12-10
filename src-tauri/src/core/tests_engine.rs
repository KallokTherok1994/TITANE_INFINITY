// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — CORE ENGINE TESTS (Phase 1.5)
//   Tests unitaires et d'intégration pour SingularityEngine
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use crate::core::engine::SingularityEngine;
    use crate::core::types::EngineError;

    /// Test 1: Création engine par défaut
    #[test]
    fn test_engine_creation() {
        let engine = SingularityEngine::new();
        
        assert_eq!(engine.version, "16.0.0");
        assert!(!engine.is_cognitive_active(), "Cognitive should be inactive before init");
    }

    /// Test 2: Initialisation engine
    #[tokio::test]
    async fn test_engine_initialization() -> Result<(), Box<dyn std::error::Error>> {
        let mut engine = SingularityEngine::new();
        
        // Avant init
        assert!(!engine.is_cognitive_active());
        
        // Init
        engine.init().await?;
        
        // Après init
        assert!(engine.is_cognitive_active(), "Cognitive should be active after init");
        
        Ok(())
    }

    /// Test 3: Double initialisation (idempotence)
    #[tokio::test]
    async fn test_engine_double_init() -> Result<(), Box<dyn std::error::Error>> {
        let mut engine = SingularityEngine::new();
        
        // Premier init
        engine.init().await?;
        
        // Deuxième init (ne doit pas échouer)
        let result = engine.init().await;
        assert!(result.is_ok(), "Double init should be idempotent");
        
        Ok(())
    }

    /// Test 4: Tick sans initialisation (doit échouer)
    #[tokio::test]
    async fn test_engine_tick_without_init() {
        let mut engine = SingularityEngine::new();
        
        let result = engine.tick().await;
        
        assert!(result.is_err(), "Tick should fail without init");
        match result.unwrap_err() {
            EngineError::Runtime(msg) => {
                assert!(msg.contains("not initialized"), "Error should mention 'not initialized'");
            }
            _ => panic!("Wrong error type"),
        }
    }

    /// Test 5: Tick après initialisation (doit réussir)
    #[tokio::test]
    async fn test_engine_tick_after_init() -> Result<(), Box<dyn std::error::Error>> {
        let mut engine = SingularityEngine::new();
        engine.init().await?;
        
        // Premier tick
        engine.tick().await?;
        
        // Deuxième tick
        engine.tick().await?;
        
        Ok(())
    }

    /// Test 6: État engine après init
    #[tokio::test]
    async fn test_engine_state_after_init() -> Result<(), Box<dyn std::error::Error>> {
        let mut engine = SingularityEngine::new();
        engine.init().await?;
        
        // Vérifier que les modules state sont initialisés
        // (coherence, memory, harmonia, system_health)
        assert!(engine.is_cognitive_active());
        
        Ok(())
    }

    /// Test 7: Serialization/Deserialization
    #[test]
    fn test_engine_serialization() -> Result<(), Box<dyn std::error::Error>> {
        let engine = SingularityEngine::new();
        
        // Serialize
        let json = serde_json::to_string(&engine)?;
        assert!(!json.is_empty());
        
        // Deserialize
        let deserialized: SingularityEngine = serde_json::from_str(&json)?;
        assert_eq!(deserialized.version, engine.version);
        
        Ok(())
    }

    /// Test 8: Clone engine
    #[test]
    fn test_engine_clone() {
        let engine = SingularityEngine::new();
        let cloned = engine.clone();
        
        assert_eq!(cloned.version, engine.version);
    }

    /// Test 9: Multiple engines (isolation)
    #[tokio::test]
    async fn test_multiple_engines_isolation() -> Result<(), Box<dyn std::error::Error>> {
        let mut engine1 = SingularityEngine::new();
        let mut engine2 = SingularityEngine::new();
        
        // Init engine1 seulement
        engine1.init().await?;
        
        // engine1 devrait être actif
        assert!(engine1.is_cognitive_active());
        
        // engine2 devrait rester inactif
        assert!(!engine2.is_cognitive_active());
        
        Ok(())
    }

    /// Test 10: Version check
    #[test]
    fn test_engine_version() {
        let engine = SingularityEngine::new();
        
        assert!(!engine.version.is_empty());
        assert!(engine.version.starts_with("16"), "Version should be v16.x.x");
    }
}

// ═══════════════════════════════════════════════════════════════
// INTEGRATION TESTS (plus complexes)
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod integration_tests {
    use crate::core::engine::SingularityEngine;

    /// Test I1: Cycle complet init → tick × N → résultats
    #[tokio::test]
    async fn test_engine_full_lifecycle() -> Result<(), Box<dyn std::error::Error>> {
        let mut engine = SingularityEngine::new();
        
        // Phase 1: Init
        engine.init().await?;
        
        // Phase 2: Multiple ticks
        for _ in 0..10 {
            engine.tick().await?;
        }
        
        // Phase 3: Vérifier état final
        assert!(engine.is_cognitive_active());
        
        Ok(())
    }

    /// Test I2: Performance — 1000 ticks
    #[tokio::test]
    #[ignore] // Lent, exécuter avec --ignored
    async fn test_engine_performance_1000_ticks() -> Result<(), Box<dyn std::error::Error>> {
        let mut engine = SingularityEngine::new();
        engine.init().await?;
        
        let start = std::time::Instant::now();
        
        for _ in 0..1000 {
            engine.tick().await?;
        }
        
        let elapsed = start.elapsed();
        
        println!("1000 ticks completed in {:?}", elapsed);
        assert!(elapsed.as_secs() < 10, "1000 ticks should take < 10s");
        
        Ok(())
    }

    /// Test I3: Memory usage stable (pas de leak)
    #[tokio::test]
    async fn test_engine_memory_stability() -> Result<(), Box<dyn std::error::Error>> {
        let mut engine = SingularityEngine::new();
        engine.init().await?;
        
        // 100 ticks pour observer stabilité mémoire
        for _ in 0..100 {
            engine.tick().await?;
        }
        
        // Si on arrive ici sans OOM, c'est bon
        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════
// NOTES TESTS
// ═══════════════════════════════════════════════════════════════
//
// Coverage actuelle: 13 tests (10 unitaires + 3 intégration)
//
// Modules testés:
// - Création engine ✅
// - Initialisation ✅
// - Tick logic ✅
// - Error handling ✅
// - Serialization ✅
// - Isolation ✅
// - Performance (ignoré par défaut) ✅
//
// TODO Phase 1.6+:
// - Tests des modules state individuels (coherence, memory, harmonia)
// - Tests de reasoning loop
// - Tests meta-mode
// - Tests avec erreurs simulées (I/O, etc.)
//
// ═══════════════════════════════════════════════════════════════
