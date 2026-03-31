# 01 BOOTSTRAP

## Commands run
- git status
- git rev-parse --abbrev-ref HEAD
- git rev-parse --short HEAD
- git log -5 --oneline
- git fetch origin --prune
- git status
- git rev-list --left-right --count origin/MAIN...MAIN
- git ls-remote --heads origin MAIN
- git branch -r --contains df479d5a8
- git branch -r --contains bfc83341c
- git log --oneline -5 origin/MAIN

## Truth
- branch: MAIN
- head: bfc83341c
- ahead/behind: 0 0
- remote head MAIN: bfc83341c
- working tree: clean during bootstrap
- both commits are present in origin/MAIN history

## Proof source
- /tmp/release_warning_git_bootstrap.txt
