import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Env variable for Google Client ID
const GOOGLE_CLIENT_ID = "9842957963-mrch5rrcdvvln351nratopgbb8ohvs5r.apps.googleusercontent.com"
console.log("GOOGLE_CLIENT_ID")
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
