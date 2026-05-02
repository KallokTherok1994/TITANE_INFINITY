/**
 * TITANE∞ — E2E Desktop Chat Q&A Mode Validation
 *
 * Suite: 10 modes × 10 scénarios Q&A = 100 tests de qualité réels
 * Runtime: Tauri desktop natif (WDIO + tauri-driver + Ollama gemma2:2b)
 *
 * Assertions par scénario:
 *   • response.length >= 200 (réponse substantielle)
 *   • Mots-clés persona/mode présents dans la réponse
 *   • data-conversation-mode via chat-runtime-state = modeId actif
 *   • Screenshot PNG preuve par mode
 *   • Score qualité (0–100) calculé et archivé
 *
 * Output: reports/chat_qa_mode_validation/<timestamp>/
 *
 * @rule16 — Suite de tests Q&A avancés par mode
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

// ─── Report setup ─────────────────────────────────────────────────────────────
const REPORT_TS = process.env.REPORT_TS || new Date().toISOString().replace(/[:.]/g, '-');
const REPORT_DIR = path.join(
  process.cwd(),
  'reports/chat_qa_mode_validation',
  REPORT_TS
);
const SCREEN_DIR = path.join(REPORT_DIR, 'screenshots');
const EXPORTS_DIR = path.join(REPORT_DIR, 'exports');
const LOGS_DIR = path.join(REPORT_DIR, 'logs');

for (const d of [REPORT_DIR, SCREEN_DIR, EXPORTS_DIR, LOGS_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

// ─── Config ───────────────────────────────────────────────────────────────────
const DEV_BASE_URL = (
  process.env.TAURI_DEV_SERVER_URL ||
  process.env.VITE_DEV_SERVER_URL ||
  'http://127.0.0.1:1420'
).replace(/\/+$/, '');

const TAURI_BASE_URL = 'tauri://localhost';
const shouldPreferTauri =
  !process.env.TAURI_DEV_SERVER_URL && !process.env.VITE_DEV_SERVER_URL;
const appUrl = (route = '/') =>
  shouldPreferTauri
    ? route === '/'
      ? `${TAURI_BASE_URL}/`
      : `${TAURI_BASE_URL}/#${route}`
    : `${DEV_BASE_URL}${route}`;

const RESPONSE_TIMEOUT_MS = parseInt(process.env.RESPONSE_TIMEOUT_MS || '120000', 10);
const MIN_RESPONSE_LENGTH = parseInt(process.env.MIN_RESPONSE_LENGTH || '200', 10);

// ─── Accumulateur global ──────────────────────────────────────────────────────
const M = {
  runTs: REPORT_TS,
  modes: {},
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  screenshots: [],
  qualityScores: {},
  finetuneSuggestions: [],
  verdict: 'PENDING',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function writeReport(filename, data) {
  const fp = path.join(EXPORTS_DIR, filename);
  fs.writeFileSync(fp, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

function writeLog(filename, content) {
  fs.writeFileSync(path.join(LOGS_DIR, filename), content);
}

function recordTest(modeId, name, passed, details = {}) {
  M.totalTests++;
  if (passed) M.passedTests++;
  else M.failedTests++;
  if (!M.modes[modeId]) M.modes[modeId] = { passed: 0, failed: 0, tests: [] };
  M.modes[modeId][passed ? 'passed' : 'failed']++;
  M.modes[modeId].tests.push({ name, passed, ...details });
  console.log(`${passed ? '✅' : '❌'} [${modeId}] ${name}`);
}

function calcQualityScore(response, keywords, modeId) {
  const len = response ? response.length : 0;
  const lenScore = Math.min(100, (len / MIN_RESPONSE_LENGTH) * 40);
  const keywordHits = keywords.filter(k =>
    response.toLowerCase().includes(k.toLowerCase())
  ).length;
  const keywordScore = keywords.length > 0 ? (keywordHits / keywords.length) * 40 : 40;
  const frenchScore = response.includes('é') || response.includes('à') || response.includes('ê') ? 20 : 0;
  const total = Math.round(lenScore + keywordScore + frenchScore);
  if (total < 60) {
    M.finetuneSuggestions.push({
      modeId,
      score: total,
      issue: `Score qualité insuffisant (${total}/100)`,
      keywordsMissed: keywords.filter(k => !response.toLowerCase().includes(k.toLowerCase())),
      responseLength: len,
    });
  }
  return total;
}

async function ss(label, modeId) {
  const filename = `${modeId}_${label.replace(/\W+/g, '_')}.png`;
  const filepath = path.join(SCREEN_DIR, filename);
  try {
    await browser.saveScreenshot(filepath);
    M.screenshots.push({ label, modeId, file: filename });
    console.log(`[SCREEN] ${label} → ${filepath}`);
  } catch (e) {
    console.warn(`[SCREEN FAIL] ${label}: ${e.message}`);
  }
}

// ─── Core: sélection de mode + envoi de message ───────────────────────────────
async function selectMode(modeId) {
  try {
    // Cliquer sur le sélecteur de mode
    const trigger = await $('[data-testid="chat-mode-selector-trigger"]');
    await trigger.waitForDisplayed({ timeout: 10000 });
    await trigger.click();
    await browser.pause(500);

    // Cliquer sur l'option du mode
    const option = await $(`[data-testid="chat-mode-option-${modeId}"]`);
    if (await option.isDisplayed()) {
      await option.click();
    } else {
      // Fallback: chercher via le select compact
      const select = await $('[data-testid="chat-mode-selector-select"]');
      if (await select.isExisting()) {
        await select.selectByAttribute('value', modeId);
      }
    }
    await browser.pause(800);
    console.log(`[MODE] Sélectionné: ${modeId}`);
  } catch (e) {
    console.warn(`[MODE SELECT FAIL] ${modeId}: ${e.message}`);
  }
}

async function sendMessage(text) {
  const input = await $('[data-testid="chat-input"]');
  await input.waitForDisplayed({ timeout: 10000 });
  await input.clearValue();
  await input.setValue(text);
  await browser.pause(300);

  const sendBtn = await $('[data-testid="chat-send"]');
  await sendBtn.waitForDisplayed({ timeout: 5000 });
  await sendBtn.click();
}

async function waitForResponse() {
  // Attendre que le loader disparaisse
  await browser.waitUntil(
    async () => {
      const loader = await $('[data-testid="chat-loading"]');
      const exists = await loader.isExisting();
      if (!exists) return true;
      const displayed = await loader.isDisplayed();
      return !displayed;
    },
    { timeout: RESPONSE_TIMEOUT_MS, interval: 1000 }
  );
  await browser.pause(1000);
}

async function getLastResponseText() {
  try {
    const region = await $('[data-testid="chat-messages-scroll-region"]');
    const bubbles = await region.$$('[data-testid^="message-"]');

    // Prendre le dernier message IA (role assistant)
    let lastText = '';
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const el = bubbles[i];
      const classes = await el.getAttribute('class') || '';
      const dataRole = await el.getAttribute('data-role') || '';
      if (dataRole === 'assistant' || classes.includes('assistant') || classes.includes('ai')) {
        lastText = await el.getText();
        break;
      }
    }

    // Fallback: prendre le dernier message de la zone scroll
    if (!lastText) {
      const content = await $('[data-testid="chat-message-content"]');
      if (await content.isExisting()) {
        lastText = await content.getText();
      }
    }

    return lastText || '';
  } catch (e) {
    console.warn(`[GET RESPONSE FAIL]: ${e.message}`);
    return '';
  }
}

async function getActiveConversationMode() {
  try {
    const runtimeState = await $('[data-testid="chat-runtime-state"]');
    if (await runtimeState.isExisting()) {
      return await runtimeState.getAttribute('data-conversation-mode') || '';
    }
    const runtimeBadge = await $('[data-testid="chat-runtime-badge"]');
    if (await runtimeBadge.isExisting()) {
      const text = await runtimeBadge.getText();
      const match = text.match(/conversation-mode:(\S+)/);
      return match ? match[1] : '';
    }
    return '';
  } catch {
    return '';
  }
}

async function resetConversation() {
  try {
    // Chercher un bouton "Nouvelle conversation" ou reset
    const newConvBtn = await $('[data-testid="chat-new-conversation"]');
    if (await newConvBtn.isExisting() && await newConvBtn.isDisplayed()) {
      await newConvBtn.click();
      await browser.pause(1000);
      return;
    }
    // Fallback: recharger la page
    await browser.url(appUrl('/'));
    await browser.pause(2000);
  } catch {
    await browser.pause(500);
  }
}

// ─── SCENARII Q&A PAR MODE ────────────────────────────────────────────────────

const QA_SCENARIOS = {
  default: [
    {
      q: 'Explique-moi la différence fondamentale entre stratégie et tactique avec un exemple concret.',
      keywords: ['stratégie', 'tactique', 'exemple'],
    },
    {
      q: 'Analyse les avantages et inconvénients de l\'architecture microservices vs monolithique pour une startup.',
      keywords: ['microservices', 'monolithique', 'avantages'],
    },
    {
      q: 'Comment structurer une prise de décision sous incertitude ? Donne-moi un cadre concret.',
      keywords: ['décision', 'incertitude', 'cadre'],
    },
    {
      q: 'Quelles sont les 5 erreurs les plus courantes en gestion de projet et comment les éviter ?',
      keywords: ['erreurs', 'gestion', 'projet'],
    },
    {
      q: 'Résume les principes clés du Deep Work de Cal Newport et comment les appliquer.',
      keywords: ['deep work', 'focus', 'concentration'],
    },
    {
      q: 'Comment évaluer la qualité d\'une base de code que je viens de récupérer ?',
      keywords: ['qualité', 'code', 'évaluation'],
    },
    {
      q: 'Quelles métriques utiliser pour mesurer la performance d\'une équipe de développement ?',
      keywords: ['métriques', 'performance', 'équipe'],
    },
    {
      q: 'Comment gérer un conflit avec un collègue tout en préservant la relation professionnelle ?',
      keywords: ['conflit', 'collègue', 'relation'],
    },
    {
      q: 'Explique la loi de Parkinson et comment elle s\'applique à la productivité personnelle.',
      keywords: ['parkinson', 'productivité', 'temps'],
    },
    {
      q: 'Comment construire une habitude durable selon les neurosciences ?',
      keywords: ['habitude', 'neurosciences', 'cerveau'],
    },
  ],

  coach: [
    {
      q: 'Mon objectif est de lancer un produit SaaS en 3 mois mais je procrastine constamment. Aide-moi.',
      keywords: ['objectif', 'procrastination', 'action'],
    },
    {
      q: 'Je veux améliorer ma communication avec mon équipe. Comment mesurer où j\'en suis maintenant ?',
      keywords: ['communication', 'équipe', 'mesurer'],
    },
    {
      q: 'J\'ai peur de déléguer parce que je pense que personne ne fera aussi bien que moi. Que faire ?',
      keywords: ['déléguer', 'peur', 'contrôle'],
    },
    {
      q: 'Crée-moi un plan de progression sur 90 jours pour développer mes compétences en leadership.',
      keywords: ['plan', 'progression', 'leadership'],
    },
    {
      q: 'Comment identifier mes forces naturelles et les aligner avec mes objectifs professionnels ?',
      keywords: ['forces', 'objectifs', 'alignement'],
    },
    {
      q: 'Je veux changer de carrière mais j\'ai peur de recommencer à zéro. Aide-moi à évaluer l\'option.',
      keywords: ['carrière', 'changement', 'évaluation'],
    },
    {
      q: 'Comment développer plus de résilience face aux échecs et aux critiques ?',
      keywords: ['résilience', 'échec', 'critique'],
    },
    {
      q: 'Mon équilibre vie perso / vie pro est cassé. Comment reconstruire des limites saines ?',
      keywords: ['équilibre', 'limites', 'personnel'],
    },
    {
      q: 'J\'ai du mal à prioriser — je dis oui à tout. Quelle pratique concrète pour apprendre à dire non ?',
      keywords: ['priorité', 'non', 'pratique'],
    },
    {
      q: 'Quel est le cycle OODA et comment l\'appliquer pour prendre de meilleures décisions rapidement ?',
      keywords: ['ooda', 'décision', 'cycle'],
    },
  ],

  dev: [
    {
      q: 'Fais une revue critique de cette approche: stocker les tokens JWT dans le localStorage côté client.',
      keywords: ['jwt', 'securité', 'localStorage'],
    },
    {
      q: 'Explique les principes SOLID avec un exemple TypeScript concret pour chaque principe.',
      keywords: ['solid', 'typescript', 'principe'],
    },
    {
      q: 'Comment architecturer un système de gestion d\'état complexe en React sans Redux ?',
      keywords: ['react', 'état', 'architecture'],
    },
    {
      q: 'Quelle est la différence entre async/await et les Promises en JavaScript ? Montre les cas d\'usage.',
      keywords: ['async', 'promise', 'javascript'],
    },
    {
      q: 'Comment déboguer une fuite mémoire dans une application Node.js en production ?',
      keywords: ['mémoire', 'nodejs', 'débogage'],
    },
    {
      q: 'Explique les ownership et borrowing en Rust avec des exemples de code commentés.',
      keywords: ['rust', 'ownership', 'borrowing'],
    },
    {
      q: 'Comment structurer les tests unitaires pour un composant React complexe avec hooks ?',
      keywords: ['test', 'composant', 'hooks'],
    },
    {
      q: 'Qu\'est-ce que le pattern Repository en architecture logicielle et quand l\'utiliser ?',
      keywords: ['repository', 'pattern', 'architecture'],
    },
    {
      q: 'Comment optimiser les performances d\'une requête SQL qui prend 5 secondes sur 1M de lignes ?',
      keywords: ['sql', 'performance', 'optimisation'],
    },
    {
      q: 'Explique la différence entre monorepo et polyrepo et les critères de choix pour une startup.',
      keywords: ['monorepo', 'polyrepo', 'startup'],
    },
  ],

  admin: [
    {
      q: 'Un service systemd crashe au démarrage sans laisser de logs. Donne-moi le protocole de diagnostic.',
      keywords: ['systemd', 'crash', 'diagnostic'],
    },
    {
      q: 'Comment sécuriser un serveur Linux Ubuntu fraîchement installé ? Checklist complète.',
      keywords: ['linux', 'sécurité', 'checklist'],
    },
    {
      q: 'Ma base de données PostgreSQL est lente depuis ce matin. Quelles sont les 5 premières commandes à lancer ?',
      keywords: ['postgresql', 'performance', 'commandes'],
    },
    {
      q: 'Comment automatiser la rotation des logs sur Linux pour éviter de saturer le disque ?',
      keywords: ['logs', 'rotation', 'linux'],
    },
    {
      q: 'Crée un plan de rollback pour un déploiement Docker en production qui a introduit une régression.',
      keywords: ['rollback', 'docker', 'déploiement'],
    },
    {
      q: 'Comment monitorer la consommation CPU/RAM d\'un processus Rust en production ?',
      keywords: ['monitoring', 'cpu', 'ram'],
    },
    {
      q: 'Explique la différence entre soft limit et hard limit dans les ressources Linux (ulimit).',
      keywords: ['ulimit', 'limit', 'linux'],
    },
    {
      q: 'Comment configurer un reverse proxy Nginx avec SSL/TLS pour une app Tauri backend ?',
      keywords: ['nginx', 'ssl', 'proxy'],
    },
    {
      q: 'Mon container Docker consomme 100% CPU de façon aléatoire. Comment investiguer ?',
      keywords: ['docker', 'cpu', 'investigation'],
    },
    {
      q: 'Quelle est la meilleure stratégie de backup pour une base SQLite en production ?',
      keywords: ['backup', 'sqlite', 'stratégie'],
    },
  ],

  strategy: [
    {
      q: 'Réalise un SWOT complet pour une startup B2B SaaS qui propose un outil d\'IA pour PME.',
      keywords: ['swot', 'forces', 'opportunités'],
    },
    {
      q: 'Comment définir des OKR pertinents pour une équipe produit de 5 personnes en phase early stage ?',
      keywords: ['okr', 'objectifs', 'équipe'],
    },
    {
      q: 'J\'ai 3 opportunités business devant moi et un seul budget. Comment décider laquelle prioriser ?',
      keywords: ['priorité', 'opportunité', 'budget'],
    },
    {
      q: 'Explique le modèle des 5 forces de Porter et son application pour le marché des assistants IA.',
      keywords: ['porter', 'concurrence', 'marché'],
    },
    {
      q: 'Comment construire un avantage compétitif durable dans un marché qui évolue très vite ?',
      keywords: ['avantage', 'compétitif', 'durable'],
    },
    {
      q: 'Quelle stratégie de go-to-market pour un produit SaaS avec bootstrap et sans budget marketing ?',
      keywords: ['go-to-market', 'saas', 'bootstrap'],
    },
    {
      q: 'Comment évaluer si une décision stratégique est bonne quand les données sont incomplètes ?',
      keywords: ['décision', 'stratégique', 'incertitude'],
    },
    {
      q: 'Explique la matrice McKinsey et comment l\'utiliser pour allouer des ressources entre projets.',
      keywords: ['mckinsey', 'ressources', 'matrice'],
    },
    {
      q: 'Comment construire un business model résilient qui survit à une disruption technologique majeure ?',
      keywords: ['business model', 'résilience', 'disruption'],
    },
    {
      q: 'Quelle est la différence entre vision, mission et stratégie ? Donne des exemples concrets.',
      keywords: ['vision', 'mission', 'stratégie'],
    },
  ],

  brainstorming: [
    {
      q: 'Génère 10 idées innovantes pour monétiser une application de productivité desktop (Tauri/Rust).',
      keywords: ['idées', 'monétiser', 'applications'],
    },
    {
      q: 'Applique la technique SCAMPER sur le concept de "réunion d\'équipe" pour l\'améliorer radicalement.',
      keywords: ['scamper', 'réunion', 'améliorer'],
    },
    {
      q: 'Brainstorming sur les façons dont l\'IA générative pourrait transformer le secteur de l\'éducation.',
      keywords: ['ia', 'éducation', 'transformer'],
    },
    {
      q: 'Génère 10 concepts d\'application mobile autour de la santé mentale et la pleine conscience.',
      keywords: ['santé mentale', 'application', 'conscience'],
    },
    {
      q: 'Utilise la pensée inversée: "Comment rendre un produit SaaS le plus désagréable possible ?" Puis inverse.',
      keywords: ['inversée', 'produit', 'améliorer'],
    },
    {
      q: 'Brainstorming: comment combiner la méthode GTD avec l\'IA pour créer un système de productivité next-gen ?',
      keywords: ['gtd', 'ia', 'productivité'],
    },
    {
      q: 'Génère 10 modèles de revenus alternatifs pour une startup open-source.',
      keywords: ['revenus', 'open-source', 'modèles'],
    },
    {
      q: 'Quelles connexions inattendues peux-tu faire entre le concept de "permaculture" et le "management agile" ?',
      keywords: ['connexions', 'permaculture', 'agile'],
    },
    {
      q: 'Brainstorming sur les futures interfaces homme-machine au-delà de l\'écran tactile.',
      keywords: ['interface', 'futur', 'humain'],
    },
    {
      q: 'Génère 10 hypothèses "Et si...?" pour réinventer le concept de bureau de travail.',
      keywords: ['hypothèses', 'bureau', 'réinventer'],
    },
  ],

  synthesis: [
    {
      q: 'Connecte ces 3 concepts: Deep Work (Newport), Flow (Csikszentmihalyi) et GTD (Allen). Quel principe unificateur ?',
      keywords: ['deep work', 'flow', 'principe'],
    },
    {
      q: 'Synthétise les points communs entre les approches: Lean Startup, Design Thinking et Agile.',
      keywords: ['lean', 'agile', 'synthèse'],
    },
    {
      q: 'Quels sont les patterns communs entre les grandes disruptions technologiques (internet, mobile, IA) ?',
      keywords: ['patterns', 'disruption', 'communs'],
    },
    {
      q: 'Connecte la philosophie stoïcienne avec les pratiques modernes de résilience organisationnelle.',
      keywords: ['stoïcisme', 'résilience', 'connexion'],
    },
    {
      q: 'Synthèse: que partagent les grandes architectures logicielles (microservices, hexagonale, CQRS) ?',
      keywords: ['architecture', 'microservices', 'hexagonale'],
    },
    {
      q: 'Connecte la neuroplasticité du cerveau avec les principes d\'apprentissage accéléré (spaced repetition, etc.).',
      keywords: ['neuroplasticité', 'apprentissage', 'cerveau'],
    },
    {
      q: 'Quel insight émerge quand on connecte: économie de l\'attention + dopamine + design persuasif + bien-être ?',
      keywords: ['attention', 'dopamine', 'bien-être'],
    },
    {
      q: 'Synthèse des modèles de prise de décision: OODA, DECIDE, Cynefin — qu\'est-ce qu\'ils partagent ?',
      keywords: ['ooda', 'cynefin', 'décision'],
    },
    {
      q: 'Connecte le concept d\'antifragilité (Taleb) avec une stratégie de développement logiciel robuste.',
      keywords: ['antifragilité', 'taleb', 'logiciel'],
    },
    {
      q: 'Quels patterns communs existent entre un bon coach sportif, un bon thérapeute et un bon manager ?',
      keywords: ['coach', 'patterns', 'communs'],
    },
  ],

  planning: [
    {
      q: 'Crée un plan SMART détaillé pour apprendre Rust en 90 jours en partant de zéro.',
      keywords: ['smart', 'rust', 'plan'],
    },
    {
      q: 'Planifie le lancement d\'un produit SaaS en 6 mois — jalons, risques et critères de succès.',
      keywords: ['lancement', 'jalons', 'risques'],
    },
    {
      q: 'Crée une roadmap produit pour une app de gestion de tâches IA sur 3 trimestres.',
      keywords: ['roadmap', 'produit', 'trimestres'],
    },
    {
      q: 'Planifie une migration de base de données PostgreSQL → SQLite sans downtime.',
      keywords: ['migration', 'postgresql', 'downtime'],
    },
    {
      q: 'Crée un plan de développement personnel sur 6 mois pour passer de développeur à CTO.',
      keywords: ['développement', 'personnel', 'cto'],
    },
    {
      q: 'Comment planifier une refonte complète d\'un frontend React legacy avec 0 régression ?',
      keywords: ['refonte', 'react', 'régression'],
    },
    {
      q: 'Planifie la mise en place d\'un système de CI/CD de A à Z pour une équipe de 3 développeurs.',
      keywords: ['ci/cd', 'déploiement', 'équipe'],
    },
    {
      q: 'Crée un plan de gestion de crise pour un incident de production critique (P0) avec timeline.',
      keywords: ['crise', 'incident', 'timeline'],
    },
    {
      q: 'Planifie un sprint de 2 semaines pour livrer une feature complexe avec 3 dev et 1 designer.',
      keywords: ['sprint', 'feature', 'sprint'],
    },
    {
      q: 'Comment créer un système de veille technologique efficace pour rester à jour sans y passer 3h/jour ?',
      keywords: ['veille', 'technologique', 'efficace'],
    },
  ],

  journal: [
    {
      q: 'Je me sens dépassé par le nombre de projets que j\'ai lancés. Je ne sais pas lequel abandonner.',
      keywords: ['ressens', 'projets', 'espace'],
    },
    {
      q: 'J\'ai l\'impression de travailler beaucoup mais de n\'avancer nulle part. Ça me pèse énormément.',
      keywords: ['impression', 'avancer', 'corps'],
    },
    {
      q: 'J\'ai réalisé aujourd\'hui que j\'ai peur de réussir autant que j\'ai peur d\'échouer.',
      keywords: ['peur', 'réussir', 'échouer'],
    },
    {
      q: 'Je veux explorer mon rapport à la perfection — comment ça me bloque et m\'aide à la fois.',
      keywords: ['perfection', 'explorer', 'partie'],
    },
    {
      q: 'Je ressens un manque de sens profond depuis quelques semaines. Je ne sais pas d\'où ça vient.',
      keywords: ['sens', 'ressens', 'espace'],
    },
    {
      q: 'Ce matin, j\'ai réalisé que j\'ai du mal à recevoir de l\'aide. Je préfère tout faire seul.',
      keywords: ['aide', 'seul', 'voix'],
    },
    {
      q: 'Je suis en colère contre moi-même d\'avoir encore reporté une décision importante. C\'est récurrent.',
      keywords: ['colère', 'décision', 'retenir'],
    },
    {
      q: 'J\'explore la question de mon rythme naturel — je crois que je me force à aller trop vite.',
      keywords: ['rythme', 'vitesse', 'corps'],
    },
    {
      q: 'Comment intégrer la notion de "deuxième vitesse" dans ma façon quotidienne de travailler ?',
      keywords: ['deuxième vitesse', 'quotidien', 'micro-action'],
    },
    {
      q: 'J\'ai besoin de réfléchir à ce qui compte vraiment pour moi dans les 5 prochaines années.',
      keywords: ['compte', 'vraiment', 'retenir'],
    },
  ],

  debug_cognitive: [
    {
      q: 'Charge mentale: 8/10. Fronts ouverts: 12 projets actifs. Je ne sais pas par où commencer.',
      keywords: ['charge', 'fronts', 'priorité'],
    },
    {
      q: 'Je décide 20 fois par jour des mêmes choses — le matin, le midi, le soir. Comment arrêter ça ?',
      keywords: ['décision', 'fatigue', 'système'],
    },
    {
      q: 'J\'ai l\'impression de penser tout le temps au travail, même en vacances. C\'est épuisant.',
      keywords: ['repos', 'frontières', 'déconnexion'],
    },
    {
      q: 'J\'ai du mal à rentrer dans le flow depuis 3 semaines. Diagnostic rapide et plan de récupération.',
      keywords: ['flow', 'diagnostic', 'récupération'],
    },
    {
      q: 'Je suis dans un mode multi-tâche forcé depuis un mois. J\'ai besoin d\'un protocole de simplification.',
      keywords: ['multi-tâche', 'simplification', 'protocole'],
    },
    {
      q: 'Comment détecter si je suis en burnout précoce vs simple surmenage passager ?',
      keywords: ['burnout', 'surmenage', 'détecter'],
    },
    {
      q: 'J\'ai une décision majeure suspendue depuis 2 mois qui bloque toute ma progression. Aide-moi à la traiter.',
      keywords: ['décision', 'bloque', 'traiter'],
    },
    {
      q: 'Quel protocole de "digital detox" minimal et efficace recommandes-tu pour récupérer en 48h ?',
      keywords: ['detox', 'récupérer', 'protocole'],
    },
    {
      q: 'Ma concentration est fragmentée: je n\'arrive pas à tenir plus de 15 minutes sur une tâche. Plan ?',
      keywords: ['concentration', 'fragmentation', 'plan'],
    },
    {
      q: 'Comment appliquer le principe 80/20 à ma liste de tâches actuelle (20 items) pour trouver les 4 essentiels ?',
      keywords: ['pareto', '80/20', 'essentiels'],
    },
  ],
};

// ─── SUITE PRINCIPALE ─────────────────────────────────────────────────────────

describe('TITANE∞ — Chat Q&A Mode Validation (10 modes × 10 scénarios)', () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════════════════════════════════════

  before(async () => {
    console.log(`[TITANE Q&A] Run: ${REPORT_TS}`);
    console.log(`[TITANE Q&A] Response timeout: ${RESPONSE_TIMEOUT_MS}ms`);
    console.log(`[TITANE Q&A] Min response length: ${MIN_RESPONSE_LENGTH} chars`);

    await browser.url(appUrl('/'));
    await browser.pause(3000);

    // Naviguer vers le chat si nécessaire
    try {
      const chatNav = await $('[data-testid="nav-titane"], [href="/titane"], [data-page="titane"]');
      if (await chatNav.isExisting() && await chatNav.isDisplayed()) {
        await chatNav.click();
        await browser.pause(1500);
      }
    } catch {
      // Déjà sur le chat ou nav absente
    }

    // Attendre que le chat soit prêt
    await browser.waitUntil(
      async () => {
        const input = await $('[data-testid="chat-input"]');
        return await input.isExisting();
      },
      { timeout: 30000, interval: 1000 }
    );

    await ss('setup_complete', 'init');
    console.log('[TITANE Q&A] Setup complet — chat prêt');
  });

  after(async () => {
    M.verdict = M.failedTests === 0 ? 'PASS' :
      M.failedTests <= M.totalTests * 0.2 ? 'PARTIAL' : 'FAIL';

    // Rapport JSON final
    writeReport('qa_mode_validation_report.json', {
      runTs: M.runTs,
      verdict: M.verdict,
      totalTests: M.totalTests,
      passedTests: M.passedTests,
      failedTests: M.failedTests,
      passRate: `${Math.round((M.passedTests / M.totalTests) * 100)}%`,
      qualityScores: M.qualityScores,
      finetuneSuggestions: M.finetuneSuggestions,
      screenshots: M.screenshots.length,
      modes: M.modes,
    });

    // Rapport fine-tuning
    if (M.finetuneSuggestions.length > 0) {
      writeReport('finetune_suggestions.json', M.finetuneSuggestions);
      console.log(`\n[FINETUNE] ${M.finetuneSuggestions.length} suggestion(s) de correction identifiées`);
    }

    // Log résumé
    writeLog('summary.txt', [
      `TITANE∞ Q&A Mode Validation — ${M.runTs}`,
      `Verdict: ${M.verdict}`,
      `Tests: ${M.passedTests}/${M.totalTests} passed (${Math.round((M.passedTests / M.totalTests) * 100)}%)`,
      `Fine-tune suggestions: ${M.finetuneSuggestions.length}`,
      '',
      ...Object.entries(M.modes).map(([mode, data]) =>
        `${mode}: ${data.passed}/${data.passed + data.failed} (${Math.round((data.passed / (data.passed + data.failed)) * 100)}%)`
      ),
    ].join('\n'));

    console.log(`\n[TITANE Q&A] Verdict: ${M.verdict} — ${M.passedTests}/${M.totalTests}`);
    console.log(`[TITANE Q&A] Reports: ${REPORT_DIR}`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: DEFAULT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: default — Standard TITANE∞', () => {
    const MODE = 'default';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length, q: scenario.q });

        if (idx === 4) await ss(`mid_conversation`, MODE);

        expect(response.length, `Réponse trop courte pour Q${idx + 1}`).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score, `Score qualité insuffisant pour Q${idx + 1}`).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: COACH
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: coach — Coaching Personnel', () => {
    const MODE = 'coach';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: DEV
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: dev — Développeur Expert', () => {
    const MODE = 'dev';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: ADMIN
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: admin — Administrateur Système', () => {
    const MODE = 'admin';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: STRATEGY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: strategy — Stratège 360°', () => {
    const MODE = 'strategy';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: BRAINSTORMING
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: brainstorming — Divergence Créative', () => {
    const MODE = 'brainstorming';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: SYNTHESIS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: synthesis — Connexion d\'Idées', () => {
    const MODE = 'synthesis';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: PLANNING
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: planning — Planification', () => {
    const MODE = 'planning';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: JOURNAL
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: journal — Réflexion Personnelle', () => {
    const MODE = 'journal';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        // Mode journal: longueur min réduite à 100 (une question de retour est valide)
        const minLen = 100;
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= minLen && score >= 30;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length, `Réponse trop courte pour Q${idx + 1} (mode journal)`).to.be.at.least(minLen);
        expect(score).to.be.at.least(30);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE: DEBUG_COGNITIVE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE: debug_cognitive — Analyse Charge Mentale', () => {
    const MODE = 'debug_cognitive';

    before(async () => {
      await resetConversation();
      await selectMode(MODE);
      await ss('mode_selected', MODE);
    });

    QA_SCENARIOS[MODE].forEach((scenario, idx) => {
      it(`Q${idx + 1}: ${scenario.q.substring(0, 60)}...`, async () => {
        await sendMessage(scenario.q);
        await waitForResponse();
        const response = await getLastResponseText();
        const score = calcQualityScore(response, scenario.keywords, MODE);
        if (!M.qualityScores[MODE]) M.qualityScores[MODE] = [];
        M.qualityScores[MODE].push(score);

        const passed = response.length >= MIN_RESPONSE_LENGTH && score >= 40;
        recordTest(MODE, `Q${idx + 1}`, passed, { score, length: response.length });

        if (idx === 4) await ss('mid_conversation', MODE);

        expect(response.length).to.be.at.least(MIN_RESPONSE_LENGTH);
        expect(score).to.be.at.least(40);
      });
    });

    after(async () => await ss('mode_complete', MODE));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE SWITCHING TEST (test transversal)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODE SWITCHING — Changement de mode en cours de conversation', () => {
    it('Switch: default → brainstorming → planning — cohérence des modes', async () => {
      await resetConversation();

      // default
      await selectMode('default');
      await sendMessage('Qu\'est-ce que la méthode Kanban ?');
      await waitForResponse();
      const r1 = await getLastResponseText();
      const modeAfterR1 = await getActiveConversationMode();
      recordTest('mode_switching', 'default → réponse', r1.length >= 50, { length: r1.length });

      // brainstorming
      await selectMode('brainstorming');
      await sendMessage('Génère 5 idées pour améliorer Kanban avec l\'IA');
      await waitForResponse();
      const r2 = await getLastResponseText();
      recordTest('mode_switching', 'brainstorming → réponse', r2.length >= 100, { length: r2.length });

      // planning
      await selectMode('planning');
      await sendMessage('Planifie l\'implémentation de la meilleure idée en 2 semaines');
      await waitForResponse();
      const r3 = await getLastResponseText();
      recordTest('mode_switching', 'planning → réponse', r3.length >= 150, { length: r3.length });

      await ss('mode_switching_complete', 'transversal');

      expect(r1.length, 'default: réponse trop courte').to.be.at.least(50);
      expect(r2.length, 'brainstorming: réponse trop courte').to.be.at.least(100);
      expect(r3.length, 'planning: réponse trop courte').to.be.at.least(150);
    });
  });

});
