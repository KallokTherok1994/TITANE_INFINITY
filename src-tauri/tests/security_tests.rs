// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 — SECURITY TESTS
//   Validation des protections ShellGuard + StorageGuard
// ═══════════════════════════════════════════════════════════════

use std::env;
use std::path::PathBuf;

// Note: These tests reference modules from the main crate
// Run with: cargo test --test security_tests

#[test]
fn test_shell_injection_blocked() {
    // Test que les injections shell sont bloquées
    use titane_infinity::security::shell_guard::ShellGuard;

    let guard = ShellGuard::new();

    // Tentative injection avec pipe
    let result = guard.execute_verified("espeak", &["hello", "|", "cat", "/etc/passwd"]);
    assert!(result.is_err(), "Pipe injection devrait être bloqué");

    // Tentative injection avec semicolon
    let result = guard.execute_verified("espeak", &["hello; rm -rf /"]);
    assert!(result.is_err(), "Semicolon injection devrait être bloqué");

    // Tentative substitution commande
    let result = guard.execute_verified("espeak", &["$(whoami)"]);
    assert!(result.is_err(), "Command substitution devrait être bloqué");
}

#[test]
fn test_unauthorized_command_blocked() {
    use titane_infinity::security::shell_guard::ShellGuard;

    let guard = ShellGuard::new();

    // Commandes non whitelistées
    let result = guard.execute_verified("rm", &["-rf", "/"]);
    assert!(result.is_err(), "rm n'est pas whitelisté");

    let result = guard.execute_verified("curl", &["http://evil.com"]);
    assert!(result.is_err(), "curl n'est pas whitelisté");

    let result = guard.execute_verified("bash", &["-c", "echo pwned"]);
    assert!(result.is_err(), "bash n'est pas whitelisté");
}

#[test]
fn test_path_traversal_blocked() {
    use titane_infinity::security::storage_guard::StorageGuard;

    let temp_dir = env::temp_dir().join("titane_security_test");
    std::fs::create_dir_all(&temp_dir).unwrap();

    let guard = StorageGuard::new(temp_dir.clone());

    // Tentatives de path traversal
    let result = guard.validate_and_resolve("../../etc/passwd");
    assert!(
        result.is_err(),
        "Path traversal avec .. devrait être bloqué"
    );

    let result = guard.validate_and_resolve("subdir/../../../etc/passwd");
    assert!(
        result.is_err(),
        "Path traversal complexe devrait être bloqué"
    );

    // Cleanup
    let _ = std::fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_null_byte_injection_blocked() {
    use titane_infinity::security::storage_guard::StorageGuard;

    let temp_dir = env::temp_dir().join("titane_security_test2");
    std::fs::create_dir_all(&temp_dir).unwrap();

    let guard = StorageGuard::new(temp_dir.clone());

    // Null byte injection
    let result = guard.validate_and_resolve("file\0.txt");
    assert!(result.is_err(), "Null byte injection devrait être bloqué");

    // Cleanup
    let _ = std::fs::remove_dir_all(&temp_dir);
}

#[tokio::test]
async fn test_sandbox_enforcement() {
    use titane_infinity::security::storage_guard::StorageGuard;

    let temp_dir = env::temp_dir().join("titane_security_test3");
    std::fs::create_dir_all(&temp_dir).unwrap();

    let guard = StorageGuard::new(temp_dir.clone());

    // Écriture dans sandbox: OK
    let result = guard.safe_write_string("test.txt", "Hello TITANE").await;
    assert!(result.is_ok(), "Écriture dans sandbox devrait réussir");

    // Lecture dans sandbox: OK
    let content = guard.safe_read_string("test.txt").await;
    assert!(content.is_ok(), "Lecture dans sandbox devrait réussir");
    assert_eq!(content.unwrap(), "Hello TITANE");

    // Tentative sortie de sandbox via chemin absolu
    let result = guard.safe_write_string("/etc/pwned.txt", "HACK").await;
    assert!(result.is_err(), "Écriture hors sandbox devrait échouer");

    // Cleanup
    let _ = std::fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_filename_sanitization() {
    use titane_infinity::security::storage_guard::StorageGuard;

    // Caractères dangereux enlevés
    let safe = StorageGuard::sanitize_filename("hello|world.txt");
    assert_eq!(safe, "helloworld.txt");

    // Dots are preserved (leading dots kept)
    let safe = StorageGuard::sanitize_filename("../../etc/passwd");
    assert_eq!(safe, "....etcpasswd");

    // Pipes removed, hyphens preserved
    let safe = StorageGuard::sanitize_filename("file;rm -rf /.txt");
    assert_eq!(safe, "filerm-rf.txt");

    // Espaces enlevés
    let safe = StorageGuard::sanitize_filename("hello world.txt");
    assert_eq!(safe, "helloworld.txt");
}

#[test]
fn test_text_sanitization() {
    use titane_infinity::security::shell_guard::ShellGuard;

    // Injection dans texte TTS
    let input = "Bonjour! | rm -rf /";
    let safe = ShellGuard::sanitize_text(input);
    assert!(!safe.contains('|'), "Pipe devrait être enlevé");
    assert!(safe.contains("Bonjour"), "Texte légitime préservé");

    // Limite longueur
    let long_text = "a".repeat(2000);
    let safe = ShellGuard::sanitize_text(&long_text);
    assert!(
        safe.len() <= 1000,
        "Texte devrait être tronqué à 1000 chars"
    );
}

#[tokio::test]
async fn test_safe_operations_workflow() {
    use titane_infinity::security::storage_guard::StorageGuard;

    let temp_dir = env::temp_dir().join("titane_security_test4");
    std::fs::create_dir_all(&temp_dir).unwrap();

    let guard = StorageGuard::new(temp_dir.clone());

    // Workflow complet sécurisé

    // 1. Écriture
    guard
        .safe_write_string("data.json", r#"{"test": true}"#)
        .await
        .unwrap();

    // 2. Vérification existence
    assert!(guard.exists("data.json"));

    // 3. Lecture
    let content = guard.safe_read_string("data.json").await.unwrap();
    assert!(content.contains("test"));

    // 4. Liste fichiers (use "." instead of "" for current dir)
    let files = guard.safe_list_dir(".").await.unwrap();
    assert!(files.contains(&"data.json".to_string()));

    // 5. Suppression
    guard.safe_delete("data.json").await.unwrap();
    assert!(!guard.exists("data.json"));

    // Cleanup
    let _ = std::fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_whitelisted_command_allowed() {
    use titane_infinity::security::shell_guard::ShellGuard;

    let guard = ShellGuard::new();

    // Commandes whitelistées devraient passer validation
    // (mais peuvent échouer à l'exécution si non installées)

    // which est whitelisté
    let is_available = guard.is_command_available("espeak");
    // Peu importe le résultat (dépend de l'install), pas d'erreur de validation
    drop(is_available);

    // Validation seule (sans exécution)
    let result = guard.validate_command("espeak");
    assert!(result.is_ok(), "espeak devrait être whitelisté");

    let result = guard.validate_command("whisper");
    assert!(result.is_ok(), "whisper devrait être whitelisté");
}

#[test]
fn test_argument_validation() {
    use titane_infinity::security::shell_guard::ShellGuard;

    // Args sûrs
    let result = ShellGuard::validate_args(&["--model", "base", "file.wav"]);
    assert!(result.is_ok());

    // Args avec pipe
    let result = ShellGuard::validate_args(&["|", "cat"]);
    assert!(result.is_err());

    // Args avec semicolon
    let result = ShellGuard::validate_args(&["test;", "rm"]);
    assert!(result.is_err());

    // Args avec substitution
    let result = ShellGuard::validate_args(&["$(whoami)"]);
    assert!(result.is_err());

    // Args avec redirect
    let result = ShellGuard::validate_args(&["data", ">", "/etc/pwned"]);
    assert!(result.is_err());
}
