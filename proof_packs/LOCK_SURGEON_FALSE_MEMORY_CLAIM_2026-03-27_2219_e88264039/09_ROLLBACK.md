# 09 — Rollback Plan

## Rollback Command
```bash
git checkout HEAD -- src-tauri/src/conversation_engine/commands.rs
```

## Manual Rollback Steps
If git checkout is not available, manually revert `build_canonical_memory_fact_block()` to:

```rust
fn build_canonical_memory_fact_block(
    history: Option<&Vec<String>>,
    message: &str,
) -> Option<String> {
    let history = history?;

    if history.is_empty() || !is_memory_recall_query(message) {
        return None;
    }

    let facts = extract_canonical_memory_facts(history);
    if facts.is_empty() {
        return None;
    }

    let rendered_facts = facts
        .into_iter()
        .map(|(key, value)| format!("{key}={value}"))
        .collect::<Vec<String>>()
        .join("\n");

    Some(format!(
        "## CANONICAL_MEMORY_FACTS\n{}\n## MEMORY_RECALL_RULE\nQuand l'utilisateur demande un rappel de memoire, utilise uniquement ces faits canoniques.\nIgnore les tours hors sujet et n'ajoute aucun element absent de cette liste.\nSi un champ demande est absent, reponds INCONNU pour ce champ.\nSi l'utilisateur demande un rappel compact, reponds uniquement avec des lignes `cle=valeur` ou `INCONNU`.\nN'ajoute aucun titre, aucune section Markdown, aucune explication et aucun commentaire.",
        rendered_facts
    ))
}
```

## Champion Restorable
YES — The patch modifies only one function. The champion baseline (v28.0.0) can be restored by reverting this file.

## Rollback Verification
After rollback:
```bash
cd src-tauri && cargo check --lib
```
Should compile successfully.