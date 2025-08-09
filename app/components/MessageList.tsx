"use client";
import React, { useEffect, useRef } from "react";
import { SelectableMediaMessage } from "./SelectableMediaMessage";

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
  contentType?: 'text' | 'image' | 'video' | 'mixed';
  selectedMedia?: string[];
};

interface MessageListProps {
  messages: ChatMessage[];
  selectedMedia?: string[];
  onMediaSelect?: (mediaUrl: string, isSelected: boolean) => void; // ✅ BEHOBEN: Prop hinzugefügt
}

export function MessageList({ messages, selectedMedia = [], onMediaSelect }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 Tage
      return date.toLocaleDateString('de-DE', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message, index) => {
        const showTimestamp = index === 0 || 
          (messages[index - 1] && 
           message.timestamp - messages[index - 1].timestamp > 300000); // 5 Minuten
        
        return (
          <div key={message.id} className="space-y-4">
            {showTimestamp && (
              <div className="flex justify-center">
                <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50">
                  <span className="text-xs text-slate-300">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            )}
            <SelectableMediaMessage 
              m={message}
              selectedMedia={selectedMedia}
              onMediaSelect={onMediaSelect || (() => {})} // ✅ BEHOBEN: Fallback hinzugefügt
            />
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}