// app/lib/video-agents.ts
// Unified Agent Framework for Writeora – Video & (optionally) Image generation
// Provides: Agent selection, config mapping, and execution wrapper

export type AgentKey =
  | 'auto'
  | 'comfy-orchestrator'
  | 'svd-local'
  | 'comfy-nsfw-pro'
  | 'deforum-hub';

export type Genre = 'sfw' | 'nsfw';
export type Quality = 'draft' | 'high' | 'ultra';

export type VideoUPMSettings = {
  // Core
  format?: 'video' | 'image';
  genre?: Genre;
  quality?: Quality;
  promptEnhance?: boolean;

  // Timing
  length?: number; // seconds
  duration?: number; // alias
  fps?: number;

  // Resolution
  resolution?: string; // "1024x576"
  aspectRatio?: string; // "16:9", "9:16" etc.

  // Motion
  motion?: string;
  motionStrength?: number; // 0.05 - 1.0
  position?: string; // camera position or subject pos

  // Audio
  audio?: 'none' | 'tts' | 'music';
  audioVoice?: 'amy' | 'male' | 'female' | 'custom';

  // Agent override
  agent?: AgentKey;

  // Misc
  negativePrompt?: string;
  safety?: 'none' | 'medium' | 'strict';
  [key: string]: any;
};

export type AgentConfig = {
  mode: 'text2video' | 'image2video' | 'text2image' | 'image2image';
  sourceImage?: string | null;
  prompt: string;
  // normalized settings for agents
  genre: Genre | undefined;
  quality: Quality | undefined;
  length: number;
  fps: number;
  width: number;
  height: number;
  audio: 'none' | 'tts' | 'music';
  audioVoice?: 'amy' | 'male' | 'female' | 'custom';
  motion?: string;
  motionStrength?: number;
  aspectRatio?: string;
  position?: string;
  raw: VideoUPMSettings;
};

export type VideoResult = {
  videoUrl: string;
  duration?: number;
  hasAudio?: boolean;
  agent: AgentKey;
  metadata?: Record<string, any>;
  isNSFW?: boolean;
};

export interface VideoAgent {
  key: AgentKey;
  label: string;
  generate(prompt: string, config: AgentConfig): Promise<VideoResult>;
}

// -------------------- Utilities --------------------

export function parseResolution(res?: string, fallback = { width: 1024, height: 576 }) {
  if (!res) return fallback;
  const m = /^([0-9]+)x([0-9]+)$/.exec(res);
  if (!m) return fallback;
  return { width: Math.max(16, parseInt(m[1], 10)), height: Math.max(16, parseInt(m[2], 10)) };
}

export function aspectToResolution(aspect?: string, base = 1024) {
  if (!aspect) return { width: base, height: Math.round((base * 9) / 16) };
  const m = /^([0-9]+):([0-9]+)$/.exec(aspect);
  if (!m) return { width: base, height: Math.round((base * 9) / 16) };
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  const width = base;
  const height = Math.round((base * h) / w);
  return { width, height };
}

// -------------------- Agent Manager --------------------

import ComfyOrchestratorAgent from './agents/comfy-orchestrator';
import SVDLocalAgent from './agents/svd-local';
import ComfyNSFWProAgent from './agents/comfy-nsfw-pro';
import DeforumHubAgent from './agents/deforum-hub';

export class VideoAgentManager {
  private agents: Record<Exclude<AgentKey, 'auto'>, VideoAgent> = {
    'comfy-orchestrator': new ComfyOrchestratorAgent(),
    'svd-local': new SVDLocalAgent(),
    'comfy-nsfw-pro': new ComfyNSFWProAgent(),
    'deforum-hub': new DeforumHubAgent(),
  };

  get(key: Exclude<AgentKey, 'auto'>) {
    const a = this.agents[key];
    if (!a) throw new Error(`Agent not found: ${key}`);
    return a;
  }

  selectAgent(settings: VideoUPMSettings): Exclude<AgentKey, 'auto'> {
    // Mapping gemäß Spezifikation:
    // - video + nsfw → comfy-nsfw-pro
    // - video + sfw → svd-local
    // - image + nsfw → comfy-nsfw-pro
    // - sonst → comfy-orchestrator
    if (settings.agent && settings.agent !== 'auto') return settings.agent as Exclude<AgentKey, 'auto'>;

    if (settings.format === 'video' && settings.genre === 'nsfw') return 'comfy-nsfw-pro';
    if (settings.format === 'video' && settings.genre === 'sfw') return 'svd-local';
    if (settings.format === 'image' && settings.genre === 'nsfw') return 'comfy-nsfw-pro';
    return 'comfy-orchestrator';
  }

  buildAgentConfig(prompt: string, settings: VideoUPMSettings, sourceImage?: string | null): AgentConfig {
    const length = Math.max(1, Math.round(settings.length ?? settings.duration ?? 3));
    const fps = Math.max(1, Math.round(settings.fps ?? 24));

    // Prefer explicit resolution, else infer from aspectRatio
    const res = settings.resolution ? parseResolution(settings.resolution) : aspectToResolution(settings.aspectRatio);

    return {
      mode: sourceImage ? 'image2video' : 'text2video',
      sourceImage: sourceImage || null,
      prompt,
      genre: settings.genre,
      quality: settings.quality,
      length,
      fps,
      width: res.width,
      height: res.height,
      audio: settings.audio ?? 'none',
      audioVoice: settings.audioVoice,
      motion: settings.motion,
      motionStrength: settings.motionStrength,
      aspectRatio: settings.aspectRatio,
      position: settings.position,
      raw: settings,
    };
  }

  async generateVideo(prompt: string, settings: VideoUPMSettings, sourceImage?: string | null): Promise<VideoResult> {
    const agentKey = this.selectAgent(settings);
    const agent = this.get(agentKey);
    const config = this.buildAgentConfig(prompt, settings, sourceImage);
    return agent.generate(prompt, config);
  }
}

// Singleton (optional)
const videoAgents = new VideoAgentManager();
export default videoAgents;
