# 01_CURRENT_INSTRUCTIONS — Instructions constitutionnelles actives

**Session:** AUDIT360_20260304_132822  
**Horodatage UTC:** 2026-03-04T13:28:22Z

---

## Constitution active — Version 26.3.0

**Fichier source:** `.github/copilot-instructions.md` (TITANE_INFINITY Constitution Copilot — v3 Constitution Finale)  
**Mode:** AUTO, autorité unique, arrêt immédiat strict

---

## Invariants non négociables (Section 3)

| Invariant                  | Description                                        | Statut |
| -------------------------- | -------------------------------------------------- | ------ |
| Tauri-only                 | Pas de serveur web interne                         | ACTIF  |
| Online-first gouverné      | Pas d'appels web ouverts depuis l'UI               | ACTIF  |
| 4-Ring strict              | Types → Engines → Services → UI/Modules            | ACTIF  |
| Allowlist deny-by-default  | Capacités Tauri restreintes                        | ACTIF  |
| Pas de fallback silencieux | Toute rétrogradation doit être explicite et tracée | ACTIF  |
| Pas de retries non bornés  | Backoff capé obligatoire                           | ACTIF  |
| Patch minimal              | Pas de refactorisation gratuite                    | ACTIF  |

---

## Architecture 4-Ring formalisée (Section 4)

| Ring              | Chemin                             | Règle                                  | Statut    |
| ----------------- | ---------------------------------- | -------------------------------------- | --------- |
| Ring 1 — Types    | `src/types/`, `src/constants/`     | Zéro I/O, zéro import                  | STABLE    |
| Ring 2 — Engines  | `src/engines/*/`                   | Logique pure, import Ring 1 uniquement | QUALIFIED |
| Ring 3 — Services | `src/services/*/`                  | Orchestration I/O gouvernée            | QUALIFIED |
| Ring 4 — OS/UI    | `src-tauri/src/`, composants React | Peut importer tous les rings           | QUALIFIED |

---

## Gouvernance réseau One Door (Section 5)

```
UI → IPC canonique → Services → Gateway réseau → Externe
```

- **Interdit:** UI → Externe direct
- **Preuve UI scan:** 1 `fetch()` (asset local `./main-entry.json`), 0 `axios`, 0 `WebSocket` direct

---

## Contrat IPC canonique (Section 12)

Tout retour IPC doit respecter le format :

```typescript
{ ok: boolean, content?: unknown, error?: { code: string, message: string, details?: unknown, traceId: string } }
```

---

## Politique PROD (Section 9)

Tokens exacts requis avant toute action PROD :

- `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

---

## IA locale TITANE (obligation constitutionnelle)

- Le chat doit fonctionner sans fournisseurs externes
- Fournisseurs externes = optionnels, jamais dépendances dures
- Circuit breaker + timeouts pour chaque fournisseur
- Générateur offline = fallback obligatoire

---

## Synchronisation version (Section 10)

Fichiers à aligner strictement :

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `deployment/latest/MANIFEST.json`

---

## Commandes de test canoniques

```bash
pnpm test                  # Vitest
pnpm test:architecture     # Enforcement 4-Ring
pnpm test:e2e              # Playwright
pnpm test:rust             # cargo test
pnpm verify                # Toutes les gates
```
