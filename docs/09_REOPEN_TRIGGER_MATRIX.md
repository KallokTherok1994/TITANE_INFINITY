# 09 — REOPEN_TRIGGER_MATRIX — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Règle fondamentale

**Aucune famille scellée ne peut être rouverte sans trigger réel prouvé.**

---

## Matrice des triggers

| Famille | État actuel | Trigger de réouverture requis | Trigger prouvé ? | Décision |
|---------|-------------|-------------------------------|-----------------|----------|
| CHAT_CORE | LOCAL_SEALED | Checksum mismatch, régression vitest, IPC cassé | ❌ Non prouvé | REOPEN_FORBIDDEN |
| MEMORY | LOCAL_SEALED | Régression snapshot, corruption données | ❌ Non prouvé | REOPEN_FORBIDDEN |
| OMEGA | LOCAL_SEALED | Régression Rust tests, API cassée | ❌ Non prouvé | REOPEN_FORBIDDEN |
| RELEASE_TRUTH | FALSE_GREEN_RISK | Version mismatch MANIFEST (28.88.0 vs 29.0.0) | ✅ PROUVÉ | REOPEN_ALLOWED — patch minimal MANIFEST |
| GATES_MONOTONICITY | 8/9 PASS | G9 FAIL deployment metadata | ✅ PROUVÉ | REOPEN_ALLOWED — fix version MANIFEST |
| ACTIONS_HARDENING | SEALED | Nouvelle action tierce non piniée | ❌ (toutes piniées) | REOPEN_FORBIDDEN |
| GITHUB_SECURITY | PARTIAL | Nouvelles vulnérabilités critiques, workflow cassé | ❌ Non prouvé | KEEP_MONITOR |
| MULTI_PROVIDER_ROUTER | QUALIFIED | Drift runtime prouvé | ❌ Non prouvé | KEEP_MONITOR |

---

## Triggers actuellement prouvés

### T1 — Version MANIFEST stale
- **Famille** : RELEASE_TRUTH / GATES_MONOTONICITY
- **Preuve** : G9 log: `Deployment metadata version mismatch: 28.88.0 vs 29.0.0`
- **Action autorisée** : Mettre à jour `deployment/latest/MANIFEST.json` `.deployment.version` et `.version` → 29.0.0
- **Scope** : 1 fichier JSON, patch minimal
- **Rollback** : `git restore -- deployment/latest/MANIFEST.json`

---

## Triggers NON prouvés (forbidden reopening)

- Aucune régression vitest détectée
- Aucun checksum mismatch produit
- Aucune corruption de proof pack
- Aucune dérive cross-version
- Aucun defect utilisateur reproductible rapporté
