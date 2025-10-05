import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ui/App'
import './styles/globals.css'   // <- подключаем глобальные стили

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
