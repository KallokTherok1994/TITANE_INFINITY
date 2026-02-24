# 01_FINDINGS — FINAL CLEAN SEAL

## Inventaire complet des "déchets + legacy + incertitude"

---

## P0 — Bloquants (mensonge mode/network, crash, sécurité)

| # | File | Line | Snippet | Classe | Risque | Status |
|---|------|------|---------|--------|--------|--------|
| P0.1 | `src-tauri/src/conversation_engine/commands.rs` | 101 | `"mode": "REMOTE"` + `network_used: false` | RUNTIME_BE | P0 | ✅ **CORRIGÉ** (session online_final) |
| P0.2 | `src/services/conversationEngine.ts` | 291-307 | `mode: 'REMOTE'` + `network_used: false` | RUNTIME_FE | P0 | ✅ **CORRIGÉ** (session online_first_vΩ) |

**Résultat P0:** ZÉRO P0 non résolu.

---

## P1 — Dégradés (guards manquants, logs absents)

| # | File | Line | Snippet | Classe | Risque | Status |
|---|------|------|---------|--------|--------|--------|
| P1.1 | `src/hooks/useConversationEngine.ts` | ~312 | Pas de guard NO_LYING avant session | RUNTIME_FE | P1 | ✅ **CORRIGÉ** (session online_first_vΩ) |
| P1.2 | `src/types/providerMeta.ts` | ~43 | ReasonCode manquait CONTRACT_VIOLATION_CLAMPED | RUNTIME_FE | P1 | ✅ **CORRIGÉ** (session online_first_vΩ) |

---

## P2 — Mineurs (TODO, FIXME, docs legacy)

### Runtime — TODOs non bloquants

| File | Line | Snippet | Classe | Action |
|------|------|---------|--------|--------|
| `src/services/ai/providers/ollama.ts` | 631 | `// TODO v27.2Ω: Streaming via transport layer` | RUNTIME_FE | KEEP — roadmap explicite, non bloquant |
| `src-tauri/src/audio/streaming_engine.rs` | 446 | `// FIXME: Ring buffer wraparound logic` | RUNTIME_BE | KEEP — correctif ciblé marqué, non P0 |

### Docs — Legacy "local-first" / "offline"

| File | Verdict | Action |
|------|---------|--------|
| `docs/archive/` (tous) | HISTORY | NE PAS MODIFIER — marqué archive |
| `docs/99_ARCHIVE/` (tous) | HISTORY | NE PAS MODIFIER |
| `docs/backup_*/` | HISTORY | NE PAS MODIFIER |
| `docs/STATUS_REPO_V27.md:90` | P2 | "local-first" = contexte sécurité réseau, correct |
| `docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:5` | P2 | "local-first" = référence historique, ACCEPTABLE |
| `docs/PROVIDER_ORCHESTRATION_CONTRACT.md:47-48` | P2 | Correct — définit sémantique FORCE_LOCAL_PROVIDER |
| `docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md` | P2 | Mode offline = feature documentée, ACCEPTABLE |
| `README.md` | NEED_ADD | Section "Truth & Proof" absente → à ajouter |

### Verify scripts — Faux positif PATH

| Script | Finding | Action |
|--------|---------|--------|
| `scripts/verify/enforce-online-first.sh` | Échoue si `rg` pas dans PATH | P2 — pré-existant, hors scope |
| `scripts/verify/enforce-tauri-only.sh` | Check `dev` script ≠ "tauri dev" mais `dev:tauri` existe | P2 — pré-existant |

---

## HISTORY — Legacy OK (ne pas toucher)

- `docs/archive/root/*.md` — références "local-first" pré-v27 = historique documenté
- `docs/99_ARCHIVE/**` — obsolète marqué
- `docs/backup_*/**` — snapshots

---

## Terminologie

- `docs/TERMINOLOGY_ALIGNMENT_FINAL.md` — ABSENT → à créer (Phase 5)
- README — section "Truth & Proof" ABSENTE → à ajouter minimalement

---

## Gate G1 (Phase 1): PASS
Zéro P0 non résolu. Items P2 sont soit HISTORY, soit pré-existants hors scope.
