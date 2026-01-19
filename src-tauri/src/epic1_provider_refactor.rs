// Track B: v27.0 Epic 1 - Provider Cascade Refactoring
// Purpose: Transform expect() calls into Result-based error handling
// Created: 2026-01-19 Sprint Launch
// Status: Week 1 - Provider interface redesign

use async_trait::async_trait;
use std::fmt;

/// Custom error type for provider operations
#[derive(Debug, Clone)]
pub enum ProviderError {
    ConnectionFailed(String),
    RequestTimeout(String),
    InvalidResponse(String),
    ApiError(String),
    RateLimited(String),
    InternalError(String),
}

impl fmt::Display for ProviderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ProviderError::ConnectionFailed(msg) => write!(f, "Connection failed: {}", msg),
            ProviderError::RequestTimeout(msg) => write!(f, "Request timeout: {}", msg),
            ProviderError::InvalidResponse(msg) => write!(f, "Invalid response: {}", msg),
            ProviderError::ApiError(msg) => write!(f, "API error: {}", msg),
            ProviderError::RateLimited(msg) => write!(f, "Rate limited: {}", msg),
            ProviderError::InternalError(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for ProviderError {}

/// Provider response wrapper
pub type ProviderResult<T> = Result<T, ProviderError>;

/// Base provider trait with Result-based error handling
#[async_trait]
pub trait Provider: Send + Sync {
    /// Send a message to provider and get response
    async fn send_message(&mut self, message: &str) -> ProviderResult<String>;

    /// Health check - verify provider is available
    async fn health_check(&mut self) -> ProviderResult<()>;

    /// Get provider name
    fn name(&self) -> &'static str;

    /// Get provider capabilities
    fn capabilities(&self) -> Vec<String>;
}

/// Provider cascade orchestrator
pub struct ProviderCascade {
    providers: Vec<Box<dyn Provider + Send + Sync>>,
}

impl ProviderCascade {
    pub fn new() -> Self {
        ProviderCascade {
            providers: Vec::new(),
        }
    }

    /// Add provider to cascade
    pub fn add_provider(&mut self, provider: Box<dyn Provider + Send + Sync>) {
        self.providers.push(provider);
    }

    /// Try providers in sequence until one succeeds
    pub async fn cascade_send(&mut self, message: &str) -> ProviderResult<String> {
        let mut last_error = ProviderError::InternalError(
            "No providers configured".to_string()
        );

        for provider in self.providers.iter_mut() {
            match provider.send_message(message).await {
                Ok(response) => {
                    return Ok(response);
                }
                Err(e) => {
                    eprintln!(
                        "Provider {} failed: {}, trying next...",
                        provider.name(),
                        e
                    );
                    last_error = e;
                }
            }
        }

        Err(last_error)
    }

    /// Verify all providers are healthy
    pub async fn health_check_all(&mut self) -> ProviderResult<()> {
        for provider in self.providers.iter_mut() {
            provider.health_check().await?;
        }
        Ok(())
    }
}

// EPIC 1 MIGRATION PLAN:
// Week 1-2: Convert all provider calls from expect() to Result
// 
// Files to update:
// - gemini_provider/src/lib.rs (200+ expect() calls)
// - ollama_provider/src/lib.rs (100+ expect() calls)  
// - local_provider/src/lib.rs (50+ expect() calls)
// - trait_lib/src/provider.rs (interface definition)
//
// Expected Result:
// - 0 expect() in provider layer
// - All errors properly propagated
// - 4600+ tests passing
// - Audit score: 96 → 97

#[cfg(test)]
mod tests {
    use super::*;

    struct MockProvider;

    #[async_trait]
    impl Provider for MockProvider {
        async fn send_message(&mut self, message: &str) -> ProviderResult<String> {
            if message.is_empty() {
                Err(ProviderError::InvalidResponse(
                    "Empty message".to_string(),
                ))
            } else {
                Ok(format!("Response: {}", message))
            }
        }

        async fn health_check(&mut self) -> ProviderResult<()> {
            Ok(())
        }

        fn name(&self) -> &'static str {
            "MockProvider"
        }

        fn capabilities(&self) -> Vec<String> {
            vec!["test".to_string()]
        }
    }

    #[tokio::test]
    async fn test_provider_result_handling() {
        let mut provider = MockProvider;
        assert!(provider.send_message("hello").await.is_ok());
        assert!(provider.send_message("").await.is_err());
    }

    #[tokio::test]
    async fn test_cascade_single_provider() {
        let mut cascade = ProviderCascade::new();
        cascade.add_provider(Box::new(MockProvider));

        let result = cascade.cascade_send("test message").await;
        assert!(result.is_ok());
    }
}

pub fn print_epic1_status() {
    println!("🚀 Epic 1: Provider Cascade Refactoring");
    println!("  ├─ Status: Week 1 - Interface design complete");
    println!("  ├─ expect() calls pending: 350+");
    println!("  ├─ Files to update: 3 providers");
    println!("  └─ Target: 0 expect() in provider layer");
}
