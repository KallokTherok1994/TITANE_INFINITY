#![allow(dead_code)]
//! 🌐 CONTEXT ENGINE
//! Moteur de contexte unifié : OmniContext

use std::collections::HashMap;
use chrono::{DateTime, Utc};

pub struct ContextEngine {
    context_variables: HashMap<String, String>,
    last_update: DateTime<Utc>,
}

impl ContextEngine {
    pub fn new() -> Self {
        Self {
            context_variables: HashMap::new(),
            last_update: Utc::now(),
        }
    }
    
    /// Mettre à jour le contexte global
    pub fn update(&mut self, key: &str, value: &str) {
        self.context_variables.insert(key.to_string(), value.to_string());
        self.last_update = Utc::now();
    }
    
    /// Obtenir une variable de contexte
    pub fn get(&self, key: &str) -> Option<String> {
        self.context_variables.get(key).cloned()
    }
    
    /// Obtenir tout le contexte
    pub fn get_all(&self) -> &HashMap<String, String> {
        &self.context_variables
    }
}
