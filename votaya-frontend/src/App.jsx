import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import EditarVotacion from './pages/EditarVotacion'
import CrearVotacion from './pages/CrearVotacion'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <EditarVotacion/>
     </div>
     </>
  )
}

export default App
