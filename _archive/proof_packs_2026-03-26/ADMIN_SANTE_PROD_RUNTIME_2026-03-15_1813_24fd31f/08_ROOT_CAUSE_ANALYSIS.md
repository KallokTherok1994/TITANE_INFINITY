# 08 — ANALYSE DES CAUSES RACINES

## Cause primaire : K — Cas honnête no-data mais defaults UI trompeurs

**Famille** : K. honest no-data case but misleading UI defaults  
**Preuve directe** : `src-tauri/src/api/telemetry_api.rs` lignes 52–75

```rust
// AVANT (comportement fautif) :
if !csv_path.exists() {
    return Ok(ProductionHealthSummary {
        status: "UNKNOWN".to_string(),
        window_start_iso: chrono::Utc::now().to_rfc3339(),  // FABRIQUÉ
        window_end_iso: chrono::Utc::now().to_rfc3339(),    // FABRIQUÉ
        initial_rss_mb: 0.0,   // FABRIQUÉ
        growth_mb: 0.0,        // FABRIQUÉ
        growth_percent: 0.0,   // FABRIQUÉ
        last_sample: ProductionHealthSample {
            rss_current_mb: 0.0,  // FABRIQUÉ
            ...
        },
        samples_collected: 0,  // FABRIQUÉ
        notes: Some("Waiting for observation data...".to_string()),
    });
}
```

Le backend retourne un `Ok()` structurellement valide avec des zéros fabriqués et des timestamps synthétiques quand le CSV est absent. La garde TypeScript `isProductionHealthSummary()` passe (structure valide), `setData(fake_summary)` est appelé, et l'UI affiche le panneau complet avec toutes les valeurs à 0.

---

## Cause secondaire 1 : D — Dérive de schéma V25/V26

**Famille** : D. V25/V26 schema drift  
**Preuve** :
- `src/features/admin/types.ts:61` : `label: 'Santé Prod (V25)'`
- `ProductionHealthPanel.tsx:~90` : `<h3>Production V25 Week 1</h3>` (hardcodé)
- `ProductionHealthPanel.tsx:~160` : `Source: CSV local (Tauri IPC) · V26 Telemetry` (hardcodé)

Le titre UI dit "V25" (période de déploiement) mais le footer dit "V26" (système de télémétrie). Les deux axes de version coexistent sans documentation explicite dans le code source.

---

## Cause secondaire 2 : I — Store/hook jamais hydraté correctement

**Famille** : I. store never hydrates (variant : hook hydraté avec fake data)  
**Preuve** : `useProductionHealthTelemetry.ts`
```typescript
const loadData = useCallback(async () => {
  // ...
  if (!data) {  // ← stale closure sur `data` — ne vide jamais les données stales
    setData(null);
  }
}, [data]);  // ← dépendance `data` dans useCallback → re-création à chaque succès
             //   → useEffect redémarre l'intervalle à chaque chargement réussi
```

Deux défauts : (1) la donnée stale est préservée silencieusement sur erreur. (2) `loadData` se recrée à chaque changement de `data` → relance l'intervalle.

---

## Résumé

| # | Famille | Preuve | Sévérité |
|---|---|---|---|
| 1 (primaire) | K — fake defaults | `telemetry_api.rs:52–75` | CRITIQUE |
| 2 (secondaire) | D — V25/V26 drift | `types.ts:61`, `ProductionHealthPanel.tsx:~90,~160` | MOYEN |
| 3 (secondaire) | I — hook dep bug | `useProductionHealthTelemetry.ts:useCallback` | MOYEN |

**Règle** : pas de "probablement". Chaque cause ci-dessus est prouvée par pointeur de code exact.
