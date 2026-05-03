# 15 ROLLBACK
# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Rollback complet — fichier par fichier

```bash
# Rollback patch audio/commands.rs (PATCH-01)
git restore -- src-tauri/src/audio/commands.rs

# Rollback autoheal entry AH-2026-03-15-0211
git restore -- scripts/autoheal/autoheal_rules.jsonl

# Rollback proof pack (optionnel — artefact lecture seule)
# rm -rf proof_packs/audio_truth_2026-03-15_1902_e91124efc/
```

## Effet du rollback

Après `git restore -- src-tauri/src/audio/commands.rs`:
- test_microphone revient à la version bloquante (pw-record sans timeout)
- PW_DURATION_LIMIT env var fictif réapparaît
- arecord fallback revient avec `-D hw:{wpctl_id},0`

## Vérification post-rollback

```bash
cargo check --manifest-path src-tauri/Cargo.toml --message-format short 2>&1 | grep -c "^error" | xargs -I{} test {} -eq 0 && echo "ROLLBACK_OK"
```

## Confirmation avant rollback

- Le bug RUST_CAPTURE_NOT_CAUSAL existait depuis la création du feature lot-2 (commit 4a77788ee)
- Le rollback rétablit le bug original
- Ne pas rollback sauf si une régression inattendue est prouvée
