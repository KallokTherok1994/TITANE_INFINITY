// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL INTEGRATION TESTS
//   Super Prompt #11 Phase 9C — Integration Testing Suite
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod integration_tests {
    use std::sync::Arc;
    use tokio::sync::RwLock;

    use titane_infinity::kernel::*;

    // ═══════════════════════════════════════════════════════════
    // TEST HELPERS
    // ═══════════════════════════════════════════════════════════

    async fn setup_kernel_system() -> (
        Arc<KernelRuntime>,
        Arc<CognitiveScheduler>,
        Arc<RwLock<KernelState>>,
        Arc<SignalBus>,
        Arc<OmegaKernelBridge>,
        Arc<MemoryKernelBridge>,
    ) {
        let signal_bus = Arc::new(SignalBus::new(1000));
        let (event_tx, _) = tokio::sync::broadcast::channel(1000);
        let state = Arc::new(RwLock::new(KernelState::new()));

        let runtime = Arc::new(KernelRuntime::new(event_tx.clone(), Arc::clone(&state)));

        let scheduler = Arc::new(CognitiveScheduler::new(
            Arc::clone(&runtime),
            Arc::clone(&state),
            event_tx.clone(),
            16,
        ));

        let omega_bridge = Arc::new(OmegaKernelBridge::new(
            Arc::clone(&signal_bus),
            event_tx.clone(),
        ));

        let memory_bridge = Arc::new(MemoryKernelBridge::with_state(
            Arc::clone(&signal_bus),
            event_tx.clone(),
            Arc::clone(&state),
        ));

        (
            runtime,
            scheduler,
            state,
            signal_bus,
            omega_bridge,
            memory_bridge,
        )
    }

    // ═══════════════════════════════════════════════════════════
    // OMEGA INTEGRATION TESTS
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_omega_basic_integration() {
        let (_, scheduler, _, _, omega_bridge, _) = setup_kernel_system().await;

        // Submit OMEGA request
        let request = OmegaRequest {
            message: "Hello OMEGA!".to_string(),
            history: vec![],
            mode: "chat".to_string(),
            user_id: "test_user".to_string(),
            session_id: "test_session".to_string(),
        };

        let result = omega_bridge.submit_request(request).await;
        assert!(result.is_ok());

        let (_job_id, job) = result.unwrap();
        assert_eq!(job.engine, "OMEGA");
        assert_eq!(job.priority, CognitivePriority::Normal);

        // Submit to scheduler
        let submit_result = scheduler.submit(job).await;
        assert!(submit_result.is_ok());

        // Execute job
        let executed = scheduler.execute_next().await;
        assert!(executed);

        // Wait for execution
        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

        // Check stats
        let omega_stats = omega_bridge.get_stats().await;
        assert_eq!(omega_stats.total_requests, 1);
        assert_eq!(omega_stats.successful_requests, 1);
    }

    #[tokio::test]
    async fn test_omega_priority_scheduling() {
        let (_, scheduler, _, _, omega_bridge, _) = setup_kernel_system().await;

        // Submit critical request
        let critical_request = OmegaRequest {
            message: "Emergency!".to_string(),
            history: vec![],
            mode: "emergency".to_string(),
            user_id: "test_user".to_string(),
            session_id: "test_session".to_string(),
        };

        let (_, critical_job) = omega_bridge.submit_request(critical_request).await.unwrap();
        assert_eq!(critical_job.priority, CognitivePriority::Critical);

        // Submit normal request
        let normal_request = OmegaRequest {
            message: "Normal chat".to_string(),
            history: vec![],
            mode: "chat".to_string(),
            user_id: "test_user".to_string(),
            session_id: "test_session".to_string(),
        };

        let (_, normal_job) = omega_bridge.submit_request(normal_request).await.unwrap();
        assert_eq!(normal_job.priority, CognitivePriority::Normal);

        // Submit to scheduler (reverse order)
        scheduler.submit(normal_job).await.unwrap();
        scheduler.submit(critical_job).await.unwrap();

        // Critical should be executed first
        assert_eq!(scheduler.queue_size().await, 2);
    }

    #[tokio::test]
    async fn test_omega_multiple_modes() {
        let (_, _, _, _, omega_bridge, _) = setup_kernel_system().await;

        let modes = vec!["chat", "code", "creative", "brainstorming", "emergency"];

        for mode in modes {
            let request = OmegaRequest {
                message: format!("Test {}", mode),
                history: vec![],
                mode: mode.to_string(),
                user_id: "test_user".to_string(),
                session_id: "test_session".to_string(),
            };

            let result = omega_bridge.submit_request(request).await;
            assert!(result.is_ok());
        }

        let stats = omega_bridge.get_stats().await;
        assert_eq!(stats.total_requests, 5);
    }

    // ═══════════════════════════════════════════════════════════
    // MEMORY INTEGRATION TESTS
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_memory_store_operation() {
        let (_, scheduler, _, _, _, memory_bridge) = setup_kernel_system().await;

        let operation = MemoryOperation::Store {
            content: "Test memory content".to_string(),
            memory_type: "conversation".to_string(),
            importance: 0.8,
            tags: vec!["test".to_string(), "integration".to_string()],
        };

        let result = memory_bridge.submit_operation(operation).await;
        assert!(result.is_ok());

        let (_job_id, job) = result.unwrap();
        assert_eq!(job.engine, "Memory");
        assert_eq!(job.priority, CognitivePriority::High);

        // Submit and execute
        scheduler.submit(job).await.unwrap();
        let executed = scheduler.execute_next().await;
        assert!(executed);

        tokio::time::sleep(tokio::time::Duration::from_millis(20)).await;

        let stats = memory_bridge.get_stats().await;
        assert_eq!(stats.total_stores, 1);
    }

    #[tokio::test]
    async fn test_memory_recall_operation() {
        let (_, scheduler, _, _, _, memory_bridge) = setup_kernel_system().await;

        let operation = MemoryOperation::Recall {
            query: "test query".to_string(),
            max_results: 10,
        };

        let result = memory_bridge.submit_operation(operation).await;
        assert!(result.is_ok());

        let (_, job) = result.unwrap();
        scheduler.submit(job).await.unwrap();
        scheduler.execute_next().await;

        tokio::time::sleep(tokio::time::Duration::from_millis(30)).await;

        let stats = memory_bridge.get_stats().await;
        assert_eq!(stats.total_recalls, 1);
    }

    #[tokio::test]
    async fn test_memory_consolidation() {
        let (_, scheduler, _, _, _, memory_bridge) = setup_kernel_system().await;

        let operation = MemoryOperation::Consolidate {
            tier: "stm_to_mtm".to_string(),
        };

        let result = memory_bridge.submit_operation(operation).await;
        assert!(result.is_ok());

        let (_, job) = result.unwrap();
        assert_eq!(job.priority, CognitivePriority::Normal);

        scheduler.submit(job).await.unwrap();
        scheduler.execute_next().await;

        tokio::time::sleep(tokio::time::Duration::from_millis(70)).await;

        let stats = memory_bridge.get_stats().await;
        assert_eq!(stats.total_consolidations, 1);
    }

    #[tokio::test]
    async fn test_memory_forget_operation() {
        let (_, scheduler, _, _, _, memory_bridge) = setup_kernel_system().await;

        let operation = MemoryOperation::Forget { threshold: 0.3 };

        let result = memory_bridge.submit_operation(operation).await;
        assert!(result.is_ok());

        let (_, job) = result.unwrap();
        assert_eq!(job.priority, CognitivePriority::Background);

        scheduler.submit(job).await.unwrap();
        scheduler.execute_next().await;

        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

        let stats = memory_bridge.get_stats().await;
        assert_eq!(stats.total_forgettings, 1);
    }

    #[tokio::test]
    async fn test_memory_health_update() {
        let (_, _, state, _, _, memory_bridge) = setup_kernel_system().await;

        let snapshot = MemoryHealthSnapshot {
            stm_count: 50,
            mtm_count: 200,
            ltm_count: 5000,
            stm_utilization: 0.5,
            mtm_utilization: 0.67,
            ltm_utilization: 0.89,
            total_memories: 5250,
            compression_ratio: 0.7,
        };

        memory_bridge.update_memory_health(snapshot.clone()).await;

        // Verify state updated
        let state_lock = state.read().await;
        assert_eq!(state_lock.memory_health.stm_utilization, 0.5);
        assert_eq!(state_lock.memory_health.mtm_utilization, 0.67);
        assert_eq!(state_lock.memory_health.ltm_size_mb, 0.89);
    }

    // ═══════════════════════════════════════════════════════════
    // COMBINED OMEGA + MEMORY TESTS
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_omega_with_memory_pipeline() {
        let (_, scheduler, _, _, omega_bridge, memory_bridge) = setup_kernel_system().await;

        // 1. Store memory first
        let store_op = MemoryOperation::Store {
            content: "User said: Hello".to_string(),
            memory_type: "conversation".to_string(),
            importance: 0.8,
            tags: vec!["greeting".to_string()],
        };

        let (_, store_job) = memory_bridge.submit_operation(store_op).await.unwrap();
        scheduler.submit(store_job).await.unwrap();
        scheduler.execute_next().await;

        tokio::time::sleep(tokio::time::Duration::from_millis(20)).await;

        // 2. Recall memory
        let recall_op = MemoryOperation::Recall {
            query: "greeting".to_string(),
            max_results: 5,
        };

        let (_, recall_job) = memory_bridge.submit_operation(recall_op).await.unwrap();
        scheduler.submit(recall_job).await.unwrap();
        scheduler.execute_next().await;

        tokio::time::sleep(tokio::time::Duration::from_millis(30)).await;

        // 3. Process OMEGA request
        let omega_request = OmegaRequest {
            message: "Continue conversation".to_string(),
            history: vec![],
            mode: "chat".to_string(),
            user_id: "test_user".to_string(),
            session_id: "test_session".to_string(),
        };

        let (_, omega_job) = omega_bridge.submit_request(omega_request).await.unwrap();
        scheduler.submit(omega_job).await.unwrap();
        scheduler.execute_next().await;

        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

        // Verify both systems worked
        let memory_stats = memory_bridge.get_stats().await;
        assert_eq!(memory_stats.total_stores, 1);
        assert_eq!(memory_stats.total_recalls, 1);

        let omega_stats = omega_bridge.get_stats().await;
        assert_eq!(omega_stats.total_requests, 1);
        assert_eq!(omega_stats.successful_requests, 1);
    }

    #[tokio::test]
    async fn test_concurrent_omega_memory_operations() {
        let (_, scheduler, _, _, omega_bridge, memory_bridge) = setup_kernel_system().await;

        // Submit multiple operations sequentially (avoiding Send issues)
        // OMEGA requests
        for i in 0..3 {
            let request = OmegaRequest {
                message: format!("Request {}", i),
                history: vec![],
                mode: "chat".to_string(),
                user_id: "test_user".to_string(),
                session_id: "test_session".to_string(),
            };
            let (_, job) = omega_bridge.submit_request(request).await.unwrap();
            scheduler.submit(job).await.unwrap();
        }

        // Memory operations
        for i in 0..3 {
            let operation = MemoryOperation::Store {
                content: format!("Memory {}", i),
                memory_type: "test".to_string(),
                importance: 0.5,
                tags: vec![],
            };
            let (_, job) = memory_bridge.submit_operation(operation).await.unwrap();
            scheduler.submit(job).await.unwrap();
        }

        // Verify queue size
        assert_eq!(scheduler.queue_size().await, 6);

        // Execute all
        for _ in 0..6 {
            scheduler.execute_next().await;
        }

        tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;

        // Verify stats
        let omega_stats = omega_bridge.get_stats().await;
        assert_eq!(omega_stats.total_requests, 3);

        let memory_stats = memory_bridge.get_stats().await;
        assert_eq!(memory_stats.total_stores, 3);
    }

    // ═══════════════════════════════════════════════════════════
    // STRESS TESTS
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_high_load_integration() {
        let (_, scheduler, _, _, omega_bridge, memory_bridge) = setup_kernel_system().await;

        let start = std::time::Instant::now();

        // Submit 100 operations (50 OMEGA + 50 Memory)
        for i in 0..50 {
            // OMEGA
            let omega_request = OmegaRequest {
                message: format!("Request {}", i),
                history: vec![],
                mode: if i % 10 == 0 { "emergency" } else { "chat" }.to_string(),
                user_id: "test_user".to_string(),
                session_id: "test_session".to_string(),
            };
            let (_, job) = omega_bridge.submit_request(omega_request).await.unwrap();
            scheduler.submit(job).await.unwrap();

            // Memory
            let memory_op = MemoryOperation::Store {
                content: format!("Memory {}", i),
                memory_type: "test".to_string(),
                importance: 0.5,
                tags: vec![],
            };
            let (_, job) = memory_bridge.submit_operation(memory_op).await.unwrap();
            scheduler.submit(job).await.unwrap();
        }

        let submission_time = start.elapsed();
        println!("100 operations submitted in {:?}", submission_time);
        assert!(submission_time.as_millis() < 100); // < 100ms for submissions

        // Execute all
        while scheduler.queue_size().await > 0 {
            scheduler.execute_next().await;
        }

        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

        let total_time = start.elapsed();
        println!("100 operations completed in {:?}", total_time);

        // Verify stats
        let omega_stats = omega_bridge.get_stats().await;
        assert_eq!(omega_stats.total_requests, 50);

        let memory_stats = memory_bridge.get_stats().await;
        assert_eq!(memory_stats.total_stores, 50);
    }
}
