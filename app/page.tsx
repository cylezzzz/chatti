import { AppProvider } from '@/app/contexts/AppContext';
import App from '@/app/components/App';

export default function HomePage() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}