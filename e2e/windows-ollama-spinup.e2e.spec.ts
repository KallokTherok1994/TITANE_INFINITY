import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

const isWindows = process.platform === 'win32';

test('Spin up Windows : Ollama + modèles installés et actifs', async () => {
  if (!isWindows) {
    test.skip(true, 'Test Windows/Ollama ignoré sur plateforme non-Windows');
    // Mais on vérifie la présence d’Ollama et des modèles si déjà actifs (pour CI Linux)
    try {
      const res = await fetch('http://127.0.0.1:11434/api/tags');
      if (res.status === 200) {
        const data = await res.json();
        const required = ['qwen2.5:latest', 'llama3.1:8b', 'mistral:7b'];
        for (const model of required) {
          expect(data.models.map((m: any) => m.name)).toContain(model);
        }
      }
    } catch {
      // Ollama non actif, skip
    }
    return;
  }

  // 1. Lance le script d'installation (Windows)
  try {
    execSync(
      'powershell -ExecutionPolicy Bypass -File scripts/launch/launch-ollama.ps1 install',
      { stdio: 'inherit' }
    );
  } catch (e) {
    expect(e).toBeUndefined();
  }

  // 2. Vérifie que le service Ollama répond
  const res = await fetch('http://127.0.0.1:11434/api/tags');
  expect(res.status).toBe(200);
  const data = await res.json();
  // 3. Vérifie la présence des modèles requis
  const required = ['qwen2.5:latest', 'llama3.1:8b', 'mistral:7b'];
  for (const model of required) {
    expect(data.models.map((m: any) => m.name)).toContain(model);
  }
});
