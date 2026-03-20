#!/usr/bin/env bash
# TITANE∞ — Promotion Gate v1
# Usage: bash scripts/evals/promote_or_block.sh <challenger-scorecard.json>
#
# Compares challenger scorecard against champion_baseline.json.
# For every BLOCKING metric: challenger_score < champion_score → PROMOTION_BLOCKED
#
# Exits: 0 = PASS (non-regressive, challenger may be promoted)
#        1 = PROMOTION_BLOCKED (regression on ≥1 blocking metric)
#        2 = BLOCKED (infrastructure error — missing files, bad JSON)

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

CHALLENGER_JSON="${1:-}"
CHAMPION_BASELINE="${CHAMPION_BASELINE:-evals/baselines/v1/champion_baseline.json}"

if [[ -z "$CHALLENGER_JSON" ]]; then
  echo "USAGE: bash scripts/evals/promote_or_block.sh <challenger-scorecard.json>"
  exit 2
fi

if [[ ! -f "$CHALLENGER_JSON" ]]; then
  echo "FAIL: challenger scorecard not found: $CHALLENGER_JSON"
  exit 2
fi

if [[ ! -f "$CHAMPION_BASELINE" ]]; then
  echo "FAIL: champion baseline not found: $CHAMPION_BASELINE"
  exit 2
fi

echo "═══════════════════════════════════════════════════════"
echo " TITANE∞ PROMOTION GATE"
echo " Champion:   $CHAMPION_BASELINE"
echo " Challenger: $CHALLENGER_JSON"
echo "═══════════════════════════════════════════════════════"

python3 - "$CHALLENGER_JSON" "$CHAMPION_BASELINE" <<'PYEOF'
import sys, json

chall_file   = sys.argv[1]
champ_file   = sys.argv[2]

with open(chall_file) as f:
    challenger = json.load(f)

with open(champ_file) as f:
    champion = json.load(f)

champ_scores = champion.get("scorecard_baselines", {})
chall_scores = challenger.get("scores", {})

REGRESSIONS  = []
IMPROVEMENTS = []
UNCHANGED    = []
WARNINGS     = []

SCORECARD_LABEL_MAP = {
    "RESPONSE_QUALITY_SCORECARD":   "Response Quality",
    "MEMORY_TRUTH_SCORECARD":       "Memory Truth",
    "ROUTER_TRUTH_SCORECARD":       "Router Truth",
    "HONESTY_SCORECARD":            "Honesty",
    "AUTOHEAL_TRUTH_SCORECARD":     "AutoHeal Truth",
    "DESKTOP_CRITICAL_FLOW_SCORECARD": "Desktop Critical Flow",
}

print("")
print("── Per-scorecard comparison ──")

for sc_id, label in SCORECARD_LABEL_MAP.items():
    champ_sc = champ_scores.get(sc_id, {})
    chall_sc = chall_scores.get(sc_id, {})
    blocking_keys = chall_sc.get("_blocking", [])

    print(f"\n  {label} ({sc_id})")

    for metric, champ_val in champ_sc.items():
        if metric == "overall":
            continue
        if metric not in chall_sc:
            WARNINGS.append(f"{sc_id}.{metric}: missing in challenger (skipped)")
            print(f"    WARN  {metric}: missing in challenger scorecard")
            continue

        chall_val = chall_sc[metric]
        is_blocking = metric in blocking_keys

        # Normalise to float
        try:
            c_champ = float(champ_val) if champ_val not in (None, "PASS", "FAIL") else (1.0 if champ_val == "PASS" else 0.0)
            c_chall = float(chall_val)
        except (TypeError, ValueError):
            WARNINGS.append(f"{sc_id}.{metric}: non-numeric values (champ={champ_val}, chall={chall_val})")
            print(f"    SKIP  {metric}: non-numeric (champ={champ_val}, chall={chall_val})")
            continue

        delta = c_chall - c_champ
        blocking_tag = " [BLOCKING]" if is_blocking else ""

        if c_chall < c_champ:
            tag = "REGRESS" if is_blocking else "WARN   "
            print(f"    {tag}{blocking_tag} {metric}: {c_champ:.1f} → {c_chall:.1f} Δ={delta:+.1f}")
            if is_blocking:
                REGRESSIONS.append(f"{sc_id}.{metric}: {c_champ:.1f} → {c_chall:.1f}")
            else:
                WARNINGS.append(f"{sc_id}.{metric}: non-blocking regression {c_champ:.1f} → {c_chall:.1f}")
        elif c_chall > c_champ:
            print(f"    IMPR   {metric}: {c_champ:.1f} → {c_chall:.1f} Δ={delta:+.1f}")
            IMPROVEMENTS.append(f"{sc_id}.{metric}: {c_champ:.1f} → {c_chall:.1f}")
        else:
            print(f"    SAME   {metric}: {c_champ:.1f} (no change)")
            UNCHANGED.append(f"{sc_id}.{metric}")

# ─── Summary ─────────────────────────────────────────────
print("")
print("═══════════════════════════════════════════════════════")
print(f" Blocking regressions:  {len(REGRESSIONS)}")
print(f" Non-blocking warnings: {len(WARNINGS)}")
print(f" Improvements:          {len(IMPROVEMENTS)}")
print(f" Unchanged:             {len(UNCHANGED)}")
print("═══════════════════════════════════════════════════════")

if REGRESSIONS:
    print("")
    print("BLOCKING REGRESSIONS DETECTED:")
    for r in REGRESSIONS:
        print(f"  ✗ {r}")
    print("")
    print("VERDICT: PROMOTION_BLOCKED")
    print("  No challenger may replace champion while blocking regressions exist.")
    print("  Fix regressions and re-evaluate.")
    sys.exit(1)
elif WARNINGS:
    print("")
    print("NON-BLOCKING WARNINGS (review before promotion):")
    for w in WARNINGS:
        print(f"  ! {w}")
    if IMPROVEMENTS:
        print("")
        print("IMPROVEMENTS:")
        for i in IMPROVEMENTS:
            print(f"  ↑ {i}")
    print("")
    print("VERDICT: PASS")
    print("  No blocking regressions. Challenger is non-regressive.")
    print("  WARNING: non-blocking regressions found — review before promotion.")
    sys.exit(0)
else:
    if IMPROVEMENTS:
        print("")
        print("IMPROVEMENTS:")
        for i in IMPROVEMENTS:
            print(f"  ↑ {i}")
    print("")
    print("VERDICT: PASS")
    if IMPROVEMENTS:
        print("  Challenger is BETTER than champion on all compared metrics.")
        print("  Eligible for promotion after human review.")
    else:
        print("  Challenger is NON-REGRESSIVE (equivalent to champion).")
        print("  CHAMPION_RETAINED unless explicit promotion decision made.")
    sys.exit(0)
PYEOF
