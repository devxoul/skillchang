import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import { ThemeProvider } from './contexts/theme-context'
import './index.css'

// Initialize window state plugin
import { getCurrentWindow } from '@tauri-apps/api/window'
import { restoreStateCurrent, saveWindowState } from '@tauri-apps/plugin-window-state'

async function initWindowState() {
  const appWindow = getCurrentWindow()

  // Restore saved state
  await restoreStateCurrent()

  // Save state on window events
  appWindow.onMoved(() => saveWindowState())
  appWindow.onResized(() => saveWindowState())
}

// Initialize before rendering
initWindowState().catch(console.error)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
