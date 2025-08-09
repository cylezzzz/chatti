'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import AgentStartupPopup from './AgentStartupPopup';

const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true';

export default function App() {
  const { state, dispatch } = useApp();
  const [showStartup, setShowStartup] = useState(false); // Startup deaktiviert für Demo

  useEffect(() => {
    if (authDisabled) {
      dispatch({ type: 'SET_AUTH', payload: true });
    } else {
      fetch('/api/auth/check')
        .then((res) => dispatch({ type: 'SET_AUTH', payload: res.ok }))
        .catch(() => dispatch({ type: 'SET_AUTH', payload: false }));
    }
  }, [dispatch]);

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-cyan-500/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(45, 212, 191, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      {state.sidebarOpen && (
        <div className="transition-all duration-300 relative z-10">
          <Sidebar />
        </div>
      )}

      {/* Toggle-Button – dezent oben links */}
      {!state.sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute top-3 left-3 z-50 p-2 bg-slate-800/80 backdrop-blur-sm rounded-md shadow-lg hover:bg-slate-700/80 border border-slate-700/50 transition-all duration-200"
          title="Sidebar einblenden"
        >
          <Menu size={20} className="text-white" />
        </button>
      )}

      <main
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10',
          !state.sidebarOpen && 'ml-0'
        )}
      >
        <ChatInterface />
      </main>

      {/* Startup modal (deaktiviert für Demo) */}
      <AgentStartupPopup open={showStartup} onClose={() => setShowStartup(false)} />
    </div>
  );
}