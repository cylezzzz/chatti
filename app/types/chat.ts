export type ChatRole = "user" | "assistant" | "system";

export type MediaFile = {
  id: string;
  name: string;
  type: string; // MIME: "image/png", "video/mp4", "audio/mpeg", …
  size: number; // bytes
  url: string;  // blob:/http(s)://
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text?: string;       // markdown
  media?: MediaFile[]; // wird vom MediaViewer gerendert
};
