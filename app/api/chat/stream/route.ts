import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';
import { streamChatCompletion, OllamaMessage } from '@/app/lib/ollama';

// 🔧 Auth-Bypass über .env
const AUTH_DISABLED =
  process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true' ||
  process.env.AUTH_DISABLED === 'true';

export async function POST(request: NextRequest) {
  // Wenn Auth nicht deaktiviert ist -> normal prüfen
  if (!AUTH_DISABLED && !isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages, model, apiEndpoint } = await request.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChatCompletion(
            messages as OllamaMessage[],
            model as string,
            apiEndpoint as string
          )) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
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
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Chat stream failed' }, { status: 500 });
  }
}
