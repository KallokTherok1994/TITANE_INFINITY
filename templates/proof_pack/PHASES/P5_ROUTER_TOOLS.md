# Phase P5 — Router & Tools
<!-- APPEND-ONLY -->

## Objectives

- Verify router is bounded (G7)
- Verify tools policy enforced (G9)
- Verify no raw IPC invoke() outside canonical client (G9)

## Checklist

- [ ] `bash checks/check_G7_ROUTER_BOUNDED.sh` — PASS/WARN
- [ ] `bash checks/check_G9_TOOLS_POLICY_ENFORCED.sh` — PASS/WARN
- [ ] All raw `invoke()` calls audited and either governed or removed
- [ ] No unbounded retry loops in router or tool dispatch

## Evidence

> Paste scan outputs here.

## Violations found

| File | Pattern | Status |
|------|---------|--------|
