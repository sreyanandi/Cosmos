import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { SpaceProvider } from './context/SpaceContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpaceProvider>
      <App />
    </SpaceProvider>
  </StrictMode>,
)
