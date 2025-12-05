// TITANE∞ v14.1 - Cognitive Map
// Carte cognitive dynamique

#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub struct CognitiveMap {
    concepts: HashMap<String, Concept>,
    connections: Vec<Connection>,
}

impl CognitiveMap {
    pub fn new() -> Self {
        Self {
            concepts: HashMap::new(),
            connections: Vec::new(),
        }
    }

    pub fn add_concept(&mut self, name: String, description: String) {
        self.concepts.insert(name.clone(), Concept {
            name,
            description,
            strength: 0.5,
            last_accessed: chrono::Utc::now(),
        });
    }

    pub fn connect(&mut self, from: String, to: String, relation_type: String) {
        self.connections.push(Connection {
            from,
            to,
            relation_type,
            strength: 0.5,
        });
    }
}

impl Default for CognitiveMap {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Concept {
    pub name: String,
    pub description: String,
    pub strength: f32,
    pub last_accessed: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub from: String,
    pub to: String,
    pub relation_type: String,
    pub strength: f32,
}
