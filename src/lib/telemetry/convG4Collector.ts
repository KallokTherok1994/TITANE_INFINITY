/**
 * TITANE∞ — G4 Conversations Collector (Local-first)
 * Collects runtime UI logs into JSONL + exposes automation helpers.
 */

import { appendFile, mkdir } from '@/utils/tauriFsAdapter';

const G4_DIR = 'runtime/dev/logs';
const G4_JSONL = `${G4_DIR}/conversations_g4.jsonl`;
const G4_LOGPACK = `${G4_DIR}/conversations_g4.logpack.txt`;

const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
let initialized = false;
let writing = false;
let currentPhase = 'BOOT';

const buffer: string[] = [];

type G4Payload = Record<string, unknown>;

const normalizeTag = (tag: string): string => {
  if (!tag) return 'UNKNOWN';
  const trimmed = tag.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '"[unserializable]"';
  }
};

const ensureDir = async (): Promise<void> => {
  if (writing) return;
  writing = true;
  try {
    await mkdir(G4_DIR, { recursive: true });
  } finally {
    writing = false;
  }
};

export const getG4Paths = () => ({
  jsonl: G4_JSONL,
  logpack: G4_LOGPACK,
  dir: G4_DIR,
});

export const getG4SessionId = () => SESSION_ID;

export async function g4Emit(
  phase: string,
  tag: string,
  payload: G4Payload = {}
): Promise<void> {
  const normalizedTag = normalizeTag(tag);
  const normalizedPhase = phase?.trim() || 'RUNTIME';
  currentPhase = normalizedPhase;
  const instanceId = typeof payload.instanceId === 'string' ? payload.instanceId : null;
  const lineText = `[G4] ${normalizedPhase} [${normalizedTag}] ${safeStringify(payload)}`;
  const entry = {
    ts: new Date().toISOString(),
    phase: normalizedPhase,
    tag: normalizedTag,
    payload,
    sessionId: SESSION_ID,
    instanceId: instanceId ?? undefined,
    route: typeof window !== 'undefined' ? window.location.pathname : 'n/a',
    buildMode: typeof process !== 'undefined' ? process.env.NODE_ENV : 'n/a',
    line: lineText,
  };
  const line = safeStringify(entry);
  buffer.push(line);
  await ensureDir();
  await appendFile(G4_JSONL, `${line}\n`, 'utf-8');
  console.log(lineText);
}

export async function g4Log(tag: string, payload: G4Payload = {}): Promise<void> {
  const phase = typeof payload.phase === 'string' ? payload.phase : currentPhase;
  await g4Emit(phase, tag, payload);
}

export async function g4Mark(step: string): Promise<void> {
  await g4Emit(step, 'G4_MARK', { step });
}

const captureConsole = (method: 'log' | 'warn' | 'error') => {
  const original = console[method].bind(console);
  return (...args: unknown[]) => {
    original(...args);
    const first = args[0];
    if (typeof first !== 'string') return;
    if (first.startsWith('[G4]')) return;
    const match = first.match(/\[(CONV_HOST|CONV_HOOK|CONV_STORAGE|CONV_UI|CONV_SKIP_SETSTATE|CONV_DESYNC|G4_MARK)\]/);
    if (!match) return;
    const [, tag] = match;
    void g4Log(tag, {
      message: first,
      args: args.slice(1).map(safeStringify),
    });
  };
};

const exposeGlobals = () => {
  if (typeof window === 'undefined') return;
  const w = window as typeof window & {
    __G4_LOG__?: (tag: string, payload?: G4Payload) => Promise<void>;
    __G4_MARK__?: (step: string) => Promise<void>;
    __G4_EXPORT__?: () => {
      jsonl: string;
      count: number;
      sessionId: string;
    };
  };

  w.__G4_LOG__ = g4Log;
  w.__G4_MARK__ = g4Mark;
  w.__G4_EXPORT__ = () => ({
    jsonl: buffer.length ? `${buffer.join('\n')}\n` : '',
    count: buffer.length,
    sessionId: SESSION_ID,
  });
};

export const initG4Collector = (): void => {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  console.log = captureConsole('log');
  console.warn = captureConsole('warn');
  console.error = captureConsole('error');
  exposeGlobals();
  void g4Emit('BOOT', 'G4_COLLECTOR_ARMED', { sessionId: SESSION_ID });
};
