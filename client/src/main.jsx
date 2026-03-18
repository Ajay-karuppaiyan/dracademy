import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Env variable for Google Client ID
const GOOGLE_CLIENT_ID = "257216489209-4hrd3k40gfobaf5hv2anmnjsk5gsdul0.apps.googleusercontent.com"
console.log("GOOGLE_CLIENT_ID")
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
