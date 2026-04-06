#!/bin/bash
pnpm install -D @playwright/test playwright
if command -v corepack >/dev/null 2>&1; then
	corepack pnpm exec playwright install
elif command -v pnpm >/dev/null 2>&1; then
	pnpm exec playwright install
else
	echo "❌ pnpm requis (corepack/pnpm introuvable)." >&2
	exit 1
fi
