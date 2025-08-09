// app/api/ai/video/generate/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import videoAgents, { VideoAgentManager, VideoUPMSettings } from '@/app/lib/video-agents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SettingsSchema = z.object({
  format: z.enum(['video', 'image']).default('video'),
  genre: z.enum(['sfw', 'nsfw']).optional(),
  quality: z.enum(['draft', 'high', 'ultra']).optional(),
  promptEnhance: z.boolean().optional(),
  length: z.number().optional(),
  duration: z.number().optional(),
  fps: z.number().optional(),
  resolution: z.string().optional(),
  aspectRatio: z.string().optional(),
  motion: z.string().optional(),
  motionStrength: z.number().min(0.05).max(1).optional(),
  audio: z.enum(['none', 'tts', 'music']).optional(),
  audioVoice: z.enum(['amy','male','female','custom']).optional(),
  agent: z.enum(['auto','comfy-orchestrator','svd-local','comfy-nsfw-pro','deforum-hub']).optional(),
}).passthrough();

const BodySchema = z.object({
  mode: z.union([z.literal('text2video'), z.literal('image2video')]).optional(),
  prompt: z.string().min(1),
  settings: SettingsSchema,
  sourceImage: z.string().url().optional(),
});

type Body = z.infer<typeof BodySchema>;

export async function POST(req: Request) {
  try {
    const body: Body = BodySchema.parse(await req.json());
    const upm = body.settings as VideoUPMSettings;

    const result = await videoAgents.generateVideo(
      body.prompt,
      upm,
      body.sourceImage ?? null
    );

    return NextResponse.json({
      id: `vidgen_${Date.now()}`,
      status: 'ok',
      mode: body.sourceImage ? 'image2video' : 'text2video',
      result: {
        videoUrl: result.videoUrl,
        prompt: body.prompt,
        settings: upm,
        sourceImage: body.sourceImage ?? null,
        agent: result.agent,
        meta: result.metadata || null,
        duration: result.duration,
        hasAudio: result.hasAudio ?? false,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ status: 'invalid', error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ status: 'error', error: String(err?.message || err) }, { status: 500 });
  }
}
