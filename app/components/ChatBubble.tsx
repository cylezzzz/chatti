"use client";
import clsx from "clsx";
import React from "react";

type Role = "user" | "assistant" | "system";

export function ChatBubble({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <div className={clsx("w-full flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[82%] rounded-2xl px-4 py-3 shadow",
          isUser &&
            "bg-blue-600 text-white rounded-tr-sm border border-blue-500",
          isAssistant &&
            "bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700",
          role === "system" &&
            "bg-amber-100 text-amber-900 border border-amber-300"
        )}
      >
        {children}
      </div>
    </div>
  );
}
