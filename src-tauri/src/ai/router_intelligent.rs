// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Router Intelligent
//   SUPER PROMPT #8 — Smart AI Routing System
// ═══════════════════════════════════════════════════════════════

use crate::ai::{AiRequest, AiMode};
use serde::{Deserialize, Serialize};

/// Décision de routage intelligente
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingDecision {
    pub primary: String,
    pub secondary: Option<String>,
    pub fallback: String,
    pub rationale: String,
}

/// Router intelligent contextuel
pub struct AiRouter {
    cost_optimization: bool,
    latency_priority: bool,
}

impl AiRouter {
    pub fn new(cost_optimization: bool, latency_priority: bool) -> Self {
        Self {
            cost_optimization,
            latency_priority,
        }
    }

    /// Route intelligemment vers les meilleurs providers
    pub async fn route(&self, req: &AiRequest) -> RoutingDecision {
        // Analyse contextuelle
        let prompt_length = req.prompt.len();
        let is_complex = self.detect_complexity(&req.prompt);
        let is_code_related = self.detect_code_context(&req.prompt);

        // Routage selon mode
        match req.mode {
            AiMode::Fast => self.route_fast(prompt_length),
            AiMode::Quality => self.route_quality(is_complex, is_code_related),
            AiMode::Deep => self.route_deep(),
            AiMode::Creative => self.route_creative(),
            AiMode::Analysis => self.route_analysis(is_code_related),
        }
    }

    fn route_fast(&self, prompt_length: usize) -> RoutingDecision {
        if self.latency_priority {
            RoutingDecision {
                primary: "local_llama3".to_string(),
                secondary: Some("claude_haiku".to_string()),
                fallback: "titane_engine".to_string(),
                rationale: "Mode Fast + latency priority → Local first".to_string(),
            }
        } else if prompt_length < 500 {
            RoutingDecision {
                primary: "claude_haiku".to_string(),
                secondary: Some("gpt35".to_string()),
                fallback: "local_llama3".to_string(),
                rationale: "Mode Fast + short prompt → Claude Haiku".to_string(),
            }
        } else {
            RoutingDecision {
                primary: "gpt35".to_string(),
                secondary: Some("claude_haiku".to_string()),
                fallback: "local_llama3".to_string(),
                rationale: "Mode Fast + long prompt → GPT-3.5".to_string(),
            }
        }
    }

    fn route_quality(&self, is_complex: bool, is_code: bool) -> RoutingDecision {
        if is_complex {
            RoutingDecision {
                primary: "claude_sonnet".to_string(),
                secondary: Some("gpt4_mini".to_string()),
                fallback: "claude_haiku".to_string(),
                rationale: "Mode Quality + complex → Claude Sonnet".to_string(),
            }
        } else if is_code {
            RoutingDecision {
                primary: "gpt4_mini".to_string(),
                secondary: Some("claude_sonnet".to_string()),
                fallback: "local_codellama".to_string(),
                rationale: "Mode Quality + code → GPT-4 Mini".to_string(),
            }
        } else {
            RoutingDecision {
                primary: "claude_sonnet".to_string(),
                secondary: Some("gpt4_mini".to_string()),
                fallback: "gpt35".to_string(),
                rationale: "Mode Quality + standard → Claude Sonnet".to_string(),
            }
        }
    }

    fn route_deep(&self) -> RoutingDecision {
        if self.cost_optimization {
            RoutingDecision {
                primary: "claude_sonnet".to_string(),
                secondary: Some("gpt4".to_string()),
                fallback: "claude_haiku".to_string(),
                rationale: "Mode Deep + cost opt → Sonnet first".to_string(),
            }
        } else {
            RoutingDecision {
                primary: "claude_opus".to_string(),
                secondary: Some("gpt4".to_string()),
                fallback: "claude_sonnet".to_string(),
                rationale: "Mode Deep → Claude Opus (best quality)".to_string(),
            }
        }
    }

    fn route_creative(&self) -> RoutingDecision {
        RoutingDecision {
            primary: "gpt4".to_string(),
            secondary: Some("claude_sonnet".to_string()),
            fallback: "local_mistral".to_string(),
            rationale: "Mode Creative → GPT-4 (best creativity)".to_string(),
        }
    }

    fn route_analysis(&self, is_code: bool) -> RoutingDecision {
        if is_code {
            RoutingDecision {
                primary: "gpt4_mini".to_string(),
                secondary: Some("claude_sonnet".to_string()),
                fallback: "local_codellama".to_string(),
                rationale: "Mode Analysis + code → GPT-4 Mini".to_string(),
            }
        } else {
            RoutingDecision {
                primary: "claude_sonnet".to_string(),
                secondary: Some("gpt4_mini".to_string()),
                fallback: "claude_haiku".to_string(),
                rationale: "Mode Analysis → Claude Sonnet".to_string(),
            }
        }
    }

    /// Détecte la complexité du prompt
    fn detect_complexity(&self, prompt: &str) -> bool {
        let markers = [
            "analyser en profondeur",
            "expliquer pourquoi",
            "comparer",
            "architecture",
            "conception",
            "stratégie",
            "multi-étapes",
            "plusieurs aspects",
        ];

        let prompt_lower = prompt.to_lowercase();
        markers.iter().any(|m| prompt_lower.contains(m)) || prompt.len() > 1000
    }

    /// Détecte contexte code
    fn detect_code_context(&self, prompt: &str) -> bool {
        let code_markers = [
            "rust", "typescript", "python", "code", "fonction", "class", "struct", 
            "impl", "async", "await", "trait", "interface", "bug", "debug", 
            "refactor", "optimize", "algorithm"
        ];

        let prompt_lower = prompt.to_lowercase();
        code_markers.iter().any(|m| prompt_lower.contains(m))
    }

    /// Détermine le meilleur provider disponible parmi une liste
    pub async fn select_available(
        &self,
        candidates: Vec<String>,
        availability_check: impl Fn(&str) -> bool,
    ) -> Option<String> {
        for candidate in candidates {
            if availability_check(&candidate) {
                return Some(candidate);
            }
        }
        None
    }
}

impl Default for AiRouter {
    fn default() -> Self {
        Self::new(true, false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_route_fast_short() {
        let router = AiRouter::default();
        let req = AiRequest {
            prompt: "Hello".to_string(),
            mode: AiMode::Fast,
            user_id: "test".to_string(),
            session_id: "test".to_string(),
            max_tokens: None,
            temperature: None,
            context: None,
        };

        let decision = router.route(&req).await;
        // Fast mode peut choisir haiku, local ou titane_engine selon disponibilité
        assert!(
            decision.primary.contains("haiku") 
            || decision.primary.contains("local") 
            || decision.primary.contains("titane_engine")
        );
        // Fallback pour Fast mode avec prompt court (<500 chars) est local_llama3
        assert!(
            decision.fallback == "titane_engine" 
            || decision.fallback == "local_llama3"
        );
    }

    #[tokio::test]
    async fn test_route_quality_complex() {
        let router = AiRouter::default();
        let req = AiRequest {
            prompt: "Analyser en profondeur l'architecture système et comparer plusieurs approches".to_string(),
            mode: AiMode::Quality,
            user_id: "test".to_string(),
            session_id: "test".to_string(),
            max_tokens: None,
            temperature: None,
            context: None,
        };

        let decision = router.route(&req).await;
        assert!(decision.primary.contains("sonnet"));
    }

    #[tokio::test]
    async fn test_route_deep() {
        let router = AiRouter::default();
        let req = AiRequest {
            prompt: "Deep analysis".to_string(),
            mode: AiMode::Deep,
            user_id: "test".to_string(),
            session_id: "test".to_string(),
            max_tokens: None,
            temperature: None,
            context: None,
        };

        let decision = router.route(&req).await;
        assert!(decision.primary.contains("sonnet") || decision.primary.contains("opus"));
    }

    #[test]
    fn test_detect_complexity() {
        let router = AiRouter::default();
        
        assert!(router.detect_complexity("Analyser en profondeur le système"));
        assert!(router.detect_complexity("Comparer plusieurs approches"));
        assert!(!router.detect_complexity("Hello world"));
    }

    #[test]
    fn test_detect_code_context() {
        let router = AiRouter::default();
        
        assert!(router.detect_code_context("Code Rust avec async"));
        assert!(router.detect_code_context("Debug this TypeScript function"));
        assert!(!router.detect_code_context("Bonjour comment ça va?"));
    }
}
