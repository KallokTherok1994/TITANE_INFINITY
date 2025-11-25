// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

use serde::{Deserialize, Serialize};

/// Script de migration pour évolution du state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationScript {
    pub id: String,
    pub from_version: String,
    pub to_version: String,
    pub operations: Vec<MigrationOperation>,
    pub signature: Vec<u8>,
}

/// Opération de migration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MigrationOperation {
    /// Renommer un champ
    RenameField {
        path: String,
        old_name: String,
        new_name: String,
    },
    /// Ajouter un champ avec valeur par défaut
    AddField {
        path: String,
        field_name: String,
        default_value: serde_json::Value,
    },
    /// Supprimer un champ
    RemoveField {
        path: String,
        field_name: String,
    },
    /// Transformer une valeur
    TransformValue {
        path: String,
        field_name: String,
        transform_fn: String, // Nom de la fonction de transformation
    },
}

impl MigrationScript {
    pub fn new(id: String, from_version: String, to_version: String) -> Self {
        Self {
            id,
            from_version,
            to_version,
            operations: Vec::new(),
            signature: Vec::new(),
        }
    }

    pub fn add_operation(&mut self, op: MigrationOperation) {
        self.operations.push(op);
    }
}
