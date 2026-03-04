#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

check_artifact_guard() {
	local candidate="$1"

	if [[ "${TITANE_SKIP_ARTIFACT_GUARD:-0}" == "1" ]]; then
		return 0
	fi

	if [[ "$candidate" != *.AppImage ]]; then
		return 0
	fi

	local tmp_dir
	tmp_dir="$(mktemp -d)"

	set +e
	(
		cd "$tmp_dir" || exit 2
		"$candidate" --appimage-extract >/dev/null 2>&1 || exit 0

		local index_file
		index_file="$(find "$tmp_dir/squashfs-root" -type f -path '*/dist/index.html' | head -n 1)"
		if [[ -z "$index_file" ]]; then
			exit 0
		fi

		grep -q "BOOT_HTML_GUARD" "$index_file" || exit 42
		grep -q "sendErrorToBackend" "$index_file" || exit 42
	)
	local guard_exit=$?
	set -e

	rm -rf "$tmp_dir"

	if [[ $guard_exit -eq 42 ]]; then
		return 1
	fi

	return 0
}

declare -a candidates=(
	"$ROOT_DIR/runtime/stable/Titan-Stable_27.0.5_amd64.AppImage"
	"$ROOT_DIR/runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage"
	"$ROOT_DIR/distribution/v27.2.0/appimage/TITANE-Infinity_27.2.0_amd64.AppImage"
	"$ROOT_DIR/deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage"
	"$ROOT_DIR/deployment/latest/titane-infinity"
	"$HOME/.local/share/titane-infinity/titane-infinity.AppImage"
	"$HOME/.local/bin/titane-infinity"
)

while IFS= read -r app; do
	candidates+=("$app")
done < <(find "$ROOT_DIR/runtime/stable" -maxdepth 1 -type f -name '*.AppImage' 2>/dev/null | sort -r)

declare -A seen=()

for candidate in "${candidates[@]}"; do
	if [[ -n "${seen[$candidate]:-}" ]]; then
		continue
	fi
	seen[$candidate]=1

	if [[ ! -f "$candidate" ]]; then
		continue
	fi

	chmod +x "$candidate" 2>/dev/null || true

	if ! check_artifact_guard "$candidate"; then
		echo "[launch-titane] artifact guard rejected: $candidate" >&2
		continue
	fi

	echo "[launch-titane] launching: $candidate"
	exec "$candidate" "$@"
done

echo "[launch-titane] no compatible TITANE artifact found." >&2
echo "[launch-titane] set TITANE_SKIP_ARTIFACT_GUARD=1 to bypass guard temporarily." >&2
exit 1
