"use client";
import React, { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

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

export function MessageList({ messages }: { messages: ChatMessage[] }) {
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const showTimestamp = index === 0 || 
          (messages[index - 1] && 
           message.timestamp - messages[index - 1].timestamp > 300000); // 5 Minuten
        
        return (
          <div key={message.id}>
            {showTimestamp && (
              <div className="flex justify-center mb-4">
                <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            )}
            <MessageItem m={message} />
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}