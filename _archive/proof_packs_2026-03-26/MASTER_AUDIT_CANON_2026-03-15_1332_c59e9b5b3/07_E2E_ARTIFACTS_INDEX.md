# 07_E2E_ARTIFACTS_INDEX.md

**Statut:** BLOCKED — E2E not run this session

---

## Artefacts E2E Précédents (proof packs existants)

| Pack | Type E2E | Note |
|------|----------|------|
| `VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11` | Chat fonctionnel | Preuve existante |
| `VISIBLE_REAL_UI_CERTIFICATION_2026-03-11` | Certification UI | Preuve existante |
| `E2E_DESKTOP_CERTIFICATION_2026-03-14` | Desktop Tauri | Preuve existante (si présent) |

## Infrastructure E2E Présente

| Fichier | Présent |
|---------|---------|
| `playwright.config.ts` | OUI |
| `wdio.desktop.conf.cjs` | OUI |
| `e2e/` | OUI |
| `vitest.config.ts` | OUI |
| `vitest.integration.config.ts` | OUI |

## Action Requise

Lancer E2E x3 pour upgrader G_E2E_RUNNER_AUTHORITY de BLOCKED à PASS :
```bash
pnpm run e2e:desktop
```
