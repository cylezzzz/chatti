"use client";
import React from "react";
import { ChatBubble } from "./ChatBubble";
import { MarkdownMessage } from "./MarkdownMessage";
import { Badge } from "@/components/ui/badge";
import { Sparkles, User, Bot, CheckCircle } from "lucide-react";

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

// Temporäre einfache Media-Komponente (ersetzt MediaRenderer)
function SimpleMediaRenderer({ items, selectedMedia, onMediaSelect }: {
  items: ChatMessage['media'];
  selectedMedia: string[];
  onMediaSelect: (mediaUrl: string, isSelected: boolean) => void;
}) {
  if (!items?.length) return null;

  return (
    <div className="mt-4 space-y-4">
      {items.map((item, index) => {
        const isSelected = selectedMedia.includes(item.url);
        
        return (
          <div key={index} className="relative group">
            {/* Selection Button */}
            <button
              onClick={() => onMediaSelect(item.url, !isSelected)}
              className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-cyan-500 border-cyan-500' 
                  : 'bg-black/50 border-white/60 hover:bg-white/20'
              }`}
            >
              {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
            </button>

            {/* Media Content */}
            {item.type === 'image' && (
              <img
                src={item.url}
                alt={item.alt || 'Generated image'}
                className={`w-full h-auto max-h-96 object-contain rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-cyan-500' : ''
                }`}
                onClick={() => onMediaSelect(item.url, !isSelected)}
              />
            )}
            
            {item.type === 'video' && (
              <video
                src={item.url}
                poster={item.poster}
                controls
                className={`w-full h-auto max-h-96 rounded-lg ${
                  isSelected ? 'ring-2 ring-cyan-500' : ''
                }`}
              />
            )}
            
            {item.type === 'file' && (
              <div className={`flex items-center gap-3 p-4 rounded-lg border bg-card ${
                isSelected ? 'ring-2 ring-cyan-500' : ''
              }`}>
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium">{item.name || 'File'}</p>
                  {item.size && (
                    <p className="text-sm text-muted-foreground">
                      {(item.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
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
                <SimpleMediaRenderer 
                  items={m.media}
                  selectedMedia={selectedMedia}
                  onMediaSelect={onMediaSelect}
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