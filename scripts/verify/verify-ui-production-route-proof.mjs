import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const artifactPath = resolve(
  process.cwd(),
  'artifacts/ui-production/v73-production-route-proof.jsonl'
);

const canonicalRoutes = [
  '/titane',
  '/experience',
  '/time',
  '/admin',
  '/dev',
  '/fusion',
  '/cloud',
  '/reality-center',
  '/hyper-center',
  '/quantum-center',
  '/twins',
  '/doc-center',
  '/optimization',
  '/total-dev',
  '/orchestration-intelligence',
  '/orchestration-center',
  '/singularity',
  '/sentinel',
  '/watchdog',
  '/selfheal',
  '/adaptive',
  '/memory',
  '/research',
  '/skills',
  '/knowledge',
  '/creation',
  '/evolution',
  '/performance',
  '/htf',
];

const mainMenuRoutes = ['/titane', '/time', '/admin', '/dev', '/fusion', '/twins', '/optimization', '/total-dev'];
const hiddenRoutes = ['/orchestration-intelligence', '/orchestration-center', '/singularity'];
const legacyRoutes = ['/chat', '/memory-evolution', '/memory-evo', '/doc', '/cloud-sync', '/vault'];

if (!existsSync(artifactPath)) {
  console.error(`FAIL artifact missing: ${artifactPath}`);
  process.exit(1);
}

const lines = readFileSync(artifactPath, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean);

const rows = lines.map((line, idx) => {
  try {
    return JSON.parse(line);
  } catch (error) {
    console.error(`FAIL invalid JSONL at line ${idx + 1}: ${String(error)}`);
    process.exit(1);
  }
});

const byRoute = new Map(rows.map(row => [row.route, row]));

const missingCanonical = canonicalRoutes.filter(route => !byRoute.has(route));
const missingMainMenu = mainMenuRoutes.filter(route => !byRoute.has(route));
const missingHidden = hiddenRoutes.filter(route => !byRoute.has(route));
const missingLegacy = legacyRoutes.filter(route => !byRoute.has(route));

const broken = rows.filter(row => row.status === 'PROD_ROUTE_BROKEN');
const stale = rows.filter(row => row.status === 'PROD_STALE_BUNDLE');
const unknown = rows.filter(row => String(row.status || '').includes('UNKNOWN'));

const noTruthOnPriority = rows.filter(row => {
  const isPriority = mainMenuRoutes.includes(row.route);
  return isPriority && !row.truthBadgeFound;
});

if (missingCanonical.length > 0) {
  console.error(`FAIL missing canonical routes: ${missingCanonical.join(', ')}`);
  process.exit(1);
}

if (missingMainMenu.length > 0) {
  console.error(`FAIL missing main menu routes: ${missingMainMenu.join(', ')}`);
  process.exit(1);
}

if (missingHidden.length > 0) {
  console.error(`FAIL missing hidden routes: ${missingHidden.join(', ')}`);
  process.exit(1);
}

if (missingLegacy.length > 0) {
  console.error(`FAIL missing legacy redirect proofs: ${missingLegacy.join(', ')}`);
  process.exit(1);
}

if (broken.length > 0) {
  console.error(`FAIL broken routes detected: ${broken.map(row => row.route).join(', ')}`);
  process.exit(1);
}

if (stale.length > 0) {
  console.error(`FAIL stale bundle statuses detected: ${stale.map(row => row.route).join(', ')}`);
  process.exit(1);
}

if (unknown.length > 0) {
  console.error(`FAIL unknown statuses detected: ${unknown.map(row => row.route).join(', ')}`);
  process.exit(1);
}

if (noTruthOnPriority.length > 0) {
  console.error(`FAIL missing truth badge/disclosure on priority routes: ${noTruthOnPriority.map(row => row.route).join(', ')}`);
  process.exit(1);
}

const summary = {
  canonicalTotal: canonicalRoutes.length,
  canonicalCovered: canonicalRoutes.length - missingCanonical.length,
  mainMenuTotal: mainMenuRoutes.length,
  mainMenuCovered: mainMenuRoutes.length - missingMainMenu.length,
  hiddenTotal: hiddenRoutes.length,
  hiddenCovered: hiddenRoutes.length - missingHidden.length,
  legacyTotal: legacyRoutes.length,
  legacyCovered: legacyRoutes.length - missingLegacy.length,
  rows: rows.length,
};

console.log(`PASS verify-ui-production-route-proof ${JSON.stringify(summary)}`);
