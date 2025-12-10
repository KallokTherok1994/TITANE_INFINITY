//! TITANE∞ v20Ω — Temporal Diff
//! Calcul des différences entre états

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Type de changement
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ChangeType {
    Added,
    Removed,
    Modified,
    Unchanged,
}

/// Un changement dans le diff
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Change {
    pub path: String,
    pub change_type: ChangeType,
    pub old_value: Option<Value>,
    pub new_value: Option<Value>,
}

/// Différence entre deux états
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TemporalDiff {
    pub changes: Vec<Change>,
    pub total_changes: usize,
    pub additions: usize,
    pub removals: usize,
    pub modifications: usize,
}

impl TemporalDiff {
    /// Crée un nouveau diff
    pub fn new() -> Self {
        Self::default()
    }

    /// Calcule le diff entre deux valeurs JSON
    pub fn compute(old_data: &str, new_data: &str) -> Result<Self, String> {
        let old: Value = serde_json::from_str(old_data)
            .map_err(|e| format!("Failed to parse old data: {}", e))?;
        let new: Value = serde_json::from_str(new_data)
            .map_err(|e| format!("Failed to parse new data: {}", e))?;

        let mut diff = TemporalDiff::new();
        diff.compare_values(&old, &new, "".to_string());
        diff.compute_stats();

        Ok(diff)
    }

    /// Compare deux valeurs récursivement
    fn compare_values(&mut self, old: &Value, new: &Value, path: String) {
        match (old, new) {
            // Les deux sont des objets
            (Value::Object(old_map), Value::Object(new_map)) => {
                // Vérifier les clés supprimées ou modifiées
                for (key, old_value) in old_map {
                    let current_path = if path.is_empty() {
                        key.clone()
                    } else {
                        format!("{}.{}", path, key)
                    };

                    if let Some(new_value) = new_map.get(key) {
                        self.compare_values(old_value, new_value, current_path);
                    } else {
                        self.changes.push(Change {
                            path: current_path,
                            change_type: ChangeType::Removed,
                            old_value: Some(old_value.clone()),
                            new_value: None,
                        });
                    }
                }

                // Vérifier les clés ajoutées
                for (key, new_value) in new_map {
                    if !old_map.contains_key(key) {
                        let current_path = if path.is_empty() {
                            key.clone()
                        } else {
                            format!("{}.{}", path, key)
                        };

                        self.changes.push(Change {
                            path: current_path,
                            change_type: ChangeType::Added,
                            old_value: None,
                            new_value: Some(new_value.clone()),
                        });
                    }
                }
            }

            // Les deux sont des tableaux
            (Value::Array(old_arr), Value::Array(new_arr)) => {
                let max_len = old_arr.len().max(new_arr.len());

                for i in 0..max_len {
                    let current_path = format!("{}[{}]", path, i);

                    match (old_arr.get(i), new_arr.get(i)) {
                        (Some(old_val), Some(new_val)) => {
                            self.compare_values(old_val, new_val, current_path);
                        }
                        (Some(old_val), None) => {
                            self.changes.push(Change {
                                path: current_path,
                                change_type: ChangeType::Removed,
                                old_value: Some(old_val.clone()),
                                new_value: None,
                            });
                        }
                        (None, Some(new_val)) => {
                            self.changes.push(Change {
                                path: current_path,
                                change_type: ChangeType::Added,
                                old_value: None,
                                new_value: Some(new_val.clone()),
                            });
                        }
                        (None, None) => {}
                    }
                }
            }

            // Valeurs primitives
            _ => {
                if old != new {
                    self.changes.push(Change {
                        path,
                        change_type: ChangeType::Modified,
                        old_value: Some(old.clone()),
                        new_value: Some(new.clone()),
                    });
                }
            }
        }
    }

    /// Calcule les statistiques
    fn compute_stats(&mut self) {
        self.total_changes = self.changes.len();
        self.additions = self
            .changes
            .iter()
            .filter(|c| c.change_type == ChangeType::Added)
            .count();
        self.removals = self
            .changes
            .iter()
            .filter(|c| c.change_type == ChangeType::Removed)
            .count();
        self.modifications = self
            .changes
            .iter()
            .filter(|c| c.change_type == ChangeType::Modified)
            .count();
    }

    /// Vérifie s'il y a des changements
    pub fn has_changes(&self) -> bool {
        !self.changes.is_empty()
    }

    /// Retourne les changements par type
    pub fn by_type(&self, change_type: ChangeType) -> Vec<&Change> {
        self.changes
            .iter()
            .filter(|c| c.change_type == change_type)
            .collect()
    }

    /// Applique le diff à un état (patch forward)
    pub fn apply(&self, data: &str) -> Result<String, String> {
        let mut value: Value =
            serde_json::from_str(data).map_err(|e| format!("Failed to parse data: {}", e))?;

        for change in &self.changes {
            match change.change_type {
                ChangeType::Added | ChangeType::Modified => {
                    if let Some(new_val) = &change.new_value {
                        set_value_at_path(&mut value, &change.path, new_val.clone())?;
                    }
                }
                ChangeType::Removed => {
                    remove_value_at_path(&mut value, &change.path)?;
                }
                ChangeType::Unchanged => {}
            }
        }

        serde_json::to_string(&value).map_err(|e| format!("Failed to serialize result: {}", e))
    }

    /// Inverse le diff (pour undo)
    pub fn inverse(&self) -> TemporalDiff {
        let mut inverted = TemporalDiff::new();

        for change in &self.changes {
            inverted.changes.push(Change {
                path: change.path.clone(),
                change_type: match change.change_type {
                    ChangeType::Added => ChangeType::Removed,
                    ChangeType::Removed => ChangeType::Added,
                    ChangeType::Modified => ChangeType::Modified,
                    ChangeType::Unchanged => ChangeType::Unchanged,
                },
                old_value: change.new_value.clone(),
                new_value: change.old_value.clone(),
            });
        }

        inverted.compute_stats();
        inverted
    }

    /// Retourne un résumé textuel
    pub fn summary(&self) -> String {
        format!(
            "{} changes: +{} additions, -{} removals, ~{} modifications",
            self.total_changes, self.additions, self.removals, self.modifications
        )
    }
}

/// Définit une valeur à un chemin JSON
fn set_value_at_path(root: &mut Value, path: &str, value: Value) -> Result<(), String> {
    if path.is_empty() {
        *root = value;
        return Ok(());
    }

    let parts: Vec<&str> = path.split('.').collect();
    let mut current = root;

    for (i, part) in parts.iter().enumerate() {
        let is_last = i == parts.len() - 1;

        // Gérer les indices de tableau
        if let Some(idx_start) = part.find('[') {
            let key = &part[..idx_start];
            let idx_str = &part[idx_start + 1..part.len() - 1];
            let idx: usize = idx_str.parse().map_err(|_| "Invalid array index")?;

            if !key.is_empty() {
                current = current
                    .as_object_mut()
                    .ok_or("Expected object")?
                    .entry(key)
                    .or_insert(Value::Array(Vec::new()));
            }

            let arr = current.as_array_mut().ok_or("Expected array")?;
            while arr.len() <= idx {
                arr.push(Value::Null);
            }

            if is_last {
                arr[idx] = value.clone();
                return Ok(());
            } else {
                current = &mut arr[idx];
            }
        } else if is_last {
            current
                .as_object_mut()
                .ok_or("Expected object")?
                .insert(part.to_string(), value.clone());
            return Ok(());
        } else {
            current = current
                .as_object_mut()
                .ok_or("Expected object")?
                .entry(part.to_string())
                .or_insert(Value::Object(serde_json::Map::new()));
        }
    }

    Ok(())
}

/// Supprime une valeur à un chemin JSON
fn remove_value_at_path(root: &mut Value, path: &str) -> Result<(), String> {
    if path.is_empty() {
        return Err("Cannot remove root".to_string());
    }

    let parts: Vec<&str> = path.split('.').collect();

    if parts.len() == 1 {
        // Clé directe
        if let Some(obj) = root.as_object_mut() {
            obj.remove(parts[0]);
        }
        return Ok(());
    }

    // Naviguer jusqu'au parent
    let mut current = root;
    for part in parts.iter().take(parts.len() - 1) {
        if let Some(obj) = current.as_object_mut() {
            if let Some(next) = obj.get_mut(*part) {
                current = next;
            } else {
                return Ok(()); // Chemin n'existe pas
            }
        } else {
            return Ok(());
        }
    }

    // Supprimer la dernière clé
    if let Some(last_key) = parts.last() {
        if let Some(obj) = current.as_object_mut() {
            obj.remove(*last_key);
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diff_basic() {
        let old = r#"{"name": "test", "value": 1}"#;
        let new = r#"{"name": "test", "value": 2}"#;

        let diff = TemporalDiff::compute(old, new).unwrap();

        assert!(diff.has_changes());
        assert_eq!(diff.modifications, 1);
        assert_eq!(diff.changes[0].path, "value");
    }

    #[test]
    fn test_diff_added() {
        let old = r#"{"name": "test"}"#;
        let new = r#"{"name": "test", "value": 42}"#;

        let diff = TemporalDiff::compute(old, new).unwrap();

        assert_eq!(diff.additions, 1);
        assert_eq!(diff.changes[0].change_type, ChangeType::Added);
    }

    #[test]
    fn test_diff_removed() {
        let old = r#"{"name": "test", "value": 42}"#;
        let new = r#"{"name": "test"}"#;

        let diff = TemporalDiff::compute(old, new).unwrap();

        assert_eq!(diff.removals, 1);
        assert_eq!(diff.changes[0].change_type, ChangeType::Removed);
    }

    #[test]
    fn test_diff_inverse() {
        let old = r#"{"value": 1}"#;
        let new = r#"{"value": 2}"#;

        let diff = TemporalDiff::compute(old, new).unwrap();
        let inverse = diff.inverse();

        assert_eq!(inverse.changes[0].old_value, diff.changes[0].new_value);
        assert_eq!(inverse.changes[0].new_value, diff.changes[0].old_value);
    }

    #[test]
    fn test_no_changes() {
        let data = r#"{"name": "test", "value": 42}"#;

        let diff = TemporalDiff::compute(data, data).unwrap();

        assert!(!diff.has_changes());
        assert_eq!(diff.total_changes, 0);
    }
}
