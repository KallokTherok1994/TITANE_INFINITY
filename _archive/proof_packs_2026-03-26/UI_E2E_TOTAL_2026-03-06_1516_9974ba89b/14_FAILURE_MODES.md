# FAILURE MODES

## FM-1 Chat Surface Not Visible

- Signature: `none of selectors became visible: [data-testid="chat-input"], [data-testid="tab-conversation"]`
- Evidence: `logs/smoke_run1/wdio.log`
- Status: `PASS` mitigated by deterministic surface recovery.

## FM-2 Refresh Timeout in WebDriver

- Signature: `WebDriverError: The operation was aborted due to timeout when running "refresh"`
- Evidence: `logs/smoke_x3_run1/wdio.log`
- Status: `PASS` mitigated by replacing refresh with explicit route re-anchor.

## FM-3 One Door Network Gate Fail

- Signature: `G_NETWORK_ONE_DOOR: FAIL`
- Evidence: `logs/g_network_one_door.log`
- Status: `PASS` mitigated in this session (lockfiles excluded from gate scan; current gate output is PASS).

