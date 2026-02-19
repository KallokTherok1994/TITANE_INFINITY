# Files Changed — ONLINE-FIRST Migration

**Total Files Modified:** 9  
**New Files Created:** 2 enforcement scripts + 10 evidence docs  
**Lines Changed:** 180 lines (excluding new scripts)

---

## Modified Files (by Phase)

### Phase 3: Docs/Instructions (54 lines)
1. `.github/copilot-instructions.md` (line 11)
   - **Change:** "Local-first only. No implicit cloud or network dependency." → "Online-first governed. Network allowed via controlled surfaces only. Local fallback mandatory."

2. `.github/instructions/titane.instructions.md` (lines 103-108)
   - **Change:** "LOCAL-FIRST (clarification stricte)" section → "ONLINE-FIRST GOVERNED (doctrine nouvelle)"

3. `README.md` (lines 220-222)
   - **Change:** "External AI (opt-in, local-first par défaut)" → "AI Providers (online-first, local fallback)"

**Diff:** docs/_evidence/online_migration/03_docs_patch.diff (54 lines)

---

### Phase 4: Scripts/Gates (53 lines)
4. `package.json` (lines 34, 38)
   - **Change:** verify:local-first → verify:online-first (2 occurrences)

5. `scripts/governance/constitutional-audit.sh` (lines 25, 205)
   - **Change:** "L1: LOCAL-FIRST STRICT" → "L1: ONLINE-FIRST GOVERNED"

6. `scripts/governance/prod-cert-release.sh` (line 111)
   - **Change:** "L1 LOCAL-FIRST: ✅ No HTTP servers" → "L1 NETWORK POLICY: ✅ Network via controlled surfaces only"

**New File:** `scripts/verify/enforce-online-first.sh` (87 lines, executable)

**Diff:** docs/_evidence/online_migration/04_scripts_patch.diff (53 lines)

---

### Phase 5: Runtime Network ON (42 lines)
7. `src/services/ai/orchestrator.ts` (lines 664-676)
   - **Change:** Ollama score **80 → 30** (mode auto)
   - **Change:** Comment "LOCAL FIRST avec cascade cloud" → "CLOUD FIRST (local fallback only)"
   - **Change:** Logger "Ollama prioritaire" → "Ollama fallback local"

8. `src-tauri/src/overdrive/chat_orchestrator.rs` (lines 492-495)
   - **Change:** Comment "🔒 LOCAL-FIRST: mode offline par défaut" → "🔒 ONLINE-FIRST: mode online par défaut via orchestrator TS"

**Diff:** docs/_evidence/online_migration/05_runtime_patch.diff (42 lines)

---

### Phase 6: Tauri Allowlist (12 lines)
9. `src-tauri/tauri.conf.json` (line 66)
   - **Change:** Added `__comment_network_policy` explaining ONLINE-FIRST network architecture

**New Doc:** `docs/_evidence/online_migration/06_network_policy.md` (comprehensive architecture doc)

**Diff:** docs/_evidence/online_migration/06_tauri_patch.diff (12 lines)

---

### Phase 7: Guards Anti-Bypass (19 lines)
10. `package.json` (line 39)
    - **Change:** Added `verify:network-guard` to verify pipeline

**New File:** `scripts/guards/guard-network-policy.sh` (194 lines, executable)
- G1: Check unapproved fetch() calls
- G2: Verify fetch() calls target localhost only
- G3: Verify cloud providers use secureInvoke (not direct fetch)
- G4: Verify enforce-online-first.sh gate exists
- G5: Verify Rust backend has reqwest

**Diff:** docs/_evidence/online_migration/07_guards_patch.diff (19 lines)

---

## Evidence Files Created (Phase 0-8)

```
docs/_evidence/online_migration/
├── 00_baseline.txt                    # Git status, toolchain, dependencies
├── 01_scan_raw.txt                    # 1446 ripgrep matches (247 KB)
├── 01_inventory.json                  # 18 critical files inventory
├── SCOPE_FILES.txt                    # 17 files scope lock
├── 02_plan.md                         # Ring-aware migration plan
├── 03_docs_patch.diff                 # Phase 3 changes (54 lines)
├── 04_scripts_patch.diff              # Phase 4 changes (53 lines)
├── 05_runtime_patch.diff              # Phase 5 changes (42 lines)
├── 06_tauri_patch.diff                # Phase 6 changes (12 lines)
├── 06_network_policy.md               # Network architecture doc
├── 07_guards_patch.diff               # Phase 7 changes (19 lines)
├── 08_runs/
│   ├── run1_online_first.log          # verify:online-first run 1/3
│   ├── run2_online_first.log          # verify:online-first run 2/3
│   ├── run3_online_first.log          # verify:online-first run 3/3
│   ├── run1_network_guard.log         # verify:network-guard run 1/3
│   ├── run2_network_guard.log         # verify:network-guard run 2/3
│   ├── run3_network_guard.log         # verify:network-guard run 3/3
│   ├── run1_check.log                 # TypeScript check run 1/3
│   ├── run2_check.log                 # TypeScript check run 2/3
│   └── run3_check.log                 # TypeScript check run 3/3
├── FINAL_VERDICT.md                   # Comprehensive verdict + gates status
└── FILES_CHANGED.md                   # This file
```

**Total Evidence:** 14 files + 9 logs = 23 artifacts

---

## Git Diff Summary

```bash
# View all changes at once
git diff .github/ README.md package.json src/ src-tauri/ scripts/

# View by phase
git diff .github/copilot-instructions.md .github/instructions/titane.instructions.md README.md  # Phase 3
git diff package.json scripts/governance/  # Phase 4
git diff src/services/ai/orchestrator.ts src-tauri/src/overdrive/chat_orchestrator.rs  # Phase 5
git diff src-tauri/tauri.conf.json  # Phase 6
git diff scripts/guards/guard-network-policy.sh package.json  # Phase 7
```

---

## Rollback Commands

```bash
# Restore all 9 modified files
git restore .github/copilot-instructions.md \
            .github/instructions/titane.instructions.md \
            README.md \
            package.json \
            src/services/ai/orchestrator.ts \
            src-tauri/src/overdrive/chat_orchestrator.rs \
            src-tauri/tauri.conf.json \
            scripts/governance/constitutional-audit.sh \
            scripts/governance/prod-cert-release.sh

# Remove new enforcement scripts
rm scripts/verify/enforce-online-first.sh
rm scripts/guards/guard-network-policy.sh

# Verify rollback
git status  # Should show no changes
```

---

**Status:** ✅ All changes captured with proofs  
**Next:** Commit with `git add docs/_evidence/online_migration/`
