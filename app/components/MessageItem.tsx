"use client";
import React from "react";
import {ChatBubble} from "./ChatBubble";
import {MarkdownMessage} from "./MarkdownMessage";
import {MediaRenderer} from "./MediaRenderer";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text?: string;           // markdown
  media?: Array<
    | { type: "image"; url: string; alt?: string }
    | { type: "video"; url: string; poster?: string }
    | { type: "file";  url: string; name?: string }
  >;
};

export function MessageItem({m}:{m:ChatMessage}) {
  return (
    <ChatBubble role={m.role}>
      <div className="space-y-2">
        {m.text && <MarkdownMessage text={m.text} />}
        {!!m.media?.length && <MediaRenderer items={m.media!} />}
      </div>
    </ChatBubble>
  );
}
