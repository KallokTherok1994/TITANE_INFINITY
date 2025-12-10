// ═══════════════════════════════════════════════════════════════
//   MULTIMODAL ENGINE — INTEGRATION TESTS
//   SUPER PROMPT #15 — PHASE 10 COMPLETE
//   End-to-end testing of multimodal capabilities
// ═══════════════════════════════════════════════════════════════

#![allow(unused_imports)]

use titane_infinity::agi_core::*;
use titane_infinity::memory_os::*;
use titane_infinity::multimodal::*;
use titane_infinity::omega::*;

// ═══════════════════════════════════════════════════════════════
//   TEST 1: Full Vision Pipeline
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_vision_pipeline_e2e() {
    // Create test image
    let img = image::ImageBuffer::from_fn(100, 100, |x, y| {
        image::Rgb([(x * 2) as u8, (y * 2) as u8, 128])
    });
    let dynamic_img = image::DynamicImage::ImageRgb8(img);
    let mut bytes = Vec::new();
    dynamic_img
        .write_to(
            &mut std::io::Cursor::new(&mut bytes),
            image::ImageFormat::Png,
        )
        .unwrap();

    // Initialize vision engine
    let config = MultimodalConfig::default();
    let vision_engine = VisionEngine::new(config.clone());

    // Analyze image
    let analysis = vision_engine.analyze_image_bytes(&bytes).await.unwrap();

    // Verify analysis
    assert_eq!(analysis.width, 100);
    assert_eq!(analysis.height, 100);
    assert_eq!(analysis.format, "PNG");
    assert!(analysis.brightness > 0.0);
    assert!(analysis.contrast > 0.0);
    assert!(!analysis.features.is_empty());
    assert!(!analysis.dominant_colors.is_empty());

    println!("✅ Vision pipeline test passed");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 2: Image Embeddings & Similarity Search
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_image_embeddings_and_search() {
    let config = MultimodalConfig::default();
    let vision_models = VisionModelManager::new(VisionModel::CLIP, true);
    let image_memory = ImageMemoryStore::new(100);

    // Create test images
    let create_image = |r: u8, g: u8, b: u8| -> Vec<u8> {
        let img = image::ImageBuffer::from_fn(50, 50, |_, _| image::Rgb([r, g, b]));
        let dynamic = image::DynamicImage::ImageRgb8(img);
        let mut bytes = Vec::new();
        dynamic
            .write_to(
                &mut std::io::Cursor::new(&mut bytes),
                image::ImageFormat::Png,
            )
            .unwrap();
        bytes
    };

    let red_img = create_image(255, 0, 0);
    let red_img2 = create_image(250, 5, 5); // Similar to red
    let blue_img = create_image(0, 0, 255);

    // Generate embeddings
    let red_emb = vision_models.embed_image(&red_img).await.unwrap();
    let red_emb2 = vision_models.embed_image(&red_img2).await.unwrap();
    let blue_emb = vision_models.embed_image(&blue_img).await.unwrap();

    // Store images
    let vision_engine = VisionEngine::new(config);

    let red_analysis = vision_engine.analyze_image_bytes(&red_img).await.unwrap();
    image_memory
        .store_image(ImageMemoryEntry {
            id: red_analysis.image_id.clone(),
            image_path: None,
            image_data: Some(red_img.clone()),
            embedding: red_emb.clone(),
            metadata: ImageMetadata {
                title: Some("Red Image".to_string()),
                description: None,
                tags: vec!["red".to_string()],
                width: 50,
                height: 50,
                format: "PNG".to_string(),
                source: "test".to_string(),
            },
            linked_text: vec![],
            timestamp: chrono::Utc::now().timestamp(),
            importance: 0.8,
        })
        .await
        .unwrap();

    let blue_analysis = vision_engine.analyze_image_bytes(&blue_img).await.unwrap();
    image_memory
        .store_image(ImageMemoryEntry {
            id: blue_analysis.image_id.clone(),
            image_path: None,
            image_data: Some(blue_img.clone()),
            embedding: blue_emb.clone(),
            metadata: ImageMetadata {
                title: Some("Blue Image".to_string()),
                description: None,
                tags: vec!["blue".to_string()],
                width: 50,
                height: 50,
                format: "PNG".to_string(),
                source: "test".to_string(),
            },
            linked_text: vec![],
            timestamp: chrono::Utc::now().timestamp(),
            importance: 0.7,
        })
        .await
        .unwrap();

    // Search with similar red image
    let results = image_memory
        .search_by_image_embedding(&red_emb2, 2)
        .await
        .unwrap();
    assert_eq!(results.len(), 2);

    // First result should be red (most similar)
    assert_eq!(results[0].metadata.tags[0], "red");

    println!("✅ Image embeddings & search test passed");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 3: Cross-Modal Search (Text → Image)
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_cross_modal_search() {
    let config = MultimodalConfig::default();
    let vision_models = VisionModelManager::new(VisionModel::CLIP, true);
    let image_memory = ImageMemoryStore::new(100);
    let vision_engine = VisionEngine::new(config);

    // Create and store test image
    let img = image::ImageBuffer::from_fn(50, 50, |_, _| image::Rgb([200, 200, 200]));
    let dynamic = image::DynamicImage::ImageRgb8(img);
    let mut bytes = Vec::new();
    dynamic
        .write_to(
            &mut std::io::Cursor::new(&mut bytes),
            image::ImageFormat::Png,
        )
        .unwrap();

    let img_emb = vision_models.embed_image(&bytes).await.unwrap();
    let analysis = vision_engine.analyze_image_bytes(&bytes).await.unwrap();

    image_memory
        .store_image(ImageMemoryEntry {
            id: analysis.image_id.clone(),
            image_path: None,
            image_data: Some(bytes),
            embedding: img_emb,
            metadata: ImageMetadata {
                title: Some("Gray Test Image".to_string()),
                description: Some("A test image for cross-modal search".to_string()),
                tags: vec!["gray".to_string(), "test".to_string()],
                width: 50,
                height: 50,
                format: "PNG".to_string(),
                source: "test".to_string(),
            },
            linked_text: vec!["This is a gray image".to_string()],
            timestamp: chrono::Utc::now().timestamp(),
            importance: 0.9,
        })
        .await
        .unwrap();

    // Perform cross-modal search
    let query = "gray image";
    let text_emb = vision_models.embed_text(query).await.unwrap();
    let results = image_memory
        .search_cross_modal(query, &text_emb, 5)
        .await
        .unwrap();

    assert!(!results.is_empty());
    assert!(results[0].metadata.tags.contains(&"gray".to_string()));

    println!("✅ Cross-modal search test passed");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 4: Audio 3D Analysis
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_audio_3d_analysis() {
    let audio_engine = Audio3DEngine::new(44100, 1024);

    // Generate test audio frame (sine wave)
    let sample_rate = 44100.0;
    let frequency = 440.0; // A4 note
    let samples: Vec<f32> = (0..1024)
        .map(|i| {
            let t = i as f32 / sample_rate;
            (2.0 * std::f32::consts::PI * frequency * t).sin() * 0.5
        })
        .collect();

    // Analyze
    let analysis = audio_engine.analyze_audio_frame(&samples).await.unwrap();

    assert!(analysis.intensity > 0.0);
    assert_eq!(analysis.frequency_bands.len(), 5);
    assert!(analysis.frequency_bands.iter().any(|&x| x > 0.0));

    println!("✅ Audio 3D analysis test passed");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 5: Multimodal Fusion
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_multimodal_fusion() {
    let config = MultimodalConfig::default();
    let vision_engine = std::sync::Arc::new(VisionEngine::new(config.clone()));
    let audio_engine = std::sync::Arc::new(Audio3DEngine::new(44100, 1024));
    let image_memory = std::sync::Arc::new(ImageMemoryStore::new(100));

    let fusion_engine =
        MultimodalFusionEngine::new(vision_engine.clone(), audio_engine.clone(), image_memory);

    // Create test data
    let img = image::ImageBuffer::from_fn(50, 50, |_, _| image::Rgb([150, 150, 150]));
    let dynamic = image::DynamicImage::ImageRgb8(img);
    let mut img_bytes = Vec::new();
    dynamic
        .write_to(
            &mut std::io::Cursor::new(&mut img_bytes),
            image::ImageFormat::Png,
        )
        .unwrap();

    let audio_samples: Vec<f32> = (0..1024).map(|i| (i as f32 / 1024.0).sin()).collect();

    // Build context
    let context = fusion_engine
        .build_context(
            Some("test query".to_string()),
            Some(img_bytes),
            Some(audio_samples),
        )
        .await
        .unwrap();

    assert!(context.text.is_some());
    assert!(context.vision_analysis.is_some());
    assert!(context.audio3d_analysis.is_some());

    // Fuse signals
    let fusion_result = fusion_engine
        .fuse_signals(&context, 0.5, 0.3, 0.2)
        .await
        .unwrap();

    assert!(fusion_result.confidence >= 0.0 && fusion_result.confidence <= 1.0);
    assert!(!fusion_result.modality_weights.is_empty());

    println!("✅ Multimodal fusion test passed");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 6: OMEGA Multimodal Integration
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_omega_multimodal_integration() {
    let config = MultimodalConfig::default();
    let processor = OmegaMultimodalProcessor::new(config);

    // Create test image
    let img = image::ImageBuffer::from_fn(50, 50, |_, _| image::Rgb([180, 180, 180]));
    let dynamic = image::DynamicImage::ImageRgb8(img);
    let mut img_bytes = Vec::new();
    dynamic
        .write_to(
            &mut std::io::Cursor::new(&mut img_bytes),
            image::ImageFormat::Png,
        )
        .unwrap();

    // Create OMEGA input
    let input = PipelineInput::new("analyze this image");
    let mut multimodal_ctx = OmegaMultimodalContext::default();
    multimodal_ctx.image = Some(img_bytes);

    // Process
    let result = processor.process_multimodal(&input, &multimodal_ctx).await;
    assert!(result.is_ok());

    let processed = result.unwrap();
    assert!(processed.vision_analysis.is_some());
    assert!(processed.fusion_result.is_some());

    println!("✅ OMEGA multimodal integration test passed");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 7: Memory OS Multimodal Store
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_memory_os_multimodal() {
    let store = MultimodalMemoryStore::new(10, 50, 1000);

    // Create base memory entry
    let base = MemoryEntry::new(
        "Test multimodal memory".to_string(),
        0.8,
        MemoryType::Factual,
    );

    // Create multimodal entry with image
    let img = image::ImageBuffer::from_fn(50, 50, |_, _| image::Rgb([100, 100, 100]));
    let dynamic = image::DynamicImage::ImageRgb8(img);
    let mut img_bytes = Vec::new();
    dynamic
        .write_to(
            &mut std::io::Cursor::new(&mut img_bytes),
            image::ImageFormat::Png,
        )
        .unwrap();

    let multimodal_entry = MultimodalMemoryEntry::from_base(base)
        .with_image(img_bytes, "test_img_001".to_string())
        .with_joint_embedding(
            vec![0.1; 512],
            ModalityWeights {
                text: 0.5,
                vision: 0.3,
                audio: 0.2,
            },
        );

    assert!(multimodal_entry.has_multimodal());

    // Store
    let id = store.store(multimodal_entry.clone()).await.unwrap();

    // Retrieve
    let retrieved = store.get(&id).await;
    assert!(retrieved.is_some());
    assert!(retrieved.unwrap().has_multimodal());

    // Stats
    let stats = store.stats().await;
    assert_eq!(stats.total_entries, 1);
    assert_eq!(stats.with_image, 1);
    assert_eq!(stats.with_joint_embedding, 1);

    println!("✅ Memory OS multimodal test passed");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 8: AGI Core Multimodal Perception
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_agi_multimodal_perception() {
    let perception_engine = MultimodalPerceptionEngine::new(true, true, 0.7);

    // Create multimodal AGI context
    let base = AGIContext::default();
    let vision = VisionAnalysis {
        image_id: "test_vision_001".to_string(),
        width: 640,
        height: 480,
        format: "PNG".to_string(),
        brightness: 0.8,
        contrast: 0.7,
        features: vec![0.1; 100],
        dominant_colors: vec![(200, 200, 200)],
        clusters: vec![],
    };

    let audio = Audio3DAnalysis {
        intensity: 0.75,
        frequency_bands: vec![0.1, 0.2, 0.3, 0.4, 0.5],
        spatial_position: Some(SpatialPosition {
            azimuth: 30.0,
            elevation: 10.0,
            distance: 3.0,
        }),
        is_speech: false,
    };

    let context = MultimodalAGIContext::from_base(base)
        .with_vision(vision)
        .with_audio(audio);

    assert!(context.is_multimodal());
    assert!(context.perceptual_confidence > 0.0);

    // Perform introspection
    let introspection = perception_engine.introspect(&context).await;
    assert!(introspection.has_vision);
    assert!(introspection.has_audio);
    assert!(introspection.perceptual_quality > 0.0);
    assert!(!introspection.insights.is_empty());

    // Enhance reasoning
    let enhanced = perception_engine
        .enhance_reasoning(&context, "What do you perceive?")
        .await
        .unwrap();
    assert!(enhanced.contains("VISUAL CONTEXT"));
    assert!(enhanced.contains("AUDIO CONTEXT"));

    println!("✅ AGI multimodal perception test passed");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 9: Full End-to-End Workflow
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_full_e2e_workflow() {
    println!("\n🚀 Running full end-to-end workflow test...\n");

    // 1. Initialize all systems
    let config = MultimodalConfig::default();
    let vision_engine = std::sync::Arc::new(VisionEngine::new(config.clone()));
    let vision_models = std::sync::Arc::new(tokio::sync::RwLock::new(VisionModelManager::new(
        VisionModel::CLIP,
        true,
    )));
    let audio_engine = std::sync::Arc::new(Audio3DEngine::new(44100, 1024));
    let image_memory = std::sync::Arc::new(ImageMemoryStore::new(1000));
    let fusion_engine = std::sync::Arc::new(MultimodalFusionEngine::new(
        vision_engine.clone(),
        audio_engine.clone(),
        image_memory.clone(),
    ));

    // 2. Create test image
    let img = image::ImageBuffer::from_fn(100, 100, |x, y| {
        image::Rgb([(x * 2) as u8, (y * 2) as u8, 150])
    });
    let dynamic = image::DynamicImage::ImageRgb8(img);
    let mut img_bytes = Vec::new();
    dynamic
        .write_to(
            &mut std::io::Cursor::new(&mut img_bytes),
            image::ImageFormat::Png,
        )
        .unwrap();

    // 3. Analyze image
    let vision_analysis = vision_engine.analyze_image_bytes(&img_bytes).await.unwrap();
    println!(
        "   ✓ Image analyzed: {}x{}",
        vision_analysis.width, vision_analysis.height
    );

    // 4. Generate embedding
    let models = vision_models.read().await;
    let img_embedding = models.embed_image(&img_bytes).await.unwrap();
    println!(
        "   ✓ Embedding generated: {} dimensions",
        img_embedding.len()
    );
    drop(models);

    // 5. Store in memory
    image_memory
        .store_image(ImageMemoryEntry {
            id: vision_analysis.image_id.clone(),
            image_path: None,
            image_data: Some(img_bytes.clone()),
            embedding: img_embedding,
            metadata: ImageMetadata {
                title: Some("E2E Test Image".to_string()),
                description: Some("Full workflow test".to_string()),
                tags: vec!["test".to_string(), "e2e".to_string()],
                width: vision_analysis.width,
                height: vision_analysis.height,
                format: vision_analysis.format.clone(),
                source: "integration_test".to_string(),
            },
            linked_text: vec!["Full end-to-end workflow test".to_string()],
            timestamp: chrono::Utc::now().timestamp(),
            importance: 0.95,
        })
        .await
        .unwrap();
    println!("   ✓ Image stored in memory");

    // 6. Perform cross-modal search
    let models = vision_models.read().await;
    let text_emb = models.embed_text("test image").await.unwrap();
    drop(models);

    let search_results = image_memory
        .search_cross_modal("test image", &text_emb, 5)
        .await
        .unwrap();
    println!(
        "   ✓ Cross-modal search found {} results",
        search_results.len()
    );

    // 7. Audio analysis
    let audio_samples: Vec<f32> = (0..1024)
        .map(|i| (2.0 * std::f32::consts::PI * 440.0 * (i as f32 / 44100.0)).sin() * 0.5)
        .collect();
    let audio_analysis = audio_engine
        .analyze_audio_frame(&audio_samples)
        .await
        .unwrap();
    println!(
        "   ✓ Audio analyzed: intensity={:.2}",
        audio_analysis.intensity
    );

    // 8. Multimodal fusion
    let context = fusion_engine
        .build_context(
            Some("comprehensive test".to_string()),
            Some(img_bytes.clone()),
            Some(audio_samples),
        )
        .await
        .unwrap();
    let fusion = fusion_engine
        .fuse_signals(&context, 0.4, 0.4, 0.2)
        .await
        .unwrap();
    println!(
        "   ✓ Fusion complete: confidence={:.2}, dominant={:?}",
        fusion.confidence, fusion.dominant_modality
    );

    // 9. Memory OS integration
    let multimodal_store = MultimodalMemoryStore::new(20, 200, 5000);
    let base_memory = MemoryEntry::new(
        "Full workflow test memory".to_string(),
        0.9,
        MemoryType::Episodic,
    )
    .with_embedding(vec![0.5; 384]);

    let multimodal_memory = MultimodalMemoryEntry::from_base(base_memory)
        .with_image(img_bytes, vision_analysis.image_id.clone())
        .with_audio(
            vec![0.5; 1024],
            AudioMetadata {
                sample_rate: 44100,
                duration_ms: 1000,
                intensity: audio_analysis.intensity,
                frequency_bands: audio_analysis.frequency_bands.clone(),
            },
        )
        .with_joint_embedding(
            vec![0.7; 512],
            ModalityWeights {
                text: 0.4,
                vision: 0.4,
                audio: 0.2,
            },
        );

    multimodal_store.store(multimodal_memory).await.unwrap();
    let mm_stats = multimodal_store.stats().await;
    println!(
        "   ✓ Multimodal memory stored: {} entries",
        mm_stats.total_entries
    );

    // 10. AGI Core perception
    let perception_engine = MultimodalPerceptionEngine::new(true, true, 0.7);
    let agi_context = MultimodalAGIContext::from_base(AGIContext::default())
        .with_vision(vision_analysis)
        .with_audio(audio_analysis)
        .with_fusion(fusion);

    let introspection = perception_engine.introspect(&agi_context).await;
    println!(
        "   ✓ AGI perception: quality={:.2}, {} insights",
        introspection.perceptual_quality,
        introspection.insights.len()
    );

    // Final verification
    assert!(mm_stats.total_entries > 0);
    assert!(introspection.has_vision);
    assert!(introspection.has_audio);
    assert!(!search_results.is_empty());

    println!("\n✅ Full end-to-end workflow test PASSED\n");
}

// ═══════════════════════════════════════════════════════════════
//   TEST 10: Performance Benchmarks
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_performance_benchmarks() {
    use std::time::Instant;

    let config = MultimodalConfig::default();
    let vision_engine = VisionEngine::new(config.clone());
    let vision_models = VisionModelManager::new(VisionModel::CLIP, true);

    // Create test image
    let img = image::ImageBuffer::from_fn(224, 224, |x, y| {
        image::Rgb([(x % 256) as u8, (y % 256) as u8, 128])
    });
    let dynamic = image::DynamicImage::ImageRgb8(img);
    let mut bytes = Vec::new();
    dynamic
        .write_to(
            &mut std::io::Cursor::new(&mut bytes),
            image::ImageFormat::Png,
        )
        .unwrap();

    // Benchmark vision analysis
    let start = Instant::now();
    let _ = vision_engine.analyze_image_bytes(&bytes).await.unwrap();
    let vision_time = start.elapsed();
    println!("   Vision analysis: {:?}", vision_time);

    // Benchmark embedding generation
    let start = Instant::now();
    let _ = vision_models.embed_image(&bytes).await.unwrap();
    let embed_time = start.elapsed();
    println!("   Embedding generation: {:?}", embed_time);

    // Benchmark text embedding
    let start = Instant::now();
    let _ = vision_models.embed_text("test query").await.unwrap();
    let text_embed_time = start.elapsed();
    println!("   Text embedding: {:?}", text_embed_time);

    // Performance targets (should be fast with stub implementations)
    assert!(vision_time.as_millis() < 1000, "Vision analysis too slow");
    assert!(embed_time.as_millis() < 500, "Image embedding too slow");
    assert!(text_embed_time.as_millis() < 100, "Text embedding too slow");

    println!("✅ Performance benchmarks passed");
}
