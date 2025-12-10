# ═══════════════════════════════════════════════════════════════════════════

# TITANE∞ — DUAL-RUNTIME GIT WORKFLOW

# ═══════════════════════════════════════════════════════════════════════════

## 🌟 PHILOSOPHY

**TITANE∞** uses a **dual-runtime architecture** for complete separation between:

- **User Experience** (Titan-Stable) - Your daily cognitive OS
- **Development** (Titan-Dev) - Safe experimentation environment

**GOLDEN RULE**: Never develop in `stable-runtime` branch. Ever.

---

## 🎯 BRANCH STRUCTURE

```
MAIN                    # Legacy/backup branch
├─ stable-runtime       # 🔵 PRODUCTION (user runtime)
├─ dev                  # 🟢 DEVELOPMENT (dev environment)
└─ feature/*            # 🌿 FEATURE BRANCHES (experiments)
```

### Branch Purposes

| Branch             | Purpose                 | Rules                                                              | When to Use       |
| ------------------ | ----------------------- | ------------------------------------------------------------------ | ----------------- |
| **stable-runtime** | Production user runtime | ❌ No direct commits<br>✅ Only merges from `dev`<br>🔒 Protected  | Daily Titan usage |
| **dev**            | Development environment | ✅ Active development<br>✅ Testing<br>✅ Refactoring              | Building features |
| **feature/\***     | Feature branches        | ✅ Experiments<br>✅ Isolated work<br>✅ Merge to `dev` when ready | New features      |

---

## 🚀 QUICK START

### 1. Switch to Development Mode

```bash
cd /path/to/TITANE_INFINITY
./scripts/git/switch-dev.sh
```

### 2. Create a New Feature

```bash
./scripts/git/new-feature.sh visual-engine-v22
```

### 3. Work on Your Feature

```bash
# Make changes, commit normally
git add -A
git commit -m "feat: add visual engine v22 animations"
```

### 4. Merge to Dev

```bash
./scripts/git/switch-dev.sh
git merge feature/visual-engine-v22
# Test in Titan-Dev environment
```

### 5. Deploy to Stable (Production)

```bash
# Only when fully validated
./scripts/git/merge-dev-to-stable.sh
```

---

## 🛠️ AVAILABLE SCRIPTS

All scripts are located in `scripts/git/`:

| Script                     | Purpose                         | Usage                                            |
| -------------------------- | ------------------------------- | ------------------------------------------------ |
| **switch-stable.sh**       | Switch to stable-runtime branch | `./scripts/git/switch-stable.sh`                 |
| **switch-dev.sh**          | Switch to dev branch            | `./scripts/git/switch-dev.sh`                    |
| **new-feature.sh**         | Create feature branch from dev  | `./scripts/git/new-feature.sh <name>`            |
| **merge-dev-to-stable.sh** | Deploy dev → stable-runtime     | `./scripts/git/merge-dev-to-stable.sh`           |
| **clean-working-state.sh** | Stash or reset changes          | `./scripts/git/clean-working-state.sh [--force]` |

---

## 📋 WORKFLOW EXAMPLES

### Example 1: Quick Feature Development

```bash
# 1. Switch to dev
./scripts/git/switch-dev.sh

# 2. Create feature branch
./scripts/git/new-feature.sh chat-improvements

# 3. Develop + commit
git add -A
git commit -m "feat: improve chat response animations"

# 4. Merge back to dev
./scripts/git/switch-dev.sh
git merge feature/chat-improvements

# 5. Test in Titan-Dev
npm run tauri dev

# 6. Deploy to stable (when validated)
./scripts/git/merge-dev-to-stable.sh
```

### Example 2: Emergency Hotfix

```bash
# 1. Create hotfix from stable-runtime
./scripts/git/switch-stable.sh
git checkout -b hotfix/critical-memory-leak

# 2. Fix + commit
git add -A
git commit -m "fix: critical memory leak in MemoryOS"

# 3. Merge to stable-runtime
./scripts/git/switch-stable.sh
git merge hotfix/critical-memory-leak

# 4. Merge to dev too (keep branches synced)
./scripts/git/switch-dev.sh
git merge hotfix/critical-memory-leak
```

### Example 3: Long-Running Feature Development

```bash
# 1. Create feature branch
./scripts/git/new-feature.sh mega-feature-v2

# 2. Work over multiple days/weeks
# (commits accumulate in feature/mega-feature-v2)

# 3. Keep feature branch updated with dev
./scripts/git/switch-dev.sh
git pull  # Get latest dev changes
git checkout feature/mega-feature-v2
git merge dev  # Merge dev into feature

# 4. When ready, merge to dev
./scripts/git/switch-dev.sh
git merge feature/mega-feature-v2

# 5. Validate, then deploy to stable
./scripts/git/merge-dev-to-stable.sh
```

---

## ⚠️ CRITICAL RULES

### 🔴 NEVER DO

❌ **Never develop directly in `stable-runtime`**

- `stable-runtime` is for USER RUNTIME only
- Only merge validated changes from `dev`

❌ **Never force push to `stable-runtime`**

- This breaks user experience continuity

❌ **Never merge unvalidated code to `stable-runtime`**

- Always test thoroughly in `dev` first

❌ **Never interrupt Titan-Stable process during development**

- Stable runtime must remain independent

### ✅ ALWAYS DO

✅ **Always develop in `dev` or `feature/*` branches**

- This protects user experience

✅ **Always test in Titan-Dev before merging to stable**

- Validate features thoroughly

✅ **Always use merge (not rebase) for `dev` → `stable-runtime`**

- Preserves deployment history

✅ **Always commit before switching branches**

- Or use `./scripts/git/clean-working-state.sh` to stash

---

## 🔍 BRANCH STATUS CHECK

```bash
# Check current branch
git branch --show-current

# List all branches
git branch --list

# See commits ahead of stable-runtime
git log stable-runtime..dev --oneline

# Check for uncommitted changes
git status
```

---

## 🧹 CLEANUP & MAINTENANCE

### Clean Working State

```bash
# Stash changes (safe, can restore)
./scripts/git/clean-working-state.sh

# Reset changes (⚠️ DANGEROUS)
./scripts/git/clean-working-state.sh --force
```

### Delete Merged Feature Branches

```bash
# Delete local feature branch
git branch -d feature/old-feature

# Delete remote feature branch
git push origin --delete feature/old-feature
```

### Sync Branches

```bash
# Pull latest from remote
git pull origin dev
git pull origin stable-runtime

# Push local branches to remote
git push origin dev
git push origin stable-runtime
```

---

## 🎨 VISUAL WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    TITANE∞ GIT WORKFLOW                      │
└─────────────────────────────────────────────────────────────┘

       Development              Testing              Production
           Zone                  Zone                   Zone
  ┌────────────────────┐  ┌──────────────┐  ┌─────────────────────┐
  │  feature/new-ui    │  │              │  │                     │
  │  feature/memory-v2 │──▶│     dev      │──▶│  stable-runtime   │
  │  feature/chat-ia   │  │              │  │  (USER RUNTIME)     │
  └────────────────────┘  └──────────────┘  └─────────────────────┘
         🌿 Create              🟢 Test           🔵 Deploy
         🧪 Experiment         ✅ Validate       🚀 Use Daily
         💥 Break Things       🔧 Refine         🔒 Protected
         🔄 Iterate            🐛 Fix Bugs       ⚡ Stable

  Flow: feature/* → dev → stable-runtime → Kevin uses Titan all day
```

---

## 📞 TROUBLESHOOTING

### Problem: "I'm on stable-runtime and made changes"

```bash
# Stash your changes
git stash

# Switch to dev
./scripts/git/switch-dev.sh

# Apply your changes
git stash pop
```

### Problem: "Merge conflicts during dev → stable merge"

```bash
# After running merge-dev-to-stable.sh:
# 1. Resolve conflicts manually in VS Code
# 2. Stage resolved files
git add -A

# 3. Complete merge
git commit

# 4. Test stable build
cd runtime/stable
npm run build:stable
```

### Problem: "I need to switch branches but have uncommitted changes"

```bash
# Option 1: Stash changes
./scripts/git/clean-working-state.sh

# Option 2: Commit changes first
git add -A
git commit -m "wip: temporary commit"

# Option 3: Discard changes (⚠️ careful)
git reset --hard HEAD
```

---

## 🎓 LEARNING RESOURCES

- **Git Documentation**: https://git-scm.com/doc
- **Branching Strategy**: https://nvie.com/posts/a-successful-git-branching-model/
- **TITANE∞ Architecture**: See `ARCHITECTURE.md`
- **Dual-Runtime Setup**: See `docs/DUAL_RUNTIME_WORKFLOW.md` (coming soon)

---

## 📝 VERSION HISTORY

| Version | Date       | Changes                                 |
| ------- | ---------- | --------------------------------------- |
| v1.0    | 2025-01-XX | Initial dual-runtime Git workflow setup |

---

**🔵 Titan-Stable**: Your daily cognitive OS (never interrupted)  
**🟢 Titan-Dev**: Your development sandbox (break things freely)

**Philosophy**: Zero cognitive load. Zero interruptions. Maximum stability.

---

Generated by TITANE∞ Super Prompt #5 — Phase 1: Git Structure ✅
