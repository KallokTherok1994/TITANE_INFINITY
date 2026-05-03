# 01_BOOTSTRAP — G_BOOT_TRUTH
**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z  
**SHA:** 67b7b53  
**Branch:** copilot/audit-modules-and-generate-plan

---

## == ENV ==

```
$ pwd
/home/runner/work/TITANE_INFINITY/TITANE_INFINITY

$ uname -a
Linux runnervm0kj6c 6.14.0-1017-azure #17~24.04.1-Ubuntu SMP Mon Dec 1 20:10:50 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux

$ node -v
v24.14.0

$ pnpm -v
bash: pnpm: command not found   ← BLOCKED

$ rustc -V
rustc 1.93.1 (01f6ddf75 2026-02-11)

$ cargo -V
cargo 1.93.1 (083ac5135 2025-12-15)
```

## == GIT ==

```
$ git status
On branch copilot/audit-modules-and-generate-plan
nothing to commit, working tree clean

$ git rev-parse --short HEAD
67b7b53

$ git branch --show-current
copilot/audit-modules-and-generate-plan

$ git log -20 --oneline
67b7b53 audit: rename .log to .md so test/build logs are tracked in git
621a475 audit: complete module audit + fix plan (proof_packs/AUDIT_MODULES_2026-03-05_1433_0f7d943)
f920f86 (grafted) feat(e2e): add clickElementSafely helper to ui-driver
```

**Working tree: CLEAN** — no uncommitted changes.

## == SIZE ==

```
$ du -sh .
1.2G .

$ du -h --max-depth=2 . | sort -h | tail -n 25
3.9M   ./proof_packs
4.1M   ./scripts
4.1M   ./src/services
4.4M   ./docs/backup_20251218_122540
5.8M   ./docs/reports
8.5M   ./docs/_evidence
9.5M   ./docs/archive
13M    ./src-tauri/src
14M    ./src-tauri
15M    ./reports
21M    ./runtime
22M    ./deployment/v27.0.0-PRODUCTION
23M    ./docs/99_ARCHIVE
23M    ./src
27M    ./docs/__AUDITS__
77M    ./docs/01_misc
174M   ./.tools
179M   ./docs
190M   ./.git/lfs
213M   ./.git/objects
240M   ./deployment/latest
272M   ./deployment
405M   ./.git
1.2G   .
```

## == TOP SURFACES ==

```
$ ls -la (root)
44 top-level dirs + files (see 02_SCOPE.md for structure)

$ ls -la .github/
  workflows/  (44 files)
  agents/, copilot-agents/, instructions/, skills/

$ ls -la .github/workflows/
44 workflow YAML files + archive/ subdirectory

$ ls -la src-tauri/
  src/ (144 subdirs, ~940 RS files)
  capabilities/ (6 JSON files)
  Cargo.toml (v27.2.0)
  tauri.conf.json (v27.2.0)

$ ls -la src/
  45 dirs/files (TS/TSX, 1521 files total)

$ ls -la docs/
  71 dirs/files (179MB total, heavy LFS)

$ ls -la registry/
  7 JSONL files (ui-events, repo-events, chat-events, etc.)
```

## Prérequis Manquants (BLOCKED)

| Prérequis | Statut | Impact |
|-----------|--------|--------|
| pnpm | NOT FOUND | Tests/Lint/Build BLOCKED |
| node_modules | ABSENT | All npm scripts BLOCKED |
| GTK/glib-2.0 | NOT FOUND | cargo check/build BLOCKED |
| cross-env | NOT FOUND | vitest BLOCKED |

**Débloquage requis:**
```bash
npm install -g pnpm@10.28.2
pnpm install --frozen-lockfile
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev
```
