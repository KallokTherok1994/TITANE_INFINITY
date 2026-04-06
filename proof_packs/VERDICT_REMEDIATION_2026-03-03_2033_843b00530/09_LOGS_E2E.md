[E2E_TAURI] start 2026-03-03T20:34:44-05:00
[E2E_TAURI] runs=3
[E2E_TAURI] pack_dir=proof_packs/VERDICT_REMEDIATION_2026-03-03_2033_843b00530
[E2E_TAURI] max_timeout_seconds=1800
[E2E_TAURI] run=1 begin 2026-03-03T20:34:44-05:00

> titane-infinity@27.2.0 e2e:desktop /home/titane-os/Documents/GitHub/TITANE_INFINITY
> pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && pnpm run e2e:desktop:ensure && pnpm run e2e:desktop:run


> titane-infinity@27.2.0 guard:ollama-proxy /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/guard/guard-ollama-proxy.sh

🔐 GUARD: Checking for direct Ollama calls (11434) in src/
✅ PASS: No direct 11434 calls in frontend
✅ E2E build authorized

> titane-infinity@27.2.0 e2e:desktop:ensure /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/e2e/ensure-webkit-webdriver.sh

🔍 Vérification de WebKitWebDriver...
✅ WebKitWebDriver trouvé dans le PATH : /usr/bin/WebKitWebDriver
DEBUG: WEBKIT_WEBDRIVER_PATH=/usr/bin/WebKitWebDriver

> titane-infinity@27.2.0 e2e:desktop:run /home/titane-os/Documents/GitHub/TITANE_INFINITY
> node scripts/e2e/run-desktop-suite.js

2026-03-04T01:34:45.100Z Artifacts dir: /home/titane-os/Documents/GitHub/TITANE_INFINITY/reports/e2e-desktop
2026-03-04T01:34:45.100Z WDIO config: /home/titane-os/Documents/GitHub/TITANE_INFINITY/wdio.desktop.conf.cjs
2026-03-04T01:34:45.101Z TAURI_BINARY_PATH: <unset>
2026-03-04T01:34:45.101Z tauri-driver args: tauri-driver --port 4444 --native-port 4445 --native-host 127.0.0.1 --native-driver /usr/bin/WebKitWebDriver
2026-03-04T01:34:45.105Z wdio command: pnpm exec wdio run /home/titane-os/Documents/GitHub/TITANE_INFINITY/wdio.desktop.conf.cjs
[E2E_TAURI] run=1 PASS
[E2E_TAURI] run=2 begin 2026-03-03T20:35:29-05:00

> titane-infinity@27.2.0 e2e:desktop /home/titane-os/Documents/GitHub/TITANE_INFINITY
> pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && pnpm run e2e:desktop:ensure && pnpm run e2e:desktop:run


> titane-infinity@27.2.0 guard:ollama-proxy /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/guard/guard-ollama-proxy.sh

🔐 GUARD: Checking for direct Ollama calls (11434) in src/
✅ PASS: No direct 11434 calls in frontend
✅ E2E build authorized

> titane-infinity@27.2.0 e2e:desktop:ensure /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/e2e/ensure-webkit-webdriver.sh

🔍 Vérification de WebKitWebDriver...
✅ WebKitWebDriver trouvé dans le PATH : /usr/bin/WebKitWebDriver
DEBUG: WEBKIT_WEBDRIVER_PATH=/usr/bin/WebKitWebDriver

> titane-infinity@27.2.0 e2e:desktop:run /home/titane-os/Documents/GitHub/TITANE_INFINITY
> node scripts/e2e/run-desktop-suite.js

2026-03-04T01:35:30.293Z Artifacts dir: /home/titane-os/Documents/GitHub/TITANE_INFINITY/reports/e2e-desktop
2026-03-04T01:35:30.294Z WDIO config: /home/titane-os/Documents/GitHub/TITANE_INFINITY/wdio.desktop.conf.cjs
2026-03-04T01:35:30.294Z TAURI_BINARY_PATH: <unset>
2026-03-04T01:35:30.294Z tauri-driver args: tauri-driver --port 4444 --native-port 4445 --native-host 127.0.0.1 --native-driver /usr/bin/WebKitWebDriver
2026-03-04T01:35:30.298Z wdio command: pnpm exec wdio run /home/titane-os/Documents/GitHub/TITANE_INFINITY/wdio.desktop.conf.cjs
[E2E_TAURI] run=2 PASS
[E2E_TAURI] run=3 begin 2026-03-03T20:36:15-05:00

> titane-infinity@27.2.0 e2e:desktop /home/titane-os/Documents/GitHub/TITANE_INFINITY
> pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && pnpm run e2e:desktop:ensure && pnpm run e2e:desktop:run


> titane-infinity@27.2.0 guard:ollama-proxy /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/guard/guard-ollama-proxy.sh

🔐 GUARD: Checking for direct Ollama calls (11434) in src/
✅ PASS: No direct 11434 calls in frontend
✅ E2E build authorized

> titane-infinity@27.2.0 e2e:desktop:ensure /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/e2e/ensure-webkit-webdriver.sh

🔍 Vérification de WebKitWebDriver...
✅ WebKitWebDriver trouvé dans le PATH : /usr/bin/WebKitWebDriver
DEBUG: WEBKIT_WEBDRIVER_PATH=/usr/bin/WebKitWebDriver

> titane-infinity@27.2.0 e2e:desktop:run /home/titane-os/Documents/GitHub/TITANE_INFINITY
> node scripts/e2e/run-desktop-suite.js

2026-03-04T01:36:16.120Z Artifacts dir: /home/titane-os/Documents/GitHub/TITANE_INFINITY/reports/e2e-desktop
2026-03-04T01:36:16.121Z WDIO config: /home/titane-os/Documents/GitHub/TITANE_INFINITY/wdio.desktop.conf.cjs
2026-03-04T01:36:16.121Z TAURI_BINARY_PATH: <unset>
2026-03-04T01:36:16.121Z tauri-driver args: tauri-driver --port 4444 --native-port 4445 --native-host 127.0.0.1 --native-driver /usr/bin/WebKitWebDriver
2026-03-04T01:36:16.128Z wdio command: pnpm exec wdio run /home/titane-os/Documents/GitHub/TITANE_INFINITY/wdio.desktop.conf.cjs
[E2E_TAURI] run=3 PASS
PASS_E2E_RUNTIME


STATUS_FILE=
PASS_E2E_RUNTIME
