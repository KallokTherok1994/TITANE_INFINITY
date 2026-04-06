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

  it('segmente les phrases trop longues pour une lecture plus stable', () => {
    const longText =
      'Cette explication est volontairement longue pour verifier la segmentation prosodique et assurer une diction stable sur des messages tres etendus avec plusieurs idees consecutives sans pause nette immediate';

    const output = prepareSpeechProsody(longText);
    const words = output.replace(/[.!?]/g, '').split(/\s+/).filter(Boolean);

    expect(words.length).toBeGreaterThan(20);
    expect(output).toContain('.');
  });

  it('preserve les pauses fortes au lieu de sur-fusionner', () => {
    const output = prepareSpeechProsody(
      'Bonjour. Oui. Continuons avec une explication claire.'
    );
    expect(output).toContain('Bonjour. Oui.');
  });
});
