# 07_NO_SKIPS_GATE
- Timestamp UTC: 2026-03-04T23:39:00Z

## Vérification
- Source: `05_E2E_RUNS_X3.log`
- `smoke_ui`: run=1 échoue (`exit=1`) avant run2/run3
- `full_ui`: non exécuté (bloqué en amont)

## Verdict gate
- `G_NO_SKIPS_REQUIRED_FLOWS`: **FAIL**
- Motif: séquence requise x3 incomplète (smoke interrompu au premier échec, full non lancé)

## Stop-the-line
- Activé: oui
- Condition déclenchée: gate obligatoire E2E non PASS
