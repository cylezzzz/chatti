'use client';

import { useEffect } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import LoginForm from './LoginForm';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import { cn } from '@/lib/utils';

export default function App() {
  const { state, dispatch } = useApp();
  
  useEffect(() => {
    // Check authentication status on mount
    fetch('/api/auth/check')
      .then(response => {
        dispatch({ type: 'SET_AUTH', payload: response.ok });
      })
      .catch(() => {
        dispatch({ type: 'SET_AUTH', payload: false });
      });
  }, [dispatch]);

  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className={cn(
        "flex-1 flex flex-col min-w-0",
        !state.sidebarOpen && "ml-0"
      )}>
        <ChatInterface />
      </main>
    </div>
  );
}