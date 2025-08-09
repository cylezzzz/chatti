// app/components/ChatInterface.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

/** kleine Klassen-Merger, absichtlich NICHT "cn" genannt um Konflikte zu vermeiden */
function cx(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

/** Types */
type Role = "user" | "assistant" | "system";
type MediaType = "image" | "video";

interface MediaItem {
  url: string;
  type?: MediaType;
  thumbnailUrl?: string;
  alt?: string;
}

interface ChatMessage {
  id: string;
  role: Role;
  text?: string;
  media?: MediaItem[];
}

interface ChatInterfaceProps {
  className?: string;
  initialMessages?: ChatMessage[];
  onSend?: (payload: { text: string; files: File[] }) => Promise<void> | void;
}

/** Helfer: Typ aus URL ableiten */
function guessTypeFromUrl(url: string): MediaType {
  const u = url.toLowerCase();
  if (u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".ogg")) return "video";
  return "image";
}

/** MediaCard – rendert Bild ODER Video */
function MediaCard({ item, className }: { item: MediaItem; className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaType: MediaType = item.type ?? guessTypeFromUrl(item.url);
  const isVideo = mediaType === "video";

  if (isVideo) {
    return (
      <div
        ref={containerRef}
        className={cx("relative bg-black rounded-lg overflow-hidden group", className)}
      >
        <video
          src={item.url}
          controls
          className="w-full h-auto"
          {...(item.thumbnailUrl ? { poster: item.thumbnailUrl } : {})}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cx("relative rounded-lg overflow-hidden group", className)}>
      <Image
        src={item.url}
        alt={item.alt ?? "image"}
        width={1200}
        height={800}
        className="w-full h-auto object-cover"
        unoptimized
        priority={false}
      />
    </div>
  );
}

/** Chat-Bubble */
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cx("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[85%] rounded-2xl p-3",
          isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-slate-800 text-slate-100 rounded-tl-sm"
        )}
      >
        {msg.text && <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>}
        {msg.media && msg.media.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {msg.media.map((m, i) => (
              <MediaCard key={i} item={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Hauptelement: ChatInterface */
export default function ChatInterface({ className, initialMessages, onSend }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [
      { id: "welcome", role: "assistant", text: "Hi! Sende Text oder hänge Medien an." },
    ]
  );
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [messages.length]);

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    const hasFiles = files.length > 0;
    if (!trimmed && !hasFiles) return;

    const media: MediaItem[] = files.map((f) => {
      const url = URL.createObjectURL(f);
      const type: MediaType = f.type.startsWith("video/") ? "video" : "image";
      return { url, type, alt: f.name };
    });

    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      text: trimmed || undefined,
      media: media.length ? media : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      if (onSend) {
        await onSend({ text: trimmed, files });
      } else {
        const reply: ChatMessage = {
          id: `assist-${Date.now()}`,
          role: "assistant",
          text:
            "Alles klar, empfangen." +
            (media.length ? ` (${media.length} Datei${media.length > 1 ? "en" : ""})` : ""),
        };
        setMessages((prev) => [...prev, reply]);
      }
    } finally {
      setText("");
      setFiles([]);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = e.target.files;
    if (!fs) return;
    setFiles(Array.from(fs));
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className={cx("flex h-full w-full flex-col", className)}>
      {/* Verlauf */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
        {messages.map((m) => (
          <ChatBubble key={m.id} msg={m} />
        ))}
      </div>

      {/* Eingabe */}
      <form onSubmit={handleSend} className="border-t border-slate-800 bg-slate-950 p-3">
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md bg-slate-800 px-2 py-1">
                <span className="text-sm text-slate-200 truncate max-w-[200px]">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-slate-300 hover:text-white"
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={onFileChange}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            Dateien
          </label>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nachricht eingeben…"
            className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
          >
            Senden
          </button>
        </div>
      </form>
    </div>
  );
}
