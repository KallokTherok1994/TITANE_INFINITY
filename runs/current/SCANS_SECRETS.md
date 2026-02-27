# SCANS_SECRETS (tuned)
command: rg -n "sk-[A-Za-z0-9]{20,}" -S . --hidden --glob '!.git/**' --glob '!runs/**' --glob '!docs/**' --glob '!src/lib/__tests__/**'
POSTFIX_HITS=0
