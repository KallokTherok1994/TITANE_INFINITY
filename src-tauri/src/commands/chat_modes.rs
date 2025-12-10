// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v19.2Ω — CHAT MODES MODULE (Rust)
// ═══════════════════════════════════════════════════════════════════════════
// Système de modes de chat avec validation et filtrage sécurité
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES FONDAMENTAUX
// ─────────────────────────────────────────────────────────────────────────────

/// Identifiants de modes de chat (synchronisé avec TypeScript)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChatModeId {
    Default,
    Brainstorming,
    Synthesis,
    Planning,
    Journal,
    DebugCognitive,
    Coach,
    Dev,
    Admin,
    Strategy,
    Audit,
}

impl Default for ChatModeId {
    fn default() -> Self {
        ChatModeId::Default
    }
}

impl ChatModeId {
    /// Parse depuis string (safe)
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "default" => Some(ChatModeId::Default),
            "brainstorming" => Some(ChatModeId::Brainstorming),
            "synthesis" => Some(ChatModeId::Synthesis),
            "planning" => Some(ChatModeId::Planning),
            "journal" => Some(ChatModeId::Journal),
            "debug_cognitive" => Some(ChatModeId::DebugCognitive),
            "coach" => Some(ChatModeId::Coach),
            "dev" => Some(ChatModeId::Dev),
            "admin" => Some(ChatModeId::Admin),
            "strategy" => Some(ChatModeId::Strategy),
            "audit" => Some(ChatModeId::Audit),
            _ => None,
        }
    }

    /// Convertit en string
    pub fn as_str(&self) -> &'static str {
        match self {
            ChatModeId::Default => "default",
            ChatModeId::Brainstorming => "brainstorming",
            ChatModeId::Synthesis => "synthesis",
            ChatModeId::Planning => "planning",
            ChatModeId::Journal => "journal",
            ChatModeId::DebugCognitive => "debug_cognitive",
            ChatModeId::Coach => "coach",
            ChatModeId::Dev => "dev",
            ChatModeId::Admin => "admin",
            ChatModeId::Strategy => "strategy",
            ChatModeId::Audit => "audit",
        }
    }

    /// Niveau de permission requis (0-5)
    pub fn permission_level(&self) -> u8 {
        match self {
            ChatModeId::Default => 1,
            ChatModeId::Brainstorming => 1,
            ChatModeId::Synthesis => 1,
            ChatModeId::Planning => 2,
            ChatModeId::Journal => 1,
            ChatModeId::DebugCognitive => 1,
            ChatModeId::Coach => 2,
            ChatModeId::Dev => 3,
            ChatModeId::Admin => 5,
            ChatModeId::Strategy => 2,
            ChatModeId::Audit => 4,
        }
    }

    /// Outils autorisés pour ce mode
    pub fn allowed_tools(&self) -> HashSet<&'static str> {
        let mut tools: HashSet<&'static str> = HashSet::new();

        // Outils de base (tous les modes)
        tools.insert("memory_access");
        tools.insert("context_analysis");
        tools.insert("suggestion_engine");

        match self {
            ChatModeId::Default => {
                tools.insert("brainstorm_assist");
                tools.insert("synthesis_tool");
                tools.insert("task_creation");
                tools.insert("planning_assist");
            }
            ChatModeId::Brainstorming => {
                tools.insert("brainstorm_assist");
                tools.insert("mind_mapping");
            }
            ChatModeId::Synthesis => {
                tools.insert("synthesis_tool");
                tools.insert("mind_mapping");
            }
            ChatModeId::Planning => {
                tools.insert("task_creation");
                tools.insert("planning_assist");
                tools.insert("reminder_set");
            }
            ChatModeId::Journal => {
                // Outils minimaux seulement
            }
            ChatModeId::DebugCognitive => {
                tools.insert("brainstorm_assist");
                tools.insert("synthesis_tool");
            }
            ChatModeId::Coach => {
                tools.insert("task_creation");
                tools.insert("planning_assist");
            }
            ChatModeId::Dev => {
                tools.insert("code_generation");
                tools.insert("code_review");
                tools.insert("debug_assist");
                tools.insert("system_analysis");
            }
            ChatModeId::Admin => {
                tools.insert("code_generation");
                tools.insert("code_review");
                tools.insert("debug_assist");
                tools.insert("system_analysis");
                tools.insert("file_system_access");
                tools.insert("shell_execution");
                tools.insert("config_modification");
                tools.insert("audit_logs");
            }
            ChatModeId::Strategy => {
                tools.insert("brainstorm_assist");
                tools.insert("synthesis_tool");
                tools.insert("system_analysis");
            }
            ChatModeId::Audit => {
                tools.insert("code_generation");
                tools.insert("code_review");
                tools.insert("debug_assist");
                tools.insert("system_analysis");
                tools.insert("audit_logs");
            }
        }

        tools
    }

    /// Vérifie si un outil est autorisé
    pub fn is_tool_allowed(&self, tool: &str) -> bool {
        self.allowed_tools().contains(tool)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION MODE
// ─────────────────────────────────────────────────────────────────────────────

/// Configuration runtime d'un mode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatModeConfig {
    pub id: ChatModeId,
    pub label: String,
    pub description: String,
    pub system_prompt: String,
    pub temperature: f32,
    pub max_tokens: u32,
    pub permission_level: u8,
}

impl ChatModeConfig {
    /// Récupère la config d'un mode
    pub fn get(mode_id: ChatModeId) -> Self {
        match mode_id {
            ChatModeId::Default => ChatModeConfig {
                id: mode_id,
                label: "Standard".to_string(),
                description: "Mode par défaut pour conversations générales".to_string(),
                system_prompt: "Tu es TITANE∞, une IA cognitive avancée. Tu es professionnelle, précise et tu réponds en français.".to_string(),
                temperature: 0.7,
                max_tokens: 2048,
                permission_level: 1,
            },
            ChatModeId::Brainstorming => ChatModeConfig {
                id: mode_id,
                label: "Brainstorming".to_string(),
                description: "Mode divergence créative".to_string(),
                system_prompt: "Tu es TITANE∞ en mode BRAINSTORMING. Encourage l'exploration libre, génère des variantes et alternatives sans jugement.".to_string(),
                temperature: 0.9,
                max_tokens: 3000,
                permission_level: 1,
            },
            ChatModeId::Dev => ChatModeConfig {
                id: mode_id,
                label: "Développeur".to_string(),
                description: "Mode technique - code, architecture".to_string(),
                system_prompt: "Tu es TITANE∞ en mode DÉVELOPPEUR. Génère du code propre, typé et documenté. Explique les concepts techniques clairement.".to_string(),
                temperature: 0.5,
                max_tokens: 4000,
                permission_level: 3,
            },
            ChatModeId::Admin => ChatModeConfig {
                id: mode_id,
                label: "Admin".to_string(),
                description: "Mode admin système (privilégié)".to_string(),
                system_prompt: "Tu es TITANE∞ en mode ADMIN SYSTÈME. Actions sensibles autorisées avec confirmation.".to_string(),
                temperature: 0.4,
                max_tokens: 3000,
                permission_level: 5,
            },
            // ... autres modes avec configs similaires
            _ => ChatModeConfig {
                id: mode_id,
                label: mode_id.as_str().to_string(),
                description: format!("Mode {}", mode_id.as_str()),
                system_prompt: format!("Tu es TITANE∞ en mode {}.", mode_id.as_str().to_uppercase()),
                temperature: 0.7,
                max_tokens: 2048,
                permission_level: mode_id.permission_level(),
            },
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION & SÉCURITÉ
// ─────────────────────────────────────────────────────────────────────────────

/// Erreurs de validation mode
#[derive(Debug, Clone, Serialize)]
pub enum ModeValidationError {
    InvalidModeId(String),
    InsufficientPermission { required: u8, actual: u8 },
    ToolNotAllowed(String),
    ModeDisabled,
}

impl std::fmt::Display for ModeValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModeValidationError::InvalidModeId(id) => {
                write!(f, "Invalid mode ID: '{}'", id)
            }
            ModeValidationError::InsufficientPermission { required, actual } => {
                write!(
                    f,
                    "Insufficient permission: required {}, got {}",
                    required, actual
                )
            }
            ModeValidationError::ToolNotAllowed(tool) => {
                write!(f, "Tool '{}' not allowed in this mode", tool)
            }
            ModeValidationError::ModeDisabled => {
                write!(f, "This mode is currently disabled")
            }
        }
    }
}

/// Validateur de mode
pub struct ModeValidator;

impl ModeValidator {
    /// Valide un mode_id depuis string
    pub fn validate_mode_id(mode_str: &str) -> Result<ChatModeId, ModeValidationError> {
        ChatModeId::from_str(mode_str)
            .ok_or_else(|| ModeValidationError::InvalidModeId(mode_str.to_string()))
    }

    /// Vérifie permission utilisateur
    pub fn check_permission(
        mode: ChatModeId,
        user_permission: u8,
    ) -> Result<(), ModeValidationError> {
        let required = mode.permission_level();
        if user_permission >= required {
            Ok(())
        } else {
            Err(ModeValidationError::InsufficientPermission {
                required,
                actual: user_permission,
            })
        }
    }

    /// Valide l'utilisation d'un outil
    pub fn validate_tool(mode: ChatModeId, tool: &str) -> Result<(), ModeValidationError> {
        if mode.is_tool_allowed(tool) {
            Ok(())
        } else {
            Err(ModeValidationError::ToolNotAllowed(tool.to_string()))
        }
    }

    /// Validation complète avant exécution
    pub fn validate_request(
        mode_str: &str,
        user_permission: u8,
        requested_tools: &[&str],
    ) -> Result<ChatModeId, ModeValidationError> {
        // 1. Valider mode_id
        let mode = Self::validate_mode_id(mode_str)?;

        // 2. Vérifier permission
        Self::check_permission(mode, user_permission)?;

        // 3. Valider chaque outil demandé
        for tool in requested_tools {
            Self::validate_tool(mode, tool)?;
        }

        Ok(mode)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mode_id_parsing() {
        assert_eq!(ChatModeId::from_str("default"), Some(ChatModeId::Default));
        assert_eq!(ChatModeId::from_str("dev"), Some(ChatModeId::Dev));
        assert_eq!(
            ChatModeId::from_str("DEBUG_COGNITIVE"),
            Some(ChatModeId::DebugCognitive)
        );
        assert_eq!(ChatModeId::from_str("invalid"), None);
    }

    #[test]
    fn test_permission_levels() {
        assert_eq!(ChatModeId::Default.permission_level(), 1);
        assert_eq!(ChatModeId::Dev.permission_level(), 3);
        assert_eq!(ChatModeId::Admin.permission_level(), 5);
    }

    #[test]
    fn test_tool_permissions() {
        // Admin a accès shell
        assert!(ChatModeId::Admin.is_tool_allowed("shell_execution"));
        // Dev n'a pas accès shell
        assert!(!ChatModeId::Dev.is_tool_allowed("shell_execution"));
        // Tous ont accès mémoire
        assert!(ChatModeId::Default.is_tool_allowed("memory_access"));
    }

    #[test]
    fn test_validator() {
        // Permission OK
        assert!(ModeValidator::check_permission(ChatModeId::Dev, 3).is_ok());
        // Permission insuffisante
        assert!(ModeValidator::check_permission(ChatModeId::Admin, 3).is_err());
        // Outil autorisé
        assert!(ModeValidator::validate_tool(ChatModeId::Dev, "code_generation").is_ok());
        // Outil interdit
        assert!(ModeValidator::validate_tool(ChatModeId::Journal, "shell_execution").is_err());
    }
}
