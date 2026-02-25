#!/usr/bin/env node

import fs from 'node:fs';

function readInput() {
  const argText = process.argv.slice(2).join(' ').trim();
  if (argText) return argText;
  try {
    const stdin = fs.readFileSync(0, 'utf8');
    return (stdin || '').trim();
  } catch {
    return '';
  }
}

function hasPlaceholder(value) {
  if (!value) return false;
  return /<[^>]+>|\bYYYY\b|\bMM\b|\bDD\b|\bHH:MM:SS\b|name\|handle|optional|APPROVED\|REJECTED/i.test(value);
}

function normalizeKey(key) {
  const k = key.trim().toUpperCase();
  if (k === 'REVIEWER_STOPLINE_CLEAR') return 'REVIEWER_STOPLINE_CLEAR';
  if (k === 'TIMESTAMP') return 'TIMESTAMP';
  if (k === 'REVIEWER') return 'REVIEWER';
  if (k === 'NOTES') return 'NOTES';
  return null;
}

function hasTimezone(ts) {
  if (!ts) return false;
  return /(UTC|GMT([+-]\d{1,2})?|[+-]\d{2}:?\d{2}|[A-Za-z_]+\/[A-Za-z_]+)$/i.test(ts.trim());
}

function isParseableTimestamp(ts) {
  if (!ts) return false;
  const trimmed = ts.trim();
  const normalized = trimmed.replace(' UTC', 'Z').replace(/\s+GMT([+-]\d{1,2})$/i, (_m, g1) => {
    const sign = g1.startsWith('-') ? '-' : '+';
    const h = g1.replace(/[+-]/, '').padStart(2, '0');
    return `${sign}${h}00`;
  });
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed);
}

function parseBlock(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 1) {
    const compactLine = lines[0];
    const compactParts = compactLine.split('|').map((p) => p.trim());
    if (compactParts.length >= 3 && !/REVIEWER_STOPLINE_CLEAR\s*:|TIMESTAMP\s*:|REVIEWER\s*:/i.test(compactLine)) {
      return {
        REVIEWER_STOPLINE_CLEAR: compactParts[0] || '',
        TIMESTAMP: compactParts[1] || '',
        REVIEWER: compactParts[2] || '',
        NOTES: compactParts.slice(3).join(' | '),
      };
    }
  }

  if (lines.length === 1 && lines[0].includes('|') && !lines[0].includes(':')) {
    const parts = lines[0].split('|').map((p) => p.trim());
    return {
      REVIEWER_STOPLINE_CLEAR: parts[0] || '',
      TIMESTAMP: parts[1] || '',
      REVIEWER: parts[2] || '',
      NOTES: parts.slice(3).join(' | '),
    };
  }

  const out = {
    REVIEWER_STOPLINE_CLEAR: '',
    TIMESTAMP: '',
    REVIEWER: '',
    NOTES: '',
  };

  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = normalizeKey(line.slice(0, idx));
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    if (key === 'NOTES') {
      out.NOTES = out.NOTES ? `${out.NOTES}\n${value}` : value;
    } else {
      out[key] = value;
    }
  }

  return out;
}

function buildNormalizedBlock(fields) {
  const lines = [
    `REVIEWER_STOPLINE_CLEAR: ${fields.REVIEWER_STOPLINE_CLEAR}`,
    `TIMESTAMP: ${fields.TIMESTAMP}`,
    `REVIEWER: ${fields.REVIEWER}`,
  ];
  if (fields.NOTES) {
    lines.push(`NOTES: ${fields.NOTES}`);
  }
  return lines.join('\n');
}

function evaluate(raw) {
  const fields = parseBlock(raw);
  const errors = [];
  const missing = [];

  const decision = fields.REVIEWER_STOPLINE_CLEAR.toUpperCase();
  if (!decision) {
    missing.push('REVIEWER_STOPLINE_CLEAR');
  } else if (hasPlaceholder(fields.REVIEWER_STOPLINE_CLEAR)) {
    errors.push('REVIEWER_STOPLINE_CLEAR placeholder detected');
  } else if (!['APPROVED', 'REJECTED'].includes(decision)) {
    errors.push('REVIEWER_STOPLINE_CLEAR must be APPROVED or REJECTED');
  }

  if (!fields.TIMESTAMP) {
    missing.push('TIMESTAMP');
  } else if (hasPlaceholder(fields.TIMESTAMP)) {
    errors.push('TIMESTAMP placeholder detected');
  } else {
    const tzPresent = hasTimezone(fields.TIMESTAMP);
    if (!tzPresent) {
      const tsCandidate = `${fields.TIMESTAMP} -0500`;
      if (isParseableTimestamp(tsCandidate)) {
        fields.TIMESTAMP = tsCandidate;
      } else {
        errors.push('TIMESTAMP missing timezone and cannot be normalized');
      }
    }
    if (!isParseableTimestamp(fields.TIMESTAMP)) {
      errors.push('TIMESTAMP not parseable');
    }
  }

  if (!fields.REVIEWER) {
    missing.push('REVIEWER');
  } else if (hasPlaceholder(fields.REVIEWER)) {
    errors.push('REVIEWER placeholder detected');
  }

  fields.REVIEWER_STOPLINE_CLEAR = decision || fields.REVIEWER_STOPLINE_CLEAR;

  let status = 'INVALID';
  if (errors.length === 0 && missing.length === 0) {
    status = 'VALID';
  } else if (errors.length === 0 && missing.length === 1) {
    status = 'FIXABLE';
  }

  return {
    status,
    normalized_block: status === 'VALID' || status === 'FIXABLE' ? buildNormalizedBlock(fields) : null,
    missing_fields: missing,
    errors,
  };
}

const raw = readInput();
const result = evaluate(raw);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
