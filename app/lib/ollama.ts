export type OllamaMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  // optional: name, tool_call_id etc., falls du die nutzt
};

/**
 * Streamt 1:1 zu Ollama /api/chat – keine Inhalt-Filter, keine System-Injektion.
 * Erwartet vom Server Streaming-JSON-Zeilen, z. B.:
 *  { "message": { "role":"assistant","content":"..." }, "done": false }
 * und schließlich { "done": true }
 */
export async function* streamChatCompletion(
  messages: OllamaMessage[],
  model: string,
  apiEndpoint: string // z.B. "http://localhost:11434"
): AsyncGenerator<string> {
  const res = await fetch(`${apiEndpoint.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // KEINE System-/Safety-Prompts – komplett neutral
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        // Falls du Temperatur etc. steuern willst:
        // temperature: 0.7,
      },
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama request failed: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Ollama sendet i.d.R. Zeilen mit \n getrenntem JSON
    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);

      if (!line) continue;

      // Manche Implementierungen schicken "data: ..." – abstreifen
      const payload = line.startsWith('data:') ? line.slice(5).trim() : line;

      try {
        const json = JSON.parse(payload);
        if (json?.done) {
          return;
        }
        // Standard Ollama-Chat-Delta
        const delta: string | undefined = json?.message?.content ?? json?.response;
        if (delta) {
          yield delta as string;
        }
      } catch {
        // Fällt zurück: Rohtext weiterreichen (zur Not)
        yield line;
      }
    }
  }

  // Restpuffer
  if (buffer.trim()) {
    try {
      const json = JSON.parse(buffer.trim());
      const delta: string | undefined = json?.message?.content ?? json?.response;
      if (delta) yield delta;
    } catch {
      yield buffer.trim();
    }
  }
}
