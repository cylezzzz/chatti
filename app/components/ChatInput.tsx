"use client";
import React, {useState, useRef} from "react";
import {Send, Paperclip} from "lucide-react";

export function ChatInput({
  onSend,
  disabled
}:{
  onSend: (payload:{text:string; files:File[]})=>void;
  disabled?: boolean;
}) {
  const [text,setText] = useState("");
  const [files,setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!text.trim() && files.length===0) return;
    onSend({text, files});
    setText("");
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onKeyDown = (e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-zinc-800 p-3">
      <div className="flex items-end gap-2">
        <button
          onClick={()=>fileRef.current?.click()}
          className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800"
          title="Datei anhängen"
        >
          <Paperclip className="w-5 h-5 text-zinc-200" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e)=> setFiles(Array.from(e.target.files ?? []))}
        />
        <textarea
          value={text}
          onChange={(e)=>setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Nachricht schreiben… (Shift+Enter = Zeilenumbruch)"
          className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={submit}
          disabled={disabled}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {files.length>0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f,i)=>(
            <span key={i} className="text-xs px-2 py-1 rounded bg-zinc-800 border border-zinc-700">
              {f.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
