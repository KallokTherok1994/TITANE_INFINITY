#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# _rg_compat.sh — ripgrep fallback shim for verify scripts
# Sources this file to get an `rg` function that falls back to
# `grep -rn -E` when ripgrep is not installed.
# rg uses Rust regex where \( = literal paren. grep -E matches
# this behavior (in ERE, \( also = literal paren).
# Usage: source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"
# ─────────────────────────────────────────────────────────────────

if command -v rg >/dev/null 2>&1; then
  # rg is available natively — nothing to do
  :
else
  # Provide an rg-compatible shim using grep -E (extended regex)
  rg() {
    local pattern=""
    local paths=()
    local grep_flags=("-r" "-n" "-E")
    local skip_next=false

    for arg in "$@"; do
      if $skip_next; then
        skip_next=false
        continue
      fi
      case "$arg" in
        -n) ;; # already in grep_flags
        # -S in rg = smart-case (case-insensitive only when pattern is all-lowercase).
        # Our shim maps it to grep -i (always case-insensitive) which is slightly broader.
        # This is acceptable: verify scripts only use -S with lowercase patterns.
        -S|-i) grep_flags+=("-i") ;;
        -l) grep_flags+=("-l") ;;
        --) ;;
        -*)
          # Ignore unknown rg flags
          ;;
        *)
          if [[ -z "$pattern" ]]; then
            pattern="$arg"
          else
            paths+=("$arg")
          fi
          ;;
      esac
    done

    if [[ ${#paths[@]} -eq 0 ]]; then
      paths=(".")
    fi

    grep "${grep_flags[@]}" -- "$pattern" "${paths[@]}" 2>/dev/null
  }
  export -f rg
fi
