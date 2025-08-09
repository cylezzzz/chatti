"use client";
import React, {useEffect, useRef} from "react";
import {MessageItem, ChatMessage} from "./MessageItem";

export function MessageList({messages}:{messages:ChatMessage[]}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth", block:"end"});
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map(m => <MessageItem key={m.id} m={m} />)}
      <div ref={endRef} />
    </div>
  );
}
