'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { ChatInputWithSelection } from './ChatInputWithSelection';
import { useApp } from '@/app/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Wand2, 
  Palette,
  Camera,
  Film,
  Zap
} from 'lucide-react';

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
  selectedMedia?: string[];
  contentType?: 'text' | 'image' | 'video' | 'mixed';
};

const QUICK_ACTIONS = [
  {
    id: 'text2image',
    icon: Palette,
    label: 'Text → Bild',
    description: 'Erstelle Bilder aus Beschreibungen',
    gradient: 'from-purple-500 to-pink-600',
    action: 'Erstelle ein Bild basierend auf:'
  },
  {
    id: 'image2image',
    icon: Wand2,
    label: 'Bild bearbeiten',
    description: 'Verändere vorhandene Bilder',
    gradient: 'from-blue-500 to-cyan-600',
    action: 'Bearbeite das Bild:'
  },
  {
    id: 'image2video',
    icon: Film,
    label: 'Bild → Video',
    description: 'Animiere Bilder zu Videos',
    gradient: 'from-orange-500 to-red-600',
    action: 'Animiere das Bild:'
  },
  {
    id: 'face_save',
    icon: Camera,
    label: 'Gesicht speichern',
    description: 'Speichere Gesichter für spätere Nutzung',
    gradient: 'from-green-500 to-emerald-600',
    action: 'Gesicht aus dem Bild speichern'
  }
];

export default function ChatInterface() {
  const { state, dispatch } = useApp();
  const { currentSession } = state;
  const endRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'assistant', 
      text: '🎨 **Willkommen bei Writeora!** \n\nIch kann dir bei der Content-Generierung helfen:\n\n• **Text → Bild**: Beschreibe, was du sehen möchtest\n• **Bild bearbeiten**: Lade ein Bild hoch und beschreibe Änderungen\n• **Bild → Video**: Animiere statische Bilder\n• **Gesichter speichern**: Für konsistente Charaktere\n\nWähle eine Quick Action oder beschreibe einfach, was du erstellen möchtest!',
      timestamp: Date.now(),
      contentType: 'text'
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);

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
        selectedMedia: [],
        contentType: 'text',
        media: msg.files?.map(file => ({
          type: file.type.startsWith('image/') ? 'image' as const :
                file.type.startsWith('video/') ? 'video' as const : 'file' as const,
          url: file.url,
          name: file.name,
          size: file.size
        }))
      }));
      setMessages(sessionMessages);
      setShowQuickActions(sessionMessages.length <= 1);
    } else {
      setMessages([
        { 
          id: 'welcome', 
          role: 'assistant', 
          text: '🎨 **Willkommen bei Writeora!** \n\nIch kann dir bei der Content-Generierung helfen:\n\n• **Text → Bild**: Beschreibe, was du sehen möchtest\n• **Bild bearbeiten**: Lade ein Bild hoch und beschreibe Änderungen\n• **Bild → Video**: Animiere statische Bilder\n• **Gesichter speichern**: Für konsistente Charaktere\n\nWähle eine Quick Action oder beschreibe einfach, was du erstellen möchtest!',
          timestamp: Date.now(),
          contentType: 'text'
        },
      ]);
      setShowQuickActions(true);
    }
    setSelectedMedia([]);
  }, [currentSession]);

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    const quickMessage = action.action;
    sendToBackend({ text: quickMessage, files: [], selectedMedia: [] });
    setShowQuickActions(false);
  };

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

  const detectContentType = (text: string, files: File[], selectedMedia: string[]): ChatMessage['contentType'] => {
    if (files.length > 0 || selectedMedia.length > 0) return 'mixed';
    if (/\b(bild|video|animiere|generiere|erstelle)\b/i.test(text)) return 'image';
    return 'text';
  };

  const generateDemoContent = (prompt: string): ChatMessage['media'] => {
    const isImageRequest = /\b(bild|image|foto|picture|draw|paint|generate)\b/i.test(prompt);
    const isVideoRequest = /\b(video|animiere|animate|bewege|move)\b/i.test(prompt);
    
    if (isVideoRequest) {
      return [{
        type: 'video' as const,
        url: `https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4?t=${Date.now()}`,
        poster: `https://picsum.photos/400/300?random=${Date.now()}`
      }];
    } else if (isImageRequest) {
      return [{
        type: 'image' as const,
        url: `https://picsum.photos/512/512?random=${Date.now()}`,
        alt: 'Generiertes Bild'
      }];
    }
    
    return undefined;
  };

  const sendToBackend = async (payload: { text: string; files: File[]; selectedMedia: string[] }) => {
    if (!payload.text.trim() && payload.files.length === 0 && payload.selectedMedia.length === 0) return;

    setShowQuickActions(false);

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
      selectedMedia: payload.selectedMedia,
      timestamp: Date.now(),
      contentType: detectContentType(payload.text, payload.files, payload.selectedMedia)
    };

    setMessages((prev) => [...prev, userMsg]);

    // 2) Backend-Request
    setBusy(true);
    try {
      // Bereite Kontext vor
      let contextText = payload.text || '';
      if (payload.selectedMedia.length > 0) {
        contextText += `\n\n[Nutzer hat ${payload.selectedMedia.length} Medium${payload.selectedMedia.length !== 1 ? 'en' : ''} ausgewählt und möchte diese bearbeiten.]`;
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
      
      // Generiere Demo-Content basierend auf dem Prompt
      const demoMedia = generateDemoContent(payload.text);
      
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: '',
        timestamp: Date.now(),
        media: demoMedia,
        contentType: demoMedia ? (demoMedia[0].type === 'video' ? 'video' : 'image') : 'text'
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

      // Füge Standard-Antwort hinzu falls kein Stream
      if (!assistantText) {
        const defaultResponses = {
          image: '🎨 **Bild generiert!** Das Bild wurde basierend auf deiner Beschreibung erstellt. Du kannst es anklicken um es zu markieren und weitere Änderungen vornehmen.',
          video: '🎬 **Video erstellt!** Dein animiertes Video ist fertig. Du kannst es herunterladen oder weitere Bearbeitungen vornehmen.',
          text: '✨ **Verstanden!** Lass mich dir dabei helfen. Was genau möchtest du erstellen oder bearbeiten?'
        };
        
        const responseText = defaultResponses[assistantMsg.contentType || 'text'];
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === assistantMsg.id 
              ? { ...msg, text: responseText }
              : msg
          )
        );
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
          contentType: 'text'
        },
      ]);
    } finally {
      setBusy(false);
      setSelectedMedia([]);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header mit Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Content Studio</h1>
              <p className="text-white/80 text-sm">Erstelle, bearbeite und animiere Inhalte</p>
            </div>
          </div>
          {selectedMedia.length > 0 && (
            <Badge className="bg-white/20 text-white border-white/30">
              {selectedMedia.length} Medium{selectedMedia.length !== 1 ? 'en' : ''} ausgewählt
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="p-6 border-b border-slate-700/50">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              Quick Actions
            </h2>
            <p className="text-slate-400 text-sm">Wähle eine Aktion oder beschreibe einfach, was du erstellen möchtest</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Card 
                key={action.id}
                className="group relative overflow-hidden border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleQuickAction(action)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="p-4 relative z-10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{action.label}</h3>
                  <p className="text-slate-400 text-sm">{action.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <ChatInputWithSelection 
          onSend={sendToBackend} 
          disabled={busy} 
          selectedMedia={selectedMedia}
          onClearSelection={clearSelection}
        />
      </div>
    </div>
  );
}