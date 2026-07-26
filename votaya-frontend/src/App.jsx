import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import EditarVotacion from './pages/EditarVotacion'
import CrearVotacion from './pages/CrearVotacion'
import PerfilUser from './pages/PerfilUsuario'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <CrearVotacion/>
     </div>
     </>
  )
}

export default App
