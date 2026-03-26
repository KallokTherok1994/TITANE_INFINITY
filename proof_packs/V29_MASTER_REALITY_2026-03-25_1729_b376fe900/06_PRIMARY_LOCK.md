# 06_PRIMARY_LOCK

## Lock choisi

- id: `L-HTTP-IPC-001`
- statut final: CLOSED_THIS_RUN

## Reproduction

Le frontend `src/core/http/httpClient.ts` etait deja route vers `secureInvoke('http_request', ...)`, mais la chaine Tauri n'etait pas completement fermee sur la surface d'invocation reelle.

## Cycle de reparation

1. Cycle 1: ajout de `http_request` dans l'invoke handler et dans les allowlists Tauri.
2. Preuve intermediaire: `cargo check` a revele un vrai defaut causal supplementaire.
3. Cycle 2: ajout de `pub mod http_commands` dans le sous-module `commands` de `src-tauri/src/main.rs`.

## Preuves

```text
error[E0433]: failed to resolve: could not find `http_commands` in `commands`
```

Puis:

```text
Finished `dev` profile [unoptimized + debuginfo] target(s) in 30.15s
```

Et:

```text
G_COMMAND_WHITELIST_SYNC=PASS
```

## Pourquoi ce lock etait prioritaire

- il cassait une chaine reelle UI -> IPC -> backend
- il etait localise
- le patch restait minimal
- le rollback restait simple

## Lock causal suivant

Apres fermeture de `L-HTTP-IPC-001`, la derive de version sur les surfaces actives est devenue le blocker dominant. Elle a ete corrigee par un patch minimal sur `package.json`, `src-tauri/Cargo.toml`, `src/pages/DevPage.tsx`, `CHANGELOG.md` et `README.md`, sans toucher aux archives ni aux surfaces de roadmap.
