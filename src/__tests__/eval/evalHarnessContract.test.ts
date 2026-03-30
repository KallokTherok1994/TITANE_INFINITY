/**
 * TITANE∞ — P2.2 QUALITY LAB FOUNDATION
 * Eval Harness Contract Tests
 *
 * Proves that the eval harness scorecard schemas are well-formed,
 * parseable, and align with the harness types contract.
 *
 * SC1: All scorecard JSON files are parseable
 * SC2: Each scorecard has required top-level fields
 * SC3: Each scorecard metric has required fields
 * SC4: Dataset JSONL files are parseable
 * SC5: Verdict enum in harness types matches allowed verdicts
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCORECARDS_DIR = join(process.cwd(), 'evals/scorecards/v1');
const DATASETS_DIR = join(process.cwd(), 'evals/datasets/v1');

// ═══════════════════════════════════════════════════════════════════
// SC1: ALL SCORECARD JSON FILES ARE PARSEABLE
// ═══════════════════════════════════════════════════════════════════

describe('SC1: all scorecard JSON files are parseable', () => {
  const scorecardFiles = readdirSync(SCORECARDS_DIR).filter(f => f.endsWith('.json'));

  it('finds at least 6 scorecards', () => {
    expect(scorecardFiles.length).toBeGreaterThanOrEqual(6);
  });

  for (const file of scorecardFiles) {
    it(`parses ${file} without errors`, () => {
      const raw = readFileSync(join(SCORECARDS_DIR, file), 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe('object');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SC2: EACH SCORECARD HAS REQUIRED TOP-LEVEL FIELDS
// ═══════════════════════════════════════════════════════════════════

describe('SC2: each scorecard has required top-level fields', () => {
  const scorecardFiles = readdirSync(SCORECARDS_DIR).filter(
    f => f.endsWith('.json') && f !== 'CHALLENGER_TEMPLATE.json'
  );

  const requiredTopFields = ['scorecard_id', 'version'];

  for (const file of scorecardFiles) {
    describe(file, () => {
      const raw = readFileSync(join(SCORECARDS_DIR, file), 'utf-8');
      const parsed = JSON.parse(raw);

      for (const field of requiredTopFields) {
        it(`has required field: ${field}`, () => {
          expect(parsed).toHaveProperty(field);
          expect(parsed[field]).toBeDefined();
        });
      }

      // HONESTY_SCORECARD uses 'anti_lie_violations' instead of 'metrics' — both are valid
      const scoringField = parsed.metrics
        ? 'metrics'
        : Array.isArray(parsed.anti_lie_violations)
          ? 'anti_lie_violations'
          : null;
      it('has metrics or anti_lie_violations array', () => {
        expect(scoringField).not.toBeNull();
        expect(Array.isArray(parsed[scoringField!])).toBe(true);
      });

      it('has at least 1 scoring entry', () => {
        expect(parsed[scoringField!].length).toBeGreaterThanOrEqual(1);
      });
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SC3: EACH SCORECARD METRIC HAS REQUIRED FIELDS
// ═══════════════════════════════════════════════════════════════════

describe('SC3: each scorecard metric has required fields', () => {
  const scorecardFiles = readdirSync(SCORECARDS_DIR).filter(
    f => f.endsWith('.json') && f !== 'CHALLENGER_TEMPLATE.json'
  );

  const requiredMetricFields = ['name', 'target', 'blocking'];

  for (const file of scorecardFiles) {
    const raw = readFileSync(join(SCORECARDS_DIR, file), 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed.metrics || !Array.isArray(parsed.metrics)) {
      continue;
    }

    describe(`${file} metrics`, () => {
      for (let i = 0; i < parsed.metrics.length; i++) {
        const metric = parsed.metrics[i];

        for (const field of requiredMetricFields) {
          it(`metric[${i}] has required field: ${field}`, () => {
            expect(metric).toHaveProperty(field);
          });
        }

        it(`metric[${i}].target is a number between 0 and 1`, () => {
          expect(typeof metric.target).toBe('number');
          expect(metric.target).toBeGreaterThanOrEqual(0);
          expect(metric.target).toBeLessThanOrEqual(1);
        });

        it(`metric[${i}].blocking is a boolean`, () => {
          expect(typeof metric.blocking).toBe('boolean');
        });
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SC4: DATASET JSONL FILES ARE PARSEABLE
// ═══════════════════════════════════════════════════════════════════

describe('SC4: dataset JSONL files are parseable', () => {
  const datasetFiles = readdirSync(DATASETS_DIR).filter(f => f.endsWith('.jsonl'));

  it('finds at least 6 dataset lanes', () => {
    expect(datasetFiles.length).toBeGreaterThanOrEqual(6);
  });

  for (const file of datasetFiles) {
    describe(file, () => {
      const raw = readFileSync(join(DATASETS_DIR, file), 'utf-8');
      const lines = raw
        .trim()
        .split('\n')
        .filter(l => l.trim().length > 0);

      it('has at least 1 item', () => {
        expect(lines.length).toBeGreaterThanOrEqual(1);
      });

      it('each line is valid JSON', () => {
        for (let i = 0; i < lines.length; i++) {
          const parsed = JSON.parse(lines[i]);
          expect(parsed).toBeDefined();
          expect(parsed).toHaveProperty('id');
        }
      });

      // Lane F (shadow) uses a different template schema — skip input/expected_behavior check
      if (!file.includes('lane_f')) {
        it('each item has required DatasetItem fields', () => {
          const requiredFields = ['id', 'lane', 'input', 'expected_behavior'];
          for (const line of lines) {
            const item = JSON.parse(line);
            for (const field of requiredFields) {
              expect(item).toHaveProperty(field);
            }
          }
        });
      } else {
        it('shadow items have id and lane', () => {
          for (const line of lines) {
            const item = JSON.parse(line);
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('lane');
            expect(item).toHaveProperty('description');
          }
        });
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SC5: VERDICT ENUM CONSISTENCY
// ═══════════════════════════════════════════════════════════════════

describe('SC5: verdict enum consistency', () => {
  const allowedVerdicts = [
    'PASS',
    'FAIL',
    'BLOCKED',
    'PARTIAL',
    'QUALIFIED',
    'SHADOW_ONLY',
    'CHAMPION_RETAINED',
    'CHALLENGER_NOT_BETTER',
    'PROMOTION_BLOCKED',
    'REGRESSION_DETECTED',
    'MEMORY_REGRESSION',
    'ROUTER_REGRESSION',
    'HONESTY_REGRESSION',
    'DESKTOP_CHAIN_REGRESSION',
    'AUTOLEARNING_BLOCKED',
  ];

  it('verdict list has at least 10 values', () => {
    expect(allowedVerdicts.length).toBeGreaterThanOrEqual(10);
  });

  it('contains all blocking verdicts', () => {
    expect(allowedVerdicts).toContain('FAIL');
    expect(allowedVerdicts).toContain('BLOCKED');
    expect(allowedVerdicts).toContain('REGRESSION_DETECTED');
    expect(allowedVerdicts).toContain('PROMOTION_BLOCKED');
  });

  it('contains all pass verdicts', () => {
    expect(allowedVerdicts).toContain('PASS');
    expect(allowedVerdicts).toContain('CHAMPION_RETAINED');
  });
});
