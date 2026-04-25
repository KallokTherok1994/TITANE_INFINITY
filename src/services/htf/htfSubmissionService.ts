// HTF Module — L'Humain à tout faire
// Soumissions — CRUD localStorage

import type { HTFSubmission } from './types';
import { incrementClientSubmissions } from './htfCrmService';

const STORAGE_KEY = 'titane_htf_submissions';

function load(): HTFSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as HTFSubmission[];
  } catch {
    return [];
  }
}

function save(submissions: HTFSubmission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export function getAllSubmissions(): HTFSubmission[] {
  return load();
}

export function getSubmission(id: string): HTFSubmission | undefined {
  return load().find(s => s.id === id);
}

export function saveSubmission(submission: HTFSubmission): HTFSubmission {
  const submissions = load();
  const idx = submissions.findIndex(s => s.id === submission.id);
  if (idx === -1) {
    submissions.push(submission);
    if (submission.clientId) incrementClientSubmissions(submission.clientId);
  } else {
    submissions[idx] = submission;
  }
  save(submissions);
  return submission;
}

export function updateSubmissionStatus(
  id: string,
  statut: HTFSubmission['statut']
): HTFSubmission | undefined {
  const submissions = load();
  const idx = submissions.findIndex(s => s.id === id);
  if (idx === -1) return undefined;
  const sub = submissions[idx];
  if (!sub) return undefined;
  sub.statut = statut;
  if (statut === 'acceptee') {
    sub.dateAcceptation = new Date().toISOString();
  }
  save(submissions);
  return sub;
}

export function deleteSubmission(id: string): boolean {
  const subs = load();
  const filtered = subs.filter(s => s.id !== id);
  if (filtered.length === subs.length) return false;
  save(filtered);
  return true;
}

/** Export une soumission en texte formaté pour impression/envoi */
export function exportSubmissionText(submission: HTFSubmission): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════',
    "         L'HUMAIN À TOUT FAIRE",
    '         www.humainatoutfaire.com',
    '         info@humainatoutfaire.com',
    '═══════════════════════════════════════════════════',
    '',
    `SOUMISSION N° ${submission.numero}`,
    `Date : ${submission.dateCreation.slice(0, 10)}`,
    `Valide jusqu'au : ${submission.dateValidite}`,
    '',
    `Client : ${submission.clientNom ?? 'Non spécifié'}`,
    '',
    'DESCRIPTION DU PROJET',
    '─────────────────────',
    submission.descriptionProjet,
    '',
    'ITEMS',
    '─────',
    ...submission.items.map(
      i => `  ${i.description.padEnd(40)} ${i.quantite} ${i.unite} × ${i.prixUnitaire.toFixed(2)}$ = ${i.total.toFixed(2)}$`
    ),
    '',
    `Sous-total : ${submission.sousTotal.toFixed(2)} $`,
    `TPS (5%) : ${submission.tps.toFixed(2)} $`,
    `TVQ (9,975%) : ${submission.tvq.toFixed(2)} $`,
    `TOTAL : ${submission.totalAvecTaxes.toFixed(2)} $`,
    '',
    'Acompte requis (30%) : ' + (submission.totalAvecTaxes * 0.3).toFixed(2) + ' $',
    '',
    '─────────────────────',
    'Signature client : ___________________________',
    'Date : ___________________________',
    '',
    "Kevin Thibault — L'Humain à tout faire",
  ];
  return lines.join('\n');
}
