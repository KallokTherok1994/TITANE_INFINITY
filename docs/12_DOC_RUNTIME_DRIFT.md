# 12 — DOC_RUNTIME_DRIFT — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Dérive doc/runtime identifiée

| Document | Claim documenté | Réalité runtime | Dérive | Sévérité |
|----------|----------------|-----------------|--------|----------|
| `deployment/latest/MANIFEST.json` | version 28.88.0, MAXIMUM_HARDENED | version 29.0.0, G9 FAIL | HIGH | HIGH |
| `docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md` | SECRET_SCANNING UNKNOWN | Pas de changement | Cohérent | NONE |
| `docs/25_SLSA_SSDF_MAPPING.md` | SLSA Build L2 via attestation | ENABLED_UNVERIFIED | Cohérent | LOW |
| `docs/24_ACTIONS_HARDENING_MATRIX.md` | SHA pins complétés | 156 pins vérifiés | Cohérent | NONE |
| Architecture docs (ARCHITECTURE.md etc.) | v24.2.0, 4 anneaux | Code actuel v29.0.0 | Version drift | MEDIUM |
| ARCHITECTURE_RINGS.md | Version v24.2.0 | Package 29.0.0 | Version drift dans docs | LOW |
| README.md | Contenu non audité | — | UNKNOWN | UNKNOWN |

---

## Mock en production (IPC / chat)

| Fichier | Comportement | Condition d'activation | Risque |
|---------|-------------|----------------------|--------|
| `src/services/conversationEngine.ts` | Réponse `[MOCK_OK]` | `window.__TITANE_E2E_CHAT_MOCK__ === true` | MEDIUM — flag E2E bypass |
| `src/services/api/chat.ts` | Path mock | `window.__TITANE_E2E_CHAT_MOCK__ === true` | MEDIUM — même flag |

**Décision** : ces mocks sont des paths E2E intentionnels, activés uniquement par flag explicite. Pas de dérive silencieuse. `SAFE_BUT_RISKY` — documenté dans memory autoheal.

---

## Résumé

| Catégorie | Dérives HIGH | Dérives MEDIUM | Dérives LOW |
|-----------|-------------|----------------|-------------|
| Version | 1 (MANIFEST) | 1 (arch docs) | 0 |
| Mock/fallback | 0 | 1 (E2E flag) | 0 |
| Security claims | 0 | 1 (attestation) | 1 (SLSA) |
