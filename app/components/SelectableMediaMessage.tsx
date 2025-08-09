"use client";
import React from "react";
import { ChatBubble } from "./ChatBubble";
import { MarkdownMessage } from "./MarkdownMessage";
import MediaRenderer from "./MediaRenderer";
import { Badge } from "@/components/ui/badge";
import { Sparkles, User, Bot } from "lucide-react";

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

interface SelectableMediaMessageProps {
  m: ChatMessage;
  selectedMedia: string[];
  onMediaSelect: (mediaUrl: string, isSelected: boolean) => void;
}

export function SelectableMediaMessage({ m, selectedMedia, onMediaSelect }: SelectableMediaMessageProps) {
  const isUser = m.role === "user";
  const isAssistant = m.role === "assistant";

  const getContentTypeIcon = () => {
    switch (m.contentType) {
      case 'image': return '🎨';
      case 'video': return '🎬';
      case 'mixed': return '📎';
      default: return null;
    }
  };

  const getContentTypeBadge = () => {
    if (!m.contentType || m.contentType === 'text') return null;
    
    const labels = {
      image: 'Bild generiert',
      video: 'Video erstellt',
      mixed: 'Media + Text'
    };

    return (
      <Badge className="mb-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <Sparkles className="w-3 h-3 mr-1" />
        {labels[m.contentType]}
      </Badge>
    );
  };

  return (
    <div className={`w-full flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
          : 'bg-gradient-to-br from-purple-500 to-pink-500'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
        {/* Content Type Badge */}
        {isAssistant && getContentTypeBadge()}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-tr-sm border border-blue-500/50"
              : "bg-slate-800/80 text-slate-100 rounded-tl-sm border border-slate-700/50"
          }`}
        >
          <div className="space-y-3">
            {/* Text Content */}
            {m.text && (
              <div className="text-sm leading-relaxed">
                <MarkdownMessage text={m.text} />
              </div>
            )}
            
            {/* Selected Media Reference */}
            {m.selectedMedia && m.selectedMedia.length > 0 && (
              <div className="text-xs opacity-80 italic border-l-2 border-current/30 pl-3">
                📎 Referenziert {m.selectedMedia.length} Medium{m.selectedMedia.length !== 1 ? 'en' : ''} aus dem Chat
              </div>
            )}

            {/* Media Content */}
            {m.media && m.media.length > 0 && (
              <div className="-mx-1">
                <MediaRenderer 
                  items={m.media}
                  onMediaSelect={isAssistant ? onMediaSelect : undefined}
                  selectedMedia={selectedMedia}
                  showSelectionUI={isAssistant}
                />
              </div>
            )}

            {/* Fallback for empty message */}
            {!m.text && (!m.media || m.media.length === 0) && (
              <div className="text-sm text-current/60 italic">
                [Leere Nachricht]
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-slate-400 mt-1 ${isUser ? "text-right" : "text-left"}`}>
          {new Date(m.timestamp).toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {getContentTypeIcon() && (
            <span className="ml-2">{getContentTypeIcon()}</span>
          )}
        </div>
      </div>
    </div>
  );
}