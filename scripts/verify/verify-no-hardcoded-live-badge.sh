#!/usr/bin/env bash
# scripts/verify/verify-no-hardcoded-live-badge.sh
# Phase 7.F — AH-v99
#
# Anti-régression : interdit `<SurfaceTruthBadge variant="LIVE" ... />` hardcodé
# dans le code de production (src/**), car cela masque les défaillances backend.
# Le badge doit être dérivé d'un état runtime réel (probe IPC / hook live).
#
# Exceptions tolérées :
#   - fichiers tests (__tests__/**)
#   - priority-page-badges (badges de priorité statiques, non runtime)
#   - SurfaceTruthBadge.tsx lui-même (définition source)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# Recherche les occurrences hardcodées de variant="LIVE"
MATCHES=$(grep -rn --include='*.tsx' --include='*.ts' \
  'SurfaceTruthBadge[[:space:]]*variant="LIVE"' src/ 2>/dev/null \
  | grep -v '__tests__' \
  | grep -v 'priority-page-badges' \
  | grep -v 'SurfaceTruthBadge.tsx' \
  || true)

if [ -n "$MATCHES" ]; then
  echo "❌ FAIL — SurfaceTruthBadge variant=\"LIVE\" hardcodé détecté :"
  echo "$MATCHES"
  echo ""
  echo "Règle (AH-v99 Phase 7) : le badge doit être dérivé d'un état runtime réel."
  echo "Remplacer par : variant={probeOk ? 'LIVE' : probeError ? 'DEGRADED' : 'PARTIAL'}"
  exit 1
fi

# Recherche aussi `variant={'LIVE'}` et `variant={\"LIVE\"}` hardcodés
MATCHES2=$(grep -rn --include='*.tsx' --include='*.ts' \
  -E "SurfaceTruthBadge[[:space:]]+variant=\{['\"]LIVE['\"]\}" src/ 2>/dev/null \
  | grep -v '__tests__' \
  | grep -v 'priority-page-badges' \
  | grep -v 'SurfaceTruthBadge.tsx' \
  || true)

if [ -n "$MATCHES2" ]; then
  echo "❌ FAIL — SurfaceTruthBadge variant={'LIVE'} hardcodé détecté :"
  echo "$MATCHES2"
  exit 1
fi

echo "✅ PASS — Aucun SurfaceTruthBadge variant=\"LIVE\" hardcodé en src/ (hors exceptions)"
exit 0
