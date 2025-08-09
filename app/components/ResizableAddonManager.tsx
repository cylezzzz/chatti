'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Download, 
  FileText, 
  Bot, 
  Zap, 
  AlertTriangle, 
  Clock,
  HardDrive,
  CheckCircle,
  Minimize2,
  Maximize2,
  Move,
  Brain,
  Cpu,
  Image,
  Code,
  MessageCircle
} from 'lucide-react';

type GeneratedAddon = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  fileTypes: string[];
  generatedBy: 'chat' | 'analysis';
  createdAt: number;
  wasOptimal: boolean;
  betterAlternative?: string;
  downloadable: boolean;
};

type LocalAgent = {
  id: string;
  name: string;
  type: 'chat' | 'analysis' | 'image' | 'code' | 'other';
  modelFile: string;
  size: string;
  path: string;
  description: string;
  capabilities: string[];
  lastUsed?: number;
  isActive: boolean;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  specialized: string[];
};

interface ResizableAddonManagerProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'addons' | 'agents';
}

// Leere Arrays für reale Nutzung: Die Demo-Daten wurden entfernt, sodass im
// Addon & Agent Manager nur echte Addons/Agenten angezeigt werden können.
// Falls keine echten Daten vorhanden sind, bleiben die Listen leer.
const mockAddons: GeneratedAddon[] = [];
const mockAgents: LocalAgent[] = [];

export default function ResizableAddonManager({ 
  open, 
  onClose, 
  initialTab = 'addons' 
}: ResizableAddonManagerProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedAddon, setSelectedAddon] = useState<GeneratedAddon | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<LocalAgent | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [downloadingAddon, setDownloadingAddon] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Drag-Funktionalität
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === dragRef.current || dragRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        const handleMouseMove = (e: MouseEvent) => {
          setPosition({
            x: e.clientX - offsetX,
            y: e.clientY - offsetY,
          });
        };

        const handleMouseUp = () => {
          setIsDragging(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    }
  }, []);

  // Resize-Funktionalität
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(600, startWidth + (e.clientX - startX));
      const newHeight = Math.max(400, startHeight + (e.clientY - startY));
      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dimensions]);

  const handleAddonDownload = async (addon: GeneratedAddon) => {
    setDownloadingAddon(addon.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Downloaded addon: ${addon.name}`);
    } finally {
      setDownloadingAddon(null);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    if (hours > 0) return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
    return 'gerade eben';
  };

  const getAgentIcon = (type: LocalAgent['type']) => {
    switch (type) {
      case 'chat': return <MessageCircle className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getPerformanceBadge = (performance: LocalAgent['performance']) => {
    const variants = {
      excellent: 'bg-green-600',
      good: 'bg-blue-600', 
      average: 'bg-yellow-600',
      poor: 'bg-red-600'
    };
    return (
      <Badge className={variants[performance]}>
        {performance === 'excellent' ? 'Exzellent' : 
         performance === 'good' ? 'Gut' :
         performance === 'average' ? 'Durchschnitt' : 'Schwach'}
      </Badge>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start pointer-events-none">
      <div
        ref={containerRef}
        className="pointer-events-auto bg-background border rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: isMinimized ? 300 : dimensions.width,
          height: isMinimized ? 60 : dimensions.height,
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isMinimized ? 'all 0.3s ease-in-out' : 'none',
        }}
      >
        {/* Header mit Drag-Handle */}
        <div
          ref={dragRef}
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-between p-3 border-b bg-muted/30 cursor-move ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">
              {isMinimized ? 'Addon & Agent Manager' : 'Addon & Agent Manager'}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {mockAddons.length + mockAgents.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex flex-col h-full">
            {/*
             * Tabs von Radix verwenden einen stringbasierten Wert für value und onValueChange.  Unsere
             * useState-Hooks arbeiten jedoch mit einem Union-Typ ('addons' | 'agents'), sodass die
             * Standard-Dispatch-Funktion von useState nicht direkt dem erwarteten Handler entspricht.
             * Wir casten hier den Rückgabewert zu unserem Union-Typ, um Typkompatibilität sicherzustellen
             * und dennoch die Vorteile von Typsicherheit zu genießen.
             */}
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'addons' | 'agents')}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2 m-3 mb-0">
                <TabsTrigger value="addons" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Generierte Addons
                  <Badge variant="secondary" className="text-xs">{mockAddons.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Lokale Agenten
                  <Badge variant="secondary" className="text-xs">{mockAgents.length}</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Addons Tab */}
              <TabsContent value="addons" className="flex-1 flex flex-col m-3 mt-2">
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-3">
                    {mockAddons.map((addon) => (
                      <Card 
                        key={addon.id} 
                        className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedAddon?.id === addon.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedAddon(selectedAddon?.id === addon.id ? null : addon)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {addon.generatedBy === 'chat' ? 
                                <Bot className="h-4 w-4 text-blue-500" /> : 
                                <Zap className="h-4 w-4 text-purple-500" />
                              }
                              <CardTitle className="text-base">{addon.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              {addon.wasOptimal ? (
                                <Badge className="bg-green-600 text-xs">Optimal</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">Suboptimal</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatTime(addon.createdAt)}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="mb-2">{addon.description}</CardDescription>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {addon.fileTypes.slice(0, 4).map((type, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{type}</Badge>
                              ))}
                              {addon.fileTypes.length > 4 && (
                                <Badge variant="outline" className="text-xs">+{addon.fileTypes.length - 4}</Badge>
                              )}
                            </div>
                            {addon.downloadable && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddonDownload(addon);
                                }}
                                disabled={downloadingAddon === addon.id}
                              >
                                {downloadingAddon === addon.id ? (
                                  <div className="flex items-center gap-1">
                                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                    <span className="text-xs">...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Download className="h-3 w-3" />
                                    <span className="text-xs">Download</span>
                                  </div>
                                )}
                              </Button>
                            )}
                          </div>
                          
                          {/* Expanded Details */}
                          {selectedAddon?.id === addon.id && (
                            <div className="mt-4 space-y-3 border-t pt-3">
                              {!addon.wasOptimal && addon.betterAlternative && (
                                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                      <div className="font-medium text-amber-400 mb-1">Bessere Alternative:</div>
                                      <div className="text-amber-300/80">{addon.betterAlternative}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="text-sm font-medium mb-2">Verwendeter Prompt:</h4>
                                <div className="p-2 rounded bg-muted text-xs font-mono">{addon.prompt}</div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Agents Tab */}
              <TabsContent value="agents" className="flex-1 flex flex-col m-3 mt-2">
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-3">
                    {mockAgents.map((agent) => (
                      <Card 
                        key={agent.id}
                        className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getAgentIcon(agent.type)}
                              <CardTitle className="text-base">{agent.name}</CardTitle>
                              {agent.isActive && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {getPerformanceBadge(agent.performance)}
                              {agent.lastUsed && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(agent.lastUsed)}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="mb-2">{agent.description}</CardDescription>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <HardDrive className="h-3 w-3" />
                              {agent.size}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {agent.type === 'chat' ? 'Chat' : 
                               agent.type === 'code' ? 'Code' :
                               agent.type === 'image' ? 'Bild' :
                               agent.type === 'analysis' ? 'Analyse' : 'Sonstige'}
                            </Badge>
                          </div>
                          
                          {/* Expanded Details */}
                          {selectedAgent?.id === agent.id && (
                            <div className="mt-4 space-y-3 border-t pt-3">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Fähigkeiten:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {agent.capabilities.map((cap, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">{cap}</Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-2">Spezialisiert auf:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {agent.specialized.map((spec, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">{spec}</Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-1">Modell-Info:</h4>
                                <div className="text-xs text-muted-foreground font-mono break-all">
                                  {agent.path}
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Resize-Handle */}
        {!isMinimized && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-muted-foreground transform rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
}