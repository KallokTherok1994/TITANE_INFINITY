// Track B: v27.0 Epic 1 - Provider Cascade Refactoring
// Purpose: Transform expect() calls into Result-based error handling
// Created: 2026-01-19 Sprint Launch
// Status: Week 1 - Provider interface redesign

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
pub trait Provider: Send + Sync {
    /// Send a message to provider and get response
    fn send_message(&self, message: &str) -> ProviderResult<String>;

    /// Health check - verify provider is available
    fn health_check(&self) -> ProviderResult<()>;

    /// Get provider name
    fn name(&self) -> &'static str;

    /// Get provider capabilities
    fn capabilities(&self) -> Vec<String>;
}

/// Provider cascade orchestrator
pub struct ProviderCascade {
    providers: Vec<Box<dyn Provider>>,
}

impl ProviderCascade {
    pub fn new() -> Self {
        ProviderCascade {
            providers: Vec::new(),
        }
    }

    /// Add provider to cascade
    pub fn add_provider(&mut self, provider: Box<dyn Provider>) {
        self.providers.push(provider);
    }

    /// Try providers in sequence until one succeeds
    pub fn cascade_send(&self, message: &str) -> ProviderResult<String> {
        let mut last_error = ProviderError::InternalError(
            "No providers configured".to_string()
        );

        for provider in &self.providers {
            match provider.send_message(message) {
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
    pub fn health_check_all(&self) -> ProviderResult<()> {
        for provider in &self.providers {
            provider.health_check()?;
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

    impl Provider for MockProvider {
        fn send_message(&self, message: &str) -> ProviderResult<String> {
            if message.is_empty() {
                Err(ProviderError::InvalidResponse(
                    "Empty message".to_string(),
                ))
            } else {
                Ok(format!("Response: {}", message))
            }
        }

        fn health_check(&self) -> ProviderResult<()> {
            Ok(())
        }

        fn name(&self) -> &'static str {
            "MockProvider"
        }

        fn capabilities(&self) -> Vec<String> {
            vec!["test".to_string()]
        }
    }

    #[test]
    fn test_provider_result_handling() {
        let provider = MockProvider;
        assert!(provider.send_message("hello").is_ok());
        assert!(provider.send_message("").is_err());
    }

    #[test]
    fn test_cascade_single_provider() {
        let mut cascade = ProviderCascade::new();
        cascade.add_provider(Box::new(MockProvider));

        let result = cascade.cascade_send("test message");
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
