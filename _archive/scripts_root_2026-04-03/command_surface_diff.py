#!/usr/bin/env python3
"""Command-surface diff helper.

Computes diffs between:
- Frontend: secureInvoke('command') literals under src/
- Backend: tauri::generate_handler![ ... ] registered commands (src-tauri/src/main.rs)
- Backend allowlist: commands/security.rs commands.insert("...")
- Frontend allowlist: src/lib/security.ts string literals

Outputs summary counts and top missing families.

This script is a dev helper and is not used by runtime.
"""

from __future__ import annotations

import argparse
import pathlib
import re
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]

FRONTEND_SECURE_INVOKE_RE = re.compile(r"secureInvoke\(\s*['\"]([^'\"]+)['\"]")
RUST_ALLOWLIST_RE = re.compile(r"commands\.insert\(\"([^\"]+)\"\)")
TS_STRING_RE = re.compile(r"'([^']+)'\s*,?")


def _strip_comments(text: str) -> str:
    # Remove /* */ and // comments
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"//.*$", "", text, flags=re.M)
    return text


def read_text(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def family(cmd: str) -> str:
    return cmd.split("_", 1)[0] if "_" in cmd else cmd


def _apply_prefix_filter(cmds: set[str], prefixes: list[str] | None) -> set[str]:
    if not prefixes:
        return cmds
    filtered: set[str] = set()
    for cmd in cmds:
        if any(cmd.startswith(p) for p in prefixes):
            filtered.add(cmd)
    return filtered


def extract_frontend_commands(root: pathlib.Path) -> set[str]:
    cmds: set[str] = set()
    for p in (root / "src").rglob("*"):
        if not p.is_file():
            continue
        if p.suffix not in {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}:
            continue
        text = read_text(p)
        for m in FRONTEND_SECURE_INVOKE_RE.finditer(text):
            cmds.add(m.group(1))
    return cmds


def extract_handler_command_names(root: pathlib.Path) -> set[str]:
    main_rs = root / "src-tauri" / "src" / "main.rs"
    text = read_text(main_rs)

    # There can be multiple invoke_handler(...) blocks; capture all generate_handler![ ... ]
    names: set[str] = set()
    for m in re.finditer(r"generate_handler!\[(.*?)\]", text, flags=re.S):
        block = _strip_comments(m.group(1))
        identifiers = re.findall(r"([A-Za-z0-9_:]+)\s*,", block)
        for ident in identifiers:
            names.add(ident.split("::")[-1])
    return names


def extract_rust_allowlist(root: pathlib.Path) -> set[str]:
    sec_rs = root / "src-tauri" / "src" / "commands" / "security.rs"
    text = read_text(sec_rs)
    return set(RUST_ALLOWLIST_RE.findall(text))


def extract_ts_allowlist_literals(root: pathlib.Path) -> set[str]:
    ts = root / "src" / "lib" / "security.ts"
    text = _strip_comments(read_text(ts))
    return set(TS_STRING_RE.findall(text))


def top_families(cmds: set[str], n: int = 12) -> str:
    c = Counter(family(x) for x in cmds)
    return " ".join(f"{k}:{v}" for k, v in c.most_common(n))


def main() -> None:
    parser = argparse.ArgumentParser(description="Diff frontend/backend Tauri command surface")
    parser.add_argument(
        "--prefix",
        action="append",
        default=None,
        help="Only include commands with this prefix (repeatable)",
    )
    parser.add_argument(
        "--max",
        type=int,
        default=50,
        help="Max number of missing commands to print",
    )
    args = parser.parse_args()

    frontend = _apply_prefix_filter(extract_frontend_commands(ROOT), args.prefix)
    handler = _apply_prefix_filter(extract_handler_command_names(ROOT), args.prefix)
    allow_rust = _apply_prefix_filter(extract_rust_allowlist(ROOT), args.prefix)
    allow_ts = _apply_prefix_filter(extract_ts_allowlist_literals(ROOT), args.prefix)

    missing_handler = frontend - handler
    missing_rust = frontend - allow_rust
    missing_ts = frontend - allow_ts

    print(f"frontend_literals: {len(frontend)}")
    print(f"handler_names: {len(handler)}")
    print(f"allowlist_rust: {len(allow_rust)}")
    print(f"allowlist_ts_literals: {len(allow_ts)}")
    print("---")
    print(f"missing_handler: {len(missing_handler)} top={top_families(missing_handler)}")
    print(f"missing_rust_allow: {len(missing_rust)} top={top_families(missing_rust)}")
    print(f"missing_ts_allow: {len(missing_ts)} top={top_families(missing_ts)}")
    print(f"--- top missing in handler ({args.max}) ---")
    for cmd in sorted(missing_handler)[: args.max]:
        print(cmd)


if __name__ == "__main__":
    main()
