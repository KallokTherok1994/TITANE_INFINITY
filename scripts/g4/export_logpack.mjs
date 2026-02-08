import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const DEFAULT_JSONL = 'runtime/dev/logs/conversations_g4.jsonl';
const DEFAULT_LOGPACK = 'runtime/dev/logs/conversations_g4.logpack.txt';

const REQUIRED_TAGS = new Set([
  'CONV_HOST',
  'CONV_HOOK',
  'CONV_STORAGE',
  'CONV_UI',
  'CONV_SKIP_SETSTATE',
  'CONV_DESYNC',
  'G4_MARK',
  'G4_ERROR',
  'G4_COLLECTOR_ARMED',
  'G4_AUTORUNNER_START',
  'G4_AUTORUNNER_STEP',
  'G4_COMPLETE',
  'G4_MISSING_MARKER',
]);

const STEP_ORDER = [
  'BOOT',
  'TOGGLE#1',
  'TOGGLE#2',
  'TOGGLE#3',
  'TAB_SWITCH',
  'RELOAD',
  'POST_RELOAD_SIDEBAR',
  'POST_RELOAD_CLICKS',
  'ERROR',
];

const safeParse = line => {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
};

const formatLine = entry => {
  if (entry?.line) return entry.line;
  const tag = entry?.tag || 'UNKNOWN';
  const phase = entry?.phase || 'RUNTIME';
  const payload = entry?.payload ? JSON.stringify(entry.payload) : '';
  return `[G4] ${phase} [${tag}] ${payload}`.trim();
};

const summarize = entries => {
  const instanceIds = new Set();
  let lastStorageCount = null;
  let lastUiLen = null;
  let hasDesync = false;
  let hasSkip = false;

  for (const entry of entries) {
    const { instanceId, payload, tag } = entry || {};
    if (instanceId) instanceIds.add(instanceId);
    if (payload?.instanceId) instanceIds.add(payload.instanceId);
    if (typeof payload?.storageCount === 'number') {
      lastStorageCount = payload.storageCount;
    }
    if (typeof payload?.uiLen === 'number') {
      lastUiLen = payload.uiLen;
    }
    if (typeof payload?.len === 'number') {
      lastUiLen = payload.len;
    }
    if (tag === 'CONV_DESYNC') hasDesync = true;
    if (tag === 'CONV_SKIP_SETSTATE') hasSkip = true;
  }

  return {
    instanceIds: Array.from(instanceIds),
    storageCount: lastStorageCount,
    uiLen: lastUiLen,
    hasDesync,
    hasSkip,
  };
};

export async function exportLogpack({
  jsonlPath = DEFAULT_JSONL,
  logpackPath = DEFAULT_LOGPACK,
} = {}) {
  const raw = await readFile(jsonlPath, 'utf-8');
  const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
  const entries = lines.map(safeParse).filter(Boolean);

  const sections = new Map();
  let currentStep = 'BOOT';
  sections.set(currentStep, []);

  for (const entry of entries) {
    if (!entry?.tag) continue;
    if (entry.phase) {
      currentStep = entry.phase;
      if (!sections.has(currentStep)) {
        sections.set(currentStep, []);
      }
    } else if (entry.tag === 'G4_MARK') {
      const step = entry.payload?.step || 'UNKNOWN';
      currentStep = step;
      if (!sections.has(step)) {
        sections.set(step, []);
      }
      continue;
    }
    if (!REQUIRED_TAGS.has(entry.tag)) continue;
    const formatted = formatLine(entry);
    const bucket = sections.get(currentStep) || [];
    bucket.push(formatted);
    sections.set(currentStep, bucket);
  }

  const summary = summarize(entries);

  const output = [];
  for (const step of STEP_ORDER) {
    const linesForStep = sections.get(step);
    if (!linesForStep || linesForStep.length === 0) continue;
    output.push(`---${step}---`);
    output.push(...linesForStep);
    output.push('');
  }

  output.push('---SUMMARY---');
  output.push(`INSTANCE_ID observed: ${summary.instanceIds.join(', ') || 'n/a'}`);
  output.push(
    `storageCount vs UI len: ${
      summary.storageCount ?? 'n/a'
    } vs ${summary.uiLen ?? 'n/a'}`
  );
  output.push(
    `desync/skip_setstate: ${summary.hasDesync ? 'DESYNC' : 'OK'} / ${
      summary.hasSkip ? 'SKIP_SETSTATE' : 'OK'
    }`
  );
  output.push('');

  await mkdir(dirname(logpackPath), { recursive: true });
  await writeFile(logpackPath, output.join('\n'), 'utf-8');

  return { logpackPath, summary };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const jsonlPath = process.argv[2] || DEFAULT_JSONL;
  const logpackPath = process.argv[3] || DEFAULT_LOGPACK;
  exportLogpack({ jsonlPath, logpackPath })
    .then(result => {
      console.log('G4 logpack generated:', result.logpackPath);
      console.log('Summary:', result.summary);
    })
    .catch(error => {
      console.error('G4 logpack export failed:', error);
      process.exitCode = 1;
    });
}
