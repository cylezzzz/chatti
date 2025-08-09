// app/settings/behavior_config.ts
export interface BehaviorConfig {
  style: string;
  depth: string;
  stream: boolean;
}

export async function getBehaviorConfig(): Promise<BehaviorConfig> {
  return {
    style: "professional",
    depth: "detailed",
    stream: true
  };
}