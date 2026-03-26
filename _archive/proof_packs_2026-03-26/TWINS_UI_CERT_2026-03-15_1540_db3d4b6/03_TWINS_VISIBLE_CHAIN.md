# 03 — MATRICE CHAÎNE VISIBLE TWINS

## Chaîne IPC complète (source-prouvée)

```
UI (TwinEvolutionPanel)
  → useTwinIdentity / useTwinEvolution
    → secureInvoke(command, payload)
      → security.ts: ALLOWED_COMMANDS vérifié
        → tauri.conf.json: allowlist vérifié
          → Rust generate_handler![]
            → NumericTwinState
              → { ok, content, error }
```

## Visibilité utilisateur (post-patch)

| Scénario | Avant patch | Après patch |
|----------|-------------|-------------|
| IPC ok | Données affichées ✅ | Données affichées ✅ |
| IPC erreur | Panneau vide/null (silencieux) ❌ | Bannière rouge ❌→ affiché ✅ |
| Recalculate ok | Console seulement ❌ | "✅ FusionIndex recalculé: X.XX" ✅ |
| Recalculate erreur | Silencieux ❌ | "❌ Erreur: message" ✅ |
| Transition ok | Silencieux ❌ | "✅ Transition de phase effectuée" ✅ |
| Transition erreur | Silencieux ❌ | "❌ Erreur: message" ✅ |
