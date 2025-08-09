// G:\writeora-webapp\app\components\CodeWindow.tsx
import React, { useState } from 'react';
import type { ExecutionResult, ExportFormat } from '../types';
import { LocalFileManager } from '../lib/file-system';

export const CodeWindow: React.FC = () => {
  const [showLines, setShowLines] = useState(true);
  const [code] = useState<string>('console.log("Hello World")');

  async function openFullscreen() {
    console.log('💻 Code-Fenster wird implementiert...');
    alert('Code-Vollbild (In Arbeit)');
  }
  async function execute() {
    console.log('⚡ Code-Ausführung wird implementiert...');
    const fs = new LocalFileManager();
    const res: ExecutionResult = await fs.executeCode(code, 'javascript');
    alert('Execute (In Arbeit) → ' + (res.error ?? 'ok'));
  }
  function toggleLines(){ setShowLines(v=>!v); console.log('Zeilennummern Toggle', !showLines); }
  function exportCode(format: ExportFormat){ console.log('📤 Export (In Arbeit)', format); alert('Export (In Arbeit)'); }

  return (
    <div style={{border:'1px solid #26314f', borderRadius:12, padding:12, background:'#0f1732', marginTop:12}}>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button onClick={openFullscreen}>Code-Vollbild <span style={{marginLeft:6, fontSize:12, background:'#ff0055', color:'#fff', padding:'2px 6px', borderRadius:6}}>In Arbeit</span></button>
        <button onClick={execute}>Code ausführen <span style={{marginLeft:6, fontSize:12, background:'#ff0055', color:'#fff', padding:'2px 6px', borderRadius:6}}>In Arbeit</span></button>
        <button onClick={()=>toggleLines()}>Zeilennummern anzeigen</button>
        <button onClick={()=>exportCode('txt')}>Export TXT</button>
        <button onClick={()=>exportCode('md')}>Export MD</button>
      </div>
    </div>
  );
};
