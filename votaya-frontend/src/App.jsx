import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <Register/>
     </div>
     </>
  )
}

export default App
