import React from 'react';
import '../..//styles/globals.css';

export const FaceTools: React.FC = () => {
  const click = (msg:string) => () => { console.log(msg); alert(msg + ' (In Arbeit)'); };
  return (
    <div className="panel" style={{marginTop:12}}>
      <div className="toolbar">
        <button className="btn" onClick={click('👤 Gesicht speichern')}>Gesicht speichern <span className="badge">In Arbeit</span></button>
        <button className="btn" onClick={click('📐 Bereich markieren')}>Bereich markieren <span className="badge">In Arbeit</span></button>
        <button className="btn" onClick={click('📚 Gesichter-Bibliothek')}>Gesichter-Bibliothek <span className="badge">In Arbeit</span></button>
      </div>
    </div>
  );
};
