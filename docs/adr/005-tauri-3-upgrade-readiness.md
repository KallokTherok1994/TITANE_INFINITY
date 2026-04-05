# ADR 005: Tauri 3 / GTK Upgrade Readiness

**Status:** Proposed  
**Date:** 2026-04-05  
**Décideurs:** TITANE∞ governed maintenance lane  
**Tags:** #tauri #gtk #linux #migration #security

---

## Contexte

La base locale TITANE∞ est actuellement validée sur `29.0.0` avec preuves fraîches :

- `pnpm audit` → `No known vulnerabilities found`
- `pnpm run check` → PASS
- `pnpm run test:rust` → `4467 passed; 0 failed; 7 ignored`
- `cargo audit` → `18 allowed warnings found`

Le reliquat RustSec ne provient plus d'une dette locale simple. Il est porté par la chaîne Linux desktop actuelle :

```text
titane-infinity
└── tauri 2.x
    └── wry / tauri-utils
        └── webkit2gtk / gtk-rs GTK3 / unic-*
```

---

## Décision

Ouvrir une **branche de préparation** `tauri-3-upgrade` sans migration forcée immédiate.

Cette branche a pour rôle de :

1. garder la base `MAIN` propre et prouvée ;
2. préparer les commandes et la documentation de revalidation ;
3. n'exécuter la migration réelle que lorsqu'une version Tauri/wry amont réduit concrètement la chaîne GTK3/WebKitGTK.

---

## État actuel gelé

| Surface | État |
|---|---|
| `@tauri-apps/api` | `2.10.1` |
| `@tauri-apps/cli` | `2.10.1` |
| `tauri` Rust | `2.0` |
| `tauri-build` | `2.0` |
| Repo local | `PASS` |
| Migration lourde | `BLOCKED` |

---

## Déclencheurs acceptables

La migration réelle ne doit commencer que si au moins un signal concret apparaît :

- une release stable ou RC de Tauri/wry réduit la dépendance GTK3 côté Linux ;
- `cargo update --dry-run` ou `cargo audit` montre une baisse significative des warnings amont ;
- la politique runtime TITANE autorise explicitement une transition desktop plus large.

---

## Exécution préparée

La commande de diagnostic dédiée est désormais :

```bash
pnpm run audit:tauri3-readiness
```

Puis, lors du vrai essai de migration, les gates minimales attendues sont :

```bash
pnpm run check
pnpm run lint
pnpm run format:check
pnpm run test:100
pnpm run test:rust
cd src-tauri && cargo audit
```

---

## Conséquence

La branche `tauri-3-upgrade` devient le point d'entrée gouverné pour la future migration Tauri 3 / GTK4, sans mettre en danger l'état sain actuel de `MAIN`.
