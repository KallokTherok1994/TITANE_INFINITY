#![allow(unused_imports)]
#![allow(dead_code)]
// Agent Collaboration Protocols
use crate::agents::{Agent, AgentId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollaborationPattern {
    /// Pipeline: Agent A → Agent B → Agent C
    Pipeline { agents: Vec<AgentId> },
    /// Parallel: All agents work simultaneously
    Parallel { agents: Vec<AgentId> },
    /// Committee: Multiple agents vote on result
    Committee { agents: Vec<AgentId>, quorum: usize },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollaborationProtocol {
    pub pattern: CollaborationPattern,
    pub timeout_seconds: u64,
}

impl CollaborationProtocol {
    pub fn pipeline(agents: Vec<AgentId>) -> Self {
        Self {
            pattern: CollaborationPattern::Pipeline { agents },
            timeout_seconds: 300,
        }
    }

    pub fn parallel(agents: Vec<AgentId>) -> Self {
        Self {
            pattern: CollaborationPattern::Parallel { agents },
            timeout_seconds: 60,
        }
    }

    pub fn committee(agents: Vec<AgentId>, quorum: usize) -> Self {
        Self {
            pattern: CollaborationPattern::Committee { agents, quorum },
            timeout_seconds: 120,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollaborationResult {
    pub success: bool,
    pub participating_agents: Vec<AgentId>,
    pub duration_ms: u128,
    pub output: Option<String>,
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests CollaborationPattern
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_collaboration_pattern_pipeline() {
        let agents = vec![AgentId::new("a1"), AgentId::new("a2")];
        let pattern = CollaborationPattern::Pipeline { agents: agents.clone() };
        if let CollaborationPattern::Pipeline { agents: ids } = pattern {
            assert_eq!(ids.len(), 2);
        } else {
            panic!("Expected Pipeline");
        }
    }

    #[test]
    fn test_collaboration_pattern_parallel() {
        let agents = vec![AgentId::new("a1"), AgentId::new("a2"), AgentId::new("a3")];
        let pattern = CollaborationPattern::Parallel { agents: agents.clone() };
        if let CollaborationPattern::Parallel { agents: ids } = pattern {
            assert_eq!(ids.len(), 3);
        } else {
            panic!("Expected Parallel");
        }
    }

    #[test]
    fn test_collaboration_pattern_committee() {
        let agents = vec![AgentId::new("a1"), AgentId::new("a2"), AgentId::new("a3")];
        let pattern = CollaborationPattern::Committee { agents, quorum: 2 };
        if let CollaborationPattern::Committee { agents: ids, quorum } = pattern {
            assert_eq!(ids.len(), 3);
            assert_eq!(quorum, 2);
        } else {
            panic!("Expected Committee");
        }
    }

    #[test]
    fn test_collaboration_pattern_debug() {
        let pattern = CollaborationPattern::Pipeline { agents: vec![AgentId::new("a1")] };
        let debug_str = format!("{:?}", pattern);
        assert!(debug_str.contains("Pipeline"));
    }

    #[test]
    fn test_collaboration_pattern_clone() {
        let pattern = CollaborationPattern::Parallel { agents: vec![AgentId::new("a1")] };
        let cloned = pattern.clone();
        assert!(matches!(cloned, CollaborationPattern::Parallel { .. }));
    }

    #[test]
    fn test_collaboration_pattern_serialize_pipeline() {
        let pattern = CollaborationPattern::Pipeline { agents: vec![AgentId::new("a1")] };
        let json = serde_json::to_string(&pattern).unwrap();
        assert!(json.contains("Pipeline"));
        assert!(json.contains("a1"));
    }

    #[test]
    fn test_collaboration_pattern_serialize_committee() {
        let pattern = CollaborationPattern::Committee {
            agents: vec![AgentId::new("voter1")],
            quorum: 1,
        };
        let json = serde_json::to_string(&pattern).unwrap();
        assert!(json.contains("Committee"));
        assert!(json.contains("quorum"));
    }

    #[test]
    fn test_collaboration_pattern_deserialize_pipeline() {
        let json = r#"{"Pipeline":{"agents":["agent1","agent2"]}}"#;
        let pattern: CollaborationPattern = serde_json::from_str(json).unwrap();
        assert!(matches!(pattern, CollaborationPattern::Pipeline { .. }));
    }

    #[test]
    fn test_collaboration_pattern_deserialize_parallel() {
        let json = r#"{"Parallel":{"agents":["a1","a2"]}}"#;
        let pattern: CollaborationPattern = serde_json::from_str(json).unwrap();
        assert!(matches!(pattern, CollaborationPattern::Parallel { .. }));
    }

    #[test]
    fn test_collaboration_pattern_deserialize_committee() {
        let json = r#"{"Committee":{"agents":["v1","v2","v3"],"quorum":2}}"#;
        let pattern: CollaborationPattern = serde_json::from_str(json).unwrap();
        if let CollaborationPattern::Committee { agents, quorum } = pattern {
            assert_eq!(agents.len(), 3);
            assert_eq!(quorum, 2);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests CollaborationProtocol
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_collaboration_protocol_pipeline() {
        let agents = vec![AgentId::new("a1"), AgentId::new("a2")];
        let protocol = CollaborationProtocol::pipeline(agents);
        assert!(matches!(protocol.pattern, CollaborationPattern::Pipeline { .. }));
        assert_eq!(protocol.timeout_seconds, 300);
    }

    #[test]
    fn test_collaboration_protocol_parallel() {
        let agents = vec![AgentId::new("a1"), AgentId::new("a2")];
        let protocol = CollaborationProtocol::parallel(agents);
        assert!(matches!(protocol.pattern, CollaborationPattern::Parallel { .. }));
        assert_eq!(protocol.timeout_seconds, 60);
    }

    #[test]
    fn test_collaboration_protocol_committee() {
        let agents = vec![AgentId::new("a1"), AgentId::new("a2"), AgentId::new("a3")];
        let protocol = CollaborationProtocol::committee(agents, 2);
        assert!(matches!(protocol.pattern, CollaborationPattern::Committee { .. }));
        assert_eq!(protocol.timeout_seconds, 120);
    }

    #[test]
    fn test_collaboration_protocol_debug() {
        let protocol = CollaborationProtocol::pipeline(vec![AgentId::new("a1")]);
        let debug_str = format!("{:?}", protocol);
        assert!(debug_str.contains("CollaborationProtocol"));
    }

    #[test]
    fn test_collaboration_protocol_clone() {
        let protocol = CollaborationProtocol::parallel(vec![AgentId::new("a1")]);
        let cloned = protocol.clone();
        assert_eq!(cloned.timeout_seconds, protocol.timeout_seconds);
    }

    #[test]
    fn test_collaboration_protocol_serialize() {
        let protocol = CollaborationProtocol::committee(vec![AgentId::new("v1")], 1);
        let json = serde_json::to_string(&protocol).unwrap();
        assert!(json.contains("Committee"));
        assert!(json.contains("timeout_seconds"));
    }

    #[test]
    fn test_collaboration_protocol_deserialize() {
        let json = r#"{"pattern":{"Pipeline":{"agents":["a1"]}},"timeout_seconds":500}"#;
        let protocol: CollaborationProtocol = serde_json::from_str(json).unwrap();
        assert!(matches!(protocol.pattern, CollaborationPattern::Pipeline { .. }));
        assert_eq!(protocol.timeout_seconds, 500);
    }

    #[test]
    fn test_collaboration_protocol_roundtrip() {
        let original = CollaborationProtocol::parallel(vec![AgentId::new("p1"), AgentId::new("p2")]);
        let json = serde_json::to_string(&original).unwrap();
        let restored: CollaborationProtocol = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.timeout_seconds, 60);
    }

    #[test]
    fn test_collaboration_protocol_empty_agents() {
        let protocol = CollaborationProtocol::pipeline(vec![]);
        if let CollaborationPattern::Pipeline { agents } = protocol.pattern {
            assert!(agents.is_empty());
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests CollaborationResult
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_collaboration_result_success() {
        let result = CollaborationResult {
            success: true,
            participating_agents: vec![AgentId::new("a1")],
            duration_ms: 500,
            output: Some("Result".to_string()),
        };
        assert!(result.success);
        assert_eq!(result.participating_agents.len(), 1);
        assert!(result.output.is_some());
    }

    #[test]
    fn test_collaboration_result_failure() {
        let result = CollaborationResult {
            success: false,
            participating_agents: vec![],
            duration_ms: 100,
            output: None,
        };
        assert!(!result.success);
        assert!(result.output.is_none());
    }

    #[test]
    fn test_collaboration_result_debug() {
        let result = CollaborationResult {
            success: true,
            participating_agents: vec![],
            duration_ms: 0,
            output: None,
        };
        let debug_str = format!("{:?}", result);
        assert!(debug_str.contains("CollaborationResult"));
    }

    #[test]
    fn test_collaboration_result_clone() {
        let result = CollaborationResult {
            success: true,
            participating_agents: vec![AgentId::new("a1")],
            duration_ms: 250,
            output: Some("test".to_string()),
        };
        let cloned = result.clone();
        assert_eq!(cloned.success, result.success);
        assert_eq!(cloned.duration_ms, result.duration_ms);
    }

    #[test]
    fn test_collaboration_result_serialize() {
        let result = CollaborationResult {
            success: true,
            participating_agents: vec![AgentId::new("worker")],
            duration_ms: 1000,
            output: Some("completed".to_string()),
        };
        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"success\":true"));
        assert!(json.contains("worker"));
        assert!(json.contains("completed"));
    }

    #[test]
    fn test_collaboration_result_deserialize() {
        let json = r#"{"success":false,"participating_agents":["a1","a2"],"duration_ms":2000,"output":null}"#;
        let result: CollaborationResult = serde_json::from_str(json).unwrap();
        assert!(!result.success);
        assert_eq!(result.participating_agents.len(), 2);
        assert!(result.output.is_none());
    }

    #[test]
    fn test_collaboration_result_roundtrip() {
        let original = CollaborationResult {
            success: true,
            participating_agents: vec![AgentId::new("x"), AgentId::new("y")],
            duration_ms: 5000,
            output: Some("final".to_string()),
        };
        let json = serde_json::to_string(&original).unwrap();
        let restored: CollaborationResult = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.success, true);
        assert_eq!(restored.output, Some("final".to_string()));
    }

    #[test]
    fn test_collaboration_result_zero_duration() {
        let result = CollaborationResult {
            success: true,
            participating_agents: vec![],
            duration_ms: 0,
            output: None,
        };
        assert_eq!(result.duration_ms, 0);
    }

    #[test]
    fn test_collaboration_result_max_duration() {
        let result = CollaborationResult {
            success: true,
            participating_agents: vec![],
            duration_ms: u128::MAX,
            output: None,
        };
        assert_eq!(result.duration_ms, u128::MAX);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests d'intégration
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_full_collaboration_workflow() {
        // Create a committee protocol
        let agents = vec![
            AgentId::new("voter1"),
            AgentId::new("voter2"),
            AgentId::new("voter3"),
        ];
        let protocol = CollaborationProtocol::committee(agents.clone(), 2);

        // Simulate successful result
        let result = CollaborationResult {
            success: true,
            participating_agents: agents,
            duration_ms: 1500,
            output: Some("Consensus reached".to_string()),
        };

        assert!(matches!(protocol.pattern, CollaborationPattern::Committee { quorum: 2, .. }));
        assert!(result.success);
        assert_eq!(result.participating_agents.len(), 3);
    }

    #[test]
    fn test_pipeline_collaboration() {
        let agents = vec![
            AgentId::new("step1"),
            AgentId::new("step2"),
            AgentId::new("step3"),
        ];
        let protocol = CollaborationProtocol::pipeline(agents.clone());

        // Pipeline has longer timeout
        assert_eq!(protocol.timeout_seconds, 300);

        if let CollaborationPattern::Pipeline { agents: pipeline_agents } = protocol.pattern {
            assert_eq!(pipeline_agents.len(), 3);
            assert_eq!(pipeline_agents[0].as_str(), "step1");
            assert_eq!(pipeline_agents[2].as_str(), "step3");
        }
    }

    #[test]
    fn test_parallel_collaboration() {
        let agents = vec![
            AgentId::new("worker1"),
            AgentId::new("worker2"),
        ];
        let protocol = CollaborationProtocol::parallel(agents);

        // Parallel has shorter timeout (faster)
        assert_eq!(protocol.timeout_seconds, 60);
    }
}
