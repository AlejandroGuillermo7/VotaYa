import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import EditarVotacion from './pages/EditarVotacion'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <Login/>
     </div>
     </>
  )
}

export default App
