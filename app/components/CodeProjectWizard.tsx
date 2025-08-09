'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Code,
  X,
  Sparkles,
  Package,
  Server,
  FileText,
  FolderPlus,
  Loader2
} from 'lucide-react';

// ✨ UPM
import UnifiedPromptMask from './UnifiedPromptMask';
import { useUnifiedPrompt, enhancePrompt } from './useUnifiedPrompt';

interface CodeProjectWizardProps {
  open: boolean;
  onClose: () => void;
  onProjectGenerated?: (project: GeneratedProject) => void;
}

interface GeneratedProject {
  name: string;
  framework: string;
  files: GeneratedFile[];
  directories: string[];
  dependencies: string[];
  description: string;
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'config' | 'style' | 'test' | 'documentation';
}

type CodeModes = 'project_scaffold' | 'code_template';

export default function CodeProjectWizard({
  open,
  onClose,
  onProjectGenerated
}: CodeProjectWizardProps) {
  const [activeTab, setActiveTab] = useState<CodeModes>('project_scaffold');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [task, setTask] = useState('');

  // ✨ UPM Integration
  const {
    isPromptMaskOpen,
    currentSettings,
    openPromptMask,
    closePromptMask,
    handleGenerate
  } = useUnifiedPrompt((result, mode) => {
    handleUnifiedGeneration(result, mode as CodeModes);
  });
  const [currentMode, setCurrentMode] = useState<CodeModes>('project_scaffold');

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleUnifiedGeneration = async (
    result: any,
    mode: CodeModes
  ) => {
    setIsGenerating(true);
    setProgress(0);
    try {
      // result.prompt = Kurzbeschreibung/Anforderung
      // result.settings = UPM Felder (z. B. language, framework, pkgManager, testing, docker, ci)
      const enhanced = enhancePrompt(result.prompt, result.settings);

      setTask('Analysiere Anforderungen …');
      setProgress(15);
      await sleep(500);

      // Defaults aus Settings lesen (robust gegen fehlende Felder)
      const framework: string =
        result?.settings?.framework ||
        result?.settings?.stack ||
        'react-ts';
      const language: string =
        result?.settings?.language || 'typescript';
      const pkgManager: 'npm' | 'pnpm' | 'yarn' =
        result?.settings?.packageManager || 'npm';
      const name: string =
        result?.settings?.projectName ||
        (enhanced?.slice(0, 24)?.toLowerCase()?.replace(/[^a-z0-9-]+/g, '-') || 'my-app');
      const description: string =
        result?.settings?.description || enhanced || 'Generated project';

      const wantsDocker = !!result?.settings?.docker;
      const wantsCI = !!result?.settings?.ci_cd || !!result?.settings?.ci;
      const wantsTests = !!result?.settings?.testing;
      const wantsAPI = !!result?.settings?.backend || framework === 'node-api' || framework === 'python-api';

      setTask('Erstelle Struktur …');
      setProgress(40);
      await sleep(600);

      const baseDirs = ['src', 'src/components', 'src/utils', 'public'];
      if (wantsAPI) baseDirs.push('src/api');
      if (wantsTests) baseDirs.push('tests');
      if (wantsDocker) baseDirs.push('docker');
      if (wantsCI) baseDirs.push('.github/workflows');

      // Basis-Dateien
      const files: GeneratedFile[] = [];

      // package.json
      files.push({
        path: 'package.json',
        type: 'config',
        content: `{
  "name": "${name}",
  "version": "1.0.0",
  "description": "${description}",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"${wantsTests ? ',\n    "test": "vitest"' : ''}
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.0.0"${wantsTests ? ',\n    "vitest": "^1.6.0",\n    "@testing-library/react": "^14.2.0"' : ''}
  }
}`
      });

      // src/main
      files.push({
        path: language === 'typescript' ? 'src/main.tsx' : 'src/main.jsx',
        type: 'component',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App${language === 'typescript' ? '' : ''}';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      });

      // src/App
      files.push({
        path: 'src/App.tsx',
        type: 'component',
        content: `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>${name}</h1>
      <p>${description}</p>
      <ul>
        <li>Framework: ${framework}</li>
        <li>Language: ${language}</li>
        <li>Package Manager: ${pkgManager}</li>
      </ul>
    </div>
  );
}`
      });

      // README
      files.push({
        path: 'README.md',
        type: 'documentation',
        content: `# ${name}

${description}

## Scripts
\`\`\`bash
${pkgManager} install
${pkgManager} run dev
\`\`\`

## Stack
- Framework: ${framework}
- Language: ${language}
- Package Manager: ${pkgManager}
${wantsTests ? '- Testing: Vitest + RTL\n' : ''}${wantsDocker ? '- Docker: bereitgestellt\n' : ''}${wantsCI ? '- CI: GitHub Actions\n' : ''}`
      });

      // Tests optional
      if (wantsTests) {
        files.push({
          path: 'tests/smoke.test.ts',
          type: 'test',
          content: `import { describe, it, expect } from 'vitest';
describe('smoke', () => {
  it('works', () => expect(true).toBe(true));
});`
        });
      }

      // Docker optional
      if (wantsDocker) {
        files.push({
          path: 'docker/Dockerfile',
          type: 'config',
          content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN ${pkgManager} install
COPY . .
RUN ${pkgManager} run build
EXPOSE 5173
CMD ["${pkgManager}", "run", "preview"]`
        });
      }

      // CI optional
      if (wantsCI) {
        files.push({
          path: '.github/workflows/ci.yml',
          type: 'config',
          content: `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: ${pkgManager} install
      - run: ${pkgManager} run build
${wantsTests ? `      - run: ${pkgManager} run test -- --run` : ''}`
        });
      }

      // API scaffolding optional (nur minimal)
      if (wantsAPI) {
        files.push({
          path: 'src/api/hello.ts',
          type: 'component',
          content: `export async function GET() {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), { headers: { 'Content-Type': 'application/json' } });
}`
        });
      }

      setTask('Konfiguriere Dependencies …');
      setProgress(75);
      await sleep(500);

      const deps = [
        'react',
        'react-dom',
        ...(wantsTests ? ['vitest', '@testing-library/react'] : [])
      ];

      setTask('Finalisiere …');
      setProgress(95);
      await sleep(400);

      const project: GeneratedProject =
        mode === 'project_scaffold'
          ? {
              name,
              framework,
              description,
              directories: baseDirs,
              files,
              dependencies: deps
            }
          : {
              // Für code_template Modus liefern wir ein minimales Projekt + zusätzlich Template-Datei
              name,
              framework,
              description: `${description} (Template-Modus)`,
              directories: baseDirs,
              files: [
                ...files,
                {
                  path: 'src/utils/template.ts',
                  type: 'component',
                  content: `// Generated from UPM template
export function helloTemplate(name: string) {
  return \`Hello, \${name}! Generated at \${new Date().toISOString()}\`;
}`
                }
              ],
              dependencies: deps
            };

      setProgress(100);
      onProjectGenerated?.(project);
    } finally {
      setIsGenerating(false);
      setTask('');
      setProgress(0);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-[880px] max-w-[95vw] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Code className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Code Project Wizard</CardTitle>
                <p className="text-white/80 text-sm">
                  Projektgerüste & Code-Templates – gesteuert über die Unified Prompt Mask (UPM)
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
              title="Schließen"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(v: any) => setActiveTab(v)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="project_scaffold" className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4" />
                Projekt-Gerüst
              </TabsTrigger>
              <TabsTrigger value="code_template" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Code-Template
              </TabsTrigger>
            </TabsList>

            {/* Projekt-Gerüst */}
            <TabsContent value="project_scaffold" className="p-6 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  Lege ein komplettes Grundgerüst an (Dir-Struktur, Starter-Files, README, optional Testing/Docker/CI). 
                  Alle Parameter (Framework, Sprache, Paketmanager, Extras) stellst du in der{' '}
                  <span className="font-semibold">Unified Prompt Mask</span> ein.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  className="h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                  onClick={() => {
                    setCurrentMode('project_scaffold');
                    openPromptMask('code_template', {
                      // Wir nutzen einen gemeinsamen UPM-Mode "code_template" und unterscheiden im Wizard per currentMode
                      format: 'text',
                      language: 'typescript',
                      framework: 'react-ts',
                      packageManager: 'npm',
                      docker: false,
                      testing: true,
                      ci_cd: false
                    });
                  }}
                  disabled={isGenerating}
                  title="Projekt mit UPM konfigurieren und generieren"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Projekt erstellen (UPM)
                </Button>

                <Button
                  className="h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                  onClick={() => {
                    setCurrentMode('project_scaffold');
                    openPromptMask('code_template', {
                      format: 'text',
                      language: 'typescript',
                      framework: 'nextjs',
                      packageManager: 'pnpm',
                      docker: true,
                      testing: true,
                      ci_cd: true
                    });
                  }}
                  disabled={isGenerating}
                  title="Schnellstart: Next.js + PNPM + Docker + CI"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Next.js Preset (UPM)
                </Button>
              </div>
            </TabsContent>

            {/* Code-Template */}
            <TabsContent value="code_template" className="p-6 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  Generiere fokussierte Templates/Module (z. B. Auth-Flow, API-Layer, UI-Komponenten).
                  Definiere alles in der <span className="font-semibold">Unified Prompt Mask</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  className="h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  onClick={() => {
                    setCurrentMode('code_template');
                    openPromptMask('code_template', {
                      format: 'text',
                      language: 'typescript',
                      framework: 'react-ts',
                      templateKind: 'component',
                      templateName: 'FancyCard',
                      withTests: true
                    });
                  }}
                  disabled={isGenerating}
                  title="UI-Komponente (React + TS) generieren"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  UI-Komponente (UPM)
                </Button>

                <Button
                  className="h-11 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                  onClick={() => {
                    setCurrentMode('code_template');
                    openPromptMask('code_template', {
                      format: 'text',
                      language: 'typescript',
                      framework: 'node-api',
                      templateKind: 'api',
                      route: '/api/items',
                      withTests: false
                    });
                  }}
                  disabled={isGenerating}
                  title="Backend-Route/Handler generieren"
                >
                  <Server className="h-4 w-4 mr-2" />
                  API/Route (UPM)
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Progress */}
          {isGenerating && (
            <div className="px-6 pb-6">
              <div className="mt-4 rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium">{task || 'Generiere …'}</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="mt-2 text-xs text-slate-600">{progress}% Complete</div>
              </div>
            </div>
          )}

          {/* ✨ UPM Modal */}
          <UnifiedPromptMask
            open={isPromptMaskOpen}
            onClose={closePromptMask}
            initialSettings={currentSettings || undefined}
            onSettingsChange={() => {}}
            onGenerate={handleGenerate}
            mode="code_template" // ein gemeinsamer UPM-Mode für Code; Unterscheidung via currentMode
            title={
              currentMode === 'project_scaffold'
                ? 'PROJECT SCAFFOLD - UPM'
                : 'CODE TEMPLATE - UPM'
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
