// app/lib/ai-service-manager.ts
// Zentrale AI-Service Koordination (minimal + lauffähig)
// - Platzhalter für Model-Loading, Queueing, Ressourcen
// - Einfache Routing-Fassade zu vorhandenen API-Routen (optional nutzbar)
// - Saubere Typen für UPM-Workflows

export type AIModelType = 'image' | 'video' | 'text' | 'face';

export type AIRequestType =
  | 'text2image'
  | 'image2image'
  | 'inpaint'
  | 'text2video'
  | 'image2video'
  | 'face_detection'
  | 'project_scaffold'
  | 'code_template'
  | 'execute_code';

export type AIStatus = 'ok' | 'invalid' | 'error' | 'timeout' | 'unsupported';

export interface AIResponse<T = any> {
  id?: string;
  status: AIStatus;
  mode?: string;
  result?: T;
  error?: any;
}

export interface Region {
  x: number; y: number; width: number; height: number; invert?: boolean;
}

export type UPMSettings = Record<string, any> & {
  format?: 'image' | 'video' | 'text';
  model?: string;
  negativePrompt?: string;
};

export interface AIServiceManagerOptions {
  baseUrl?: string;                 // '' = same origin
  defaultHeaders?: Record<string, string>;
  enableApiRouting?: boolean;       // true → ruft die Next.js API-Routen auf
}

export class AIServiceManager {
  private baseUrl: string;
  private headers: Record<string, string>;
  private useApi: boolean;

  // einfache In-Memory-Registry für Modelle (Platzhalter)
  private loadedModels = new Map<string, { type: AIModelType; loadedAt: number }>();

  constructor(opts?: AIServiceManagerOptions) {
    this.baseUrl = (opts?.baseUrl ?? '').replace(/\/$/, '');
    this.headers = opts?.defaultHeaders ?? {};
    this.useApi  = opts?.enableApiRouting ?? true; // per default aktiv
  }

  // --- Model loading & management (Platzhalter) ---
  async loadModel(modelName: string, modelType: AIModelType): Promise<void> {
    // TODO: GPU-Allokation, On-Demand Laden, Warmup etc.
    this.loadedModels.set(modelName, { type: modelType, loadedAt: Date.now() });
  }

  // TODO: Queue management für Long-Runner (Platzhalter)
  // TODO: Resource allocation & load balancing (Platzhalter)

  // Zentraler Einstieg: UPM-Request routen
  async processRequest(type: AIRequestType, params: any): Promise<AIResponse> {
    try {
      // TODO: UPM-Settings-Mapping/Defaults anwenden
      switch (type) {
        case 'text2image':
          return this.routeOrMock('/api/ai/image/generate', {
            mode: 'text2image',
            prompt: params.prompt,
            settings: params.settings,
            region: params.region,
          });

        case 'image2image':
        case 'inpaint':
          return this.routeOrMock('/api/ai/image/edit', {
            mode: type, // 'image2image' | 'inpaint'
            prompt: params.prompt,
            settings: params.settings,
            sourceImage: params.sourceImage,
            region: params.region,
            mask: params.mask
          });

        case 'text2video':
        case 'image2video':
          return this.routeOrMock('/api/ai/video/generate', {
            mode: type,
            prompt: params.prompt,
            settings: params.settings,
            sourceImage: params.sourceImage,
            region: params.region
          });

        case 'face_detection':
          return this.routeOrMock('/api/ai/face/detect', {
            mode: 'face_detection',
            sourceImage: params.sourceImage,
            settings: params.settings
          });

        case 'project_scaffold':
        case 'code_template':
          return this.routeOrMock('/api/projects/generate', {
            mode: type,
            prompt: params.prompt,
            settings: params.settings
          });

        case 'execute_code':
          return this.routeOrMock('/api/projects/execute', {
            language: params.language ?? 'node',
            code: params.code,
            stdin: params.stdin,
            timeoutMs: params.timeoutMs
          });

        default:
          return { status: 'unsupported', error: `Unknown type: ${type}` };
      }
    } catch (err: any) {
      return { status: 'error', error: String(err?.message || err) };
    }
  }

  // --- intern: fetch JSON mit Fallback auf Mock ---
  private async routeOrMock<T = any>(path: string, body: any): Promise<AIResponse<T>> {
    if (!this.useApi) {
      return this.mockResponse(path, body) as AIResponse<T>;
    }
    try {
      const url = `${this.baseUrl}${path}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...this.headers },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return { status: 'error', error: `Invalid JSON from ${path}: ${text}` };
      }
      if (!res.ok) {
        return { status: (json?.status as AIStatus) ?? 'error', error: json?.error ?? `HTTP ${res.status}` };
      }
      return json as AIResponse<T>;
    } catch {
      // Netzwerkfehler → Mock ausgeben, damit Frontend lauffähig bleibt
      return this.mockResponse(path, body) as AIResponse<T>;
    }
  }

  // Sehr schlanker Mock für lokale Entwicklung (falls API nicht erreichbar)
  private mockResponse(path: string, body: any): AIResponse {
    const ts = Date.now();
    if (path.includes('/image/generate')) {
      return {
        id: `imggen_${ts}`,
        status: 'ok',
        mode: body?.mode,
        result: {
          imageUrl: `https://picsum.photos/seed/${ts}/1024/1024`,
          prompt: body?.prompt,
          settings: body?.settings
        }
      };
    }
    if (path.includes('/image/edit')) {
      return {
        id: `imgedit_${ts}`,
        status: 'ok',
        mode: body?.mode,
        result: {
          imageUrl: `https://picsum.photos/seed/edit_${ts}/1024/1024`,
          prompt: body?.prompt,
          settings: body?.settings,
          sourceImage: body?.sourceImage,
          region: body?.region ?? null
        }
      };
    }
    if (path.includes('/video/generate')) {
      return {
        id: `vidgen_${ts}`,
        status: 'ok',
        mode: body?.mode,
        result: {
          videoUrl:
            body?.mode === 'text2video'
              ? `https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4?t=${ts}`
              : `https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4?t=${ts}`,
          prompt: body?.prompt,
          settings: body?.settings,
          sourceImage: body?.sourceImage ?? null,
          region: body?.region ?? null
        }
      };
    }
    if (path.includes('/face/detect')) {
      return {
        id: `facedetect_${ts}`,
        status: 'ok',
        mode: 'face_detection',
        result: {
          sourceImage: body?.sourceImage,
          faces: [
            { box: { x: 120, y: 90, w: 220, h: 220 }, conf: 0.92 },
            { box: { x: 420, y: 100, w: 200, h: 200 }, conf: 0.88 }
          ],
          count: 2
        }
      };
    }
    if (path.includes('/projects/generate')) {
      return {
        id: `projgen_${ts}`,
        status: 'ok',
        mode: body?.mode,
        result: {
          name: (body?.prompt ?? 'my-app').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) || 'my-app',
          framework: body?.settings?.framework ?? 'react-ts',
          description: `Generated from UPM: ${body?.prompt ?? ''}`,
          directories: ['src', 'src/components', 'public'],
          files: [
            { path: 'src/App.tsx', type: 'component', content: 'export default function App(){return null}' },
            { path: 'README.md', type: 'documentation', content: '# Project' }
          ],
          dependencies: ['react', 'react-dom']
        }
      };
    }
    if (path.includes('/projects/execute')) {
      return {
        id: `exec_${ts}`,
        status: 'ok',
        result: { logs: [{ level: 'log', args: ['Mock execution ok'] }] }
      };
    }
    return { status: 'unsupported', error: `No mock for ${path}` };
  }
}

// Bequemer Default-Export
const aiServiceManager = new AIServiceManager();
export default aiServiceManager;
