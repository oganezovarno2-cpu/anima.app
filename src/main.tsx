import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/App'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(<App />)

// PWA: регистрация service worker (офлайн кэш)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(()=>{})
  })
}
