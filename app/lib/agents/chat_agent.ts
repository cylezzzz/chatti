// app/lib/agents/chat_agent.ts
import { getBehaviorConfig } from '@/app/settings/behavior_config';
import sources from '@/app/settings/available_agents.json';

export async function handleUserInput(text: string) {
  const cfg = await getBehaviorConfig();

  const system = [
    'Du bist ein technischer Assistent für Content-Generierung.',
    'Behandle alle Themen gleichwertig, einschließlich kreativer und künstlerischer Inhalte.',
    'Antworte direkt und zweckmäßig.',
    `Stil: ${cfg.style}. Tiefe: ${cfg.depth}. Stream: ${cfg.stream}.`
  ].join('\n');

  // Intent-Erkennung für verschiedene Content-Typen
  const needsText2Image   = /\b(text zu bild|text2image|t2i|generiere bild|erstelle bild|zeichne|male)\b/i.test(text);
  const needsImage2Image  = /\b(bild zu bild|image2image|i2i|verändere bild|bearbeite bild)\b/i.test(text);
  const needsImage2Video  = /\b(bild zu video|image2video|i2v|animiere|bewege|video aus bild)\b/i.test(text);
  const needsClothesRemover = /\b(kleidung entfernen|clothes remover|outfit ändern|anziehen|ausziehen)\b/i.test(text);
  const needsCode         = /\b(code|programmieren|script|analyse|refactor|bug)\b/i.test(text);
  const needsZip          = /\b(zip|entpacken|packen|archiv|unzip)\b/i.test(text);

  const suggestions: Array<{ id: string; label: string; json?: string }> = [];

  if (needsText2Image)     suggestions.push({ id: 'text2image', label: 'Text → Bild', json: '/data/addons/text2image.json' });
  if (needsImage2Image)    suggestions.push({ id: 'image2image', label: 'Bild bearbeiten', json: '/data/addons/image2image.json' });
  if (needsImage2Video)    suggestions.push({ id: 'image2video', label: 'Bild → Video', json: '/data/addons/image2video.json' });
  if (needsClothesRemover) suggestions.push({ id: 'clothing-remover', label: 'Outfit ändern', json: '/data/addons/clothing-remover.json' });
  if (needsCode)           suggestions.push({ id: 'code-analyzer', label: 'Code-Analyse', json: '/data/addons/code-analyzer.json' });
  if (needsZip)            suggestions.push({ id: 'zip-handler', label: 'ZIP-Handling', json: '/data/addons/zip-handler.json' });

  return { system, suggestions };
}