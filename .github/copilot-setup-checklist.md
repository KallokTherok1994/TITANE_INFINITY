# Setup Checklist - Complete Once Per Project

- [ ] Created `.github/copilot-instructions.md`
- [ ] Created `.github/copilot-agents/guardian.agent.md`
- [ ] Created `.github/copilot-agents/dependency-guardian.agent.md`
- [ ] Created `.vscode/settings.json` with agent settings
- [ ] Ran "Index workspace" command in VS Code (Cmd/Ctrl+Shift+P → "Index workspace")
- [ ] AutoHeal system present: `scripts/autoheal/README.md`, `scripts/autoheal/autoheal_rules.jsonl`, `scripts/autoheal/apply_autoheal.sh`, `scripts/autoheal/detect_recurrence.sh`
- [ ] Inventory completed in proof-pack (`02_INSTRUCTIONS_INVENTORY.md`)
- [ ] Contradictions resolved or explicitly marked BLOCKED (`03_CONTRADICTIONS.md`)
- [ ] Committed all files to git
- [ ] Restarted VS Code

# Usage Checklist - For Every Session

- [ ] Started agent with "@agent" and Guardian Agent rules
- [ ] Received ANALYSIS COMPLETE summary before code
- [ ] Received DEPENDENCY CHECK before any installs
- [ ] Received VALIDATION results after implementation
- [ ] Captured each fix in `scripts/autoheal/autoheal_rules.jsonl` (append-only)
- [ ] Ran `bash scripts/autoheal/detect_recurrence.sh` before DONE/SEALED
- [ ] Ran `bash scripts/verify_instructions.sh` before DONE/SEALED
- [ ] All checks show PASS before accepting changes
