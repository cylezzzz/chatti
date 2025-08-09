'use client';

import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
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
};

export default function ChatInterface() {
  const { state, dispatch } = useApp();
  const { currentSession } = state;
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'assistant', 
      text: '**Hi!** Ich bin bereit. Schick Text, Bilder, Videos oder Audio. Du kannst auch **Enter** zum Senden verwenden.',
      timestamp: Date.now()
    },
  ]);
  const [busy, setBusy] = useState(false);

  // Lade Chat-History wenn Session gewechselt wird
  useEffect(() => {
    if (currentSession && currentSession.messages.length > 0) {
      const sessionMessages: ChatMessage[] = currentSession.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        text: msg.content,
        timestamp: msg.timestamp,
        // Konvertiere attachments zu media falls vorhanden
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
      // Neue Session - zeige Welcome Message
      setMessages([
        { 
          id: 'welcome', 
          role: 'assistant', 
          text: '**Hi!** Ich bin bereit. Schick Text, Bilder, Videos oder Audio. Du kannst auch **Enter** zum Senden verwenden.',
          timestamp: Date.now()
        },
      ]);
    }
  }, [currentSession]);

  const sendToBackend = async (payload: { text: string; files: File[] }) => {
    if (!payload.text.trim() && payload.files.length === 0) return;

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
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // 2) Backend-Request
    setBusy(true);
    try {
      // Streaming-Request vorbereiten
      const requestBody = JSON.stringify({
        messages: [
          ...messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            content: m.text || '[Media content]'
          })),
          { role: 'user', content: payload.text || '[Media content]' }
        ],
        model: 'llama3.1-70b', // Standard Chat-Modell
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
      
      // Assistant-Message vorbereiten
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: '',
        timestamp: Date.now(),
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
            content: userMsg.text || '[Media content]',
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
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <MessageList messages={messages} />
      <ChatInput onSend={sendToBackend} disabled={busy} />
    </div>
  );
}