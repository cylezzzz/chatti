'use client';

import React, { useState } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text?: string;
  media?: Array<
    | { type: 'image'; url: string; alt?: string }
    | { type: 'video'; url: string; poster?: string }
    | { type: 'file'; url: string; name?: string; size?: number }
  >;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'hello', role: 'assistant', text: '**Hi!** Ich bin bereit. Schick Text, Bilder, Videos oder Audio.' },
  ]);
  const [busy, setBusy] = useState(false);

  const sendToBackend = async (payload: { text: string; files: File[] }) => {
    // 1) User-Message anhängen
    const media = (payload.files || []).map((f) => {
      const url = URL.createObjectURL(f);
      if (f.type.startsWith('image/')) return { type: 'image' as const, url };
      if (f.type.startsWith('video/')) return { type: 'video' as const, url };
      return { type: 'file' as const, url, name: f.name, size: f.size };
    });
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: payload.text || undefined,
      media,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2) Backend ansprechen (Stub) – hier deinen Streaming-Endpoint /api/chat/stream anbinden
    setBusy(true);
    try {
      // Beispiel:
      // const fd = new FormData();
      // fd.append('message', payload.text);
      // payload.files.forEach(f => fd.append('files', f));
      // const res = await fetch('/api/chat/stream', { method: 'POST', body: fd });
      // -> Stream lesen und Stücke in Assistant-Nachricht schreiben

      await new Promise((r) => setTimeout(r, 500));
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text:
            '✅ Empfangen. (Hier käme dein echter Stream-Output. Markdown & Code werden formatiert, Medien laufen im Player.)',
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
