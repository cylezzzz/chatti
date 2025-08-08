'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, Paperclip, Menu } from 'lucide-react';
import { useApp } from '@/app/contexts/AppContext';
import { Message, ChatSession } from '@/app/types';
import ChatMessage from './ChatMessage';
import AddonForm from './AddonForm';

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { state, dispatch } = useApp();
  const { currentSession, activeAddon, settings, sidebarOpen } = state;

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const saveSession = async (session: ChatSession) => {
    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      
      // Update sessions list
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_SESSIONS', payload: data.sessions });
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const generatePrompt = (addonData: Record<string, any>) => {
    let prompt = activeAddon!.prompt;
    
    // Replace placeholders in prompt with actual values
    Object.entries(addonData).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    return prompt;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    let session = currentSession;
    if (!session) {
      session = {
        id: Date.now().toString(),
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        addonId: activeAddon?.id,
      };
      dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { sessionId: session.id, message: userMessage },
    });

    setInputMessage('');
    setIsStreaming(true);

    try {
      const messages = [
        ...session.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content },
      ];

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: settings.model,
          apiEndpoint: settings.apiEndpoint,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { sessionId: session.id, message: assistantMessage },
      });

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              // Save session after completion
              const updatedSession = { ...session, updatedAt: Date.now() };
              await saveSession(updatedSession);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                dispatch({
                  type: 'ADD_MESSAGE',
                  payload: { 
                    sessionId: session.id, 
                    message: { ...assistantMessage, content: assistantMessage.content } 
                  },
                });
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: Date.now(),
      };
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { sessionId: session.id, message: errorMessage },
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAddonSubmit = (addonData: Record<string, any>) => {
    const prompt = generatePrompt(addonData);
    sendMessage(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <h2 className="font-semibold">
            {currentSession?.title || 'New Chat'}
          </h2>
        </div>
        {activeAddon && (
          <div className="text-sm text-muted-foreground">
            Using: {activeAddon.name}
          </div>
        )}
      </div>

      {/* Addon Form */}
      {activeAddon && (
        <div className="p-4 border-b bg-muted/20">
          <AddonForm
            addon={activeAddon}
            onSubmit={handleAddonSubmit}
            isLoading={isStreaming}
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {currentSession?.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Welcome to AI Chat</h3>
                <p className="text-muted-foreground max-w-md">
                  Start a conversation or select an addon from the sidebar to get started.
                  {activeAddon && ` Currently using: ${activeAddon.name}`}
                </p>
              </div>
            </div>
          ) : (
            currentSession?.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          
          {isStreaming && (
            <div className="flex gap-3 py-4">
              <div className="flex-1">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={activeAddon ? "Ask a follow-up question..." : "Type your message..."}
              disabled={isStreaming}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={!inputMessage.trim() || isStreaming}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}