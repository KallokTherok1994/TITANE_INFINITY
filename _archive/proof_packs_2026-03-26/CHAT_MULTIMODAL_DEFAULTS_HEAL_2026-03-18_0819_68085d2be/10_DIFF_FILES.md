src/core/prompts/providers.ts | 20 ++++++++++----------
src/services/ai/responsePolicy.ts | 10 ++++++----
src/utils/APISupport.ts | 7 +++++--
3 files changed, 21 insertions(+), 16 deletions(-)

diff --git a/src/core/prompts/providers.ts b/src/core/prompts/providers.ts
index fb5c06dd6..562cb259e 100644
--- a/src/core/prompts/providers.ts
+++ b/src/core/prompts/providers.ts
@@ -8,38 +8,38 @@ import type { Provider, ProviderOverride } from './types';
export const providerOverrides: Record<Provider, ProviderOverride> = {
'titane-local': {
instructions:

-      'Réponses compactes (<= 400 tokens). Respecte strictement les listes demandées. Utilise le style TITANE∞ même hors connexion.',
- maxTokens: 400,

*      'Réponses développées. Utilise le style TITANE∞ même hors connexion.',
* maxTokens: 800,
  temperature: 0.4,
  },
  tauri: {
  instructions:

-      'Tu exécutes dans un environnement Tauri sandbox. Pas d’URLs externes, pas de code non sollicité. Reste concis.',
- maxTokens: 600,

*      'Tu exécutes dans un environnement Tauri sandbox. Pas d’URLs externes, pas de code non sollicité.',
* maxTokens: 1200,
  temperature: 0.5,
  },
  openai: {
  instructions:

-      'Modèle GPT-5.1-Codex (Preview). Utilise sections claires, max 800 tokens. Respecte les JSON Schema fournis quand demandé.',
- maxTokens: 800,

*      'Modèle GPT-5.1-Codex (Preview). Utilise sections claires. Respecte les JSON Schema fournis quand demandé.',
* maxTokens: 1800,
  temperature: 0.55,
  },
  claude: {
  instructions:
  'Claude Opus préfère les paragraphes courts. Limite-toi à 4 paragraphes + listes nécessaires. Évite la redondance.',

- maxTokens: 900,

* maxTokens: 1800,
  temperature: 0.5,
  },
  gemini: {
  instructions:
  'Gemini Advance : explicite les étapes internes (raisonnement) uniquement si demandé. Sinon, structure réponse en sections + puces.',

- maxTokens: 750,

* maxTokens: 1500,
  temperature: 0.6,
  },
  ollama: {
  instructions:

-      'Modèle local (Ollama). Reste < 500 tokens, privilégie phrases courtes, pas de markdown complexe.',
- maxTokens: 500,

*      'Modèle local (Ollama). Privilégie phrases courtes, pas de markdown complexe.',
* maxTokens: 1200,
  temperature: 0.4,
  },
  };
  diff --git a/src/services/ai/responsePolicy.ts b/src/services/ai/responsePolicy.ts
  index e899c5abc..47950d06c 100644
  --- a/src/services/ai/responsePolicy.ts
  +++ b/src/services/ai/responsePolicy.ts
  @@ -156,8 +156,8 @@ export const RESPONSE_PROFILES: Record<ResponseProfileId, ResponseProfile> = {
  temperature: 0.7,
  reasoningEffort: 'medium',
  structureLevel: 1,

- clarificationThreshold: 0.6,
- inferenceAggression: 0.6,

* clarificationThreshold: 0.72, // raised: ask less often, infer more
* inferenceAggression: 0.72, // raised: stronger intent deduction by default
  memory: {
  injectSTM: true,
  injectLTM: false,
  @@ -423,8 +423,10 @@ export function selectResponseProfile(
  };
  }

- // Règle 7 : Message très court + mode BALANCED → DIRECT
- if (msgLen < 30 && modeDefault === 'BALANCED') {

* // Règle 7 : Message très court (≤ 8 chars) + mode BALANCED → DIRECT
* // Seuls les messages ultra-minimaux (ex: "ok", "oui") déclenchent DIRECT.
* // Les messages plus longs reçoivent BALANCED même sans signal explicite.
* if (msgLen <= 8 && modeDefault === 'BALANCED') {
  return {
  profileId: 'DIRECT',
  profile: RESPONSE_PROFILES.DIRECT,
  diff --git a/src/utils/APISupport.ts b/src/utils/APISupport.ts
  index 542b030e6..442e08448 100644
  --- a/src/utils/APISupport.ts
  +++ b/src/utils/APISupport.ts
  @@ -39,7 +39,9 @@ export const APISupport = {
  async hasMicrophone(): Promise<boolean> {
  try {
  const devices = await navigator.mediaDevices.enumerateDevices();

-      return devices.some(d => d.kind === 'audioinput' && d.label !== '');

*      // Labels are empty before permission is granted (browser security policy).
*      // Presence check: kind match is sufficient to detect hardware availability.
*      return devices.some(d => d.kind === 'audioinput');
       } catch {
         return false;
       }
  @@ -51,7 +53,8 @@ export const APISupport = {
  async hasCamera(): Promise<boolean> {
  try {
  const devices = await navigator.mediaDevices.enumerateDevices();

-      return devices.some(d => d.kind === 'videoinput' && d.label !== '');

*      // Labels are empty before permission is granted; check kind only.
*      return devices.some(d => d.kind === 'videoinput');
  } catch {
  return false;
  }
