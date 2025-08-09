import React from 'react';
import '../..//styles/globals.css';

export type SelectionType = 'text' | 'media' | 'mixed';
export interface MediaFile { url: string; type: 'image' | 'video'; }
export interface CropArea { x:number; y:number; w:number; h:number; }

export interface SelectionContext {
  selectedText?: string;
  selectedMedia?: MediaFile[];
  selectionType: SelectionType;
  contextPrompt: string;
  originalMessageId: string;
}

export const SelectionToolbar: React.FC = () => {
  function handleTextSelection() {
    console.log('📝 Text-Selektion wird implementiert...');
    alert('Text-Selektion (In Arbeit)');
  }
  function handleMediaCrop() {
    console.log('🖼️ Media-Selektion/Crop wird implementiert...');
    alert('Media-Crop (In Arbeit)');
  }
  function talkAboutSelection() {
    console.log('🎯 createContextualPrompt() wird implementiert...');
    alert('Über Selektion sprechen (In Arbeit)');
  }
  return (
    <div className="panel" style={{marginTop:12}}>
      <div className="toolbar">
        <button className="btn" onClick={handleTextSelection}>Text markieren <span className="badge">In Arbeit</span></button>
        <button className="btn" onClick={handleMediaCrop}>Bereich auswählen <span className="badge">In Arbeit</span></button>
        <button className="btn" onClick={talkAboutSelection}>Über Markierung sprechen <span className="badge">In Arbeit</span></button>
      </div>
    </div>
  );
};
