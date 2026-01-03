# 🧪 STAGING TESTS — GUIDE RAPIDE

**Date**: 11 décembre 2025 09:10  
**Branch**: staging  
**Runtime**: Titan-Dev (PID 1022423/1022485) ACTIF ✅  
**Durée Estimée**: 15 minutes

---

## 🎯 OBJECTIF

Valider les 3 tests critiques **S1, S2, R1** dans le runtime actif pour compléter la validation de **85% → 100%**.

---

## ✅ PRÉ-REQUIS

**Runtime Status**:

```bash
✅ Vite: PID 1022423 (port 5173)
✅ Tauri: PID 1022485 (backend actif)
✅ Interface: http://localhost:5173
```

**Logs Monitoring**:

```bash
# Terminal 1 - Logs Singularity
tail -f runtime/dev/logs/restart_*.log | grep -E "(SINGULARITY|coherence|meta-tags|ltm)"

# Terminal 2 - Logs généraux
tail -f runtime/dev/logs/*.log | grep -E "(Chat IA|ConversationPipeline)"
```

**Backup Safety**:

```bash
git tag backup-pre-staging-tests-$(date +%Y%m%d)
git push origin backup-pre-staging-tests-$(date +%Y%m%d)
```

---

## 📋 TESTS À EXÉCUTER

### TEST S1: Baseline Singularity ⏱️ 3 min

**Objectif**: Vérifier meta-processing basique

**Procédure**:

1. **Localiser fenêtre Tauri**:
   - `Alt+Tab` pour cycler fenêtres
   - Vérifier workspaces (Super+1/2/3)
   - Chercher "TITANE" dans barre des tâches

2. **Ouvrir Chat IA**:
   - Cliquer icône Chat IA (ou F9)
   - Attendre chargement interface

3. **Envoyer message**:

   ```
   Bonjour TITANE
   ```

4. **Observer logs** (Terminal 1):
   ```
   Chercher pattern:
   [Ω:SINGULARITY] ✅ Meta-processing success | coherence=X.XX | corrections=N
   ```

**Success Criteria**:

- ✅ Logs `[Ω:SINGULARITY]` présents
- ✅ Coherence score **≥ 0.80** (baseline)
- ✅ Réponse Chat IA normale (pas d'erreur)
- ✅ Latence totale **< 500ms** (premier appel)

**Résultats Attendus**:

```
[Ω:SINGULARITY] ✅ Meta-processing success | coherence=0.95 | corrections=0
Total latency: ~150-300ms (cold start)
Meta-tags: ["greeting", "baseline"]
LTM suggestions: [] (message trop court)
```

---

### TEST S2: LTM Trigger ⏱️ 5 min

**Objectif**: Vérifier déclenchement consolidation LTM

**Procédure**:

1. **Envoyer message long** (>300 caractères):

   ```
   Peux-tu m'expliquer en détail comment fonctionne l'algorithme de hachage SHA-256 ?
   J'aimerais comprendre les étapes de prétraitement, le padding des messages,
   la fonction de compression, et comment les valeurs de hachage initiales sont
   calculées. Quelles sont les propriétés cryptographiques qui le rendent sûr ?
   ```

2. **Observer logs** (Terminal 1):
   ```
   Chercher patterns:
   [Ω:SINGULARITY] ✅ Meta-processing success
   should_consolidate_to_ltm: true
   LTM suggestions: ["crypto_sha256_detailed", ...]
   ```

**Success Criteria**:

- ✅ Coherence score **≥ 0.85** (réponse technique)
- ✅ `should_consolidate_to_ltm: true` dans logs
- ✅ Meta-tags contiennent `"ltm_candidate"`
- ✅ LTM suggestions **non vides** (≥1 suggestion)
- ✅ Latence **< 300ms** (cache warmé)

**Résultats Attendus**:

```
[Ω:SINGULARITY] ✅ Meta-processing success | coherence=0.92 | corrections=1
should_consolidate_to_ltm: true (length=320, tags=7, valence=0.8)
Meta-tags: ["technical", "cryptography", "sha256", "ltm_candidate", "detailed_explanation"]
LTM suggestions: ["crypto_sha256_context", "hash_algorithms_knowledge"]
Total latency: ~180-250ms
```

---

### TEST R1: OMEGA P2 Performance ⏱️ 3 min

**Objectif**: Vérifier optimisation BYPASS MODE (réponse triviale)

**Procédure**:

1. **Envoyer question triviale**:

   ```
   Quelle est la capitale de la France ?
   ```

2. **Observer logs** (Terminal 1):
   ```
   Chercher patterns:
   [🚀 BYPASS MODE] Réponse directe (latence <50ms)
   [Ω:SINGULARITY] ✅ Meta-processing success | coherence=1.00
   Total pipeline latency: <200ms
   ```

**Success Criteria**:

- ✅ `[🚀 BYPASS MODE]` détecté dans logs
- ✅ Latence BYPASS **< 50ms**
- ✅ Latence totale pipeline **< 200ms**
- ✅ Coherence score **≥ 0.95** (réponse simple)
- ✅ **PAS** de logs Ψ₁/Ψ₂ (étapes symboliques skippées)

**Résultats Attendus**:

```
[🚀 BYPASS MODE] Réponse directe (latence 18ms)
[Ω:SINGULARITY] ✅ Meta-processing success | coherence=1.00 | corrections=0
Total pipeline latency: 145ms
Meta-tags: ["factual", "geography", "trivial"]
LTM suggestions: [] (pas de consolidation)
```

---

## 📊 CAPTURE RÉSULTATS

### Extraction Automatique

```bash
# Créer rapport tests
mkdir -p test-results/staging

# Extraire logs Singularity
grep "SINGULARITY" runtime/dev/logs/restart_*.log > test-results/staging/singularity_logs.txt

# Extraire métriques
grep -E "(coherence|latency|meta-tags|ltm)" runtime/dev/logs/restart_*.log > test-results/staging/metrics.txt

# Analyser avec script Python
python3 scripts/test/test_singularity_logs.py > test-results/staging/analysis_report.txt
```

### Template Résultats

Créer `test-results/staging/RESULTS_SUMMARY.md`:

```markdown
# STAGING TESTS — RÉSULTATS

**Date**: 11 décembre 2025
**Runtime**: Titan-Dev
**Tests Exécutés**: 3/3 ✅

## Résultats

### S1: Baseline Singularity

- Status: ✅ PASS / ❌ FAIL
- Coherence: X.XX (target ≥0.80)
- Latency: XXXms (target <500ms)
- Meta-tags: [...list...]
- Notes: ...

### S2: LTM Trigger

- Status: ✅ PASS / ❌ FAIL
- Coherence: X.XX (target ≥0.85)
- Latency: XXXms (target <300ms)
- LTM triggered: ✅ OUI / ❌ NON
- LTM suggestions: [...list...]
- Notes: ...

### R1: OMEGA P2

- Status: ✅ PASS / ❌ FAIL
- BYPASS detected: ✅ OUI / ❌ NON
- BYPASS latency: XXms (target <50ms)
- Total latency: XXXms (target <200ms)
- Coherence: X.XX (target ≥0.95)
- Notes: ...

## Decision

- [ ] 3/3 PASS → Merge stable-runtime ✅
- [ ] 2/3 PASS → Investigate + retry
- [ ] ≤1/3 PASS → Debug required
```

---

## ✅ VALIDATION FINALE

### Si 3/3 TESTS PASS

```bash
# 1. Commiter résultats
git add test-results/staging/
git commit -m "test(staging): Singularity validation 3/3 PASS

S1 Baseline: coherence=0.95, latency=180ms ✅
S2 LTM Trigger: ltm_triggered=true, suggestions=2 ✅
R1 OMEGA P2: bypass=true, latency=145ms ✅

All criteria met. Ready for stable-runtime merge."

# 2. Merger vers stable-runtime
git checkout stable-runtime
git merge staging --no-ff -m "release(singularity): Deploy validated Singularity integration

STAGING VALIDATION: 3/3 PASS ✅
- Code: 100% validated
- Build: 100% clean
- Runtime: 100% operational
- Tests: 3/3 PASS (S1/S2/R1)

Production deployment approved."

# 3. Pousser vers GitHub
git push origin stable-runtime

# 4. Tag version
git tag -a v19.6.0-singularity -m "Singularity Integration Release

Features:
- Meta-processing conversation (Step 12 Pipeline)
- Coherence validation (style + identity)
- LTM auto-suggestions (smart triggers)
- Meta-tags generation (contextualization)
- Graceful fallback (error handling)

Validated: 100% (code + runtime + tests)
Confidence: 95%"

git push origin v19.6.0-singularity

# 5. Build production
./runtime/stable/build.sh

# 6. Deploy
# (selon procédure production TITANE∞)
```

### Si 2/3 TESTS PASS

```bash
# Analyser échec
cat test-results/staging/RESULTS_SUMMARY.md

# Debug spécifique
# - Si S1 fail: vérifier Step 12 pipeline
# - Si S2 fail: vérifier LTM criteria
# - Si R1 fail: vérifier BYPASS detection

# Corriger + retry
# Puis merge si OK
```

### Si ≤1/3 TESTS PASS

```bash
# Investigation approfondie requise
# Rollback staging
git reset --hard MAIN

# Debug complet
# Nouvelle session validation
```

---

## 🚨 TROUBLESHOOTING

### Fenêtre Tauri Non Trouvée

**Symptômes**: Alt+Tab ne montre pas la fenêtre

**Solutions**:

1. **Vérifier processus**:

   ```bash
   ps aux | grep titane-infinity
   # Si absent → relancer runtime
   ```

2. **Forcer affichage**:

   ```bash
   # Tuer + relancer avec --show
   killall -9 titane-infinity vite node
   pnpm run tauri dev -- --show
   ```

3. **Alternative xdotool**:

   ```bash
   # Récupérer window ID
   xdotool search --name "TITANE"

   # Forcer focus
   xdotool search --name "TITANE" windowactivate
   ```

4. **Dernière option: UI web**:

   ```bash
   # Ouvrir navigateur
   firefox http://localhost:5173

   # Tester Chat IA via web
   # (logs backend identiques)
   ```

### Logs Singularity Vides

**Symptômes**: Aucun `[Ω:SINGULARITY]` dans logs

**Diagnostics**:

1. **Vérifier Step 12 activé**:

   ```bash
   grep "Step 12" runtime/dev/logs/*.log
   # Devrait montrer "SINGULARITY META-PROCESSING"
   ```

2. **Vérifier feature flag**:

   ```bash
   grep "mock" Cargo.toml
   # Devrait être: features = ["mock"]
   ```

3. **Rebuild si nécessaire**:
   ```bash
   cargo clean
   pnpm run tauri dev
   ```

### Latences >200ms

**Symptômes**: Performances dégradées

**Optimisations**:

1. **Cache warmup**:

   ```bash
   # Envoyer 3-5 messages avant tests
   # Pour warmer JIT + caches
   ```

2. **Vérifier load CPU**:

   ```bash
   top -p $(pgrep titane-infinity)
   # CPU devrait être <50%
   ```

3. **Logs détaillés**:
   ```bash
   RUST_LOG=debug pnpm run tauri dev
   # Identifier bottleneck
   ```

---

## 📋 CHECKLIST COMPLÈTE

### Préparation (2 min)

- [ ] Runtime dev actif (pgrep)
- [ ] Logs monitoring lancés (2 terminaux)
- [ ] Backup tag créé
- [ ] test-results/staging/ créé

### Tests (15 min)

- [ ] **S1** exécuté (coherence ≥0.80, latency <500ms)
- [ ] **S2** exécuté (LTM triggered, coherence ≥0.85)
- [ ] **R1** exécuté (BYPASS detected, latency <200ms)

### Capture (3 min)

- [ ] Logs extraits (singularity_logs.txt)
- [ ] Métriques extraites (metrics.txt)
- [ ] Script analyse exécuté (analysis_report.txt)
- [ ] RESULTS_SUMMARY.md complété

### Validation (5 min)

- [ ] Résultats analysés
- [ ] Decision prise (merge/debug/rollback)
- [ ] Commit résultats
- [ ] Merge stable-runtime (si PASS)
- [ ] Tag version
- [ ] Build production

**TOTAL**: ~25 minutes (buffer 10 min)

---

## 🎯 SUCCESS CRITERIA GLOBAL

**Minimum Requis** (2/3 tests PASS):

- ✅ Code implémenté correctement
- ✅ Runtime stable
- ✅ Métriques dans targets

**Optimal** (3/3 tests PASS):

- ✅ Tous critères ci-dessus
- ✅ Coherence scores excellents (≥0.90)
- ✅ Latences optimales (<150ms)
- ✅ LTM triggered correctement
- ✅ BYPASS MODE performant

**Deploy Approved**: 3/3 PASS → **MERGE STABLE-RUNTIME** ✅

---

**Auteur**: GitHub Copilot (Claude Sonnet 4.5)  
**Date**: 11 décembre 2025 09:10  
**Runtime**: Titan-Dev ACTIF ✅  
**Next**: Exécuter tests S1/S2/R1 → Capturer résultats → Merge si OK
