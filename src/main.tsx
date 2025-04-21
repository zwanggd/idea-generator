import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'  // ✅ 确保是 index.css，而不是默认的 App.css

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
