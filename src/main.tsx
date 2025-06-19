import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { SupabaseProvider } from './context/SupabaseContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SupabaseProvider>
  </StrictMode>,
);
