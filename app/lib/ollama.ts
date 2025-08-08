export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export async function* streamChatCompletion(
  messages: OllamaMessage[],
  model: string = 'llama2',
  apiEndpoint: string = 'http://localhost:11434'
): AsyncGenerator<string> {
  const response = await fetch(`${apiEndpoint}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: OllamaResponse = JSON.parse(line);
            if (data.message?.content) {
              yield data.message.content;
            }
            if (data.done) return;
          } catch (error) {
            console.error('Error parsing streaming response:', error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function getAvailableModels(apiEndpoint: string = 'http://localhost:11434'): Promise<string[]> {
  try {
    const response = await fetch(`${apiEndpoint}/api/tags`);
    if (!response.ok) return ['llama2'];
    
    const data = await response.json();
    return data.models?.map((model: any) => model.name) || ['llama2'];
  } catch {
    return ['llama2'];
  }
}