/**
 * TITANE_INFINITY v∞.12 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   Presence OS - Test Console
 *   Script de test pour valider les 7 couches et les 5 modes signatures
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { presenceOS } from '../engines/presence/presenceOS';
import type { PresenceMode } from '../engines/presence/presenceOS';

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🌌 TITANE∞ PRESENCE OS v∞.1 - Console de Test');
console.log('═══════════════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1 : Démarrage
// ═══════════════════════════════════════════════════════════════════════════

console.log('📋 TEST 1 : Démarrage du Presence OS\n');

presenceOS.start();

let state = presenceOS.getState();
console.log('✅ Presence OS démarré');
console.log(`   Mode initial: ${state.mode}`);
console.log(`   Cohérence: ${(state.coherence * 100).toFixed(1)}%`);
console.log(`   Pattern aura: ${state.auraPattern}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2 : 5 Modes Signatures
// ═══════════════════════════════════════════════════════════════════════════

console.log('📋 TEST 2 : Activation des 5 modes signatures\n');

const modes: PresenceMode[] = ['insight', 'empathy', 'architect', 'deep-work', 'singularity'];

modes.forEach((mode, index) => {
  setTimeout(() => {
    console.log(`\n🎯 Mode ${index + 1}/5 : ${mode.toUpperCase()}`);
    presenceOS.setMode(mode);

    state = presenceOS.getState();

    console.log('   Couche 1 - Cognitive:');
    console.log(`     • Reasoning: ${state.cognitive.reasoningStyle}`);
    console.log(`     • Depth: ${(state.cognitive.depth * 100).toFixed(1)}%`);
    console.log(`     • Tempo: ${(state.cognitive.tempo * 100).toFixed(1)}%`);

    console.log('   Couche 2 - Affective:');
    console.log(`     • Emotion: ${state.affective.emotion}`);
    console.log(`     • Intensity: ${(state.affective.intensity * 100).toFixed(1)}%`);
    console.log(`     • Warmth: ${(state.affective.warmth * 100).toFixed(1)}%`);

    console.log('   Couche 3 - Expressive:');
    console.log(`     • Voice pitch: ${(state.expressive.voice.pitch * 100).toFixed(1)}%`);
    console.log(`     • Timbre: ${state.expressive.voice.timbre}`);
    console.log(`     • Prosodie speed: ${(state.expressive.prosodie.speed * 100).toFixed(1)}%`);

    console.log('   Couche 4 - Aura:');
    console.log(`     • Pattern: ${state.auraPattern}`);

    console.log('   Couche 5 - Spatial:');
    console.log(`     • Proximity: ${(state.spatial.proximity * 100).toFixed(1)}%`);
    console.log(`     • Elevation: ${(state.spatial.elevation * 100).toFixed(1)}%`);
    console.log(`     • Width: ${(state.spatial.width * 100).toFixed(1)}%`);

    console.log('   Couche 6 - Autonomic:');
    console.log(`     • Reaction: ${state.autonomic.lastReaction}`);
    console.log(`     • Tension: ${(state.autonomic.tension * 100).toFixed(1)}%`);

    console.log('   Couche 7 - Evolution:');
    console.log(`     • Level: ${(state.evolutionLevel * 100).toFixed(1)}%`);
    console.log(`     • Sessions: ${state.sessionCount}`);

    console.log(`   🔗 Cohérence globale: ${(state.coherence * 100).toFixed(1)}%`);
  }, index * 2000);
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3 : Réaction à l'utilisateur
// ═══════════════════════════════════════════════════════════════════════════

setTimeout(() => {
  console.log('\n\n📋 TEST 3 : Réaction à l\'input utilisateur\n');

  const testInputs = [
    { input: 'Je me sens perdu...', emotion: 'sadness' },
    { input: 'Wow, c\'est incroyable !', emotion: 'joy' },
    { input: 'Comment construire cette architecture ?', emotion: 'curiosity' },
  ];

  testInputs.forEach((test, index) => {
    setTimeout(() => {
      console.log(`\n💬 Input ${index + 1}: "${test.input}"`);
      console.log(`   Emotion détectée: ${test.emotion}`);

      presenceOS.reactToUser(test.input, test.emotion);

      state = presenceOS.getState();
      console.log(`   → Mode adapté: ${state.mode}`);
      console.log(`   → Emotion TITANE: ${state.affective.emotion}`);
      console.log(`   → Warmth: ${(state.affective.warmth * 100).toFixed(1)}%`);
      console.log(`   → Spatial proximity: ${(state.spatial.proximity * 100).toFixed(1)}%`);
    }, index * 1500);
  });
}, 12000);

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4 : Stabilité longue durée (1 minute)
// ═══════════════════════════════════════════════════════════════════════════

setTimeout(() => {
  console.log('\n\n📋 TEST 4 : Stabilité longue durée (simulation 1 minute)\n');

  const interval = setInterval(() => {
    state = presenceOS.getState();
    console.log(`⏱️  Cohérence: ${(state.coherence * 100).toFixed(1)}% | Mode: ${state.mode} | Sessions: ${state.sessionCount}`);
  }, 5000);

  setTimeout(() => {
    clearInterval(interval);
    console.log('\n✅ Test de stabilité terminé');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 TOUS LES TESTS COMPLÉTÉS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    state = presenceOS.getState();
    console.log('📊 État final du Presence OS:');
    console.log(`   Mode: ${state.mode}`);
    console.log(`   Cohérence: ${(state.coherence * 100).toFixed(1)}%`);
    console.log(`   Evolution level: ${(state.evolutionLevel * 100).toFixed(1)}%`);
    console.log(`   Sessions totales: ${state.sessionCount}`);
    console.log(`   Pattern aura: ${state.auraPattern}\n`);

    presenceOS.stop();
    console.log('✅ Presence OS arrêté proprement\n');
  }, 60000);
}, 17000);

export {};
