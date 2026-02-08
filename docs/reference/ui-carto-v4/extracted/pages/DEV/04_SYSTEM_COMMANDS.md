# DEV — System Commands

## But
Accès direct à des commandes système/maintenance.

## UI observée (boutons)
- Sync All (System)
- Health Check (System)
- Optimize (Maintenance)
- Repair (Maintenance)
- Garbage Collector (Maintenance)
- Backup (Advanced)

## Contrats attendus
- Chaque commande retourne Result + progress.
- GC/Backup : montre taille estimée, durée, emplacement.

## Risques
- Commandes longues → éviter blocage UI (spinner + progress).
- Permissions filesystem en PROD.

