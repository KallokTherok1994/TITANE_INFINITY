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

import pathlib
import re
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]

FRONTEND_SECURE_INVOKE_RE = re.compile(r"secureInvoke\(\s*['\"]([^'\"]+)['\"]")
RUST_ALLOWLIST_RE = re.compile(r"commands\.insert\(\"([^\"]+)\"\)")
TS_STRING_RE = re.compile(r"'([^']+)'\s*,?")


def read_text(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def family(cmd: str) -> str:
    return cmd.split("_", 1)[0] if "_" in cmd else cmd


def extract_frontend_commands() -> set[str]:
    cmds: set[str] = set()
    for p in (ROOT / "src").rglob("*"):
        if not p.is_file():
            continue
        if p.suffix not in {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}:
            continue
        text = read_text(p)
        for m in FRONTEND_SECURE_INVOKE_RE.finditer(text):
            cmds.add(m.group(1))
    return cmds


def extract_handler_command_names() -> set[str]:
    main_rs = ROOT / "src-tauri" / "src" / "main.rs"
    text = read_text(main_rs)

    # Capture generate_handler![ ... ] inside invoke_handler(...)
    m = re.search(r"generate_handler!\[(.*?)\]\)", text, flags=re.S)
    if not m:
        return set()

    block = m.group(1)
    # Remove /* */ and // comments
    block = re.sub(r"/\*.*?\*/", "", block, flags=re.S)
    block = re.sub(r"//.*$", "", block, flags=re.M)

    identifiers = re.findall(r"([A-Za-z0-9_:]+)\s*,", block)
    return {ident.split("::")[-1] for ident in identifiers}


def extract_rust_allowlist() -> set[str]:
    sec_rs = ROOT / "src-tauri" / "src" / "commands" / "security.rs"
    text = read_text(sec_rs)
    return set(RUST_ALLOWLIST_RE.findall(text))


def extract_ts_allowlist_literals() -> set[str]:
    ts = ROOT / "src" / "lib" / "security.ts"
    text = read_text(ts)
    return set(TS_STRING_RE.findall(text))


def top_families(cmds: set[str], n: int = 12) -> str:
    c = Counter(family(x) for x in cmds)
    return " ".join(f"{k}:{v}" for k, v in c.most_common(n))


def main() -> None:
    frontend = extract_frontend_commands()
    handler = extract_handler_command_names()
    allow_rust = extract_rust_allowlist()
    allow_ts = extract_ts_allowlist_literals()

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
    print("--- top missing in handler (50) ---")
    for cmd in sorted(missing_handler)[:50]:
        print(cmd)


if __name__ == "__main__":
    main()
