/**
 * TITANE∞ v19.2Ω — Test Direct Chat IA (Sans Mocks)
 * Vérification réelle du Chat IA sans simulation pour identifier les vrais blocages
 */

import { describe, test, expect } from 'vitest';
import { useChat } from '../hooks/useChat';

describe('🚀 CHAT IA RÉEL - VERIFICATION DIRECTE', () => {
  test('1️⃣ Hook useChat fonctionne sans crash', () => {
    try {
      const chatState = useChat();

      expect(chatState).toBeDefined();
      expect(chatState.messages).toBeDefined();
      expect(typeof chatState.sendMessage).toBe('function');
      expect(typeof chatState.isLoading).toBe('boolean');
      expect(chatState.currentMode).toBeDefined();

      console.log('✅ Hook useChat structure OK');
      console.log('✅ Messages array length:', chatState.messages.length);
      console.log('✅ Current mode:', chatState.currentMode);
      console.log('✅ Loading state:', chatState.isLoading);

    } catch (error) {
      console.error('❌ Hook useChat ERROR:', error);
      throw error;
    }
  });

  test('2️⃣ SendMessage fonction présente et callable', async () => {
    const { sendMessage } = useChat();

    expect(typeof sendMessage).toBe('function');

    // Test avec message vide (doit retourner erreur propre)
    try {
      const response = await sendMessage('');
      expect(response).toBeDefined();
      expect(response.role).toBe('assistant');
      console.log('✅ Empty message handled:', response.content.substring(0, 100));
    } catch (error) {
      console.warn('⚠️ Empty message error (acceptable):', error.message);
    }
  });

  test('3️⃣ SendMessage avec message réel', async () => {
    const { sendMessage } = useChat();

    const testMessage = 'Bonjour TITANE∞, comment allez-vous ?';
    const startTime = Date.now();

    try {
      const response = await Promise.race([
        sendMessage(testMessage),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT_10S')), 10000)
        )
      ]);

      const duration = Date.now() - startTime;

      expect(response).toBeDefined();
      expect(response.role).toBe('assistant');
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
      expect(response.content.length).toBeGreaterThan(0);

      console.log(`✅ Chat IA réponse OK en ${duration}ms`);
      console.log(`✅ Response: "${response.content.substring(0, 150)}..."`);

      // Vérifier que ce n'est pas juste une erreur
      expect(response.content).not.toMatch(/erreur|error|failed|échec/i);

    } catch (error) {
      if (error.message === 'TIMEOUT_10S') {
        console.error('❌ BLOCAGE DETECTE: SendMessage prend plus de 10s !');
        throw new Error('CHAT IA BLOQUE - Timeout 10s dépassé');
      } else {
        console.error('❌ SendMessage error:', error);
        throw error;
      }
    }
  });

  test('4️⃣ Multiple messages successifs', async () => {
    const { sendMessage } = useChat();

    const messages = [
      'Test 1',
      'Test 2',
      'Test 3'
    ];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const startTime = Date.now();

      try {
        const response = await Promise.race([
          sendMessage(message),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_5S')), 5000)
          )
        ]);

        const duration = Date.now() - startTime;

        expect(response).toBeDefined();
        expect(response.content.length).toBeGreaterThan(0);

        console.log(`✅ Message ${i+1}/${messages.length} OK en ${duration}ms`);

        // Petite pause entre messages
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        if (error.message === 'TIMEOUT_5S') {
          console.error(`❌ Message ${i+1} BLOQUE après 5s`);
          throw new Error(`Chat IA bloqué sur message ${i+1}`);
        }
        throw error;
      }
    }
  });

  test('5️⃣ Vérification state après envoi', async () => {
    const chatState = useChat();
    const initialMessageCount = chatState.messages.length;

    console.log('📊 Messages initiaux:', initialMessageCount);

    const response = await chatState.sendMessage('Test state après envoi');

    expect(response).toBeDefined();
    expect(chatState.messages.length).toBeGreaterThan(initialMessageCount);

    console.log('📊 Messages après envoi:', chatState.messages.length);
    console.log('✅ State mis à jour correctement');
  });
});

describe('🔍 ANALYSE PERFORMANCES CHAT IA', () => {
  test('Performance response time', async () => {
    const { sendMessage } = useChat();

    const measurements = [];

    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await sendMessage(`Performance test ${i + 1}`);
      const duration = Date.now() - start;
      measurements.push(duration);
    }

    const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const maxTime = Math.max(...measurements);
    const minTime = Math.min(...measurements);

    console.log('📈 Performance Chat IA:');
    console.log(`   Temps moyen: ${avgTime}ms`);
    console.log(`   Temps min: ${minTime}ms`);
    console.log(`   Temps max: ${maxTime}ms`);

    // Alertes performance
    if (avgTime > 5000) {
      console.warn('⚠️ Performance dégradée: temps moyen > 5s');
    }
    if (maxTime > 10000) {
      console.error('❌ Blocage possible: temps max > 10s');
    }

    expect(maxTime).toBeLessThan(15000); // Max 15s toléré
  });
});
