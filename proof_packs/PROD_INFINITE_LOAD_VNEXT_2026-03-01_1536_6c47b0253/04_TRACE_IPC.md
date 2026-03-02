# TRACE IPC

## File modified

- `src/lib/security.ts`

## Canonical wrapper instrumented

- Wrapper: `secureInvoke<T>(command, payload, options, validator)`
- Added per-call trace ID: `<timestamp>-<random>`
- Logs:
	- `IPC:START <cmd> <id>`
	- `IPC:END <cmd> <id> ok|error`

## Timeout categorization

- `normalizeInvokeError()` now maps timeout signatures to:
	- `name = IPC_TIMEOUT`
	- `message = IPC timeout for <command>`
- This keeps cause explicit and avoids misleading provider-down messages.

## Timeout bound

- Wrapper remains bounded by configured timeout (`SecureInvokeOptions.timeout`).
- Default global bound remains present (project baseline), with command-level override supported.

