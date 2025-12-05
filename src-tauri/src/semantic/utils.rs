// TITANE∞ v13 - Semantic Utils
// Utilitaires pour le moteur sémantique

use std::collections::HashMap;

/// Normalise un texte pour la recherche
pub fn normalize_text(text: &str) -> String {
    text.to_lowercase()
        .trim()
        .to_string()
}

/// Extrait les mots-clés d'un texte
pub fn extract_keywords(text: &str, max_keywords: usize) -> Vec<String> {
    let words: Vec<String> = text
        .split_whitespace()
        .map(|w| w.to_lowercase())
        .filter(|w| w.len() > 3)
        .collect();

    let mut word_freq: HashMap<String, usize> = HashMap::new();
    for word in words {
        *word_freq.entry(word).or_insert(0) += 1;
    }

    let mut sorted: Vec<(String, usize)> = word_freq.into_iter().collect();
    sorted.sort_by(|a, b| b.1.cmp(&a.1));

    sorted
        .into_iter()
        .take(max_keywords)
        .map(|(word, _)| word)
        .collect()
}

/// Calcule la distance de Levenshtein
pub fn levenshtein_distance(s1: &str, s2: &str) -> usize {
    let len1 = s1.len();
    let len2 = s2.len();
    let mut matrix = vec![vec![0; len2 + 1]; len1 + 1];

    for i in 0..=len1 {
        matrix[i][0] = i;
    }
    for j in 0..=len2 {
        matrix[0][j] = j;
    }

    for (i, c1) in s1.chars().enumerate() {
        for (j, c2) in s2.chars().enumerate() {
            let cost = if c1 == c2 { 0 } else { 1 };
            matrix[i + 1][j + 1] = (matrix[i][j + 1] + 1)
                .min(matrix[i + 1][j] + 1)
                .min(matrix[i][j] + cost);
        }
    }

    matrix[len1][len2]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize() {
        assert_eq!(normalize_text("  Hello World  "), "hello world");
    }

    #[test]
    fn test_keywords() {
        let text = "This is a test document with some words and more words";
        let keywords = extract_keywords(text, 3);
        assert!(!keywords.is_empty());
    }

    #[test]
    fn test_levenshtein() {
        assert_eq!(levenshtein_distance("kitten", "sitting"), 3);
        assert_eq!(levenshtein_distance("hello", "hello"), 0);
    }
}
