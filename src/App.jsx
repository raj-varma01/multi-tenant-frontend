import { useState } from 'react'
import { LoginPage } from './pages/LoginPage'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
