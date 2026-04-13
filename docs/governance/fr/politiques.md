# TITANE∞ — Politiques (FR)

**Version :** 28.0.0  
**Statut :** QUALIFIED  
**Date :** 2026-03-17

---

## Politique 1 — No-fiction (C2)

**Règle :** Ne jamais affirmer qu'une fonctionnalité est stable, complète, production-ready, auto-réparante, synchronisée, sécurisée, automatisée ou validée sans preuve directe dans le dépôt.

**Statuts obligatoires :** PROVEN | QUALIFIED | PARTIAL | BLOCKED | LEGACY | DOC_ONLY | PLANNED

**Application :** Toute la documentation.

---

## Politique 2 — Repo Truth First (C3)

**Règle :** La documentation doit suivre l'état réel du dépôt. Si docs, code, configs, scripts ou proof packs se contredisent : détecter, nommer, classifier, résoudre ou marquer BLOCKED.

**Application :** README, docs/, proof_packs/, scripts/.

---

## Politique 3 — Tauri-only runtime (Rule 4)

**Règle :** Le runtime de production est Tauri-only. Aucun serveur web, Electron, ou accès HTTP frontend direct.

**Gate :** `pnpm run verify:tauri-only`  
**Statut :** PROVEN

---

## Politique 4 — One Door network (Rule 5)

**Règle :** Chemin réseau autorisé uniquement : UI → IPC canonique → Services → Network Gateway → Externe. Pas d'accès réseau direct depuis l'UI.

**Gate :** `pnpm run verify:network-guard`, `pnpm run verify:online-first`  
**Statut :** QUALIFIED

---

## Politique 5 — Contrat IPC (Rule 6)

**Règle :** Le payload IPC est obligatoire : `{ ok, content, error }`. Zéro échec silencieux. Pas de fallback mensonger.

**Source :** `docs/IPC_CONTRACT.md`  
**Statut :** PROVEN

---

## Politique 6 — Online-first gouverné avec fallback local obligatoire (Rule 7)

**Règle :** La politique online-first gouvernée est active. Le fallback local est obligatoire et opérationnel.

**Note :** Le label "local-first" dans certains fichiers est un marqueur de compatibilité uniquement.  
**Statut :** QUALIFIED (fallback local : PARTIAL)

---

## Politique 7 — Stop-the-line (Rule 8)

**Règle :** Stop-the-line obligatoire sur : violation d'invariant, FAIL de gate obligatoire, contradiction non résolue, ou preuve manquante.

**Gate principal :** `bash scripts/verify_instructions.sh`  
**Statut :** PROVEN

---

## Politique 8 — NO_SKIPS (Rule 9)

**Règle :** Les vérifications requises ne peuvent pas être contournées par une narrative. Si un check ne peut pas s'exécuter, classer BLOCKED avec une prochaine action ≤ 30 minutes.

**Statut :** PROVEN par règle

---

## Politique 9 — AutoHeal capture obligatoire (Rule 10)

**Règle :** Pour chaque correctif, ajouter une entrée dans `scripts/autoheal/autoheal_rules.jsonl`. Puis exécuter `detect_recurrence.sh` et `verify_instructions.sh`.

**Exigence :** `prevention_test` doit contenir `detect_recurrence`  
**Statut :** PROVEN

---

## Politique 10 — Builds production à la demande (Rule 11)

**Règle :** Les builds et déploiements production sont exécutés sur demande utilisateur ou au besoin. Aucun token gate requis. Utiliser la commande `BUILD ALL` (Rule 14) pour la séquence complète automatisée.

**Statut :** PROVEN par règle

---

## Politique 11 — Proof pack et rollback (Rule 12)

**Règle :** Chaque session gouvernée doit produire des preuves dans `proof_packs/` et `reports/`. Obligatoire : rapport de gate, plan de rollback, verdict final unique.

**Statut :** PROVEN (proof packs présents dans le dépôt)

---

## Politique 12 — Pas de suppression aveugle de docs (C8)

**Règle :** Les docs legacy doivent être : conservées, redirigées, archivées, ou explicitement marquées obsolètes avec pointeurs.

**Statut :** PROVEN par convention

---

*Documentation en anglais : [docs/governance/en/policies.md](../en/policies.md)*
