# 01_BOOTSTRAP

## Environnement

```
HEAD: 7cd1be080
git status: modified (staged) scripts/autoheal/autoheal_rules.jsonl + 2 commits ahead origin
node: v20.20.0 (nvm, .nvmrc=22 → MISMATCH: v20 actif, v22 attendu)
pnpm: 10.30.2
cargo: 1.94.0
rustc: 1.94.0
tauri-cli: 2.10.0
DISPLAY: :1 (actif)
```

## Node version mismatch

.nvmrc = 22, active = v20.20.0.
Classification: ACCEPTABLE — build frontend et tests passent avec v20 (prouvé x3).
Risque: si module Node strict v22 est requis, non détecté à ce stade.

## Commits post-baseline

```
7cd1be080 fix(audio): remove deprecated voice_synthesize_speech + allowlist
10fd73ec1 fix(ipc)+recert: VISION_CHAT_RECERT — register generate_response + proof pack
ca268bad8 chore(node): upgrade to Node.js v22 LTS
d697e1779 docs(audit): COMMIT_DISCIPLINE
efba8175d chore: upgrade repo verdict
536d86574 fix(vision+chat): VISION_CHAT_AUDIT
```
