#![allow(dead_code)]
//! 🎯 BEHAVIORAL SYNCHRONIZATION ENGINE
//! Synchronisation comportementale avec patterns Kevin

use std::collections::{VecDeque, HashMap};

pub struct BehaviorSynchronizer {
    interaction_patterns: VecDeque<String>,
    word_frequency: HashMap<String, usize>,
}

impl BehaviorSynchronizer {
    pub fn new() -> Self {
        Self {
            interaction_patterns: VecDeque::with_capacity(100),
            word_frequency: HashMap::new(),
        }
    }
    
    /// Synchroniser avec le comportement actuel
    pub fn synchronize(&mut self, input: &str) {
        self.interaction_patterns.push_back(input.to_string());
        
        if self.interaction_patterns.len() > 100 {
            self.interaction_patterns.pop_front();
        }
        
        // Analyser fréquence des mots
        for word in input.split_whitespace() {
            let normalized = word.to_lowercase();
            *self.word_frequency.entry(normalized).or_insert(0) += 1;
        }
    }
    
    /// Détecter les mots récurrents (patterns comportementaux)
    pub fn get_recurring_words(&self, threshold: usize) -> Vec<String> {
        self.word_frequency
            .iter()
            .filter(|(_, count)| **count >= threshold)
            .map(|(word, _)| word.clone())
            .collect()
    }
}
