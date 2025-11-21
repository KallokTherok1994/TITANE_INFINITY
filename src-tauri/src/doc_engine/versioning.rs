// Module de versionnement des documents

use super::*;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Version {
    pub version_number: String,
    pub document_id: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub author: String,
    pub changes: Vec<Change>,
    pub snapshot: Document,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Change {
    pub change_type: ChangeType,
    pub description: String,
    pub section_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChangeType {
    Created,
    Modified,
    Deleted,
    Merged,
}

pub struct VersioningEngine {
    versions: HashMap<String, Vec<Version>>,
}

impl VersioningEngine {
    pub fn new() -> Self {
        Self {
            versions: HashMap::new(),
        }
    }
    
    /// Crée une nouvelle version d'un document
    pub fn create_version(&mut self, document: Document, changes: Vec<Change>) -> Result<Version> {
        let document_id = document.metadata.id.clone();
        let current_version = self.get_latest_version_number(&document_id);
        let new_version_number = self.increment_version(&current_version);
        
        let version = Version {
            version_number: new_version_number.clone(),
            document_id: document_id.clone(),
            created_at: chrono::Utc::now(),
            author: document.metadata.author.clone(),
            changes,
            snapshot: document,
        };
        
        self.versions
            .entry(document_id)
            .or_insert_with(Vec::new)
            .push(version.clone());
        
        Ok(version)
    }
    
    /// Récupère toutes les versions d'un document
    pub fn get_versions(&self, document_id: &str) -> Vec<&Version> {
        self.versions
            .get(document_id)
            .map(|versions| versions.iter().collect())
            .unwrap_or_default()
    }
    
    /// Récupère une version spécifique
    pub fn get_version(&self, document_id: &str, version_number: &str) -> Option<&Version> {
        self.versions
            .get(document_id)?
            .iter()
            .find(|v| v.version_number == version_number)
    }
    
    /// Restaure un document à une version antérieure
    pub fn restore_version(&self, document_id: &str, version_number: &str) -> Result<Document> {
        let version = self.get_version(document_id, version_number)
            .ok_or_else(|| DocEngineError::ValidationError("Version introuvable".to_string()))?;
        
        Ok(version.snapshot.clone())
    }
    
    /// Compare deux versions
    pub fn diff_versions(&self, document_id: &str, version_a: &str, version_b: &str) -> Result<Vec<Difference>> {
        let v_a = self.get_version(document_id, version_a)
            .ok_or_else(|| DocEngineError::ValidationError("Version A introuvable".to_string()))?;
        let v_b = self.get_version(document_id, version_b)
            .ok_or_else(|| DocEngineError::ValidationError("Version B introuvable".to_string()))?;
        
        Ok(self.compute_diff(&v_a.snapshot, &v_b.snapshot))
    }
    
    fn get_latest_version_number(&self, document_id: &str) -> String {
        self.versions
            .get(document_id)
            .and_then(|versions| versions.last())
            .map(|v| v.version_number.clone())
            .unwrap_or_else(|| "0.0.0".to_string())
    }
    
    fn increment_version(&self, current: &str) -> String {
        let parts: Vec<&str> = current.split('.').collect();
        if parts.len() != 3 {
            return "1.0.0".to_string();
        }
        
        let major: u32 = parts[0].parse().unwrap_or(0);
        let minor: u32 = parts[1].parse().unwrap_or(0);
        let patch: u32 = parts[2].parse().unwrap_or(0);
        
        format!("{}.{}.{}", major, minor, patch + 1)
    }
    
    fn compute_diff(&self, doc_a: &Document, doc_b: &Document) -> Vec<Difference> {
        let mut diffs = Vec::new();
        
        // Comparaison du titre
        if doc_a.content.title != doc_b.content.title {
            diffs.push(Difference {
                field: "title".to_string(),
                old_value: doc_a.content.title.clone(),
                new_value: doc_b.content.title.clone(),
            });
        }
        
        // Comparaison des sections
        for (idx, section_a) in doc_a.content.sections.iter().enumerate() {
            if let Some(section_b) = doc_b.content.sections.get(idx) {
                if section_a.content != section_b.content {
                    diffs.push(Difference {
                        field: format!("section_{}", section_a.id),
                        old_value: section_a.content.clone(),
                        new_value: section_b.content.clone(),
                    });
                }
            }
        }
        
        diffs
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Difference {
    pub field: String,
    pub old_value: String,
    pub new_value: String,
}

impl Default for VersioningEngine {
    fn default() -> Self {
        Self::new()
    }
}
