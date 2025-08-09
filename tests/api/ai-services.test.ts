// tests/api/ai-services.test.ts
// Vitest-Tests für AI-Routen + Service-Libs
// Läuft ohne echten Server: wir importieren die App Router Handlers (POST) direkt

import { describe, it, expect, beforeAll, vi } from 'vitest';

// API Route Handlers (App Router)
import * as ImgGen from '@/app/api/ai/image/generate/route';
import * as ImgEdit from '@/app/api/ai/image/edit/route';
import * as VidGen from '@/app/api/ai/video/generate/route';
import * as FaceDet from '@/app/api/ai/face/detect/route';
import * as ProjGen from '@/app/api/projects/generate/route';
import * as ProjExec from '@/app/api/projects/execute/route';

// Service-Libs
import aiServiceManager, { AIServiceManager } from '@/app/lib/ai-service-manager';
import imageProcessor from '@/app/lib/image-processor';
import videoProcessor from '@/app/lib/video-processor';
import faceProcessor from '@/app/lib/face-processor';

function request(body: any) {
  return new Request('http://localhost/_', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('API Routes - Image', () => {
  it('text2image returns ok with imageUrl', async () => {
    const res = await ImgGen.POST(
      request({
        mode: 'text2image',
        prompt: 'A serene beach at sunset',
        settings: { format: 'image', steps: 20 },
      })
    );
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.result?.imageUrl).toMatch(/^https?:\/\//);
  });

  it('image2image edit returns ok with imageUrl', async () => {
    const res = await ImgEdit.POST(
      request({
        mode: 'image2image',
        prompt: 'add soft cinematic lighting',
        settings: { format: 'image', strength: 0.6 },
        sourceImage: 'https://example.com/source.png',
        region: { x: 10, y: 10, width: 100, height: 80, invert: false },
      })
    );
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.result?.imageUrl).toMatch(/^https?:\/\//);
  });
});

describe('API Routes - Video', () => {
  it('text2video returns ok with videoUrl', async () => {
    const res = await VidGen.POST(
      request({
        mode: 'text2video',
        prompt: 'ocean waves timelapse',
        settings: { format: 'video', duration: 3, fps: 24, resolution: '1024x576' },
      })
    );
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.result?.videoUrl).toMatch(/^https?:\/\//);
  });

  it('image2video returns ok with videoUrl', async () => {
    const res = await VidGen.POST(
      request({
        mode: 'image2video',
        prompt: 'gentle zoom',
        settings: { format: 'video', duration: 3, fps: 24, resolution: '1024x576' },
        sourceImage: 'https://example.com/image.jpg',
      })
    );
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.result?.videoUrl).toMatch(/^https?:\/\//);
  });
});

describe('API Routes - Face', () => {
  it('face detection returns faces array', async () => {
    const res = await FaceDet.POST(
      request({
        mode: 'face_detection',
        sourceImage: 'https://example.com/people.jpg',
        settings: { minConfidence: 0.5, maxFaces: 5 },
      })
    );
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(Array.isArray(json.result?.faces)).toBe(true);
    expect(json.result?.count).toBeGreaterThan(0);
  });
});

describe('API Routes - Projects', () => {
  it('project scaffold returns files & deps', async () => {
    const res = await ProjGen.POST(
      request({
        mode: 'project_scaffold',
        prompt: 'Writeora Demo',
        settings: { framework: 'react-ts', packageManager: 'npm' },
      })
    );
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(Array.isArray(json.result?.files)).toBe(true);
    expect(Array.isArray(json.result?.dependencies)).toBe(true);
  });

  it('execute code returns logs', async () => {
    const res = await ProjExec.POST(
      request({
        language: 'node',
        code: "console.log('hello test')",
        timeoutMs: 1000,
      })
    );
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(Array.isArray(json.result?.logs)).toBe(true);
  });
});

describe('AIServiceManager', () => {
  it('routes text2image via API or mock', async () => {
    // eigene Instanz ohne API (erzwingt Mock)
    const mgr = new AIServiceManager({ enableApiRouting: false });
    const res = await mgr.processRequest('text2image', {
      prompt: 'forest path',
      settings: { format: 'image' },
    });
    expect(res.status).toBe('ok');
    expect(res.result?.imageUrl).toMatch(/^https?:\/\//);
  });

  it('routes image2video via API or mock', async () => {
    const mgr = new AIServiceManager({ enableApiRouting: false });
    const res = await mgr.processRequest('image2video', {
      prompt: 'slow zoom',
      settings: { format: 'video', duration: 2, fps: 24, resolution: '1024x576' },
      sourceImage: 'https://example.com/img.jpg',
    });
    expect(res.status).toBe('ok');
    expect(res.result?.videoUrl).toMatch(/^https?:\/\//);
  });
});

describe('Processors smoke tests', () => {
  it('ImageProcessor.generateImage returns a URL', async () => {
    const url = await imageProcessor.generateImage('mountain', { format: 'image', steps: 10 });
    expect(url).toMatch(/^https?:\/\//);
  });

  it('ImageProcessor.editImage returns a URL', async () => {
    const url = await imageProcessor.editImage('https://example.com/a.png', 'brighten', { format: 'image' });
    expect(url).toMatch(/^https?:\/\//);
  });

  it('VideoProcessor.generateVideo returns meta + url', async () => {
    const res = await videoProcessor.generateVideo('timelapse city', { duration: 3, fps: 24, resolution: '1024x576' });
    expect(res.success).toBe(true);
    expect(res.videoUrl).toMatch(/^https?:\/\//);
    expect(res.meta?.mode).toBe('text2video');
  });

  it('FaceProcessor.detectFaces returns faces', async () => {
    const faces = await faceProcessor.detectFaces('https://example.com/people.jpg');
    expect(Array.isArray(faces)).toBe(true);
    expect(faces.length).toBeGreaterThan(0);
    expect(faces[0]).toHaveProperty('box');
  });

  it('FaceProcessor.generateWithFace returns image URL', async () => {
    const url = await faceProcessor.generateWithFace('portrait, studio light', { name: 'Test' }, { format: 'image' });
    expect(url).toMatch(/^https?:\/\//);
  });
});
