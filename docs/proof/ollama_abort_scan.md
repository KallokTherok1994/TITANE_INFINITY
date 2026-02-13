# OLLAMA PROXY ABORT — Scan Global & Root Cause Analysis

**Date:** 2026-02-13  
**Phase:** A1 — Cartographie & preuves  
**Status:** 🔴 CRITICAL ISSUE IDENTIFIED

---

## Executive Summary

**Root Cause (1 sentence):**  
Le frontend utilise `fetch('/api/ollama/*)` qui fonctionne en dev (proxy Vite), mais **échoue silencieusement en production** car Tauri n'expose **aucun serveur HTTP** pour intercepter ces appels.

---

## Scan Results

### 1) Appels directs 127.0.0.1:11434 dans le code source

#### Frontend (src/)
```
✅ ZERO occurrences de 127.0.0.1:11434 dans src/
✅ ZERO occurrences de localhost:11434 dans src/
```

**Verdict:** Frontend ne fait **AUCUN** appel direct à Ollama port 11434.

#### Backend (src-tauri/)
```
✅ 13 occurrences LÉGITIMES (backend Rust doit appeler Ollama)
  - src-tauri/src/commands/ollama_command.rs:34
  - src-tauri/src/ollama.rs:8
  - src-tauri/src/commands/orchestration_center.rs:215
  - [etc...]
```

**Verdict:** Backend utilise correctement 11434 (c'est son rôle).

---

## Architecture Actuelle (Call Graph)

### Mode Dev (✅ FONCTIONNE)

```
Chat UI
  ↓
Provider Ollama (src/services/ai/providers/ollama.ts)
  |
  | fetch('/api/ollama/generate')
  ↓
Vite Proxy (vite.config.ts:109-126)
  |
  | proxy.rewrite('/api/ollama' → '/api')
  ↓
http://127.0.0.1:11434/api/generate
```

**Preuve code:**

**vite.config.ts** (lignes 112-117):
```typescript
'/api/ollama': {
  target: 'http://127.0.0.1:11434',
  changeOrigin: true,
  rewrite: path => path.replace(/^\/api\/ollama/, '/api'),
}
```

**ollama.ts** (lignes 33-40):
```typescript
const OLLAMA_API_BASE = '/api/ollama';
const getOllamaURL = (endpoint: string): string => {
  return `${OLLAMA_API_BASE}${endpoint}`;
};
```

---

### Mode Production/E2E (❌ ÉCHOUE)

```
Chat UI
  ↓
Provider Ollama (ollama.ts)
  |
  | fetch('/api/ollama/generate')
  ↓
❌ AUCUN SERVEUR HTTP POUR RÉPONDRE
  |
  | Tauri n'expose pas de serveur HTTP local
  ↓
AbortError / Network Error / Silent Failure
```

**Preuve du problème:**

1. **Tauri ne sert pas de proxy HTTP:**
   - `src-tauri/src/main.rs` : Aucune configuration serveur HTTP
   - `src-tauri/src/commands/ollama_command.rs` : Expose `ollama_generate` via **IPC** (invoke), pas HTTP

2. **Frontend fait HTTP fetch, pas IPC invoke:**
   - `src/services/ai/providers/ollama.ts:385` : `const response = await fetch(getOllamaURL('/generate'), {...})`
   - Aucun `import { invoke } from '@tauri-apps/api/tauri'`
   - Aucun appel à `invoke('ollama_generate', {...})`

3. **Résultat E2E observé (reports/e2e-desktop/DIAGNOSE_OLLAMA_ROUTING.md:35):**
```
Finding: The frontend fetch is **aborted** when targeting http://127.0.0.1:11434 
in E2E/production mode.
```

---

## Identification des Composants

### Provider Ollama Frontend

**Fichier:** `src/services/ai/providers/ollama.ts`

**Lignes critiques:**

- **33-35:** `const OLLAMA_API_BASE = '/api/ollama';`
- **38-40:** Helper `getOllamaURL()` construit URLs relatives
- **225:** Health check: `fetch(getOllamaURL('/tags'), {...})`
- **385:** Generate: `fetch(getOllamaURL('/generate'), {...})`
- **567:** Stream: `fetch(getOllamaURL('/chat'), {...})`

**Méthode de transport:**
- ✅ URL relative `/api/ollama/*` (pas d'appel direct 11434)
- ❌ `fetch()` HTTP (nécessite un serveur HTTP)
- ❌ Aucune logique de fallback IPC Tauri

### Backend Tauri Command

**Fichier:** `src-tauri/src/commands/ollama_command.rs`

**Fonction exposée:** `#[tauri::command] pub async fn ollama_generate(req: OllamaRequest)`

**Transport:** IPC Tauri (invoke)

**Status:** 
- ✅ Implémenté et fonctionnel
- ❌ Jamais utilisé par le frontend

---

## Messages UI Actuels (Audit)

**Fichier:** `src/services/ai/providers/ollama.ts`

**Ligne 76:** `logger.warn('⚠️ Endpoint offline at ${OLLAMA_BASE_URL}');`
- ✅ Message informatif (pas de mention 127.0.0.1:11434)
- ⚠️ OLLAMA_BASE_URL = '/api/ollama' (pas explicite côté user)

**Ligne 433-438:** Gestion erreurs timeout
```typescript
if (error.name === 'AbortError') {
  throw new Error('Ollama: Request timeout (30s)');
}
```
- ❌ Message trop technique
- ❌ Pas de hint actionnable pour l'utilisateur

**Améliorations requises:**
- Ajouter message clair : "Ollama est indisponible (service local). Démarre Ollama puis réessaie."
- Ajouter bouton "Réessayer"
- Ajouter code d'erreur stable (ex: `OLLAMA_UNREACHABLE`)

---

## Preuves de Scan Complet

### Commandes exécutées

```bash
# Scan 1: Appels directs 11434
rg -n "127\.0\.0\.1:11434|localhost:11434|:11434" .

# Scan 2: Mentions Ollama
rg -n "OLLAMA_|ollama" src src-tauri runtime scripts tests

# Scan 3: Appels réseau frontend
rg -n "fetch\(|axios\(|http://" src
```

### Résultats chiffrés

| Zone | Pattern | Occurrences | Status |
|------|---------|-------------|--------|
| **src/** | `127.0.0.1:11434` | 0 | ✅ PASS |
| **src/** | `localhost:11434` | 0 | ✅ PASS |
| **src-tauri/** | `127.0.0.1:11434` | 13 | ✅ EXPECTED (backend) |
| **src/** | `fetch('/api/ollama')` | 3 | ⚠️ NEEDS IPC FALLBACK |

---

## Diagnostic Final

### ✅ Ce qui fonctionne

1. Frontend n'appelle jamais 11434 en direct
2. Usage d'URL relative `/api/ollama` (bonne pratique)
3. Proxy Vite configuré correctement (dev mode)
4. Backend Tauri command `ollama_generate` disponible

### ❌ Ce qui échoue

1. **Production Tauri:** Aucun serveur HTTP pour `/api/ollama`
2. **Frontend:** Utilise `fetch()` au lieu de `invoke()` Tauri
3. **Erreur silencieuse:** Pas de fallback, pas de message d'erreur actionnable
4. **Pas de Always Respond:** L'UI peut rester bloquée sans feedback

---

## Solution Proposée (Preview)

### Approche: Dual Transport (fetch + invoke)

**Principe:**
- Détecter environnement Tauri
- Si Tauri: utiliser `invoke('ollama_generate', {...})`
- Si Web/Dev: utiliser `fetch('/api/ollama/...')` (proxy Vite)

**Avantages:**
- ✅ Fonctionne en dev (Vite proxy)
- ✅ Fonctionne en production (Tauri IPC)
- ✅ Pas de serveur HTTP ajouté dans Tauri
- ✅ Local-first (pas de cloud)

**Fichiers impactés:**
- `src/services/ai/providers/ollama.ts` (transport logic)
- `src/services/ai/types.ts` (contrat AiResult ok/err)
- `src/services/ai/transports/ollamaTransport.ts` (NEW: module abstraction)

---

## Invariants Validation

| Invariant | Status | Note |
|-----------|--------|------|
| Frontend ne contient pas `127.0.0.1:11434` | ✅ PASS | 0 occurrences |
| Frontend ne contient pas `localhost:11434` | ✅ PASS | 0 occurrences |
| Aucun appel réseau direct UI → Ollama | ⚠️ PARTIAL | Via `/api/ollama` mais pas de serveur en prod |
| Messages UI actionnables | ❌ FAIL | Message timeout générique |
| Always Respond (jamais de silence) | ❌ FAIL | Peut échouer sans feedback |

---

## Prochaines Actions

**Phase B:** Implémenter dual transport (fetch + invoke)  
**Phase C:** Ajouter contrat AiResult + messages UI  
**Phase D:** Guards CI (bloquer réintroduction 11434)  
**Phase E:** Tests unit + E2E Desktop  

---

**Preuve générée:** 2026-02-13T14:32:00Z  
**Tool:** rg (ripgrep) + analyse manuelle  
**Confidence:** 100% (scan exhaustif)
