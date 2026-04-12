#!/usr/bin/env bash
# Portable rg (ripgrep) compatibility shim for CI environments.
# Source this file in verify scripts that use rg.
# If rg is not installed, falls back to grep -rn.
#
# Usage:
#   source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"
#   _rg "pattern" file_or_dir ...

if command -v rg >/dev/null 2>&1; then
  _rg() { rg "$@"; }
else
  _rg() {
    # rg uses Rust/PCRE-style regex; grep -P (Perl) is the closest match.
    # Fallback to -E (ERE) if -P is unavailable.
    local grep_flags=("-r" "-n")
    if grep -P "" /dev/null 2>/dev/null; then
      grep_flags+=("-P")
    else
      grep_flags+=("-E")
    fi
    local pattern=""
    local targets=()
    local skip_next=false

    for arg in "$@"; do
      if $skip_next; then skip_next=false; continue; fi
      case "$arg" in
        -n) ;; # grep -n already included
        -S) ;; # rg smart-case; grep does not support, skip
        -i) grep_flags+=("-i") ;;
        -l) grep_flags+=("-l") ;;
        -c) grep_flags+=("-c") ;;
        --) ;; # separator, skip
        -*) ;; # skip other rg-only flags
        *)
          if [[ -z "$pattern" ]]; then
            pattern="$arg"
          else
            targets+=("$arg")
          fi
          ;;
      esac
    done

    if [[ -z "$pattern" ]]; then
      return 1
    fi

    if [[ ${#targets[@]} -eq 0 ]]; then
      targets=(".")
    fi

    grep "${grep_flags[@]}" -- "$pattern" "${targets[@]}" 2>/dev/null
  }
fi
