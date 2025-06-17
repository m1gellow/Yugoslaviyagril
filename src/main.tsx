import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { OnlineStatusProvider } from './context/OnlineStatusContext';
import { SupabaseProvider } from './context/SupabaseContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <ThemeProvider>
        <OnlineStatusProvider>
          <App />
        </OnlineStatusProvider>
      </ThemeProvider>
    </SupabaseProvider>
  </StrictMode>
);
