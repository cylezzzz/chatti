'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SelectableMediaMessage } from './SelectableMediaMessage';
import { ChatInputWithSelection } from './ChatInputWithSelection';
import { useApp } from '@/app/contexts/AppContext';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text?: string;
  media?: Array<
    | { type: 'image'; url: string; alt?: string }
    | { type: 'video'; url: string; poster?: string }
    | { type: 'file'; url: string; name?: string; size?: number }
  >;
  timestamp: number;
  selectedMedia?: string[]; // Referenzen zu ausgewählten Medien
};

export default function ChatInterfaceWithSelection() {
  const { state, dispatch } = useApp();
  const { currentSession } = state;
  const endRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'assistant', 
      text: '**Hi!** Ich bin bereit. Schick Text, Bilder, Videos oder Audio. Du kannst auch **Enter** zum Senden verwenden. Wenn ich Bilder oder Videos generiere, kannst du sie **anklicken um sie zu markieren** und in deiner nächsten Nachricht zu referenzieren.',
      timestamp: Date.now()
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

  // Auto-scroll zu neuen Nachrichten
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Lade Chat-History wenn Session gewechselt wird
  useEffect(() => {
    if (currentSession && currentSession.messages.length > 0) {
      const sessionMessages: ChatMessage[] = currentSession.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        text: msg.content,
        timestamp: msg.timestamp,
        selectedMedia: [], // Keine vorherige Auswahl
        media: msg.files?.map(file => ({
          type: file.type.startsWith('image/') ? 'image' as const :
                file.type.startsWith('video/') ? 'video' as const : 'file' as const,
          url: file.url,
          name: file.name,
          size: file.size
        }))
      }));
      setMessages(sessionMessages);
    } else {
      setMessages([
        { 
          id: 'welcome', 
          role: 'assistant', 
          text: '**Hi!** Ich bin bereit. Schick Text, Bilder, Videos oder Audio. Du kannst auch **Enter** zum Senden verwenden. Wenn ich Bilder oder Videos generiere, kannst du sie **anklicken um sie zu markieren** und in deiner nächsten Nachricht zu referenzieren.',
          timestamp: Date.now()
        },
      ]);
    }
    setSelectedMedia([]);
  }, [currentSession]);

  const handleMediaSelect = (mediaUrl: string, isSelected: boolean) => {
    setSelectedMedia(prev => {
      if (isSelected) {
        return [...prev, mediaUrl];
      } else {
        return prev.filter(url => url !== mediaUrl);
      }
    });
  };

  const clearSelection = () => {
    setSelectedMedia([]);
  };

  const sendToBackend = async (payload: { text: string; files: File[]; selectedMedia: string[] }) => {
    if (!payload.text.trim() && payload.files.length === 0 && payload.selectedMedia.length === 0) return;

    // 1) User-Message erstellen
    const media = (payload.files || []).map((f) => {
      const url = URL.createObjectURL(f);
      if (f.type.startsWith('image/')) return { type: 'image' as const, url, alt: f.name };
      if (f.type.startsWith('video/')) return { type: 'video' as const, url };
      return { type: 'file' as const, url, name: f.name, size: f.size };
    });

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: payload.text || undefined,
      media,
      selectedMedia: payload.selectedMedia, // Speichere die Auswahl
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // 2) Backend-Request
    setBusy(true);
    try {
      // Bereite Kontext vor (inkl. ausgewählte Medien)
      let contextText = payload.text || '';
      if (payload.selectedMedia.length > 0) {
        contextText += `\n\n[Nutzer hat ${payload.selectedMedia.length} Medium${payload.selectedMedia.length !== 1 ? 'en' : ''} aus dem Chat-Verlauf ausgewählt und referenziert diese in der Nachricht.]`;
      }

      const requestBody = JSON.stringify({
        messages: [
          ...messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            content: m.text || '[Media content]'
          })),
          { role: 'user', content: contextText }
        ],
        model: 'llama3.1-70b',
        apiEndpoint: 'http://localhost:11434'
      });

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Streaming-Response verarbeiten
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      
      // Assistant-Message vorbereiten (könnte Medien generieren)
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: '',
        timestamp: Date.now(),
        // Simuliere generierte Medien (in echter Implementation würde dies vom Backend kommen)
        media: Math.random() > 0.7 ? [
          {
            type: 'image' as const,
            url: `https://picsum.photos/400/300?random=${Date.now()}`,
            alt: 'Generated image'
          }
        ] : undefined
      };
      
      setMessages((prev) => [...prev, assistantMsg]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantText += parsed.content;
                  setMessages((prev) => 
                    prev.map((msg) => 
                      msg.id === assistantMsg.id 
                        ? { ...msg, text: assistantText }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignoriere Parse-Fehler
              }
            }
          }
        }
      }

      // Session aktualisieren falls vorhanden
      if (currentSession) {
        const updatedMessages = [
          ...currentSession.messages,
          {
            id: userMsg.id,
            role: userMsg.role,
            content: userMsg.text || '[Media content with selection]',
            timestamp: userMsg.timestamp,
            files: payload.files.map(f => ({
              id: crypto.randomUUID(),
              name: f.name,
              type: f.type,
              size: f.size,
              url: URL.createObjectURL(f)
            }))
          },
          {
            id: assistantMsg.id,
            role: assistantMsg.role,
            content: assistantText,
            timestamp: assistantMsg.timestamp,
          }
        ];

        const updatedSession = {
          ...currentSession,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };

        dispatch({ type: 'SET_CURRENT_SESSION', payload: updatedSession });

        // Session speichern
        await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSession),
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: '❌ Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Nachricht.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
      setSelectedMedia([]); // Auswahl nach dem Senden zurücksetzen
    }
  };

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
    <div className="h-full w-full flex flex-col">
      {/* Message List */}
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
              <SelectableMediaMessage 
                m={message}
                selectedMedia={selectedMedia}
                onMediaSelect={handleMediaSelect}
              />
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Chat Input */}
      <ChatInputWithSelection 
        onSend={sendToBackend} 
        disabled={busy} 
        selectedMedia={selectedMedia}
        onClearSelection={clearSelection}
      />
    </div>
  );
}