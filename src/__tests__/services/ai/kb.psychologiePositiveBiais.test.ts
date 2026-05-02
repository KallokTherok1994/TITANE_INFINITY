/**
 * KB Phase 40 — Tests Vitest
 * psychologie_positive_bien_etre (v31.5.11) + cognition_sociale_biais_cognitifs (v31.5.12)
 * Rule 16 compliant: tests créés dans le même commit que la modification.
 */

import ppbRaw from '../../../../data/knowledge_base/default/psychologie_positive_bien_etre.json';
import csbRaw from '../../../../data/knowledge_base/default/cognition_sociale_biais_cognitifs.json';

const text = (obj: unknown): string => JSON.stringify(obj);

// ─── Fixtures ────────────────────────────────────────────────────────────────
const ppb = ppbRaw as Record<string, unknown>;
const csb = csbRaw as Record<string, unknown>;

// ─── psychologie_positive_bien_etre ──────────────────────────────────────────
describe('KB psychologie_positive_bien_etre (v31.5.11)', () => {
  it('version v31.5.11', () => {
    expect(ppb.version).toBe('v31.5.11');
  });

  it('contient 7 sections', () => {
    expect(Object.keys(ppb.sections as object)).toHaveLength(7);
  });

  it('a au moins 50 retrieval_triggers', () => {
    expect((ppb.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(50);
  });

  // PERMA & Seligman
  it('contient le modèle PERMA', () => {
    expect(text(ppb)).toMatch(/PERMA/);
  });
  it('contient Seligman', () => {
    expect(text(ppb)).toMatch(/Seligman/);
  });
  it('contient 5 piliers PERMA (Positive Emotions, Engagement, Relationships, Meaning, Accomplishment)', () => {
    expect(text(ppb)).toMatch(
      /Positive Emotions|Engagement|Relationships|Meaning|Accomplishment/
    );
  });
  it('contient learned helplessness / résignation apprise', () => {
    expect(text(ppb)).toMatch(/[Ll]earned [Hh]elplessness|r[eé]signation apprise/);
  });
  it('contient les 3P (permanence, pervasiveness, personnalisation)', () => {
    expect(text(ppb)).toMatch(/permanence/);
  });
  it('contient Snyder et Hope Theory', () => {
    expect(text(ppb)).toMatch(/Snyder/);
  });

  // Forces VIA
  it('contient VIA Classification', () => {
    expect(text(ppb)).toMatch(/VIA/);
  });
  it('contient Peterson', () => {
    expect(text(ppb)).toMatch(/Peterson/);
  });
  it('contient les 6 vertus VIA', () => {
    expect(text(ppb)).toMatch(
      /Sagesse|Courage|Humanit[eé]|Justice|Temp[eé]rance|Transcendance/
    );
  });
  it('contient 24 forces de caractère', () => {
    expect(text(ppb)).toMatch(/24 forces/);
  });

  // Broaden-and-Build
  it('contient Broaden-and-Build Fredrickson', () => {
    expect(text(ppb)).toMatch(/Broaden-and-Build/);
  });
  it('contient Fredrickson', () => {
    expect(text(ppb)).toMatch(/Fredrickson/);
  });
  it('contient émotions positives élargissent', () => {
    expect(text(ppb)).toMatch(/[Ee]motion|[Ee]motions/);
  });

  // Gratitude
  it('contient gratitude Emmons & McCullough', () => {
    expect(text(ppb)).toMatch(/Emmons/);
  });
  it('contient journal de gratitude / 3 bonnes choses', () => {
    expect(text(ppb)).toMatch(/journal de gratitude|3 bonnes choses/);
  });
  it('contient lettre de gratitude', () => {
    expect(text(ppb)).toMatch(/[Ll]ettre de gratitude/);
  });

  // Savoring
  it('contient savoring Bryant', () => {
    expect(text(ppb)).toMatch(/[Ss]avoring/);
  });

  // Flow
  it('contient flow Csikszentmihalyi', () => {
    expect(text(ppb)).toMatch(/Csikszentmihalyi/);
  });
  it('contient les 8 conditions du flow', () => {
    expect(text(ppb)).toMatch(
      /8 conditions|challenge.{1,30}comp[eé]tence|d[eé]fi.{1,30}comp[eé]tence/
    );
  });
  it('contient boredom vs anxiety → flow channel', () => {
    expect(text(ppb)).toMatch(/[Bb]oredom|[Aa]nxiety|flow channel/);
  });

  // Self-Determination Theory
  it('contient Self-Determination Theory Ryan Deci', () => {
    expect(text(ppb)).toMatch(/Self-Determination Theory/);
  });
  it('contient Ryan et Deci', () => {
    expect(text(ppb)).toMatch(/Ryan/);
    expect(text(ppb)).toMatch(/Deci/);
  });
  it('contient les 3 besoins SDT', () => {
    expect(text(ppb)).toMatch(/[Aa]utonomie|[Cc]ompétence|[Aa]ppartenance/);
  });
  it('contient effet de surjustification Lepper', () => {
    expect(text(ppb)).toMatch(/surjustification|Lepper/);
  });

  // Résilience
  it('contient résilience Bonanno', () => {
    expect(text(ppb)).toMatch(/Bonanno/);
  });
  it('contient croissance post-traumatique Tedeschi', () => {
    expect(text(ppb)).toMatch(/Tedeschi/);
  });
  it('contient PTG (post-traumatic growth)', () => {
    expect(text(ppb)).toMatch(/PTG|post-traumatic growth|croissance post-traumatique/);
  });
  it('contient 5 domaines PTG', () => {
    expect(text(ppb)).toMatch(/nouvelles possibilit[eé]s|force personnelle/);
  });

  // Mindfulness
  it('contient MBSR Kabat-Zinn', () => {
    expect(text(ppb)).toMatch(/MBSR/);
  });
  it('contient Kabat-Zinn', () => {
    expect(text(ppb)).toMatch(/Kabat-Zinn/);
  });
  it('contient MBCT (Mindfulness-Based Cognitive Therapy)', () => {
    expect(text(ppb)).toMatch(/MBCT/);
  });
  it('contient modifications cérébrales mindfulness', () => {
    expect(text(ppb)).toMatch(/insulaire|cingulaire|amygdale/);
  });

  // Auto-compassion
  it('contient auto-compassion Neff', () => {
    expect(text(ppb)).toMatch(/Neff/);
  });
  it('contient les 3 composantes auto-compassion', () => {
    expect(text(ppb)).toMatch(/kindness|common humanity|mindfulness/);
  });
  it('contient SCS (Self-Compassion Scale)', () => {
    expect(text(ppb)).toMatch(/SCS/);
  });

  // Lien social
  it('contient Harvard Study of Adult Development Vaillant', () => {
    expect(text(ppb)).toMatch(/Vaillant|Harvard Study/);
  });
  it('contient solitude = 15 cigarettes', () => {
    expect(text(ppb)).toMatch(/15 cigarettes|Holt-Lunstad/);
  });
  it('contient ocytocine', () => {
    expect(text(ppb)).toMatch(/ocytocine|[Oo]xytocine/);
  });

  // Altruisme
  it('contient prosocial spending Dunn Aknin', () => {
    expect(text(ppb)).toMatch(/Dunn|Aknin|prosocial spending/);
  });
  it("contient helper's high", () => {
    expect(text(ppb)).toMatch(/[Hh]elper.{0,5}high/);
  });
  it('contient compassion vs empathie', () => {
    expect(text(ppb)).toMatch(
      /fatigue compassionnelle|compassion.{1,50}empathie|empathie.{1,50}compassion/
    );
  });
});

// ─── cognition_sociale_biais_cognitifs ───────────────────────────────────────
describe('KB cognition_sociale_biais_cognitifs (v31.5.12)', () => {
  it('version v31.5.12', () => {
    expect(csb.version).toBe('v31.5.12');
  });

  it('contient 7 sections', () => {
    expect(Object.keys(csb.sections as object)).toHaveLength(7);
  });

  it('a au moins 45 retrieval_triggers', () => {
    expect((csb.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(45);
  });

  // Système 1 & 2
  it('contient théorie des systèmes duaux Kahneman', () => {
    expect(text(csb)).toMatch(/Kahneman/);
  });
  it('contient Système 1 et Système 2', () => {
    expect(text(csb)).toMatch(/Syst[eè]me 1|System 1/);
    expect(text(csb)).toMatch(/Syst[eè]me 2|System 2/);
  });
  it('contient Thinking Fast and Slow', () => {
    expect(text(csb)).toMatch(/Thinking Fast and Slow/);
  });

  // Heuristiques Tversky
  it('contient Tversky et Kahneman prix Nobel', () => {
    expect(text(csb)).toMatch(/Tversky/);
  });
  it('contient heuristique de disponibilité', () => {
    expect(text(csb)).toMatch(/[Dd]isponibilit[eé]/);
  });
  it('contient heuristique de représentativité', () => {
    expect(text(csb)).toMatch(/[Rr]eprésentativit[eé]|[Rr]epresentativit/);
  });
  it('contient ancrage', () => {
    expect(text(csb)).toMatch(/[Aa]ncrage/);
  });
  it('contient affect heuristic', () => {
    expect(text(csb)).toMatch(/[Aa]ffect heuristic/);
  });

  // Biais cognitifs
  it('contient biais de confirmation Wason', () => {
    expect(text(csb)).toMatch(/Wason/);
  });
  it('contient contre-mesures biais confirmation', () => {
    expect(text(csb)).toMatch(/devil.{0,10}advocate|pr[eé]-mortem|consider the opposite/);
  });
  it('contient effet Dunning-Kruger 1999', () => {
    expect(text(csb)).toMatch(/Dunning-Kruger/);
  });
  it('contient Mount Stupid / Pic de stupidité', () => {
    expect(text(csb)).toMatch(/Mount Stupid|Pic de [Ss]tupidité/);
  });
  it('contient biais rétrospectif hindsight', () => {
    expect(text(csb)).toMatch(/hindsight bias|r[eé]trospectif/);
  });
  it("contient biais d'autocomplaisance self-serving", () => {
    expect(text(csb)).toMatch(/self-serving/);
  });
  it('contient loss aversion Kahneman/Tversky', () => {
    expect(text(csb)).toMatch(/loss aversion/);
  });
  it('contient effet de halo', () => {
    expect(text(csb)).toMatch(/[Hh]alo/);
  });

  // Attribution
  it("contient erreur fondamentale d'attribution Ross", () => {
    expect(text(csb)).toMatch(/Ross/);
  });
  it("contient erreur fondamentale d'attribution", () => {
    expect(text(csb)).toMatch(/erreur fondamentale|FAE/);
  });
  it('contient biais acteur-observateur', () => {
    expect(text(csb)).toMatch(/acteur-observateur/);
  });

  // Formation d'impression
  it("contient formation d'impression Asch warm/cold", () => {
    expect(text(csb)).toMatch(/Asch/);
  });
  it('contient effet de primauté et récence', () => {
    expect(text(csb)).toMatch(/primauit[eé]|primaut[eé]|r[eé]cence/);
  });
  it('contient schema social', () => {
    expect(text(csb)).toMatch(/[Ss]chema social|[Ss]chéma social/);
  });

  // Théorie de l'esprit
  it('contient Theory of Mind ToM', () => {
    expect(text(csb)).toMatch(/Theory of Mind|ToM/);
  });
  it('contient false-belief task Wimmer Perner', () => {
    expect(text(csb)).toMatch(/Wimmer|Perner|false-belief/);
  });
  it('contient Baron-Cohen mindblindness TSA', () => {
    expect(text(csb)).toMatch(/Baron-Cohen/);
  });
  it('contient mentalisation Fonagy', () => {
    expect(text(csb)).toMatch(/Fonagy/);
  });

  // Neurones miroirs / empathie
  it('contient neurones miroirs Rizzolatti', () => {
    expect(text(csb)).toMatch(/Rizzolatti/);
  });
  it('contient empathie affective vs cognitive', () => {
    expect(text(csb)).toMatch(/empathie affective|empathie cognitive/);
  });
  it('contient TPJ (temporo-parietal junction)', () => {
    expect(text(csb)).toMatch(/TPJ/);
  });

  // Stéréotypes / préjugés
  it('contient Tajfel et Turner catégorisation sociale', () => {
    expect(text(csb)).toMatch(/Tajfel/);
  });
  it('contient minimal group paradigm', () => {
    expect(text(csb)).toMatch(/[Mm]inimal group|paradigme minimal/);
  });
  it('contient menace du stéréotype Steele Aronson', () => {
    expect(text(csb)).toMatch(/Steele/);
  });
  it('contient IAT (Implicit Association Test)', () => {
    expect(text(csb)).toMatch(/IAT/);
  });

  // Milgram / Asch / conformisme
  it('contient Milgram 65% chocs 450V', () => {
    expect(text(csb)).toMatch(/Milgram/);
  });
  it("contient obéissance à l'autorité", () => {
    expect(text(csb)).toMatch(/ob[eé]issance/);
  });
  it('contient Asch conformisme', () => {
    expect(text(csb)).toMatch(/conformisme|conformit[eé]/);
  });
  it('contient conformisme normatif vs informationnel', () => {
    expect(text(csb)).toMatch(/normatif|informationnel/);
  });

  // Dissonance cognitive
  it('contient dissonance cognitive Festinger 1957', () => {
    expect(text(csb)).toMatch(/Festinger/);
  });
  it('contient insufficient justification', () => {
    expect(text(csb)).toMatch(/[Ii]nsufficient justification|justification insuffisante/);
  });
  it('contient Cialdini 6 principes', () => {
    expect(text(csb)).toMatch(/Cialdini/);
  });
  it('contient réciprocité, cohérence, preuve sociale, rareté', () => {
    expect(text(csb)).toMatch(/r[eé]ciprocit[eé]|preuve sociale|raret[eé]/);
  });

  // Nudge
  it('contient nudge Thaler Sunstein', () => {
    expect(text(csb)).toMatch(/Thaler/);
  });
  it('contient architecture du choix', () => {
    expect(text(csb)).toMatch(/architecture du choix|architecture de choix/);
  });
  it('contient opt-in par défaut', () => {
    expect(text(csb)).toMatch(/opt-in|default opt/);
  });
  it('contient paternalisme libéral', () => {
    expect(text(csb)).toMatch(/[Pp]aternalisme lib[eé]ral/);
  });

  // Groupthink
  it('contient groupthink Janis', () => {
    expect(text(csb)).toMatch(/Janis/);
  });
  it("contient illusion d'invulnérabilité", () => {
    expect(text(csb)).toMatch(/invulnérabilit[eé]|invulnerabilit/);
  });
  it('contient exemples Challenger / Baie des Cochons', () => {
    expect(text(csb)).toMatch(/Challenger|Baie des Cochons/);
  });

  // Polarisation
  it('contient polarisation de groupe Moscovici Zavalloni', () => {
    expect(text(csb)).toMatch(/Moscovici/);
  });
  it('contient echo chambers réseaux sociaux', () => {
    expect(text(csb)).toMatch(/echo chambers|[Ee]cho [Cc]hambers/);
  });
});
