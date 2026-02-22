#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
SOURCE_DIR="$ROOT_DIR/docs/diagrams/sources"
RENDER_DIR="$ROOT_DIR/docs/diagrams/rendered"
STANDARDS_REL="../../standards/MERMAID_STANDARDS.md"
INDEX_REL="../CANON_INDEX.md"

mkdir -p "$RENDER_DIR"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "FAIL: missing source directory: $SOURCE_DIR"
  exit 1
fi

shopt -s nullglob
sources=("$SOURCE_DIR"/*.mmd)
shopt -u nullglob

if [[ ${#sources[@]} -eq 0 ]]; then
  echo "FAIL: no Mermaid sources found in $SOURCE_DIR"
  exit 1
fi

for source_file in "${sources[@]}"; do
  if [[ ! -s "$source_file" ]] || ! grep -q "[^[:space:]]" "$source_file"; then
    echo "FAIL: empty Mermaid source: $source_file"
    exit 1
  fi

  base_name=$(basename "$source_file" .mmd)
  render_file="$RENDER_DIR/$base_name.md"
  title=$(echo "$base_name" | tr '_' ' ' | sed -E 's/(^|[[:space:]])([[:alpha:]])/\1\U\2/g')

  {
    echo "# $title"
    echo
    echo "Diagramme canon généré automatiquement depuis la source Mermaid."
    echo "Il sert à documenter les invariants validés sans impact runtime."
    echo "La source reste l'unique vérité et ce rendu doit rester synchronisé."
    echo "En cas d'écart, exécuter render sync puis verify Mermaid."
    echo "Le contenu du bloc Mermaid ci-dessous reprend exactement la source .mmd."
    echo
    echo "- Standards: [$STANDARDS_REL]($STANDARDS_REL)"
    echo "- Index canon: [$INDEX_REL]($INDEX_REL)"
    echo
    echo '```mermaid'
    cat "$source_file"
    echo '```'
  } > "$render_file"

  echo "SYNC: $(realpath --relative-to="$ROOT_DIR" "$source_file") -> $(realpath --relative-to="$ROOT_DIR" "$render_file")"
done

echo "PASS: mermaid-render-sync"
