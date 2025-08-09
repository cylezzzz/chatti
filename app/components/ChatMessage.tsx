'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({
  role,
  content,
}: {
  role: 'user' | 'assistant';
  content: string;
}) {
  return (
    <div className={`mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`}>
      {/* Wichtig: Styling nicht auf ReactMarkdown, sondern auf den Wrapper */}
      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
