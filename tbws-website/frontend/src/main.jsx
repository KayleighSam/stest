import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import App from './App';
import './styles/globals.css';

// Create QueryClient with optimized settings to prevent excessive requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,      // Don't refetch when window regains focus
      refetchOnMount: false,             // Don't refetch when component mounts again
      refetchOnReconnect: false,         // Don't refetch on network reconnection
      retry: 1,                          // Only retry failed requests once
      staleTime: 5 * 60 * 1000,         // Data stays fresh for 5 minutes
      cacheTime: 10 * 60 * 1000,        // Cache data for 10 minutes
      suspense: false,                   // Disable suspense mode
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1e293b',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);