import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/material-icons-round/400.css'
import '@fontsource/material-symbols-outlined/400.css'
import '@mdi/font/css/materialdesignicons.min.css'
import App from './app/App.tsx'
import { initTelegramMiniApp } from '@/integrations/telegram/twa'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

initTelegramMiniApp();

void Promise.all([
  document.fonts.load('400 1em Inter'),
  document.fonts.load('500 1em Inter'),
  document.fonts.load('600 1em Inter'),
  document.fonts.load('700 1em Inter'),
  document.fonts.load('400 1em "Material Icons Round"'),
  document.fonts.load('400 1em "Material Symbols Outlined"'),
  document.fonts.load('400 1em "Material Design Icons"'),
]).then(() => document.documentElement.classList.add('icon-fonts-ready'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/metawipe/capsule-market/refs/heads/main/manifest.json">
    <App />
    </TonConnectUIProvider>
  </StrictMode>,
)