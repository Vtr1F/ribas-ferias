import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
//Onde comeca o "react" assim por dizer, neste caso ta a mandar o componente App so, isto é JSX 
//Entao podem usar Javascript e Html ao mesmo tempo no mesmo ficheiro


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
    <App />
    
  </React.StrictMode>,
)
