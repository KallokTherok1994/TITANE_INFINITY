// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   PAYLOAD VALIDATION — Super-Prompt H
//   Validation stricte de tous les payloads entrants
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

const MAX_STRING_LENGTH: usize = 1_000_000; // 1 MB
const MAX_ARRAY_LENGTH: usize = 10_000;
const MAX_OBJECT_DEPTH: usize = 32;

/// Erreurs de validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidationError {
    TooLong(usize, usize),
    TooDeep(usize),
    InvalidFormat(String),
    ForbiddenCharacters(String),
    EmptyRequired(String),
    InvalidType(String),
    OutOfRange(String),
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            ValidationError::TooLong(actual, max) => {
                write!(f, "Payload too long: {} bytes (max {})", actual, max)
            }
            ValidationError::TooDeep(depth) => {
                write!(
                    f,
                    "Nesting too deep: {} levels (max {})",
                    depth, MAX_OBJECT_DEPTH
                )
            }
            ValidationError::InvalidFormat(msg) => write!(f, "Invalid format: {}", msg),
            ValidationError::ForbiddenCharacters(msg) => write!(f, "Forbidden characters: {}", msg),
            ValidationError::EmptyRequired(field) => {
                write!(f, "Required field '{}' is empty", field)
            }
            ValidationError::InvalidType(msg) => write!(f, "Invalid type: {}", msg),
            ValidationError::OutOfRange(msg) => write!(f, "Out of range: {}", msg),
        }
    }
}

/// Validateur de payloads
pub struct PayloadValidator;

impl PayloadValidator {
    /// Valider chaîne de caractères
    pub fn validate_string(
        s: &str,
        field_name: &str,
        required: bool,
    ) -> Result<(), ValidationError> {
        // Vérifier si vide
        if required && s.is_empty() {
            return Err(ValidationError::EmptyRequired(field_name.to_string()));
        }

        // Vérifier longueur
        if s.len() > MAX_STRING_LENGTH {
            return Err(ValidationError::TooLong(s.len(), MAX_STRING_LENGTH));
        }

        // Vérifier caractères de contrôle dangereux
        if s.contains('\0') {
            return Err(ValidationError::ForbiddenCharacters(
                "Null byte not allowed".to_string(),
            ));
        }

        // Vérifier caractères de contrôle ASCII < 32 (sauf whitespace)
        for ch in s.chars() {
            if ch.is_control() && ch != '\n' && ch != '\r' && ch != '\t' {
                return Err(ValidationError::ForbiddenCharacters(format!(
                    "Control character U+{:04X} not allowed",
                    ch as u32
                )));
            }
        }

        Ok(())
    }

    /// Valider JSON brut
    pub fn validate_json(json: &str) -> Result<serde_json::Value, ValidationError> {
        // Valider longueur
        if json.len() > MAX_STRING_LENGTH {
            return Err(ValidationError::TooLong(json.len(), MAX_STRING_LENGTH));
        }

        // Parser JSON
        let value: serde_json::Value = serde_json::from_str(json)
            .map_err(|e| ValidationError::InvalidFormat(format!("JSON parse error: {}", e)))?;

        // Vérifier profondeur
        Self::check_depth(&value, 0)?;

        Ok(value)
    }

    /// Vérifier profondeur de nesting JSON
    fn check_depth(value: &serde_json::Value, current_depth: usize) -> Result<(), ValidationError> {
        if current_depth > MAX_OBJECT_DEPTH {
            return Err(ValidationError::TooDeep(current_depth));
        }

        match value {
            serde_json::Value::Object(obj) => {
                for val in obj.values() {
                    Self::check_depth(val, current_depth + 1)?;
                }
            }
            serde_json::Value::Array(arr) => {
                if arr.len() > MAX_ARRAY_LENGTH {
                    return Err(ValidationError::TooLong(arr.len(), MAX_ARRAY_LENGTH));
                }
                for val in arr {
                    Self::check_depth(val, current_depth + 1)?;
                }
            }
            _ => {}
        }

        Ok(())
    }

    /// Valider nombre dans range
    pub fn validate_number<T: PartialOrd + std::fmt::Display>(
        value: T,
        min: T,
        max: T,
        field_name: &str,
    ) -> Result<(), ValidationError> {
        if value < min || value > max {
            return Err(ValidationError::OutOfRange(format!(
                "{} must be between {} and {}, got {}",
                field_name, min, max, value
            )));
        }
        Ok(())
    }

    /// Valider email
    pub fn validate_email(email: &str) -> Result<(), ValidationError> {
        Self::validate_string(email, "email", true)?;

        if !email.contains('@') || !email.contains('.') {
            return Err(ValidationError::InvalidFormat(
                "Invalid email format".to_string(),
            ));
        }

        Ok(())
    }

    /// Valider path (empêcher directory traversal)
    pub fn validate_path(path: &str) -> Result<(), ValidationError> {
        Self::validate_string(path, "path", true)?;

        // Empêcher directory traversal
        if path.contains("..") {
            return Err(ValidationError::ForbiddenCharacters(
                "Directory traversal not allowed (..)".to_string(),
            ));
        }

        // Empêcher chemins absolus non autorisés
        if path.starts_with('/') || path.starts_with('\\') {
            return Err(ValidationError::ForbiddenCharacters(
                "Absolute paths not allowed".to_string(),
            ));
        }

        // Windows drive letters
        if path.len() >= 2 && path.chars().nth(1) == Some(':') {
            return Err(ValidationError::ForbiddenCharacters(
                "Drive letters not allowed".to_string(),
            ));
        }

        Ok(())
    }

    /// Valider extension de fichier
    pub fn validate_file_extension(
        filename: &str,
        allowed: &[&str],
    ) -> Result<(), ValidationError> {
        Self::validate_string(filename, "filename", true)?;

        let ext = std::path::Path::new(filename)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");

        if !allowed.contains(&ext) {
            return Err(ValidationError::InvalidFormat(format!(
                "File extension '{}' not allowed. Allowed: {:?}",
                ext, allowed
            )));
        }

        Ok(())
    }

    /// Sanitize HTML (empêcher XSS)
    pub fn sanitize_html(html: &str) -> String {
        html.replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&#x27;")
            .replace('&', "&amp;")
    }

    /// Échapper caractères spéciaux SQL
    pub fn escape_sql(s: &str) -> String {
        s.replace('\'', "''")
            .replace('\\', "\\\\")
            .replace('\0', "")
    }

    /// Valider UUID v4
    pub fn validate_uuid(uuid: &str) -> Result<(), ValidationError> {
        let parts: Vec<&str> = uuid.split('-').collect();
        if parts.len() != 5 {
            return Err(ValidationError::InvalidFormat(
                "Invalid UUID format".to_string(),
            ));
        }

        if parts[0].len() != 8
            || parts[1].len() != 4
            || parts[2].len() != 4
            || parts[3].len() != 4
            || parts[4].len() != 12
        {
            return Err(ValidationError::InvalidFormat(
                "Invalid UUID format".to_string(),
            ));
        }

        for part in parts {
            if !part.chars().all(|c| c.is_ascii_hexdigit()) {
                return Err(ValidationError::InvalidFormat(
                    "Invalid UUID characters".to_string(),
                ));
            }
        }

        Ok(())
    }
}

/// Macro pour validation facile
#[macro_export]
macro_rules! validate {
    (string $s:expr, $field:expr) => {
        $crate::security::validation::PayloadValidator::validate_string($s, $field, true)?
    };
    (string_opt $s:expr, $field:expr) => {
        $crate::security::validation::PayloadValidator::validate_string($s, $field, false)?
    };
    (json $json:expr) => {
        $crate::security::validation::PayloadValidator::validate_json($json)?
    };
    (number $n:expr, $min:expr, $max:expr, $field:expr) => {
        $crate::security::validation::PayloadValidator::validate_number($n, $min, $max, $field)?
    };
    (path $p:expr) => {
        $crate::security::validation::PayloadValidator::validate_path($p)?
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_string() {
        assert!(PayloadValidator::validate_string("hello", "test", true).is_ok());
        assert!(PayloadValidator::validate_string("", "test", false).is_ok());
        assert!(PayloadValidator::validate_string("", "test", true).is_err());
        assert!(PayloadValidator::validate_string("hello\0world", "test", true).is_err());
    }

    #[test]
    fn test_validate_json() {
        assert!(PayloadValidator::validate_json(r#"{"key": "value"}"#).is_ok());
        assert!(PayloadValidator::validate_json(r#"invalid"#).is_err());

        // Test profondeur excessive
        let deep = format!(r#"{{"a": {}}}"#, "{}".repeat(40));
        assert!(PayloadValidator::validate_json(&deep).is_err());
    }

    #[test]
    fn test_validate_path() {
        assert!(PayloadValidator::validate_path("folder/file.txt").is_ok());
        assert!(PayloadValidator::validate_path("../etc/passwd").is_err());
        assert!(PayloadValidator::validate_path("/etc/passwd").is_err());
        assert!(PayloadValidator::validate_path("C:\\Windows").is_err());
    }

    #[test]
    fn test_validate_file_extension() {
        assert!(PayloadValidator::validate_file_extension("file.txt", &["txt", "md"]).is_ok());
        assert!(PayloadValidator::validate_file_extension("file.exe", &["txt", "md"]).is_err());
    }

    #[test]
    fn test_sanitize_html() {
        let dirty = "<script>alert('XSS')</script>";
        let clean = PayloadValidator::sanitize_html(dirty);
        assert!(!clean.contains("<script>"));
    }
}
