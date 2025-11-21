// TITANE∞ v13 - Context Integration
// Intégration du contexte Helios

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Contexte Helios
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeliosContext {
    pub current_task: Option<String>,
    pub active_projects: Vec<String>,
    pub recent_queries: Vec<String>,
    pub user_preferences: HashMap<String, String>,
}

impl HeliosContext {
    pub fn new() -> Self {
        Self {
            current_task: None,
            active_projects: Vec::new(),
            recent_queries: Vec::new(),
            user_preferences: HashMap::new(),
        }
    }

    pub fn set_task(&mut self, task: String) {
        self.current_task = Some(task);
    }

    pub fn add_query(&mut self, query: String) {
        self.recent_queries.push(query);
        if self.recent_queries.len() > 10 {
            self.recent_queries.remove(0);
        }
    }
}

impl Default for HeliosContext {
    fn default() -> Self {
        Self::new()
    }
}
