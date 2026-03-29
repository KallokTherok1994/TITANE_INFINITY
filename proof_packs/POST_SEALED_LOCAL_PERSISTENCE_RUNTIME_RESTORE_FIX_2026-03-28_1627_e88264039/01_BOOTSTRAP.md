# BOOTSTRAP

## Commands and key outputs

```
git status --porcelain=v1
```
Summary: existing modified/untracked surfaces present; no diffs under src/ or src-tauri.

```
git rev-parse --short HEAD
```
e88264039

```
git branch --show-current
```
MAIN

```
git log -20 --oneline
```
Recorded locally; no new product commits in this cycle.

```
git diff --stat
```
Preexisting diffs plus this cycle: restore harness update in e2e test, runtime proof spec update.

```
git diff --name-only
```
No diffs under src/ or src-tauri.

```
git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
```
Empty (no product drift).

```
grep '\"version\"' package.json
```
"version": "28.88.0"

```
grep '^version' src-tauri/Cargo.toml
```
version = "28.88.0"

```
rg -n "titan_list_snapshots|titan_recover_state|snapshot|restore" -S src src-tauri
```
Commands present in src-tauri/src/persistence/commands.rs and tauri.conf.json.

```
find . -maxdepth 6 -name '*.db' -o -name '*snapshot*'
```
Runtime stores found under ~/.local/share/TITANE_INFINITY/runtime/memory and ~/.local/share/TITANE_INFINITY/persistence.

```
test -f scripts/autoheal/autoheal_rules.jsonl
```
AUTOHEAL_RULES_PRESENT

```
test -f registry/proofpack-index.jsonl
```
PROOFPACK_REGISTRY_PRESENT

## Environment
- External sync env: no TURSO/Option1 config detected (BLOCKED_ENV).
