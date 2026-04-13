import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#37352f',
          border: '1px solid #e9e8e4',
          borderRadius: '10px',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
        success: {
          iconTheme: { primary: '#166534', secondary: '#dcfce7' },
        },
        error: {
          iconTheme: { primary: '#991b1b', secondary: '#fef2f2' },
        },
      }}
    />
  </StrictMode>,
)
