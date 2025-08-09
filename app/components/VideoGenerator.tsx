// G:\writeora-webapp\app\components\VideoGenerator.tsx
import React, { useState } from 'react';
import { generateTextToVideo, animateImageToVideo, ProgressCallback } from '../lib/ai-services';

export const VideoGenerator: React.FC = () => {
  const [progress, setProgress] = useState<{running:boolean; percent:number; label:string}>({running:false, percent:0, label:''});

  const onProgress: ProgressCallback = (p) => setProgress(prev => ({ ...prev, running: true, percent: p.percent, label: p.label ?? prev.label }));

  async function onText2Video() {
    console.log('UI → Text zu Video generieren (In Arbeit)');
    setProgress({ running: true, percent: 1, label: 'Video wird generiert...' });
    await generateTextToVideo('PROMPT_PLACEHOLDER', 10, onProgress);
    setProgress({ running: false, percent: 0, label: '' });
    alert('Feature wird implementiert… (Text zu Video)');
  }

  async function onImage2Video() {
    console.log('UI → Bild zu Video animieren (In Arbeit)');
    setProgress({ running: true, percent: 1, label: 'Video wird generiert...' });
    await animateImageToVideo('IMAGE_URL_PLACEHOLDER', 'subtle', onProgress);
    setProgress({ running: false, percent: 0, label: '' });
    alert('Feature wird implementiert… (Bild zu Video)');
  }

  return (
    <div style={{border:'1px solid #26314f', borderRadius:12, padding:12, background:'#0f1732'}}>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button onClick={onText2Video}>Text zu Video generieren <span style={{marginLeft:6, fontSize:12, background:'#ff0055', color:'#fff', padding:'2px 6px', borderRadius:6}}>In Arbeit</span></button>
        <button onClick={onImage2Video}>Bild zu Video animieren <span style={{marginLeft:6, fontSize:12, background:'#ff0055', color:'#fff', padding:'2px 6px', borderRadius:6}}>In Arbeit</span></button>
      </div>
      {progress.running && (
        <div style={{marginTop:8}}>
          <div style={{fontSize:12, opacity:.8}}>{progress.label}</div>
          <div style={{height:8, background:'#0d1326', borderRadius:6, overflow:'hidden'}}><div style={{height:8, background:'#ff0055', width:progress.percent+'%'}} /></div>
        </div>
      )}
    </div>
  );
};
