]633;E;{   echo "# Allowlist & Capabilities Report"\x3b   echo "- Timestamp: $TS"\x3b   echo\x3b   echo "## tauri config"\x3b   rg -n "allowlist|capabilit|permissions|security|assetProtocol|scope" src-tauri/tauri.conf.json src-tauri/capabilities -g '*' || true\x3b   echo\x3b   echo "## capabilities files"\x3b   find src-tauri/capabilities -maxdepth 2 -type f 2>/dev/null | sort || true\x3b } > "$PACK_DIR/12_ALLOWLIST_REPORT.md";cc455d23-0fc9-4f23-a51c-01fe271b1ec1]633;C# Allowlist & Capabilities Report
- Timestamp: 2026-03-03T21:44:01-05:00

## tauri config
src-tauri/tauri.conf.json:65:    "security": {
src-tauri/tauri.conf.json:67:      "assetProtocol": {
src-tauri/tauri.conf.json:69:        "scope": [
src-tauri/tauri.conf.json:76:      "capabilities": [
src-tauri/tauri.conf.json:78:          "identifier": "main-capability",
src-tauri/tauri.conf.json:81:          "permissions": [
src-tauri/tauri.conf.json:257:            { "command": "set_security_config" },
src-tauri/tauri.conf.json:420:            { "command": "qa_run_security_audit" },
src-tauri/tauri.conf.json:915:            { "command": "cp_get_security_config" },
src-tauri/tauri.conf.json:916:            { "command": "cp_set_security_config" },
src-tauri/tauri.conf.json:1053:          "identifier": "avatar-floating-capability",
src-tauri/tauri.conf.json:1056:          "permissions": [
src-tauri/tauri.conf.json:1084:      "scope": [
src-tauri/tauri.conf.json:1091:      "scope": []
src-tauri/capabilities/self_heal.json:2:  "$schema": "https://schema.tauri.app/config/2.0/capability.json",
src-tauri/capabilities/self_heal.json:6:  "permissions": ["core:default"],
src-tauri/capabilities/singularity.json:2:  "$schema": "https://schema.tauri.app/config/2.0/capability.json",
src-tauri/capabilities/singularity.json:6:  "permissions": ["core:default"],
src-tauri/capabilities/persistence.json:2:  "$schema": "https://schema.tauri.app/config/2.0/capability.json",
src-tauri/capabilities/persistence.json:6:  "permissions": ["core:default"],
src-tauri/capabilities/chat_ai.json:2:  "$schema": "https://schema.tauri.app/config/2.0/capability.json",
src-tauri/capabilities/chat_ai.json:6:  "permissions": ["core:default"],
src-tauri/capabilities/developer_mode.json:2:  "$schema": "https://schema.tauri.app/config/2.0/capability.json",
src-tauri/capabilities/developer_mode.json:6:  "permissions": ["core:default"],
src-tauri/capabilities/secrets.json:2:  "$schema": "https://schema.tauri.app/config/2.0/capability.json",
src-tauri/capabilities/secrets.json:6:  "permissions": ["core:default"],
src-tauri/capabilities/audio_tts.json:2:  "$schema": "https://schema.tauri.app/config/2.0/capability.json",
src-tauri/capabilities/audio_tts.json:6:  "permissions": ["core:default"],

## capabilities files
src-tauri/capabilities/audio_tts.json
src-tauri/capabilities/chat_ai.json
src-tauri/capabilities/developer_mode.json
src-tauri/capabilities/persistence.json
src-tauri/capabilities/secrets.json
src-tauri/capabilities/self_heal.json
src-tauri/capabilities/singularity.json
