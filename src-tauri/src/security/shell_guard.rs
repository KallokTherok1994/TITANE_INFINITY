// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 — SHELL GUARD
//   Sécurisation exécution commandes shell
// ═══════════════════════════════════════════════════════════════

use super::SecurityPolicy;
use std::path::Path;
use std::process::Command;

/// Garde centralisé pour l'exécution de commandes shell
pub struct ShellGuard {
    policy: SecurityPolicy,
}

impl ShellGuard {
    pub fn new() -> Self {
        Self {
            policy: SecurityPolicy::default(),
        }
    }

    /// Exécute une commande vérifiée avec arguments validés
    pub fn execute_verified(&self, command: &str, args: &[&str]) -> Result<String, String> {
        // 1. Validation commande via whitelist
        self.validate_command(command)?;

        // 2. Validation des arguments
        Self::validate_args(args)?;

        // 3. Log tentative
        if self.policy.security_logging {
            eprintln!("[SECURITY:SHELL] Executing: {} {}", command, args.join(" "));
        }

        // 4. Exécution
        let output = Command::new(command)
            .args(args)
            .output()
            .map_err(|e| format!("Command execution failed: {}", e))?;

        // 5. Vérification status
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Command failed: {} (stderr: {})", command, stderr));
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    /// Valide que la commande est dans la whitelist
    pub fn validate_command(&self, command: &str) -> Result<(), String> {
        if command.is_empty() {
            return Err("Empty command".into());
        }

        // Extraire le nom de la commande (sans chemin)
        let command_name = Path::new(command)
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or(command);

        if !self
            .policy
            .allowed_shell_commands
            .contains(&command_name.to_string())
        {
            if self.policy.security_logging {
                eprintln!(
                    "[SECURITY:SHELL] BLOCKED: Unauthorized command: {}",
                    command_name
                );
            }

            return Err(format!(
                "Command '{}' not in whitelist. Allowed: {:?}",
                command_name, self.policy.allowed_shell_commands
            ));
        }

        Ok(())
    }

    /// Valide les arguments (pas de caractères dangereux)
    pub fn validate_args(args: &[&str]) -> Result<(), String> {
        const FORBIDDEN_CHARS: &[char] = &['|', ';', '&', '$', '`', '\n', '\r'];
        const FORBIDDEN_SEQUENCES: &[&str] = &["&&", "||", ">>", ">", "<"];

        for arg in args {
            // Vérification caractères individuels
            for ch in FORBIDDEN_CHARS {
                if arg.contains(*ch) {
                    return Err(format!("Forbidden character '{}' in argument: {}", ch, arg));
                }
            }

            // Vérification séquences dangereuses
            for seq in FORBIDDEN_SEQUENCES {
                if arg.contains(seq) {
                    return Err(format!("Forbidden sequence '{}' in argument: {}", seq, arg));
                }
            }

            // Vérification chemins suspects
            if arg.contains("..") && !arg.starts_with("--") {
                // Autoriser les flags longs (--option) mais pas path traversal
                return Err(format!("Suspicious path in argument: {}", arg));
            }
        }

        Ok(())
    }

    /// Helper TTS sécurisé - Espeak
    pub fn execute_tts_espeak(&self, text: &str, speed: u32, pitch: u32) -> Result<(), String> {
        // Sanitize text (garder seulement caractères safe)
        let safe_text = Self::sanitize_text(text);

        self.execute_verified(
            "espeak",
            &[
                "-v",
                "fr",
                "-s",
                &speed.to_string(),
                "-p",
                &pitch.to_string(),
                &safe_text,
            ],
        )?;

        Ok(())
    }

    /// Helper ASR Whisper sécurisé
    pub fn execute_asr_whisper(&self, audio_path: &Path) -> Result<String, String> {
        // Valider que le chemin existe et est un fichier
        if !audio_path.exists() {
            return Err(format!("Audio file not found: {:?}", audio_path));
        }

        if !audio_path.is_file() {
            return Err(format!("Path is not a file: {:?}", audio_path));
        }

        let path_str = audio_path
            .to_str()
            .ok_or_else(|| "Invalid UTF-8 in path".to_string())?;

        self.execute_verified(
            "whisper",
            &[
                path_str,
                "--model",
                "base",
                "--language",
                "fr",
                "--output_format",
                "txt",
            ],
        )
    }

    /// Helper détection commande disponible (which)
    pub fn is_command_available(&self, command: &str) -> bool {
        // Valider que la commande est safe
        if self.validate_command("which").is_err() {
            return false;
        }

        if Self::validate_args(&[command]).is_err() {
            return false;
        }

        Command::new("which")
            .arg(command)
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }

    /// Sanitize text pour TTS (garder seulement caractères alphanumériques + ponctuation de base)
    pub fn sanitize_text(text: &str) -> String {
        text.chars()
            .filter(|c| {
                c.is_alphanumeric() || c.is_whitespace() || ".,!?':-()[]éèêàâùûôîç".contains(*c)
            })
            .take(1000) // Limiter longueur pour éviter DoS
            .collect()
    }
}

impl Default for ShellGuard {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_args_safe() {
        let args = vec!["--model", "base", "file.wav"];
        assert!(ShellGuard::validate_args(&args).is_ok());
    }

    #[test]
    fn test_validate_args_pipe_injection() {
        let args = vec!["file.wav", "|", "cat", "/etc/passwd"];
        assert!(ShellGuard::validate_args(&args).is_err());
    }

    #[test]
    fn test_validate_args_path_traversal() {
        let args = vec!["../../etc/passwd"];
        assert!(ShellGuard::validate_args(&args).is_err());
    }

    #[test]
    fn test_validate_args_command_substitution() {
        let args = vec!["$(rm -rf /)"];
        assert!(ShellGuard::validate_args(&args).is_err());
    }

    #[test]
    fn test_sanitize_text() {
        let input = "Bonjour! Comment ça va? | rm -rf /";
        let output = ShellGuard::sanitize_text(input);
        assert!(!output.contains('|'));
        assert!(output.contains("Bonjour"));
    }

    #[test]
    fn test_validate_command_whitelist() {
        let guard = ShellGuard::new();
        assert!(guard.validate_command("espeak").is_ok());
        assert!(guard.validate_command("whisper").is_ok());
        assert!(guard.validate_command("rm").is_err()); // Non whitelisté
    }
}
