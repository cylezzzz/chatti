'use client';

export type Agent = {
  name: string;
  category: 'image' | 'video' | 'code' | 'audio' | 'chat' | 'analysis' | 'other';
  input_types: string[];
  strengths?: string[];
  best_for?: string[];
  score?: number;
  installed?: boolean;
};

export async function loadAgents(): Promise<Agent[]> {
  try {
    const res = await fetch('/app/settings/available_agents.json');
    return await res.json();
  } catch {
    return [];
  }
}

export type AnalysisResult = {
  target: 'image' | 'video' | 'code' | 'text' | 'analysis' | 'other';
  inputs: ('text'|'image'|'video'|'audio')[];
  tags: string[];
};

export function analyzePrompt(prompt: string, hasImage: boolean, hasVideo: boolean): AnalysisResult {
  const p = prompt.toLowerCase();
  const tags: string[] = [];
  const inputs: AnalysisResult['inputs'] = ['text'];
  if (hasImage) inputs.push('image');
  if (hasVideo) inputs.push('video');

  if (/video|animier|beweg|clip/.test(p)) tags.push('video');
  if (/bild|foto|render|realistisch|nsfw|nackt|undress/.test(p)) tags.push('image');
  if (/code|programm|python|js|typescript|bug|refactor|analyse/.test(p)) tags.push('code');
  if (/sprache|audio|stimme/.test(p)) tags.push('audio');

  let target: AnalysisResult['target'] = 'text';
  if (tags.includes('video')) target = 'video';
  else if (tags.includes('image')) target = 'image';
  else if (tags.includes('code')) target = 'code';

  return { target, inputs, tags };
}

export function pickAgent(agents: Agent[], analysis: AnalysisResult): Agent | null {
  const candidates = agents.filter(a => {
    if (analysis.target === 'image' && a.category === 'image') return true;
    if (analysis.target === 'video' && a.category === 'video') return true;
    if (analysis.target === 'code' && a.category === 'code') return true;
    if (analysis.target === 'text' && a.category === 'chat') return true;
    return false;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const ai = (a.installed ? 1 : 0), bi = (b.installed ? 1 : 0);
    if (bi - ai !== 0) return bi - ai;
    const as = a.score ?? 0, bs = b.score ?? 0;
    return bs - as;
  });

  return candidates[0];
}
