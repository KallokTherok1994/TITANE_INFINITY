# États & flows globaux

## Flow de boot
1. HTML loaded
2. JS loaded
3. React mounted
4. IPC ready
5. Providers check
6. Memory init
7. Ready

## Flow de page dashboard
- loading → ready → degraded → error

## Flow Chat
- user_send → pending → assistant_ok | assistant_error

Voir : `architecture/OBSERVABILITY.md` + `architecture/CONTRACTS_UI_BACKEND.md`.
