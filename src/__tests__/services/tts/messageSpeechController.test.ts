import { describe, expect, it } from 'vitest';
import {
  extractSpeakableText,
  prepareSpeechProsody,
} from '@/services/tts/messageSpeechController';

describe('messageSpeechController', () => {
  it('nettoie le markdown avant lecture', () => {
    const content = `# Titre\n\n- Premier point\n- Deuxième point avec [lien](https://example.com)\n\n\`inline\`\n\n\
\
\
\
\`\`\`ts\nconst hidden = true;\n\`\`\``;

    expect(extractSpeakableText(content)).toBe(
      'Titre\nPremier point\nDeuxième point avec lien\n\ninline'
    );
  });

  it('retombe sur le texte brut si le nettoyage vide tout', () => {
    expect(extractSpeakableText('Bonjour TITANE')).toBe('Bonjour TITANE');
  });

  it('prepare la prosodie pour limiter les coupures et URLs brutales', () => {
    const input =
      'Bonjour\nVoici le suivi\n\nDétails ici: https://example.com/very/long/url?token=abc';

    expect(prepareSpeechProsody(input)).toBe(
      'Bonjour, Voici le suivi. Détails ici: lien web.'
    );
  });

  it('ajoute une ponctuation finale si absente', () => {
    expect(prepareSpeechProsody('Message sans ponctuation')).toBe(
      'Message sans ponctuation.'
    );
  });
});