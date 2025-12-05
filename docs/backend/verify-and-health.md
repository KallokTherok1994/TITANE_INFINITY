# 🔧 Verify & Health — TITANE∞ DevOps Local

**"Il est 23h. Est-ce que TITANE∞ va bien ? UNE commande pour savoir."**

---

## 🎯 Philosophie

**Problème**: Développeur fatigué à 23h → Veut savoir si tout fonctionne → Pas envie de lancer 10 commandes.

**Solution**: `npm run verify:backend` → 1 commande → Réponse claire (✅ OK, ⚠️ Warning, ❌ Failed)

---

## ⚡ Quick Check (2 minutes)

### Commande Existante

```bash
# Vérifier environnement système
npm run verify

# Ou manuellement
cd scripts
./check_system.sh
```

**Vérifie**:
- ✅ Rust/Cargo installés
- ✅ Node.js/pnpm/npm versions OK
- ✅ Tauri CLI disponible
- ✅ Dépendances système (webkit, libssl, etc.)

**Exit Codes**:
- `0` = OK
- `1` = Erreur bloquante

---

## 🚀 Verify Backend (À IMPLÉMENTER)

### Vision: `npm run verify:backend`

**Durée**: ~30s-2min selon machine

**Ce que ça fait**:

```bash
#!/bin/bash
# scripts/verify_backend.sh

echo "🔍 TITANE∞ Backend Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check environnement (5s)
echo "1/5 Checking environment..."
rustc --version || exit 1
cargo --version || exit 1
echo "✅ Environment OK"

# 2. Cargo build check (30s-1min)
echo "2/5 Building backend..."
cd src-tauri
if cargo build 2>&1 | tee build.log; then
    echo "✅ Build OK"
else
    echo "❌ Build failed (see src-tauri/build.log)"
    exit 1
fi

# 3. Cargo test (30s-1min)
echo "3/5 Running tests..."
if cargo test 2>&1 | tee test.log; then
    echo "✅ Tests OK"
else
    echo "⚠️  Some tests failed (see src-tauri/test.log)"
    exit 2
fi

# 4. Health check (si app en cours) (2s)
echo "4/5 Checking backend health..."
# Optionnel: Si app lancée, invoke quick_health_check
# Pour l'instant: skip si pas de process
if pgrep -f "titane-infinity" > /dev/null; then
    echo "✅ Backend process running"
    # TODO: Ajouter curl localhost:tauri_port/health ou invoke command
else
    echo "⚠️  Backend not running (OK for CI)"
fi

# 5. Summary (1s)
echo "5/5 Summary..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backend verification PASSED"
exit 0
```

**Exit Codes**:
- `0` = ✅ Tout OK
- `1` = ❌ Build failed (bloquant)
- `2` = ⚠️ Tests failed (warning)
- `3` = ❌ Health check failed

---

## 🏥 Health Check Commands

### Commandes Tauri Existantes

```typescript
// Quick health check (100ms-1s)
const health = await invoke<HealthCheckResult>('quick_health_check');
/*
{
  passed: true,
  issues: [],
  recommendations: ["Memory flush pending"],
  timestamp: "2025-11-22T23:00:00Z"
}
*/

// Full system state (50-150ms)
const state = await invoke<FullSystemState>('get_full_system_state');
/*
{
  helios: { cpu: 45.2, ram: 62.1, disk: 78.0 },
  memory: { entries: 1234, size_mb: 45.6 },
  nexus: { nodes: 89, edges: 234 },
  harmonia: { active_flows: 3 },
  sentinel: { alerts: 0 },
  engine: { last_evolution: "2025-11-22T22:50:00Z" }
}
*/

// Helios metrics (10ms)
const helios = await invoke<HeliosState>('get_helios_state');
```

### Commande CLI (À IMPLÉMENTER - Optionnel)

**Option 1: Via Tauri (déjà fait)**
```bash
# Lancer app en background, invoke command, parse résultat
# Complexe, pas prioritaire
```

**Option 2: Binaire Rust standalone**
```rust
// src-tauri/src/bin/health_check.rs
fn main() {
    let cpu = get_cpu_usage();
    let ram = get_ram_usage();
    
    if cpu > 80.0 || ram > 90.0 {
        eprintln!("⚠️ High resource usage");
        exit(1);
    }
    
    println!("✅ System healthy");
    exit(0);
}
```

```bash
# Usage
cargo build --bin titane_health_check
./src-tauri/target/debug/titane_health_check
```

**Recommandation**: Commencer par Option 1 (Tauri commands), Option 2 si besoin CLI pur.

---

## 🔗 Intégration SelfHeal / Sentinel

### Workflow: verify:backend + SelfHeal

```bash
# 1. Verify backend
npm run verify:backend

# 2. Si warning/error → Lancer SelfHeal
if [ $? -ne 0 ]; then
    echo "⚠️ Issues detected. Running SelfHeal..."
    # Nécessite app en cours
    # Ou: npm run repair:backend (à créer)
fi
```

### Script `repair:backend` (À IMPLÉMENTER)

```bash
#!/bin/bash
# scripts/repair_backend.sh

echo "🔧 TITANE∞ Backend Repair"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Clean build artifacts
echo "1/4 Cleaning build..."
cd src-tauri
cargo clean
cd ..
rm -rf dist .vite

# 2. Rebuild
echo "2/4 Rebuilding..."
cargo build || exit 1

# 3. Run SelfHeal (si app lancée)
echo "3/4 Running SelfHeal..."
# invoke('run_evolution') si app en cours
# Ou skip

# 4. Verify again
echo "4/4 Verifying..."
npm run verify:backend

exit $?
```

**Usage**:
```bash
npm run repair:backend  # Reset + rebuild + verify
```

---

## 📊 Modes de Vérification

### Mode 1: Quick Check (30s)

```bash
npm run verify:backend:quick

# Vérifie:
- Environnement OK (rustc, cargo)
- cargo build (pas de tests)
- Exit 0 ou 1
```

**Utilisation**: Avant commit rapide, CI pipeline

---

### Mode 2: Standard Check (2 min)

```bash
npm run verify:backend

# Vérifie:
- Environnement
- cargo build
- cargo test
- Health check (si app lancée)
- Exit 0, 1, 2, ou 3
```

**Utilisation**: Avant push, après modification backend

---

### Mode 3: Deep Check (5-10 min)

```bash
npm run verify:backend:deep

# Vérifie:
- Environnement
- cargo build + cargo clippy
- cargo test + cargo test --release
- cargo bench (optionnel)
- Health check détaillé
- Rapport complet (JSON)
```

**Utilisation**: Avant release, audit complet

---

## 🛠️ Implémentation (3 Étapes)

### Étape 1: Scripts Basiques (1h)

```bash
# 1. Créer scripts/verify_backend.sh
# 2. Ajouter dans package.json:
"verify:backend": "sh ./scripts/verify_backend.sh",
"verify:backend:quick": "sh ./scripts/verify_backend.sh --quick"

# 3. Tester
npm run verify:backend
```

---

### Étape 2: Health Check Integration (2h)

```rust
// src-tauri/src/api/system_api.rs

#[tauri::command]
pub async fn get_detailed_health_report(
    state: tauri::State<'_, AppState>,
) -> AppResult<DetailedHealthReport> {
    let helios = state.helios.get_state().await?;
    let memory = state.memory.get_state().await?;
    let nexus = state.nexus.get_state().await?;
    
    let issues = Vec::new();
    
    if helios.cpu > 80.0 {
        issues.push("High CPU usage".into());
    }
    if helios.ram > 90.0 {
        issues.push("High RAM usage".into());
    }
    if memory.entries > 10000 {
        issues.push("Memory needs cleanup".into());
    }
    
    Ok(DetailedHealthReport {
        timestamp: Utc::now(),
        overall_status: if issues.is_empty() { "healthy" } else { "warning" },
        issues,
        metrics: HealthMetrics {
            cpu: helios.cpu,
            ram: helios.ram,
            disk: helios.disk,
            memory_entries: memory.entries,
        },
    })
}
```

```typescript
// Frontend: src/services/healthCheck.ts
export async function runHealthCheck(): Promise<HealthCheckResult> {
  return invoke('get_detailed_health_report');
}
```

---

### Étape 3: Repair Scripts (2h)

```bash
# 1. Créer scripts/repair_backend.sh
# 2. Ajouter package.json:
"repair:backend": "sh ./scripts/repair_backend.sh"

# 3. Intégrer avec SelfHeal
```

---

## 📋 Checklist DevOps Local

### Avant Commit
- [ ] `npm run verify:backend:quick` → ✅ OK

### Avant Push
- [ ] `npm run verify:backend` → ✅ OK
- [ ] `git status` → Clean ou intentionnel

### Avant Release
- [ ] `npm run verify:backend:deep` → ✅ OK
- [ ] `npm run tauri build` → ✅ OK
- [ ] Tester binaire sur machine propre

### Si Problème
- [ ] Lire logs (`src-tauri/build.log`, `src-tauri/test.log`)
- [ ] Consulter `docs/backend/debug-and-self-heal.md`
- [ ] Si > 5 min debug → `npm run repair:backend`

---

## 🎯 Bénéfices

### Avant (Chaos)
- 10+ commandes manuelles
- Pas de standardisation
- Debugging intuitif
- Temps perdu: 20-30 min/problème

### Après (Clarté)
- 1 commande: `npm run verify:backend`
- Exit codes clairs (0/1/2/3)
- Scripts reproductibles
- Temps gagné: 18-27 min/problème (90% réduction)

---

## 🚀 Roadmap DevOps Locale

### Phase 1: Basique (FAIT)
- ✅ `scripts/check_system.sh` existe
- ✅ `npm run verify` disponible

### Phase 2: Backend Focus (À FAIRE - 5h)
- 🔲 `scripts/verify_backend.sh`
- 🔲 `scripts/repair_backend.sh`
- 🔲 `npm run verify:backend` / `verify:backend:quick` / `verify:backend:deep`
- 🔲 Exit codes standardisés

### Phase 3: Health Check (À FAIRE - 3h)
- 🔲 `get_detailed_health_report` Tauri command
- 🔲 Integration frontend (Dashboard DevTools)
- 🔲 Alerting seuils (CPU/RAM)

### Phase 4: CI/CD Local (FUTUR - 1 semaine)
- 🔲 Pre-commit hooks (verify:quick)
- 🔲 Pre-push hooks (verify:backend)
- 🔲 GitHub Actions integration
- 🔲 Rapport HTML (coverage, bench, health)

---

## 📚 Ressources

- [Debug Playbook](./debug-and-self-heal.md) — Procédures urgence
- [Architecture](./architecture.md) — Comprendre backend
- [Performance](./performance.md) — Métriques à monitorer
- [Contribution](./contribution-guide.md) — Tests & validation

---

## ✨ Citation

> **"Une boucle DevOps locale claire = Un développeur serein à 23h."**

**Transformation**:
- Avant: "Est-ce que ça marche ?" → 10 commandes → 20 min → Frustration
- Après: `npm run verify:backend` → 2 min → ✅/⚠️/❌ → Clarté

---

**TITANE∞ v17.3.0** — *"DevOps local = Sérénité mentale."*
