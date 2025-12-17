# Setup Checklist - Complete Once Per Project

- [ ] Created `.github/copilot-instructions.md`
- [ ] Created `.github/copilot-agents/guardian.agent.md`
- [ ] Created `.github/copilot-agents/dependency-guardian.agent.md`
- [ ] Created `.vscode/settings.json` with agent settings
- [ ] Ran "Index workspace" command in VS Code (Cmd/Ctrl+Shift+P → "Index workspace")
- [ ] Committed all files to git
- [ ] Restarted VS Code

# Usage Checklist - For Every Session

- [ ] Started agent with "@agent" and Guardian Agent rules
- [ ] Received ANALYSIS COMPLETE summary before code
- [ ] Received DEPENDENCY CHECK before any installs
- [ ] Received VALIDATION results after implementation
- [ ] All checks show PASS before accepting changes
