# 🔍 TITANE∞ MEMORY QA CHECKLIST v∞.MPE-Ω

> **Version**: v∞.MPE-Ω
> **Date**: 2025-12-01
> **Usage**: Valider avant chaque release majeure

---

## ✅ CHECKLIST PRÉ-RELEASE

### 1. Tests de Base

- [ ] `cargo check --manifest-path src-tauri/Cargo.toml` → 0 erreurs
- [ ] `pnpm run type-check` → 0 erreurs TypeScript
- [ ] `pnpm run test` → Tous tests passent
- [ ] `cargo test --manifest-path src-tauri/Cargo.toml` → Tous tests passent

### 2. Persistence Engine

- [ ] `titan_persistence_init` fonctionne au démarrage
- [ ] `titan_persist_event` persiste correctement
- [ ] `titan_load_state` restaure l'état
- [ ] `titan_force_snapshot` crée un snapshot valide
- [ ] Auto-save 30min déclenché et fonctionnel
- [ ] Shutdown propre sauvegarde l'état

### 3. Recovery

- [ ] Simuler crash (kill -9) → Récupération OK
- [ ] Snapshot + événements → État reconstruit correct
- [ ] Corruption snapshot → Fallback événements OK
- [ ] Journal vide + snapshot → Démarrage OK

### 4. Migrations

- [ ] `titan_get_schema_version` retourne version correcte
- [ ] `titan_migrate_state` migre sans perte de données
- [ ] Migration rollback via backup possible
- [ ] Schéma v1 → vN testé et fonctionnel

### 5. Compression & Compaction

- [ ] `titan_compress_memory` compresse données > 30 jours
- [ ] `titan_compact_journal` réduit taille journal
- [ ] Données compressées lisibles
- [ ] Performance après compaction améliorée

### 6. Backup/Export/Import

- [ ] `titan_export_data` crée archive valide
- [ ] `titan_validate_archive` valide les archives
- [ ] `titan_import_data` mode "replace" OK
- [ ] `titan_import_data` mode "merge" OK
- [ ] Archive corrompue détectée et rejetée

### 7. Memory Health

- [ ] `titan_get_memory_health` retourne score valide
- [ ] Dashboard Memory Health affiche correctement
- [ ] Issues Critical/Warning/Info catégorisées
- [ ] Recommandations pertinentes générées

### 8. Self-Healing

- [ ] `titan_run_self_healing` corrige issues auto-fixables
- [ ] Rapport Self-Healing détaille actions
- [ ] Pas de régression après Self-Healing
- [ ] Mode Recovery répare champs manquants

### 9. Invariants

- [ ] `titan_validate_invariants` détecte violations
- [ ] Mode Strict rejette toute violation
- [ ] Mode Lenient tolère violations mineures
- [ ] Mode Recovery auto-répare

### 10. Memory Doctor

- [ ] `titan_memory_doctor_diagnose` diagnostic complet
- [ ] `titan_memory_doctor_summary` résumé lisible
- [ ] `titan_memory_doctor_heal` lance Self-Healing
- [ ] Score cohérent avec état réel

---

## 🔧 TESTS DE STRESS

### Performance

- [ ] Boot time < 2s avec 10k événements
- [ ] Boot time < 5s avec 50k événements
- [ ] Mémoire RAM < 500MB au repos
- [ ] CPU idle < 5%

### Limites

- [ ] Journal 100MB → Compaction suggérée
- [ ] 100k événements → Performance acceptable
- [ ] 1000 snapshots → Pas de ralentissement
- [ ] 10 backups → Gestion OK

### Concurrence

- [ ] Lecture/Écriture simultanées OK
- [ ] Multi-onglets pas de corruption
- [ ] Shutdown pendant écriture → Pas de perte

---

## 📋 TESTS D'INTÉGRATION

### Frontend ↔ Backend

- [ ] `TitanStateProvider` sync correcte
- [ ] Actions dispatch → Events persistés
- [ ] Événements Tauri reçus frontend
- [ ] Erreurs backend affichées UI

### Modules Intégrés

- [ ] Chat IA → Messages persistés
- [ ] XP Engine → Progression sauvée
- [ ] Knowledge → Notes persistées
- [ ] Settings → Préférences sauvées
- [ ] Agenda → Événements persistés

---

## 🚫 ANTI-PATTERNS VÉRIFIÉS

- [ ] Aucun `localStorage.setItem` pour données critiques
- [ ] Aucun `fs.writeFile` direct hors système mémoire
- [ ] Aucun état React non persisté pour données importantes
- [ ] Aucune duplication d'état entre modules

---

## 📊 MÉTRIQUES À COLLECTER

| Métrique | Seuil OK | Seuil Warning | Seuil Critical |
|----------|----------|---------------|----------------|
| Boot time | < 2s | 2-5s | > 5s |
| Memory Score | > 80 | 50-80 | < 50 |
| Journal size | < 10MB | 10-50MB | > 50MB |
| Snapshots count | 3-100 | 1-2 | 0 |
| Last backup | < 7 jours | 7-30 jours | > 30 jours |

---

## 🔄 PROCÉDURE DE VALIDATION

1. **Pré-check**
   ```bash
   cargo check --manifest-path src-tauri/Cargo.toml
   pnpm run type-check
   ```

2. **Tests unitaires**
   ```bash
   cargo test --manifest-path src-tauri/Cargo.toml -- persistence::
   pnpm run test
   ```

3. **Diagnostic Doctor**
   ```
   # Dans l'app ou via console dev
   titan_memory_doctor_diagnose()
   ```

4. **Test manuel**
   - Créer des données
   - Fermer l'app
   - Rouvrir → Vérifier restauration
   - Simuler crash → Vérifier recovery

5. **Stress test**
   - Générer 10k événements
   - Mesurer boot time
   - Vérifier mémoire

6. **Backup cycle**
   - Exporter
   - Modifier données
   - Importer (replace)
   - Vérifier restauration

---

## ✍️ SIGNATURE VALIDATION

| Validateur | Date | Version | Statut |
|------------|------|---------|--------|
| ___________ | ___/___/___ | v___ | ☐ Validé / ☐ Rejeté |

---

**Notes**:
- Tout échec Critical bloque la release
- Tout échec Warning nécessite justification
- Checklist à mettre à jour à chaque OPUS mémoire
