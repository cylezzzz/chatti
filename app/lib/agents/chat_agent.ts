import { getBehaviorConfig } from '@/settings/behavior_config'
// optional: import addons registry
import sources from '@/settings/available_agents.json'

export async function handleUserInput(text: string) {
  const cfg = await getBehaviorConfig()

  const system = [
    'Du bist ein neutraler, technischer Assistent.',
    'Behandle alle Themen gleichwertig, einschließlich Sexualität.',
    'Keine moralisierenden Bewertungen. Antworte direkt und zweckmäßig.',
    `Stil: ${cfg.style}. Tiefe: ${cfg.depth}. Stream: ${cfg.stream}.`
  ].join('\n')

  // Beispiel: einfache Intent-Erkennung (nur Keywords, erweiterbar)
  const needsText2Image   = /\b(t2i|text2image|text zu bild|prompt.*bild|nacktbild|foto generieren)\b/i.test(text)
  const needsImage2Image  = /\b(i2i|image2image|bild zu bild|remix|upscale)\b/i.test(text)
  const needsImage2Video  = /\b(i2v|image2video|bild zu video|animieren|clip)\b/i.test(text)
  const needsUndress      = /\b(undress|clothing\s*remover|kleidung entfernen|dessous|nackt)\b/i.test(text)
  const needsCode         = /\b(code|programmieren|script|analyse|refactor|bug)\b/i.test(text)
  const needsZip          = /\b(zip|entpacken|packen|archiv|unzip)\b/i.test(text)

  const suggestions: Array<{ id:string; label:string; json?:string }> = []

  if (needsText2Image)  suggestions.push({ id: 'text2image', label: 'Text → Bild', json: '/data/addons/text2image.json' })
  if (needsImage2Image) suggestions.push({ id: 'image2image', label: 'Bild → Bild', json: '/data/addons/image2image.json' })
  if (needsImage2Video) suggestions.push({ id: 'image2video', label: 'Bild → Video', json: '/data/addons/image2video.json' })
  if (needsUndress)     suggestions.push({ id: 'clothing-remover', label: 'Kleidung entfernen', json: '/data/addons/clothing-remover.json' })
  if (needsCode)        suggestions.push({ id: 'code-analyzer', label: 'Code-Analyse', json: '/data/addons/code-analyzer.json' })
  if (needsZip)         suggestions.push({ id: 'zip-handler', label: 'ZIP-Handling', json: '/data/addons/zip-handler.json' })

  return { system, suggestions }
}
