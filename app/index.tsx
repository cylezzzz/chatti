// G:\writeora-webapp\app\index.tsx
import React from 'react';
import { VideoGenerator } from './components/VideoGenerator';
import { CodeProjectCreator } from './components/CodeProjectCreator';
import { ContextSelection } from './components/ContextSelection';
import { FaceLibrary } from './components/FaceLibrary';
import { CodeWindow } from './components/CodeWindow';
import { PhotoEditorToolbar } from './components/PhotoEditor';

const Page: React.FC = () => {
  return (
    <div style={{maxWidth:1100, margin:'20px auto', padding:'12px', color:'#e8ecf1', fontFamily:'ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial'}}>
      <h1 style={{margin:'4px 0'}}>Content Studio – Teil 2 (UI & Code-Struktur)</h1>
      <p style={{opacity:.8}}>Alle Buttons sichtbar – Features mit <span style={{background:'#ff0055', padding:'2px 6px', borderRadius:6, color:'#fff'}}>In Arbeit</span></p>
      <VideoGenerator/>
      <ContextSelection/>
      <FaceLibrary/>
      <PhotoEditorToolbar/>
      <CodeProjectCreator/>
      <CodeWindow/>
    </div>
  );
};

export default Page;
