#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

MODE="update"
if [[ "${1:-}" == "--check" ]]; then
  MODE="check"
fi

SOURCE_DIR="docs/diagrams/sources"
REGISTRY_PATH="docs/diagrams/MERMAID_HASH_REGISTRY.json"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "FAIL: missing Mermaid sources directory: $SOURCE_DIR"
  exit 1
fi

shopt -s nullglob
sources=("$SOURCE_DIR"/*.mmd)
shopt -u nullglob

if [[ ${#sources[@]} -eq 0 ]]; then
  echo "FAIL: no Mermaid sources found"
  exit 1
fi

python3 - "$REGISTRY_PATH" "$MODE" "${sources[@]}" <<'PY'
import hashlib
import json
import os
import sys
import time

registry_path = sys.argv[1]
mode = sys.argv[2]
source_files = sys.argv[3:]

source_files = sorted(source_files)


def normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in text.split("\n")]
    return "\n".join(lines)


def file_sha256(path: str) -> str:
    with open(path, "rb") as handle:
        raw = handle.read()
    text = raw.decode("utf-8", errors="replace")
    normalized = normalize_text(text).encode("utf-8")
    return hashlib.sha256(normalized).hexdigest()


def load_registry(path: str):
    if not os.path.exists(path):
        return {"version": 1, "files": {}}
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    if "files" in data:
        return data
    # Migrate legacy entries list to files/history
    files = {}
    for entry in data.get("entries", []):
        if not isinstance(entry, dict):
            continue
        file_name = entry.get("file")
        digest = entry.get("sha256")
        timestamp = entry.get("timestamp")
        if not file_name or not digest:
            continue
        history = files.setdefault(file_name, {"history": []})["history"]
        history.append({"timestamp": timestamp or "unknown", "sha256": digest})
    return {"version": 1, "files": files}


def latest_hash(history):
    if not history:
        return None
    return history[-1].get("sha256")


registry = load_registry(registry_path)
files_block = registry.setdefault("files", {})

known_files = set(files_block.keys())
current_files = set(source_files)
missing_files = sorted(known_files - current_files)
if missing_files:
    print("FAIL: registry references missing files: " + ", ".join(missing_files))
    sys.exit(2)

now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
changes = False

for path in source_files:
    digest = file_sha256(path)
    record = files_block.setdefault(path, {"history": []})
    history = record.setdefault("history", [])
    if latest_hash(history) != digest:
        history.append({"timestamp": now, "sha256": digest})
        changes = True

# Deterministic ordering
registry = {"version": 1, "files": {}}
for path in sorted(files_block.keys()):
    history = files_block[path].get("history", [])
    registry["files"][path] = {"history": history}

output = json.dumps(registry, indent=2, sort_keys=True) + "\n"

if mode == "check":
    if not os.path.exists(registry_path):
        print("FAIL: registry missing")
        sys.exit(2)
    with open(registry_path, "r", encoding="utf-8") as handle:
        existing = handle.read()
    if existing != output:
        print("FAIL: registry not deterministic or out of date")
        sys.exit(2)
    print("HASH_REGISTRY_OK")
    sys.exit(0)

with open(registry_path, "w", encoding="utf-8") as handle:
    handle.write(output)

if changes:
    print("HASH_REGISTRY_UPDATED")
else:
    print("HASH_REGISTRY_OK")
PY
