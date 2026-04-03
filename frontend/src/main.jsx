import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './index.css'
import { AuthProvider } from './context/auth-context'
//Onde comeca o "react" assim por dizer, neste caso ta a mandar o componente App so, isto é JSX 
//Entao podem usar Javascript e Html ao mesmo tempo no mesmo ficheiro


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)