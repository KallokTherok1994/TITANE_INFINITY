# 13_RECOMMENDATIONS_MINIMAL — Recommandations (7 max)

**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z  
**Mode: PLAN ONLY — NE PAS IMPLÉMENTER sans validation**

---

## R1 — Déplacer HTTP de Ring 2 Rust vers Ring 3 [P0]

**Objectif**: Supprimer les clients HTTP dans `src-tauri/src/engines/unified_memory/summarizer.rs` et `embeddings.rs`. Les déplacer dans un service Ring 3 dédié (`src-tauri/src/services/embedding_service.rs` ou via `overdrive/chat_orchestrator.rs`).

**Preuve attendue**:

```bash
grep -n "use http_client\|HttpClient::new()" \
  src-tauri/src/engines/unified_memory/summarizer.rs \
  src-tauri/src/engines/unified_memory/embeddings.rs
# → 0 occurrences
```

**Risque**: Élevé — refactoring Rust du pipeline embedding/summarizer. Peut casser la mémoire unifiée si mal fait. Tester unitairement avant/après.

**Rollback**:

```bash
git restore -- src-tauri/src/engines/unified_memory/summarizer.rs \
               src-tauri/src/engines/unified_memory/embeddings.rs
```

---

## R2 — Supprimer le monkey-patch window.fetch [P1]

**Objectif**: Retirer `window.fetch = async (...)` de `src/services/selfHealing/selfHealingObserver.ts:431`. Remplacer par un listener d'événements Tauri (`listen('network_error', ...)`) ou supprimer si les erreurs réseau sont déjà capturées via IPC.

**Preuve attendue**:

```bash
grep -n "window.fetch\s*=" src/services/selfHealing/selfHealingObserver.ts
# → 0 occurrences
```

**Risque**: Moyen — peut réduire la couverture de monitoring réseau dans `selfHealingObserver`. Vérifier si des tests dépendent de ce monkey-patch.

**Rollback**:

```bash
git restore -- src/services/selfHealing/selfHealingObserver.ts
```

---

## R3 — Documenter ou migrer TauriBridge/StateBridge vers canonical IPC [P1]

**Objectif**: Soit (a) refactoriser `TauriBridge.ts` et `StateBridge.ts` pour déléguer à `src/lib/tauriClient.ts`, soit (b) documenter ces bridges comme "exception approuvée low-level" avec gate explicite dans `scripts/verify/` ou allowlist documentée.

**Preuve attendue**:

```bash
# Option A: migration
grep -n "this.invoke\(" src/os/bridge/TauriBridge.ts
# → 0 occurrences (ou commentaire gate d'exception)

# Option B: documentation
cat scripts/verify/enforce-ipc-canonical.sh | grep "TauriBridge\|StateBridge"
# → Explicitement exemptés
```

**Risque**: Moyen (Option A) / Faible (Option B). Option B est plus sûre pour ce sprint.

**Rollback**:

```bash
git restore -- src/os/bridge/TauriBridge.ts src/os/bridge/StateBridge.ts
```

---

## R4 — Débloquer l'environnement de développement [P1]

**Objectif**: Documenter et automatiser les prérequis d'installation dans `README.md` ou `scripts/setup/setup-dev.sh`.

**Preuve attendue**:

```bash
# Script de setup exécutable
bash scripts/setup/setup-dev.sh
pnpm test  # PASS
cargo check  # PASS
```

**Risque**: Faible — création d'un script documentaire uniquement.

**Rollback**:

```bash
git restore -- scripts/setup/setup-dev.sh README.md
```

---

## R5 — Archiver les 13 workflows décoratifs [P2]

**Objectif**: Déplacer les 13-14 workflows cosmiques vers `.github/workflows/archive/` ou les supprimer. Conserver uniquement les workflows avec valeur CI prouvée.

**Preuve attendue**:

```bash
ls .github/workflows/ | grep -E "cosmic|multiversal|infinite|transcendence|omniscient" | wc -l
# → 0
```

**Risque**: Faible — workflows dispatch-only uniquement. Vérifier qu'aucun workflow externe ne les référence.

**Rollback**:

```bash
git restore -- .github/workflows/
```

---

## R6 — Auditer reqwest 0.11 pour CVE [P2]

**Objectif**: Exécuter `cargo audit` sur `src-tauri/Cargo.toml` pour identifier les CVE potentiels dans reqwest 0.11. Planifier la mise à jour vers reqwest 0.12 si des CVE critiques existent.

**Preuve attendue**:

```bash
cargo audit
# → 0 HIGH ou CRITICAL pour reqwest
# OU: Cargo.toml bump reqwest = "0.12"
```

**Risque**: Moyen (si bump reqwest) — API légèrement différente entre 0.11 et 0.12. Moyen pour `cargo audit` seul.

**Rollback**:

```bash
git restore -- src-tauri/Cargo.toml src-tauri/Cargo.lock
```

---

## R7 — Mettre à jour SHA256SUMS stale [P2]

**Objectif**: Régénérer `src-tauri/SHA256SUMS_v19.5.2` vers `src-tauri/SHA256SUMS_v27.2.0` lors du prochain build de certification.

**Preuve attendue**:

```bash
ls src-tauri/SHA256SUMS_v*
# → SHA256SUMS_v27.2.0 (le v19.5.2 archivé ou supprimé)
```

**Risque**: Très faible — fichier purement documentaire.

**Rollback**:

```bash
git restore -- src-tauri/SHA256SUMS_v19.5.2
```

---

## Résumé des 7 Recommandations

| ID  | Priorité | Effort | Risque       | Impact                               |
| --- | -------- | ------ | ------------ | ------------------------------------ |
| R1  | P0       | 4-8h   | Élevé        | Corrige violation 4-Ring Rust        |
| R2  | P1       | 1-2h   | Moyen        | Supprime surface fetch non gouvernée |
| R3  | P1       | 1-3h   | Faible-Moyen | Unifie IPC canonique                 |
| R4  | P1       | 1h     | Faible       | Débloque env dev complet             |
| R5  | P2       | 30min  | Faible       | Nettoie CI                           |
| R6  | P2       | 1-2h   | Moyen        | Sécurité reqwest                     |
| R7  | P2       | 15min  | Très faible  | Checksums à jour                     |

**Ordre recommandé**: R4 (déblocage env) → R1 (P0 violation) → R2, R3 (P1 risks) → R5, R6, R7 (P2)
