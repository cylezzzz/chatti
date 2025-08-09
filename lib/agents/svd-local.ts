// app/lib/agents/svd-local.ts
import type { VideoAgent, AgentConfig, VideoResult } from '../video-agents';

const SVD_URL = process.env.STABLE_DIFFUSION_URL || 'http://localhost:7860';

export default class SVDLocalAgent implements VideoAgent {
  key = 'svd-local' as const;
  label = 'Stable Video Diffusion (Local)';

  async generate(prompt: string, config: AgentConfig): Promise<VideoResult> {
    // If text2video, first render a keyframe (placeholder)
    const baseImage = config.mode === 'text2video'
      ? `https://picsum.photos/seed/${Date.now()}/768/512`
      : config.sourceImage || '';

    // TODO: call SVD endpoint (Automatic1111/Invoke) to animate baseImage
    // POST to `${SVD_URL}/sdapi/v1/img2img` or a dedicated /text2video endpoint if available

    const url = `https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4?t=${Date.now()}`;

    return {
      videoUrl: url,
      duration: config.length,
      hasAudio: false,
      agent: this.key,
      metadata: {
        svdUrl: SVD_URL,
        baseImage,
        width: config.width,
        height: config.height,
        fps: config.fps,
      },
    };
  }
}
