"use client";
import React from "react";
import MediaViewer from "./MediaViewer";

// Kompatibel zu deiner bestehenden MessageItem-Definition
type Media =
  | { type: "image"; url: string; alt?: string }
  | { type: "video"; url: string; poster?: string }
  | { type: "file";  url: string; name?: string; size?: number };

function basename(u: string) {
  try {
    const p = new URL(u);
    return (p.pathname.split('/').pop() || u) as string;
  } catch {
    const parts = u.split('/');
    return parts[parts.length - 1] || u;
  }
}

export default function MediaRenderer({ items }: { items: Media[] }) {
  if (!items?.length) return null;

  return (
    <div className="mt-3 space-y-3">
      {items.map((m, idx) => {
        // Mappe auf das Datei-Format, das dein MediaViewer erwartet
        const id = `${idx}-${m.type}`;
        if (m.type === "image") {
          return (
            <MediaViewer
              key={id}
              file={{ id, name: m.alt ?? basename(m.url), type: "image/*", size: 0, url: m.url }}
            />
          );
        }
        if (m.type === "video") {
          return (
            <MediaViewer
              key={id}
              file={{ id, name: basename(m.url), type: "video/*", size: 0, url: m.url }}
            />
          );
        }
        // file
        return (
          <MediaViewer
            key={id}
            file={{ id, name: m.name ?? basename(m.url), type: "application/octet-stream", size: m.size ?? 0, url: m.url }}
          />
        );
      })}
    </div>
  );
}
