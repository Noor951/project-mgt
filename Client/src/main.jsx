console.log("All Env Variables:", import.meta.env);
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ClerkProvider } from '@clerk/clerk-react' // or '@clerk/react'

import { store } from './app/store.js'
import App from './App.jsx'
import './index.css'

// 1. Retrieve the key from your .env.local file
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// 2. Safety check: If the key is missing, we show an error instead of a blank page
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Check your .env.local file.")
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </React.StrictMode>,
)