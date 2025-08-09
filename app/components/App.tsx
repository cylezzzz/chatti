'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import AgentStartupPopup from './AgentStartupPopup';
// import LoginForm from './LoginForm'; // bleibt auskommentiert

const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true';

export default function App() {
  const { state, dispatch } = useApp();
  const [showStartup, setShowStartup] = useState(true);

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
    // The TOGGLE_SIDEBAR action in the reducer does not accept a payload.
    // It simply flips the sidebarOpen boolean itself.
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  return (
    <div className="flex h-screen bg-background relative">
      {state.sidebarOpen && (
        <div className="transition-all duration-300">
          <Sidebar />
        </div>
      )}

      {/* Toggle-Button – dezent oben links */}
      <button
        onClick={toggleSidebar}
        className="absolute top-3 left-3 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-md shadow hover:bg-background/60"
        title={state.sidebarOpen ? 'Sidebar ausblenden' : 'Sidebar einblenden'}
      >
        <Menu size={20} />
      </button>

      <main
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          !state.sidebarOpen && 'ml-0'
        )}
      >
        <ChatInterface />
      </main>

      {/* Startup model/agent check (after login) */}
      <AgentStartupPopup open={showStartup} onClose={() => setShowStartup(false)} />
    </div>
  );
}
