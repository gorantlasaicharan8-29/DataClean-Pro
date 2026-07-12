import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DatasetProvider } from './context/DatasetContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DatasetProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: '#1E293B',
                  color: '#F1F5F9',
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                  padding: '12px 16px',
                  boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25)',
                },
                success: {
                  iconTheme: { primary: '#10B981', secondary: '#F1F5F9' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#F1F5F9' },
                },
              }}
            />
          </DatasetProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
