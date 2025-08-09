// app/lib/file-manager.ts
// File System Management für Code-Projekte
// Unterstützt: Projekt-Erstellung, Template-Dateien, Dependency-Installation, Code-Ausführung

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import os from 'os';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';

const execPromise = util.promisify(exec);

// ---------- Typen ----------

export type ProjectSpec = {
  name: string;
  targetDir: string;
  templateFiles?: Record<string, string>; // Relativer Pfad -> Inhalt
  dependencies?: string[];
};

export type ProjectResult = {
  projectPath: string;
  createdFiles: string[];
  installedDependencies?: string[];
};

export type ExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
};

// ---------- FileManager ----------

export class FileManager {
  /**
   * Erstellt ein neues Projekt mit Verzeichnisstruktur, Template-Dateien und optional Dependencies.
   */
  async createProject(projectSpec: ProjectSpec): Promise<ProjectResult> {
    const projectPath = path.resolve(projectSpec.targetDir, projectSpec.name);
    const createdFiles: string[] = [];

    // 1) Verzeichnis erstellen
    fs.mkdirSync(projectPath, { recursive: true });

    // 2) Template-Dateien erstellen
    if (projectSpec.templateFiles) {
      for (const [relPath, content] of Object.entries(projectSpec.templateFiles)) {
        const filePath = path.join(projectPath, relPath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content, 'utf8');
        createdFiles.push(filePath);
      }
    }

    // 3) Dependencies installieren
    let installedDependencies: string[] | undefined;
    if (projectSpec.dependencies?.length) {
      await execPromise(`npm init -y`, { cwd: projectPath });
      await execPromise(`npm install ${projectSpec.dependencies.join(' ')}`, { cwd: projectPath });
      installedDependencies = projectSpec.dependencies;
    }

    return {
      projectPath,
      createdFiles,
      installedDependencies,
    };
  }

  /**
   * Führt Code in einer temporären Sandbox aus.
   * Unterstützt einfache Node.js, Python & Bash-Execution.
   */
  async executeCode(code: string, language: string): Promise<ExecutionResult> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-'));
    const extMap: Record<string, string> = {
      javascript: '.js',
      python: '.py',
      bash: '.sh',
    };

    const ext = extMap[language.toLowerCase()] ?? '.txt';
    const filePath = path.join(tmpDir, `code${ext}`);
    fs.writeFileSync(filePath, code, 'utf8');

    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    try {
      if (language.toLowerCase() === 'javascript') {
        const { stdout: out, stderr: err } = await execPromise(`node "${filePath}"`, { timeout: 5000 });
        stdout = out;
        stderr = err;
      } else if (language.toLowerCase() === 'python') {
        const { stdout: out, stderr: err } = await execPromise(`python "${filePath}"`, { timeout: 5000 });
        stdout = out;
        stderr = err;
      } else if (language.toLowerCase() === 'bash') {
        const { stdout: out, stderr: err } = await execPromise(`bash "${filePath}"`, { timeout: 5000 });
        stdout = out;
        stderr = err;
      } else {
        throw new Error(`Unsupported language: ${language}`);
      }
    } catch (err: any) {
      stderr = err.stderr || err.message;
      exitCode = err.code ?? 1;
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      stdout,
      stderr,
      exitCode,
      executionTimeMs,
    };
  }
}

// Singleton-Export
const fileManager = new FileManager();
export default fileManager;
