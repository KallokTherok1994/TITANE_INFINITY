#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      MEMORY COMPRESSOR v13                                   ║
// ║               Compression intelligente des conversations                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::{MemoryEntry, MemoryLevel};

/// Compresseur de mémoire intelligent
pub struct MemoryCompressor {
    /// Ratio de compression cible
    target_ratio: f32,
}

impl MemoryCompressor {
    /// Crée un nouveau compresseur
    pub fn new(target_ratio: f32) -> Self {
        Self {
            target_ratio: target_ratio.clamp(0.1, 0.9),
        }
    }

    /// Compresse une conversation en une entrée mémoire
    pub fn compress_conversation(&self, messages: &[Message]) -> MemoryEntry {
        let full_text = messages.iter()
            .map(|m| format!("{}: {}", m.role, m.content))
            .collect::<Vec<_>>()
            .join("\n");

        let importance = self.calculate_importance(messages);
        let mut entry = MemoryEntry::new(full_text.clone(), importance);

        // Générer résumé
        entry.summary = self.generate_summary(messages);

        // Générer contenu compressé
        entry.compressed_content = self.compress_text(&full_text);

        // Extraire indices de rappel
        entry.recall_indices = self.extract_recall_indices(messages);

        entry
    }

    /// Calcule l'importance d'une conversation
    fn calculate_importance(&self, messages: &[Message]) -> f32 {
        let mut score = 0.0;

        // Longueur (conversations plus longues = plus importantes)
        let length_score = (messages.len() as f32 / 20.0).min(0.3);
        score += length_score;

        // Présence de mots-clés importants
        let important_keywords = [
            "important", "crucial", "essentiel", "urgent",
            "problème", "solution", "décision", "stratégie",
            "objectif", "projet", "deadline", "priorité",
        ];

        let content = messages.iter()
            .map(|m| m.content.to_lowercase())
            .collect::<Vec<_>>()
            .join(" ");

        let keyword_count = important_keywords.iter()
            .filter(|k| content.contains(*k))
            .count();

        let keyword_score = (keyword_count as f32 / 5.0).min(0.3);
        score += keyword_score;

        // Présence d'entités nommées (approximatif)
        let has_names = content.chars().filter(|c| c.is_uppercase()).count() > 10;
        if has_names {
            score += 0.2;
        }

        // Émotions fortes
        let emotion_keywords = [
            "excité", "inquiet", "heureux", "triste", "frustré",
            "!!", "???", "excellent", "terrible", "génial",
        ];

        let emotion_count = emotion_keywords.iter()
            .filter(|k| content.contains(*k))
            .count();

        if emotion_count > 0 {
            score += 0.2;
        }

        score.clamp(0.0, 1.0)
    }

    /// Génère un résumé ultra-court
    fn generate_summary(&self, messages: &[Message]) -> String {
        if messages.is_empty() {
            return String::new();
        }

        // Prendre la première question/demande de l'utilisateur
        let user_query = messages.iter()
            .find(|m| m.role == "user")
            .map(|m| &m.content)
            .unwrap_or(&messages[0].content);

        // Limiter à 100 caractères
        if user_query.len() > 100 {
            format!("{}...", &user_query[..97])
        } else {
            user_query.clone()
        }
    }

    /// Compresse le texte
    fn compress_text(&self, text: &str) -> String {
        // Compression simple basée sur l'extraction des phrases clés
        let sentences: Vec<&str> = text.split(['.', '!', '?'])
            .filter(|s| !s.trim().is_empty())
            .collect();

        let target_count = ((sentences.len() as f32 * self.target_ratio) as usize).max(1);

        // Sélectionner les phrases les plus importantes
        let mut selected = Vec::new();
        
        for sentence in sentences.iter().take(target_count) {
            selected.push(*sentence);
        }

        selected.join(". ") + "."
    }

    /// Extrait les indices de rappel (tags/mots-clés)
    fn extract_recall_indices(&self, messages: &[Message]) -> Vec<String> {
        let content = messages.iter()
            .map(|m| m.content.to_lowercase())
            .collect::<Vec<_>>()
            .join(" ");

        let mut indices = Vec::new();

        // Extraction de mots-clés simples
        let words: Vec<&str> = content.split_whitespace().collect();
        
        // Mots importants (> 5 caractères, pas trop fréquents)
        let mut word_counts = std::collections::HashMap::new();
        for word in words.iter() {
            if word.len() > 5 {
                *word_counts.entry(*word).or_insert(0) += 1;
            }
        }

        // Sélectionner les 5 mots les plus fréquents
        let mut sorted: Vec<_> = word_counts.into_iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(&a.1));

        for (word, _) in sorted.iter().take(5) {
            indices.push(word.to_string());
        }

        indices
    }

    /// Compresse plusieurs entrées en une seule (consolidation)
    pub fn consolidate_entries(&self, entries: &[MemoryEntry]) -> MemoryEntry {
        let combined_content = entries.iter()
            .map(|e| &e.compressed_content)
            .cloned()
            .collect::<Vec<_>>()
            .join("\n\n");

        let avg_importance = entries.iter()
            .map(|e| e.importance)
            .sum::<f32>() / entries.len() as f32;

        let mut consolidated = MemoryEntry::new(combined_content.clone(), avg_importance);

        // Fusionner les indices de rappel
        let mut all_indices: Vec<String> = entries.iter()
            .flat_map(|e| e.recall_indices.clone())
            .collect();
        all_indices.sort();
        all_indices.dedup();
        consolidated.recall_indices = all_indices;

        // Promouvoir au niveau supérieur
        consolidated.level = match entries[0].level {
            MemoryLevel::ShortTerm => MemoryLevel::MediumTerm,
            MemoryLevel::MediumTerm => MemoryLevel::LongTerm,
            MemoryLevel::LongTerm => MemoryLevel::MetaSummary,
            MemoryLevel::MetaSummary => MemoryLevel::MetaSummary,
        };

        // Générer un méta-résumé
        consolidated.summary = self.generate_meta_summary(entries);

        // Compresser davantage
        consolidated.compressed_content = self.compress_text(&combined_content);

        consolidated
    }

    /// Génère un méta-résumé à partir de plusieurs entrées
    fn generate_meta_summary(&self, entries: &[MemoryEntry]) -> String {
        let summaries: Vec<_> = entries.iter()
            .map(|e| e.summary.as_str())
            .filter(|s| !s.is_empty())
            .collect();

        if summaries.is_empty() {
            return String::from("Consolidation de plusieurs conversations");
        }

        // Limiter à 150 caractères
        let combined = summaries.join(" | ");
        if combined.len() > 150 {
            format!("{}...", &combined[..147])
        } else {
            combined
        }
    }
}

/// Message simple
#[derive(Debug, Clone)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_importance_calculation() {
        let compressor = MemoryCompressor::new(0.5);
        
        let messages = vec![
            Message {
                role: "user".to_string(),
                content: "C'est très important et urgent !".to_string(),
            },
            Message {
                role: "assistant".to_string(),
                content: "Je comprends, c'est crucial.".to_string(),
            },
        ];

        let importance = compressor.calculate_importance(&messages);
        assert!(importance > 0.3);
    }

    #[test]
    fn test_summary_generation() {
        let compressor = MemoryCompressor::new(0.5);
        
        let messages = vec![
            Message {
                role: "user".to_string(),
                content: "Peux-tu m'aider avec un problème ?".to_string(),
            },
        ];

        let summary = compressor.generate_summary(&messages);
        assert!(!summary.is_empty());
        assert!(summary.len() <= 103); // 100 + "..."
    }

    #[test]
    fn test_text_compression() {
        let compressor = MemoryCompressor::new(0.5);
        
        let text = "First sentence. Second sentence. Third sentence. Fourth sentence.";
        let compressed = compressor.compress_text(text);
        
        assert!(compressed.len() < text.len());
        assert!(compressed.contains("."));
    }

    #[test]
    fn test_recall_indices_extraction() {
        let compressor = MemoryCompressor::new(0.5);
        
        let messages = vec![
            Message {
                role: "user".to_string(),
                content: "problème technique développement application mobile".to_string(),
            },
        ];

        let indices = compressor.extract_recall_indices(&messages);
        assert!(!indices.is_empty());
        assert!(indices.iter().all(|i| i.len() > 5));
    }
}
