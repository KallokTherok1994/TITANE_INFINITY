# TRACE TAURI

## File modified

- `src-tauri/src/runtime_config.rs`

## Command tracing added

- Command: `get_runtime_config`
- Logs:
	- `CMD:START get_runtime_config`
	- `CMD:END get_runtime_config ok`

## Rationale

- `get_runtime_config` is invoked early during frontend bootstrap.
- Tracing this command narrows boot-block diagnosis without broad backend refactor.
- No new capability/allowlist introduced.

