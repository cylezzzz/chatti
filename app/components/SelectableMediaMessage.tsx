"use client";
import React, { useState } from "react";
import { ChatBubble } from "./ChatBubble";
import { MarkdownMessage } from "./MarkdownMessage";
import MediaViewer from "./MediaViewer";
import { Check, Image as ImageIcon } from "lucide-react";

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

interface SelectableMediaMessageProps {
  m: ChatMessage;
  selectedMedia: string[];
  onMediaSelect: (mediaUrl: string, isSelected: boolean) => void;
}

export function SelectableMediaMessage({ m, selectedMedia, onMediaSelect }: SelectableMediaMessageProps) {
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

  const handleMediaClick = (mediaUrl: string) => {
    const isCurrentlySelected = selectedMedia.includes(mediaUrl);
    onMediaSelect(mediaUrl, !isCurrentlySelected);
  };

  return (
    <ChatBubble role={m.role}>
      <div className="space-y-3">
        {/* Text-Inhalt */}
        {m.text && (
          <div className="text-sm">
            <MarkdownMessage text={m.text} />
          </div>
        )}
        
        {/* Media-Inhalt mit Auswahl-Funktionalität */}
        {mediaFiles.length > 0 && (
          <div className="space-y-3">
            {mediaFiles.map((file) => {
              const isSelected = selectedMedia.includes(file.url);
              const isSelectableMedia = file.type.startsWith('image/') || file.type.startsWith('video/');
              
              return (
                <div 
                  key={file.id} 
                  className={`relative group ${isSelectableMedia ? 'cursor-pointer' : ''}`}
                  onClick={() => isSelectableMedia && handleMediaClick(file.url)}
                >
                  {/* Selektions-Overlay */}
                  {isSelectableMedia && (
                    <div 
                      className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white/80 border-white/80 text-gray-600 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </div>
                  )}
                  
                  {/* Auswahl-Highlight */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg pointer-events-none z-5" />
                  )}
                  
                  <MediaViewer 
                    file={file}
                    className={`max-w-md transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  />
                  
                  {/* Auswahl-Hinweis */}
                  {isSelectableMedia && !isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                      <div className="text-white text-sm font-medium px-3 py-1 bg-black/50 rounded-full">
                        Zum Markieren klicken
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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