import React from "react"
import { Routes, Route } from "react-router-dom"
import Home from "./home"
import Form from "./components/form"
import MapWrapper from "./components/map.js"
import "./App.scss"

const App: React.FC = () => {
  return (
    <div className='app'>
      <Routes>
        {/* Paths should be modified */}
        <Route path='/' element={<Home />} />
        <Route path='/map' element={<MapWrapper />} />
        <Route path='/form' element={<Form />} />
      </Routes>
    </div>
  )
}

export default App
