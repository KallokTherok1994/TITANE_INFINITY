# TERMINOLOGY ALIGNMENT FINAL
<!-- Status: STABLE | Ring: Doc | Date: 2026-02-24 -->

Définitions canoniques pour TITANE∞. Toute documentation non conforme doit être mise à jour ou marquée HISTORY.

---

## Termes canoniques

### Online-First Governed
**Définition :** Mode réseau par défaut pour TITANE∞ v27+. Internet est activé par défaut via surfaces contrôlées (reqwest, tauri-plugin-http). Le fallback local (Ollama) est disponible mais non prioritaire. Aucun provider cloud n'est activé sans clé API explicite.

**Référence :** `src/config/featureFlags.ts`, `src-tauri/src/ai/router.rs:check_internet()`

**Phrases interdites :** "local-first only", "100% offline", "no network"

**Phrase conforme :** "Online-first avec fallback local garanti"

---

### Tauri-Only
**Définition :** L'application est une application Tauri native. Aucun serveur HTTP interne, aucune API web standalone. Toutes les communications frontend↔backend passent par l'IPC Tauri.

**Référence :** `scripts/verify/enforce-tauri-only.sh`, `src/lib/ipc.ts`

**Phrases interdites :** "web server", "HTTP server at port", "express server"

---

### 4-Ring Architecture
**Définition :** Modèle d'import strict :
- Ring 1 (Types/Constants) : aucun import
- Ring 2 (Engines) : import Ring 1 seulement, pas d'I/O
- Ring 3 (Services) : I/O orchestration, import Ring 1-2
- Ring 4 (OS/UI) : peut importer tous les rings

**Référence :** `pnpm test:architecture`

---

### Stop-the-Line
**Définition :** Toute violation de gate bloque immédiatement le pipeline. Aucun bypass sans autorisation explicite et documentée. Produit `VERDICT = BLOCKED` avec cause + preuve + rollback.

**Référence :** `.github/copilot-instructions.md § A, B`

---

### Proof Pack
**Définition :** Ensemble de fichiers d'evidence requis pour valider un cycle : `VERDICT.md`, `SHA256SUMS.txt`, `ROLLBACK.md`, `FILES_CHANGED.md`, et les fichiers de preuves des gates passées.

**Référence :** `docs/_evidence/*/`

---

### Seal (Scellement)
**Définition :** Acte final d'un cycle : création du `LOCK.md` (timestamp + HEAD SHA + double SHA256), ajout d'une entrée append-only dans le registry, documentation du rollback drill.

---

### Truth Contract
**Définition :** Invariants impossibles à violer entre `mode`, `network_used`, `provider_used`, `reason_code` :
- `mode === "REMOTE" ⟹ network_used === true`
- `provider_used === "local_only" ⟹ mode !== "REMOTE"`
- `network_used === false ⟹ mode !== "REMOTE"`
- `fallback ⟹ reason_code !== "NONE"`

**Référence :** `src/types/providerDecisionMeta.ts`

---

### REMOTE (mode)
**Définition :** Mode où un provider cloud (OpenAI, Gemini, Anthropic) a été utilisé avec un appel réseau réel. Implique `network_used === true`.

**Ne pas confondre avec :** "disponibilité réseau" (c'est `internetReachable`)

---

### LOCAL (mode)
**Définition :** Mode où un provider local (Ollama, local engine) est utilisé, ou où un appel cloud a été bloqué par policy. `network_used === false`.

---

### OFFLINE (mode)
**Définition :** Fallback garanti (<1s) utilisé quand tous les providers échouent ou que le réseau est indisponible. `network_used === false`, `reason_code = FALLBACK_OFFLINE`.

---

### POLICY_BLOCKED
**Définition :** Reason code utilisé quand un provider cloud est disponible mais bloqué par politique (`VITE_ENABLE_EXTERNAL_AI` non défini). **Ne produit pas `mode: "REMOTE"`.**

---

## Phrases interdites (anti-promesse)

| Phrase interdite | Alternative conforme |
|-----------------|---------------------|
| "should work" | "prouvé par test XYZ" |
| "maybe" | (supprimer ou PR ROADMAP) |
| "soon" | (supprimer ou PR ROADMAP) |
| "100% offline ready" | "fallback local disponible (Ollama)" |
| "local-first only" | "online-first avec fallback local" |
| "no network required" | "fonctionne sans réseau via fallback local" |

---

## Statuts EXPERIMENTAL / QUALIFIED / STABLE

- **EXPERIMENTAL** : pas de tests, comportement non garanti
- **QUALIFIED** : tests PASS x3, preuves disponibles
- **STABLE** : QUALIFIED + utilisé en production au moins 1 cycle

---

*Source de vérité : ce fichier. Mis à jour uniquement via patch minimal avec preuve.*
