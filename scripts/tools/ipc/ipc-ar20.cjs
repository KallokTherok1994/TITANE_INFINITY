#!/usr/bin/env node
/**
 * P3-6 AR20 - Strict no-server gate
 * Uses existing Tauri IPC smoke runner; fails explicitly if missing.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");

const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage: ipc-ar20.cjs <outDir>");
  process.exit(2);
}

const runner = "scripts/smoke/dev-tauri-ipc-conversation-generate.sh";
if (!fs.existsSync(runner)) {
  console.error(`Missing runner: ${runner}`);
  process.exit(3);
}

function runOne(i) {
  const prompt = `AR20 message ${i}/20 :: deterministic test`;
  const env = { ...process.env, PROMPT: prompt, OFFLINE_SIM: "0" };
  const res = spawnSync("bash", [runner], { env, encoding: "utf8" });
  return { i, code: res.status ?? 999, stdout: res.stdout, stderr: res.stderr };
}

const jsonlPath = `${outDir}/30_ar20_raw.jsonl`;
const sumPath = `${outDir}/31_ar20_summary.md`;

let pass = 0;
for (let i = 1; i <= 20; i++) {
  const r = runOne(i);
  fs.appendFileSync(jsonlPath, JSON.stringify(r) + "\n");
  if (r.code === 0) pass++;
}

const verdict = pass === 20 ? "PASS" : "FAIL";
fs.writeFileSync(
  sumPath,
  [
    "# AR20 IPC - Summary",
    `- pass: ${pass}/20`,
    `- verdict: ${verdict}`,
    `- raw: ${jsonlPath}`,
    "",
  ].join("\n")
);

process.exit(verdict === "PASS" ? 0 : 1);
