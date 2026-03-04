// Ring 2: PolicyEngine — Hard Rules Enforcement
// Pure logic, no I/O, deterministic policy decisions

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum NetState {
    Online,
    Offline,
    Degraded,
    Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyContext {
    pub net_state: NetState,
    pub has_ollama_credentials: bool,
    pub has_gemini_credentials: bool,
    pub has_brave_credentials: bool,
    pub endpoint_allowlist: Vec<String>,
    pub user_preference_offline_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyVerdict {
    pub allow_online: bool,
    pub allow_external_ai: bool,
    pub allow_search: bool,
    pub allow_tools: bool,
    pub hard_block: bool,
    pub block_reason: Option<String>,
    pub fallback_to: Option<String>,
}

/// PolicyEngine: Hard rules enforcement for Conversation OS
/// 
/// Evaluates network state, credentials, allowlist, and user preferences
/// to produce a policy verdict that governs what actions are allowed.
/// 
/// **Ring:** 2 (Engines)  
/// **Status:** EXPERIMENTAL  
/// **Purity:** ✅ No I/O, no state, deterministic  
/// 
/// # Hard Rules:
/// 1. OFFLINE → block external AI, allow local Ollama only
/// 2. BLOCKED → hard_block = true, nothing allowed
/// 3. DEGRADED → allow fallback providers only
/// 4. No credentials → block specific provider
/// 5. Endpoint not in allowlist → block
/// 6. User offline mode preference → respect it
pub struct PolicyEngine;

impl PolicyEngine {
    /// Create new PolicyEngine (stateless)
    pub fn new() -> Self {
        PolicyEngine
    }

    /// Evaluate policy based on context and produce verdict
    /// 
    /// # Arguments
    /// * `context` - PolicyContext with net_state, credentials, allowlist, preferences
    /// * `wants_search` - Whether user wants web search (from RouterEngine)
    /// * `wants_external_ai` - Whether user wants external AI (Gemini, etc.)
    /// 
    /// # Returns
    /// PolicyVerdict with allow flags and block reason
    /// 
    /// # Examples
    /// ```
    /// use titane_infinity::engines::conversation_os::policy::{NetState, PolicyContext, PolicyEngine};
    ///
    /// let engine = PolicyEngine::new();
    /// let context = PolicyContext {
    ///     net_state: NetState::Offline,
    ///     has_ollama_credentials: true,
    ///     has_gemini_credentials: false,
    ///     has_brave_credentials: false,
    ///     endpoint_allowlist: vec!["http://localhost:11434".to_string()],
    ///     user_preference_offline_mode: false,
    /// };
    /// let verdict = engine.evaluate(&context, false, false);
    /// assert!(!verdict.allow_external_ai);
    /// assert!(!verdict.allow_search);
    /// ```
    pub fn evaluate(
        &self,
        context: &PolicyContext,
        wants_search: bool,
        wants_external_ai: bool,
    ) -> PolicyVerdict {
        // Rule 1: BLOCKED → hard block everything
        if context.net_state == NetState::Blocked {
            return PolicyVerdict {
                allow_online: false,
                allow_external_ai: false,
                allow_search: false,
                allow_tools: false,
                hard_block: true,
                block_reason: Some("Network state is BLOCKED".to_string()),
                fallback_to: None,
            };
        }

        // Rule 2: User preference for offline mode
        if context.user_preference_offline_mode {
            return PolicyVerdict {
                allow_online: false,
                allow_external_ai: false,
                allow_search: false,
                allow_tools: true, // Local tools OK
                hard_block: false,
                block_reason: Some("User preference: offline mode enabled".to_string()),
                fallback_to: Some("ollama".to_string()),
            };
        }

        // Rule 3: OFFLINE → block external AI, allow local only
        if context.net_state == NetState::Offline {
            return PolicyVerdict {
                allow_online: false,
                allow_external_ai: false,
                allow_search: false,
                allow_tools: true,
                hard_block: false,
                block_reason: Some("Network state is OFFLINE".to_string()),
                fallback_to: if context.has_ollama_credentials {
                    Some("ollama".to_string())
                } else {
                    None
                },
            };
        }

        // Rule 4: DEGRADED → allow fallback providers only
        if context.net_state == NetState::Degraded {
            let allow_external = context.has_gemini_credentials && wants_external_ai;
            return PolicyVerdict {
                allow_online: true,
                allow_external_ai: allow_external,
                allow_search: false, // Degraded → no search
                allow_tools: true,
                hard_block: false,
                block_reason: if !allow_external && wants_external_ai {
                    Some("Network degraded, external AI limited".to_string())
                } else {
                    None
                },
                fallback_to: Some("ollama".to_string()),
            };
        }

        // Rule 5: ONLINE → check credentials
        if context.net_state == NetState::Online {
            let allow_search = wants_search && context.has_brave_credentials;
            let allow_external = wants_external_ai
                && (context.has_gemini_credentials || context.has_ollama_credentials);

            let block_reason = if wants_search && !context.has_brave_credentials {
                Some("Search requested but no Brave API credentials".to_string())
            } else if wants_external_ai && !allow_external {
                Some("External AI requested but no credentials".to_string())
            } else {
                None
            };

            return PolicyVerdict {
                allow_online: true,
                allow_external_ai: allow_external,
                allow_search,
                allow_tools: true,
                hard_block: false,
                block_reason,
                fallback_to: if !allow_external && context.has_ollama_credentials {
                    Some("ollama".to_string())
                } else {
                    None
                },
            };
        }

        // Default: deny (should never reach here)
        PolicyVerdict {
            allow_online: false,
            allow_external_ai: false,
            allow_search: false,
            allow_tools: false,
            hard_block: true,
            block_reason: Some("Unknown network state".to_string()),
            fallback_to: None,
        }
    }

    /// Check if endpoint is in allowlist
    /// 
    /// # Arguments
    /// * `endpoint` - Endpoint URL to check
    /// * `allowlist` - List of allowed endpoints
    /// 
    /// # Returns
    /// true if endpoint is allowed, false otherwise
    pub fn is_endpoint_allowed(&self, endpoint: &str, allowlist: &[String]) -> bool {
        allowlist.iter().any(|allowed| {
            endpoint.starts_with(allowed) || allowed == "*" || allowed == endpoint
        })
    }
}

impl Default for PolicyEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_online_context() -> PolicyContext {
        PolicyContext {
            net_state: NetState::Online,
            has_ollama_credentials: true,
            has_gemini_credentials: true,
            has_brave_credentials: true,
            endpoint_allowlist: vec![
                "http://localhost:11434".to_string(),
                "https://api.gemini.google.com".to_string(),
                "https://api.search.brave.com".to_string(),
            ],
            user_preference_offline_mode: false,
        }
    }

    #[test]
    fn test_blocked_state_hard_block() {
        let engine = PolicyEngine::new();
        let mut context = create_online_context();
        context.net_state = NetState::Blocked;

        let verdict = engine.evaluate(&context, true, true);
        assert!(verdict.hard_block);
        assert!(!verdict.allow_online);
        assert!(!verdict.allow_external_ai);
        assert!(!verdict.allow_search);
    }

    #[test]
    fn test_offline_state_local_only() {
        let engine = PolicyEngine::new();
        let mut context = create_online_context();
        context.net_state = NetState::Offline;

        let verdict = engine.evaluate(&context, true, true);
        assert!(!verdict.hard_block);
        assert!(!verdict.allow_online);
        assert!(!verdict.allow_external_ai);
        assert!(!verdict.allow_search);
        assert!(verdict.allow_tools); // Local tools OK
        assert_eq!(verdict.fallback_to, Some("ollama".to_string()));
    }

    #[test]
    fn test_degraded_state_limited() {
        let engine = PolicyEngine::new();
        let mut context = create_online_context();
        context.net_state = NetState::Degraded;

        let verdict = engine.evaluate(&context, true, true);
        assert!(!verdict.hard_block);
        assert!(verdict.allow_online);
        assert!(verdict.allow_external_ai); // Because has Gemini creds
        assert!(!verdict.allow_search); // Degraded = no search
        assert_eq!(verdict.fallback_to, Some("ollama".to_string()));
    }

    #[test]
    fn test_online_state_full_access() {
        let engine = PolicyEngine::new();
        let context = create_online_context();

        let verdict = engine.evaluate(&context, true, true);
        assert!(!verdict.hard_block);
        assert!(verdict.allow_online);
        assert!(verdict.allow_external_ai);
        assert!(verdict.allow_search);
        assert!(verdict.allow_tools);
        assert_eq!(verdict.block_reason, None);
    }

    #[test]
    fn test_missing_credentials_search() {
        let engine = PolicyEngine::new();
        let mut context = create_online_context();
        context.has_brave_credentials = false;

        let verdict = engine.evaluate(&context, true, false);
        assert!(!verdict.allow_search);
        assert!(verdict.block_reason.is_some());
    }

    #[test]
    fn test_missing_credentials_external_ai() {
        let engine = PolicyEngine::new();
        let mut context = create_online_context();
        context.has_gemini_credentials = false;
        context.has_ollama_credentials = false;

        let verdict = engine.evaluate(&context, false, true);
        assert!(!verdict.allow_external_ai);
        assert!(verdict.block_reason.is_some());
    }

    #[test]
    fn test_user_preference_offline() {
        let engine = PolicyEngine::new();
        let mut context = create_online_context();
        context.user_preference_offline_mode = true;

        let verdict = engine.evaluate(&context, true, true);
        assert!(!verdict.hard_block);
        assert!(!verdict.allow_online);
        assert!(!verdict.allow_external_ai);
        assert!(!verdict.allow_search);
        assert!(verdict.allow_tools);
        assert_eq!(verdict.fallback_to, Some("ollama".to_string()));
    }

    #[test]
    fn test_endpoint_allowlist() {
        let engine = PolicyEngine::new();
        let allowlist = vec![
            "http://localhost:11434".to_string(),
            "https://api.gemini.google.com".to_string(),
        ];

        assert!(engine.is_endpoint_allowed("http://localhost:11434/api/chat", &allowlist));
        assert!(engine.is_endpoint_allowed("https://api.gemini.google.com/v1/models", &allowlist));
        assert!(!engine.is_endpoint_allowed("https://evil.com", &allowlist));
    }

    #[test]
    fn test_wildcard_allowlist() {
        let engine = PolicyEngine::new();
        let allowlist = vec!["*".to_string()];

        assert!(engine.is_endpoint_allowed("https://anything.com", &allowlist));
    }
}
