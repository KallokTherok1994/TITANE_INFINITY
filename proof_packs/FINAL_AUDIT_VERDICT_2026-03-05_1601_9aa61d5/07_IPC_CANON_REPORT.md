# 07_IPC_CANON_REPORT — Rapport IPC Canonique
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## 1. Scan invoke() TS

### Commande
```bash
grep -rn "invoke(" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "test|spec|mock|//"
```

### Résultats

| Fichier | Lignes | Verdict |
|---------|--------|---------|
| `src/lib/tauriClient.ts` | 108, 115, 122 | ✅ OK — canonical single door |
| `src/lib/security.ts` | — | ✅ OK via secureInvoke |
| `src/utils/invoke.ts` | — | ✅ OK — secureInvoke (cap x3) |
| `src/os/bridge/TauriBridge.ts` | 32, 162, 172 | ⚠️ SUSPICION — invoke direct |
| `src/os/bridge/StateBridge.ts` | 84, 116, 225 | ⚠️ SUSPICION — via bridge.invoke |

**Status: PASS conditionnel** — tauriClient.ts est le canonical; bridges sont exceptions non formalisées.

---

## 2. Contrat Réponse IPC

### TS (src/lib/tauriClient.ts)

```typescript
// Règle critique: invoke() uniquement dans ce fichier
private async invoke<T>(command: TauriCommand, ...): Promise<T>
// Erreurs normalisées via TAPIError: { code, message, command, timestamp }
```

**Format sortie TS:** Erreurs normalisées `TauriError { code, message, command, timestamp }`

### Rust (src-tauri/src/commands/ia_context_commands.rs)

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult<T> {
    pub success: bool,     // équivalent "ok"
    pub data: Option<T>,   // équivalent "content"
    pub error: Option<String>,
}
```

**Convergence:** `CommandResult { success, data, error }` ≈ contrat `{ok, content, error}` — légèrement différent (success vs ok, data vs content).

**Status: PASS conditionnel** — contrat similaire mais pas identique partout.

---

## 3. Scan #[tauri::command] Rust

### Résultat
```
1261 occurrences de #[tauri::command] dans src-tauri/src/
Répartis dans src-tauri/src/commands/ (majority)
```

### Échantillon (10 commandes)

| Command | Fichier | Timeout | Réponse |
|---------|---------|---------|---------|
| `core_system` handlers | commands/core_system.rs | NON PROUVÉ | Result<T,String> |
| `conversation_generate` | chat_engine/commands.rs | NON PROUVÉ | CommandResult<T> |
| `health_check` | chat_engine/commands.rs | NON PROUVÉ | CommandResult<EngineHealthReport> |
| `set_state` | commands? | NON PROUVÉ | CommandResult<T> |
| `delete_state` | commands? | NON PROUVÉ | CommandResult<T> |
| `ping` | bridge via TauriBridge | NON PROUVÉ | Result<T,E> |

---

## 4. Timeouts

### TS (tauriClient.ts)
```typescript
interface TauriInvokeOptions {
  timeout?: number;  // Optional — default NON PROUVÉ
}
```

### Rust (gateway overdrive)
```rust
// chat_orchestrator.rs
timeout = Duration::from_secs(30)   // ✅ borné
redirect::Policy::limited(3)        // ✅ borné
```

**Status global timeouts:** PASS pour gateway overdrive, **NON PROUVÉ** pour les 1261 commands individuels.

---

## Résumé IPC Canon

| Aspect | Status | Preuve |
|--------|--------|--------|
| invoke() canonical | ✅ PASS | tauriClient.ts |
| secureInvoke (cap) | ✅ PASS | utils/invoke.ts |
| TauriBridge/StateBridge | ⚠️ SUSPICION | invoke() direct |
| Contrat {ok,content,error} | ⚠️ APPROX | CommandResult {success,data,error} |
| Timeouts gateway | ✅ PASS | chat_orchestrator.rs |
| Timeouts commands | NON PROUVÉ | 1261 commands non audités individuellement |
