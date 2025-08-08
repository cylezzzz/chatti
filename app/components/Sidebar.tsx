'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquarePlus, 
  Settings, 
  Menu, 
  X, 
  MessageSquare, 
  Trash2,
  Package,
  Download,
  Upload
} from 'lucide-react';
import { useApp } from '@/app/contexts/AppContext';
import { ChatSession, Addon } from '@/app/types';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { sidebarOpen, sessions, addons, currentSession, activeAddon } = state;

  useEffect(() => {
    loadSessions();
    loadAddons();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_SESSIONS', payload: data.sessions });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadAddons = async () => {
    try {
      const response = await fetch('/api/addons');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_ADDONS', payload: data.addons });
      }
    } catch (error) {
      console.error('Failed to load addons:', error);
    }
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
    dispatch({ type: 'SET_ACTIVE_ADDON', payload: null });
  };

  const selectSession = (session: ChatSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    const sessionAddon = addons.find(addon => addon.id === session.addonId);
    dispatch({ type: 'SET_ACTIVE_ADDON', payload: sessionAddon || null });
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch('/api/chats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      loadSessions();
      if (currentSession?.id === sessionId) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const selectAddon = (addon: Addon) => {
    if (!addon.nsfw || addon.enabled) {
      dispatch({ type: 'SET_ACTIVE_ADDON', payload: addon });
    }
  };

  const enabledAddons = addons.filter(addon => addon.enabled && !addon.nsfw);

  if (!sidebarOpen) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
           onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} />
      
      <aside className={cn(
        "fixed left-0 top-0 h-full w-80 bg-background border-r z-50 flex flex-col",
        "lg:relative lg:z-auto"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">AI Chat</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={createNewChat}
            className="w-full justify-start"
            variant={currentSession ? "outline" : "default"}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 py-4">
            {/* Chat History */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Chat History
              </h3>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent",
                      currentSession?.id === session.id && "bg-accent"
                    )}
                    onClick={() => selectSession(session)}
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">
                      {session.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => deleteSession(session.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No chat history</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Addon Library */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Addon Library
              </h3>
              <div className="space-y-2">
                {enabledAddons.map((addon) => (
                  <div 
                    key={addon.id}
                    className={cn(
                      "p-3 rounded-md border cursor-pointer transition-colors",
                      "hover:border-primary/50 hover:bg-accent/50",
                      activeAddon?.id === addon.id && "border-primary bg-accent"
                    )}
                    onClick={() => selectAddon(addon)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{addon.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {addon.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {addon.description}
                    </p>
                  </div>
                ))}
                {enabledAddons.length === 0 && (
                  <p className="text-sm text-muted-foreground">No addons available</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator />
        
        <div className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Package className="mr-2 h-4 w-4" />
            Manage Addons
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </aside>
    </>
  );
}