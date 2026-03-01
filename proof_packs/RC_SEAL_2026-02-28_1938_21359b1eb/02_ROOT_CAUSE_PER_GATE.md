# 02_ROOT_CAUSE_PER_GATE

## Gates hérités (source CLEANUP)

### `G_UI_NO_NETWORK_DIRECT` (initialement FAIL)
- Cause racine: appels réseau frontend directs présents dans des services runtime.
- Fermeture RC: suppression/neutralisation des chemins fetch directs dans les fichiers ciblés (preuve via scans réseau x3 + gate g8).

### `G_ONE_DOOR_NETWORK_BACKEND` (initialement FAIL)
- Cause racine: coexistence de chemins réseau frontend et IPC backend.
- Fermeture RC: routage IPC canonique sur chemins ciblés (`conversation_generate`, `chat_check_providers`, etc.).

### `G_RING_INTEGRITY` (initialement BLOCKED)
- Cause racine: preuve partielle ring-to-ring au pack précédent.
- Fermeture RC: exécution `run_x3` du gate architecture ring (PASS 3/3).

### `G_SELF_AUDIT_CLEAN` (fermé en RC)
- Cause racine initiale: audit drift non robuste (prérequi `used_wrappers` et scan sécurité non scoppé prod).
- Fermeture RC:
	- `git_diff_exit_code=0` (contrôle sur dérive inattendue uniquement).
	- `allowlist_scan=0` via gate gouvernée `g7-tauri-allowlist-lock.sh`.
	- `secret_scan=0` (scan production scope).

## Cause résiduelle bloquante de scellement
- Aucune cause résiduelle bloquante après audit drift v4 (tous checks à `exit=0`).
