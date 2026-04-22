# ROLLBACK PLAN - TITANE_INFINITY

## Date : 2026-04-21

### Contexte
Toutes les corrections critiques (lint, check, test, mapping, autoheal, doctrine) ont été appliquées et validées. La base est saine, tous les scripts de gouvernance sont PASS, aucune régression détectée.

---

## Étapes de rollback (en cas de besoin)

1. **Restaurer la branche MAIN à l’état précédent la vague de corrections**
	- `git log` pour identifier le commit stable avant corrections
	- `git reset --hard <commit_id>`
2. **Restaurer les fichiers critiques modifiés**
	- `src-tauri/tauri.conf.json`
	- `src/pages/AgendaPage.tsx`, `src/pages/DashboardPage.tsx`, `src/pages/CameraPage.tsx`
	- `scripts/post-build/update-desktop-icons.sh`
	- Tous les fichiers de test modifiés
3. **Purger les artefacts de build et relancer la CI**
	- `pnpm run clean && pnpm run build:tauri`
	- Vérifier l’absence d’erreurs sur la CI
4. **Restaurer les mappings et preuves**
	- `ARCHITECTURE.md`, `UI_SURFACE_MAP.md`, `CARTOGRAPHY_COMPLETE.md`, `autoheal_rules.jsonl`
	- Revenir à la version précédente si besoin
5. **Vérification post-rollback**
	- Relancer tous les scripts de vérification :
	  - `bash scripts/autoheal/detect_recurrence.sh`
	  - `bash scripts/verify_instructions.sh`
	  - `pnpm run lint && pnpm run check && pnpm run test:100`
	- Confirmer le retour à l’état stable

---

## Correction UTF-8 panic (avril 2026)

- **Symptôme** : Panic lors de la restauration d’un message contenant un caractère accentué coupé ("byte index ... is not a char boundary; it is inside ...").
- **Cause** : Découpage de chaîne sur un index d’octet non aligné UTF-8 lors du chargement de l’historique conversationnel.
- **Correction** :
    - Patch sur `src-tauri/src/conversation_engine/commands.rs` : la troncature des messages utilise désormais un parcours `char_indices()` pour garantir la validité UTF-8.
    - Plus aucun panic, restauration robuste même avec accents ou caractères multioctets.
    - Tous les tests unitaires, intégration, UI et E2E passent (preuve jointe).
- **Vérification** :
    - Crash reproduit avant patch (exit code 134, panic Rust).
    - Après patch, tous les tests passent (`pnpm run test:100` → exit 0, logs complets, aucune troncature).
- **Rollback** :
    - Pour restaurer l’ancien comportement (non recommandé), revenir à l’ancienne logique de troncature sur index d’octet simple dans `commands.rs`.
- **Preuve** :
    - Voir logs de test, crash, patch et validation dans ce dossier.
    - Correction validée sur MAIN.

---

## Preuve de conformité
- Tous les scripts de validation sont PASS (voir logs ci-joints)
- Mapping, doctrine, autoheal, test matrix : OK
- Preuve jointe dans `proof_packs/`

---

## Contact
Responsable rollback : équipe TITANE_INFINITY

# ROLLBACK

`git restore -- src/components/chat/MarkdownContent.tsx src/pages/TitanePage.css src/components/chat/__tests__/MarkdownContent.test.tsx e2e/critical/chat-interaction.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/CONVERSATION_ASSISTANT_MARKDOWN_TABLES_QUOTES_2026-04-18.md proof_packs/CONVERSATION_ASSISTANT_MARKDOWN_TABLES_QUOTES_2026-04-18/GATE_REPORT.md proof_packs/CONVERSATION_ASSISTANT_MARKDOWN_TABLES_QUOTES_2026-04-18/VERDICT.md proof_packs/CONVERSATION_ASSISTANT_MARKDOWN_TABLES_QUOTES_2026-04-18/ROLLBACK.md`

# ROLLBACK — Séquence allowlist Tauri/IPC (avril 2026)

## Contexte
Tous les ajouts à la allowlist Tauri/IPC ont été faits pour obtenir la conformité totale (tests 100/100). Chaque ajout a été validé par test, puis commit-ready.

## Rollback minimal (ordre inverse)

1. **progression_save_state**
   - Fichiers :
     - runtime/stable/tauri.conf.json
     - src-tauri/tauri.conf.json
   - Action : retirer l’entrée `{ "command": "progression_save_state" }` dans chaque allowlist.

2. **knowledge_save_state**
   - Fichiers :
     - runtime/stable/tauri.conf.json
     - src-tauri/tauri.conf.json
   - Action : retirer l’entrée `{ "command": "knowledge_save_state" }` dans chaque allowlist.

3. **knowledge_ingest**
   - Fichiers :
     - runtime/stable/tauri.conf.json
     - src-tauri/tauri.conf.json
   - Action : retirer l’entrée `{ "command": "knowledge_ingest" }` dans chaque allowlist.

## Procédure
- Pour rollback : supprimer chaque bloc correspondant dans les deux fichiers, puis relancer les tests pour valider le retour à l’état antérieur.
- Aucun autre fichier critique modifié dans cette séquence.

---
Rollback validé, séquence conforme à la doctrine TITANE.