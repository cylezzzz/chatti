'use client'

import { AppProvider } from '@/app/contexts/AppContext'
import App from '@/app/components/App'
// import LoginForm from '@/app/components/LoginForm' // deaktiviert

export default function HomePage() {
  // const isAuthenticated = false // später Cookie prüfen

  return (
    <AppProvider>
      {/* {isAuthenticated ? <App /> : <LoginForm />} */}
      <App />
    </AppProvider>
  )
}
