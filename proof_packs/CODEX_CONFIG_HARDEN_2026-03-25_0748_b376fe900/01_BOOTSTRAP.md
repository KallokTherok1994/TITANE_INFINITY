# Bootstrap

## Commandes verbatim

```text
pwd
whoami
uname -a || true
git status || true
git rev-parse --short HEAD || true
git log -20 --oneline || true
node -v || true
pnpm -v || true
rg --version || true
codex --version || true
test -f ~/.codex/config.toml && echo "CODEX_CONFIG_PRESENT" || echo "CODEX_CONFIG_ABSENT"
test -f AGENTS.md && echo "AGENTS_PRESENT" || echo "AGENTS_ABSENT"
ls -la .github || true
ls -la scripts || true
ls -la docs || true
```

## Sorties clés

```text
pwd -> /home/titane-os/Documents/GitHub/TITANE_INFINITY
whoami -> titane-os
git rev-parse --short HEAD -> b376fe900
node -v -> v24.14.0
pnpm -v -> 10.30.2
rg --version -> ripgrep 14.1.0
codex --version -> /bin/bash: line 1: codex: command not found
CODEX_CONFIG_PRESENT
AGENTS_ABSENT
```

## Déclaration après bootstrap

- REAL STATE: config Codex locale présente mais minimale; `AGENTS.md` racine absent; repo déjà doté d'un kernel Copilot et de validateurs d'instructions
- TARGET DELTA: clarifier le split d'autorité et imposer une posture locale sûre avec profils explicites
- MAIN LOCK: absence de posture locale Codex gouvernée + absence de contexte repo racine
- NEXT ACTION <=30 MIN: lire les surfaces d'instructions utiles, définir le split, puis patcher minimalement
