//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SECURITY ENGINE
//! Validation et protection du système
//! ═══════════════════════════════════════════════════════════════════════════════

use super::system_health::SystemHealth;

/// Limites de sécurité
#[derive(Clone, Debug)]
pub struct SecurityLimits {
    /// Taille maximale d'input (caractères)
    pub max_input_size: usize,
    /// Longueur maximale de message
    pub max_message_length: usize,
    /// Nombre maximum de requêtes par minute
    pub max_requests_per_minute: u32,
    /// Profondeur maximale de récursion
    pub max_recursion_depth: u32,
}

impl Default for SecurityLimits {
    fn default() -> Self {
        Self {
            max_input_size: 50_000,
            max_message_length: 32_000,
            max_requests_per_minute: 120,
            max_recursion_depth: 10,
        }
    }
}

/// Moteur de sécurité
pub struct SecurityEngine {
    limits: SecurityLimits,
    /// Patterns dangereux à bloquer
    blocked_patterns: Vec<String>,
}

impl SecurityEngine {
    /// Crée un nouveau moteur de sécurité
    pub fn new() -> Self {
        Self {
            limits: SecurityLimits::default(),
            blocked_patterns: vec![
                "../../../".to_string(),
                "eval(".to_string(),
                "<script".to_string(),
                "javascript:".to_string(),
                "data:text/html".to_string(),
            ],
        }
    }

    /// Crée avec des limites personnalisées
    pub fn with_limits(limits: SecurityLimits) -> Self {
        let mut engine = Self::new();
        engine.limits = limits;
        engine
    }

    /// Valide un input texte
    pub fn validate_input(&self, text: &str) -> Result<(), String> {
        // Vérifier la taille
        if text.len() > self.limits.max_input_size {
            return Err(format!(
                "Input trop grand: {} > {} caractères",
                text.len(),
                self.limits.max_input_size
            ));
        }

        // Vérifier les patterns dangereux
        let text_lower = text.to_lowercase();
        for pattern in &self.blocked_patterns {
            if text_lower.contains(&pattern.to_lowercase()) {
                return Err(format!("Pattern dangereux détecté: {}", pattern));
            }
        }

        // Vérifier les caractères de contrôle
        if text.chars().any(|c| c.is_control() && c != '\n' && c != '\r' && c != '\t') {
            return Err("Caractères de contrôle non autorisés".to_string());
        }

        Ok(())
    }

    /// Valide l'état système
    pub fn validate_system_state(&self, health: &SystemHealth) -> Result<(), String> {
        // Vérifier les valeurs aberrantes
        if health.cpu_load > 1.0 || health.cpu_load < 0.0 {
            return Err(format!("CPU load invalide: {}", health.cpu_load));
        }

        if health.memory_usage > 1.0 || health.memory_usage < 0.0 {
            return Err(format!("Memory usage invalide: {}", health.memory_usage));
        }

        if health.error_rate > 1.0 || health.error_rate < 0.0 {
            return Err(format!("Error rate invalide: {}", health.error_rate));
        }

        // Vérifier la cohérence
        if health.integrity < 0.0 || health.integrity > 1.0 {
            return Err(format!("Integrity invalide: {}", health.integrity));
        }

        Ok(())
    }

    /// Nettoie un input (sanitization)
    pub fn sanitize(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Supprimer les patterns dangereux
        for pattern in &self.blocked_patterns {
            result = result.replace(pattern, "");
        }

        // Supprimer les caractères de contrôle (garder newlines et tabs)
        result
            .chars()
            .filter(|&c| !c.is_control() || c == '\n' || c == '\r' || c == '\t')
            .collect()
    }

    /// Vérifie si un chemin est sûr
    pub fn is_safe_path(&self, path: &str) -> bool {
        !path.contains("..") && !path.starts_with('/') && !path.contains("://")
    }

    /// Ajoute un pattern à bloquer
    pub fn add_blocked_pattern(&mut self, pattern: &str) {
        self.blocked_patterns.push(pattern.to_string());
    }
}

impl Default for SecurityEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_input() {
        let engine = SecurityEngine::new();
        assert!(engine.validate_input("Bonjour le monde!").is_ok());
    }

    #[test]
    fn test_too_large_input() {
        let engine = SecurityEngine::new();
        let large = "a".repeat(100_000);
        assert!(engine.validate_input(&large).is_err());
    }

    #[test]
    fn test_dangerous_pattern() {
        let engine = SecurityEngine::new();
        assert!(engine.validate_input("../../../etc/passwd").is_err());
        assert!(engine.validate_input("<script>alert(1)</script>").is_err());
    }

    #[test]
    fn test_sanitize() {
        let engine = SecurityEngine::new();
        let dirty = "Hello../../../world";
        let clean = engine.sanitize(dirty);
        assert!(!clean.contains("../"));
    }

    #[test]
    fn test_safe_path() {
        let engine = SecurityEngine::new();
        assert!(engine.is_safe_path("folder/file.txt"));
        assert!(!engine.is_safe_path("../secret"));
        assert!(!engine.is_safe_path("/etc/passwd"));
    }

    #[test]
    fn test_validate_system_state() {
        let engine = SecurityEngine::new();
        let health = SystemHealth::healthy();
        assert!(engine.validate_system_state(&health).is_ok());

        let mut bad_health = SystemHealth::healthy();
        bad_health.cpu_load = 1.5; // Invalid
        assert!(engine.validate_system_state(&bad_health).is_err());
    }
}
