import React from 'react';
import '../styles/globals.css';
import { VideoToolbar } from './components/VideoToolbar';
import { SelectionToolbar } from './components/SelectionToolbar';
import { FaceTools } from './components/FaceTools';
import { CodeBlockToolbar } from './components/CodeBlockToolbar';
import { PhotoEditorToolbar } from './components/PhotoEditorToolbar';

const ContentStudioDemo: React.FC = () => {
  return (
    <div style={{maxWidth:1100, margin:'20px auto', padding:'12px'}}>
      <h1 style={{margin:'4px 0'}}>Content Studio</h1>
      <div className="small">Alle Buttons sichtbar – Features mit <span className="badge">In Arbeit</span></div>
      <VideoToolbar/>
      <SelectionToolbar/>
      <FaceTools/>
      <PhotoEditorToolbar/>
      <CodeBlockToolbar/>
    </div>
  );
};

export default ContentStudioDemo;
