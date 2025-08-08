'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { Message } from '@/app/types';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import MediaViewer from './MediaViewer';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderFilePreview = (file: any) => {
    return (
      <div className="mt-3">
        <MediaViewer file={file} />
      </div>
    );
  };

  return (
    <div className={cn(
      "flex gap-3 py-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] space-y-2",
        isUser && "order-2"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted"
        )}>
          <ReactMarkdown
            className="prose dark:prose-invert max-w-none"
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');
                
                if (!inline && match) {
                  return (
                    <div className="relative">
                      <pre className="bg-muted-foreground/10 p-4 rounded overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(code)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                }
                
                return (
                  <code
                    className="bg-muted-foreground/20 px-1 py-0.5 rounded text-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>

          {message.files?.map((file) => (
            <div key={file.id}>
              {renderFilePreview(file)}
            </div>
          ))}
        </div>

        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span>{formatTimestamp(message.timestamp)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(message.content)}
            className="h-6 px-2"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}