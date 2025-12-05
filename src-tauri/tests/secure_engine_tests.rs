// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — SECURE ENGINE TESTS
//   Validation des helpers AES-256-GCM + Argon2id + purge .env
// ═══════════════════════════════════════════════════════════════

use std::fs;

use titane_infinity::secure_engine::{
    decrypt_secret, derive_key_from_passphrase, encrypt_secret, purge_env_key,
};

#[test]
fn test_key_derivation_produces_stable_length() {
    let passphrase = "titanium-unbreakable";
    let salt = [0u8; 16];
    let key = derive_key_from_passphrase(passphrase, &salt).expect("key derivation");
    assert_eq!(key.len(), 32);
}

#[test]
fn test_encrypt_decrypt_roundtrip() {
    let passphrase = "super-secret-passphrase";
    let secret = b"HELLO_TITANE_INFINITY";

    let payload = encrypt_secret(passphrase, secret).expect("encrypt");
    let decrypted = decrypt_secret(passphrase, &payload).expect("decrypt");
    assert_eq!(decrypted, secret);
}

#[tokio::test]
async fn test_purge_env_key_removes_line() {
    let temp_dir = tempfile::tempdir().expect("temp dir");
    let env_path = temp_dir.path().join(".env");
    fs::write(&env_path, "FOO=bar\nGEMINI_API_KEY=abc123\n").expect("write env");

    let original_dir = std::env::current_dir().expect("cwd");
    std::env::set_current_dir(temp_dir.path()).expect("chdir");

    purge_env_key("GEMINI_API_KEY").await.expect("purge env");

    let contents = fs::read_to_string(&env_path).expect("read env");
    assert!(!contents.contains("GEMINI_API_KEY"));
    assert!(contents.contains("FOO=bar"));

    std::env::set_current_dir(original_dir).expect("restore dir");
}
