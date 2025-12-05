// TITANE∞ v13 - Intelligent Document Indexer
// Indexation intelligente avec chunking sémantique et hiérarchisation

use crate::semantic::{DocumentChunk, IndexedDocument};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

/// Configuration de l'indexer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexerConfig {
    pub chunk_size: usize,
    pub chunk_overlap: usize,
    pub preserve_sentences: bool,
    pub preserve_paragraphs: bool,
    pub min_chunk_size: usize,
    pub max_chunk_size: usize,
}

impl Default for IndexerConfig {
    fn default() -> Self {
        Self {
            chunk_size: 512,
            chunk_overlap: 128,
            preserve_sentences: true,
            preserve_paragraphs: true,
            min_chunk_size: 100,
            max_chunk_size: 1024,
        }
    }
}

/// Indexer de documents
pub struct DocumentIndexer {
    config: IndexerConfig,
}

impl DocumentIndexer {
    pub fn new(config: IndexerConfig) -> Self {
        Self { config }
    }

    /// Indexe un document avec chunking intelligent
    pub fn index_document(
        &self,
        id: String,
        title: String,
        content: String,
        doc_type: String,
        metadata: HashMap<String, String>,
    ) -> IndexedDocument {
        let chunks = self.chunk_document(&content);

        IndexedDocument {
            id,
            title,
            content,
            doc_type,
            metadata,
            embedding: Vec::new(), // Sera généré plus tard par l'embedder
            chunks,
            indexed_at: chrono::Utc::now(),
        }
    }

    /// Découpe un document en chunks intelligents
    pub fn chunk_document(&self, content: &str) -> Vec<DocumentChunk> {
        let mut chunks = Vec::new();

        // Détection de la structure
        let sections = self.detect_sections(content);

        if !sections.is_empty() {
            // Si des sections sont détectées, chunk par section
            for (section_title, section_content, start_pos) in sections {
                let section_chunks = self.chunk_section(&section_content, start_pos, Some(section_title));
                chunks.extend(section_chunks);
            }
        } else {
            // Sinon, chunk le contenu complet
            chunks = self.chunk_section(content, 0, None);
        }

        chunks
    }

    /// Détecte les sections dans un document (Markdown, titres, etc.)
    fn detect_sections(&self, content: &str) -> Vec<(String, String, usize)> {
        let mut sections = Vec::new();
        let lines: Vec<&str> = content.lines().collect();
        let mut current_section: Option<(String, Vec<&str>, usize)> = None;
        let mut char_pos = 0;

        for line in lines {
            let line_len = line.len() + 1; // +1 pour le \n

            // Détection titre Markdown (# Titre)
            if line.trim_start().starts_with('#') {
                // Sauvegarde la section précédente
                if let Some((title, content_lines, start)) = current_section.take() {
                    let section_content = content_lines.join("\n");
                    sections.push((title, section_content, start));
                }

                // Commence une nouvelle section
                let title = line.trim_start().trim_start_matches('#').trim().to_string();
                current_section = Some((title, Vec::new(), char_pos));
            } else if let Some((_, ref mut content_lines, _)) = current_section {
                content_lines.push(line);
            } else {
                // Pas encore de section, crée une section par défaut
                current_section = Some(("Introduction".to_string(), vec![line], 0));
            }

            char_pos += line_len;
        }

        // Ajoute la dernière section
        if let Some((title, content_lines, start)) = current_section {
            let section_content = content_lines.join("\n");
            sections.push((title, section_content, start));
        }

        sections
    }

    /// Découpe une section en chunks
    fn chunk_section(
        &self,
        content: &str,
        base_offset: usize,
        section_title: Option<String>,
    ) -> Vec<DocumentChunk> {
        let mut chunks = Vec::new();

        if self.config.preserve_paragraphs {
            // Découpe par paragraphes
            let paragraphs = self.split_paragraphs(content);
            let mut current_chunk = String::new();
            let mut chunk_start = base_offset;

            for paragraph in paragraphs {
                if current_chunk.len() + paragraph.len() > self.config.max_chunk_size
                    && !current_chunk.is_empty()
                {
                    // Crée un chunk avec le contenu actuel
                    chunks.push(self.create_chunk(
                        &current_chunk,
                        chunk_start,
                        section_title.clone(),
                    ));
                    
                    // Démarre un nouveau chunk avec overlap
                    let overlap_text = self.get_overlap(&current_chunk);
                    current_chunk = overlap_text + "\n\n" + &paragraph;
                    chunk_start += current_chunk.len() - overlap_text.len();
                } else {
                    if !current_chunk.is_empty() {
                        current_chunk.push_str("\n\n");
                    }
                    current_chunk.push_str(&paragraph);
                }
            }

            // Ajoute le dernier chunk
            if !current_chunk.is_empty() && current_chunk.len() >= self.config.min_chunk_size {
                chunks.push(self.create_chunk(&current_chunk, chunk_start, section_title));
            }
        } else {
            // Découpe par taille fixe avec overlap
            chunks = self.chunk_by_size(content, base_offset, section_title);
        }

        chunks
    }

    /// Découpe par taille fixe avec overlap
    fn chunk_by_size(
        &self,
        content: &str,
        base_offset: usize,
        section_title: Option<String>,
    ) -> Vec<DocumentChunk> {
        let mut chunks = Vec::new();
        let chars: Vec<char> = content.chars().collect();
        let mut start = 0;

        while start < chars.len() {
            let end = (start + self.config.chunk_size).min(chars.len());
            let chunk_text: String = chars[start..end].iter().collect();

            if chunk_text.trim().len() >= self.config.min_chunk_size {
                chunks.push(self.create_chunk(
                    &chunk_text,
                    base_offset + start,
                    section_title.clone(),
                ));
            }

            start += self.config.chunk_size - self.config.chunk_overlap;
        }

        chunks
    }

    /// Crée un chunk avec ID unique
    fn create_chunk(
        &self,
        content: &str,
        start_pos: usize,
        section_title: Option<String>,
    ) -> DocumentChunk {
        DocumentChunk {
            id: Uuid::new_v4().to_string(),
            content: content.trim().to_string(),
            start_pos,
            end_pos: start_pos + content.len(),
            embedding: Vec::new(), // Sera généré plus tard
            section_title,
        }
    }

    /// Divise le texte en paragraphes
    fn split_paragraphs(&self, content: &str) -> Vec<String> {
        content
            .split("\n\n")
            .map(|p| p.trim())
            .filter(|p| !p.is_empty())
            .map(|p| p.to_string())
            .collect()
    }

    /// Extrait le texte d'overlap pour la continuité
    fn get_overlap(&self, text: &str) -> String {
        let chars: Vec<char> = text.chars().collect();
        let overlap_size = self.config.chunk_overlap.min(chars.len());
        let start = chars.len().saturating_sub(overlap_size);
        
        chars[start..].iter().collect()
    }

    /// Met à jour un document indexé (ré-indexation)
    pub fn reindex_document(&self, document: &mut IndexedDocument) {
        document.chunks = self.chunk_document(&document.content);
        document.indexed_at = chrono::Utc::now();
    }
}

/// Statistiques d'indexation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexStats {
    pub total_documents: usize,
    pub total_chunks: usize,
    pub avg_chunks_per_doc: f32,
    pub avg_chunk_size: f32,
    pub total_size_bytes: usize,
}

/// Gestionnaire d'index
pub struct IndexManager {
    indexer: DocumentIndexer,
    documents: HashMap<String, IndexedDocument>,
}

impl IndexManager {
    pub fn new(config: IndexerConfig) -> Self {
        Self {
            indexer: DocumentIndexer::new(config),
            documents: HashMap::new(),
        }
    }

    /// Ajoute un document à l'index
    pub fn add_document(
        &mut self,
        id: String,
        title: String,
        content: String,
        doc_type: String,
        metadata: HashMap<String, String>,
    ) -> String {
        let doc = self.indexer.index_document(id.clone(), title, content, doc_type, metadata);
        self.documents.insert(id.clone(), doc);
        id
    }

    /// Met à jour un document
    pub fn update_document(&mut self, id: &str, new_content: String) -> Result<(), String> {
        if let Some(doc) = self.documents.get_mut(id) {
            doc.content = new_content;
            self.indexer.reindex_document(doc);
            Ok(())
        } else {
            Err(format!("Document {} not found", id))
        }
    }

    /// Supprime un document
    pub fn remove_document(&mut self, id: &str) -> Option<IndexedDocument> {
        self.documents.remove(id)
    }

    /// Récupère un document
    pub fn get_document(&self, id: &str) -> Option<&IndexedDocument> {
        self.documents.get(id)
    }

    /// Liste tous les documents
    pub fn list_documents(&self) -> Vec<&IndexedDocument> {
        self.documents.values().collect()
    }

    /// Calcule les statistiques de l'index
    pub fn get_stats(&self) -> IndexStats {
        let total_documents = self.documents.len();
        let total_chunks: usize = self.documents.values().map(|d| d.chunks.len()).sum();
        let total_size_bytes: usize = self.documents.values().map(|d| d.content.len()).sum();

        let avg_chunks_per_doc = if total_documents > 0 {
            total_chunks as f32 / total_documents as f32
        } else {
            0.0
        };

        let avg_chunk_size = if total_chunks > 0 {
            total_size_bytes as f32 / total_chunks as f32
        } else {
            0.0
        };

        IndexStats {
            total_documents,
            total_chunks,
            avg_chunks_per_doc,
            avg_chunk_size,
            total_size_bytes,
        }
    }

    /// Recherche des documents par métadonnées
    pub fn search_by_metadata(
        &self,
        key: &str,
        value: &str,
    ) -> Vec<&IndexedDocument> {
        self.documents
            .values()
            .filter(|doc| {
                doc.metadata
                    .get(key)
                    .map(|v| v == value)
                    .unwrap_or(false)
            })
            .collect()
    }

    /// Recherche des documents par type
    pub fn search_by_type(&self, doc_type: &str) -> Vec<&IndexedDocument> {
        self.documents
            .values()
            .filter(|doc| doc.doc_type == doc_type)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_sections() {
        let indexer = DocumentIndexer::new(IndexerConfig::default());
        let content = "# Introduction\nCeci est l'intro.\n\n# Chapitre 1\nContenu du chapitre 1.";
        
        let sections = indexer.detect_sections(content);
        assert_eq!(sections.len(), 2);
        assert_eq!(sections[0].0, "Introduction");
        assert_eq!(sections[1].0, "Chapitre 1");
    }

    #[test]
    fn test_chunking() {
        let indexer = DocumentIndexer::new(IndexerConfig {
            chunk_size: 50,
            chunk_overlap: 10,
            preserve_sentences: true,
            preserve_paragraphs: false,
            min_chunk_size: 10,
            max_chunk_size: 100,
        });

        let content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        let chunks = indexer.chunk_document(content);

        assert!(!chunks.is_empty());
        assert!(chunks[0].content.len() <= 100);
    }

    #[test]
    fn test_index_manager() {
        let mut manager = IndexManager::new(IndexerConfig::default());
        
        let id = manager.add_document(
            "doc1".to_string(),
            "Test Document".to_string(),
            "This is a test document.".to_string(),
            "text".to_string(),
            HashMap::new(),
        );

        assert_eq!(id, "doc1");
        assert_eq!(manager.documents.len(), 1);

        let stats = manager.get_stats();
        assert_eq!(stats.total_documents, 1);
    }
}
