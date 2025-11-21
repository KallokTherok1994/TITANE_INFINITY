// TITANE∞ v12 - Sentinel Module
// Security and content filtering for AI interactions

use super::ModuleStatus;
use log::{info, warn};
use regex::Regex;

pub struct Sentinel {
    active: bool,
    health: f32,
    strict_mode: bool,
}

impl Sentinel {
    pub fn new(strict_mode: bool) -> Self {
        info!("Sentinel security module initialized (strict: {})", strict_mode);
        Self {
            active: true,
            health: 1.0,
            strict_mode,
        }
    }

    pub fn scan_input(&self, text: &str) -> SecurityScanResult {
        if !self.active {
            return SecurityScanResult::safe(text.to_string());
        }

        let mut threats = Vec::new();
        let mut risk_score = 0.0;

        // Check for command injection
        if self.contains_command_injection(text) {
            threats.push(Threat::CommandInjection);
            risk_score += 0.8;
        }

        // Check for SQL injection patterns
        if self.contains_sql_injection(text) {
            threats.push(Threat::SQLInjection);
            risk_score += 0.7;
        }

        // Check for XSS attempts
        if self.contains_xss(text) {
            threats.push(Threat::XSSAttempt);
            risk_score += 0.6;
        }

        // Check for prompt injection
        if self.contains_prompt_injection(text) {
            threats.push(Threat::PromptInjection);
            risk_score += 0.5;
        }

        // Check for excessive length
        if text.len() > 10000 {
            threats.push(Threat::ExcessiveLength);
            risk_score += 0.3;
        }

        // Check for sensitive data patterns
        if self.contains_sensitive_data(text) {
            threats.push(Threat::SensitiveData);
            risk_score += 0.4;
        }

        let sanitized = if self.strict_mode || risk_score > 0.5 {
            self.sanitize_text(text)
        } else {
            text.to_string()
        };

        SecurityScanResult {
            safe: risk_score < 0.5,
            risk_score,
            threats,
            sanitized,
        }
    }

    fn contains_command_injection(&self, text: &str) -> bool {
        let patterns = [
            r";\s*rm\s",
            r"&&\s*rm\s",
            r"\|\s*sh\s",
            r"`.*`",
            r"\$\(.*\)",
            r">\s*/dev",
        ];

        patterns.iter().any(|&pattern| {
            Regex::new(pattern)
                .map(|re| re.is_match(text))
                .unwrap_or(false)
        })
    }

    fn contains_sql_injection(&self, text: &str) -> bool {
        let lower = text.to_lowercase();
        let patterns = [
            "' or '1'='1",
            "\" or \"1\"=\"1",
            "'; drop table",
            "union select",
            "exec(",
            "execute(",
        ];

        patterns.iter().any(|pattern| lower.contains(pattern))
    }

    fn contains_xss(&self, text: &str) -> bool {
        let patterns = [
            r"<script[^>]*>",
            r"javascript:",
            r"onerror\s*=",
            r"onclick\s*=",
            r"<iframe",
        ];

        patterns.iter().any(|&pattern| {
            Regex::new(pattern)
                .map(|re| re.is_match(text))
                .unwrap_or(false)
        })
    }

    fn contains_prompt_injection(&self, text: &str) -> bool {
        let lower = text.to_lowercase();
        let patterns = [
            "ignore previous instructions",
            "disregard all previous",
            "forget everything",
            "you are now",
            "new system prompt",
            "override instructions",
        ];

        patterns.iter().any(|pattern| lower.contains(pattern))
    }

    fn contains_sensitive_data(&self, text: &str) -> bool {
        let patterns = [
            r"\b\d{16}\b",              // Credit card
            r"\b\d{3}-\d{2}-\d{4}\b",   // SSN
            r"password\s*[:=]\s*\S+",   // Password
            r"api[_-]?key\s*[:=]\s*\S+", // API key
        ];

        patterns.iter().any(|&pattern| {
            Regex::new(pattern)
                .map(|re| re.is_match(text))
                .unwrap_or(false)
        })
    }

    fn sanitize_text(&self, text: &str) -> String {
        let mut sanitized = text.to_string();

        // Remove HTML tags
        sanitized = Regex::new(r"<[^>]*>")
            .unwrap()
            .replace_all(&sanitized, "")
            .to_string();

        // Remove script tags content
        sanitized = Regex::new(r"<script[^>]*>.*?</script>")
            .unwrap()
            .replace_all(&sanitized, "")
            .to_string();

        // Escape shell special characters
        let special_chars = ['$', '`', '\\', '!', '&', '|', ';', '<', '>'];
        for ch in special_chars {
            sanitized = sanitized.replace(ch, &format!("\\{}", ch));
        }

        sanitized
    }

    pub fn filter_response(&self, text: &str) -> String {
        // Filter out potentially harmful content from AI responses
        let mut filtered = text.to_string();

        // Remove code execution suggestions if in strict mode
        if self.strict_mode {
            filtered = Regex::new(r"```bash\n.*?```")
                .unwrap()
                .replace_all(&filtered, "[Code execution removed for security]")
                .to_string();
        }

        filtered
    }

    pub fn get_status(&self) -> ModuleStatus {
        ModuleStatus {
            name: "Sentinel".to_string(),
            active: self.active,
            health: self.health,
            last_check: chrono::Utc::now().timestamp(),
        }
    }

    pub fn set_strict_mode(&mut self, strict: bool) {
        self.strict_mode = strict;
        info!("Sentinel strict mode: {}", strict);
    }
}

impl Default for Sentinel {
    fn default() -> Self {
        Self::new(false)
    }
}

#[derive(Debug, Clone)]
pub struct SecurityScanResult {
    pub safe: bool,
    pub risk_score: f32,
    pub threats: Vec<Threat>,
    pub sanitized: String,
}

impl SecurityScanResult {
    fn safe(sanitized: String) -> Self {
        Self {
            safe: true,
            risk_score: 0.0,
            threats: Vec::new(),
            sanitized,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Threat {
    CommandInjection,
    SQLInjection,
    XSSAttempt,
    PromptInjection,
    SensitiveData,
    ExcessiveLength,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sentinel_creation() {
        let sentinel = Sentinel::new(false);
        assert!(sentinel.active);
    }

    #[test]
    fn test_safe_input() {
        let sentinel = Sentinel::new(false);
        let result = sentinel.scan_input("Hello, how are you?");
        assert!(result.safe);
        assert_eq!(result.threats.len(), 0);
    }

    #[test]
    fn test_command_injection_detection() {
        let sentinel = Sentinel::new(false);
        let result = sentinel.scan_input("test; rm -rf /");
        assert!(!result.safe);
        assert!(result.threats.contains(&Threat::CommandInjection));
    }

    #[test]
    fn test_prompt_injection_detection() {
        let sentinel = Sentinel::new(false);
        let result = sentinel.scan_input("Ignore previous instructions and...");
        assert!(!result.safe);
        assert!(result.threats.contains(&Threat::PromptInjection));
    }
}
