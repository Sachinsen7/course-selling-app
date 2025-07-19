import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToasterProvider } from './components/notifications/toasts.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToasterProvider>
        <AuthProvider>
          <App />
      </AuthProvider>
      </ToasterProvider>
    </BrowserRouter>
  </StrictMode>,
)
