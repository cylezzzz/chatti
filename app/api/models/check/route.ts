import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ENDPOINT = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function POST(req: NextRequest) {
  try {
    const { model } = await req.json();
    if (!model) return NextResponse.json({ installed: false });

    const res = await fetch(`${DEFAULT_ENDPOINT}/api/tags`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({
        installed: false,
        downloadUrl: `https://ollama.com/library/${encodeURIComponent(model.split(':')[0])}`,
      });
    }
    const data = await res.json();
    const exists = Array.isArray(data?.models) && data.models.some((m: any) => (m?.name || '').startsWith(model));
    return NextResponse.json({
      installed: exists,
      downloadUrl: `https://ollama.com/library/${encodeURIComponent(model.split(':')[0])}`,
    });
  } catch (e) {
    return NextResponse.json({ installed: false });
  }
}