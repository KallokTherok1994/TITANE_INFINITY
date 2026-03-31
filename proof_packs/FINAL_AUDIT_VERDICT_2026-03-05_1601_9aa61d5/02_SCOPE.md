# 02_SCOPE — Périmètre Audit Final
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Rings en Usage Réel

| Ring | Dossiers | Contraintes |
|------|----------|-------------|
| **R1 Types** | `src/types/`, `src/constants/` | Zéro imports, zéro I/O |
| **R2 Engines** | `src/engines/` (TS, ~20), `src-tauri/src/engines/` (Rust, ~9) | Imports R1 seulement, **zéro I/O** |
| **R3 Services** | `src/services/` (~56), `src/lib/`, `src/core/`, `src/os/bridge/`, `src-tauri/src/overdrive/` | I/O orchestré, R1+R2 imports |
| **R4 UI/Runtime** | `src/components/`, `src/pages/`, `src/features/`, `src/apps/`, `src-tauri/src/commands/` | Tout ring |
| **CI** | `.github/workflows/` (43), `scripts/` | Actions/SH |
| **Docs** | `docs/`, `registry/`, `proof_packs/` | Append-only |
| **Runtime** | `runtime/dev/`, `runtime/stable/`, `src-tauri/capabilities/` | JSON configs |

---

## Surfaces I/O

| Surface | Type | Modules Concernés |
|---------|------|------------------|
| Réseau backend | Network | `src-tauri/src/overdrive/` → Ollama/Gemini/OpenAI |
| **Ring 2 HTTP (VIOLATION)** | Network | `engines/unified_memory/summarizer.rs:315`, `embeddings.rs:216` |
| **window.fetch (RISK)** | Network | `selfHealingObserver.ts:431` |
| IPC canonical | IPC | `src/lib/tauriClient.ts` → `@tauri-apps/api/core invoke` |
| FS | FS | `registry/*.jsonl`, `proof_packs/`, `reports/`, `scripts/` |
| Process | Process | `scripts/*.sh` |
| Tests mocks | FS | `tests/mocks/tauri.ts`, `tauriCore.ts`, `tauriEvent.ts` |

---

## Outils Disponibles

| Outil | Version | Disponibilité |
|-------|---------|---------------|
| Node.js | v24.14.0 | ✅ |
| Rust / Cargo | 1.93.1 | ✅ |
| pnpm | 10.28.2 | ❌ MISSING |
| GTK | — | ❌ MISSING |
| Playwright | — | ❌ MISSING (node_modules) |
| WDIO | — | ❌ MISSING |

---

## Tests Attendus

| Type | Runner | Commande |
|------|--------|----------|
| Unit + Integration | Vitest | `pnpm test` |
| Architecture | Vitest | `pnpm test:architecture` (via `test:all`) |
| Compliance | Vitest | `pnpm test:compliance` |
| Rust | Cargo | `cargo test --all` |
| E2E Playwright | Playwright | `pnpm test:e2e:playwright` |
| E2E Desktop | WDIO | `pnpm e2e:desktop` |
| Lint | ESLint | `pnpm lint` |
| Format | Prettier | `pnpm format:check` |
| TypeCheck | TSC | `pnpm check` |

---

## Politique Audit-Only

- **Aucun fix appliqué dans ce run final**
- Les corrections identifiées sont dans `18_FIX_PLAN_DETAILED.md`
- Chaque fix futur: 1 commit atomique + preuve + rollback
- No refactor: corrections minimalistes ciblées
