"use client";
import React from "react";
import {Copy} from "lucide-react";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/esm/styles/prism";

export function CodeBlock({
  code,
  language = "tsx",
  filename,
}: {
  code: string;
  language?: string;
  filename?: string;
}) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch { /* ignore */ }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
        <div className="text-xs text-zinc-300 font-mono truncate">
          {filename ?? `${language} snippet`}
        </div>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
          title="Copy"
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{margin: 0, background: "transparent"}}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
