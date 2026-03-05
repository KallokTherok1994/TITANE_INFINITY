# 10_ROLLBACK — Plan de Rollback
**Proof Pack:** AUDIT_MODULES_2026-03-05_1433_0f7d943  
**Timestamp:** 2026-03-05T14:33:25Z

---

## Rollback Session Courante

Cette session étant audit-only, aucun code n'a été modifié. Le seul rollback nécessaire est de supprimer le proof-pack si requis:

```bash
# Supprimer ce proof pack uniquement
rm -rf proof_packs/AUDIT_MODULES_2026-03-05_1433_0f7d943/
```

---

## Rollbacks Génériques par Périmètre

### Si des corrections sont appliquées suite au FIX_PLAN

#### Frontend (src/)
```bash
git restore -- src/services/selfHealing/selfHealingObserver.ts
git restore -- src/os/bridge/TauriBridge.ts
git restore -- src/os/bridge/StateBridge.ts
git restore -- src/utils/invoke.ts
git restore -- src/services/ai/providers/glm46v.ts
# Rollback global frontend
git restore -- src/
```

#### Backend Rust (src-tauri/)
```bash
git restore -- src-tauri/src/engines/unified_memory/summarizer.rs
git restore -- src-tauri/src/engines/unified_memory/embeddings.rs
git restore -- src-tauri/src/overdrive/chat_orchestrator.rs
# Rollback global tauri
git restore -- src-tauri/
```

#### CI/Workflows (.github/)
```bash
git restore -- .github/workflows/ci-unified.yml
git restore -- .github/workflows/
```

#### Scripts
```bash
git restore -- scripts/
```

---

## Rollback vers Tag Stable

Si le repo dispose de tags de release:
```bash
# Lister les tags disponibles
git tag -l | sort -V | tail -n 10

# Checkout vers version stable précédente
git checkout v27.0.3  # (ou la version stable confirmée)

# Pour créer une branche de rollback
git checkout -b rollback/v27.0.3 v27.0.3
```

---

## Rollback Tauri (Runtime)

Si un build a été effectué et déployé:
```bash
# Revenir aux artifacts de deployment/latest/
ls deployment/latest/

# Reconstruire depuis le tag stable
git checkout v27.0.3 -- src-tauri/
cargo build --release  # (après installation des deps GTK)
```

---

## Garde-fous AutoHeal

Avant tout rollback, exécuter:
```bash
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

---

## Politique de Rollback

1. **Rollback atomique**: Un fix = un rollback `git restore -- <fichiers>`
2. **Pas de `git reset --hard`**: Utiliser `git restore` pour préserver l'historique
3. **Documenter dans AutoHeal**: Ajouter entrée `scripts/autoheal/autoheal_rules.jsonl`
4. **Vérifier après rollback**: Relancer les gates applicables
