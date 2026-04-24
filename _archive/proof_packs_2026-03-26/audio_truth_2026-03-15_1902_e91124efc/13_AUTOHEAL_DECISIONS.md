# 13 AUTOHEAL DECISIONS

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## AH-2026-03-15-0211

**Symptôme**: test_microphone avec device_id bloque indéfiniment (RUST_CAPTURE_NOT_CAUSAL)

**Cause prouvée**:

1. `Command::new("pw-record").output()` attend que pw-record se termine
2. pw-record ne se termine jamais sans signal externe
3. `PW_DURATION_LIMIT` est un env var inventé sans effet sur pw-record
4. Arecord fallback utilisait `hw:{wpctl_id},0` — les IDs wpctl (50,52...) ne correspondant pas aux IDs ALSA carte (0,1,2)

**Patch appliqué**:

```diff
- Command::new("pw-record")
-     .args(["--target", id, "--rate", "16000", "--channels", "1", "--format", "s16", &output_str])
-     .env("PW_DURATION_LIMIT", format!("{:.1}s", duration_secs))
-     .output()
-     .or_else(|_| {
-         Command::new("arecord")
-             .args(["-D", &format!("hw:{},0", id), "-d", ...])
+ let duration_arg = format!("{:.0}", duration_secs + 1.0);
+ Command::new("timeout")
+     .args([duration_arg.as_str(), "pw-record", "--target", id.as_str(),
+            "--rate", "16000", "--channels", "1", "--format", "s16", output_str.as_str()])
+     .output()
+     .or_else(|_| {
+         Command::new("arecord")
+             .args(["-d", &format!("{:.0}", duration_secs), "-f", "S16_LE", ...])
```

**Preuve de validité**:

- timeout disponible: /usr/bin/timeout (GNU coreutils 9.4)
- pw-record disponible: /usr/bin/pw-record
- Test live: `timeout 3 pw-record --target 52 ...` → 94876 bytes, exit 124 ✓
- cargo check: PASS ✓

**Rollback minimal**:

```bash
git restore -- src-tauri/src/audio/commands.rs
```

## Décisions AUTO-FIX / AUTO-HEAL non prises

| Décision évitée                 | Raison                                                           |
| ------------------------------- | ---------------------------------------------------------------- |
| Inventorier fake devices        | Autorisé seulement si devices réels absents — non applicable ici |
| Retourner succès sans capture   | Équivalent faux succès — INTERDIT                                |
| Patch purement UI sans fix Rust | La cause était Rust → patch Rust requis ✓                        |
| Mock du microphone              | INTERDIT par règle AutoHeal                                      |
