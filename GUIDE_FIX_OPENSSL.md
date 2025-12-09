# 🔥 GUIDE — Correction OpenSSL Build Error (Phase 1)

## 🚨 Problème

```
error: failed to run custom build command for `openssl-sys v0.9.111`
Could not find directory of OpenSSL installation
```

**Cause**: Sur Ubuntu/Pop!_OS, `openssl-sys` ne trouve pas les headers OpenSSL.

---

## ✅ Solution (Pop!_OS / Ubuntu)

### Option 1: Installer pkg-config + openssl dev
```bash
sudo apt update
sudo apt install -y pkg-config libssl-dev build-essential
```

### Option 2: Variable d'environnement
```bash
export OPENSSL_DIR=/usr
cargo build
```

### Option 3: Feature flag `vendored`
Ajouter dans `Cargo.toml`:
```toml
[dependencies]
openssl = { version = "0.10", features = ["vendored"] }
```
> Compile OpenSSL localement, plus lent mais portable.

---

## 🧪 Validation

```bash
cd src-tauri
cargo build
cargo test errors::app_error --lib
```

**Résultat attendu**: Build réussi, tests passent.

---

## 📚 Référence

- Issue: https://github.com/sfackler/rust-openssl/issues/855
- Doc: https://docs.rs/openssl-sys/latest/openssl_sys/

---

**Phase 1 Stabilisation v20.0**
