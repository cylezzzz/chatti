'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquarePlus,
  Settings,
  X,
  MessageSquare,
  Trash2,
  Package,
  Menu,
  History,
  Sparkles,
  Image,
  Video,
  Palette,
  Wand2,
  Camera,
  User
} from 'lucide-react';
import { useApp } from '@/app/contexts/AppContext';
import { ChatSession, Addon } from '@/app/types';
import { cn } from '@/lib/utils';
import PlaceholderModal from './PlaceholderModal';
import ResizableAddonManager from './ResizableAddonManager';
import SettingsModal from './SettingsModal';

const CONTENT_TOOLS = [
  {
    id: 'text2image',
    icon: Palette,
    label: 'Text → Bild',
    description: 'Erstelle Bilder aus Text',
    gradient: 'from-purple-500 to-pink-600',
    count: 12
  },
  {
    id: 'image2image',
    icon: Wand2,
    label: 'Bild bearbeiten',
    description: 'Verändere Bilder',
    gradient: 'from-blue-500 to-cyan-600',
    count: 8
  },
  {
    id: 'image2video',
    icon: Video,
    label: 'Bild → Video',
    description: 'Animiere Bilder',
    gradient: 'from-orange-500 to-red-600',
    count: 5
  },
  {
    id: 'face_library',
    icon: User,
    label: 'Gesichter',
    description: 'Gespeicherte Gesichter',
    gradient: 'from-green-500 to-emerald-600',
    count: 3
  }
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { sidebarOpen, sessions, addons, currentSession, activeAddon } = state;

  const [showManage, setShowManage] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddonManager, setShowAddonManager] = useState(false);

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
      title: 'Neuer Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
    dispatch({ type: 'SET_ACTIVE_ADDON', payload: null });
  };

  const selectSession = (session: ChatSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    const sessionAddon = addons.find((addon) => addon.id === session.addonId);
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

  const getSessionIcon = (session: ChatSession) => {
    // Bestimme Icon basierend auf Session-Inhalt
    const hasImages = session.messages.some(m => m.files?.some(f => f.type.startsWith('image/')));
    const hasVideos = session.messages.some(m => m.files?.some(f => f.type.startsWith('video/')));
    
    if (hasVideos) return Video;
    if (hasImages) return Image;
    return MessageSquare;
  };

  if (!sidebarOpen) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="bg-slate-800/80 backdrop-blur-sm border-slate-700 hover:bg-slate-700"
          title="Sidebar öffnen"
        >
          <Menu className="h-4 w-4 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
      />
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-r border-slate-700 z-50 flex flex-col',
          'lg:relative lg:z-auto'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-purple-600/20 to-cyan-600/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Writeora</h1>
                <p className="text-xs text-slate-400">Content Studio</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
              title="Sidebar schließen"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={createNewChat}
            className="w-full justify-start bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border-0 text-white font-medium"
            variant={currentSession ? 'outline' : 'default'}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Neuer Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 py-4">
            {/* Content Tools */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Content Tools
              </h3>
              <div className="space-y-2">
                {CONTENT_TOOLS.map((tool) => (
                  <div
                    key={tool.id}
                    className="group p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 cursor-pointer transition-all duration-200"
                    onClick={() => {/* Tool action */}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.gradient}`}>
                        <tool.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{tool.label}</span>
                          <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                            {tool.count}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Chat History */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Verlauf
                <Badge variant="secondary" className="ml-auto text-xs bg-slate-700 text-slate-300">
                  {sessions.length}
                </Badge>
              </h3>
              <div className="space-y-1">
                {sessions.map((session) => {
                  const SessionIcon = getSessionIcon(session);
                  return (
                    <div
                      key={session.id}
                      className={cn(
                        'group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
                        'hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50',
                        currentSession?.id === session.id && 'bg-slate-700/70 border-slate-600/70'
                      )}
                      onClick={() => selectSession(session)}
                    >
                      <div className="p-1.5 bg-slate-700 rounded-md">
                        <SessionIcon className="h-3.5 w-3.5 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white truncate block">{session.title}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(session.updatedAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400"
                        onClick={(e) => deleteSession(session.id, e)}
                        title="Chat löschen"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
                {sessions.length === 0 && (
                  <div className="p-4 text-center">
                    <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      Noch keine Chats vorhanden
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Starte einen neuen Chat oben
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator className="bg-slate-700/50" />

        {/* Footer Actions */}
        <div className="p-4 space-y-2 bg-slate-900/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            size="sm"
            onClick={() => setShowAddonManager(true)}
            title="Addons und Agenten verwalten"
          >
            <History className="mr-2 h-4 w-4" />
            Addon & Agent Manager
            <Badge variant="secondary" className="ml-auto text-xs bg-slate-700 text-slate-300">
              6
            </Badge>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            size="sm"
            onClick={() => setShowManage(true)}
            title="Addons verwalten"
          >
            <Package className="mr-2 h-4 w-4" />
            Addon Library
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            size="sm"
            onClick={() => setShowSettings(true)}
            title="Einstellungen"
          >
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Button>
        </div>
      </aside>

      {/* Modals */}
      <ResizableAddonManager
        open={showAddonManager}
        onClose={() => setShowAddonManager(false)}
        initialTab="addons"
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <PlaceholderModal
        open={showManage}
        onClose={() => setShowManage(false)}
        title="Addon Library"
        message="Hier können später Addons aus der Community installiert und verwaltet werden."
      />
    </>
  );
}