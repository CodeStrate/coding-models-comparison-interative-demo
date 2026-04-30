import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// `~app` is aliased in vite.config.ts to either ./App.tsx (public) or
// ./App.dev.tsx (when VITE_USE_DEVTOOLS=true and the dev file exists).
import App from '~app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
