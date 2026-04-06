# GitGuardian Report

## Sources

- `gh run list --workflow gitguardian.yml --branch MAIN --limit 10`
- `gh run view 22727731866 --log-failed`

## Observation

- Des runs `gitguardian.yml` sur `MAIN` affichent un mix `completed/success` et `completed/failure`.
- Echec inspecte (`run id 22727731866`) :

`The job was not acquired by Runner of type hosted even after multiple attempts.`

## Conclusion

- Echec infra CI (runner acquisition), pas une preuve d'un defaut code de cette branche.
- Gate securite distante non pleinement verte tant que rerun runner-hosted n'est pas execute et passe.

## Next actions

1. Re-run GitGuardian workflow sur HEAD de branche.
2. Verifier statut `completed/success` post-rerun.
3. Archiver capture `gh run view <id> --log-failed|--log` dans ce proof pack.

## Update 2026-03-05T18:07Z

Rerun execute sur SHA exact `4b93afb738316284ac529243fa23b799c2b2734d`:

- Workflow: `GitGuardian Secret Scanning`
- Run ID: `22729896781`
- URL: `https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22729896781`
- Final status: `completed`
- Final conclusion: `success`

Summary: gate GitGuardian externe est maintenant vert sur le SHA cible.
