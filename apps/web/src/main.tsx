import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import { ThemeProvider } from './theme/ThemeProvider';
import { A11yProvider } from './theme/A11yProvider';
import './index.css';
// tokens.css is imported in index.css
import { AuthProvider } from './context/AuthContext.tsx';
import './i18n/index.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <A11yProvider>
            <App />
          </A11yProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);