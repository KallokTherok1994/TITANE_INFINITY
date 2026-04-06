# 03 — REPO_TAXONOMY — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL | Branch: copilot/audit-github-security-supply-chain

---

## 1. Racine

| Zone | Type | Statut |
|------|------|--------|
| `src/` | Frontend Tauri (Ring 4 UI) | KEEP_CORE |
| `src-tauri/` | Backend Rust (Ring 4 OS) | KEEP_CORE |
| `scripts/` | Gouvernance / gates / autoheal | KEEP_SUPPORT |
| `.github/` | CI/CD / security / governance | KEEP_SUPPORT |
| `docs/` | Matrices d'audit, preuves, architecture | KEEP_HISTORICAL_AUTHORITY |
| `proof_packs/` | Packs de preuve sealed/qualified | KEEP_PROOF_AUTHORITY |
| `deployment/` | Métadonnées de déploiement | KEEP_SUPPORT |
| `e2e/` | Tests end-to-end WebdriverIO | KEEP_SUPPORT |
| `governance/` | Fichiers de gouvernance | KEEP_HISTORICAL_AUTHORITY |
| `registry/` | Registre ui-events.jsonl | KEEP_SUPPORT |
| `sbom/` | Surface SBOM (si présent) | KEEP_SUPPORT |
| `archive/` | Archives (workflows/legacy) | KEEP_ARCHIVE |

---

## 2. Architecture 4 Anneaux

```
Ring 1 KERNEL  — src/engines/ core/ cognitive/ (pure domain logic)
Ring 2 ENGINES — src/services/ modules/ (applicatif)
Ring 3 SERVICES — src/api/ src/stores/ (side-effects, I/O)
Ring 4 OS/UI   — src-tauri/ src/pages/ src/components/ (.github/ CI)
```

Invariant : **pas d'import inverse Ring1/Ring2 vers Ring3/Ring4**.

---

## 3. Surfaces de Version

| Fichier | Version déclarée | Synchronisé ? |
|---------|-----------------|--------------|
| `package.json` | 30.0.0 | ✅ |
| `src-tauri/Cargo.toml` | 30.0.0 | ✅ |
| `deployment/latest/MANIFEST.json` | 28.88.0 | ❌ désynchronisé |

**Verdict version** : PARTIAL — deployment MANIFEST n'est pas à jour (pre-existing, hors scope audit actuel).

---

## 4. Familles Produit identifiées

| Famille | Zone principale |
|---------|----------------|
| CHAT_CORE | src/services/chat/ src/engines/ |
| MEMORY | src/services/chatMemory* src/services/cache/ |
| OMEGA | src/engines/omega* src-tauri/src/omega* |
| MULTI_PROVIDER_ROUTER | src/services/ai/ src/services/api/ |
| PROVIDER_TRUTH | src/services/ai/ src-tauri/src/conversation_engine/ |
| FALLBACK_TRUTH | src/services/api/chat.ts (mock path) |
| UI_BACKEND_TRUTH | src/services/conversationEngine.ts |
| RELEASE_TRUTH | deployment/ docs/_evidence/ proof_packs/ |
| SEAL_CHAIN | proof_packs/ docs/_evidence/ |
| GATES_MONOTONICITY | scripts/gates/ scripts/verify/ |
| GITHUB_SECURITY | .github/workflows/ dependabot.yml CODEOWNERS |

---

## 5. Surfaces de Gouvernance Clés

| Fichier | Rôle |
|---------|------|
| `.github/CODEOWNERS` | Routing des reviews (créé 2026-04-02) |
| `.github/dependabot.yml` | npm + cargo Dependabot (3 ecosystems) |
| `scripts/autoheal/autoheal_rules.jsonl` | 583 entrées — registre autoheal |
| `scripts/gates/run-all.sh` | Orchestrateur 9 gates |
| `scripts/verify_instructions.sh` | 23 checks governance |
| `scripts/autoheal/detect_recurrence.sh` | Guard anti-recurrence |
