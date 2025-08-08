'use client';

import { useEffect } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
// import LoginForm from './LoginForm'; // bleibt auskommentiert

const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true';

export default function App() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (authDisabled) {
      // Login hart deaktiviert
      dispatch({ type: 'SET_AUTH', payload: true });
      return;
    }
    // Auth normal checken (nur wenn /api/auth/check vorhanden ist)
    fetch('/api/auth/check')
      .then((res) => dispatch({ type: 'SET_AUTH', payload: res.ok }))
      .catch(() => dispatch({ type: 'SET_AUTH', payload: false }));
  }, [dispatch]);

  // Optional: Login aktivieren, falls Auth nicht deaktiviert ist
  // if (!authDisabled && !state.isAuthenticated) {
  //   return <LoginForm />;
  // }

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR', payload: !state.sidebarOpen });
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Sidebar nur anzeigen, wenn offen */}
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

      {/* Hauptinhalt */}
      <main
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          !state.sidebarOpen && 'ml-0'
        )}
      >
        <ChatInterface />
      </main>
    </div>
  );
}
