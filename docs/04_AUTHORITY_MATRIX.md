# 04 — AUTHORITY_MATRIX — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## 1. Hiérarchie des autorités

| Priorité | Source | Portée |
|----------|--------|--------|
| 1 | Present constitutional file / current prompt | Global |
| 2 | `.github/agents/` (AGENTS.md locaux par zone) | Zone |
| 3 | Super-prompts spécialisés | Mission |
| 4 | Validators / runtime / GitHub-native state | Vérité finale |

---

## 2. Sources d'autorité vérifiées

| Source | Présente | Statut |
|--------|----------|--------|
| `AGENTS.md` racine | ✅ | KEEP_HISTORICAL_AUTHORITY |
| `src/AGENTS.md` | ✅ | KEEP_SUPPORT |
| `src-tauri/AGENTS.md` | Probable | KEEP_SUPPORT |
| `e2e/AGENTS.md` | Probable | KEEP_SUPPORT |
| `docs/AGENTS.md` | ✅ | KEEP_SUPPORT |
| `scripts/AGENTS.md` | Probable | KEEP_SUPPORT |
| `.github/copilot-instructions.md` | ✅ | KEEP_CORE |
| `.github/instructions/titane.instructions.md` | ✅ | KEEP_CORE |

---

## 3. Conflits d'autorité détectés

| Conflit | Description | Action |
|---------|-------------|--------|
| Version MANIFEST | 28.88.0 vs package 29.0.0 | ALIGN_AUTHORITIES (HOLD_EXTERNAL) |
| `deployment/latest/MANIFEST.json` | Version stale | RECERT_REQUIRED pour release |

---

## 4. Autorité pour les gates

| Gate | Autorité | Statut |
|------|----------|--------|
| G1-G8 | `scripts/gates/*.sh` | PASS (8/9) |
| G9 | `scripts/gates/g9-release-seal.sh` | FAIL (version mismatch) |
| verify_instructions | `scripts/verify_instructions.sh` | PASS=23 FAIL=0 |
| detect_recurrence | `scripts/autoheal/detect_recurrence.sh` | G_AH_RECURRENCE_GUARD_PASS |

---

## 5. Décision

- **KEEP_SEALED_DO_NOT_TOUCH** : familles scellées (CHAT_CORE, MEMORY, OMEGA)
- **HARDEN_GATES** : G9 bloqué par version metadata (HOLD_EXTERNAL)
- **ALIGN_AUTHORITIES** : MANIFEST.json → doit être synchronisé avant toute release PROD
