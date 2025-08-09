import React, { useState } from 'react';
import '../..//styles/globals.css';

export interface VideoProgress {
  running: boolean;
  percent: number;
  label: string;
}

export const VideoToolbar: React.FC = () => {
  const [progress, setProgress] = useState<VideoProgress>({ running: false, percent: 0, label: '' });

  async function handleText2Video() {
    console.log('🎬 generateTextToVideo() wird implementiert...');
    setProgress({ running: true, percent: 1, label: 'Video wird generiert...' });
    // fake UI progress (UI only)
    for (let i=1;i<=100;i+=5){
      await new Promise(r=>setTimeout(r, 20));
      setProgress(p => ({ ...p, percent: Math.min(100, i) }));
    }
    setProgress({ running: false, percent: 0, label: '' });
    alert('Feature wird implementiert… (Text zu Video).');
  }

  async function handleImage2Video() {
    console.log('🎥 animateImageToVideo() wird implementiert...');
    setProgress({ running: true, percent: 1, label: 'Video wird generiert...' });
    for (let i=1;i<=100;i+=5){
      await new Promise(r=>setTimeout(r, 20));
      setProgress(p => ({ ...p, percent: Math.min(100, i) }));
    }
    setProgress({ running: false, percent: 0, label: '' });
    alert('Feature wird implementiert… (Bild zu Video).');
  }

  return (
    <div className="panel">
      <div className="toolbar">
        <button className="btn" onClick={handleText2Video}>
          Text zu Video generieren <span className="badge">In Arbeit</span>
        </button>
        <button className="btn" onClick={handleImage2Video}>
          Bild zu Video animieren <span className="badge">In Arbeit</span>
        </button>
      </div>
      {progress.running && (
        <div style={{marginTop:8}}>
          <div className="small">{progress.label}</div>
          <div className="progress"><div style={{ width: progress.percent + '%' }} /></div>
        </div>
      )}
    </div>
  );
};
