# 🚀 Quick Start Guide — TITANE Orchestration

## Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- GitHub Copilot (VSCode extension)
- VSCode with GitHub Copilot Chat

## Installation

### 1. Verify Setup
```bash
# Navigate to orchestration directory
cd orchestration

# Verify dependencies installed
npm list --depth=0

# Should show:
# titane-orchestration@1.0.0
# ├── @types/clipboardy@1.1.0
# ├── @types/node@20.19.25
# ├── chalk@4.1.2
# ├── clipboardy@3.0.0
# ├── ts-node@10.9.1
# ├── typescript@5.5.3
# └── yaml@2.3.4
```

### 2. Test Scripts
```bash
# View current progress
pnpm run status

# Get next task (copies to clipboard)
pnpm run next

# Mark task as completed
pnpm run update P0-1 completed
```

## Using GitHub Copilot Agents

### 1. Verify Agents Available
Open GitHub Copilot Chat in VSCode and type `@` - you should see:
- `@titane-conductor` - Main orchestrator
- `@audit-subagent` - Audit specialist
- `@implement-subagent` - Implementation specialist
- `@review-subagent` - Review specialist

### 2. Start First Task
```bash
# Generate first task prompt
cd orchestration
pnpm run next

# This will copy to clipboard:
# 🎯 TÂCHE P0-1 — Analyse structure complète
```

### 3. Execute with Conductor
In GitHub Copilot Chat:
```
@titane-conductor [paste the prompt from clipboard]
```

### 4. Follow Workflow
The conductor will:
1. **Plan** - Analyze task, create implementation plan
2. **Delegate** - Handoff to specialized subagents
3. **Review** - Validate implementation
4. **Complete** - Mark task done

### 5. Update Progress
```bash
# After task completion
pnpm run update P0-1 completed

# Get next task
pnpm run next
```

## Workflow Example

```bash
# Terminal 1: Monitor progress
cd orchestration
watch -n 5 pnpm run status

# Terminal 2: Execute tasks
pnpm run next
# Copy prompt, execute with @titane-conductor in Copilot
# After completion:
pnpm run update P0-1 completed
pnpm run next
# Repeat...
```

## Troubleshooting

### Agents not visible in Copilot
1. Restart VSCode
2. Ensure `.github/agents/` directory exists
3. Check agent files end with `.agent.md`
4. Verify YAML frontmatter is valid

### Scripts not working
```bash
cd orchestration
pnpm install  # Reinstall dependencies
pnpm run status  # Should work without errors
```

### TypeScript errors
```bash
cd orchestration
npx tsc --noEmit  # Check for type errors
```

## File Reference

| File | Purpose |
|------|---------|
| `.github/agents/*.agent.md` | Custom Copilot agents |
| `.github/instructions/titane.instructions.md` | Global constraints |
| `orchestration/roadmap.yaml` | Task definitions |
| `orchestration/current-state.json` | Execution state |
| `orchestration/scripts/` | Helper utilities |
| `plans/` | Generated task plans |

## Commands Cheat Sheet

```bash
# Orchestration
pnpm run status          # View progress
pnpm run next            # Get next task
pnpm run update <id> <status>  # Update task

# Development
pnpm run dev             # Start Vite dev server
pnpm run dev:tauri       # Start Tauri app
pnpm run build           # Build production
pnpm run test            # Run tests

# Backend
cd src-tauri
cargo check             # Type check Rust
cargo test              # Run Rust tests
cargo build --release   # Build optimized
```

## Next Steps

1. ✅ Run `pnpm run status` to see current progress (0/18)
2. ✅ Run `pnpm run next` to get first task P0-1
3. ✅ Execute with `@titane-conductor` in Copilot Chat
4. ⏳ Complete Phase 0 audit (3 tasks)
5. ⏳ Proceed to Phase 1 simplification

## Support

- **Documentation:** [ORCHESTRATION_MANIFEST.md](ORCHESTRATION_MANIFEST.md)
- **Architecture:** [orchestration/architecture.md](orchestration/architecture.md)
- **Roadmap:** [orchestration/roadmap.yaml](orchestration/roadmap.yaml)

---

*TITANE_INFINITY v19.5.2 — 9 Cognitive Engines*
