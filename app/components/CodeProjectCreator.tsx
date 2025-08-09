// G:\writeora-webapp\app\components\CodeProjectCreator.tsx
import React, { useState } from 'react';
import { LocalFileManager } from '../lib/file-system';
import type { ProjectStructure } from '../types';

const fm = new LocalFileManager();

export const CodeProjectCreator: React.FC = () => {
  const [desc, setDesc] = useState('');
  const [framework, setFramework] = useState('Next.js');

  async function createProject() {
    console.log('UI → Code-Projekt erstellen (In Arbeit)');
    const res = await fm.createProject(desc || 'MyProject', framework);
    alert('Feature wird implementiert… (Code-Projekt) → ' + res);
  }

  async function createDirs() {
    console.log('UI → Verzeichnis anlegen (In Arbeit)');
    await fm.createDirectory('G:/writeora-webapp/projects/demo');
    alert('Feature wird implementiert… (Verzeichnisse)');
  }

  return (
    <div style={{border:'1px solid #26314f', borderRadius:12, padding:12, background:'#0f1732', marginTop:12}}>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
        <textarea placeholder="Projektbeschreibung" value={desc} onChange={e=>setDesc(e.target.value)} />
        <select value={framework} onChange={e=>setFramework(e.target.value)}>
          <option>React</option>
          <option>Next.js</option>
          <option>Vue</option>
        </select>
        <button onClick={createProject}>Code-Projekt erstellen <span style={{marginLeft:6, fontSize:12, background:'#ff0055', color:'#fff', padding:'2px 6px', borderRadius:6}}>In Arbeit</span></button>
        <button onClick={createDirs}>Verzeichnis anlegen <span style={{marginLeft:6, fontSize:12, background:'#ff0055', color:'#fff', padding:'2px 6px', borderRadius:6}}>In Arbeit</span></button>
      </div>
    </div>
  );
};
