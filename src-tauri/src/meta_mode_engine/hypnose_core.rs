#![allow(dead_code)]
//! 🌀 HYPNOSE CORE — Hypnose douce non médicale (Erickson)
//! Métaphores thérapeutiques + Suggestions permissives

pub struct HypnoseCore;

impl HypnoseCore {
    pub fn new() -> Self {
        Self
    }
    
    /// Exécution hypnose douce
    pub fn execute(&self, input: &str) -> String {
        self.therapeutic_metaphor(input)
    }
    
    fn therapeutic_metaphor(&self, _input: &str) -> String {
        "🌀 Imagine un arbre qui traverse une tempête... ses racines profondes le maintiennent stable, même quand le vent souffle fort. Toi aussi, tu as ces racines. [métaphore Erickson]".to_string()
    }
}
