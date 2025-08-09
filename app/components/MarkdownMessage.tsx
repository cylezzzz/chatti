"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {CodeBlock} from "./CodeBlock";

export function MarkdownMessage({text}:{text:string}) {
  return (
    <div className="prose prose-invert prose-pre:p-0 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children ?? "");
            if (inline) {
              return (
                <code className="bg-zinc-800 px-1 py-0.5 rounded" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <CodeBlock
                code={code.trimEnd()}
                language={match?.[1] ?? "text"}
              />
            );
          },
          a({children, href}) {
            return (
              <a href={href} target="_blank" className="text-blue-400 underline">
                {children}
              </a>
            );
          }
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
