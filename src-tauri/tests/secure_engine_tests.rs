// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — SECURE ENGINE TESTS
//   Validation des helpers AES-256-GCM + Argon2id + purge .env
// ═══════════════════════════════════════════════════════════════

use std::fs;

use titane_infinity::secure_engine::{
    decrypt_secret, derive_key_from_passphrase, encrypt_secret, purge_env_key, read_secret_file,
    write_secret_file,
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

#[tokio::test]
async fn test_write_secret_file_roundtrip_and_creates_parent() {
    let temp_dir = tempfile::tempdir().expect("temp dir");
    let secret_path = temp_dir.path().join("nested/secrets/payload.enc");
    let payload = b"encrypted-secret-payload";

    write_secret_file(&secret_path, payload)
        .await
        .expect("write secret file");

    let loaded = read_secret_file(&secret_path)
        .await
        .expect("read secret file");

    assert_eq!(loaded, payload);
}

#[cfg(unix)]
#[tokio::test]
async fn test_write_secret_file_sets_owner_only_permissions() {
    use std::os::unix::fs::PermissionsExt;

    let temp_dir = tempfile::tempdir().expect("temp dir");
    let secret_path = temp_dir.path().join("secret.enc");

    write_secret_file(&secret_path, b"top-secret")
        .await
        .expect("write secret file");

    let metadata = fs::metadata(&secret_path).expect("secret metadata");
    assert_eq!(metadata.permissions().mode() & 0o777, 0o600);
}
