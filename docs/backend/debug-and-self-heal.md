# 🔧 Debug & Self-Heal Playbook — TITANE∞

**Il est 23h, TITANE∞ ne démarre pas. Voici ton plan d'action.**

---

## 🚨 Problèmes Fréquents (80/20)

### 1. TITANE∞ ne démarre pas

**Symptômes**: L'app crash au lancement ou affiche écran blanc.

**Actions**:
\`\`\`bash
# 1. Vérifier les logs
tail -f ~/.local/share/titane-infinity/logs/backend.log

# 2. Lancer en mode debug
pnpm run tauri dev

# 3. Vérifier santé backend
# (Si l'app démarre partiellement)
# → DevTools → invoke('quick_health_check')

# 4. Si corruption mémoire suspectée
rm -rf ~/.local/share/titane-infinity/memory/*
pnpm run tauri dev  # Redémarre clean
\`\`\`

**Causes fréquentes**:
- Snapshot corrompu → Supprimer memory/
- Port déjà occupé → Tuer processus existant
- Dépendance manquante → pnpm install + cargo build

---

### 2. Corruption Mémoire

**Symptômes**: Erreurs "Failed to read snapshot", données manquantes.

**Actions**:
\`\`\`bash
# 1. Vérifier intégrité (quand implémenté)
pnpm run verify:backend

# 2. Lancer SelfHeal
# DevTools console:
await invoke('run_evolution');
# Attendre 2-10 secondes
const state = await invoke('get_evolution_state');
console.log(state);

# 3. Si échec: backup + reset
cp -r ~/.local/share/titane-infinity/memory ~/backup_memory
rm -rf ~/.local/share/titane-infinity/memory
# Redémarrer app
\`\`\`

**Note**: StorageGuard (v17.3.0) valide les chemins, mais pas encore checksums.

---

### 3. Performance Dégradée

**Symptômes**: CPU élevé, latence commandes, UI freeze.

**Actions**:
\`\`\`bash
# 1. Check metrics Helios
await invoke('get_helios_state');
# Si CPU > 80% ou RAM > 90% → Problème

# 2. Vérifier tâches lourdes
# → Logs backend: chercher "Evolution", "Scan", "Flush"
grep "Evolution" ~/.local/share/titane-infinity/logs/backend.log

# 3. Forcer GC / restart
# Option nucléaire: fermer app + tuer process
pkill -f titane
pnpm run tauri dev
\`\`\`

**Roadmap**: SUPER-PROMPT 2 créera observabilité runtime (get_runtime_metrics).

---

## 🛠️ Outils de Debug

### DevTools Console (Frontend)

\`\`\`javascript
// Health check rapide
await invoke('quick_health_check');

// État complet système
await invoke('get_full_system_state');

// Lancer auto-évolution
await invoke('run_evolution');
\`\`\`

### Logs Backend

\`\`\`bash
# Logs live
tail -f ~/.local/share/titane-infinity/logs/backend.log

# Chercher erreurs
grep "ERROR" ~/.local/share/titane-infinity/logs/backend.log

# Filtrer par module
grep "[Helios]" backend.log
grep "[Engine]" backend.log
\`\`\`

### Commandes Verify (à implémenter - SUPER-PROMPT 3)

\`\`\`bash
pnpm run verify:backend        # Check build + tests + health
pnpm run verify:backend:quick  # Build seulement (30s)
pnpm run verify:backend:deep   # + health report détaillé (2-3 min)
\`\`\`

---

## 🔄 Self-Heal Engine

### Quand utiliser SelfHeal?

- **Auto (recommandé)**: Engine tourne périodiquement (toutes les 5-10 min en idle)
- **Manuel**: Après modification backend, avant commit, si problème détecté

### Workflow Manuel

\`\`\`javascript
// 1. Lancer diagnostics + repair
const result = await invoke('run_evolution');

// 2. Vérifier rapport
console.log(result);
/*
{
  status: "completed",
  diagnostics: { passed: 8, failed: 2 },
  repairs: { applied: 2, failed: 0 },
  duration_secs: 3.2,
  recommendations: [
    "Memory flush pending (45 MB)",
    "Nexus graph needs reindex"
  ]
}
*/

// 3. Si repairs: vérifier état après
const health = await invoke('quick_health_check');
console.log(health.issues);  // Doit être vide ou réduit
\`\`\`

### Limitations Actuelles

- **Pas de rollback auto**: Si repair échoue, état peut être partial
- **Pas de backup automatique**: Faire backup manuel avant repair lourd
- **Timeout 30s**: Tâches longues peuvent timeout (SUPER-PROMPT 2 améliore ça)

---

## 📋 Procédures d'Urgence

### Procédure 1: Reset Total Mémoire

\`\`\`bash
# Backup
cp -r ~/.local/share/titane-infinity/memory ~/backup_$(date +%Y%m%d_%H%M%S)

# Reset
rm -rf ~/.local/share/titane-infinity/memory

# Restart
pnpm run tauri dev
\`\`\`

**Impact**: Perte données session courante, mais app redémarre clean.

---

### Procédure 2: Rebuild Backend

\`\`\`bash
cd src-tauri
cargo clean
cargo build
cd ..
pnpm run tauri dev
\`\`\`

**Durée**: ~2-5 minutes selon machine.

---

### Procédure 3: Reset Complet Projet

\`\`\`bash
# Backup
tar -czf ~/titane_backup_$(date +%Y%m%d).tar.gz .

# Clean
rm -rf node_modules
rm -rf src-tauri/target
rm -rf ~/.local/share/titane-infinity

# Reinstall
pnpm install
cd src-tauri && cargo build && cd ..
pnpm run tauri dev
\`\`\`

**Impact**: Reset total, durée ~10 minutes.

---

## 🎯 Quand Déléguer au DevTools?

### Toi (humain) gères:
- Reset mémoire
- Rebuild backend
- Analyse logs pour patterns
- Décisions architecture

### SelfHeal Engine gère:
- Validations auto
- Repairs simples (reindex, flush, cleanup)
- Recommandations
- Health checks périodiques

**Règle**: Si problème > 5 min de debug → Reset + restart. Économise énergie.

---

## 📚 Ressources

- [Architecture](./architecture.md) — Comprendre flux de données
- [API Tauri](./api-tauri-summary.md) — Commandes health check
- [Contribution](./contribution-guide.md) — Tests & validation

---

**TITANE∞** — *"Un bug résolu est une leçon apprise."*
