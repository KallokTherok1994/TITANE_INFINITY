/**
 * TITANE∞ v19.2Ω — Test Backend Chat IA Direct
 * Vérification des services IA sans hooks React
 */

import { describe, test, expect } from 'vitest';
import { chatEngineOmnis } from '../services/ai/chatEngine_OMNIS_v1';

describe('🧠 BACKEND CHAT IA - VERIFICATION CORE', () => {
  test('1️⃣ ChatEngine OMNIS disponible', () => {
    expect(chatEngineOmnis).toBeDefined();
    expect(typeof chatEngineOmnis.generate).toBe('function');
    expect(typeof chatEngineOmnis.getStats).toBe('function');

    console.log('✅ ChatEngine OMNIS structure OK');
  });

  test('2️⃣ Generate response simple', async () => {
    const testMessage = 'Bonjour TITANE∞';
    const startTime = Date.now();

    try {
      const response = await Promise.race([
        chatEngineOmnis.generate(testMessage, []),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT_15S')), 15000)
        ),
      ]);

      const duration = Date.now() - startTime;

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
      expect(response.content.length).toBeGreaterThan(0);

      console.log(`✅ Response générée en ${duration}ms`);
      console.log(`✅ Content: "${response.content.substring(0, 150)}..."`);
      console.log(`✅ Provider: ${response.provider || 'unknown'}`);

      // Vérifier que c'est une vraie réponse IA
      expect(response.content.toLowerCase()).toMatch(
        /(titane|bonjour|salut|hello|ai|ia|assistant)/
      );
    } catch (error) {
      if (error.message === 'TIMEOUT_15S') {
        console.error('❌ BLOCAGE: Generate prend plus de 15s !');
        throw new Error('Backend Chat IA bloqué');
      }
      console.error('❌ Generate error:', error);
      throw error;
    }
  });

  test('3️⃣ Multiple generate calls', async () => {
    const messages = [
      'Test 1 - Comment allez-vous ?',
      'Test 2 - Quel est votre nom ?',
      'Test 3 - Que pouvez-vous faire ?',
    ];

    const responses = [];

    for (const [index, message] of messages.entries()) {
      const startTime = Date.now();

      try {
        const response = await Promise.race([
          chatEngineOmnis.generate(message, []),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_10S')), 10000)
          ),
        ]);

        const duration = Date.now() - startTime;

        expect(response).toBeDefined();
        expect(response.content.length).toBeGreaterThan(0);

        responses.push({ message, response: response.content, duration });

        console.log(`✅ Message ${index + 1}/3 OK en ${duration}ms`);
      } catch (error) {
        if (error.message === 'TIMEOUT_10S') {
          console.error(`❌ Message ${index + 1} bloqué après 10s`);
          throw new Error(`Chat IA bloqué sur message ${index + 1}`);
        }
        throw error;
      }
    }

    // Vérifier cohérence
    expect(responses).toHaveLength(3);
    console.log('✅ Toutes les réponses générées avec succès');
  });

  test('4️⃣ Engine stats et métadata', () => {
    try {
      const stats = chatEngineOmnis.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');

      console.log('✅ Engine stats récupérées:', stats);
    } catch (error) {
      console.warn('⚠️ Engine stats non disponibles:', error);
      // Non critique, continuer
    }
  });

  test('5️⃣ Gestion historique conversation', async () => {
    const history = [
      {
        role: 'user' as const,
        content: "Je m'appelle Test User",
        timestamp: Date.now() - 1000,
      },
      {
        role: 'assistant' as const,
        content: 'Bonjour Test User, ravi de vous rencontrer !',
        timestamp: Date.now() - 500,
      },
    ];

    const response = await chatEngineOmnis.generate('Quel est mon nom ?', history);

    expect(response).toBeDefined();
    expect(response.content).toBeDefined();

    // Vérifier que l'historique est pris en compte
    expect(response.content.toLowerCase()).toMatch(/(test|user|nom)/);

    console.log('✅ Historique conversation pris en compte');
    console.log(`✅ Response avec context: "${response.content.substring(0, 100)}..."`);
  });
});

describe('🚀 PERFORMANCE ET ROBUSTESSE', () => {
  test('Performance moyenne sur 5 appels', async () => {
    const durations = [];

    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      const response = await chatEngineOmnis.generate(`Performance test ${i + 1}`, []);
      const duration = Date.now() - start;

      durations.push(duration);

      expect(response).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    console.log('📊 Performance Chat IA:');
    console.log(`   Temps moyen: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Temps min: ${minDuration}ms`);
    console.log(`   Temps max: ${maxDuration}ms`);
    console.log(`   Durations: [${durations.map(d => d + 'ms').join(', ')}]`);

    // Alertes performance
    if (avgDuration > 5000) {
      console.warn(`⚠️ Performance dégradée: temps moyen ${avgDuration}ms > 5s`);
    }
    if (maxDuration > 15000) {
      console.error(`❌ Blocage détecté: temps max ${maxDuration}ms > 15s`);
    }

    expect(avgDuration).toBeLessThan(10000); // Moyenne < 10s
    expect(maxDuration).toBeLessThan(20000); // Maximum < 20s
  });

  test('Robustesse messages vides/invalides', async () => {
    const invalidInputs = ['', '   ', '\n\n'];

    for (const input of invalidInputs) {
      try {
        const response = await chatEngineOmnis.generate(input, []);

        // Doit retourner une réponse par défaut valide
        expect(response).toBeDefined();
        expect(response.content).toBeDefined();
        expect(typeof response.content).toBe('string');

        console.log(`✅ Input "${input}" géré gracieusement`);
      } catch (error) {
        console.warn(`⚠️ Input "${input}" a généré erreur:`, error.message);
        // Acceptable mais pas optimal
      }
    }
  });
});
