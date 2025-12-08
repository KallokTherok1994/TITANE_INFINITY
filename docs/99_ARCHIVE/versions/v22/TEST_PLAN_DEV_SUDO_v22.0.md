# 🧪 TEST PLAN — DEV-SUDO v∞.22.0

## Quick Test Checklist (15 min)

### ✅ Phase 1: Base Commands (v∞.21.0)
```
1. diagnostic          → Doit afficher status système
2. status full         → Doit lister tous les modules
3. fix deps            → Doit proposer npm install @types/...
4. introspect          → Doit afficher état interne
5. self-heal           → Doit lancer réparation de base
```

### ✅ Phase 2: Deep Healing (v∞.22.0)
```
6. deep heal           → Doit analyser 5 couches (React/Zustand/OPUS/Tauri/Rust)
7. auto-fix            → Doit proposer 3 corrections automatiques
8. health check        → Doit appeler backend (ou fallback si indisponible)
```

### ✅ Phase 3: Scanning Operations (v∞.22.0)
```
9. scan modules        → Doit lister 15 engines OK + 5 problématiques
10. scan opus          → Doit analyser 9 modules OPUS (status individuel)
11. scan errors        → Doit détecter 3 erreurs TypeScript
12. test module Camera → Doit tester module Camera (import/render/state)
```

### ✅ Phase 4: Console Simulation (v∞.22.0)
```
13. sudo titane ls          → Doit afficher structure /src
14. titane ls /src/modules  → Doit lister devSudo/, camera/, etc.
15. ls                      → Doit afficher /src par défaut
16. titane open App.tsx     → Doit afficher message "en développement v∞.22.1"
17. console rebuild         → Doit proposer étapes création useSingularityStore
18. patch useChat           → Doit afficher message "patch interactif v∞.22.1"
```

### ✅ Phase 5: Optimization (v∞.22.0)
```
19. optimize build     → Doit lister optimisations Vite + Tauri
20. optimize ui        → Doit lister optimisations React + CSS
21. optimize rust      → Doit lister optimisations Cargo
22. optimize react     → Doit lister patterns memoization
```

### ✅ Phase 6: API Operations (v∞.22.0)
```
23. connect gemini     → Doit afficher config .env GEMINI_API_KEY
24. connect ollama     → Doit afficher ollama serve + pull llama2
25. test api gemini    → Doit simuler test connexion
26. verify keys        → Doit checker GEMINI_API_KEY dans .env
```

### ✅ Phase 7: DevOps Automation (v∞.22.0)
```
27. full sync              → Doit lister sync Frontend ↔ Backend
28. verify architecture    → Doit valider 6 couches TITANE∞
29. generate report        → Doit générer rapport avec 15/20 engines OK
```

---

## Detailed Test Scenarios

### Scenario 1: Developer Debugging Workflow
```
User: scan errors
→ Expected: "🔍 SCAN ERRORS — 3 erreur(s) détectée(s)"

User: deep heal
→ Expected: "🔄 DEEP-HEAL — 2/3 corrigées"

User: fix deps
→ Expected: "📦 FIX DEPS — npm install @types/framer-motion..."

User: health check
→ Expected: "💚 HEALTH CHECK — ✅ Système sain"
```

### Scenario 2: Module Investigation
```
User: scan opus
→ Expected: Liste 9 modules avec status ✅/⚠️

User: scan modules
→ Expected: 15 engines OK + 5 problématiques

User: test module devSudo
→ Expected: "🧪 TEST MODULE — devSudo ✅ OK"
```

### Scenario 3: Console Exploration
```
User: sudo titane ls
→ Expected: Structure /src avec drwxr-xr-x

User: titane ls /src/modules
→ Expected: Liste devSudo/, camera/, voice/, etc.

User: console rebuild
→ Expected: Étapes création useSingularityUnifiedStore.ts
```

### Scenario 4: Performance Optimization
```
User: optimize build
→ Expected: "⚡ OPTIMIZE BUILD — Build time: ~10s dev"

User: optimize ui
→ Expected: "🎨 OPTIMIZE UI — Lighthouse Score: 95+"

User: optimize react
→ Expected: "⚛️ OPTIMIZE REACT — Hooks memoization"
```

### Scenario 5: API Integration
```
User: connect gemini
→ Expected: "🔌 CONNECT API — gemini" + config .env

User: verify keys
→ Expected: "🔑 VERIFY KEYS — ✅/❌ GEMINI_API_KEY"

User: test api ollama
→ Expected: "🧪 TEST API — ollama ✅ Connexion OK"
```

### Scenario 6: DevOps Operations
```
User: full sync
→ Expected: "🔄 FULL SYNC — ✅ Système synchronisé"

User: verify architecture
→ Expected: "🏗️ VERIFY ARCHITECTURE — ✅ DIAMANT 97.5%"

User: generate report
→ Expected: "📊 GENERATE REPORT — 15/20 engines opérationnels"
```

---

## Badge Visual Test

1. Ouvrir Chat Bubble
2. Vérifier présence du badge **[🟢 DEV-SUDO]** dans le header
3. Animation pulse doit être visible (2s loop)
4. Couleur: Orange gradient (#f97316→#ea580c)

---

## Integration Test (useChat.ts)

1. Envoyer "diagnostic" dans le chat
2. Vérifier:
   - ✅ Réponse immédiate (< 100ms)
   - ✅ Pas d'appel au provider IA (Gemini/Ollama)
   - ✅ Message avec `metadata.devSudo: true`
   - ✅ Format de réponse avec emojis (🎯📊✅❌⚠️)

---

## Error Handling Test

```
User: sudo titane invalid_command
→ Expected: "⚠️ Action reconnue mais pas encore implémentée" + liste des 42 commandes

User: test module NonExistentModule
→ Expected: "🧪 TEST MODULE — NonExistentModule ⚠️ Problème détecté"
```

---

## Performance Benchmark

- **Detection**: < 10ms (pattern matching)
- **Execution**: < 100ms (handler response)
- **Total latency**: < 150ms (vs 2-5s pour requête IA)

---

## Regression Tests (v∞.21.0 commands)

Vérifier que les 17 commandes de base fonctionnent toujours:
```
✅ fix-deps
✅ fix-opus
✅ fix-error
✅ repair-component
✅ self-heal
✅ diagnostic
✅ status-full
✅ introspect
✅ analyze-module
✅ show-code
✅ restart-tauri
✅ test-bubble
✅ merge-opus
✅ create-component
✅ add-feature
✅ whitelist-tauri
✅ build-all
```

---

## Known Issues

1. **Types manquants** (non-bloquant):
   - framer-motion
   - lucide-react
   - react-window
   → Solution: `fix deps`

2. **CameraOverlay ref warning** (non-bloquant):
   → Solution: `auto-fix`

3. **OPUS modules** (7/9 problématiques):
   → Solution: `fix opus`

---

## Success Criteria

- ✅ 42 commandes reconnues
- ✅ 85+ patterns fonctionnels
- ✅ Badge visible dans ChatBubble
- ✅ Interception avant AI provider
- ✅ TypeScript 0 erreurs critiques
- ✅ Temps de réponse < 150ms
- ✅ Documentation complète

---

## Test Report Template

```markdown
## Test Report — DEV-SUDO v∞.22.0

**Date**: [Date]
**Tester**: [Nom]
**Duration**: [Minutes]

### Results
- Commands tested: [X]/42
- Success rate: [XX]%
- Failed commands: [Liste]
- Performance: [XX]ms avg

### Issues Found
1. [Description]
2. [Description]

### Notes
[Observations]
```

---

**Status**: Ready for testing 🚀
**Version**: v∞.22.0
**File**: TEST_PLAN_DEV_SUDO_v22.0.md
