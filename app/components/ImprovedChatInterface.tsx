// app/components/ImprovedChatInterface.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Send,
  Paperclip,
  Bot,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { UnifiedMessage, MediaAttachment, Addon } from '@/app/types/unified';

interface ChatInterfaceProps {
  session?: {
    id: string;
    messages: UnifiedMessage[];
  };
  addons: Addon[];
  onSendMessage: (content: string, files: File[]) => Promise<void>;
  onSelectMedia?: (mediaUrls: string[]) => void;
}

export default function ImprovedChatInterface({ 
  session, 
  addons, 
  onSendMessage,
  onSelectMedia 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // Addon-Vorschläge basierend auf Input
  const suggestedAddons = useCallback(() => {
    if (!input.trim()) return [];
    
    return addons.filter(addon => {
      if (!addon.trigger.keywords) return false;
      return addon.trigger.keywords.some(keyword => 
        input.toLowerCase().includes(keyword.toLowerCase())
      );
    }).slice(0, 3);
  }, [input, addons]);

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onSendMessage(input, files);
      setInput('');
      setFiles([]);
      setSelectedMedia([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addFile = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setFiles(prev => [...prev, ...Array.from(newFiles)]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleMediaSelection = (mediaUrl: string) => {
    setSelectedMedia(prev => {
      const isSelected = prev.includes(mediaUrl);
      const newSelection = isSelected 
        ? prev.filter(url => url !== mediaUrl)
        : [...prev, mediaUrl];
      
      onSelectMedia?.(newSelection);
      return newSelection;
    });
  };

  const applyAddonPrompt = (addon: Addon) => {
    setInput(prev => {
      if (prev.trim()) {
        return `${prev}\n\n[${addon.name}]: `;
      }
      return `[${addon.name}]: `;
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Writeora Chat</h1>
              <p className="text-white/80 text-sm">
                {session?.messages.length || 0} Nachrichten
              </p>
            </div>
          </div>
          
          {selectedMedia.length > 0 && (
            <Badge className="bg-white/20 text-white border-white/30">
              {selectedMedia.length} Medium{selectedMedia.length !== 1 ? 'en' : ''} ausgewählt
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {session?.messages.map((message) => (
            <MessageRenderer
              key={message.id}
              message={message}
              selectedMedia={selectedMedia}
              onToggleMediaSelection={toggleMediaSelection}
            />
          ))}
          
          {isProcessing && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-4">
        {/* Addon Suggestions */}
        {suggestedAddons().length > 0 && (
          <div className="mb-3">
            <div className="text-sm text-slate-400 mb-2">Empfohlene Addons:</div>
            <div className="flex gap-2">
              {suggestedAddons().map(addon => (
                <Button
                  key={addon.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyAddonPrompt(addon)}
                  className="border-slate-600 hover:border-slate-500"
                >
                  {addon.ui?.icon && <span className="mr-1">{addon.ui.icon}</span>}
                  {addon.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* File Previews */}
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <FilePreview
                key={index}
                file={file}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        )}

        {/* Selected Media Display */}
        {selectedMedia.length > 0 && (
          <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-sm text-blue-300 mb-2">
              {selectedMedia.length} Medium{selectedMedia.length !== 1 ? 'en' : ''} für Bearbeitung ausgewählt
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
            disabled={isProcessing}
          >
            <Paperclip className="w-5 h-5 text-slate-300" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFile(e.target.files)}
          />
          
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Schreibe eine Nachricht... (Enter = Senden)"
              disabled={isProcessing}
              rows={Math.min(4, Math.max(1, input.split('\n').length))}
              className="w-full resize-none rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={isProcessing || (!input.trim() && files.length === 0)}
            className="bg-blue-600 hover:bg-blue-500 px-6 h-12"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Message Renderer Component
function MessageRenderer({ 
  message, 
  selectedMedia, 
  onToggleMediaSelection 
}: {
  message: UnifiedMessage;
  selectedMedia: string[];
  onToggleMediaSelection: (url: string) => void;
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-600' 
          : 'bg-purple-600'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      
      {/* Content */}
      <div className={`max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
        <Card className={`p-4 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-800 text-slate-100 border-slate-700'
        }`}>
          {message.content && (
            <div className="mb-2 whitespace-pre-wrap">
              {message.content}
            </div>
          )}
          
          {message.media && message.media.length > 0 && (
            <MediaGrid 
              media={message.media}
              selectedMedia={selectedMedia}
              onToggleSelection={onToggleMediaSelection}
            />
          )}
        </Card>
        
        <div className="text-xs text-slate-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

// Supporting Components
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
          </div>
          <span className="text-slate-400 text-sm">KI tippt...</span>
        </div>
      </Card>
    </div>
  );
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600">
      <span className="text-sm">{file.name}</span>
      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-red-400"
      >
        ×
      </button>
    </div>
  );
}

function MediaGrid({ 
  media, 
  selectedMedia, 
  onToggleSelection 
}: {
  media: MediaAttachment[];
  selectedMedia: string[];
  onToggleSelection: (url: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {media.map((item) => {
        const isSelected = selectedMedia.includes(item.url);
        
        return (
          <div 
            key={item.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              isSelected ? 'border-cyan-500' : 'border-transparent'
            }`}
            onClick={() => onToggleSelection(item.url)}
          >
            {item.type === 'image' && (
              <img 
                src={item.url} 
                alt={item.alt}
                className="w-full h-32 object-cover"
              />
            )}
            {item.type === 'video' && (
              <video 
                src={item.url}
                poster={item.poster}
                className="w-full h-32 object-cover"
                controls={false}
              />
            )}
            
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}