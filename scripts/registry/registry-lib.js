import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const CROCKFORD32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function resolveRepoRoot(fromDir) {
  return path.resolve(fromDir, '../..');
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function writeJson(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n');
}

export function nowIso() {
  return new Date().toISOString();
}

function encodeTime48(timeMs) {
  const time = BigInt(timeMs);
  let out = '';
  let value = time;
  for (let i = 0; i < 10; i += 1) {
    const mod = value % 32n;
    out = CROCKFORD32[Number(mod)] + out;
    value = value / 32n;
  }
  return out;
}

function encodeRandom80(bytes10) {
  if (bytes10.length !== 10) throw new Error('ULID random requires 10 bytes');
  const out = [];
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes10) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      const index = (buffer >> (bits - 5)) & 31;
      out.push(CROCKFORD32[index]);
      bits -= 5;
    }
  }
  if (bits > 0) {
    const index = (buffer << (5 - bits)) & 31;
    out.push(CROCKFORD32[index]);
  }
  return out.join('').slice(0, 16);
}

export function generateUlid() {
  const timePart = encodeTime48(Date.now());
  const randomPart = encodeRandom80(crypto.randomBytes(10));
  return timePart + randomPart;
}

export function parseCliArgs(argv) {
  const args = argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith('--')) continue;
    const [rawKey, rawValue] = token.slice(2).split('=');
    const key = rawKey.trim();
    const value = rawValue !== undefined ? rawValue : (args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : '');
    result[key] = value;
  }
  return result;
}

export function splitCsv(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function looksLikeSecret(text) {
  if (!text) return false;
  const s = String(text);
  const patterns = [
    /ghp_[A-Za-z0-9]{30,}/,
    /github_pat_[A-Za-z0-9_]{30,}/,
    /sk-[A-Za-z0-9]{20,}/,
    /AIzaSy[A-Za-z0-9_-]{20,}/,
    /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  ];
  if (patterns.some((p) => p.test(s))) return true;
  if (/[A-Za-z0-9_\-]{48,}/.test(s)) return true;
  return false;
}

export function assert(condition, message) {
  if (!condition) {
    const err = new Error(message);
    err.name = 'RegistryValidationError';
    throw err;
  }
}

export function loadEventsJsonl(eventsFile) {
  if (!fs.existsSync(eventsFile)) return [];
  const content = fs.readFileSync(eventsFile, 'utf8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  return lines.map((line, idx) => {
    try {
      return JSON.parse(line);
    } catch (e) {
      const err = new Error(`Invalid JSONL at line ${idx + 1}`);
      err.cause = e;
      throw err;
    }
  });
}

export function safeJsonStringifyOneLine(obj) {
  return JSON.stringify(obj);
}
