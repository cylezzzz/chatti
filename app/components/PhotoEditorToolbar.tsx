import React from 'react';
import '../..//styles/globals.css';

export const PhotoEditorToolbar: React.FC = () => {
  const alertWip = (t:string) => () => { console.log('🎨 Photo-Editor ' + t + ' wird implementiert...'); alert(t + ' (In Arbeit)'); };
  return (
    <div className="panel" style={{marginTop:12}}>
      <div className="toolbar">
        <button className="btn" onClick={alertWip('Bild-Editor öffnen')}>Bild-Editor öffnen <span className="badge">In Arbeit</span></button>
        <button className="btn" onClick={alertWip('Pinsel, Ebenen, Filter')}>Pinsel / Ebenen / Filter <span className="badge">In Arbeit</span></button>
        <button className="btn" onClick={alertWip('Ebenen-Manager')}>Ebenen-Manager <span className="badge">In Arbeit</span></button>
      </div>
    </div>
  );
};
