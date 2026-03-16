# 02 - Scope audite

## Scope inclus
- Desktop boot/target/gouvernance (Tauri-only, online-first, configs)
- Tests x3: architecture + omega
- Build x3: build:prod-safe + guard verify
- Memory restore x3 (SQLite runtime)
- Provider slow/fail x3 (Ollama + app running + checks TypeScript)
- Tentatives E2E chat desktop et relaunch smoke

## Scope hors preuve complete
- Couverture complete atlas produit UI (toutes pages/tabs/panneaux)
- Durabilite relaunch L5 sur scenario critique chat
- TTFT utilisateur final visible mesuree en desktop interactif stable
