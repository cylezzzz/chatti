import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';
import { streamChatCompletion, OllamaMessage } from '@/app/lib/ollama';

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { messages, model, apiEndpoint } = await request.json();
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChatCompletion(messages as OllamaMessage[], model, apiEndpoint)) {
            const data = encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            controller.enqueue(data);
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Chat stream failed' },
      { status: 500 }
    );
  }
}