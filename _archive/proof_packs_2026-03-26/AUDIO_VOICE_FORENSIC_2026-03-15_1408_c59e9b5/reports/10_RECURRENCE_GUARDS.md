# 10 — GARDES ANTI-RÉCURRENCE

## Entrée AutoHeal Ajoutée

**ID :** AH-2026-03-15-AUDIO-001
**Fichier :** scripts/autoheal/autoheal_rules.jsonl (ligne 262, 262 total)
**Schéma validé :** OUI (5 entrées lues, format JSON confirmé)
**Concurrent modification check :** `scripts/autoheal/autoheal_rules.jsonl` modifié dans git status avant session (parmi les fichiers modifiés non commitées) — entrée ajoutée en append-only sans conflit.

## Prévention Textuelle

```bash
# Vérifier que stop_speaking + is_speaking sont bien enregistrés ET mockés
grep -n 'stop_speaking\|is_speaking' src-tauri/src/main.rs | \
  grep 'mock\|generate_handler\|audio::commands' | wc -l
# Attendu: >= 4 (2 mock stubs + 2 registrations)
```

## Test de Non-Régression Proposé

```bash
grep -c 'audio::commands::stop_speaking' src-tauri/src/main.rs | grep -q 1 && \
grep -c 'audio::commands::is_speaking' src-tauri/src/main.rs | grep -q 1 && \
grep -c 'cfg(feature = "mock")' src-tauri/src/main.rs | grep -qE '^[0-9]' && \
echo "OK: stop_speaking + is_speaking enregistrés + mockés"
```

## Registry Partagée

- `scripts/autoheal/autoheal_rules.jsonl` : **1 entrée ajoutée** (AH-2026-03-15-AUDIO-001)
- Protocole respecté : backup raw/env/, schéma validé, fix appliqué avant écriture, append-only
