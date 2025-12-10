// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — PHASE 1 STABILISATION: OMEGA PIPELINE TESTS
//   Tests complets pour omega/pipeline.rs
//   Pattern moderne: Result<(), Box<dyn Error>> + ? operator
// ═══════════════════════════════════════════════════════════════

use std::error::Error;
use super::*;
use super::pipeline::OmegaPipeline;

// ═══════════════════════════════════════════════════════════════
//   TESTS UNITAIRES — CRÉATION & CONFIGURATION
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_pipeline_creation() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test de création basique
    let pipeline = OmegaPipeline::default();
    
    assert!(pipeline.config().timeout_ms > 0);
    assert!(pipeline.config().max_parallel_tasks > 0);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_with_custom_config() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test avec configuration personnalisée
    let config = OmegaConfig {
        timeout_ms: 5000,
        max_parallel_tasks: 10,
        safety_level: 0.8,
        enable_cache: true,
        parallel_execution: true,
        cache_ttl_secs: 300,
        enable_diagnostics: false,
        target_latency_ms: 1000,
    };
    
    let pipeline = OmegaPipeline::new(config.clone());
    
    assert_eq!(pipeline.config().timeout_ms, 5000);
    assert_eq!(pipeline.config().max_parallel_tasks, 10);
    assert_eq!(pipeline.config().safety_level, 0.8);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_builder() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test du builder pattern
    let pipeline = pipeline::OmegaPipelineBuilder::new()
        .timeout_ms(8000)
        .build();
    
    assert_eq!(pipeline.config().timeout_ms, 8000);
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   TESTS UNITAIRES — INITIALISATION
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_pipeline_initialization() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test d'initialisation
    let pipeline = OmegaPipeline::default();
    
    pipeline.initialize().await?;
    
    let health = pipeline.health_check().await;
    assert!(health.initialized);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_double_initialization() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Double init doit être safe (idempotent)
    let pipeline = OmegaPipeline::default();
    
    pipeline.initialize().await?;
    pipeline.initialize().await?; // Ne doit pas échouer
    
    let health = pipeline.health_check().await;
    assert!(health.initialized);
    
    Ok(())
}

#[tokio::test]
async fn test_process_without_initialization() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Process avant init doit échouer proprement
    let pipeline = OmegaPipeline::default();
    
    let input = PipelineInput::new("test");
    let result = pipeline.process(input).await;
    
    assert!(result.is_err());
    if let Err(OmegaError::NotInitialized) = result {
        // Erreur attendue
    } else {
        panic!("Expected NotInitialized error");
    }
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   TESTS UNITAIRES — TRAITEMENT BASIQUE
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_pipeline_basic_process() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test de traitement basique
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let input = PipelineInput::new("Bonjour TITANE");
    let output = pipeline.process(input).await?;
    
    assert!(!output.response.is_empty());
    assert!(output.total_latency_ms > 0);
    assert!(output.success);
    assert!(output.error.is_none());
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_quick_process() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test de quick_process
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let response = pipeline.quick_process("Test rapide").await?;
    
    assert!(!response.is_empty());
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_input_with_context() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test avec contexte
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let input = PipelineInput::new("Question de suivi")
        .with_context(vec![
            "User: Première question".to_string(),
            "AI: Première réponse".to_string(),
        ]);
    
    let output = pipeline.process(input).await?;
    
    assert!(output.success);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_input_with_priority() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test avec priorité
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let input = PipelineInput::new("Question urgente")
        .with_priority(10);
    
    assert_eq!(input.priority, 10);
    
    let output = pipeline.process(input).await?;
    
    assert!(output.success);
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   TESTS UNITAIRES — MÉTADONNÉES & TIMINGS
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_pipeline_output_metadata() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Validation des métadonnées
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let input = PipelineInput::new("Question test");
    let output = pipeline.process(input).await?;
    
    // Métadonnées doivent être présentes
    assert!(!output.metadata.intent.is_empty());
    assert!(output.metadata.confidence >= 0.0 && output.metadata.confidence <= 1.0);
    assert!(!output.metadata.mode.is_empty());
    assert!(output.metadata.safety_score >= 0.0 && output.metadata.safety_score <= 1.0);
    assert!(!output.metadata.model.is_empty());
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_timings() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Validation des timings
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let input = PipelineInput::new("Test timing");
    let output = pipeline.process(input).await?;
    
    // Timings doivent être présents pour chaque stage
    assert!(output.timings.contains_key("router"));
    assert!(output.timings.contains_key("executor"));
    assert!(output.timings.contains_key("merger"));
    assert!(output.timings.contains_key("guardrails"));
    assert!(output.timings.contains_key("total"));
    
    // Chaque timing doit être > 0
    for (stage, ms) in &output.timings {
        assert!(*ms > 0, "Stage {} has timing = 0", stage);
    }
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_request_id_preservation() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Request ID doit être préservé
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let input = PipelineInput::new("Test request ID");
    let request_id = input.request_id.clone();
    
    let output = pipeline.process(input).await?;
    
    assert_eq!(output.request_id, request_id);
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   TESTS UNITAIRES — SANTÉ & STATISTIQUES
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_pipeline_health_check() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Health check
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let health = pipeline.health_check().await;
    
    assert!(health.initialized);
    assert!(health.health_score >= 0.0 && health.health_score <= 1.0);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_stats_tracking() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Statistiques
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    // Process quelques requêtes
    for i in 0..3 {
        let input = PipelineInput::new(format!("Test {}", i));
        pipeline.process(input).await?;
    }
    
    let health = pipeline.health_check().await;
    assert_eq!(health.requests_processed, 3);
    
    let stats = pipeline.get_stats().await;
    assert!(stats.total_requests >= 3);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_shutdown() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Shutdown propre
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    pipeline.shutdown().await;
    
    let health = pipeline.health_check().await;
    assert!(!health.running);
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   TESTS INTÉGRATION — SCÉNARIOS COMPLEXES
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_pipeline_full_lifecycle() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Lifecycle complet
    let pipeline = OmegaPipeline::default();
    
    // 1. Initialize
    pipeline.initialize().await?;
    
    // 2. Process multiple requests
    let mut request_ids = Vec::new();
    for i in 0..5 {
        let input = PipelineInput::new(format!("Request {}", i));
        request_ids.push(input.request_id.clone());
        let output = pipeline.process(input).await?;
        assert!(output.success);
    }
    
    // 3. Check health
    let health = pipeline.health_check().await;
    assert!(health.initialized);
    assert_eq!(health.requests_processed, 5);
    
    // 4. Shutdown
    pipeline.shutdown().await;
    let health = pipeline.health_check().await;
    assert!(!health.running);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_concurrent_requests() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Requêtes concurrentes
    let pipeline = std::sync::Arc::new(OmegaPipeline::default());
    pipeline.initialize().await?;
    
    let mut handles = vec![];
    
    for i in 0..5 {
        let pipeline_clone = pipeline.clone();
        let handle = tokio::spawn(async move {
            let input = PipelineInput::new(format!("Concurrent request {}", i));
            pipeline_clone.process(input).await
        });
        handles.push(handle);
    }
    
    // Attendre toutes les requêtes
    for handle in handles {
        let result = handle.await?;
        assert!(result.is_ok(), "Concurrent request failed");
    }
    
    let health = pipeline.health_check().await;
    assert_eq!(health.requests_processed, 5);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_empty_input() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Input vide doit être géré
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let input = PipelineInput::new("");
    let output = pipeline.process(input).await?;
    
    // Doit réussir même avec input vide
    assert!(output.success);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_very_long_input() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Input très long
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let long_text = "A".repeat(10000);
    let input = PipelineInput::new(long_text);
    let output = pipeline.process(input).await?;
    
    assert!(output.success);
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_special_characters() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Caractères spéciaux
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let special_text = "Test with émojis 🚀💡 and symbols !@#$%^&*()";
    let input = PipelineInput::new(special_text);
    let output = pipeline.process(input).await?;
    
    assert!(output.success);
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   TESTS INTÉGRATION — TIMEOUT & ERREURS
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_pipeline_timeout_configuration() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Configuration timeout
    let config = OmegaConfig {
        timeout_ms: 100, // Timeout très court
        ..Default::default()
    };
    
    let pipeline = OmegaPipeline::new(config);
    pipeline.initialize().await?;
    
    // Avec un timeout de 100ms, peut échouer ou réussir rapidement
    let input = PipelineInput::new("Test timeout");
    let result = pipeline.process(input).await;
    
    // On accepte les deux résultats (succès rapide ou timeout)
    match result {
        Ok(output) => assert!(output.total_latency_ms <= 150),
        Err(OmegaError::Timeout(_)) => {}, // Timeout attendu
        Err(e) => panic!("Unexpected error: {:?}", e),
    }
    
    Ok(())
}

#[tokio::test]
async fn test_pipeline_multiple_errors_recovery() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Recovery après erreurs
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    // Tenter plusieurs requêtes même après erreurs potentielles
    for i in 0..3 {
        let input = PipelineInput::new(format!("Recovery test {}", i));
        let _ = pipeline.process(input).await; // Ignorer erreurs
    }
    
    // Pipeline doit rester fonctionnel
    let health = pipeline.health_check().await;
    assert!(health.initialized);
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   TESTS PERFORMANCE (IGNORÉS PAR DÉFAUT)
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
#[ignore]
async fn test_pipeline_performance_100_requests() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Test performance 100 requêtes
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    let start = std::time::Instant::now();
    
    for i in 0..100 {
        let input = PipelineInput::new(format!("Performance test {}", i));
        pipeline.process(input).await?;
    }
    
    let elapsed = start.elapsed();
    println!("100 requests processed in {:?}", elapsed);
    
    let health = pipeline.health_check().await;
    assert_eq!(health.requests_processed, 100);
    
    Ok(())
}

#[tokio::test]
#[ignore]
async fn test_pipeline_memory_stability() -> Result<(), Box<dyn Error>> {
    // Phase 1 Stabilisation: Stabilité mémoire sur 50 requêtes
    let pipeline = OmegaPipeline::default();
    pipeline.initialize().await?;
    
    for i in 0..50 {
        let input = PipelineInput::new(format!("Memory test {}", i));
        let output = pipeline.process(input).await?;
        assert!(output.success);
        
        // Drop output pour libérer mémoire
        drop(output);
    }
    
    let health = pipeline.health_check().await;
    assert_eq!(health.requests_processed, 50);
    
    Ok(())
}
