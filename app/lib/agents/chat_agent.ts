import { getBehaviorConfig } from '@/settings/behavior_config'

export async function handleUserInput(text: string) {
  const config = await getBehaviorConfig()

  const systemPrompt = `
    Du bist ein neutraler, reaktiver Assistent.
    Antworte im Stil: ${config.style}
    Antworttiefe: ${config.depth}
    Einschränkungen: ${config.restrictions.join(', ')}
    Moralische Bewertungen: ${config.moral ? 'aktiv' : 'deaktiviert'}
  `

  return await callLLM({
    prompt: text,
    system: systemPrompt,
    stream: config.stream,
  })
}