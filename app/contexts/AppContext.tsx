'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Message, ChatSession, Addon, AppSettings } from '@/app/types';

interface AppState {
  isAuthenticated: boolean;
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  addons: Addon[];
  activeAddon: Addon | null;
  settings: AppSettings;
  sidebarOpen: boolean;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_AUTH'; payload: boolean }
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession | null }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: Message } }
  | { type: 'SET_ADDONS'; payload: Addon[] }
  | { type: 'SET_ACTIVE_ADDON'; payload: Addon | null }
  | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  isAuthenticated: false,
  currentSession: null,
  sessions: [],
  addons: [],
  activeAddon: null,
  settings: {
    theme: 'dark',
    language: 'en',
    apiEndpoint: 'http://localhost:11434',
    model: 'llama2',
    temperature: 0.7,
    maxTokens: 2048,
    streamEnabled: true,
  },
  sidebarOpen: true,
  isLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'ADD_MESSAGE':
      const updatedSessions = state.sessions.map(session =>
        session.id === action.payload.sessionId
          ? { ...session, messages: [...session.messages, action.payload.message] }
          : session
      );
      const updatedCurrentSession = state.currentSession?.id === action.payload.sessionId
        ? { ...state.currentSession, messages: [...state.currentSession.messages, action.payload.message] }
        : state.currentSession;
      return { ...state, sessions: updatedSessions, currentSession: updatedCurrentSession };
    case 'SET_ADDONS':
      return { ...state, addons: action.payload };
    case 'SET_ACTIVE_ADDON':
      return { ...state, activeAddon: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}