"use client";
import React from "react";
import { ChatBubble } from "./ChatBubble";
import { MarkdownMessage } from "./MarkdownMessage";
import MediaViewer from "./MediaViewer";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text?: string;
  media?: Array<
    | { type: "image"; url: string; alt?: string }
    | { type: "video"; url: string; poster?: string }
    | { type: "file"; url: string; name?: string; size?: number }
  >;
  timestamp: number;
};

export function MessageItem({ m }: { m: ChatMessage }) {
  // Konvertiere media zu MediaViewer-Format
  const mediaFiles = m.media?.map((item, index) => ({
    id: `${m.id}-media-${index}`,
    name: item.type === 'image' ? (item.alt || `Image ${index + 1}`) :
          item.type === 'file' ? (item.name || `File ${index + 1}`) :
          `Video ${index + 1}`,
    type: item.type === 'image' ? 'image/*' :
          item.type === 'video' ? 'video/*' :
          'application/octet-stream',
    size: item.type === 'file' ? (item.size || 0) : 0,
    url: item.url
  })) || [];

  return (
    <ChatBubble role={m.role}>
      <div className="space-y-3">
        {/* Text-Inhalt */}
        {m.text && (
          <div className="text-sm">
            <MarkdownMessage text={m.text} />
          </div>
        )}
        
        {/* Media-Inhalt */}
        {mediaFiles.length > 0 && (
          <div className="space-y-3">
            {mediaFiles.map((file) => (
              <MediaViewer 
                key={file.id} 
                file={file}
                className="max-w-md"
              />
            ))}
          </div>
        )}

        {/* Fallback wenn weder Text noch Media */}
        {!m.text && (!m.media || m.media.length === 0) && (
          <div className="text-sm text-zinc-400 italic">
            [Leere Nachricht]
          </div>
        )}
      </div>
    </ChatBubble>
  );
}