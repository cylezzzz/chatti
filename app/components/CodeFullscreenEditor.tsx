'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Code, 
  Play, 
  Square, 
  Download, 
  Copy, 
  Settings, 
  X, 
  Maximize, 
  Minimize,
  FileText,
  Terminal,
  Bug,
  Zap,
  Save,
  Upload,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  Replace
} from 'lucide-react';

interface CodeFullscreenEditorProps {
  open: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
  onCodeSaved?: (code: string, filename: string) => void;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: '.js', runner: true },
  { id: 'typescript', name: 'TypeScript', ext: '.ts', runner: true },
  { id: 'python', name: 'Python', ext: '.py', runner: true },
  { id: 'react', name: 'React JSX', ext: '.jsx', runner: false },
  { id: 'html', name: 'HTML', ext: '.html', runner: false },
  { id: 'css', name: 'CSS', ext: '.css', runner: false },
  { id: 'json', name: 'JSON', ext: '.json', runner: false },
  { id: 'markdown', name: 'Markdown', ext: '.md', runner: false }
];

const THEMES = [
  { id: 'dark', name: 'Dark', bg: 'bg-slate-900', text: 'text-green-400' },
  { id: 'light', name: 'Light', bg: 'bg-white', text: 'text-slate-900' },
  { id: 'monokai', name: 'Monokai', bg: 'bg-gray-900', text: 'text-yellow-400' },
  { id: 'github', name: 'GitHub', bg: 'bg-gray-50', text: 'text-gray-800' }
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];

export default function CodeFullscreenEditor({ 
  open, 
  onClose, 
  initialCode = '', 
  initialLanguage = 'javascript',
  onCodeSaved 
}: CodeFullscreenEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [filename, setFilename] = useState('untitled');
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState([14]);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  
  // Execution
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  
  // Editor Features
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLanguage = LANGUAGES.find(l => l.id === language);
  const selectedTheme = THEMES.find(t => t.id === theme);
  const canExecute = selectedLanguage?.runner;

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;
    
    const timer = setTimeout(() => {
      console.log("💾 Auto-saving code...");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [code, autoSave]);

  // Generate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);

  const executeCode = async () => {
    if (!canExecute || !code.trim()) return;
    
    setIsExecuting(true);
    setShowOutput(true);
    
    try {
      // TODO: Sandboxed Code-Execution implementieren
      const startTime = Date.now();
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate execution
      
      const executionTime = Date.now() - startTime;
      
      // Mock execution results
      let mockResult: ExecutionResult;
      
      if (language === 'javascript') {
        mockResult = {
          success: true,
          output: "Hello World!\nExecution completed successfully.",
          executionTime
        };
      } else if (language === 'python') {
        mockResult = {
          success: true,
          output: "Hello World!\nPython 3.9.0 execution completed.",
          executionTime
        };
      } else {
        mockResult = {
          success: false,
          output: "",
          error: "Language not supported in sandbox",
          executionTime
        };
      }
      
      setExecutionResult(mockResult);
      console.log("⚡ Code ausgeführt:", { language, executionTime });
      
    } finally {
      setIsExecuting(false);
    }
  };

  const stopExecution = () => {
    setIsExecuting(false);
    console.log("🛑 Code-Ausführung gestoppt");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      console.log("📋 Code kopiert");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const downloadCode = () => {
    const extension = selectedLanguage?.ext || '.txt';
    const fullFilename = filename.includes('.') ? filename : filename + extension;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log("💾 Code heruntergeladen:", fullFilename);
  };

  const saveCode = () => {
    if (onCodeSaved) {
      const extension = selectedLanguage?.ext || '.txt';
      const fullFilename = filename.includes('.') ? filename : filename + extension;
      onCodeSaved(code, fullFilename);
    }
    console.log("💾 Code gespeichert");
  };

  const formatCode = () => {
    // Simple code formatting - in production would use proper formatter
    const formatted = code
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .replace(/;/g, ';\n')
      .replace(/{/g, '{\n  ')
      .replace(/}/g, '\n}');
    
    setCode(formatted);
    console.log("🎨 Code formatiert");
  };

  const searchInCode = () => {
    if (!searchQuery || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const text = textarea.value;
    const index = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    
    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + searchQuery.length);
    }
  };

  const replaceInCode = () => {
    if (!searchQuery || !textareaRef.current) return;
    
    const newCode = code.replaceAll(searchQuery, replaceQuery);
    setCode(newCode);
    setSearchQuery('');
    setReplaceQuery('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Code Editor</h1>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="bg-transparent text-slate-400 text-sm border-none outline-none"
                    placeholder="filename"
                  />
                  <span className="text-slate-500 text-sm">{selectedLanguage?.ext}</span>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    <div className="flex items-center gap-2">
                      {lang.name}
                      {lang.runner && <Badge className="bg-green-600 text-xs">Executable</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {canExecute && (
              <>
                <Button
                  onClick={executeCode}
                  disabled={isExecuting || !code.trim()}
                  className="bg-green-600 hover:bg-green-500"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isExecuting ? 'Running...' : 'Run'}
                </Button>
                {isExecuting && (
                  <Button
                    onClick={stopExecution}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                )}
              </>
            )}
            
            <Button variant="outline" onClick={copyCode} className="border-slate-600 text-slate-300">
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={downloadCode} className="border-slate-600 text-slate-300">
              <Download className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={saveCode} className="border-slate-600 text-slate-300">
              <Save className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={() => setIsSearchOpen(!isSearchOpen)} className="border-slate-600 text-slate-300">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suchen..."
                className="bg-transparent text-white text-sm outline-none w-40"
                onKeyPress={(e) => e.key === 'Enter' && searchInCode()}
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
              <Replace className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Ersetzen..."
                className="bg-transparent text-white text-sm outline-none w-40"
              />
            </div>
            <Button size="sm" onClick={searchInCode}>Suchen</Button>
            <Button size="sm" onClick={replaceInCode}>Ersetzen</Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 flex">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className={`w-16 ${selectedTheme?.bg} border-r border-slate-600 p-3 text-right`}>
              <div style={{ fontSize: `${fontSize[0]}px` }} className="font-mono text-slate-500 leading-6">
                {lineNumbers.map(num => (
                  <div key={num} className="h-6">
                    {num <= lineCount ? num : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Schreibe deinen Code hier..."
              className={`w-full h-full resize-none outline-none p-3 font-mono leading-6 ${selectedTheme?.bg} ${selectedTheme?.text}`}
              style={{ 
                fontSize: `${fontSize[0]}px`,
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                overflowWrap: wordWrap ? 'break-word' : 'normal'
              }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Settings Panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Editor-Einstellungen
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Theme</label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Schriftgröße: {fontSize[0]}px
                </label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  min={10}
                  max={24}
                  step={2}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Zeilennummern</label>
                <Switch
                  checked={showLineNumbers}
                  onCheckedChange={setShowLineNumbers}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Zeilenumbruch</label>
                <Switch
                  checked={wordWrap}
                  onCheckedChange={setWordWrap}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Auto-Save</label>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Tools
            </h3>
            
            <div className="space-y-2">
              <Button
                onClick={formatCode}
                variant="outline"
                className="w-full justify-start border-slate-600 text-slate-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Code formatieren
              </Button>
              
              <Button
                onClick={() => setShowOutput(!showOutput)}
                variant="outline"
                className="w-full justify-start border-slate-600 text-slate-300"
              >
                {showOutput ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showOutput ? 'Output ausblenden' : 'Output anzeigen'}
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-white font-semibold mb-4">Statistiken</h3>
            <div className="text-sm text-slate-400 space-y-1">
              <div>Zeilen: {lineCount}</div>
              <div>Zeichen: {code.length}</div>
              <div>Wörter: {code.split(/\s+/).filter(w => w.length > 0).length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      {showOutput && (
        <div className="h-48 bg-slate-900 border-t border-slate-700 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-slate-400" />
              <span className="text-white font-medium">Output</span>
              {executionResult && (
                <Badge className={executionResult.success ? 'bg-green-600' : 'bg-red-600'}>
                  {executionResult.success ? 'Success' : 'Error'}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOutput(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto">
            {isExecuting ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
                Code wird ausgeführt...
              </div>
            ) : executionResult ? (
              <div className="font-mono text-sm">
                {executionResult.success ? (
                  <div className="text-green-400">{executionResult.output}</div>
                ) : (
                  <div className="text-red-400">{executionResult.error}</div>
                )}
                <div className="text-slate-500 mt-2">
                  Ausführungszeit: {executionResult.executionTime}ms
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">
                Führe Code aus, um Output zu sehen...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}