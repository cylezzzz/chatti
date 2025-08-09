"use client";
import React, {useState} from "react";
import {MessageList, ChatMessage} from "./MessageList";
import {ChatInput} from "./ChatInput";

export default function ChatWindow() {
  const [messages,setMessages] = useState<ChatMessage[]>([
    {id:"hello", role:"assistant", text:"**Hi!** Ich bin bereit. Schick Text, Bilder oder Videos."}
  ]);
  const [busy,setBusy] = useState(false);

  const sendToBackend = async (payload:{text:string; files:File[]}) => {
    // TODO: hier deinen Streaming-Endpoint /api/chat/stream anbinden
    // Files kannst du via FormData hochladen. Fürs Demo: sofort echo.
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: payload.text || undefined,
      media: (payload.files || []).map(f => {
        const url = URL.createObjectURL(f);
        const isVideo = f.type.startsWith("video/");
        const isImage = f.type.startsWith("image/");
        return isVideo ? {type:"video", url} :
               isImage ? {type:"image", url} :
               {type:"file", url, name:f.name};
      })
    };
    setMessages(prev => [...prev, newMsg]);

    setBusy(true);
    // fake response
    await new Promise(r=>setTimeout(r, 600));
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "✅ Empfangen. Ich analysiere das Material gleich…"
    }]);
    setBusy(false);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <MessageList messages={messages} />
      <ChatInput onSend={sendToBackend} disabled={busy} />
    </div>
  );
}
